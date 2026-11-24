/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// CJS stub for @apidevtools/json-schema-ref-parser (ESM-only in v15+).
// Resolves internal "#/..." pointers like the real dereference with
// `circular: true`: circular references become shared object references.
// External references are left unchanged.

function resolvePointer(root, ref) {
  return ref
    .slice(2)
    .split("/")
    .filter((part) => part !== "")
    .map((part) =>
      decodeURIComponent(part).replace(/~1/g, "/").replace(/~0/g, "~")
    )
    .reduce((node, key) => (node == null ? undefined : node[key]), root);
}

function dereferenceInternal(root) {
  const resolved = new Map();
  const visited = new WeakSet();

  function visit(node) {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) {
      if (visited.has(node)) return node;
      visited.add(node);
      for (let i = 0; i < node.length; i++) node[i] = visit(node[i]);
      return node;
    }
    if (typeof node.$ref === "string" && node.$ref.startsWith("#/")) {
      const { $ref, ...siblings } = node;
      let target = resolved.get($ref);
      if (target === undefined) {
        const raw = resolvePointer(root, $ref);
        if (raw === undefined || raw === null || typeof raw !== "object") {
          return node;
        }
        resolved.set($ref, raw);
        target = visit(raw);
        resolved.set($ref, target);
      }
      return Object.keys(siblings).length > 0
        ? { ...target, ...siblings }
        : target;
    }
    if (visited.has(node)) return node;
    visited.add(node);
    for (const key of Object.keys(node)) node[key] = visit(node[key]);
    return node;
  }

  return visit(root);
}

const $RefParser = {
  dereference: async (input) =>
    input && typeof input === "object" ? dereferenceInternal(input) : input,
};

module.exports = $RefParser;
module.exports.default = $RefParser;
