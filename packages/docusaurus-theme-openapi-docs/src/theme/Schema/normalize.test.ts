/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import {
  findPropertyDeep,
  foldSiblingsIntoBranches,
  getDiscriminator,
  isCircularMarker,
  mergeAllOf,
  normalizeSchema,
} from "./normalize";

describe("normalizeSchema", () => {
  it("returns the input as-is (identity-stable pass-through)", () => {
    const schema = { type: "object", properties: { a: { type: "string" } } };
    expect(normalizeSchema(schema)).toBe(schema);
  });

  it("handles null, undefined, and primitives", () => {
    expect(normalizeSchema(null)).toBeNull();
    expect(normalizeSchema(undefined)).toBeUndefined();
    expect(normalizeSchema("string")).toBe("string");
    expect(normalizeSchema(42)).toBe(42);
  });
});

describe("mergeAllOf", () => {
  it("merges allOf members into a flat schema", () => {
    const schema = {
      allOf: [
        { type: "object", properties: { a: { type: "string" } } },
        { type: "object", properties: { b: { type: "number" } } },
      ],
    };
    const result = mergeAllOf(schema);
    expect(result.allOf).toBeUndefined();
    expect(result.properties.a).toEqual({ type: "string" });
    expect(result.properties.b).toEqual({ type: "number" });
  });

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
    const result = mergeAllOf(schema);
    expect(result.properties.a).toBeDefined();
    expect(result.properties.b).toBeDefined();
  });

  it("preserves both properties and oneOf when merging incompatible-shape members", () => {
    const result = mergeAllOf({
      allOf: [
        { type: "object", properties: { id: { type: "string" } } },
        { oneOf: [{ title: "a" }, { title: "b" }] },
      ],
    });
    expect(result.properties.id).toBeDefined();
    expect(result.oneOf).toHaveLength(2);
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

  it("returns schema unchanged when a discriminator is present", () => {
    const schema = {
      discriminator: { propertyName: "type" },
      properties: { shared: { type: "string" } },
      oneOf: [{ properties: { a: { type: "number" } } }],
    };
    expect(foldSiblingsIntoBranches(schema)).toBe(schema);
  });

  it("folds sibling properties into oneOf branches", () => {
    const schema = {
      properties: { shared: { type: "string" } },
      oneOf: [
        { properties: { a: { type: "number" } } },
        { properties: { b: { type: "boolean" } } },
      ],
    };
    const result = foldSiblingsIntoBranches(schema);
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
    const result = foldSiblingsIntoBranches(schema);
    expect(result.properties).toBeUndefined();
    expect(result.anyOf).toHaveLength(2);
    expect(result.anyOf[1].properties.shared).toBeDefined();
    expect(result.anyOf[1].properties.b).toBeDefined();
  });

  it("preserves metadata and x-extension keys when folding", () => {
    const schema = {
      title: "Test",
      description: "desc",
      deprecated: true,
      "x-vendor": true,
      properties: { shared: { type: "string" } },
      anyOf: [{ properties: { a: { type: "number" } } }],
    };
    const result = foldSiblingsIntoBranches(schema);
    expect(result.title).toBe("Test");
    expect(result.description).toBe("desc");
    expect(result.deprecated).toBe(true);
    expect(result["x-vendor"]).toBe(true);
    expect(result.properties).toBeUndefined();
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

  // Regression for #1548 (property duplication in nested anyOf-of-oneOf):
  // when the outer schema is `{ properties, anyOf: [{oneOf:[...]}, ...] }`,
  // fold merges the outer properties into each anyOf branch, giving each
  // branch its own inner `oneOf` alongside merged properties. The AnyOneOf
  // render layer then delegates the branch to SchemaNode, which folds again
  // into each inner variant. If AnyOneOf were to *also* render the branch's
  // properties directly at that outer level, the same fields would appear
  // twice per selected inner variant tab — hence the check in Schema/index.tsx
  // that skips <Properties> when the branch has a nested oneOf/anyOf/allOf.
  it("folds outer properties into each anyOf branch when branches contain nested oneOf", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        default_value: { type: "string" },
      },
      anyOf: [
        {
          oneOf: [
            {
              title: "aggregate_group",
              properties: {
                aggregate_group: { type: "string" },
              },
            },
            {
              title: "tap",
              properties: {
                tap: { type: "object" },
              },
            },
          ],
        },
        {
          oneOf: [
            {
              title: "folder",
              properties: { folder: { type: "string" } },
            },
            {
              title: "snippet",
              properties: { snippet: { type: "string" } },
            },
          ],
        },
      ],
    };

    const outer = foldSiblingsIntoBranches(schema);
    expect(outer.properties).toBeUndefined();
    expect(outer.anyOf).toHaveLength(2);

    for (const branch of outer.anyOf) {
      // Each anyOf branch retains its own inner oneOf and picks up the
      // merged outer properties as siblings — this is the shape that
      // AnyOneOf must NOT render <Properties> for directly, because
      // SchemaNode will fold them into the inner variants below.
      expect(branch.oneOf).toBeDefined();
      expect(branch.properties.name).toBeDefined();
      expect(branch.properties.default_value).toBeDefined();

      const inner = foldSiblingsIntoBranches(branch);
      expect(inner.properties).toBeUndefined();
      expect(inner.oneOf).toBeDefined();
      for (const variant of inner.oneOf) {
        // Merged outer properties appear exactly once — inside each variant.
        expect(variant.properties.name).toBeDefined();
        expect(variant.properties.default_value).toBeDefined();
      }
    }
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

  it("handles cycles without infinite recursion", () => {
    const a: any = { properties: {} };
    const b: any = { properties: { a } };
    a.properties.b = b;
    expect(() => getDiscriminator(a)).not.toThrow();
    expect(getDiscriminator(a)).toBeUndefined();
  });
});

describe("findPropertyDeep", () => {
  it("returns property at top level", () => {
    const schema = { properties: { foo: { type: "string" } } };
    expect(findPropertyDeep(schema, "foo")).toEqual({ type: "string" });
  });

  it("finds property in oneOf branches", () => {
    const schema = {
      oneOf: [
        { properties: { a: { type: "string" } } },
        { properties: { b: { type: "number" } } },
      ],
    };
    expect(findPropertyDeep(schema, "a")).toEqual({ type: "string" });
    expect(findPropertyDeep(schema, "b")).toEqual({ type: "number" });
  });

  it("finds property in anyOf branches", () => {
    const schema = {
      anyOf: [{ properties: { x: { type: "integer" } } }],
    };
    expect(findPropertyDeep(schema, "x")).toEqual({ type: "integer" });
  });

  it("finds property in allOf branches", () => {
    const schema = {
      allOf: [{ properties: { y: { type: "boolean" } } }],
    };
    expect(findPropertyDeep(schema, "y")).toEqual({ type: "boolean" });
  });

  it("returns undefined when property not found", () => {
    const schema = { properties: { foo: { type: "string" } } };
    expect(findPropertyDeep(schema, "bar")).toBeUndefined();
  });

  it("returns undefined for null/primitive input", () => {
    expect(findPropertyDeep(null, "foo")).toBeUndefined();
    expect(findPropertyDeep("string", "foo")).toBeUndefined();
  });

  it("handles cycles without infinite recursion", () => {
    const a: any = { properties: {} };
    a.oneOf = [a];
    expect(() => findPropertyDeep(a, "foo")).not.toThrow();
    expect(findPropertyDeep(a, "foo")).toBeUndefined();
  });
});

describe("isCircularMarker", () => {
  it("returns true for circular marker strings", () => {
    expect(isCircularMarker("circular(Title)")).toBe(true);
    expect(isCircularMarker("circular()")).toBe(true);
  });

  it("returns false for other values", () => {
    expect(isCircularMarker("normal string")).toBe(false);
    expect(isCircularMarker(null)).toBe(false);
    expect(isCircularMarker(undefined)).toBe(false);
    expect(isCircularMarker({})).toBe(false);
    expect(isCircularMarker(42)).toBe(false);
  });
});
