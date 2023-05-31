/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { SchemaObject } from "../openapi/types";
import {
  createClosingArrayBracket,
  createOpeningArrayBracket,
} from "./createArrayBracket";
import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { getQualifierMessage, getSchemaName } from "./schema";
import { create, guard } from "./utils";

const jsonSchemaMergeAllOf = require("json-schema-merge-allof");

/**
 * Returns a merged representation of allOf array of schemas.
 */
export function mergeAllOf(allOf: SchemaObject[]) {
  const mergedSchemas = jsonSchemaMergeAllOf(allOf, {
    resolvers: {
      readOnly: function () {
        return true;
      },
      example: function () {
        return true;
      },
      "x-examples": function () {
        return true;
      },
    },
    ignoreAdditionalProperties: true,
  });

  const required = allOf.reduce((acc, cur) => {
    if (Array.isArray(cur.required)) {
      const next = [...acc, ...cur.required];
      return next;
    }
    return acc;
  }, [] as any);

  return { mergedSchemas, required };
}

/**
 * For handling nested anyOf/oneOf.
 */
function createAnyOneOf(schema: SchemaObject): any {
  const type = schema.oneOf ? "oneOf" : "anyOf";
  return create("div", {
    children: [
      create("span", {
        className: "badge badge--info",
        children: type,
      }),
      create("SchemaTabs", {
        children: schema[type]!.map((anyOneSchema, index) => {
          const label = anyOneSchema.title
            ? anyOneSchema.title
            : `MOD${index + 1}`;
          const anyOneChildren = [];

          if (anyOneSchema.properties !== undefined) {
            anyOneChildren.push(createProperties(anyOneSchema));
            delete anyOneSchema.properties;
          }

          if (anyOneSchema.allOf !== undefined) {
            anyOneChildren.push(createNodes(anyOneSchema));
            delete anyOneSchema.allOf;
          }

          if (anyOneSchema.items !== undefined) {
            anyOneChildren.push(createItems(anyOneSchema));
            delete anyOneSchema.items;
          }

          if (
            anyOneSchema.type === "string" ||
            anyOneSchema.type === "number" ||
            anyOneSchema.type === "integer" ||
            anyOneSchema.type === "boolean"
          ) {
            anyOneChildren.push(createNodes(anyOneSchema));
          }
          if (anyOneChildren.length) {
            if (schema.type === "array") {
              return create("TabItem", {
                label: label,
                value: `${index}-item-properties`,
                children: [
                  createOpeningArrayBracket(),
                  anyOneChildren,
                  createClosingArrayBracket(),
                ]
                  .filter(Boolean)
                  .flat(),
              });
            }
            return create("TabItem", {
              label: label,
              value: `${index}-item-properties`,
              children: anyOneChildren.filter(Boolean).flat(),
            });
          }

          return undefined;
        }),
      }),
    ],
  });
}

/**
 * For handling properties.
 */
function createProperties(schema: SchemaObject) {
  const discriminator = schema.discriminator;
  return Object.entries(schema.properties!).map(([key, val]) => {
    return createEdges({
      name: key,
      schema: val,
      required: Array.isArray(schema.required)
        ? schema.required.includes(key)
        : false,
      discriminator,
    });
  });
}

/**
 * For handling additionalProperties.
 */
function createAdditionalProperties(schema: SchemaObject) {
  const additionalProperties = schema.additionalProperties;
  const type: string | unknown = additionalProperties?.type;
  // Handle free-form objects
  if (String(additionalProperties) === "true" && schema.type === "object") {
    return create("SchemaItem", {
      name: "property name*",
      required: false,
      schemaName: "any",
      qualifierMessage: getQualifierMessage(schema.additionalProperties),
      schema: schema,
      collapsible: false,
      discriminator: false,
    });
  }
  if (
    (type === "object" || type === "array") &&
    (additionalProperties?.properties ||
      additionalProperties?.items ||
      additionalProperties?.allOf ||
      additionalProperties?.additionalProperties ||
      additionalProperties?.oneOf ||
      additionalProperties?.anyOf)
  ) {
    const title = additionalProperties.title as string;
    const schemaName = getSchemaName(additionalProperties);
    const required = schema.required ?? false;
    return createDetailsNode(
      "property name*",
      title ?? schemaName,
      additionalProperties,
      required,
      schema.nullable
    );
  }

  if (
    (schema.additionalProperties?.type as string) === "string" ||
    (schema.additionalProperties?.type as string) === "object" ||
    (schema.additionalProperties?.type as string) === "boolean" ||
    (schema.additionalProperties?.type as string) === "integer" ||
    (schema.additionalProperties?.type as string) === "number"
  ) {
    const additionalProperties =
      schema.additionalProperties?.additionalProperties;
    if (additionalProperties !== undefined) {
      const type = schema.additionalProperties?.additionalProperties?.type;
      const schemaName = getSchemaName(
        schema.additionalProperties?.additionalProperties!
      );
      return create("SchemaItem", {
        name: "property name*",
        required: false,
        schemaName: schemaName ?? type,
        qualifierMessage:
          schema.additionalProperties ??
          getQualifierMessage(schema.additionalProperties),
        schema: schema,
        collapsible: false,
        discriminator: false,
      });
    }
    const schemaName = getSchemaName(schema.additionalProperties!);
    return create("SchemaItem", {
      name: "property name*",
      required: false,
      schemaName: schemaName,
      qualifierMessage: getQualifierMessage(schema),
      schema: schema.additionalProperties,
      collapsible: false,
      discriminator: false,
    });
  }
  return Object.entries(schema.additionalProperties!).map(([key, val]) =>
    createEdges({
      name: key,
      schema: val,
      required: Array.isArray(schema.required)
        ? schema.required.includes(key)
        : false,
    })
  );
}

/**
 * For handling items.
 */
function createItems(schema: SchemaObject) {
  if (schema.items?.properties !== undefined) {
    return [
      createOpeningArrayBracket(),
      createProperties(schema.items),
      createClosingArrayBracket(),
    ].flat();
  }

  if (schema.items?.additionalProperties !== undefined) {
    return [
      createOpeningArrayBracket(),
      createAdditionalProperties(schema.items),
      createClosingArrayBracket(),
    ].flat();
  }

  if (schema.items?.oneOf !== undefined || schema.items?.anyOf !== undefined) {
    return [
      createOpeningArrayBracket(),
      createAnyOneOf(schema.items!),
      createClosingArrayBracket(),
    ].flat();
  }

  if (schema.items?.allOf !== undefined) {
    // TODO: figure out if and how we should pass merged required array
    const {
      mergedSchemas,
    }: { mergedSchemas: SchemaObject; required: string[] } = mergeAllOf(
      schema.items?.allOf
    );

    // Handles combo anyOf/oneOf + properties
    if (
      (mergedSchemas.oneOf !== undefined ||
        mergedSchemas.anyOf !== undefined) &&
      mergedSchemas.properties
    ) {
      return [
        createOpeningArrayBracket(),
        createAnyOneOf(mergedSchemas),
        createProperties(mergedSchemas),
        createClosingArrayBracket(),
      ].flat();
    }

    // Handles only anyOf/oneOf
    if (
      mergedSchemas.oneOf !== undefined ||
      mergedSchemas.anyOf !== undefined
    ) {
      return [
        createOpeningArrayBracket(),
        createAnyOneOf(mergedSchemas),
        createClosingArrayBracket(),
      ].flat();
    }

    // Handles properties
    if (mergedSchemas.properties !== undefined) {
      return [
        createOpeningArrayBracket(),
        createProperties(mergedSchemas),
        createClosingArrayBracket(),
      ].flat();
    }
  }

  if (
    schema.items?.type === "string" ||
    schema.items?.type === "number" ||
    schema.items?.type === "integer" ||
    schema.items?.type === "boolean" ||
    schema.items?.type === "object"
  ) {
    return [
      createOpeningArrayBracket(),
      createNodes(schema.items),
      createClosingArrayBracket(),
    ].flat();
  }

  // TODO: clean this up or eliminate it?
  return [
    createOpeningArrayBracket(),
    Object.entries(schema.items!).map(([key, val]) =>
      createEdges({
        name: key,
        schema: val,
        required: Array.isArray(schema.required)
          ? schema.required.includes(key)
          : false,
      })
    ),
    createClosingArrayBracket(),
  ].flat();
}

/**
 * For handling nested properties.
 */
function createDetailsNode(
  name: string,
  schemaName: string,
  schema: SchemaObject,
  required: string[] | boolean,
  nullable: boolean | unknown
): any {
  return create("SchemaItem", {
    collapsible: true,
    className: "schemaItem",
    children: [
      createDetails({
        children: [
          createDetailsSummary({
            children: [
              create("strong", { children: name }),
              create("span", {
                style: { opacity: "0.6" },
                children: ` ${schemaName}`,
              }),
              guard(
                (schema.nullable && schema.nullable === true) ||
                  (nullable && nullable === true),
                () => [
                  create("strong", {
                    style: {
                      fontSize: "var(--ifm-code-font-size)",
                      color: "var(--openapi-nullable)",
                    },
                    children: " nullable",
                  }),
                ]
              ),
              guard(
                Array.isArray(required)
                  ? required.includes(name)
                  : required === true,
                () => [
                  create("strong", {
                    style: {
                      fontSize: "var(--ifm-code-font-size)",
                      color: "var(--openapi-required)",
                    },
                    children: " required",
                  }),
                ]
              ),
            ],
          }),
          create("div", {
            style: { marginLeft: "1rem" },
            children: [
              guard(getQualifierMessage(schema), (message) =>
                create("div", {
                  style: { marginTop: ".5rem", marginBottom: ".5rem" },
                  children: createDescription(message),
                })
              ),
              guard(schema.description, (description) =>
                create("div", {
                  style: { marginTop: ".5rem", marginBottom: ".5rem" },
                  children: createDescription(description),
                })
              ),
              createNodes(schema),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * For handling anyOf/oneOf properties.
 */
function createAnyOneOfProperty(
  name: string,
  schemaName: string,
  schema: SchemaObject,
  required: string[] | boolean,
  nullable: boolean | unknown
): any {
  const type = schema.oneOf ? "oneOf" : "anyOf";
  const children = schema[type] || [];
  return create("SchemaItem", {
    collapsible: true,
    className: "schemaItem",
    children: [
      createDetails({
        children: [
          createDetailsSummary({
            children: [
              create("strong", { children: name }),
              create("span", {
                style: { opacity: "0.6" },
                children: ` ${schemaName}`,
              }),
              guard(
                (schema.nullable && schema.nullable === true) ||
                  (nullable && nullable === true),
                () => [
                  create("strong", {
                    style: {
                      fontSize: "var(--ifm-code-font-size)",
                      color: "var(--openapi-nullable)",
                    },
                    children: " nullable",
                  }),
                ]
              ),
              guard(
                Array.isArray(required)
                  ? required.includes(name)
                  : required === true,
                () => [
                  create("strong", {
                    style: {
                      fontSize: "var(--ifm-code-font-size)",
                      color: "var(--openapi-required)",
                    },
                    children: " required",
                  }),
                ]
              ),
            ],
          }),
          create("div", {
            style: { marginLeft: "1rem" },
            children: [
              guard(getQualifierMessage(schema), (message) =>
                create("div", {
                  style: { marginTop: ".5rem", marginBottom: ".5rem" },
                  children: createDescription(message),
                })
              ),
              guard(schema.description, (description) =>
                create("div", {
                  style: { marginTop: ".5rem", marginBottom: ".5rem" },
                  children: createDescription(description),
                })
              ),
            ],
          }),
          create("div", {
            children: [
              create("span", {
                className: "badge badge--info",
                children: type,
              }),
              create("SchemaTabs", {
                children: children.map((property, index) => {
                  const label = property.title ?? `MOD${index + 1}`;
                  if (property.properties) {
                    return create("TabItem", {
                      label: label,
                      value: `${index}-property`,
                      children: [createNodes(property)],
                    });
                  }
                  return create("TabItem", {
                    label: label,
                    value: `${index}-property`,
                    children: [
                      create("p", { children: label }),
                      guard(schema.description, (description) =>
                        create("div", {
                          style: { marginTop: ".5rem", marginBottom: ".5rem" },
                          children: createDescription(description),
                        })
                      ),
                    ],
                  });
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * For handling discriminators that map to a same-level property (like 'petType').
 * Note: These should only be encountered while iterating through properties.
 */
function createPropertyDiscriminator(
  name: string,
  schemaName: string,
  schema: SchemaObject,
  discriminator: any,
  required: string[] | boolean
) {
  if (schema === undefined) {
    return undefined;
  }

  if (discriminator.mapping === undefined) {
    return undefined;
  }

  return create("SchemaItem", {
    name,
    required: Array.isArray(required) ? required.includes(name) : required,
    schemaName: schemaName,
    qualifierMessage: getQualifierMessage(schema),
    schema: schema,
    collapsible: false,
    discriminator: true,
    children: [
      create("DiscriminatorTabs", {
        children: Object.keys(discriminator?.mapping!).map((key, index) => {
          const label = key;
          return create("TabItem", {
            label: label,
            value: `${index}-item-discriminator`,
            children: createNodes(discriminator?.mapping[key]),
          });
        }),
      }),
    ],
  });
}

interface EdgeProps {
  name: string;
  schema: SchemaObject;
  required: string[] | boolean;
  discriminator?: any | unknown;
}

/**
 * Creates the edges or "leaves" of a schema tree. Edges can branch into sub-nodes with createDetails().
 */
function createEdges({
  name,
  schema,
  required,
  discriminator,
}: EdgeProps): any {
  const schemaName = getSchemaName(schema);

  if (discriminator !== undefined && discriminator.propertyName === name) {
    return createPropertyDiscriminator(
      name,
      "string",
      schema,
      discriminator,
      required
    );
  }

  if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
    return createAnyOneOfProperty(
      name,
      schemaName,
      schema,
      required,
      schema.nullable
    );
  }

  if (schema.allOf !== undefined) {
    const {
      mergedSchemas,
      required,
    }: { mergedSchemas: SchemaObject; required: string[] | boolean } =
      mergeAllOf(schema.allOf);
    const mergedSchemaName = getSchemaName(mergedSchemas);

    if (
      mergedSchemas.oneOf !== undefined ||
      mergedSchemas.anyOf !== undefined
    ) {
      return createDetailsNode(
        name,
        mergedSchemaName,
        mergedSchemas,
        required,
        schema.nullable
      );
    }

    if (mergedSchemas.properties !== undefined) {
      return createDetailsNode(
        name,
        mergedSchemaName,
        mergedSchemas,
        required,
        schema.nullable
      );
    }

    if (mergedSchemas.additionalProperties !== undefined) {
      return createDetailsNode(
        name,
        mergedSchemaName,
        mergedSchemas,
        required,
        schema.nullable
      );
    }

    // array of objects
    if (mergedSchemas.items?.properties !== undefined) {
      return createDetailsNode(
        name,
        mergedSchemaName,
        mergedSchemas,
        required,
        schema.nullable
      );
    }

    if (mergedSchemas.readOnly && mergedSchemas.readOnly === true) {
      return undefined;
    }

    return create("SchemaItem", {
      collapsible: false,
      name,
      required: Array.isArray(required) ? required.includes(name) : required,
      schemaName: schemaName,
      qualifierMessage: getQualifierMessage(schema),
      schema: mergedSchemas,
    });
  }

  if (schema.properties !== undefined) {
    return createDetailsNode(
      name,
      schemaName,
      schema,
      required,
      schema.nullable
    );
  }

  if (schema.additionalProperties !== undefined) {
    return createDetailsNode(
      name,
      schemaName,
      schema,
      required,
      schema.nullable
    );
  }

  // array of objects
  if (schema.items?.properties !== undefined) {
    return createDetailsNode(
      name,
      schemaName,
      schema,
      required,
      schema.nullable
    );
  }

  if (schema.items?.anyOf !== undefined || schema.items?.oneOf !== undefined) {
    return createDetailsNode(
      name,
      schemaName,
      schema,
      required,
      schema.nullable
    );
  }

  if (schema.readOnly && schema.readOnly === true) {
    return undefined;
  }

  // primitives and array of non-objects
  return create("SchemaItem", {
    collapsible: false,
    name,
    required: Array.isArray(required) ? required.includes(name) : required,
    schemaName: schemaName,
    qualifierMessage: getQualifierMessage(schema),
    schema: schema,
  });
}

/**
 * Creates a hierarchical level of a schema tree. Nodes produce edges that can branch into sub-nodes with edges, recursively.
 */
export function createNodes(schema: SchemaObject): any {
  const nodes = [];
  // if (schema.discriminator !== undefined) {
  //   return createDiscriminator(schema);
  // }

  if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
    nodes.push(createAnyOneOf(schema));
  }

  if (schema.allOf !== undefined) {
    const { mergedSchemas } = mergeAllOf(schema.allOf);

    // allOf seems to always result in properties
    if (mergedSchemas.properties !== undefined) {
      nodes.push(createProperties(mergedSchemas));
    }
  }

  if (schema.properties !== undefined) {
    nodes.push(createProperties(schema));
  }

  if (schema.additionalProperties !== undefined) {
    nodes.push(createAdditionalProperties(schema));
  }

  // TODO: figure out how to handle array of objects
  if (schema.items !== undefined) {
    nodes.push(createItems(schema));
  }

  if (nodes.length && nodes.length > 0) {
    return nodes.filter(Boolean).flat();
  }

  // primitive
  if (schema.type !== undefined) {
    if (schema.allOf) {
      //handle circular result in allOf
      if (schema.allOf.length && typeof schema.allOf[0] === "string") {
        return create("div", {
          style: {
            marginTop: ".5rem",
            marginBottom: ".5rem",
            marginLeft: "1rem",
          },
          children: createDescription(schema.allOf[0]),
        });
      }
    }
    return create("div", {
      style: {
        marginTop: ".5rem",
        marginBottom: ".5rem",
        marginLeft: "1rem",
      },
      children: createDescription(schema.type),
    });
  }

  // handle circular references
  if (typeof schema === "string") {
    return create("div", {
      style: {
        marginTop: ".5rem",
        marginBottom: ".5rem",
        marginLeft: "1rem",
      },
      children: [createDescription(schema)],
    });
  }

  // Unknown node/schema type should return undefined
  // So far, haven't seen this hit in testing
  return "any";
}
