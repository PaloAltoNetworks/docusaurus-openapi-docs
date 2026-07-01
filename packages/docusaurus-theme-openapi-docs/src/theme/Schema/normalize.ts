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

export function mergeAllOf(schema: any): any {
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
 *
 * Skipped when a discriminator is present: DiscriminatorNode already renders
 * sibling properties at the top level, and folding would duplicate the
 * discriminator metadata into each branch (causing nested DiscriminatorNode
 * renders inside tabs — see #1525 follow-up).
 *
 * Called by normalizeSchema after allOf resolution. Uses mergeAllOf internally
 * to compose `{ allOf: [siblings, branch] }` per branch — the WeakMap caches
 * in stripConflictingAdditionalProps prevent redundant work on shared subtrees.
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

  // Discriminator schemas rely on top-level properties being intact so
  // DiscriminatorNode can locate the discriminator property and render
  // shared siblings at the top level. Leave them alone.
  if (schema.discriminator) return schema;

  // Build siblings from non-metadata keys only. Metadata (title, description,
  // examples, etc.) belongs at the top level and must not be folded.
  const siblings: any = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key !== branchKey && !METADATA_KEYS.has(key) && !key.startsWith("x-")) {
      siblings[key] = value;
    }
  }
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
// $RefParser.dereference are looked up once, and cycles short-circuit.
const discriminatorCache = new WeakMap<object, any | null>();
const findPropertyCache = new WeakMap<object, Map<string, any>>();

/**
 * Cached recursive discriminator lookup. Returns O(1) on repeated calls
 * with the same object reference (common after normalizeSchema).
 */
const BRANCH_KEYS = ["oneOf", "anyOf", "allOf"] as const;

export function getDiscriminator(schema: any): any | undefined {
  if (!schema || typeof schema !== "object") return undefined;
  if (discriminatorCache.has(schema)) {
    const cached = discriminatorCache.get(schema);
    return cached === null ? undefined : cached;
  }
  discriminatorCache.set(schema, null);

  let result: any | undefined = schema.discriminator;
  if (!result) {
    for (const key of BRANCH_KEYS) {
      const branches = schema[key];
      if (!Array.isArray(branches)) continue;
      for (const branch of branches) {
        result = getDiscriminator(branch);
        if (result) break;
      }
      if (result) break;
    }
  }

  discriminatorCache.set(schema, result ?? null);
  return result;
}

/**
 * Cached recursive property lookup. Searches schema.properties first, then
 * into oneOf/anyOf/allOf branches. Returns O(1) on repeated calls with the
 * same (schema, propertyName) pair — replaces the O(subtree) findProperty
 * walk that caused #1525's O(N^2) render cost.
 */
export function findPropertyDeep(
  schema: any,
  propertyName: string
): any | undefined {
  if (!schema || typeof schema !== "object") return undefined;
  let cache = findPropertyCache.get(schema);
  if (cache && cache.has(propertyName)) {
    const cached = cache.get(propertyName);
    return cached === null ? undefined : cached;
  }
  if (!cache) {
    cache = new Map();
    findPropertyCache.set(schema, cache);
  }
  cache.set(propertyName, null);

  let result: any | undefined = schema.properties?.[propertyName];
  if (!result) {
    for (const key of BRANCH_KEYS) {
      const branches = schema[key];
      if (!Array.isArray(branches)) continue;
      for (const branch of branches) {
        result = findPropertyDeep(branch, propertyName);
        if (result) break;
      }
      if (result) break;
    }
  }

  cache.set(propertyName, result ?? null);
  return result;
}

/**
 * Identity-stable schema pass-through. Returns the input as-is so SchemaNode
 * useMemo dependencies stay stable across renders.
 *
 * Earlier iterations of this function eagerly merged allOf and folded
 * siblings into oneOf/anyOf branches, but those operations need to stay
 * conditional inside SchemaNode and DiscriminatorNode — eager versions
 * caused cartesian product expansion (allOf with multiple oneOfs) and
 * double-folding regressions. The render-time helpers below
 * (mergeAllOf, foldSiblingsIntoBranches) are still cached via the WeakMap
 * inside stripConflictingAdditionalProps, so per-render cost stays bounded.
 *
 * The perf win for #1525 comes from getDiscriminator's WeakMap cache
 * replacing the O(subtree) findDiscriminator walk, not from eager
 * normalization here.
 */
export function normalizeSchema(schema: any): any {
  return schema;
}
