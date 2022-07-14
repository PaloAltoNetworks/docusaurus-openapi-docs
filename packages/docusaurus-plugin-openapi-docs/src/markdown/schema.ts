/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { SchemaObject } from "../openapi/types";

function prettyName(schema: SchemaObject, circular?: boolean) {
  if (schema.format) {
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

export function getQualifierMessage(schema?: SchemaObject): string | undefined {
  // TODO:
  // - uniqueItems
  // - maxProperties
  // - minProperties
  // - multipleOf
  if (!schema) {
    return undefined;
  }

  // TODO: This doesn't seem right
  if (schema.items) {
    return getQualifierMessage(schema.items);
  }

  let message = "**Possible values:** ";

  let qualifierGroups = [];

  if (schema.minLength || schema.maxLength) {
    let lengthQualifier = "";
    if (schema.minLength) {
      lengthQualifier += `${schema.minLength} ≤ `;
    }
    lengthQualifier += "length";
    if (schema.maxLength) {
      lengthQualifier += ` ≤ ${schema.maxLength}`;
    }
    qualifierGroups.push(lengthQualifier);
  }

  if (
    schema.minimum ||
    schema.maximum ||
    typeof schema.exclusiveMinimum === "number" ||
    typeof schema.exclusiveMaximum === "number"
  ) {
    let minmaxQualifier = "";
    if (typeof schema.exclusiveMinimum === "number") {
      minmaxQualifier += `${schema.exclusiveMinimum} < `;
    } else if (schema.minimum && !schema.exclusiveMinimum) {
      minmaxQualifier += `${schema.minimum} ≤ `;
    } else if (schema.minimum && schema.exclusiveMinimum === true) {
      minmaxQualifier += `${schema.minimum} < `;
    }
    minmaxQualifier += "value";
    if (typeof schema.exclusiveMaximum === "number") {
      minmaxQualifier += ` < ${schema.exclusiveMaximum}`;
    } else if (schema.maximum && !schema.exclusiveMaximum) {
      minmaxQualifier += ` ≤ ${schema.maximum}`;
    } else if (schema.maximum && schema.exclusiveMaximum === true) {
      minmaxQualifier += ` < ${schema.maximum}`;
    }
    qualifierGroups.push(minmaxQualifier);
  }

  if (schema.pattern) {
    qualifierGroups.push(
      `Value must match regular expression \`${schema.pattern}\``
    );
  }

  if (schema.enum) {
    qualifierGroups.push(`[${schema.enum.map((e) => `\`${e}\``).join(", ")}]`);
  }

  if (schema.minItems) {
    qualifierGroups.push(`items >= ${schema.minItems}`);
  }

  if (schema.maxItems) {
    qualifierGroups.push(`items <= ${schema.maxItems}`);
  }

  if (qualifierGroups.length === 0) {
    return undefined;
  }

  return message + qualifierGroups.join(", ");
}
