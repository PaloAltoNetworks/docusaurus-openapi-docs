/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { create } from "./utils";
import { ApiItem } from "../types";

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
    className: "openapi-markdown__details",
    "data-collapsed": false,
    open: true,
    style: { marginBottom: "1rem" },
    children: [
      createDetailsSummary({
        children: [
          create("h3", {
            className: "openapi-markdown__details-summary-header-params",
            children: `${
              type.charAt(0).toUpperCase() + type.slice(1)
            } Parameters`,
          }),
        ],
      }),
      create("div", {
        children: [
          create("ul", {
            children: params.map((param) => {
              return create("ParamsItem", {
                className: "paramsItem",
                param: {
                  ...param,
                  enumDescriptions: Object.entries(
                    param?.schema?.["x-enumDescriptions"] ??
                      param?.schema?.items?.["x-enumDescriptions"] ??
                      {}
                  ),
                },
              });
            }),
          }),
        ],
      }),
    ],
  });
}
