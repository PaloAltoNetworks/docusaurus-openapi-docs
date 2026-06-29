/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// eslint-disable-next-line import/no-extraneous-dependencies
import { merge } from "allof-merge";

export function isCircularMarker(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("circular(");
}

/**
 * Strip `additionalProperties: false` from sibling allOf members so
 * allof-merge doesn't collapse to an unsatisfiable empty schema. See #1119.
 */
const stripCache = new WeakMap<object, any>();

function stripConflictingAdditionalProps(node: any): any {
  if (Array.isArray(node)) {
    const cached = stripCache.get(node);
    if (cached) return cached;
    const result = node.map(stripConflictingAdditionalProps);
    stripCache.set(node, result);
    return result;
  }
  if (!node || typeof node !== "object") return node;
  const cached = stripCache.get(node);
  if (cached) return cached;

  let working: any = node;
  if (Array.isArray(node.allOf) && node.allOf.length > 1) {
    const hasStrictMember = node.allOf.some(
      (m: any) => m && m.additionalProperties === false
    );
    if (hasStrictMember) {
      working = {
        ...node,
        allOf: node.allOf.map((m: any) => {
          if (m && m.additionalProperties === false) {
            const { additionalProperties: _drop, ...rest } = m;
            return rest;
          }
          return m;
        }),
      };
    }
  }

  const result: any = {};
  // Cache before recursing so shared-identity cycles don't loop forever.
  stripCache.set(node, result);
  for (const [k, v] of Object.entries(working)) {
    result[k] = stripConflictingAdditionalProps(v);
  }
  return result;
}

export function mergeAllOf(schema: any) {
  const onMergeError = (msg: string) => console.warn(msg);
  const merged = merge(stripConflictingAdditionalProps(schema), {
    onMergeError,
  });
  return merged ?? {};
}

// Keys that are parent-level metadata and should NOT be folded into branches.
const METADATA_KEYS = new Set([
  "title",
  "description",
  "discriminator",
  "deprecated",
  "externalDocs",
  "example",
  "examples",
  "xml",
  "nullable",
  "readOnly",
  "writeOnly",
  "default",
]);

/**
 * Fold sibling fields into each oneOf/anyOf branch via allOf-merge so each
 * branch is self-contained. See #1218.
 */
export function foldSiblingsIntoBranches(schema: any): any {
  const branchKey = schema?.oneOf
    ? "oneOf"
    : schema?.anyOf
      ? "anyOf"
      : undefined;
  if (!branchKey) return schema;

  const branches = schema[branchKey];
  if (!Array.isArray(branches) || branches.length === 0) return schema;

  const siblings = { ...schema };
  delete siblings[branchKey];
  if (Object.keys(siblings).length === 0) return schema;

  const folded = branches.map((branch: any) =>
    mergeAllOf({ allOf: [siblings, branch] })
  );

  const result: any = { [branchKey]: folded };
  for (const key of Object.keys(schema)) {
    if (key !== branchKey && (METADATA_KEYS.has(key) || key.startsWith("x-"))) {
      result[key] = schema[key];
    }
  }
  return result;
}

// WeakMap caches keyed by object identity — shared-reference subtrees from
// $RefParser.dereference are normalized/looked up once, and cycles short-circuit.
const normalizeCache = new WeakMap<object, any>();
const discriminatorCache = new WeakMap<object, any | null>();

/**
 * Cached recursive discriminator lookup. Returns O(1) on repeated calls
 * with the same object reference (common after normalizeSchema).
 */
export function getDiscriminator(schema: any): any | undefined {
  if (!schema || typeof schema !== "object") return undefined;
  if (discriminatorCache.has(schema)) {
    const cached = discriminatorCache.get(schema);
    return cached === null ? undefined : cached;
  }
  // Sentinel for cycle detection.
  discriminatorCache.set(schema, null);

  let result: any | undefined;
  if (schema.discriminator) {
    result = schema.discriminator;
  } else if (Array.isArray(schema.oneOf)) {
    for (const s of schema.oneOf) {
      const found = getDiscriminator(s);
      if (found) {
        result = found;
        break;
      }
    }
  }
  if (!result && Array.isArray(schema.anyOf)) {
    for (const s of schema.anyOf) {
      const found = getDiscriminator(s);
      if (found) {
        result = found;
        break;
      }
    }
  }
  if (!result && Array.isArray(schema.allOf)) {
    for (const s of schema.allOf) {
      const found = getDiscriminator(s);
      if (found) {
        result = found;
        break;
      }
    }
  }

  discriminatorCache.set(schema, result ?? null);
  return result;
}

/**
 * Single O(N) pass that merges allOf, strips conflicting additionalProperties,
 * and folds siblings into oneOf/anyOf branches. Cached by object identity so
 * nested SchemaNode renders short-circuit in O(1). See #1525.
 */
export function normalizeSchema(
  schema: any,
  cache: WeakMap<object, any> = normalizeCache
): any {
  if (Array.isArray(schema)) {
    const hit = cache.get(schema);
    if (hit) return hit;
    const result: any[] = [];
    cache.set(schema, result);
    for (const s of schema) result.push(normalizeSchema(s, cache));

    return result;
  }
  if (!schema || typeof schema !== "object") return schema;
  const hit = cache.get(schema);
  if (hit) return hit;

  // Placeholder for cycle detection.
  const result: any = {};
  cache.set(schema, result);

  let working: any = schema;

  if (Array.isArray(working.allOf) && working.allOf.length > 0) {
    // Skip merge when allOf contains circular-reference string markers
    // (e.g. `allOf: ["circular(Title)"]`) — allof-merge can't handle them.
    const hasCircularMember = working.allOf.some(isCircularMarker);
    if (!hasCircularMember) {
      working = mergeAllOf(working);
    }
  }

  if (working.oneOf || working.anyOf) {
    working = foldSiblingsIntoBranches(working);
  }

  for (const [k, v] of Object.entries(working)) {
    if (k === "properties" && v && typeof v === "object") {
      const props: any = {};
      for (const [pk, pv] of Object.entries(v)) {
        props[pk] = normalizeSchema(pv, cache);
      }
      result[k] = props;
    } else if (k === "items" || k === "not") {
      result[k] = v && typeof v === "object" ? normalizeSchema(v, cache) : v;
    } else if (k === "additionalProperties") {
      result[k] = v && typeof v === "object" ? normalizeSchema(v, cache) : v;
    } else if (
      (k === "oneOf" || k === "anyOf" || k === "allOf") &&
      Array.isArray(v)
    ) {
      result[k] = v.map((s: any) => normalizeSchema(s, cache));
    } else {
      result[k] = v;
    }
  }

  // Self-register so re-normalizing the output is an identity no-op.
  cache.set(result, result);
  return result;
}
