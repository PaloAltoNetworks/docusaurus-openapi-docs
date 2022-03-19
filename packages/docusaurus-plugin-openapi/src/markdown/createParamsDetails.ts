/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { escape } from "lodash";

import { ApiItem } from "../types";
import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { getQualifierMessage, getSchemaName } from "./schema";
import { create, guard } from "./utils";

interface Props {
  parameters: ApiItem["parameters"];
  type: "path" | "query" | "header" | "cookie";
}

export function createParamsDetails({ parameters, type }: Props) {
  if (parameters === undefined) {
    return undefined;
  }
  const params = parameters.filter((param) => param?.in === type);
  if (params.length === 0) {
    return undefined;
  }

  return createDetails({
    children: [
      createDetailsSummary({
        children: [
          `${type.charAt(0).toUpperCase() + type.slice(1)} Parameters`,
        ],
      }),
      create("div", {
        children: [
          create("ul", {
            children: params.map((param) =>
              create("li", {
                className: "paramsItem",
                style: {
                  marginLeft: "1rem",
                  position: "relative",
                  paddingLeft: "1rem",
                  marginTop: 0,
                  marginBottom: 0,
                  borderLeft: "thin solid var(--ifm-color-gray-500)",
                },
                children: [
                  create("strong", { children: param.name }),
                  guard(param.schema, (schema) =>
                    create("span", {
                      style: { opacity: "0.6" },
                      children: ` ${getSchemaName(schema)}`,
                    })
                  ),
                  guard(param.required, () => [
                    create("strong", {
                      style: {
                        fontSize: "var(--ifm-code-font-size)",
                        color: "var(--openapi-required)",
                      },
                      children: " required",
                    }),
                  ]),
                  guard(getQualifierMessage(param.schema), (message) =>
                    create("div", {
                      //   style: { marginTop: "var(--ifm-table-cell-padding)" },
                      children: createDescription(message),
                    })
                  ),
                  guard(param.description, (description) =>
                    create("div", {
                      //   style: { marginTop: "var(--ifm-table-cell-padding)" },
                      children: createDescription(description),
                    })
                  ),
                  guard(param.example, (example) =>
                    create("div", {
                      //   style: { marginTop: "var(--ifm-table-cell-padding)" },
                      children: escape(`Example: ${example}`),
                    })
                  ),
                  guard(param.examples, (examples) =>
                    create("div", {
                      //   style: { marginTop: "var(--ifm-table-cell-padding)" },
                      children: Object.entries(examples).map(([k, v]) =>
                        create("div", {
                          children: escape(`Example (${k}): ${v.value}`),
                        })
                      ),
                    })
                  ),
                ],
              })
            ),
          }),
        ],
      }),
    ],
  });
}
