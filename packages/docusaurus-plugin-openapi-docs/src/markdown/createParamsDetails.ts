/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { create } from "./utils";
import { ApiItem } from "../types";

interface Props {
  parameters: ApiItem["parameters"];
  type: "path" | "query" | "header" | "cookie";
}

export function createParamsDetails({ parameters, type }: Props) {
  return [
    create("ParamsDetails", {
      parameters: parameters,
      type: type,
    }),
    "\n\n",
  ];
}
