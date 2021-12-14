/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { escape } from "lodash";

import { ApiItem } from "../types";
import { createDeprecationNotice } from "./createDeprecationNotice";
import { createDescription } from "./createDescription";
import { createParamsTable } from "./createParamsTable";
import { createRequestBodyTable } from "./createRequestBodyTable";
import { createStatusCodesTable } from "./createStatusCodesTable";
import { render } from "./utils";

export function createMD({
  title,
  deprecated,
  "x-deprecated-description": deprecatedDescription,
  description,
  parameters,
  requestBody,
  responses,
}: ApiItem) {
  return render([
    `# ${escape(title)}\n\n`,
    createDeprecationNotice({ deprecated, description: deprecatedDescription }),
    createDescription(description),
    createParamsTable({ parameters, type: "path" }),
    createParamsTable({ parameters, type: "query" }),
    createParamsTable({ parameters, type: "header" }),
    createParamsTable({ parameters, type: "cookie" }),
    createRequestBodyTable({ title: "Request Body", body: requestBody }),
    createStatusCodesTable({ responses }),
  ]);
}
