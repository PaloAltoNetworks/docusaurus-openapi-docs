/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { runInThisContext } from "vm";

// eslint-disable-next-line import/no-extraneous-dependencies
import * as sdk from "postman-collection";

import makeRequest from "./makeRequest";

// Jest 27's Node sandbox does not expose the runtime's Fetch API globals.
const native = runInThisContext("({ Headers, Response })") as Pick<
  typeof globalThis,
  "Headers" | "Response"
>;
const originalGlobals = Object.fromEntries(
  ["window", "document", "Headers", "fetch"].map((key) => [
    key,
    (global as any)[key],
  ])
);
type TestDom = { window: Window & typeof globalThis };
const { JSDOM } = jest.requireActual("jsdom") as {
  JSDOM: new (html: string) => TestDom;
};
let dom: TestDom;
let click: jest.SpyInstance;
let createObjectURL: jest.Mock;
let revokeObjectURL: jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  dom = new JSDOM("<!doctype html><body></body>");
  createObjectURL = jest.fn(() => "blob:download");
  revokeObjectURL = jest.fn();
  dom.window.URL.createObjectURL = createObjectURL;
  dom.window.URL.revokeObjectURL = revokeObjectURL;
  click = jest
    .spyOn(dom.window.HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {});
  (global as any).Headers = native.Headers;
  (global as any).window = dom.window;
  (global as any).document = dom.window.document;
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  click.mockRestore();
  dom.window.close();
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
  contentType: string | null = "application/pdf",
  content = "response contents"
) {
  const headers = new native.Headers();
  if (contentType !== null) headers.set("Content-Type", contentType);
  if (disposition !== null) headers.set("Content-Disposition", disposition);
  const response = new native.Response(content, { status: 201, headers });
  if (contentType === null) response.headers.delete("Content-Type");
  (global as any).fetch = jest.fn().mockResolvedValue(response);
  const request = new sdk.Request({
    url: "https://example.com/report",
    method: "GET",
  });
  const result = await makeRequest(request, undefined, { type: "empty" });
  expect(result).toBe(response);
  return result;
}

function filename() {
  return dom.window.document.querySelector("a")?.download;
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
      await expect(response.text()).resolves.toBe("response contents");
    }
  );

  it.each(["attachmentx", "form-data", 'inline; note="attachment"'])(
    "does not mistake %s for an attachment",
    async (disposition) => {
      await download(disposition, "text/plain");
      expect(click).not.toHaveBeenCalled();
    }
  );

  it("preserves a readable successful response after downloading", async () => {
    const response = await download("attachment; filename=report.pdf");
    expect(response.status).toBe(201);
    expect(response.headers.get("Content-Disposition")).toBe(
      "attachment; filename=report.pdf"
    );
    await expect(response.text()).resolves.toBe("response contents");
    const blob = createObjectURL.mock.calls[0][0];
    await expect(blob.text()).resolves.toBe("response contents");
  });

  it("removes the real anchor and revokes its object URL after clicking", async () => {
    await download("attachment; filename=report.pdf");
    expect(dom.window.document.querySelector("a")).not.toBeNull();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(dom.window.document.querySelector("a")).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download");
  });
});
