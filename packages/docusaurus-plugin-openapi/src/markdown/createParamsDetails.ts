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
  // Create new component to render params details
  return createDetails({
    children: [
      createDetailsSummary({
        children: [
          create("strong", {
            children: `${
              type.charAt(0).toUpperCase() + type.slice(1)
            } Parameters`,
          }),
        ],
      }),
      create("div", {
        // ParamsContainer -> Creates an unordered list
        children: [
          create("ul", {
            children: params.map((param) =>
              create("ParamsItem", {
                className: "paramsItem",
                param: param,
              })
            ),
          }),
        ],
      }),
    ],
  });
}
