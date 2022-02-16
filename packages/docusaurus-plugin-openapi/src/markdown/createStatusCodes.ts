/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { ApiItem } from "../types";
import { createDescription } from "./createDescription";
import { createSchemaTable } from "./createSchemaTable";
import { createDetails } from "./createDetails";
import { createDetailsSummary } from "./createDetailsSummary";
import { create } from "./utils";

interface Props {
  responses: ApiItem["responses"];
}

export function createStatusCodes({ responses }: Props) {
  if (responses === undefined) {
    return undefined;
  }

  const codes = Object.keys(responses);
  if (codes.length === 0) {
    return undefined;
  }

  type statusCodeOptions = {
    [key: number]: string;
  };

  const statusCodes: statusCodeOptions = {
    100: "100 Continue",
    101: "101 Switching Protocols",
    103: "103 Early Hints",
    200: "200 OK",
    201: "201 Created",
    202: "202 Accepted",
    203: "203 Non-Authoritative Information",
    204: "204 No Content",
    205: "205 Reset Content",
    206: "206 Partial Content",
    300: "300 Multiple Choices",
    301: "301 Moved Permanently",
    302: "302 Found",
    303: "303 See Other",
    304: "304 Not Modified",
    307: "307 Temporary Redirect",
    308: "308 Permanent Redirect",
    400: "400 Bad Request",
    401: "401 Unauthorized",
    402: "402 Payment Required",
    403: "403 Forbidden",
    404: "404 Not Found",
    405: "405 Method Not Allowed",
    406: "406 Not Acceptable",
    407: "407 Proxy Authentication Required",
    408: "408 Request Timeout",
    409: "409 Conflict",
    410: "410 Gone",
    411: "411 Length Required",
    412: "412 Precondition Failed",
    413: "413 Payload Too Large",
    414: "414 URI Too Long",
    415: "415 Unsupported Media Type",
    416: "416 Range Not Satisfiable",
    417: "417 Expectation Failed",
    418: "418 I'm a teapot",
    422: "422 Unprocessable Entity",
    425: "425 Too Early",
    426: "426 Upgrade Required",
    428: "428 Precondition Required",
    429: "429 Too Many Requests",
    431: "431 Request Header Fields Too Large",
    451: "451 Unavailable For Legal Reasons",
    500: "500 Internal Server Error",
    501: "501 Not Implemented",
    502: "502 Bad Gateway",
    503: "503 Service Unavailable",
    504: "504 Gateway Timeout",
    505: "505 HTTP Version Not Supported",
    506: "506 Variant Also Negotiates",
    507: "507 Insufficient Storage",
    508: "508 Loop Detected",
    510: "510 Not Extended",
    511: "511 Network Authentication Required",
  };

  return create("div", {
    children: [
      create("p", {
        children: "Responses",
        style: {
          fontWeight: "var(--ifm-table-head-font-weight)",
        },
      }),
      create("div", {
        children: codes.map((code) =>
          create("div", {
            children: [
              createDetails({
                className:
                  parseInt(code) >= 400
                    ? "alert--danger"
                    : parseInt(code) >= 200 && parseInt(code) < 300
                    ? "alert--success"
                    : "alert--warning",
                children: [
                  createDetailsSummary({
                    children: create("span", {
                      children: [
                        create("div", {
                          children: statusCodes[code as any],
                        }),
                      ],
                    }),
                  }),
                  create("div", {
                    children: createDescription(responses[code].description),
                  }),
                  create("div", {
                    children: createSchemaTable({
                      style: {
                        marginTop: "var(--ifm-table-cell-padding)",
                        marginBottom: "0px",
                      },
                      title: "Schema",
                      body: {
                        content: responses[code].content,
                      },
                    }),
                  }),
                ],
              }),
            ],
          })
        ),
      }),
    ],
  });
}
