/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { ApiItem } from "../types";
import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { createResponseSchema } from "./createResponseSchema";
import { create } from "./utils";
import { guard } from "./utils";

interface Props {
  responses: ApiItem["responses"];
}

function createResponseHeaders(responseHeaders: any) {
  return guard(responseHeaders, () =>
    create("ul", {
      style: { marginLeft: "1rem" },
      children: [
        Object.entries(responseHeaders).map(([headerName, headerObj]) => {
          const {
            description,
            schema: { type },
            example,
          }: any = headerObj;

          return create("li", {
            class: "schemaItem",
            children: [
              createDetailsSummary({
                children: [
                  create("strong", { children: headerName }),
                  guard(type, () => [
                    create("span", {
                      style: { opacity: "0.6" },
                      children: ` ${type}`,
                    }),
                  ]),
                ],
              }),
              create("div", {
                children: [
                  guard(description, (description) =>
                    create("div", {
                      style: {
                        marginTop: ".5rem",
                        marginBottom: ".5rem",
                      },
                      children: [
                        guard(example, () => `Example: ${example}`),
                        createDescription(description),
                      ],
                    })
                  ),
                ],
              }),
            ],
          });
        }),
      ],
    })
  );
}

export function createResponseExamples(responseExamples: any) {
  return Object.entries(responseExamples).map(
    ([exampleName, exampleValue]: any) => {
      const camelToSpaceName = exampleName.replace(/([A-Z])/g, " $1");
      let finalFormattedName =
        camelToSpaceName.charAt(0).toUpperCase() + camelToSpaceName.slice(1);

      return create("TabItem", {
        label: `${finalFormattedName}`,
        value: `${finalFormattedName}`,
        children: [
          create("ResponseSamples", {
            responseExample: JSON.stringify(
              exampleValue.value ?? exampleValue,
              null,
              2
            ),
          }),
        ],
      });
    }
  );
}

export function createResponseExample(responseExample: any) {
  return create("TabItem", {
    label: `Example`,
    value: `Example`,
    children: [
      create("ResponseSamples", {
        responseExample: JSON.stringify(responseExample, null, 2),
      }),
    ],
  });
}

export function createStatusCodes({ responses }: Props) {
  if (responses === undefined) {
    return undefined;
  }

  const codes = Object.keys(responses);
  if (codes.length === 0) {
    return undefined;
  }

  return create("div", {
    children: [
      create("ApiTabs", {
        // TODO: determine if we should persist status code selection
        // groupId: "api-tabs",
        children: codes.map((code) => {
          const responseHeaders: any = responses[code].headers;
          return create("TabItem", {
            label: code,
            value: code,
            children: [
              create("div", {
                children: createDescription(responses[code].description),
              }),
              responseHeaders &&
                createDetails({
                  "data-collaposed": false,
                  open: true,
                  style: { textAlign: "left", marginBottom: "1rem" },
                  children: [
                    createDetailsSummary({
                      children: [
                        create("strong", {
                          children: "Response Headers",
                        }),
                      ],
                    }),
                    createResponseHeaders(responseHeaders),
                  ],
                }),
              create("div", {
                children: createResponseSchema({
                  title: "Schema",
                  body: {
                    content: responses[code].content,
                  },
                }),
              }),
            ],
          });
        }),
      }),
    ],
  });
}
