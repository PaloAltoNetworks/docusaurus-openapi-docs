/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { escape } from "lodash";

import { ApiPageMetadata, InfoPageMetadata } from "../types";
import { createDeprecationNotice } from "./createDeprecationNotice";
import { createDescription } from "./createDescription";
import { createParamsDetails } from "./createParamsDetails";
import { createRequestBodyDetails } from "./createRequestBodyDetails";
import { createStatusCodes } from "./createStatusCodes";
import { createVersionBadge } from "./createVersionBadge";
import { render } from "./utils";

export function createApiPageMD({
  title,
  api: {
    deprecated,
    "x-deprecated-description": deprecatedDescription,
    description,
    parameters,
    requestBody,
    responses,
  },
}: ApiPageMetadata) {
  return render([
    `import Tabs from "@theme/Tabs";\n\n`,
    `import TabItem from "@theme/TabItem";\n\n`,
    `import ParamsItem from "@theme/ParamsItem";\n\n`,
    `import SchemaItem from "@theme/SchemaItem"\n\n`,
    `## ${escape(title)}\n\n`,
    createDeprecationNotice({ deprecated, description: deprecatedDescription }),
    createDescription(escape(description)),
    createParamsDetails({ parameters, type: "path" }),
    createParamsDetails({ parameters, type: "query" }),
    createParamsDetails({ parameters, type: "header" }),
    createParamsDetails({ parameters, type: "cookie" }),
    createRequestBodyDetails({ title: "Request Body", body: requestBody }),
    createStatusCodes({ responses }),
  ]);
}

export function createInfoPageMD({
  info: { title, version, description },
}: InfoPageMetadata) {
  return render([
    createVersionBadge(version),
    `# ${escape(title)}\n\n`,
    createDescription(description),
  ]);
}
