/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { SchemaObject } from "../openapi/types";

/**
 * Extracts enum values from a schema, including when wrapped in allOf.
 */
function getEnumFromSchema(schema: SchemaObject): any[] | undefined {
  if (schema.enum) {
    return schema.enum;
  }

  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const item of schema.allOf) {
      if (item.enum) {
        return item.enum;
      }
    }
  }

  return undefined;
}

/**
 * Extracts the type from a schema, including when wrapped in allOf.
 */
function getTypeFromSchema(schema: SchemaObject): string | undefined {
  if (schema.type) {
    return schema.type as string;
  }

  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const item of schema.allOf) {
      if (item.type) {
        return item.type as string;
      }
    }
  }

  return undefined;
}

// OpenAPI 3.1 / JSON Schema 2020-12 allows `type` to be an array of type names
// (e.g. `["string", "null"]`). Normalize to a single name and a pretty-printed
// union form joined with ` | `.
function normalizeType(type: unknown): {
  single?: string;
  pretty?: string;
  isUnion: boolean;
} {
  if (Array.isArray(type)) {
    const filtered = type.filter((t): t is string => typeof t === "string");
    if (filtered.length === 0) return { isUnion: false };
    if (filtered.length === 1) return { single: filtered[0], isUnion: false };
    return { pretty: filtered.join(" | "), isUnion: true };
  }
  if (typeof type === "string") return { single: type, isUnion: false };
  return { isUnion: false };
}

function prettyName(schema: SchemaObject, circular?: boolean) {
  // Handle enum-only schemas (valid in JSON Schema)
  // When enum is present without explicit type, treat as string
  if (schema.enum && !schema.type) {
    return "string";
  }

  const t = normalizeType(schema.type);

  if (schema.format) {
    if (t.single) {
      return `${t.single}<${schema.format}>`;
    }
    if (t.isUnion) {
      return `(${t.pretty})<${schema.format}>`;
    }
    return schema.format;
  }

  if (schema.allOf) {
    if (typeof schema.allOf[0] === "string") {
      // @ts-ignore
      if (schema.allOf[0].includes("circular")) {
        return schema.allOf[0];
      }
    }
    // Check if allOf contains an enum - if so, return the type from allOf
    const enumFromAllOf = getEnumFromSchema(schema);
    if (enumFromAllOf) {
      const typeFromAllOf = getTypeFromSchema(schema);
      return typeFromAllOf ?? "string";
    }
    return "object";
  }

  if (schema.oneOf) {
    return "object";
  }

  if (schema.anyOf) {
    return "object";
  }

  if (t.single === "object") {
    return schema.xml?.name ?? t.single;
  }

  if (t.single === "array") {
    return schema.xml?.name ?? t.single;
  }

  if (t.isUnion) {
    return schema.title ? `${schema.title} (${t.pretty})` : t.pretty;
  }

  if (schema.title && t.single) {
    return `${schema.title} (${t.single})`;
  }

  return schema.title ?? t.single;
}

export function getSchemaName(
  schema: SchemaObject,
  circular?: boolean
): string {
  if (schema.items) {
    const items = schema.items as SchemaObject;
    const inner = getSchemaName(items, circular);
    const needsParens =
      Array.isArray((items as any).type) && (items as any).type.length > 1;
    return needsParens ? `(${inner})[]` : `${inner}[]`;
  }

  return prettyName(schema, circular) ?? "";
}
