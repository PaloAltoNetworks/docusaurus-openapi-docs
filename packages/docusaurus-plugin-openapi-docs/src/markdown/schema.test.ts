/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { getSchemaName } from "./schema";
import { SchemaObject } from "../openapi/types";

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
});
