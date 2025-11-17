/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { SchemaObject } from "../openapi/types";

function prettyName(schema: SchemaObject, circular?: boolean) {
  if (schema.format) {
    if (schema.type) {
      return `${schema.type}<${schema.format}>`;
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
    return "object";
  }

  if (schema.oneOf) {
    return "object";
  }

  if (schema.anyOf) {
    return "object";
  }

  if (schema.type === "object") {
    return schema.xml?.name ?? schema.type;
    // return schema.type;
  }

  if (schema.type === "array") {
    return schema.xml?.name ?? schema.type;
    // return schema.type;
  }

  if (schema.title && schema.type) {
    return `${schema.title} (${schema.type})`;
  }

  return schema.title ?? schema.type;
}

export function getSchemaName(
  schema: SchemaObject,
  circular?: boolean
): string {
  if (schema.items) {
    return prettyName(schema.items, circular) + "[]";
  }

  return prettyName(schema, circular) ?? "";
}
