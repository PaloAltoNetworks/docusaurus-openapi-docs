/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { escape } from "lodash";

import { ContactObject, LicenseObject } from "../openapi/types";
import { ApiPageMetadata, InfoPageMetadata, TagPageMetadata } from "../types";
import { createContactInfo } from "./createContactInfo";
import { createDeprecationNotice } from "./createDeprecationNotice";
import { createDescription } from "./createDescription";
import { createLicense } from "./createLicense";
import { createParamsDetails } from "./createParamsDetails";
import { createRequestBodyDetails } from "./createRequestBodyDetails";
import { createStatusCodes } from "./createStatusCodes";
import { createTermsOfService } from "./createTermsOfService";
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
    `import ParamsItem from "@theme/ParamsItem";\n`,
    `import SchemaItem from "@theme/SchemaItem"\n`,
    `import ApiTabs from "@theme/ApiTabs";\n`,
    `import TabItem from "@theme/TabItem";\n\n`,
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
  info: { title, version, description, contact, license, termsOfService },
}: InfoPageMetadata) {
  return render([
    createVersionBadge(version),
    `# ${escape(title)}\n\n`,
    createDescription(description),
    createContactInfo(contact as ContactObject),
    createTermsOfService(termsOfService),
    createLicense(license as LicenseObject),
  ]);
}

export function createTagPageMD({ tag: { description } }: TagPageMetadata) {
  return render([createDescription(description)]);
}
