/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// eslint-disable-next-line import/no-extraneous-dependencies
import { merge } from "allof-merge";
import clsx from "clsx";

import {
  createClosingArrayBracket,
  createOpeningArrayBracket,
} from "./createArrayBracket";
import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { getSchemaName } from "./schema";
import { create, guard } from "./utils";
import { SchemaObject } from "../openapi/types";

let SCHEMA_TYPE: "request" | "response";

/**
 * Strip `additionalProperties: false` from sibling allOf members so the
 * strict-AND semantics of `allof-merge` don't collapse the result to an
 * unsatisfiable empty schema.
 *
 * Per JSON Schema, two allOf members that each set `additionalProperties: false`
 * with disjoint `properties` sets define an unsatisfiable schema (no value can
 * satisfy both — each member rejects the other's properties). `allof-merge` is
 * technically correct to drop all properties in that case, but it leaves the
 * rendered schema blank.
 *
 * NSwag and Swashbuckle emit this pattern by default whenever a model uses
 * inheritance/composition, so it's the dominant style for .NET-generated specs.
 * Redoc, Swagger UI, and Stoplight all union the properties and ignore the
 * conflicting flag — the approach this helper emulates by stripping the flag
 * before delegating to `allof-merge`. The flag is render-irrelevant anyway:
 * `additionalProperties: false` is treated identically to `undefined` by the
 * renderer (see AdditionalProperties in theme/Schema/index.tsx).
 *
 * Strips from every allOf member whenever the parent has ≥2 members. The
 * collapse triggers symmetrically (both siblings strict) or asymmetrically
 * (one strict member rejects another's properties as "additional"), so the
 * presence of multiple members is the right gate. Single-member allOf is left
 * alone — it can't conflict with anything.
 *
 * See https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1119
 */
function stripConflictingAdditionalProps(node: any): any {
  if (Array.isArray(node)) return node.map(stripConflictingAdditionalProps);
  if (!node || typeof node !== "object") return node;

  let working: any = node;
  if (Array.isArray(node.allOf) && node.allOf.length > 1) {
    const hasStrictMember = node.allOf.some(
      (m: any) => m && m.additionalProperties === false
    );
    if (hasStrictMember) {
      working = {
        ...node,
        allOf: node.allOf.map((m: any) => {
          if (m && m.additionalProperties === false) {
            const { additionalProperties: _drop, ...rest } = m;
            return rest;
          }
          return m;
        }),
      };
    }
  }

  const result: any = {};
  for (const [k, v] of Object.entries(working)) {
    result[k] = stripConflictingAdditionalProps(v);
  }
  return result;
}

/**
 * Returns a merged representation of allOf array of schemas.
 */
export function mergeAllOf(allOf: SchemaObject) {
  const onMergeError = (msg: string) => {
    console.warn(msg);
  };

  const mergedSchemas = merge(stripConflictingAdditionalProps(allOf), {
    onMergeError,
  }) as SchemaObject;
  return mergedSchemas ?? ({} as SchemaObject);
}

/**
 * Fold sibling fields into each `oneOf`/`anyOf` branch via allOf-merge, so each
 * branch is self-contained. Mirrors Redoc's `SchemaModel.initOneOf` behavior.
 * Without this, when an `allOf` override redefines a nested property with
 * `oneOf`, the merged schema ends up with both `properties` and `oneOf` as
 * siblings — and the renderer prints the shared properties twice.
 *
 * See https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1218
 */
function foldSiblingsIntoBranches(schema: SchemaObject): SchemaObject {
  const branchKey = schema.oneOf ? "oneOf" : schema.anyOf ? "anyOf" : undefined;
  if (!branchKey) return schema;

  const branches = (schema as any)[branchKey];
  if (!Array.isArray(branches) || branches.length === 0) return schema;

  const siblings: SchemaObject = { ...schema };
  delete (siblings as any)[branchKey];
  if (Object.keys(siblings).length === 0) return schema;

  const folded = branches.map((branch: SchemaObject) =>
    mergeAllOf({ allOf: [siblings, branch] } as SchemaObject)
  );

  return { [branchKey]: folded } as SchemaObject;
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
        style: { marginBottom: "1rem" },
      }),
      create("SchemaTabs", {
        children: schema[type]!.map((anyOneSchema, index) => {
          const label = anyOneSchema.title
            ? anyOneSchema.title
            : `MOD${index + 1}`;
          const anyOneChildren = [];

          if (anyOneSchema.description) {
            anyOneChildren.push(
              create("div", {
                style: { marginTop: ".5rem", marginBottom: ".5rem" },
                className: "openapi-schema__summary",
                children: createDescription(anyOneSchema.description),
              })
            );
          }

          if (
            anyOneSchema.type === "object" &&
            !anyOneSchema.properties &&
            !anyOneSchema.allOf &&
            !anyOneSchema.items
          ) {
            anyOneChildren.push(createNodes(anyOneSchema, SCHEMA_TYPE));
          }

          if (anyOneSchema.properties !== undefined) {
            anyOneChildren.push(createProperties(anyOneSchema));
            delete anyOneSchema.properties;
          }

          if (anyOneSchema.allOf !== undefined) {
            anyOneChildren.push(createNodes(anyOneSchema, SCHEMA_TYPE));
            delete anyOneSchema.allOf;
          }

          if (anyOneSchema.oneOf !== undefined) {
            anyOneChildren.push(createNodes(anyOneSchema, SCHEMA_TYPE));
            delete anyOneSchema.oneOf;
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
            anyOneChildren.push(createNodes(anyOneSchema, SCHEMA_TYPE));
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
  if (Object.keys(schema.properties!).length === 0) {
    return create("SchemaItem", {
      collapsible: false,
      name: "",
      required: false,
      schemaName: "object",
      schema: {},
    });
  }
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
  if (!additionalProperties) return [];

  // Handle free-form objects
  if (
    additionalProperties === true ||
    Object.keys(additionalProperties).length === 0
  ) {
    return create("SchemaItem", {
      name: "property name*",
      required: false,
      schemaName: "any",
      schema: schema,
      collapsible: false,
      discriminator: false,
    });
  }

  // objects, arrays, complex schemas
  if (
    additionalProperties.properties ||
    additionalProperties.items ||
    additionalProperties.allOf ||
    additionalProperties.additionalProperties ||
    additionalProperties.oneOf ||
    additionalProperties.anyOf
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

  // primitive types
  if (
    additionalProperties.type === "string" ||
    additionalProperties.type === "boolean" ||
    additionalProperties.type === "integer" ||
    additionalProperties.type === "number"
  ) {
    const schemaName = getSchemaName(additionalProperties);
    return create("SchemaItem", {
      name: "property name*",
      required: false,
      schemaName: schemaName,
      schema: additionalProperties,
      collapsible: false,
      discriminator: false,
    });
  }

  // unknown
  return [];
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
    const mergedSchemas = mergeAllOf(schema.items) as SchemaObject;

    // Handles combo anyOf/oneOf + properties — fold siblings into branches
    // to avoid duplicate property rendering. See issue #1218.
    if (
      (mergedSchemas.oneOf !== undefined ||
        mergedSchemas.anyOf !== undefined) &&
      mergedSchemas.properties
    ) {
      return [
        createOpeningArrayBracket(),
        createAnyOneOf(foldSiblingsIntoBranches(mergedSchemas)),
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
      createNodes(schema.items, SCHEMA_TYPE),
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
        className: "openapi-markdown__details",
        children: [
          createDetailsSummary({
            children: [
              create("span", {
                className: "openapi-schema__container",
                children: [
                  create("strong", {
                    className: clsx("openapi-schema__property", {
                      "openapi-schema__strikethrough": schema.deprecated,
                    }),
                    children: name,
                  }),
                  create("span", {
                    className: "openapi-schema__name",
                    children: ` ${schemaName}`,
                  }),
                  guard(
                    (Array.isArray(required)
                      ? required.includes(name)
                      : required === true) ||
                      schema.deprecated ||
                      nullable,
                    () => [
                      create("span", {
                        className: "openapi-schema__divider",
                      }),
                    ]
                  ),
                  guard(nullable, () => [
                    create("span", {
                      className: "openapi-schema__nullable",
                      children: "nullable",
                    }),
                  ]),
                  guard(
                    Array.isArray(required)
                      ? required.includes(name)
                      : required === true,
                    () => [
                      create("span", {
                        className: "openapi-schema__required",
                        children:
                          "<Translate id='theme.openapi.schemaItem.required'>required</Translate>",
                      }),
                    ]
                  ),
                  guard(schema.deprecated, () => [
                    create("span", {
                      className: "openapi-schema__deprecated",
                      children: "deprecated",
                    }),
                  ]),
                ],
              }),
            ],
          }),
          create("div", {
            style: { marginLeft: "1rem" },
            children: [
              guard(schema.description, (description) =>
                create("div", {
                  style: { marginTop: ".5rem", marginBottom: ".5rem" },
                  children: createDescription(description),
                })
              ),
              createNodes(schema, SCHEMA_TYPE),
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
// function createAnyOneOfProperty(
//   name: string,
//   schemaName: string,
//   schema: SchemaObject,
//   required: string[] | boolean,
//   nullable: boolean | unknown
// ): any {
//   return create("SchemaItem", {
//     collapsible: true,
//     className: "schemaItem",
//     children: [
//       createDetails({
//         className: "openapi-markdown__details",
//         children: [
//           createDetailsSummary({
//             children: [
//               create("strong", { children: name }),
//               create("span", {
//                 style: { opacity: "0.6" },
//                 children: ` ${schemaName}`,
//               }),
//               guard(
//                 (schema.nullable && schema.nullable === true) ||
//                   (nullable && nullable === true),
//                 () => [
//                   create("strong", {
//                     style: {
//                       fontSize: "var(--ifm-code-font-size)",
//                       color: "var(--openapi-nullable)",
//                     },
//                     children: " nullable",
//                   }),
//                 ]
//               ),
//               guard(
//                 Array.isArray(required)
//                   ? required.includes(name)
//                   : required === true,
//                 () => [
//                   create("strong", {
//                     style: {
//                       fontSize: "var(--ifm-code-font-size)",
//                       color: "var(--openapi-required)",
//                     },
//                     children: " required",
//                   }),
//                 ]
//               ),
//             ],
//           }),
//           create("div", {
//             style: { marginLeft: "1rem" },
//             children: [
//               guard(getQualifierMessage(schema), (message) =>
//                 create("div", {
//                   style: { marginTop: ".5rem", marginBottom: ".5rem" },
//                   children: createDescription(message),
//                 })
//               ),
//               guard(schema.description, (description) =>
//                 create("div", {
//                   style: { marginTop: ".5rem", marginBottom: ".5rem" },
//                   children: createDescription(description),
//                 })
//               ),
//             ],
//           }),
//           createAnyOneOf(schema),
//         ],
//       }),
//     ],
//   });
// }

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
): any {
  if (schema === undefined) {
    return undefined;
  }

  // render as a simple property if there's no mapping
  if (discriminator.mapping === undefined) {
    return createEdges({ name, schema, required });
  }

  return create("div", {
    className: "openapi-discriminator__item openapi-schema__list-item",
    children: create("div", {
      children: [
        create("span", {
          className: "openapi-schema__container",
          children: [
            create("strong", {
              className: "openapi-discriminator__name openapi-schema__property",
              children: name,
            }),
            guard(schemaName, (name) =>
              create("span", {
                className: "openapi-schema__name",
                children: ` ${schemaName}`,
              })
            ),
            guard(required, () => [
              create("span", {
                className: "openapi-schema__required",
                children:
                  "<Translate id='theme.openapi.schemaItem.required'>required</Translate>",
              }),
            ]),
          ],
        }),
        guard(schema.description, (description) =>
          create("div", {
            style: {
              paddingLeft: "1rem",
            },
            children: createDescription(description),
          })
        ),
        create("DiscriminatorTabs", {
          className: "openapi-tabs__discriminator",
          children: Object.keys(discriminator?.mapping!).map((key, index) => {
            const label = key;
            return create("TabItem", {
              // className: "openapi-tabs__discriminator-item",
              label: label,
              value: `${index}-item-discriminator`,
              children: [createNodes(discriminator?.mapping[key], SCHEMA_TYPE)],
            });
          }),
        }),
      ],
    }),
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
  if (SCHEMA_TYPE === "request") {
    if (schema.readOnly && schema.readOnly === true) {
      return undefined;
    }
  }

  if (SCHEMA_TYPE === "response") {
    if (schema.writeOnly && schema.writeOnly === true) {
      return undefined;
    }
  }

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
    return createDetailsNode(
      name,
      schemaName,
      schema,
      required,
      schema.nullable
    );
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

  if (schema.items?.allOf !== undefined) {
    const mergedSchemas = mergeAllOf(schema.items);

    if (SCHEMA_TYPE === "request") {
      if (mergedSchemas.readOnly && mergedSchemas.readOnly === true) {
        return undefined;
      }
    }

    if (SCHEMA_TYPE === "response") {
      if (mergedSchemas.writeOnly && mergedSchemas.writeOnly === true) {
        return undefined;
      }
    }

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
        mergedSchemas.nullable
      );
    }

    if (mergedSchemas.properties !== undefined) {
      return createDetailsNode(
        name,
        mergedSchemaName,
        mergedSchemas,
        required,
        mergedSchemas.nullable
      );
    }

    if (mergedSchemas.additionalProperties !== undefined) {
      return createDetailsNode(
        name,
        mergedSchemaName,
        mergedSchemas,
        required,
        mergedSchemas.nullable
      );
    }

    // array of objects
    if (mergedSchemas.items?.properties !== undefined) {
      return createDetailsNode(
        name,
        mergedSchemaName,
        mergedSchemas,
        required,
        mergedSchemas.nullable
      );
    }

    return create("SchemaItem", {
      collapsible: false,
      name,
      required: Array.isArray(required) ? required.includes(name) : required,
      schemaName: mergedSchemaName,
      schema: mergedSchemas,
    });
  }

  // primitives and array of non-objects
  return create("SchemaItem", {
    collapsible: false,
    name,
    required: Array.isArray(required) ? required.includes(name) : required,
    schemaName: schemaName,
    schema: schema,
  });
}

/**
 * Creates a hierarchical level of a schema tree. Nodes produce edges that can branch into sub-nodes with edges, recursively.
 */
export function createNodes(
  schema: SchemaObject,
  schemaType: "request" | "response"
): any {
  SCHEMA_TYPE = schemaType;
  if (SCHEMA_TYPE === "request") {
    if (schema.readOnly && schema.readOnly === true) {
      return undefined;
    }
  }

  if (SCHEMA_TYPE === "response") {
    if (schema.writeOnly && schema.writeOnly === true) {
      return undefined;
    }
  }
  const nodes = [];
  // if (schema.discriminator !== undefined) {
  //   return createDiscriminator(schema);
  // }

  if (
    (schema.oneOf !== undefined || schema.anyOf !== undefined) &&
    schema.properties !== undefined
  ) {
    // Fold siblings into branches to avoid duplicate properties — see issue #1218
    nodes.push(createAnyOneOf(foldSiblingsIntoBranches(schema)));
  } else {
    if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
      nodes.push(createAnyOneOf(schema));
    }

    if (schema.properties !== undefined) {
      nodes.push(createProperties(schema));
    }
  }

  if (schema.additionalProperties !== undefined) {
    nodes.push(createAdditionalProperties(schema));
  }

  // TODO: figure out how to handle array of objects
  if (schema.items !== undefined) {
    nodes.push(createItems(schema));
  }

  if (schema.allOf !== undefined) {
    const mergedSchemas = mergeAllOf(schema) as SchemaObject;

    if (
      (mergedSchemas.oneOf !== undefined ||
        mergedSchemas.anyOf !== undefined) &&
      mergedSchemas.properties !== undefined
    ) {
      // Fold siblings into branches to avoid duplicate properties — see issue #1218
      nodes.push(createAnyOneOf(foldSiblingsIntoBranches(mergedSchemas)));
    } else {
      if (
        mergedSchemas.oneOf !== undefined ||
        mergedSchemas.anyOf !== undefined
      ) {
        nodes.push(createAnyOneOf(mergedSchemas));
      }

      if (mergedSchemas.properties !== undefined) {
        nodes.push(createProperties(mergedSchemas));
      }
    }
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
      },
      children: [createDescription(schema.type)],
    });
  }

  // handle circular references
  if (typeof schema === "string") {
    return create("div", {
      style: {
        marginTop: ".5rem",
        marginBottom: ".5rem",
      },
      children: [createDescription(schema)],
    });
  }

  // Unknown node/schema type should return undefined
  // So far, haven't seen this hit in testing
  return "any";
}
