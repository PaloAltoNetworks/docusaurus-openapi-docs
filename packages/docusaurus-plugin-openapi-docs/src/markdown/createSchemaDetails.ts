/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { MediaTypeObject, SchemaObject } from "../openapi/types";
import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { getQualifierMessage, getSchemaName } from "./schema";
import { create, guard } from "./utils";

const jsonSchemaMergeAllOf = require("json-schema-merge-allof");

/**
 * Returns a merged representation of allOf array of schemas.
 */
function mergeAllOf(allOf: SchemaObject[]) {
  const mergedSchemas = jsonSchemaMergeAllOf(allOf, {
    resolvers: {
      readOnly: function () {
        return true;
      },
      example: function () {
        return true;
      },
    },
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

function createAnyOneOf(
  name: string,
  schemaName: string,
  schema: SchemaObject,
  required: any
): any {
  const type = schema.oneOf ? "oneOf" : "anyOf";
  return create("div", {
    children: [
      create("SchemaItem", {
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
                  guard(required, () => [
                    create("strong", {
                      style: {
                        fontSize: "var(--ifm-code-font-size)",
                        color: "var(--openapi-required)",
                      },
                      children: " required",
                    }),
                  ]),
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
                  create("span", {
                    className: "badge badge--info",
                    children: type,
                  }),
                  create("SchemaTabs", {
                    children: schema[type]!.map((anyOneSchema, index) => {
                      const label = anyOneSchema.title
                        ? anyOneSchema.title
                        : `MOD${index + 1}`;

                      if (anyOneSchema.properties !== undefined) {
                        return create("TabItem", {
                          label: label,
                          value: `${index}-properties`,
                          children: [createNodes(anyOneSchema)],
                        });
                      }

                      if (anyOneSchema.allOf !== undefined) {
                        return create("TabItem", {
                          label: label,
                          value: `${index}-allOf`,
                          children: [createNodes(anyOneSchema)],
                        });
                      }

                      if (anyOneSchema.items !== undefined) {
                        if (anyOneSchema.items.properties !== undefined) {
                          return create("TabItem", {
                            label: label,
                            value: `${index}-item-properties`,
                            children: [createNodes(anyOneSchema.items)],
                          });
                        }

                        if (
                          anyOneSchema.items.anyOf !== undefined ||
                          anyOneSchema.items.oneOf !== undefined
                        ) {
                          return create("TabItem", {
                            label: label,
                            value: `${index}-anyOneOf`,
                            children: [
                              createNestedAnyOneOf(anyOneSchema.items),
                            ],
                          });
                        }
                      }

                      return undefined;
                    }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * For handling nested anyOf/oneOf.
 */
function createNestedAnyOneOf(schema: SchemaObject): any {
  const type = schema.oneOf ? "oneOf" : "anyOf";
  return create("li", {
    children: [
      create("div", {
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
          create("span", {
            className: "badge badge--info",
            children: type,
          }),
          create("SchemaTabs", {
            children: schema[type]!.map((anyOneSchema, index) => {
              const label = anyOneSchema.title
                ? anyOneSchema.title
                : `MOD${index + 1}`;

              if (anyOneSchema.properties !== undefined) {
                return create("TabItem", {
                  label: label,
                  value: `${index}-properties`,
                  children: [createNodes(anyOneSchema)],
                });
              }

              if (anyOneSchema.allOf !== undefined) {
                return create("TabItem", {
                  label: label,
                  value: `${index}-allOf`,
                  children: [createNodes(anyOneSchema)],
                });
              }

              if (anyOneSchema.items !== undefined) {
                if (anyOneSchema.items.properties !== undefined) {
                  return create("TabItem", {
                    label: label,
                    value: `${index}-item-properties`,
                    children: [createNodes(anyOneSchema.items)],
                  });
                }
              }

              return undefined;
            }),
          }),
        ],
      }),
    ],
  });
}

function createProperties(schema: SchemaObject) {
  return Object.entries(schema.properties!).map(([key, val]) =>
    createEdges({
      name: key,
      schema: val,
      required: Array.isArray(schema.required)
        ? schema.required.includes(key)
        : false,
    })
  );
}

// TODO: figure out how to handle array of objects
function createItems(schema: SchemaObject) {
  // if (schema.items?.properties !== undefined) {
  //   return createProperties(schema.items);
  // }
  // if (schema.items?.anyOf !== undefined) {
  //   console.log(schema, schema.items.anyOf);
  // }
  if (schema.items?.allOf !== undefined) {
    const { mergedSchemas }: { mergedSchemas: SchemaObject; required: any } =
      mergeAllOf(schema.items?.allOf);

    // Handles combo anyOf/oneOf + properties
    if (
      (mergedSchemas.oneOf !== undefined ||
        mergedSchemas.anyOf !== undefined) &&
      mergedSchemas.properties
    ) {
      return create("div", {
        children: [
          createNestedAnyOneOf(mergedSchemas),
          createProperties(mergedSchemas),
        ],
      });
    }

    // Handles only anyOf/oneOf
    if (
      mergedSchemas.oneOf !== undefined ||
      mergedSchemas.anyOf !== undefined
    ) {
      return create("div", {
        children: [
          createNestedAnyOneOf(mergedSchemas),
          createProperties(mergedSchemas),
        ],
      });
    }
  }

  // TODO: clean this up or eliminate it?
  return Object.entries(schema.items!).map(([key, val]) =>
    createEdges({
      name: key,
      schema: val,
      required: Array.isArray(schema.required)
        ? schema.required.includes(key)
        : false,
    })
  );
}

function createDetailsNode({ name, schemaName, schema, required }: any) {
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
              guard(required, () => [
                create("strong", {
                  style: {
                    fontSize: "var(--ifm-code-font-size)",
                    color: "var(--openapi-required)",
                  },
                  children: " required",
                }),
              ]),
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

interface EdgeProps {
  name: string;
  schema: SchemaObject;
  required: boolean;
}

/**
 * Creates the edges or "leaves" of a schema tree. Edges can branch into sub-nodes with createDetails().
 */
function createEdges({ name, schema, required }: EdgeProps): any {
  const schemaName = getSchemaName(schema);

  if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
    return createAnyOneOf(name, schemaName, schema, required);
  }

  if (schema.allOf !== undefined) {
    const {
      mergedSchemas,
      required,
    }: { mergedSchemas: SchemaObject; required: any } = mergeAllOf(
      schema.allOf
    );
    const mergedSchemaName = getSchemaName(mergedSchemas);

    if (
      mergedSchemas.oneOf !== undefined ||
      mergedSchemas.anyOf !== undefined
    ) {
      return createAnyOneOf(name, mergedSchemaName, mergedSchemas, required);
    }

    if (mergedSchemas.properties !== undefined) {
      return createDetailsNode({
        name: name,
        schemaName: mergedSchemaName,
        schema: mergedSchemas,
        required: required,
      });
    }

    return create("SchemaItem", {
      collapsible: false,
      name,
      required,
      schemaDescription: mergedSchemas.description,
      schemaName: schemaName,
      qualifierMessage: getQualifierMessage(schema),
    });
  }

  // object
  if (schema.properties !== undefined) {
    return createDetailsNode({
      name: name,
      schemaName: schemaName,
      schema: schema,
      required: required,
    });
  }

  // array of objects
  if (schema.items?.properties !== undefined) {
    return createDetailsNode({
      name: name,
      schemaName: schemaName,
      schema: schema.items,
      required: required,
    });
  }

  // primitives and array of non-objects
  return create("SchemaItem", {
    collapsible: false,
    name,
    required,
    schemaDescription: schema.description,
    schemaName: schemaName,
    qualifierMessage: getQualifierMessage(schema),
  });
}

/**
 * Creates a hierarchical level of a schema tree. Nodes produce edges that can branch into sub-nodes with edges, recursively.
 */
function createNodes(schema: SchemaObject): any {
  if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
    return createNestedAnyOneOf(schema);
  }

  if (schema.allOf !== undefined) {
    const { mergedSchemas } = mergeAllOf(schema.allOf);

    // allOf seems to always result in properties
    if (mergedSchemas.properties !== undefined) {
      return createProperties(mergedSchemas);
    }
  }

  if (schema.properties !== undefined) {
    return createProperties(schema);
  }

  // TODO: figure out how to handle array of objects
  if (schema.items !== undefined) {
    return createItems(schema);
  }

  // primitive
  if (schema.type !== undefined) {
    return create("li", {
      children: create("div", {
        children: [
          create("strong", { children: schema.type }),
          guard(schema.format, (format) =>
            create("span", {
              style: { opacity: "0.6" },
              children: ` ${format}`,
            })
          ),
          guard(getQualifierMessage(schema), (message) =>
            create("div", {
              style: { marginTop: "var(--ifm-table-cell-padding)" },
              children: createDescription(message),
            })
          ),
          guard(schema.description, (description) =>
            create("div", {
              style: { marginTop: "var(--ifm-table-cell-padding)" },
              children: createDescription(description),
            })
          ),
        ],
      }),
    });
  }

  // Unknown node/schema type should return undefined
  // So far, haven't seen this hit in testing
  return undefined;
}

interface Props {
  style?: any;
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: boolean;
  };
}

export function createSchemaDetails({ title, body, ...rest }: Props) {
  if (
    body === undefined ||
    body.content === undefined ||
    Object.keys(body).length === 0 ||
    Object.keys(body.content).length === 0
  ) {
    return undefined;
  }

  // NOTE: We just pick a random content-type.
  // How common is it to have multiple?
  const randomFirstKey = Object.keys(body.content)[0];
  const firstBody = body.content[randomFirstKey].schema;

  if (firstBody === undefined) {
    return undefined;
  }

  // we don't show the table if there is no properties to show
  if (firstBody.properties !== undefined) {
    if (Object.keys(firstBody.properties).length === 0) {
      return undefined;
    }
  }

  // Root-level schema dropdown
  return createDetails({
    "data-collapsed": false,
    open: true,
    ...rest,
    children: [
      createDetailsSummary({
        style: { textAlign: "left" },
        children: [
          create("strong", { children: `${title}` }),
          guard(firstBody.type === "array", (format) =>
            create("span", {
              style: { opacity: "0.6" },
              children: ` array`,
            })
          ),
          guard(body.required, () => [
            create("strong", {
              style: {
                fontSize: "var(--ifm-code-font-size)",
                color: "var(--openapi-required)",
              },
              children: " required",
            }),
          ]),
        ],
      }),
      create("div", {
        style: { textAlign: "left", marginLeft: "1rem" },
        children: [
          guard(body.description, () => [
            create("div", {
              style: { marginTop: "1rem", marginBottom: "1rem" },
              children: createDescription(body.description),
            }),
          ]),
        ],
      }),
      create("ul", {
        style: { marginLeft: "1rem" },
        children: createNodes(firstBody),
      }),
    ],
  });
}
