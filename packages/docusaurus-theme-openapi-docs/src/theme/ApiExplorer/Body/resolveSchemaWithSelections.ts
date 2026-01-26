/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { SchemaObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import merge from "lodash/merge";

export interface SchemaSelections {
  [schemaPath: string]: number;
}

/**
 * Resolves a schema by replacing anyOf/oneOf with the selected option based on user selections.
 *
 * @param schema - The original schema object
 * @param selections - Map of schema paths to selected indices
 * @param basePath - The base path for this schema (used for looking up selections)
 * @returns A new schema with anyOf/oneOf resolved to selected options
 */
export function resolveSchemaWithSelections(
  schema: SchemaObject | undefined,
  selections: SchemaSelections,
  basePath: string = "requestBody"
): SchemaObject | undefined {
  if (!schema) {
    return schema;
  }

  // Deep clone to avoid mutating the original schema
  const schemaCopy = JSON.parse(JSON.stringify(schema)) as SchemaObject;

  return resolveSchemaRecursive(schemaCopy, selections, basePath);
}

function resolveSchemaRecursive(
  schema: SchemaObject,
  selections: SchemaSelections,
  currentPath: string
): SchemaObject {
  // Handle oneOf
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const selectedIndex = selections[currentPath] ?? 0;
    const selectedSchema = schema.oneOf[selectedIndex] as SchemaObject;

    if (selectedSchema) {
      // If there are shared properties, merge them with the selected schema
      if (schema.properties) {
        const mergedSchema = merge({}, schema, selectedSchema);
        delete mergedSchema.oneOf;

        // Continue resolving nested schemas in the merged result
        return resolveSchemaRecursive(
          mergedSchema,
          selections,
          `${currentPath}.${selectedIndex}`
        );
      }

      // No shared properties, just use the selected schema
      // Continue resolving in case there are nested anyOf/oneOf
      return resolveSchemaRecursive(
        selectedSchema,
        selections,
        `${currentPath}.${selectedIndex}`
      );
    }
  }

  // Handle anyOf
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const selectedIndex = selections[currentPath] ?? 0;
    const selectedSchema = schema.anyOf[selectedIndex] as SchemaObject;

    if (selectedSchema) {
      // If there are shared properties, merge them with the selected schema
      if (schema.properties) {
        const mergedSchema = merge({}, schema, selectedSchema);
        delete mergedSchema.anyOf;

        // Continue resolving nested schemas in the merged result
        return resolveSchemaRecursive(
          mergedSchema,
          selections,
          `${currentPath}.${selectedIndex}`
        );
      }

      // No shared properties, just use the selected schema
      // Continue resolving in case there are nested anyOf/oneOf
      return resolveSchemaRecursive(
        selectedSchema,
        selections,
        `${currentPath}.${selectedIndex}`
      );
    }
  }

  // Handle allOf - merge all schemas and continue resolving
  if (schema.allOf && Array.isArray(schema.allOf)) {
    // Process each allOf item, resolving any anyOf/oneOf within them
    const resolvedItems = schema.allOf.map((item, index) => {
      return resolveSchemaRecursive(
        item as SchemaObject,
        selections,
        `${currentPath}.allOf.${index}`
      );
    });

    // Merge all resolved items
    const mergedSchema = resolvedItems.reduce(
      (acc, item) => merge(acc, item),
      {} as SchemaObject
    );

    // Preserve any top-level properties from the original schema
    if (schema.properties) {
      mergedSchema.properties = merge(
        {},
        mergedSchema.properties,
        schema.properties
      );
    }

    return mergedSchema;
  }

  // Handle object properties recursively
  if (schema.properties) {
    const resolvedProperties: { [key: string]: SchemaObject } = {};

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      resolvedProperties[propName] = resolveSchemaRecursive(
        propSchema as SchemaObject,
        selections,
        `${currentPath}.${propName}`
      );
    }

    schema.properties = resolvedProperties;
  }

  // Handle array items recursively
  if (schema.items) {
    schema.items = resolveSchemaRecursive(
      schema.items as SchemaObject,
      selections,
      `${currentPath}.items`
    );
  }

  return schema;
}
