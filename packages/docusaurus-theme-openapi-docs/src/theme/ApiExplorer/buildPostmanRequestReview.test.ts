/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Blob } from "buffer";

import type { Body } from "@theme/ApiExplorer/Body/slice";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as sdk from "postman-collection";

import buildPostmanRequest from "./buildPostmanRequest";

beforeAll(() => {
  (global as any).window = { location: { origin: "http://localhost:3000" } };
});
afterAll(() => {
  delete (global as any).window;
});

function build(original: sdk.Request, contentType: string, raw = false) {
  return buildPostmanRequest(original, {
    queryParams: [],
    pathParams: [],
    cookieParams: [],
    headerParams: [],
    contentType,
    accept: "",
    body: raw
      ? { type: "raw", content: { type: "string", value: "new raw" } }
      : {
          type: "form",
          content: { name: { type: "string", value: "new form" } },
        },
    auth: { data: {}, options: {} },
  });
}

it.each([
  ["multipart/form-data; boundary=original", "multipart/form-data"],
  [
    'Multipart/Form-Data; BOUNDARY="old;boundary"; charset=utf-8',
    "Multipart/Form-Data; charset=utf-8",
  ],
  [
    'multipart/form-data; profile="x; boundary=keep"; boundary=old',
    'multipart/form-data; profile="x; boundary=keep"',
  ],
  [
    'multipart/form-data; boundary="old\\";part"; charset=UTF-8',
    "multipart/form-data; charset=UTF-8",
  ],
])(
  "lets the client choose its multipart boundary for %s",
  (contentType, header) => {
    const original = new sdk.Request({
      url: "https://example.com/pets",
      method: "POST",
      body: { mode: "urlencoded", urlencoded: [{ key: "old", value: "old" }] },
    });
    const before = original.toJSON();
    const request = build(original, contentType);
    expect(request.body?.mode).toBe("formdata");
    expect(request.headers.get("Content-Type")).toBe(header);
    expect(original.toJSON()).toEqual(before);
  }
);

const encodedMultipart =
  '--encoded-boundary\r\nContent-Disposition: form-data; name="name"\r\n\r\nRex\r\n--encoded-boundary--\r\n';
const encodedContentType = "multipart/form-data; boundary=encoded-boundary";

it.each(["raw", "formdata"])(
  "keeps the encoded multipart boundary when %s falls back to raw",
  (originalMode) => {
    const original = new sdk.Request({
      url: "https://example.com/pets",
      method: "POST",
      body: { mode: originalMode, raw: encodedMultipart, formdata: [] },
    });
    const before = original.toJSON();
    const request = buildPostmanRequest(original, {
      queryParams: [],
      pathParams: [],
      cookieParams: [],
      headerParams: [],
      contentType: encodedContentType,
      accept: "",
      body: {
        type: "raw",
        content: { type: "string", value: encodedMultipart },
      },
      auth: { data: {}, options: {} },
    });
    expect(request.body?.mode).toBe("raw");
    expect(request.body?.raw).toBe(encodedMultipart);
    expect(request.headers.get("Content-Type")).toBe(encodedContentType);
    expect(original.toJSON()).toEqual(before);
  }
);

it.each(["file", "formdata"])(
  "keeps a supplied nonform boundary when %s selects a raw file",
  (originalMode) => {
    const contentType = "application/octet-stream; boundary=encoded-boundary";
    const original = new sdk.Request({
      url: "https://example.com/pets",
      method: "POST",
      body: {
        mode: originalMode,
        file: { src: "multipart.bin" },
        formdata: [],
      },
    });
    const before = original.toJSON();
    const body: Body = {
      type: "raw",
      content: {
        type: "file",
        value: {
          src: "multipart.bin",
          content: new Blob([encodedMultipart]) as unknown as globalThis.Blob,
        },
      },
    };
    const request = buildPostmanRequest(original, {
      queryParams: [],
      pathParams: [],
      cookieParams: [],
      headerParams: [],
      contentType,
      accept: "",
      body,
      auth: { data: {}, options: {} },
    });
    expect(request.body?.mode).toBe("file");
    expect(request.body?.file).toEqual({ src: "multipart.bin" });
    expect(request.headers.get("Content-Type")).toBe(contentType);
    expect(original.toJSON()).toEqual(before);
  }
);

it.each([
  ["raw", "multipart/form-data", "formdata", false],
  ["urlencoded", "multipart/form-data", "formdata", false],
  ["formdata", "application/x-www-form-urlencoded", "urlencoded", false],
  ["raw", "application/x-www-form-urlencoded", "urlencoded", false],
  ["formdata", "text/plain", "raw", true],
  ["urlencoded", "text/plain", "raw", true],
])(
  "drops inactive %s data when switching to %s",
  (originalMode, contentType, expectedMode, raw) => {
    const blob = new Blob(["old upload"]);
    const original = new sdk.Request({
      url: "https://example.com/pets",
      method: "POST",
      body: {
        mode: originalMode,
        raw: "old raw",
        urlencoded: [{ key: "old", value: "old form" }],
        formdata: [{ key: "old", type: "file", value: blob }],
        options: { raw: { language: "json" } },
        disabled: false,
      } as any,
    });
    const before = original.toJSON();
    const request = build(original, contentType as string, raw as boolean);
    const serialized = request.body?.toJSON();
    expect(request.body?.mode).toBe(expectedMode);
    const inactiveModes = ["raw", "urlencoded", "formdata"].filter(
      (mode) => mode !== expectedMode
    );
    expect(
      Object.keys(serialized ?? {}).filter((mode) =>
        inactiveModes.includes(mode)
      )
    ).toEqual([]);
    expect(inactiveModes.map((mode) => (request.body as any)[mode])).toEqual(
      inactiveModes.map(() => undefined)
    );
    expect(serialized).toMatchObject({
      options: { raw: { language: "json" } },
      disabled: false,
    });
    expect(original.toJSON()).toEqual(before);
    expect(original.body?.formdata?.one("old")?.value).toBe(blob);
  }
);
