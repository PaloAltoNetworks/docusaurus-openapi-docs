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
  let properties: SchemaObject = {};
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

  if (mergedSchemas.properties) {
    properties = mergedSchemas.properties;
  }

  const required = allOf.reduce((acc, cur) => {
    if (Array.isArray(cur.required)) {
      const next = [...acc, ...cur.required];
      return next;
    }
    return acc;
  }, [] as string[]);

  return { properties, required };
}

interface RowProps {
  name: string;
  schema: SchemaObject;
  required: boolean;
}

function createRow({ name, schema, required }: RowProps) {
  const schemaName = getSchemaName(schema, true);
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

  return create("SchemaItem", {
    collapsible: false,
    name,
    required,
    schemaDescription: schema.description,
    schemaName: getSchemaName(schema, true),
    qualifierMessage: getQualifierMessage(schema),
  });
}

interface RowsProps {
  schema: SchemaObject;
}

function createRows({ schema }: RowsProps): string | undefined {
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

  // TODO: This can be a bit complicated types can be missmatched and there can be nested allOfs which need to be resolved before merging properties
  if (schema.allOf !== undefined) {
    const { properties, required } = resolveAllOf(schema.allOf);
    return create("div", {
      children: [
        create("span", {
          className: "badge badge--info",
          style: { marginBottom: "1rem" },
          children: "allOf",
        }),
        Object.entries(properties).map(([key, val]) =>
          createRow({
            name: key,
            schema: val,
            required: Array.isArray(required) ? required.includes(key) : false,
          })
        ),
      ],
    });
  }

  // Adds support one more level deep
  if (schema.oneOf !== undefined) {
    return createAnyOneOf(schema.oneOf, "oneOf");
  }

  if (schema.anyOf !== undefined) {
    return createAnyOneOf(schema.anyOf, "anyOf");
  }

  // array
  if (schema.items !== undefined) {
    return createRows({ schema: schema.items });
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

  // TODO: This can be a bit complicated types can be missmatched and there can be nested allOfs which need to be resolved before merging properties
  if (schema.allOf !== undefined) {
    const { properties, required } = resolveAllOf(schema.allOf);
    return create("div", {
      children: [
        create("span", {
          className: "badge badge--info",
          style: { marginBottom: "1rem" },
          children: "allOf",
        }),
        Object.entries(properties).map(([key, val]) =>
          createRow({
            name: key,
            schema: val,
            required: Array.isArray(required) ? required.includes(key) : false,
          })
        ),
      ],
    });
  }

  // TODO: This is top-level only - add support for nested oneOf/anyOf
  if (schema.oneOf !== undefined) {
    return createAnyOneOf(schema.oneOf, "oneOf");
  }

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
