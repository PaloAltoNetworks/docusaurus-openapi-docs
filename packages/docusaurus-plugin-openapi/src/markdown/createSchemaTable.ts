/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { MediaTypeObject, SchemaObject } from "../openapi/types";
import { createDescription } from "./createDescription";
import { createFullWidthTable } from "./createFullWidthTable";
import { getSchemaName } from "./schema";
import { create, guard } from "./utils";

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
  return create("tr", {
    children: create("td", {
      children: [
        create("code", { children: name }),
        create("span", {
          style: { opacity: "0.6" },
          children: ` ${getSchemaName(schema, true)}`,
        }),
        guard(required, () => [
          create("span", {
            style: { opacity: "0.6" },
            children: " — ",
          }),
          create("strong", {
            style: {
              fontSize: "var(--ifm-code-font-size)",
              color: "var(--openapi-required)",
            },
            children: " REQUIRED",
          }),
        ]),
        guard(schema.enum, (options) =>
          create("div", {
            style: { marginTop: "var(--ifm-table-cell-padding)" },
            children: `Enum: ${options
              .map((option) => create("code", { children: `"${option}"` }))
              .join(", ")}`,
          })
        ),
        guard(schema.description, (description) =>
          create("div", {
            style: { marginTop: "var(--ifm-table-cell-padding)" },
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
    return createFullWidthTable({
      style: {
        marginTop: "var(--ifm-table-cell-padding)",
        marginBottom: "0px",
      },
      children: create("tbody", {
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
    return createFullWidthTable({
      style: {
        marginTop: "var(--ifm-table-cell-padding)",
        marginBottom: "0px",
      },
      children: create("tbody", {
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
    return create("tr", {
      children: create("td", {
        children: [
          create("span", {
            style: { opacity: "0.6" },
            children: ` ${getSchemaName(schema, true)}`,
          }),
          createRows({ schema: schema.items }),
        ],
      }),
    });
  }

  // primitive
  return create("tr", {
    children: create("td", {
      children: [
        create("span", {
          style: { opacity: "0.6" },
          children: ` ${schema.type}`,
        }),
        guard(schema.enum, (options) =>
          create("div", {
            style: { marginTop: "var(--ifm-table-cell-padding)" },
            children: `Enum: ${options
              .map((option) => create("code", { children: `"${option}"` }))
              .join(", ")}`,
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

export function createSchemaTable({ title, body, ...rest }: Props) {
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

  return createFullWidthTable({
    ...rest,
    children: [
      create("thead", {
        children: create("tr", {
          children: create("th", {
            style: { textAlign: "left" },
            children: [
              `${title} `,
              guard(body.required, () => [
                create("span", {
                  style: { opacity: "0.6" },
                  children: " — ",
                }),
                create("strong", {
                  style: {
                    fontSize: "var(--ifm-code-font-size)",
                    color: "var(--openapi-required)",
                  },
                  children: " REQUIRED",
                }),
              ]),
              create("div", {
                children: createDescription(body.description),
              }),
            ],
          }),
        }),
      }),
      create("tbody", {
        children: createRowsRoot({ schema: firstBody }),
      }),
    ],
  });
}
