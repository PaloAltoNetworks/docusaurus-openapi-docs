/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import format from "xml-formatter";

import { createDescription } from "./createDescription";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { createResponseSchema } from "./createResponseSchema";
import { create } from "./utils";
import { guard } from "./utils";
import { sampleResponseFromSchema } from "../openapi/createResponseExample";
import { ApiItem } from "../types";

export default function json2xml(o: any, tab: any) {
  var toXml = function (v: any, name: string, ind: any) {
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

interface Props {
  id?: string;
  label?: string;
  responses: ApiItem["responses"];
}

function createResponseHeaders(responseHeaders: any) {
  return guard(responseHeaders, () =>
    create("ul", {
      style: { marginLeft: "1rem" },
      children: [
        Object.entries(responseHeaders).map(
          ([headerName, headerObj]: [any, any]) => {
            const { description, example }: any = headerObj;
            const type = headerObj.schema?.type ?? "any";

            return create("li", {
              className: "schemaItem",
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
          }
        ),
      ],
    })
  );
}

export function createResponseExamples(
  responseExamples: any,
  mimeType: string
) {
  let language = "shell";
  if (mimeType.endsWith("json")) {
    language = "json";
  }
  if (mimeType.endsWith("xml")) {
    language = "xml";
  }
  return Object.entries(responseExamples).map(
    ([exampleName, exampleValue]: any) => {
      if (typeof exampleValue.value === "object") {
        return create("TabItem", {
          label: `${exampleName}`,
          value: `${exampleName}`,
          children: [
            guard(exampleValue.summary, (summary) => [
              create("div", {
                children: `${summary}`,
                className: "openapi-example__summary",
              }),
            ]),
            create("ResponseSamples", {
              responseExample: JSON.stringify(exampleValue.value, null, 2),
              language: language,
            }),
          ],
        });
      }
      return create("TabItem", {
        label: `${exampleName}`,
        value: `${exampleName}`,
        children: [
          guard(exampleValue.summary, (summary) => [
            create("div", {
              children: `${summary}`,
              className: "openapi-example__summary",
            }),
          ]),
          create("ResponseSamples", {
            responseExample: exampleValue.value,
            language: language,
          }),
        ],
      });
    }
  );
}

export function createResponseExample(responseExample: any, mimeType: string) {
  let language = "shell";
  if (mimeType.endsWith("json")) {
    language = "json";
  }
  if (mimeType.endsWith("xml")) {
    language = "xml";
  }
  if (typeof responseExample === "object") {
    return create("TabItem", {
      label: `Example`,
      value: `Example`,
      children: [
        guard(responseExample.summary, (summary) => [
          create("div", {
            children: `${summary}`,
            className: "openapi-example__summary",
          }),
        ]),
        create("ResponseSamples", {
          responseExample: JSON.stringify(responseExample, null, 2),
          language: language,
        }),
      ],
    });
  }
  return create("TabItem", {
    label: `Example`,
    value: `Example`,
    children: [
      guard(responseExample.summary, (summary) => [
        create("div", {
          children: `${summary}`,
          className: "openapi-example__summary",
        }),
      ]),
      create("ResponseSamples", {
        responseExample: responseExample,
        language: language,
      }),
    ],
  });
}

export function createExampleFromSchema(schema: any, mimeType: string) {
  const responseExample = sampleResponseFromSchema(schema);
  if (mimeType.endsWith("xml")) {
    let responseExampleObject;
    try {
      responseExampleObject = JSON.parse(JSON.stringify(responseExample));
    } catch {
      return undefined;
    }

    if (typeof responseExampleObject === "object") {
      let xmlExample;
      try {
        xmlExample = format(json2xml(responseExampleObject, ""), {
          indentation: "  ",
          lineSeparator: "\n",
          collapseContent: true,
        });
      } catch {
        const xmlExampleWithRoot = { root: responseExampleObject };
        try {
          xmlExample = format(json2xml(xmlExampleWithRoot, ""), {
            indentation: "  ",
            lineSeparator: "\n",
            collapseContent: true,
          });
        } catch {
          xmlExample = json2xml(responseExampleObject, "");
        }
      }
      return create("TabItem", {
        label: `Example (from schema)`,
        value: `Example (from schema)`,
        children: [
          create("ResponseSamples", {
            responseExample: xmlExample,
            language: "xml",
          }),
        ],
      });
    }
  }
  if (typeof responseExample === "object") {
    return create("TabItem", {
      label: `Example (from schema)`,
      value: `Example (from schema)`,
      children: [
        create("ResponseSamples", {
          responseExample: JSON.stringify(responseExample, null, 2),
          language: "json",
        }),
      ],
    });
  }
  return undefined;
}

export function createStatusCodes({ label, id, responses }: Props) {
  if (responses === undefined) {
    return undefined;
  }

  const codes = Object.keys(responses);
  if (codes.length === 0) {
    return undefined;
  }

  return create("div", {
    children: [
      create("div", {
        children: [
          create("ApiTabs", {
            label,
            id,
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
                      className: "openapi-markdown__details",
                      "data-collapsed": true,
                      open: false,
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
      }),
    ],
  });
}
