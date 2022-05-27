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

  const createAuthenticationContent = (securityScheme: any) => {
    const { bearerFormat, description, flows, name, scheme, type } =
      securityScheme;

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
            createDescription(description),
            create("table", {
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
          ],
        });
      case "http":
        return create("div", {
          children: [
            createDescription(description),
            create("table", {
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
          ],
        });
      case "oauth2":
        return create("div", {
          children: [
            createDescription(description),
            create("table", {
              children: [createSecuritySchemeTypeRow(), createOAuthFlowRows()],
            }),
          ],
        });
      default:
        return "";
    }
  };

  return create("div", {
    children: [
      create("h2", {
        children: "Authentication",
        style: { marginBottom: "1rem" },
      }),
      create("Tabs", {
        children: Object.entries(securitySchemes).map(
          ([schemeType, schemeObj]) =>
            create("TabItem", {
              label: `${schemeType}`,
              value: `${schemeType}`,
              children: createAuthenticationContent(schemeObj),
            })
        ),
      }),
    ],
    style: { marginBottom: "2rem" },
  });
}
