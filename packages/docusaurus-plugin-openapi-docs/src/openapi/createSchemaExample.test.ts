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

    it("should return const value when type is omitted", () => {
      const schema: SchemaObject = {
        const: "circle",
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result).toBe("circle");
    });

    it("should keep falsy const values", () => {
      const context = { type: "request" as const };

      expect(sampleFromSchema({ type: "boolean", const: false }, context)).toBe(
        false
      );
      expect(sampleFromSchema({ type: "string", const: "" }, context)).toBe("");
      expect(sampleFromSchema({ type: "integer", const: 0 }, context)).toBe(0);
      expect(sampleFromSchema({ const: false }, context)).toBe(false);
      expect(sampleFromSchema({ const: null }, context)).toBeNull();
    });

    it("should include untyped const and enum properties in object examples", () => {
      const schema: SchemaObject = {
        type: "object",
        properties: {
          kind: { const: "circle" },
          status: { enum: ["active", "inactive"] },
          enabled: { const: false },
          r: { type: "number" },
        },
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result).toEqual({
        kind: "circle",
        status: "active",
        enabled: false,
        r: 0,
      });
    });
  });

  describe("enum support", () => {
    it("should return the first enum value when type is omitted", () => {
      const schema: SchemaObject = {
        enum: ["active", "inactive"],
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result).toBe("active");
    });

    it("should prefer default over the first enum value", () => {
      const schema: SchemaObject = {
        type: "string",
        enum: ["active", "inactive"],
        default: "inactive",
      };
      const context = { type: "request" as const };

      const result = sampleFromSchema(schema, context);

      expect(result).toBe("inactive");
    });

    it("should keep a falsy default", () => {
      const context = { type: "request" as const };

      expect(
        sampleFromSchema(
          { type: "boolean", enum: [true, false], default: false },
          context
        )
      ).toBe(false);
      expect(
        sampleFromSchema({ type: "integer", enum: [1, 0], default: 0 }, context)
      ).toBe(0);
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
