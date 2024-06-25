/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { createNodes } from "./createSchema";
import {
  createExampleFromSchema,
  createResponseExample,
  createResponseExamples,
} from "./createStatusCodes";
import { create, guard } from "./utils";
import { MediaTypeObject } from "../openapi/types";

interface Props {
  style?: any;
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: string[] | boolean;
  };
}

export function createResponseSchema({ title, body, ...rest }: Props) {
  if (
    body === undefined ||
    body.content === undefined ||
    Object.keys(body).length === 0 ||
    Object.keys(body.content).length === 0
  ) {
    return undefined;
  }

  // Get all MIME types, including vendor-specific
  const mimeTypes = Object.keys(body.content);

  if (mimeTypes && mimeTypes.length) {
    return create("MimeTabs", {
      className: "openapi-tabs__mime",
      schemaType: "response",
      children: mimeTypes.map((mimeType: any) => {
        const responseExamples = body.content![mimeType].examples;
        const responseExample = body.content![mimeType].example;
        const firstBody: any =
          body.content![mimeType].schema ?? body.content![mimeType];

        if (
          firstBody === undefined &&
          responseExample === undefined &&
          responseExamples === undefined
        ) {
          return undefined;
        }

        return create("TabItem", {
          label: `${mimeType}`,
          value: `${mimeType}`,
          children: [
            create("SchemaTabs", {
              className: "openapi-tabs__schema",
              // TODO: determine if we should persist this
              // groupId: "schema-tabs",
              children: [
                firstBody &&
                  create("TabItem", {
                    label: `${title}`,
                    value: `${title}`,
                    children: [
                      createDetails({
                        className: "openapi-markdown__details response",
                        "data-collapsed": false,
                        open: true,
                        ...rest,
                        children: [
                          createDetailsSummary({
                            className:
                              "openapi-markdown__details-summary-response",
                            children: [
                              create("strong", { children: `${title}` }),
                              guard(
                                body.required && body.required === true,
                                () => [
                                  create("span", {
                                    className: "openapi-schema__required",
                                    children: "required",
                                  }),
                                ]
                              ),
                            ],
                          }),
                          create("div", {
                            style: { textAlign: "left", marginLeft: "1rem" },
                            children: [
                              guard(body.description, () => [
                                create("div", {
                                  style: {
                                    marginTop: "1rem",
                                    marginBottom: "1rem",
                                  },
                                  children: createDescription(body.description),
                                }),
                              ]),
                            ],
                          }),
                          create("ul", {
                            style: { marginLeft: "1rem" },
                            children: createNodes(firstBody!, "response"),
                          }),
                        ],
                      }),
                    ],
                  }),
                firstBody && createExampleFromSchema(firstBody, mimeType),
                responseExamples &&
                  createResponseExamples(responseExamples, mimeType),
                responseExample &&
                  createResponseExample(responseExample, mimeType),
              ],
            }),
          ],
        });
      }),
    });
  }

  return undefined;
}
