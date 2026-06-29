/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import {
  foldSiblingsIntoBranches,
  getDiscriminator,
  normalizeSchema,
} from "./normalize";

describe("normalizeSchema", () => {
  describe("allOf merging", () => {
    it("merges allOf members into a flat schema", () => {
      const schema = {
        allOf: [
          { type: "object", properties: { a: { type: "string" } } },
          { type: "object", properties: { b: { type: "number" } } },
        ],
      };
      const result = normalizeSchema(schema);
      expect(result.allOf).toBeUndefined();
      expect(result.properties.a).toEqual({ type: "string" });
      expect(result.properties.b).toEqual({ type: "number" });
    });

    it("preserves discriminator from allOf member so getDiscriminator finds it", () => {
      const schema = {
        allOf: [
          {
            discriminator: { propertyName: "type" },
            oneOf: [
              { title: "A", properties: { type: { type: "string" } } },
              { title: "B", properties: { type: { type: "string" } } },
            ],
          },
          { properties: { shared: { type: "string" } } },
        ],
      };
      const result = normalizeSchema(schema);
      // allof-merge doesn't promote discriminator to the top level, but
      // getDiscriminator finds it inside the oneOf branches at render time.
      expect(getDiscriminator(result)).toEqual({ propertyName: "type" });
    });
  });

  describe("sibling folding", () => {
    it("folds sibling properties into oneOf branches", () => {
      const schema = {
        properties: { shared: { type: "string" } },
        oneOf: [
          { properties: { a: { type: "number" } } },
          { properties: { b: { type: "boolean" } } },
        ],
      };
      const result = normalizeSchema(schema);
      expect(result.properties).toBeUndefined();
      expect(result.oneOf).toHaveLength(2);
      expect(result.oneOf[0].properties.shared).toBeDefined();
      expect(result.oneOf[0].properties.a).toBeDefined();
    });

    it("folds sibling properties into anyOf branches", () => {
      const schema = {
        properties: { shared: { type: "string" } },
        anyOf: [
          { properties: { a: { type: "number" } } },
          { properties: { b: { type: "boolean" } } },
        ],
      };
      const result = normalizeSchema(schema);
      expect(result.properties).toBeUndefined();
      expect(result.anyOf).toHaveLength(2);
      expect(result.anyOf[1].properties.shared).toBeDefined();
      expect(result.anyOf[1].properties.b).toBeDefined();
    });

    it("preserves metadata keys like title and discriminator", () => {
      const schema = {
        title: "MySchema",
        description: "A polymorphic schema",
        discriminator: { propertyName: "type" },
        properties: { shared: { type: "string" } },
        oneOf: [
          { properties: { a: { type: "number" } } },
          { properties: { b: { type: "boolean" } } },
        ],
      };
      const result = normalizeSchema(schema);
      expect(result.title).toBe("MySchema");
      expect(result.description).toBe("A polymorphic schema");
      expect(result.discriminator).toEqual({ propertyName: "type" });
      expect(result.properties).toBeUndefined();
    });

    it("does not leak non-metadata sibling keys into the result", () => {
      const schema = {
        type: "object",
        properties: { shared: { type: "string" } },
        additionalProperties: { type: "number" },
        oneOf: [
          { properties: { a: { type: "number" } } },
          { properties: { b: { type: "boolean" } } },
        ],
      };
      const result = normalizeSchema(schema);
      expect(result.type).toBeUndefined();
      expect(result.additionalProperties).toBeUndefined();
      expect(result.properties).toBeUndefined();
      expect(result.oneOf).toHaveLength(2);
    });

    it("preserves x-* extension keys as metadata", () => {
      const schema = {
        "x-custom": "value",
        properties: { shared: { type: "string" } },
        oneOf: [{ properties: { a: { type: "number" } } }],
      };
      const result = normalizeSchema(schema);
      expect(result["x-custom"]).toBe("value");
      expect(result.properties).toBeUndefined();
    });

    it("leaves schema unchanged when no siblings exist", () => {
      const schema = {
        oneOf: [
          { properties: { a: { type: "string" } } },
          { properties: { b: { type: "string" } } },
        ],
      };
      const result = normalizeSchema(schema);
      expect(result.oneOf).toHaveLength(2);
      expect(result.oneOf[0].properties.a).toBeDefined();
    });
  });

  describe("additionalProperties: false stripping", () => {
    it("strips conflicting additionalProperties: false from allOf members", () => {
      const schema = {
        allOf: [
          {
            type: "object",
            properties: { a: { type: "string" } },
            additionalProperties: false,
          },
          {
            type: "object",
            properties: { b: { type: "number" } },
            additionalProperties: false,
          },
        ],
      };
      const result = normalizeSchema(schema);
      expect(result.properties.a).toBeDefined();
      expect(result.properties.b).toBeDefined();
    });
  });

  describe("circular reference handling", () => {
    it("preserves circular string markers in allOf", () => {
      const schema = {
        allOf: ["circular(Parent)"],
        title: "Child",
      };
      const result = normalizeSchema(schema);
      expect(result.allOf).toEqual(["circular(Parent)"]);
      expect(result.title).toBe("Child");
    });

    it("preserves circular string markers in items position", () => {
      const schema = {
        type: "object",
        properties: {
          children: {
            type: "array",
            items: "circular(TreeNode)",
          },
        },
      };
      const result = normalizeSchema(schema);
      expect(result.properties.children.items).toBe("circular(TreeNode)");
    });

    it("preserves circular string markers in property position", () => {
      const schema = {
        type: "object",
        properties: {
          parent: "circular(Category)" as any,
          name: { type: "string" },
        },
      };
      const result = normalizeSchema(schema);
      expect(result.properties.parent).toBe("circular(Category)");
      expect(result.properties.name).toEqual({ type: "string" });
    });

    it("preserves circular string markers in additionalProperties", () => {
      const schema = {
        type: "object",
        properties: { name: { type: "string" } },
        additionalProperties: "circular(OrgChart)" as any,
      };
      const result = normalizeSchema(schema);
      expect(result.additionalProperties).toBe("circular(OrgChart)");
    });
  });

  describe("recursive normalization", () => {
    it("normalizes nested properties", () => {
      const schema = {
        type: "object",
        properties: {
          nested: {
            allOf: [
              { properties: { a: { type: "string" } } },
              { properties: { b: { type: "number" } } },
            ],
          },
        },
      };
      const result = normalizeSchema(schema);
      expect(result.properties.nested.allOf).toBeUndefined();
      expect(result.properties.nested.properties.a).toBeDefined();
      expect(result.properties.nested.properties.b).toBeDefined();
    });

    it("normalizes items schema", () => {
      const schema = {
        type: "array",
        items: {
          allOf: [
            { properties: { x: { type: "integer" } } },
            { properties: { y: { type: "integer" } } },
          ],
        },
      };
      const result = normalizeSchema(schema);
      expect(result.items.allOf).toBeUndefined();
      expect(result.items.properties.x).toBeDefined();
      expect(result.items.properties.y).toBeDefined();
    });

    it("normalizes additionalProperties schema", () => {
      const schema = {
        type: "object",
        additionalProperties: {
          allOf: [
            { properties: { k: { type: "string" } } },
            { properties: { v: { type: "string" } } },
          ],
        },
      };
      const result = normalizeSchema(schema);
      expect(result.additionalProperties.allOf).toBeUndefined();
      expect(result.additionalProperties.properties.k).toBeDefined();
    });

    it("normalizes oneOf branch schemas", () => {
      const schema = {
        oneOf: [
          {
            allOf: [
              { properties: { a: { type: "string" } } },
              { properties: { b: { type: "number" } } },
            ],
          },
        ],
      };
      const result = normalizeSchema(schema);
      expect(result.oneOf[0].allOf).toBeUndefined();
      expect(result.oneOf[0].properties.a).toBeDefined();
    });
  });

  describe("identity and caching", () => {
    it("short-circuits already-normalized schemas", () => {
      const schema = {
        type: "object",
        properties: { a: { type: "string" } },
      };
      const first = normalizeSchema(schema);
      const second = normalizeSchema(first);
      expect(second).toBe(first);
    });

    it("handles null and primitive values", () => {
      expect(normalizeSchema(null)).toBeNull();
      expect(normalizeSchema(undefined)).toBeUndefined();
      expect(normalizeSchema("string")).toBe("string");
      expect(normalizeSchema(42)).toBe(42);
    });
  });
});

describe("foldSiblingsIntoBranches", () => {
  it("returns schema unchanged when no oneOf/anyOf is present", () => {
    const schema = { type: "object", properties: { a: { type: "string" } } };
    expect(foldSiblingsIntoBranches(schema)).toBe(schema);
  });

  it("returns schema unchanged when branches have no siblings", () => {
    const schema = {
      oneOf: [{ properties: { a: { type: "string" } } }],
    };
    expect(foldSiblingsIntoBranches(schema)).toBe(schema);
  });

  it("strips non-metadata keys from result", () => {
    const schema = {
      type: "object",
      required: ["shared"],
      properties: { shared: { type: "string" } },
      items: { type: "string" },
      oneOf: [{ properties: { a: { type: "number" } } }],
    };
    const result = foldSiblingsIntoBranches(schema);
    expect(result.type).toBeUndefined();
    expect(result.required).toBeUndefined();
    expect(result.properties).toBeUndefined();
    expect(result.items).toBeUndefined();
    expect(result.oneOf).toHaveLength(1);
  });

  it("preserves metadata and x-extension keys", () => {
    const schema = {
      title: "Test",
      description: "desc",
      discriminator: { propertyName: "type" },
      deprecated: true,
      "x-vendor": true,
      properties: { shared: { type: "string" } },
      anyOf: [{ properties: { a: { type: "number" } } }],
    };
    const result = foldSiblingsIntoBranches(schema);
    expect(result.title).toBe("Test");
    expect(result.description).toBe("desc");
    expect(result.discriminator).toEqual({ propertyName: "type" });
    expect(result.deprecated).toBe(true);
    expect(result["x-vendor"]).toBe(true);
    expect(result.properties).toBeUndefined();
  });
});

describe("getDiscriminator", () => {
  it("returns direct discriminator", () => {
    const schema = { discriminator: { propertyName: "type" } };
    expect(getDiscriminator(schema)).toEqual({ propertyName: "type" });
  });

  it("finds discriminator in oneOf branches", () => {
    const schema = {
      oneOf: [{ discriminator: { propertyName: "kind" } }, { type: "string" }],
    };
    expect(getDiscriminator(schema)).toEqual({ propertyName: "kind" });
  });

  it("finds discriminator in anyOf branches", () => {
    const schema = {
      anyOf: [
        { type: "string" },
        { discriminator: { propertyName: "variant" } },
      ],
    };
    expect(getDiscriminator(schema)).toEqual({ propertyName: "variant" });
  });

  it("finds discriminator in allOf branches", () => {
    const schema = {
      allOf: [
        { properties: { id: { type: "string" } } },
        { discriminator: { propertyName: "type" } },
      ],
    };
    expect(getDiscriminator(schema)).toEqual({ propertyName: "type" });
  });

  it("returns undefined when no discriminator exists", () => {
    const schema = {
      type: "object",
      properties: { name: { type: "string" } },
    };
    expect(getDiscriminator(schema)).toBeUndefined();
  });

  it("returns undefined for null/primitive input", () => {
    expect(getDiscriminator(null)).toBeUndefined();
    expect(getDiscriminator("string")).toBeUndefined();
  });

  it("caches results for same object reference", () => {
    const inner = { discriminator: { propertyName: "type" } };
    const schema = { oneOf: [inner] };
    const first = getDiscriminator(schema);
    const second = getDiscriminator(schema);
    expect(first).toBe(second);
  });
});
