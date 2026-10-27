/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/* eslint-disable import/no-extraneous-dependencies -- Declared by this theme workspace. */

import React from "react";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import Body, { Props } from ".";
import bodyReducer from "./slice";
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
const mockEditor = jest.fn(({ children, language }: EditorProps) => {
  if (typeof children !== "string") {
    throw new TypeError("LiveEditor requires string code");
  }
  return React.createElement("pre", { "data-language": language }, children);
});
const mockContainer = ({ children }: { children?: React.ReactNode }) =>
  children;

jest.mock(
  "@docusaurus/Translate",
  () => ({ translate: ({ message }: { message: string }) => message }),
  { virtual: true }
);
jest.mock("@theme/ApiExplorer/LiveEditor", () => ({
  __esModule: true,
  default: (props: EditorProps) => mockEditor(props),
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

type MediaType = NonNullable<Props["requestBodyMetadata"]>["content"][string];
const schema = { example: "schema control" };
const falsyExamples: [string, any, string][] = [
  ["false", false, "false"],
  ["zero", 0, "0"],
  ["null", null, "null"],
  ["empty string", "", '""'],
];

function renderBody(
  mediaType: MediaType,
  contentType = "application/json",
  legacyExample = ""
) {
  mockEditor.mockClear();
  const store = configureStore({
    reducer: {
      body: bodyReducer,
      contentType: contentTypeReducer,
      schemaSelection: schemaSelectionReducer,
    },
    preloadedState: {
      body: { type: "empty" as const },
      contentType: { value: contentType, options: [contentType] },
    },
  });
  renderToStaticMarkup(
    React.createElement(Provider, {
      store,
      children: React.createElement(Body, {
        jsonRequestBodyExample: legacyExample,
        requestBodyMetadata: { content: { [contentType]: mediaType } },
      }),
    })
  );
  return { editors: mockEditor.mock.calls.map(([props]) => props), store };
}

describe("JSON request examples", () => {
  it.each(falsyExamples)(
    "keeps schema.example %s",
    (_name, value, expected) => {
      const { editors } = renderBody({ schema: { example: value } });
      expect(editors).toHaveLength(1);
      expect(editors[0]).toMatchObject({
        language: "json",
        children: expected,
      });
    }
  );

  it.each(falsyExamples)(
    "keeps the first schema.examples value %s",
    (_name, value, expected) => {
      const { editors } = renderBody({ schema: { examples: [value] } });
      expect(editors).toHaveLength(2);
      expect(editors.map(({ children }) => children)).toEqual([
        expected,
        expected,
      ]);
    }
  );

  it.each(falsyExamples)(
    "keeps media-type example %s",
    (_name, value, expected) => {
      const { editors, store } = renderBody({ schema, example: value });
      expect(editors).toHaveLength(2);
      expect(editors[0].children).toBe('"schema control"');
      expect(editors[1].children).toBe(expected);
      editors[1].action(editors[1].children);
      expect(store.getState().body).toEqual({
        type: "raw",
        content: { type: "string", value: expected },
      });
    }
  );

  it.each([
    ...falsyExamples,
    ["true", true, "true"],
    ["number", 42, "42"],
    ["array", [1], "[\n  1\n]"],
    ["empty array", [], "[]"],
    ["object", { ok: true }, '{\n  "ok": true\n}'],
  ])("serializes named example %s as editor code", (_name, value, expected) => {
    const { editors, store } = renderBody({
      schema,
      examples: { named: { value } },
    });
    expect(editors).toHaveLength(2);
    expect(editors[1].children).toBe(expected);
    editors[1].action(editors[1].children);
    expect(store.getState().body).toEqual({
      type: "raw",
      content: { type: "string", value: expected },
    });
  });

  it.each(["false", "0", "null", '""', "[1]", '{"ok":true}'])(
    "preserves pre-encoded named JSON %s",
    (value) => {
      const { editors } = renderBody({
        schema,
        examples: { named: { value } },
      });
      expect(editors).toHaveLength(2);
      expect(editors[1].children).toBe(value);
    }
  );

  it("encodes a plain named string", () => {
    const { editors } = renderBody({
      schema,
      examples: { named: { value: "plain text" } },
    });
    expect(editors[1].children).toBe('"plain text"');
  });

  it("does not add an editor for an undefined media-type example", () => {
    const { editors } = renderBody({ schema, example: undefined });
    expect(editors).toHaveLength(1);
    expect(editors[0].children).toBe('"schema control"');
  });

  it("does not add an editor for an undefined named value", () => {
    const { editors } = renderBody({
      schema,
      examples: { missing: { value: undefined } },
    });
    expect(editors).toHaveLength(1);
    expect(editors[0].children).toBe('"schema control"');
  });

  it("keeps the legacy nonempty fallback", () => {
    const { editors } = renderBody({}, "application/json", "legacy");
    expect(editors[0].children).toBe('"legacy"');
  });

  it("keeps the legacy empty-string sentinel", () => {
    const { editors } = renderBody({}, "application/json", "");
    expect(editors[0].children).toBe("");
  });

  it("leaves XML false-value handling unchanged", () => {
    const { editors } = renderBody(
      { schema: { example: false }, example: false },
      "application/xml"
    );
    expect(editors).toHaveLength(1);
    expect(editors[0]).toMatchObject({ language: "xml", children: "" });
  });

  it("keeps named XML examples", () => {
    const { editors } = renderBody(
      { schema, examples: { named: { value: "<value>control</value>" } } },
      "application/xml"
    );
    expect(editors[1]).toMatchObject({
      language: "xml",
      children: "<value>control</value>",
    });
  });

  it.each(["multipart/form-data", "application/x-www-form-urlencoded"])(
    "keeps the %s form",
    (contentType) => {
      const { editors } = renderBody(
        { schema: { type: "object", properties: {} } },
        contentType
      );
      expect(editors).toHaveLength(0);
    }
  );

  it("keeps binary uploads", () => {
    const { editors } = renderBody(
      { schema: { type: "string", format: "binary" } },
      "application/octet-stream"
    );
    expect(editors).toHaveLength(0);
  });
});
