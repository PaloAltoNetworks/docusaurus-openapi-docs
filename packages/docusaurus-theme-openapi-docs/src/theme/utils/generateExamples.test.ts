/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/* eslint-disable import/no-extraneous-dependencies -- Declared by this theme workspace. */

import React from "react";

import RequestSchema from "@theme/RequestSchema";
import ResponseSchema from "@theme/ResponseSchema";

import { GenerateExamples, showExampleFromSchema } from "./generateExamples";

const {
  renderToStaticMarkup,
}: {
  renderToStaticMarkup: (children: React.ReactNode) => string;
} = require("react-dom/server");

let mockGenerateExamples: GenerateExamples | undefined;
const mockContainer = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

jest.mock(
  "@docusaurus/theme-common",
  () => ({
    useThemeConfig: () => ({ api: { generateExamples: mockGenerateExamples } }),
  }),
  { virtual: true }
);
jest.mock(
  "@docusaurus/BrowserOnly",
  () =>
    ({ children }: { children: () => React.ReactNode }) =>
      children(),
  { virtual: true }
);
jest.mock(
  "@docusaurus/Translate",
  () => ({ translate: ({ message }: { message: string }) => message }),
  { virtual: true }
);
jest.mock("@theme/ResponseExamples", () => ({
  ExampleFromSchema: () =>
    React.createElement("section", { "data-sample": "schema" }),
  ResponseExample: () => null,
  ResponseExamples: () => null,
}));
jest.mock("@theme/Markdown", () => (props: any) => mockContainer(props));
jest.mock("@theme/MimeTabs", () => (props: any) => mockContainer(props));
jest.mock("@theme/Schema", () => () => null);
jest.mock("@theme/SchemaExpansion", () => () => null);
jest.mock("@theme/SchemaTabs", () => (props: any) => mockContainer(props));
jest.mock("@theme/SkeletonLoader", () => () => null);
jest.mock("@theme/TabItem", () => (props: any) => mockContainer(props));

afterEach(() => {
  mockGenerateExamples = undefined;
});

describe("showExampleFromSchema", () => {
  const generated = { type: "object" as const };
  const withExample = { type: "object" as const, example: { id: 1 } };
  const withExamples = { type: "object" as const, examples: [{ id: 1 }] };

  it.each<[GenerateExamples, boolean, boolean]>([
    ["always", true, true],
    ["always", false, true],
    ["fallback", true, false],
    ["fallback", false, true],
    ["never", true, false],
    ["never", false, false],
  ])(
    "%s mode with a media-type example %s shows a generated sample: %s",
    (mode, hasPublishedExample, expected) => {
      expect(showExampleFromSchema(mode, generated, hasPublishedExample)).toBe(
        expected
      );
    }
  );

  it.each<GenerateExamples>(["always", "fallback", "never"])(
    "%s mode shows a schema-level example",
    (mode) => {
      expect(showExampleFromSchema(mode, withExample, true)).toBe(true);
      expect(showExampleFromSchema(mode, withExamples, true)).toBe(true);
    }
  );
});

describe.each([
  ["RequestSchema", RequestSchema],
  ["ResponseSchema", ResponseSchema],
])("%s in never mode", (_name, Component) => {
  function render(schema: object) {
    mockGenerateExamples = "never";
    return renderToStaticMarkup(
      React.createElement(Component, {
        title: "Body",
        body: { content: { "application/json": { schema } } },
      })
    );
  }

  it.each([
    ["example", { type: "object", example: { id: 1 } }],
    ["examples", { type: "object", examples: [{ id: 1 }] }],
  ])("shows the schema-level %s", (_source, schema) => {
    expect(render(schema)).toContain('data-sample="schema"');
  });

  it("hides a generated sample", () => {
    expect(
      render({ type: "object", properties: { id: { type: "integer" } } })
    ).not.toContain('data-sample="schema"');
  });
});
