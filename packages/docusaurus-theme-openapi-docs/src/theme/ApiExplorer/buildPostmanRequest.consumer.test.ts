/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/* eslint-disable import/no-extraneous-dependencies -- Declared by this theme workspace. */

import React, { act } from "react";

import codegen from "postman-code-generators";
import * as sdk from "postman-collection";

import CodeSnippets from "./CodeSnippets";
import Request from "./Request";
import * as requestModule from "./Request/makeRequest";

type MountedRoot = {
  render: (children: React.ReactNode) => void;
  unmount: () => void;
};
const {
  createRoot,
}: {
  createRoot: (host: HTMLElement) => MountedRoot;
} = require("react-dom/client");

let mockState: any;
const mockDispatch = jest.fn();
const mockContext = { siteConfig: { themeConfig: {} } };
const mockStorage = [null];

jest.mock(
  "@docusaurus/Translate",
  () => ({ translate: ({ message }: { message: string }) => message }),
  { virtual: true }
);
jest.mock(
  "@docusaurus/useDocusaurusContext",
  () => ({
    __esModule: true,
    default: () => mockContext,
  }),
  { virtual: true }
);
jest.mock(
  "@docusaurus/plugin-content-docs/client",
  () => ({ useDoc: () => ({ frontMatter: {} }) }),
  { virtual: true }
);
jest.mock(
  "@docusaurus/theme-common",
  () => ({ useStorageSlot: () => mockStorage }),
  { virtual: true }
);
jest.mock("@theme/ApiItem/hooks", () => ({
  useTypedSelector: (select: (state: any) => any) => select(mockState),
  useTypedDispatch: (select?: (state: any) => any) =>
    select ? select(mockState) : mockDispatch,
}));
jest.mock("@theme/ApiExplorer/Accept", () => () => null);
jest.mock("@theme/ApiExplorer/Authorization", () => () => null);
jest.mock("@theme/ApiExplorer/Body", () => () => null);
jest.mock("@theme/ApiExplorer/ContentType", () => () => null);
jest.mock("@theme/ApiExplorer/ParamOptions", () => () => null);
jest.mock("@theme/ApiExplorer/Server", () => () => null);
jest.mock("@theme/ApiExplorer/ApiCodeBlock", () => ({
  __esModule: true,
  default: ({ children }: any) => React.createElement("pre", {}, children),
}));
jest.mock("@theme/ApiExplorer/CodeTabs", () => ({
  __esModule: true,
  default: ({ children }: any) => React.createElement("div", {}, children),
}));

let mountedRoot: MountedRoot;
let host: HTMLDivElement;
const samples: [] = [];
const multipart = "multipart/form-data";

function original(formdata: any[]) {
  return new sdk.Request({
    url: "http://example.com/upload",
    method: "POST",
    body: { mode: "formdata", formdata } as any,
  });
}

function render(view: React.ReactNode) {
  // eslint-disable-next-line testing-library/no-unnecessary-act -- Direct ReactDOM rendering needs act to flush effects.
  act(() => mountedRoot.render(view));
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  mockDispatch.mockClear();
  mockState = {
    params: { path: [], query: [], cookie: [], header: [] },
    contentType: { value: multipart },
    accept: { value: "", options: [] },
    server: { options: [] },
    auth: { data: {}, options: {} },
    encodingSelection: {},
    body: {
      type: "raw",
      content: {
        type: "file",
        value: { src: "upload.csv", content: new Blob(["id\n1\n"]) },
      },
    },
  };
  host = document.createElement("div");
  document.body.appendChild(host);
  mountedRoot = createRoot(host);
});

afterEach(() => {
  // eslint-disable-next-line testing-library/no-unnecessary-act -- Direct ReactDOM cleanup needs act.
  act(() => mountedRoot.unmount());
  host.remove();
  jest.restoreAllMocks();
});

it("renders an actionable error and blocks submission for ambiguous raw multipart files", async () => {
  const send = jest.spyOn(requestModule, "default");
  const postman = original([
    { key: "first", type: "file" },
    { key: "second", type: "file" },
  ]);
  const item = { postman: postman.toJSON(), method: "post", servers: [{}] };
  render(React.createElement(Request, { item: item as any }));
  expect(host.querySelector('[role="alert"]')?.textContent).toMatch(
    /Choose a named file field/
  );
  expect(
    host.querySelector("button[type=submit]")?.hasAttribute("disabled")
  ).toBe(true);
  // Even a programmatic submit cannot bypass the disabled button.
  // eslint-disable-next-line testing-library/no-unnecessary-act -- Direct DOM submission flushes React Hook Form asynchronously.
  await act(async () => {
    host
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  expect(send).not.toHaveBeenCalled();
  expect(mockDispatch).not.toHaveBeenCalled();
});

it("keeps the unique-field upload selectable without a rendering error", () => {
  const postman = original([{ key: "upload", type: "file" }]);
  render(
    React.createElement(Request, {
      item: { postman: postman.toJSON(), method: "post", servers: [{}] } as any,
    })
  );
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(
    host.querySelector("button[type=submit]")?.hasAttribute("disabled")
  ).toBe(false);
});

it("blocks snippet generation for ambiguous uploads and recovers after a field is selected", () => {
  const convert = jest.spyOn(codegen, "convert");
  const postman = original([
    { key: "first", type: "file" },
    { key: "second", type: "file" },
  ]);
  const view = React.createElement(CodeSnippets, {
    postman,
    codeSamples: samples,
  });
  render(view);
  expect(host.querySelector('[role="alert"]')?.textContent).toMatch(
    /Choose a named file field/
  );
  expect(convert).not.toHaveBeenCalled();

  mockState.body = {
    type: "form",
    content: { second: { type: "string", value: "selected field" } },
  };
  render(React.createElement(CodeSnippets, { postman, codeSamples: samples }));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(convert).toHaveBeenCalled();
  const request = convert.mock.calls[0][2];
  if (!(request instanceof sdk.Request)) throw new Error("Missing SDK request");
  expect(request.body?.formdata?.all()).toMatchObject([
    { key: "second", value: "selected field" },
  ]);
});
