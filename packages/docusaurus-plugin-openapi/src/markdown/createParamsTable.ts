/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { escape } from "lodash";

import { ApiItem } from "../types";
import { createDescription } from "./createDescription";
import { createFullWidthTable } from "./createFullWidthTable";
import { getSchemaName } from "./schema";
import { create, guard } from "./utils";

interface Props {
  parameters: ApiItem["parameters"];
  type: "path" | "query" | "header" | "cookie";
}

export function createParamsTable({ parameters, type }: Props) {
  if (parameters === undefined) {
    return undefined;
  }
  const params = parameters.filter((param) => param?.in === type);
  if (params.length === 0) {
    return undefined;
  }

  return createFullWidthTable({
    children: [
      create("thead", {
        children: create("tr", {
          children: create("th", {
            style: { textAlign: "left" },
            children: `${
              type.charAt(0).toUpperCase() + type.slice(1)
            } Parameters`,
          }),
        }),
      }),
      create("tbody", {
        children: params.map((param) =>
          create("tr", {
            children: create("td", {
              children: [
                create("code", { children: param.name }),
                guard(param.schema, (schema) =>
                  create("span", {
                    style: { opacity: "0.6" },
                    children: ` ${getSchemaName(schema)}`,
                  })
                ),
                guard(param.required, () => [
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
                // TODO: This feels a little hacky. We should have a more resilient way to generate enum descriptions.
                guard(param.schema?.items?.enum, (options) =>
                  create("div", {
                    style: { marginTop: "var(--ifm-table-cell-padding)" },
                    children: `Items Enum: ${options
                      .map((option) =>
                        create("code", { children: `"${option}"` })
                      )
                      .join(", ")}`,
                  })
                ),
                guard(param.schema?.enum, (options) =>
                  create("div", {
                    style: { marginTop: "var(--ifm-table-cell-padding)" },
                    children: `Enum: ${options
                      .map((option) =>
                        create("code", { children: `"${option}"` })
                      )
                      .join(", ")}`,
                  })
                ),
                guard(param.description, (description) =>
                  create("div", {
                    style: { marginTop: "var(--ifm-table-cell-padding)" },
                    children: createDescription(description),
                  })
                ),
                guard(param.example, (example) =>
                  create("div", {
                    style: { marginTop: "var(--ifm-table-cell-padding)" },
                    children: escape(`Example: ${example}`),
                  })
                ),
                guard(param.examples, (examples) =>
                  create("div", {
                    style: { marginTop: "var(--ifm-table-cell-padding)" },
                    children: Object.entries(examples).map(([k, v]) =>
                      create("div", {
                        children: escape(`Example (${k}): ${v.value}`),
                      })
                    ),
                  })
                ),
              ],
            }),
          })
        ),
      }),
    ],
  });
}
