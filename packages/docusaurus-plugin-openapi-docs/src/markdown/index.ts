/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { escape } from "lodash";

import {
  ContactObject,
  LicenseObject,
  MediaTypeObject,
  SecuritySchemeObject,
} from "../openapi/types";
import { ApiPageMetadata, InfoPageMetadata, TagPageMetadata } from "../types";
import { createAuthentication } from "./createAuthentication";
import { createContactInfo } from "./createContactInfo";
import { createDeprecationNotice } from "./createDeprecationNotice";
import { createDescription } from "./createDescription";
import { createLicense } from "./createLicense";
import { createLogo } from "./createLogo";
import { createParamsDetails } from "./createParamsDetails";
import { createRequestBodyDetails } from "./createRequestBodyDetails";
import { createStatusCodes } from "./createStatusCodes";
import { createTermsOfService } from "./createTermsOfService";
import { createVersionBadge } from "./createVersionBadge";
import { render } from "./utils";

interface Props {
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: boolean;
  };
}

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
    `import ApiTabs from "@theme/ApiTabs";\n`,
    `import MimeTabs from "@theme/MimeTabs";\n`,
    `import ParamsItem from "@theme/ParamsItem";\n`,
    `import ResponseSamples from "@theme/ResponseSamples";\n`,
    `import SchemaItem from "@theme/SchemaItem"\n`,
    `import SchemaTabs from "@theme/SchemaTabs";\n`,
    `import DiscriminatorTabs from "@theme/DiscriminatorTabs";\n`,
    `import TabItem from "@theme/TabItem";\n\n`,
    `## ${escape(title)}\n\n`,
    createDeprecationNotice({ deprecated, description: deprecatedDescription }),
    createDescription(escape(description)),
    createParamsDetails({ parameters, type: "path" }),
    createParamsDetails({ parameters, type: "query" }),
    createParamsDetails({ parameters, type: "header" }),
    createParamsDetails({ parameters, type: "cookie" }),
    createRequestBodyDetails({
      title: "Request Body",
      body: requestBody,
    } as Props),
    createStatusCodes({ responses }),
  ]);
}

export function createInfoPageMD({
  info: {
    title,
    version,
    description,
    contact,
    license,
    termsOfService,
    logo,
    darkLogo,
  },
  securitySchemes,
}: InfoPageMetadata) {
  return render([
    `import ApiLogo from "@theme/ApiLogo";\n`,
    `import Tabs from "@theme/Tabs";\n`,
    `import TabItem from "@theme/TabItem";\n\n`,

    createVersionBadge(version),
    `# ${escape(title)}\n\n`,
    createLogo(logo, darkLogo),
    createDescription(description),
    createAuthentication(securitySchemes as unknown as SecuritySchemeObject),
    createContactInfo(contact as ContactObject),
    createTermsOfService(termsOfService),
    createLicense(license as LicenseObject),
  ]);
}

export function createTagPageMD({ tag: { description } }: TagPageMetadata) {
  return render([createDescription(description)]);
}
