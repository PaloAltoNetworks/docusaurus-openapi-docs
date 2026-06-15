/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

jest.mock(
  "@docusaurus/Translate",
  () => ({
    translate: ({ message }: { message: string }) => message,
  }),
  { virtual: true }
);

import { getSchemaName } from "./schema";
import { SchemaObject } from "../types";

describe("getSchemaName", () => {
  it("returns the type for a primitive schema", () => {
    expect(getSchemaName({ type: "string" } as SchemaObject)).toBe("string");
  });

  it("appends [] for an array of primitives", () => {
    const schema: SchemaObject = {
      type: "array",
      items: { type: "string" },
    } as SchemaObject;
    expect(getSchemaName(schema)).toBe("string[]");
  });

  it("appends [][] for an array of arrays of primitives", () => {
    const schema: SchemaObject = {
      type: "array",
      items: { type: "array", items: { type: "string" } },
    } as SchemaObject;
    expect(getSchemaName(schema)).toBe("string[][]");
  });

  it("appends [][] for an array of arrays of objects (issue #1114)", () => {
    const schema: SchemaObject = {
      type: "array",
      items: {
        type: "array",
        items: { type: "object", properties: { foo: { type: "string" } } },
      },
    } as SchemaObject;
    expect(getSchemaName(schema)).toBe("object[][]");
  });

  it("handles three levels of array nesting", () => {
    const schema: SchemaObject = {
      type: "array",
      items: {
        type: "array",
        items: { type: "array", items: { type: "integer" } },
      },
    } as SchemaObject;
    expect(getSchemaName(schema)).toBe("integer[][][]");
  });

  it("joins OpenAPI 3.1 type arrays with ` | ` (issue #950)", () => {
    const schema = { type: ["string", "null"] } as unknown as SchemaObject;
    expect(getSchemaName(schema)).toBe("string | null");
  });

  it("unwraps a single-element type array", () => {
    const schema = { type: ["integer"] } as unknown as SchemaObject;
    expect(getSchemaName(schema)).toBe("integer");
  });

  it("renders single type with format as `type<format>`", () => {
    const schema = {
      type: "string",
      format: "uuid",
    } as SchemaObject;
    expect(getSchemaName(schema)).toBe("string<uuid>");
  });

  it("renders type union with format", () => {
    const schema = {
      type: ["string", "null"],
      format: "uuid",
    } as unknown as SchemaObject;
    expect(getSchemaName(schema)).toBe("(string | null)<uuid>");
  });

  it("resolves type from an allOf wrapper that contains an enum", () => {
    const schema = {
      allOf: [{ type: "string", enum: ["a", "b"] }],
    } as unknown as SchemaObject;
    expect(getSchemaName(schema)).toBe("string");
  });

  it("renders array of items whose type is a union", () => {
    const schema: SchemaObject = {
      type: "array",
      items: { type: ["string", "null"] } as any,
    } as SchemaObject;
    expect(getSchemaName(schema)).toBe("(string | null)[]");
  });
});
