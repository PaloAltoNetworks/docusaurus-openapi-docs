/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { SchemaObject } from "../openapi/types";

function prettyName(schema: SchemaObject, circular?: boolean) {
  if (schema.$ref) {
    return schema.$ref.replace("#/components/schemas/", "") + circular
      ? " (circular)"
      : "";
  }

  if (schema.format) {
    return schema.format;
  }

  if (schema.allOf) {
    return "object";
  }

  if (schema.type === "object") {
    return schema.xml?.name ?? schema.type;
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
