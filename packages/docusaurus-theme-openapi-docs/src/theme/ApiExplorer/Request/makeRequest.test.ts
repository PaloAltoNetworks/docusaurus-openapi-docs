/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// eslint-disable-next-line import/no-extraneous-dependencies
import * as sdk from "postman-collection";

import makeRequest from "./makeRequest";

const originalGlobals = Object.fromEntries(
  ["window", "document", "Headers", "fetch"].map((key) => [
    key,
    (global as any)[key],
  ])
);

let link: {
  href: string;
  style: { display: string };
  setAttribute: jest.Mock;
  click: jest.Mock;
};

beforeEach(() => {
  jest.useFakeTimers();
  link = {
    href: "",
    style: { display: "" },
    setAttribute: jest.fn(),
    click: jest.fn(),
  };
  (global as any).Headers = jest.fn(() => ({ append: jest.fn() }));
  (global as any).window = {
    URL: { createObjectURL: jest.fn(() => "blob:download") },
  };
  (global as any).document = {
    createElement: jest.fn(() => link),
    body: { appendChild: jest.fn(), removeChild: jest.fn() },
  };
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

afterAll(() => {
  for (const [key, value] of Object.entries(originalGlobals)) {
    if (value === undefined) {
      delete (global as any)[key];
    } else {
      (global as any)[key] = value;
    }
  }
});

async function download(
  disposition: string | null,
  contentType: string | null = "application/pdf"
) {
  const headers = new Map([
    ["content-type", contentType],
    ["content-disposition", disposition],
  ]);
  const response = {
    headers: { get: (name: string) => headers.get(name) ?? null },
    blob: jest.fn().mockResolvedValue({}),
  } as unknown as Response;
  (global as any).fetch = jest.fn().mockResolvedValue(response);
  const request = new sdk.Request({
    url: "https://example.com/report",
    method: "GET",
  });
  expect(await makeRequest(request, undefined, { type: "empty" })).toBe(
    response
  );
  return response;
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
    ["attachment; filename*=UTF-8''%FF.pdf", "\uFFFD.pdf"],
    ['attachment; filename="../../report.pdf"', "report.pdf"],
    ['attachment; filename="C:\\\\reports\\\\report.pdf"', "report.pdf"],
    ['attachment; filename="  report.pdf  "', "report.pdf"],
  ])("uses the filename from %s", async (disposition, expected) => {
    await download(disposition);
    expect(link.setAttribute).toHaveBeenCalledWith("download", expected);
    expect(link.click).toHaveBeenCalledTimes(1);
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
    "attachment; filename=report.pdf; filename*=UTF-8''bad%GG.pdf",
    "attachment; filename*=UTF-16''report.pdf",
    "attachment; filename*=UTF-8''report%0A.pdf",
    'attachment; filename="\u0001report.pdf"',
  ])(
    "keeps the MIME-based default for an unusable header: %s",
    async (header) => {
      await download(header);
      expect(link.setAttribute).toHaveBeenCalledWith("download", "file.pdf");
      expect(link.click).toHaveBeenCalledTimes(1);
    }
  );

  it.each([
    ["image/png", "file.png"],
    ["application/zip", "file.zip"],
    ["application/octet-stream", "file.bin"],
  ])("keeps the existing default for %s", async (contentType, expected) => {
    await download(null, contentType);
    expect(link.setAttribute).toHaveBeenCalledWith("download", expected);
  });

  it.each(["text/plain", "application/json", null])(
    "does not start a new download for %s",
    async (contentType) => {
      const response = await download(
        "attachment; filename=report.pdf",
        contentType
      );
      expect(response.blob).not.toHaveBeenCalled();
      expect(link.click).not.toHaveBeenCalled();
    }
  );
});
