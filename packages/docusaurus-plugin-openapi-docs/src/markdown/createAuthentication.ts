/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { OAuthFlowObject, SecuritySchemeObject } from "../openapi/types";
import { createDescription } from "./createDescription";
import { create, guard } from "./utils";

export function createAuthentication(securitySchemes: SecuritySchemeObject) {
  if (!securitySchemes || !Object.keys(securitySchemes).length) return "";

  const createAuthenticationTable = (securityScheme: any) => {
    const { bearerFormat, flows, name, scheme, type } = securityScheme;

    const createSecuritySchemeTypeRow = () =>
      create("tr", {
        children: [
          create("th", { children: "Security Scheme Type:" }),
          create("td", { children: type }),
        ],
      });

    const createOAuthFlowRows = () => {
      const flowRows = Object.entries(flows).map(([flowType, flowObj]) => {
        const { authorizationUrl, tokenUrl, refreshUrl, scopes } =
          flowObj as OAuthFlowObject;

        return create("tr", {
          children: [
            create("th", { children: `${flowType} OAuth Flow:` }),
            create("td", {
              children: [
                guard(tokenUrl, () =>
                  create("p", { children: `Token URL: ${tokenUrl}` })
                ),
                guard(authorizationUrl, () =>
                  create("p", {
                    children: `Authorization URL: ${authorizationUrl}`,
                  })
                ),
                guard(refreshUrl, () =>
                  create("p", { children: `Refresh URL: ${refreshUrl}` })
                ),
                create("span", { children: "Scopes:" }),
                create("ul", {
                  children: Object.entries(scopes).map(([scope, description]) =>
                    create("li", { children: `${scope}: ${description}` })
                  ),
                }),
              ],
            }),
          ],
        });
      });

      return flowRows.join("");
    };

    switch (type) {
      case "apiKey":
        return create("div", {
          children: [
            create("table", {
              children: create("tbody", {
                children: [
                  createSecuritySchemeTypeRow(),
                  create("tr", {
                    children: [
                      create("th", { children: "Header parameter name:" }),
                      create("td", { children: name }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        });
      case "http":
        return create("div", {
          children: [
            create("table", {
              children: create("tbody", {
                children: [
                  createSecuritySchemeTypeRow(),
                  create("tr", {
                    children: [
                      create("th", { children: "HTTP Authorization Scheme:" }),
                      create("td", { children: scheme }),
                    ],
                  }),
                  create("tr", {
                    children: [
                      create("th", { children: "Bearer format:" }),
                      create("td", { children: bearerFormat }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        });
      case "oauth2":
        return create("div", {
          children: [
            create("table", {
              children: create("tbody", {
                children: [
                  createSecuritySchemeTypeRow(),
                  createOAuthFlowRows(),
                ],
              }),
            }),
          ],
        });
      default:
        return "";
    }
  };

  const formatTabLabel = (str: string) => {
    const formattedLabel = str
      .replace(/(_|-)/g, " ")
      .trim()
      .replace(/\w\S*/g, (str) => str.charAt(0).toUpperCase() + str.substr(1))
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");

    const isOAuth = formattedLabel.toLowerCase().includes("oauth2");
    const isApiKey = formattedLabel.toLowerCase().includes("api");

    return isOAuth ? "OAuth 2.0" : isApiKey ? "API Key" : formattedLabel;
  };

  return create("div", {
    children: [
      create("h2", {
        children: "Authentication",
        id: "authentication",
        style: { marginBottom: "1rem" },
      }),
      create("Tabs", {
        children: Object.entries(securitySchemes).map(
          ([schemeType, schemeObj]) =>
            create("TabItem", {
              label: formatTabLabel(schemeType),
              value: `${schemeType}`,
              children: [
                createDescription(schemeObj.description),
                createAuthenticationTable(schemeObj),
              ],
            })
        ),
      }),
    ],
    style: { marginBottom: "2rem" },
  });
}
