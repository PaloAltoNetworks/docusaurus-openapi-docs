/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { runInThisContext } from "vm";

// eslint-disable-next-line import/no-extraneous-dependencies
import * as sdk from "postman-collection";

import makeRequest, {
  isStreamingResponse,
  readResponseBody,
} from "./makeRequest";

// Jest 27's Node sandbox does not expose the runtime's Fetch API globals.
const native = runInThisContext("({ Headers, Response, TextDecoder })") as Pick<
  typeof globalThis,
  "Headers" | "Response" | "TextDecoder"
>;
const originalGlobals = Object.fromEntries(
  ["Headers", "fetch"].map((key) => [key, (global as any)[key]])
);
const originalObjectURLs = {
  createObjectURL: window.URL.createObjectURL,
  revokeObjectURL: window.URL.revokeObjectURL,
};
let click: jest.SpyInstance;
let createObjectURL: jest.Mock;
let revokeObjectURL: jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  document.body.innerHTML = "";
  createObjectURL = jest.fn(() => "blob:download");
  revokeObjectURL = jest.fn();
  window.URL.createObjectURL = createObjectURL;
  window.URL.revokeObjectURL = revokeObjectURL;
  click = jest
    .spyOn(window.HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {});
  (global as any).Headers = native.Headers;
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  click.mockRestore();
});

afterAll(() => {
  window.URL.createObjectURL = originalObjectURLs.createObjectURL;
  window.URL.revokeObjectURL = originalObjectURLs.revokeObjectURL;
  for (const [key, value] of Object.entries(originalGlobals)) {
    if (value === undefined) {
      delete (global as any)[key];
    } else {
      (global as any)[key] = value;
    }
  }
});

async function requestResponse(
  disposition: string | null,
  contentType: string | null = "application/pdf",
  content: BodyInit | null = "response contents",
  status = 201,
  extraHeaders: Record<string, string> = {}
) {
  const headers = new native.Headers(extraHeaders);
  if (contentType !== null) headers.set("Content-Type", contentType);
  if (disposition !== null) headers.set("Content-Disposition", disposition);
  const response = new native.Response(content, { status, headers });
  if (contentType === null) response.headers.delete("Content-Type");
  const text = jest.spyOn(response, "text");
  const blob = jest.spyOn(response, "blob");
  const clone = jest.spyOn(response, "clone");
  (global as any).fetch = jest.fn().mockResolvedValue(response);
  const request = new sdk.Request({
    url: "https://example.com/report",
    method: "GET",
  });
  const result = await makeRequest(request, undefined, { type: "empty" });
  return { result, response, text, blob, clone };
}

async function download(
  disposition: string | null,
  contentType: string | null = "application/pdf",
  content = "response contents"
) {
  return (await requestResponse(disposition, contentType, content)).result;
}

function filename() {
  return document.querySelector("a")?.download;
}

describe("download filenames", () => {
  it.each([
    ["attachment; filename=report.pdf", "report.pdf"],
    ['attachment; filename="report final.pdf"', "report final.pdf"],
    ['attachment; filename="report; final.pdf"', "report; final.pdf"],
    ['attachment; filename="report\\"final.pdf"', 'report"final.pdf'],
    [
      'attachment; note="ignore; filename=wrong.pdf"; filename=report.pdf',
      "report.pdf",
    ],
    ["inline; filename=report.pdf", "report.pdf"],
    ["attachment; filename=file%20name+v1.pdf", "file%20name+v1.pdf"],
    [
      "attachment; filename=report.pdf; filename*=UTF-8''r%C3%A9sum%C3%A9.pdf",
      "résumé.pdf",
    ],
    [
      "attachment; filename*=UTF-8'en'r%C3%A9sum%C3%A9.pdf; filename=report.pdf",
      "résumé.pdf",
    ],
    ["ATTACHMENT; FILENAME*=uTf-8''r%C3%A9sum%C3%A9.pdf", "résumé.pdf"],
    ["attachment; filename*=ISO-8859-1''%A3%20rates.pdf", "£ rates.pdf"],
    ['attachment; filename="../../report.pdf"', "report.pdf"],
    ['attachment; filename="C:\\\\reports\\\\report.pdf"', "report.pdf"],
    ['attachment; filename="  report.pdf  "', "report.pdf"],
    ["attachment; filename=report", "report.pdf"],
    ["attachment; filename*=UTF-8''r%C3%A9sum%C3%A9", "résumé.pdf"],
    ["attachment; filename*=UTF-8''invoice%E2%80%AEfdp.exe", "invoicefdp.exe"],
    [
      "attachment; filename*=UTF-8''%E2%81%A6report%E2%81%A7%E2%81%A8%E2%81%A9.pdf",
      "report.pdf",
    ],
    ["attachment; filename*=UTF-8''rep%E2%80%8Bort.pdf", "report.pdf"],
  ])("uses the filename from %s", async (disposition, expected) => {
    await download(disposition);
    expect(filename()).toBe(expected);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it.each([
    "UTF-8''bad%GG.pdf",
    "UTF-8''bad%FF.pdf",
    "UTF-8''bad%E2%82.pdf",
    "UTF-16''report.pdf",
    "bad.pdf",
  ])("falls back to filename when filename* is invalid: %s", async (value) => {
    await download(`attachment; filename=report.pdf; filename*=${value}`);
    expect(filename()).toBe("report.pdf");
  });

  it.each([
    null,
    "",
    "attachment",
    'attachment; note="ignore; filename=wrong.pdf"',
    'attachment; filename=""',
    'attachment; filename="   "',
    'attachment; filename="reports/"',
    'attachment; filename="."',
    'attachment; filename=".."',
    'attachment; filename="report.pdf',
    "attachment; filename=report.pdf; filename=other.pdf",
    "attachment; filename*=UTF-16''report.pdf",
    "attachment; filename*=UTF-8''%FF.pdf",
    "attachment; filename*=UTF-8''report%0A.pdf",
    "attachment; filename*=UTF-8''%00report.pdf",
    "attachment; filename*=UTF-8''%E2%80%AE",
  ])(
    "keeps the MIME-based default for an unusable header: %s",
    async (header) => {
      await download(header);
      expect(filename()).toBe("file.pdf");
      expect(click).toHaveBeenCalledTimes(1);
    }
  );

  it.each([
    ["image/png", "file.png"],
    ["application/zip", "file.zip"],
    ["application/octet-stream", "file.bin"],
  ])("keeps the existing default for %s", async (contentType, expected) => {
    await download(null, contentType);
    expect(filename()).toBe(expected);
  });

  it.each([
    ["text/csv", "report.csv"],
    [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "report.xlsx",
    ],
    [null, "report"],
  ])(
    "downloads an attachment with Content-Type %s",
    async (contentType, expected) => {
      await download("attachment; filename=report", contentType);
      expect(filename()).toBe(expected);
      expect(click).toHaveBeenCalledTimes(1);
    }
  );

  it.each(["attachment", "ATTACHMENT", " attachment ; filename=report.csv"])(
    "recognizes the attachment disposition %s",
    async (disposition) => {
      await download(disposition, "text/csv");
      expect(click).toHaveBeenCalledTimes(1);
    }
  );

  it.each(["text/plain", "application/json", null])(
    "keeps ordinary %s responses in the explorer",
    async (contentType) => {
      const response = await download(
        "inline; filename=report.pdf",
        contentType
      );
      expect(click).not.toHaveBeenCalled();
      await expect(readResponseBody(response)).resolves.toBe(
        "response contents"
      );
    }
  );

  it.each(["attachmentx", "form-data", 'inline; note="attachment"'])(
    "does not mistake %s for an attachment",
    async (disposition) => {
      await download(disposition, "text/plain");
      expect(click).not.toHaveBeenCalled();
    }
  );

  it("displays a short placeholder without decoding or cloning downloaded bytes", async () => {
    const content = new Uint8Array([0, 255, 254, 10]).buffer;
    const { result, response, text, blob, clone } = await requestResponse(
      "attachment; filename=report.pdf",
      "application/pdf",
      content
    );
    const display = await readResponseBody(result);
    expect(text).not.toHaveBeenCalled();
    expect(clone).not.toHaveBeenCalled();
    expect(blob).toHaveBeenCalledTimes(1);
    expect(display).toBe("Response body downloaded.");
    expect(display.length).toBeLessThan(100);
    expect(response.bodyUsed).toBe(true);
    expect("downloadedBody" in result).toBe(true);
    if (!("downloadedBody" in result))
      throw new Error("Missing download result");
    expect(result.response).toBe(response);
    expect(result.response.status).toBe(201);
    expect(result.response.headers.get("Content-Disposition")).toBe(
      "attachment; filename=report.pdf"
    );
    await expect(
      createObjectURL.mock.calls[0][0].arrayBuffer()
    ).resolves.toEqual(content);
  });

  it("removes the real anchor and revokes its object URL after clicking", async () => {
    await download("attachment; filename=report.pdf");
    expect(document.querySelector("a")).not.toBeNull();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    jest.advanceTimersByTime(999);
    expect(document.querySelector("a")).not.toBeNull();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(document.querySelector("a")).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download");
  });

  it.each([
    ["attachment; filename=report.pdf;", "report.pdf"],
    ["attachment; filename=report (1).pdf", "report (1).pdf"],
    ["attachment; filename=résumé.pdf", "résumé.pdf"],
    ["attachment; filename=report (1).pdf; ", "report (1).pdf"],
    ["attachment; filename=résumé.pdf;", "résumé.pdf"],
    ["attachment; filename=report.v2", "report.v2.pdf"],
    ["attachment; filename=report.V2", "report.V2.pdf"],
    ["attachment; filename=export.2024-10", "export.2024-10.pdf"],
    ["attachment; filename=archive.tar.gz", "archive.tar.gz"],
    ["attachment; filename=archive.7z", "archive.7z"],
  ])("accepts the browser filename %s", async (disposition, expected) => {
    await download(disposition);
    expect(filename()).toBe(expected);
  });

  it.each([
    ["application/pdf, application/pdf", "file.pdf"],
    [" APPLICATION/PDF ; charset=utf-8, application/pdf", "file.pdf"],
  ])("uses the first MIME list item in %s", async (contentType, expected) => {
    await download(null, contentType);
    expect(filename()).toBe(expected);
  });

  it("does not use a later binary MIME list item", async () => {
    const { result, response } = await requestResponse(
      null,
      "text/plain, application/pdf"
    );
    expect(result).toBe(response);
    expect(click).not.toHaveBeenCalled();
    await expect(readResponseBody(result)).resolves.toBe("response contents");
  });

  it.each([401, 500])(
    "shows an attachment error with status %s without downloading",
    async (status) => {
      const { result, response, text, blob, clone } = await requestResponse(
        "attachment; filename=error.pdf",
        "application/pdf",
        "request failed",
        status
      );
      expect(result).toBe(response);
      expect(response.status).toBe(status);
      expect(click).not.toHaveBeenCalled();
      expect(blob).not.toHaveBeenCalled();
      expect(clone).not.toHaveBeenCalled();
      await expect(readResponseBody(result)).resolves.toBe("request failed");
      expect(text).toHaveBeenCalledTimes(1);
    }
  );

  it.each([204, 205])(
    "preserves status %s for an empty downloaded body",
    async (status) => {
      const { result, response, text, clone } = await requestResponse(
        "attachment; filename=report.pdf",
        "application/pdf",
        null,
        status,
        { "Transfer-Encoding": "chunked" }
      );
      expect(isStreamingResponse(response)).toBe(false);
      expect("downloadedBody" in result).toBe(true);
      if (!("downloadedBody" in result))
        throw new Error("Missing download result");
      expect(result.response).toBe(response);
      expect(result.response.status).toBe(status);
      await expect(readResponseBody(result)).resolves.toBe(
        "Response body downloaded."
      );
      expect(text).not.toHaveBeenCalled();
      expect(clone).not.toHaveBeenCalled();
    }
  );

  it.each([
    ["text/event-stream", {}],
    ["TEXT/EVENT-STREAM; charset=utf-8", {}],
  ])(
    "leaves %s streams for the incremental reader",
    async (contentType, extraHeaders) => {
      const { result, response, text, blob, clone } = await requestResponse(
        "attachment; filename=stream.pdf",
        contentType,
        "data: first\n\n",
        200,
        extraHeaders
      );
      expect(result).toBe(response);
      expect(isStreamingResponse(response)).toBe(true);
      expect(click).not.toHaveBeenCalled();
      expect(blob).not.toHaveBeenCalled();
      expect(clone).not.toHaveBeenCalled();
      expect(text).not.toHaveBeenCalled();
      const reader = response.body!.getReader();
      const chunk = await reader.read();
      expect(new native.TextDecoder().decode(chunk.value)).toBe(
        "data: first\n\n"
      );
      await reader.cancel();
    }
  );

  it.each([
    [null, "chunked", "file.pdf"],
    ["attachment; filename=report.pdf", "gzip, Chunked", "report.pdf"],
  ])(
    "downloads a chunked PDF with disposition %s",
    async (disposition, transferEncoding, expectedFilename) => {
      const content = new Uint8Array([37, 80, 68, 70, 0, 255, 254, 10]).buffer;
      const { result, response, text, blob, clone } = await requestResponse(
        disposition,
        "application/pdf",
        content,
        200,
        { "Transfer-Encoding": transferEncoding }
      );
      expect(isStreamingResponse(response)).toBe(false);
      expect("downloadedBody" in result).toBe(true);
      if (!("downloadedBody" in result))
        throw new Error("Missing download result");
      expect(result.response).toBe(response);
      expect(result.response.status).toBe(200);
      expect(filename()).toBe(expectedFilename);
      expect(click).toHaveBeenCalledTimes(1);
      expect(blob).toHaveBeenCalledTimes(1);
      expect(text).not.toHaveBeenCalled();
      expect(clone).not.toHaveBeenCalled();
      await expect(readResponseBody(result)).resolves.toBe(
        "Response body downloaded."
      );
      await expect(
        createObjectURL.mock.calls[0][0].arrayBuffer()
      ).resolves.toEqual(content);
    }
  );

  it("does not mistake a similarly named transfer encoding for chunked", async () => {
    const { result, response } = await requestResponse(
      "attachment; filename=report.pdf",
      "application/pdf",
      "response contents",
      200,
      { "Transfer-Encoding": "chunked-extra" }
    );
    expect(isStreamingResponse(response)).toBe(false);
    expect("downloadedBody" in result).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
  });
});
