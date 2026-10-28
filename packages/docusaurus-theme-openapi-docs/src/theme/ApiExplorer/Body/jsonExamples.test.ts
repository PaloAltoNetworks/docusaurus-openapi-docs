/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/* eslint-disable import/no-extraneous-dependencies -- Declared by this theme workspace. */

import React, { act } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import Body, { Props } from ".";
import bodyReducer from "./slice";
import contentTypeReducer from "../ContentType/slice";
import schemaSelectionReducer from "../SchemaSelection/slice";

type MountedRoot = {
  render: (children: React.ReactNode) => void;
  unmount: () => void;
};
const {
  createRoot,
}: {
  createRoot: (host: HTMLElement) => MountedRoot;
} = require("react-dom/client");

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
const mockMarkdown = jest.fn((props: any) => mockContainer(props));
const mockTabItem = ({ children, label }: any) =>
  React.createElement("section", { "data-tab-label": label }, children);

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
  default: (props: any) => mockMarkdown(props),
}));
jest.mock("@theme/SchemaTabs", () => ({
  __esModule: true,
  default: (props: any) => mockContainer(props),
}));
jest.mock("@theme/TabItem", () => ({
  __esModule: true,
  default: (props: any) => mockTabItem(props),
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
let mountedRoot: MountedRoot | undefined;
let host: HTMLDivElement | undefined;

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  act(() => mountedRoot?.unmount());
  host?.remove();
  mountedRoot = undefined;
  host = undefined;
});

function renderBody(
  mediaType: MediaType,
  contentType = "application/json",
  legacyExample = ""
) {
  mockEditor.mockClear();
  mockMarkdown.mockClear();
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
  const holder = document.createElement("div");
  host = holder;
  document.body.appendChild(holder);
  const view = createRoot(holder);
  mountedRoot = view;
  // eslint-disable-next-line testing-library/no-unnecessary-act -- Direct ReactDOM rendering needs act to flush Body effects.
  act(() => {
    view.render(
      React.createElement(Provider, {
        store,
        children: React.createElement(Body, {
          jsonRequestBodyExample: legacyExample,
          requestBodyMetadata: { content: { [contentType]: mediaType } },
        }),
      })
    );
  });
  return {
    editors: mockEditor.mock.calls.map(([props]) => props),
    store,
    host: holder,
  };
}

function selectExample(editor: EditorProps) {
  act(() => editor.action(editor.children));
}

describe("JSON request examples", () => {
  it.each<[string, any, string]>([
    ["integer", { type: "integer" }, ""],
    ["number", { type: "number" }, ""],
    ["boolean", { type: "boolean" }, "true"],
    ["false default", { type: "boolean", default: false }, ""],
    ["false enum", { type: "boolean", enum: [false] }, ""],
    ["null", { type: "null" }, '"null"'],
    ["string", { type: "string" }, '"string"'],
    ["object", { type: "object" }, "{}"],
  ])(
    "retains the generated %s sampler default",
    (_name, generatedSchema, expected) => {
      const { editors, store } = renderBody({ schema: generatedSchema });
      expect(editors[0].children).toBe(expected);
      expect(store.getState().body).toEqual(
        expected === ""
          ? { type: "empty" }
          : {
              type: "raw",
              content: { type: "string", value: expected },
            }
      );
    }
  );

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

  it.each(falsyExamples.filter(([, value]) => value !== null))(
    "keeps media-type example %s",
    (_name, value, expected) => {
      const { editors, store } = renderBody({ schema, example: value });
      expect(editors).toHaveLength(2);
      expect(editors[0].children).toBe('"schema control"');
      expect(editors[1].children).toBe(expected);
      selectExample(editors[1]);
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
    selectExample(editors[1]);
    expect(store.getState().body).toEqual({
      type: "raw",
      content: { type: "string", value: expected },
    });
  });

  it.each(["[1]", '{"ok":true}'])(
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

  it.each(["123", "true", "null", '{"id":1}', "[1]"])(
    "preserves string-schema value %s in single and named examples",
    (value) => {
      const { editors, store } = renderBody({
        schema: { type: "string", example: "schema control" },
        example: value,
        examples: { named: { value } },
      });
      expect(editors[1].children).toBe(JSON.stringify(value));
      selectExample(editors[1]);
      expect(store.getState().body).toEqual({
        type: "raw",
        content: { type: "string", value: JSON.stringify(value) },
      });
      expect(host?.querySelector('[data-tab-label="named"]')).toBeNull();
    }
  );

  it.each(["123", "true", "null", '{"id":1}', "[1]"])(
    "preserves named string-schema value %s",
    (value) => {
      const { editors, store } = renderBody({
        schema: { type: "string", example: "schema control" },
        examples: { named: { value } },
      });
      expect(editors[1].children).toBe(JSON.stringify(value));
      selectExample(editors[1]);
      expect(store.getState().body).toEqual({
        type: "raw",
        content: { type: "string", value: JSON.stringify(value) },
      });
    }
  );

  it("preserves a string value for an OAS 3.1 string/null type union", () => {
    const value = '{"id":1}';
    const { editors } = renderBody({
      schema: { type: ["string", "null"] as any, example: "schema control" },
      examples: { named: { value } },
    });
    expect(editors[1].children).toBe(JSON.stringify(value));
  });

  it.each(["[1]", '{"id":1}'])(
    "uses the same pre-encoded host rule for a single example %s",
    (value) => {
      const { editors } = renderBody({ schema, example: value });
      expect(editors[1].children).toBe(value);
    }
  );

  it.each(["123", "true", "null"])(
    "quotes scalar-looking named strings without a string schema: %s",
    (value) => {
      const { editors } = renderBody({
        schema,
        examples: { named: { value } },
      });
      expect(editors[1].children).toBe(JSON.stringify(value));
    }
  );

  it.each(["example", "examples"])(
    "uses the provided formatter for schema.%s",
    (source) => {
      const value = '{"id":1}';
      const { editors } = renderBody({
        schema: {
          type: "object",
          [source]: source === "example" ? value : [value],
        },
      });
      expect(editors.map(({ children }) => children)).toEqual(
        source === "example" ? [value] : [value, value]
      );
    }
  );

  it("does not let an explicit null hide named examples", () => {
    const { editors, host } = renderBody({
      schema,
      example: null,
      examples: { named: { value: false } },
    });
    expect(editors.map(({ children }) => children)).toEqual([
      '"schema control"',
      "false",
    ]);
    expect(host.querySelector('[data-tab-label="named"]')).not.toBeNull();
    expect(host.querySelector('[data-tab-label="Example"]')).toBeNull();
  });

  it("does not render a tab or summary for an externalValue-only example", () => {
    const { editors, host } = renderBody({
      schema,
      examples: {
        external: {
          externalValue: "https://example.invalid/example.json",
          summary: "External description",
        },
      },
    });
    expect(editors).toHaveLength(1);
    expect(host.querySelector('[data-tab-label="external"]')).toBeNull();
    expect(mockMarkdown).not.toHaveBeenCalled();
  });

  it("keeps named Example Object summaries", () => {
    renderBody({
      schema,
      examples: { named: { value: 0, summary: "Named description" } },
    });
    expect(mockMarkdown.mock.calls[0][0].children).toBe("Named description");
    expect(mockMarkdown).toHaveBeenCalledTimes(1);
  });

  it.each(["Payload summary", { nested: true }])(
    "treats payload.summary %p as data",
    (summary) => {
      const payload = { summary, id: 1 };
      const { editors } = renderBody({ schema, example: payload });
      expect(editors[1].children).toBe(JSON.stringify(payload, null, 2));
      expect(mockMarkdown).not.toHaveBeenCalled();
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

  it("preserves explicit XML false values", () => {
    const { editors } = renderBody(
      { schema: { example: false }, example: false },
      "application/xml"
    );
    expect(editors).toHaveLength(2);
    expect(editors[0]).toMatchObject({ language: "xml", children: "false" });
    expect(editors[1]).toMatchObject({ language: "xml", children: "false" });
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

  it.each<[string, any, string]>([
    ["zero", 0, "0"],
    ["false", false, "false"],
    ["true", true, "true"],
    ["null", null, "null"],
    ["empty string", "", ""],
    ["object", { value: "control" }, "<value>control</value>"],
    ["array", [1], "<0>1</0>"],
  ])("safely renders named XML %s", (_name, value, expected) => {
    const { editors, store } = renderBody(
      { schema, examples: { named: { value } } },
      "application/xml"
    );
    expect(editors[1]).toMatchObject({ language: "xml", children: expected });
    selectExample(editors[1]);
    expect(store.getState().body).toEqual({
      type: "raw",
      content: { type: "string", value: expected },
    });
  });

  it("keeps XML single strings consistent with named XML strings", () => {
    const value = "<value>control</value>";
    const { editors } = renderBody(
      { schema, example: value },
      "application/xml"
    );
    expect(editors[1].children).toBe(value);
  });

  it.each([false, 0])("renders a single XML primitive %p", (value) => {
    const { editors, store } = renderBody(
      { schema, example: value },
      "application/xml"
    );
    expect(editors[1].children).toBe(String(value));
    selectExample(editors[1]);
    expect(store.getState().body).toEqual({
      type: "raw",
      content: { type: "string", value: String(value) },
    });
  });

  it("renders XML schema.examples false and zero as strings", () => {
    const { editors } = renderBody(
      { schema: { examples: [false, 0] } },
      "application/xml"
    );
    expect(editors.map(({ children }) => children)).toEqual([
      "false",
      "false",
      "0",
    ]);
  });

  it("skips externalValue-only XML examples", () => {
    const { host } = renderBody(
      {
        schema,
        examples: {
          external: { externalValue: "https://example.invalid/example.xml" },
        },
      },
      "application/xml"
    );
    expect(host.querySelector('[data-tab-label="external"]')).toBeNull();
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
