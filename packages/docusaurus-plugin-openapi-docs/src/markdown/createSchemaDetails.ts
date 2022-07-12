/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { MediaTypeObject, SchemaObject } from "../openapi/types";
import { createAnyOneOf } from "./createAnyOneOf";
import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { getQualifierMessage, getSchemaName } from "./schema";
import { create, guard } from "./utils";

const mergeAllOf = require("json-schema-merge-allof");

function resolveAllOf(allOf: SchemaObject[]) {
  // Use external library to resolve and merge nested allOf schemas
  const mergedSchemas = mergeAllOf(allOf, {
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
  }, [] as string[]);

  return { mergedSchemas, required };
}

interface RowProps {
  name: string;
  schema: SchemaObject;
  required: boolean;
}

function createRow({ name, schema, required }: RowProps) {
  const schemaName = getSchemaName(schema);
  if (schemaName && (schemaName === "object" || schemaName === "object[]")) {
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
                createRows({ schema: schema }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  // array
  if (schema.type === "array" && schema.items) {
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
                createRows({ schema: schema.items }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  // primitive
  return create("SchemaItem", {
    collapsible: false,
    name,
    required,
    schemaDescription: schema.description,
    schemaName: schemaName,
    qualifierMessage: getQualifierMessage(schema),
  });
}

interface RowsProps {
  schema: SchemaObject;
}

export function createRows({ schema }: RowsProps): string | undefined {
  // oneOf
  if (schema.oneOf !== undefined) {
    return createAnyOneOf(schema.oneOf, "oneOf");
  }

  // anyOf
  if (schema.anyOf !== undefined) {
    return createAnyOneOf(schema.anyOf, "anyOf");
  }

  // object
  if (schema.properties !== undefined) {
    return create("ul", {
      children: Object.entries(schema.properties).map(([key, val]) =>
        createRow({
          name: key,
          schema: val,
          required: Array.isArray(schema.required)
            ? schema.required.includes(key)
            : false,
        })
      ),
    });
  }

  // allOf
  if (schema.allOf !== undefined) {
    const {
      mergedSchemas,
      required,
    }: { mergedSchemas: SchemaObject; required: string[] } = resolveAllOf(
      schema.allOf
    );
    // Adds support one more level deep
    if (mergedSchemas.oneOf !== undefined) {
      return createAnyOneOf(mergedSchemas.oneOf, "oneOf");
    }

    if (mergedSchemas.anyOf !== undefined) {
      return createAnyOneOf(mergedSchemas.anyOf, "anyOf");
    }

    // array
    if (mergedSchemas.items !== undefined) {
      return createRows({ schema: schema.items as SchemaObject });
    }

    if (mergedSchemas.properties !== undefined) {
      return create("div", {
        children: [
          create("span", {
            className: "badge badge--info",
            style: { marginBottom: "1rem" },
            children: "allOf",
          }),
          Object.entries(mergedSchemas.properties as SchemaObject).map(
            ([key, val]) =>
              createRow({
                name: key,
                schema: val as SchemaObject,
                required: Array.isArray(required)
                  ? required.includes(key)
                  : false,
              })
          ),
        ],
      });
    }
  }

  // primitive
  return undefined;
}

interface RowsRootProps {
  schema: SchemaObject;
}

function createRowsRoot({ schema }: RowsRootProps): any {
  // object
  if (schema.properties !== undefined) {
    return Object.entries(schema.properties).map(([key, val]) =>
      createRow({
        name: key,
        schema: val,
        required: Array.isArray(schema.required)
          ? schema.required.includes(key)
          : false,
      })
    );
  }

  // allOf
  if (schema.allOf !== undefined) {
    const {
      mergedSchemas,
      required,
    }: { mergedSchemas: SchemaObject; required: string[] } = resolveAllOf(
      schema.allOf
    );
    return create("div", {
      children: [
        create("span", {
          className: "badge badge--info",
          style: { marginBottom: "1rem" },
          children: "allOf",
        }),
        Object.entries(mergedSchemas.properties as SchemaObject).map(
          ([key, val]) =>
            createRow({
              name: key,
              schema: val as SchemaObject,
              required: Array.isArray(required)
                ? required.includes(key)
                : false,
            })
        ),
      ],
    });
  }

  // oneOf
  if (schema.oneOf !== undefined) {
    return createAnyOneOf(schema.oneOf, "oneOf");
  }

  // anyOf
  if (schema.anyOf !== undefined) {
    return createAnyOneOf(schema.anyOf, "anyOf");
  }

  // array
  if (schema.items !== undefined) {
    return create("li", {
      children: create("div", {
        children: [createRows({ schema: schema.items })],
      }),
    });
  }

  // primitive
  return create("li", {
    children: create("div", {
      children: [
        create("span", {
          style: { opacity: "0.6" },
          children: ` ${schema.type}`,
        }),
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

  // TODO:
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

  return createDetails({
    "data-collapsed": false,
    open: true,
    ...rest,
    children: [
      createDetailsSummary({
        style: { textAlign: "left" },
        children: [
          create("strong", { children: `${title}` }),
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
        children: createRowsRoot({ schema: firstBody }),
      }),
    ],
  });
}
