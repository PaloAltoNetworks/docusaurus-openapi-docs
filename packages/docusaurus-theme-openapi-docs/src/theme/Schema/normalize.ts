/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// eslint-disable-next-line import/no-extraneous-dependencies
import { merge } from "allof-merge";

/**
 * Strip `additionalProperties: false` from sibling allOf members so the
 * strict-AND semantics of `allof-merge` don't collapse the result to an
 * unsatisfiable empty schema. See issue #1119 for full rationale and
 * Schema/index.tsx for the historical inline copy.
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
  stripCache.set(node, result);
  for (const [k, v] of Object.entries(working)) {
    result[k] = stripConflictingAdditionalProps(v);
  }
  return result;
}

export function mergeAllOf(allOf: any) {
  const onMergeError = (msg: string) => console.warn(msg);
  const merged = merge(stripConflictingAdditionalProps(allOf), {
    onMergeError,
  });
  return merged ?? {};
}

/**
 * Fold sibling fields into each `oneOf`/`anyOf` branch via allOf-merge so each
 * branch is self-contained. See issue #1218.
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

  const { properties: _, required: _r, type: _t, ...metadata } = schema;
  return { ...metadata, [branchKey]: folded };
}

/**
 * Deeply normalize a schema in one pass so the renderer never has to run
 * `mergeAllOf` or `foldSiblingsIntoBranches` itself.
 *
 * - Eliminates `allOf` (merged into the parent).
 * - Eliminates oneOf/anyOf + sibling collisions (folded into branches).
 * - Recurses through every schema-bearing key (properties, items,
 *   additionalProperties, oneOf, anyOf, not).
 *
 * Designed to run once per top-level schema (memoized via `useMemo` at
 * `RequestSchema` / `ResponseSchema`). The existing inline `if (schema.allOf)`
 * and `hasProperties && hasOneOfAnyOf` gates in `Schema/index.tsx` become
 * dead-by-precondition on the normalized output, so the per-render
 * deep-walk that caused issue #1525 never fires.
 *
 * Internally cache-keyed by input identity (WeakMap) so shared-reference
 * subtrees produced by `$RefParser.dereference({ circular: true })` are
 * normalized once and shared, and so reference cycles short-circuit safely.
 * For specs that lose identity through a `JSON.stringify` roundtrip (as
 * happens in `loadAndResolveSpec.ts`), the cache provides no dedup but is
 * still negligible cost.
 *
 * See https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1525
 */
// Module-level cache shared across all `normalizeSchema` calls so nested
// `SchemaNode` renders short-circuit in O(1) after the top-level O(N) pass.
const normalizeCache = new WeakMap<object, any>();

/**
 * Memoized variant of `findDiscriminator` from `Schema/index.tsx`. The
 * original walks `oneOf`/`anyOf`/`allOf` recursively from every recursive
 * `SchemaNode` render — for deeply recursive specs like Komga's, this
 * compounds to O(N²) across the 17K nested renders and contributes to the
 * browser hang in issue #1525 even after `normalizeSchema` removes the
 * `mergeAllOf` work.
 *
 * The cache is keyed by input identity. Because `normalizeSchema` produces a
 * tree with stable inner-node identity (each child object is reused in the
 * parent's `properties`/`items`/etc.), recursive `SchemaNode` renders pass
 * the same object reference here and get a cached result in O(1).
 *
 * `null` cache entries mean "no discriminator found" and short-circuit
 * negative lookups the same way positives do.
 */
const discriminatorCache = new WeakMap<object, any | null>();

export function getDiscriminator(schema: any): any | undefined {
  if (!schema || typeof schema !== "object") return undefined;
  if (discriminatorCache.has(schema)) {
    const cached = discriminatorCache.get(schema);
    return cached === null ? undefined : cached;
  }
  // Mark in-progress as null so cycles in shared-reference subtrees don't
  // recurse forever.
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

  // Allocate the result placeholder first so cycles resolve to the
  // in-progress object instead of recursing forever.
  const result: any = {};
  cache.set(schema, result);

  let working: any = schema;

  if (Array.isArray(working.allOf) && working.allOf.length > 0) {
    // Skip merge when allOf contains circular-reference string markers
    // produced by loadAndResolveSpec's JSON.stringify roundtrip (e.g.
    // `allOf: ["circular(Title)"]`). allof-merge doesn't handle string
    // members and would discard the marker.
    const hasCircularMember = working.allOf.some(
      (m: any) => typeof m === "string"
    );
    if (!hasCircularMember) {
      working = mergeAllOf(working);
    }
  }

  if ((working.oneOf || working.anyOf) && working.properties) {
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
      // additionalProperties can be true | false | SchemaObject.
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
