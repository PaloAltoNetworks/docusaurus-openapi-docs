/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { sampleFromSchema } from "./createSchemaExample";
import { SchemaObject } from "./types";

describe("sampleFromSchema", () => {
  describe("const support", () => {
    it("should return default string value when const is not present", () => {
      const schema: SchemaObject = {
        type: "string",
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result).toBe("string");
    });

    it("should return const value when const is present", () => {
      const schema: SchemaObject = {
        type: "string",
        const: "example",
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result).toBe("example");
    });

    it("should handle anyOf with const values", () => {
      const schema: SchemaObject = {
        type: "string",
        anyOf: [
          {
            type: "string",
            const: "dog",
          },
          {
            type: "string",
            const: "cat",
          },
        ],
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result).toBe("dog");
    });
  });

  describe("allOf with incompatible types", () => {
    it("should return undefined when allOf contains incompatible types", () => {
      const schema: SchemaObject = {
        allOf: [{ type: "string" }, { type: "integer" }],
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result).toBeUndefined();
    });

    it("should handle incompatible allOf types in a property", () => {
      const schema: SchemaObject = {
        type: "object",
        properties: {
          numero: {
            allOf: [{ type: "string" }, { type: "integer" }],
          },
          name: {
            type: "string",
          },
        },
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result.name).toBe("string");
    });
  });
});
