/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/* eslint-disable import/no-extraneous-dependencies -- Declared by this theme workspace. */

import React from "react";

import { configureStore } from "@reduxjs/toolkit";
import * as sdk from "postman-collection";
import { Provider } from "react-redux";

import Body, { Props } from ".";
import bodyReducer from "./slice";
import buildPostmanRequest from "../buildPostmanRequest";
import contentTypeReducer from "../ContentType/slice";
import schemaSelectionReducer from "../SchemaSelection/slice";

const {
  renderToStaticMarkup,
}: {
  renderToStaticMarkup: (children: React.ReactNode) => string;
} = require("react-dom/server");

type EditorProps = {
  children: string;
  language: string;
  action: (value: string) => void;
};
const mockEditor = jest.fn(({ children, language }: EditorProps) =>
  React.createElement("pre", { "data-language": language }, children)
);
const mockContainer = ({ children }: { children?: React.ReactNode }) =>
  children;

jest.mock(
  "@docusaurus/Translate",
  () => ({ translate: ({ message }: { message: string }) => message }),
  { virtual: true }
);
jest.mock("@theme/ApiExplorer/LiveEditor", () => ({
  __esModule: true,
  default: (props: any) => mockEditor(props),
}));
jest.mock("@theme/ApiExplorer/FormFileUpload", () => () => null);
jest.mock("@theme/ApiExplorer/FormItem", () => ({
  __esModule: true,
  default: (props: any) => mockContainer(props),
}));
jest.mock("@theme/Markdown", () => ({
  __esModule: true,
  default: (props: any) => mockContainer(props),
}));
jest.mock("@theme/SchemaTabs", () => ({
  __esModule: true,
  default: (props: any) => mockContainer(props),
}));
jest.mock("@theme/TabItem", () => ({
  __esModule: true,
  default: (props: any) => mockContainer(props),
}));
jest.mock("./FormBodyItem", () => () => null);

type Content = NonNullable<Props["requestBodyMetadata"]>["content"];
const schema = {
  type: "object" as const,
  properties: { message: { type: "string" as const, example: "from schema" } },
};

beforeAll(() => {
  (global as any).window = { location: { origin: "http://localhost:3000" } };
});

afterAll(() => {
  delete (global as any).window;
});

function renderBody(contentType: string, content: Content) {
  mockEditor.mockClear();
  const store = configureStore({
    reducer: {
      body: bodyReducer,
      contentType: contentTypeReducer,
      schemaSelection: schemaSelectionReducer,
    },
    preloadedState: {
      body: { type: "empty" as const },
      contentType: { value: contentType, options: Object.keys(content) },
    },
  });

  renderToStaticMarkup(
    React.createElement(Provider, {
      store,
      children: React.createElement(Body, {
        jsonRequestBodyExample: "",
        requestBodyMetadata: { content },
      }),
    })
  );
  return {
    editors: mockEditor.mock.calls.map(([props]) => props),
    store,
  };
}

describe("request body media types", () => {
  it.each([
    ["application/json", "json", '{\n  "message": "from schema"\n}'],
    [
      "application/json; charset=utf-8",
      "json",
      '{\n  "message": "from schema"\n}',
    ],
    [
      "application/problem+json; charset=utf-8",
      "json",
      '{\n  "message": "from schema"\n}',
    ],
    [
      "APPLICATION/JSON ; Charset=UTF-8",
      "json",
      '{\n  "message": "from schema"\n}',
    ],
    [
      "Application/Problem+JSON; Charset=UTF-8",
      "json",
      '{\n  "message": "from schema"\n}',
    ],
    ["application/xml", "xml", "<message>from schema</message>"],
    ["application/xml; charset=utf-8", "xml", "<message>from schema</message>"],
    [
      "image/svg+xml; charset=US-ASCII",
      "xml",
      "<message>from schema</message>",
    ],
    [
      "APPLICATION/XML ; Charset=UTF-8",
      "xml",
      "<message>from schema</message>",
    ],
  ])("prefills %s with a %s example", (contentType, language, expected) => {
    const { editors } = renderBody(contentType, { [contentType]: { schema } });
    expect(editors).toHaveLength(1);
    expect(editors[0]).toMatchObject({ language, children: expected });
  });

  it.each([
    ["application/problem+json; charset=utf-8", "json"],
    ["application/xml; charset=utf-8", "xml"],
  ])(
    "keeps explicit examples under the original %s key",
    (contentType, language) => {
      const { editors, store } = renderBody(contentType, {
        [contentType.split(";")[0]]: {
          schema,
          example: { message: "wrong media type" },
        },
        [contentType]: { schema, example: { message: "from raw key" } },
      });
      expect(editors).toHaveLength(2);
      expect(editors[1].language).toBe(language);
      expect(editors[1].children).toContain("from raw key");
      expect(editors[1].children).not.toContain("wrong media type");

      editors[1].action(editors[1].children);
      const request = buildPostmanRequest(
        new sdk.Request({
          url: "http://example.com/example",
          method: "POST",
          body: { mode: "raw", raw: "" },
        }),
        {
          queryParams: [],
          pathParams: [],
          cookieParams: [],
          headerParams: [],
          contentType,
          accept: "",
          body: store.getState().body,
          auth: { data: {}, options: {} },
        }
      );
      expect(request.headers.get("Content-Type")).toBe(contentType);
      expect(request.body?.raw).toBe(editors[1].children);
    }
  );

  it.each([
    ["application/problem+json; charset=utf-8", "json"],
    ["application/xml; charset=utf-8", "xml"],
  ])("renders named and schema examples for %s", (contentType, language) => {
    const { editors } = renderBody(contentType, {
      [contentType]: {
        schema: { ...schema, examples: [{ message: "from schema examples" }] },
        examples: {
          named: {
            value:
              language === "xml"
                ? "<message>named example</message>"
                : { message: "named example" },
          },
        },
      },
    });
    expect(editors).toHaveLength(3);
    expect(editors.map((editor) => editor.language)).toEqual([
      language,
      language,
      language,
    ]);
    expect(editors[1].children).toContain("named example");
    expect(editors[2].children).toContain("from schema examples");
  });

  it.each([
    "text/plain; note=application/json",
    "xapplication/json",
    "text/plain; profile=+json",
  ])("does not treat %s as JSON", (contentType) => {
    const { editors } = renderBody(contentType, { [contentType]: { schema } });
    expect(editors).toHaveLength(1);
    expect(editors[0]).toMatchObject({ language: "plaintext", children: "" });
  });

  it.each(["multipart/form-data", "application/x-www-form-urlencoded"])(
    "keeps the %s form",
    (contentType) => {
      const { editors } = renderBody(contentType, {
        [contentType]: { schema },
      });
      expect(editors).toHaveLength(0);
    }
  );

  it("keeps binary uploads", () => {
    const { editors } = renderBody("application/pdf", {
      "application/pdf": { schema: { type: "string", format: "binary" } },
    });
    expect(editors).toHaveLength(0);
  });
});
