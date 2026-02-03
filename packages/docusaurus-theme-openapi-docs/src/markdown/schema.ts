/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { translate } from "@docusaurus/Translate";

import { OPENAPI_SCHEMA_ITEM } from "../theme/translationIds";
import { SchemaObject } from "../types";

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

function prettyName(schema: SchemaObject, circular?: boolean) {
  // Handle enum-only schemas (valid in JSON Schema)
  // When enum is present without explicit type, treat as string
  if (schema.enum && !schema.type) {
    return "string";
  }

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

  if (schema.type === "object") {
    return schema.xml?.name ?? schema.type;
    // return schema.type;
  }

  if (schema.type === "array") {
    return schema.xml?.name ?? schema.type;
    // return schema.type;
  }

  if (Array.isArray(schema.type)) {
    return schema.type.join(" | ");
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

  if (
    schema.items &&
    schema.minItems === undefined &&
    schema.maxItems === undefined
  ) {
    return getQualifierMessage(schema.items);
  }

  let message = `**${translate({
    id: OPENAPI_SCHEMA_ITEM.POSSIBLE_VALUES,
    message: "Possible values:",
  })}** `;

  let qualifierGroups = [];

  // Check for enum in array items (directly or inside allOf)
  if (schema.items) {
    const itemsEnum = getEnumFromSchema(schema.items as SchemaObject);
    if (itemsEnum) {
      qualifierGroups.push(
        `[${itemsEnum.map((e) => `\`${e}\``).join(", ")}]`
      );
    }
  }

  if (schema.minLength || schema.maxLength) {
    let lengthQualifier = "";
    let minLength;
    let maxLength;
    if (schema.minLength && schema.minLength > 1) {
      minLength = `\`>= ${schema.minLength} characters\``;
    }
    if (schema.minLength && schema.minLength === 1) {
      minLength = `\`non-empty\``;
    }
    if (schema.maxLength) {
      maxLength = `\`<= ${schema.maxLength} characters\``;
    }

    if (minLength && !maxLength) {
      lengthQualifier += minLength;
    }
    if (maxLength && !minLength) {
      lengthQualifier += maxLength;
    }
    if (minLength && maxLength) {
      lengthQualifier += `${minLength} and ${maxLength}`;
    }

    qualifierGroups.push(lengthQualifier);
  }

  if (
    schema.minimum != null ||
    schema.maximum != null ||
    typeof schema.exclusiveMinimum === "number" ||
    typeof schema.exclusiveMaximum === "number"
  ) {
    let minmaxQualifier = "";
    let minimum;
    let maximum;
    if (typeof schema.exclusiveMinimum === "number") {
      minimum = `\`> ${schema.exclusiveMinimum}\``;
    } else if (schema.minimum != null && !schema.exclusiveMinimum) {
      minimum = `\`>= ${schema.minimum}\``;
    } else if (schema.minimum != null && schema.exclusiveMinimum === true) {
      minimum = `\`> ${schema.minimum}\``;
    }
    if (typeof schema.exclusiveMaximum === "number") {
      maximum = `\`< ${schema.exclusiveMaximum}\``;
    } else if (schema.maximum != null && !schema.exclusiveMaximum) {
      maximum = `\`<= ${schema.maximum}\``;
    } else if (schema.maximum != null && schema.exclusiveMaximum === true) {
      maximum = `\`< ${schema.maximum}\``;
    }

    if (minimum && !maximum) {
      minmaxQualifier += minimum;
    }
    if (maximum && !minimum) {
      minmaxQualifier += maximum;
    }
    if (minimum && maximum) {
      minmaxQualifier += `${minimum} and ${maximum}`;
    }

    qualifierGroups.push(minmaxQualifier);
  }

  if (schema.pattern) {
    qualifierGroups.push(
      `Value must match regular expression \`${schema.pattern}\``
    );
  }

  // Check if discriminator mapping
  const discriminator = schema as any;
  if (discriminator.mapping) {
    const values = Object.keys(discriminator.mapping);
    qualifierGroups.push(`[${values.map((e) => `\`${e}\``).join(", ")}]`);
  }

  // Check for enum directly on schema or inside allOf
  const schemaEnum = getEnumFromSchema(schema);
  if (schemaEnum) {
    qualifierGroups.push(`[${schemaEnum.map((e) => `\`${e}\``).join(", ")}]`);
  }

  if (schema.minItems) {
    qualifierGroups.push(`\`>= ${schema.minItems}\``);
  }

  if (schema.maxItems) {
    qualifierGroups.push(`\`<= ${schema.maxItems}\``);
  }

  if (qualifierGroups.length === 0) {
    return undefined;
  }

  return message + qualifierGroups.join(", ");
}
