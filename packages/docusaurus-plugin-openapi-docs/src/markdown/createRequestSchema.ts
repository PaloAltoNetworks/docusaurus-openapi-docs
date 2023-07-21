/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { MediaTypeObject } from "../openapi/types";
import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { createNodes } from "./createSchema";
import { create, guard } from "./utils";

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

export function createRequestSchema({ title, body, ...rest }: Props) {
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

  if (mimeTypes && mimeTypes.length > 1) {
    return create("MimeTabs", {
      schemaType: "request",
      children: mimeTypes.map((mimeType) => {
        const firstBody = body.content![mimeType].schema;
        if (firstBody === undefined) {
          return undefined;
        }
        if (firstBody.properties !== undefined) {
          if (Object.keys(firstBody.properties).length === 0) {
            return undefined;
          }
        }
        return create("TabItem", {
          label: mimeType,
          value: `${mimeType}`,
          children: [
            createDetails({
              "data-collapsed": false,
              open: true,
              ...rest,
              children: [
                createDetailsSummary({
                  style: { textAlign: "left" },
                  children: [
                    create("strong", { children: `${title}` }),
                    guard(body.required && body.required === true, () => [
                      create("strong", {
                        style: {
                          fontSize: "var(--ifm-code-font-size)",
                          color: "var(--openapi-required)",
                        },
                        children: " required",
                      }),
                    ]),
                  ],
                }),
                create("div", {
                  style: { textAlign: "left", marginLeft: "1rem" },
                  children: [
                    guard(body.description, () => [
                      create("div", {
                        style: { marginTop: "1rem", marginBottom: "1rem" },
                        children: createDescription(body.description),
                      }),
                    ]),
                  ],
                }),
                create("ul", {
                  style: { marginLeft: "1rem" },
                  children: createNodes(firstBody),
                }),
              ],
            }),
          ],
        });
      }),
    });
  }

  const randomFirstKey = Object.keys(body.content)[0];
  const firstBody: any =
    body.content[randomFirstKey].schema ?? body.content![randomFirstKey];

  if (firstBody === undefined) {
    return undefined;
  }

  // we don't show the table if there is no properties to show
  if (firstBody.properties !== undefined) {
    if (Object.keys(firstBody.properties).length === 0) {
      return undefined;
    }
  }
  return create("MimeTabs", {
    children: [
      create("TabItem", {
        label: randomFirstKey,
        value: `${randomFirstKey}-schema`,
        children: [
          createDetails({
            "data-collapsed": false,
            open: true,
            ...rest,
            children: [
              createDetailsSummary({
                style: { textAlign: "left" },
                children: [
                  create("strong", { children: `${title}` }),
                  guard(firstBody.type === "array", (format) =>
                    create("span", {
                      style: { opacity: "0.6" },
                      children: ` array`,
                    })
                  ),
                  guard(body.required, () => [
                    create("strong", {
                      style: {
                        fontSize: "var(--ifm-code-font-size)",
                        color: "var(--openapi-required)",
                      },
                      children: " required",
                    }),
                  ]),
                ],
              }),
              create("div", {
                style: { textAlign: "left", marginLeft: "1rem" },
                children: [
                  guard(body.description, () => [
                    create("div", {
                      style: { marginTop: "1rem", marginBottom: "1rem" },
                      children: createDescription(body.description),
                    }),
                  ]),
                ],
              }),
              create("ul", {
                style: { marginLeft: "1rem" },
                children: createNodes(firstBody),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
