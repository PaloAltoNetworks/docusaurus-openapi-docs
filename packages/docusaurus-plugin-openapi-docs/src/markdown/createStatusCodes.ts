/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { sampleResponseFromSchema } from "../openapi/createResponseExample";
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

/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

function json2xml(o: any, tab: any) {
  var toXml = function (v: any, name: any, ind: any) {
      var xml = "";
      if (v instanceof Array) {
        for (var i = 0, n = v.length; i < n; i++)
          xml += ind + toXml(v[i], name, ind + "\t") + "\n";
      } else if (typeof v == "object") {
        var hasChild = false;
        xml += ind + "<" + name;
        for (var m in v) {
          if (m.charAt(0) === "@")
            xml += " " + m.substr(1) + '="' + v[m].toString() + '"';
          else hasChild = true;
        }
        xml += hasChild ? ">" : "/>";
        if (hasChild) {
          for (var m2 in v) {
            if (m2 === "#text") xml += v[m2];
            else if (m2 === "#cdata") xml += "<![CDATA[" + v[m2] + "]]>";
            else if (m2.charAt(0) !== "@") xml += toXml(v[m2], m2, ind + "\t");
          }
          xml +=
            (xml.charAt(xml.length - 1) === "\n" ? ind : "") +
            "</" +
            name +
            ">";
        }
      } else {
        xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
      }
      return xml;
    },
    xml = "";
  for (var m3 in o) xml += toXml(o[m3], m3, "");
  return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
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

      if (typeof exampleValue.value === "object") {
        return create("TabItem", {
          label: `${finalFormattedName}`,
          value: `${finalFormattedName}`,
          children: [
            create("ResponseSamples", {
              responseExample: JSON.stringify(exampleValue.value, null, 2),
            }),
          ],
        });
      }
      return create("TabItem", {
        label: `${finalFormattedName}`,
        value: `${finalFormattedName}`,
        children: [
          create("ResponseSamples", {
            responseExample: exampleValue.value,
          }),
        ],
      });
    }
  );
}

export function createResponseExample(responseExample: any) {
  if (typeof responseExample === "object") {
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
  return create("TabItem", {
    label: `Example`,
    value: `Example`,
    children: [
      create("ResponseSamples", {
        responseExample: responseExample,
      }),
    ],
  });
}

export function createExampleFromSchema(schema: any, mimeType: string) {
  const responseExample = sampleResponseFromSchema(schema);
  if (mimeType.endsWith("xml")) {
    const responseExampleObject = JSON.parse(JSON.stringify(responseExample));
    if (typeof responseExampleObject === "object") {
      const xmlExample = json2xml(responseExampleObject, 2);
      return create("TabItem", {
        label: `Example (from schema)`,
        value: `Example (from schema)`,
        children: [
          create("ResponseSamples", {
            responseExample: xmlExample,
          }),
        ],
      });
    }
    return undefined;
  }
  if (typeof responseExample === "object") {
    return create("TabItem", {
      label: `Example (from schema)`,
      value: `Example (from schema)`,
      children: [
        create("ResponseSamples", {
          responseExample: JSON.stringify(responseExample, null, 2),
        }),
      ],
    });
  }
  return undefined;
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
