/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { escape } from "lodash";

import { ContactObject, LicenseObject } from "../openapi/types";
import { ApiPageMetadata, InfoPageMetadata } from "../types";
import { createDeprecationNotice } from "./api-page/createDeprecationNotice";
import { createDescription } from "./api-page/createDescription";
import { createParamsDetails } from "./api-page/createParamsDetails";
import { createRequestBodyDetails } from "./api-page/createRequestBodyDetails";
import { createStatusCodes } from "./api-page/createStatusCodes";
import { createContactInfo } from "./info-page/createContactInfo";
import { createLicense } from "./info-page/createLicense";
import { createTermsOfService } from "./info-page/createTermsOfService";
import { createVersionBadge } from "./info-page/createVersionBadge";
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
