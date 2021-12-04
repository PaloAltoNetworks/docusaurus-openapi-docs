/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// TODO: Can this logic be merged? I don't remember why they are different.
function prettyNameCircular(schema: any) {
  if (schema.$ref) {
    return schema.$ref.replace("#/components/schemas/", "") + " (circular)";
  }
  if (schema.format) {
    return schema.format;
  }
  if (schema.type === "object") {
    return schema.xml?.name || schema.type;
  }
  return schema.title || schema.type;
}

function prettyNameSimple(schema: any) {
  if (schema.$ref) {
    return schema.$ref.replace("#/components/schemas/", "");
  }
  if (schema.format) {
    return schema.format;
  }
  return schema.type;
}

function prettyName(schema: any, circular?: boolean) {
  if (circular) {
    return prettyNameCircular(schema);
  }
  return prettyNameSimple(schema);
}

export function getSchemaName(schema: any, circular?: boolean): string {
  if (schema.type === "array") {
    return prettyName(schema.items, circular) + "[]";
  }

  return prettyName(schema, circular) ?? "";
}
