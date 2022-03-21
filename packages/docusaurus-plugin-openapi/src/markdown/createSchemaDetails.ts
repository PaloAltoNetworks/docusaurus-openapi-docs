/* ============================================================================
 * Copyright (c) Cloud Annotations
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

const listStyle = {
  listStyle: "none",
  position: "relative",
  paddingBottom: "5px",
  paddingTop: "5px",
  paddingLeft: "1rem",
  marginTop: 0,
  marginBottom: 0,
  borderLeft: "thin solid var(--ifm-color-gray-500)",
};

function resolveAllOf(allOf: SchemaObject[]) {
  // TODO: naive implementation (only supports objects, no directly nested allOf)
  const properties = allOf.reduce((acc, cur) => {
    if (cur.properties !== undefined) {
      const next = { ...acc, ...cur.properties };
      return next;
    }
    return acc;
  }, {});

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
    return create("li", {
      className: "schemaItem",
      style: listStyle,
      children: [
        createDetails({
          children: [
            createDetailsSummary({
              children: [
                create("strong", { children: name }),
                create("span", {
                  style: { opacity: "0.6" },
                  children: ` ${getSchemaName(schema, true)}`,
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
              children: [
                guard(getQualifierMessage(schema), (message) =>
                  create("div", {
                    style: { marginLeft: "1rem" },
                    children: createDescription(message),
                  })
                ),
                guard(schema.description, (description) =>
                  create("div", {
                    style: { marginLeft: "1rem" },
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
  return create("li", {
    className: "schemaItem",
    style: listStyle,
    children: create("div", {
      children: [
        create("strong", { children: name }),
        create("span", {
          style: { opacity: "0.6" },
          children: ` ${getSchemaName(schema, true)}`,
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
        guard(getQualifierMessage(schema), (message) =>
          create("div", {
            children: createDescription(message),
          })
        ),
        guard(schema.description, (description) =>
          create("div", {
            children: createDescription(description),
          })
        ),
        createRows({ schema: schema }),
      ],
    }),
  });
}

interface RowsProps {
  schema: SchemaObject;
}

function createRows({ schema }: RowsProps): string | undefined {
  // object
  if (schema.properties !== undefined) {
    return create("li", {
      style: { marginLeft: "1rem" },
      children: create("ul", {
        children: Object.entries(schema.properties).map(([key, val]) =>
          createRow({
            name: key,
            schema: val,
            required: Array.isArray(schema.required)
              ? schema.required.includes(key)
              : false,
          })
        ),
      }),
    });
  }

  // TODO: This can be a bit complicated types can be missmatched and there can be nested allOfs which need to be resolved before merging properties
  if (schema.allOf !== undefined) {
    const { properties, required } = resolveAllOf(schema.allOf);
    return create("li", {
      className: "allOf",
      style: {
        marginLeft: "1rem",
      },
      children: create("ul", {
        children: Object.entries(properties).map(([key, val]) =>
          createRow({
            name: key,
            schema: val,
            required: Array.isArray(required) ? required.includes(key) : false,
          })
        ),
      }),
    });
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

function createRowsRoot({ schema }: RowsRootProps) {
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
    return Object.entries(properties).map(([key, val]) =>
      createRow({
        name: key,
        schema: val,
        required: Array.isArray(required) ? required.includes(key) : false,
      })
    );
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
  if (body === undefined || body.content === undefined) {
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

  const firstBodyIndentation = firstBody.items
    ? { marginLeft: "0" }
    : { marginLeft: "1rem" };

  return createDetails({
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
        style: { marginLeft: "1rem" },
        children: create("div", {
          children: create("div", {
            style: { textAlign: "left" },
            children: [
              guard(body.description, () => [
                create("div", {
                  style: { marginTop: "1rem", marginBottom: "1rem" },
                  children: createDescription(body.description),
                }),
              ]),
            ],
          }),
        }),
      }),
      create("ul", {
        style: firstBodyIndentation,
        children: createRowsRoot({ schema: firstBody }),
      }),
    ],
  });
}
