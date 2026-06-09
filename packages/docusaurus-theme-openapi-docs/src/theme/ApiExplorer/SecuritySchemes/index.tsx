/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import { useTypedSelector } from "@theme/ApiItem/hooks";

function SecuritySchemes(props: any) {
  const options = useTypedSelector((state: any) => state.auth.options);
  const selected = useTypedSelector((state: any) => state.auth.selected);
  const infoAuthPath = `/${props.infoPath}#authentication`;

  if (selected === undefined) return null;

  if (options[selected]?.[0]?.type === undefined) {
    return null;
  }

  const selectedAuth = options[selected];

  // Each label uses a static `translate()` call (literal id + message) so that
  // `docusaurus write-translations` can statically extract it. A dynamic
  // `translate({ id: someVar })` would be skipped by the extractor.
  const renderRestLabel = (k: string): string => {
    switch (k) {
      case "description":
        return translate({
          id: "theme.openapi.securitySchemes.description",
          message: "description:",
        });
      case "scheme":
        return translate({
          id: "theme.openapi.securitySchemes.scheme",
          message: "scheme:",
        });
      case "bearerFormat":
        return translate({
          id: "theme.openapi.securitySchemes.bearerFormat",
          message: "bearerFormat:",
        });
      case "openIdConnectUrl":
        return translate({
          id: "theme.openapi.securitySchemes.openIdConnectUrl",
          message: "openIdConnectUrl:",
        });
      default:
        return `${k}:`;
    }
  };

  const renderRest = (rest: Record<string, any>) =>
    Object.keys(rest).map((k) => (
      <span key={k}>
        <strong>{renderRestLabel(k)} </strong>
        {typeof rest[k] === "object"
          ? JSON.stringify(rest[k], null, 2)
          : String(rest[k])}
      </span>
    ));
  return (
    <details className="openapi-security__details" open={false}>
      <summary className="openapi-security__summary-container">
        <h4 className="openapi-security__summary-header">
          {translate({
            id: "theme.openapi.securitySchemes.authorization",
            message: "Authorization:",
          })}{" "}
          {selectedAuth[0].name ?? selectedAuth[0].type}
        </h4>
      </summary>
      {selectedAuth.map((auth: any) => {
        const isHttp = auth.type === "http";
        const isApiKey = auth.type === "apiKey";
        const isOauth2 = auth.type === "oauth2";
        const isOpenId = auth.type === "openIdConnect";

        if (isHttp) {
          if (auth.scheme === "bearer") {
            const { name, key, type, scopes, ...rest } = auth;
            return (
              <React.Fragment key={auth.key}>
                <pre
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--openapi-card-background-color)",
                  }}
                >
                  <span>
                    <strong>
                      {translate({
                        id: "theme.openapi.securitySchemes.name",
                        message: "name:",
                      })}
                    </strong>{" "}
                    <Link to={infoAuthPath}>{name ?? key}</Link>
                  </span>
                  <span>
                    <strong>
                      {translate({
                        id: "theme.openapi.securitySchemes.type",
                        message: "type:",
                      })}
                    </strong>{" "}
                    {type}
                  </span>
                  {scopes && scopes.length > 0 && (
                    <span>
                      <strong>
                        {translate({
                          id: "theme.openapi.securitySchemes.scopes",
                          message: "scopes:",
                        })}
                      </strong>{" "}
                      <code>
                        {auth.scopes.length > 0 ? auth.scopes.toString() : "[]"}
                      </code>
                    </span>
                  )}
                  {renderRest(rest)}
                </pre>
              </React.Fragment>
            );
          }
          if (auth.scheme === "basic") {
            const { name, key, type, scopes, ...rest } = auth;
            return (
              <React.Fragment key={auth.key}>
                <pre
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--openapi-card-background-color)",
                  }}
                >
                  <span>
                    <strong>
                      {translate({
                        id: "theme.openapi.securitySchemes.name",
                        message: "name:",
                      })}
                    </strong>{" "}
                    <Link to={infoAuthPath}>{name ?? key}</Link>
                  </span>
                  <span>
                    <strong>
                      {translate({
                        id: "theme.openapi.securitySchemes.type",
                        message: "type:",
                      })}
                    </strong>{" "}
                    {type}
                  </span>
                  {scopes && scopes.length > 0 && (
                    <span>
                      <strong>
                        {translate({
                          id: "theme.openapi.securitySchemes.scopes",
                          message: "scopes:",
                        })}
                      </strong>{" "}
                      <code>
                        {auth.scopes.length > 0 ? auth.scopes.toString() : "[]"}
                      </code>
                    </span>
                  )}
                  {renderRest(rest)}
                </pre>
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={auth.key}>
              <pre
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--openapi-card-background-color)",
                }}
              >
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.name",
                      message: "name:",
                    })}
                  </strong>{" "}
                  <Link to={infoAuthPath}>{auth.name ?? auth.key}</Link>
                </span>
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.type",
                      message: "type:",
                    })}
                  </strong>{" "}
                  {auth.type}
                </span>
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.in",
                      message: "in:",
                    })}
                  </strong>{" "}
                  {auth.in}
                </span>
              </pre>
            </React.Fragment>
          );
        }

        if (isApiKey) {
          const { name, key, type, scopes, ...rest } = auth;
          return (
            <React.Fragment key={auth.key}>
              <pre
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--openapi-card-background-color)",
                }}
              >
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.name",
                      message: "name:",
                    })}
                  </strong>{" "}
                  <Link to={infoAuthPath}>{name ?? key}</Link>
                </span>
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.type",
                      message: "type:",
                    })}
                  </strong>{" "}
                  {type}
                </span>
                {scopes && scopes.length > 0 && (
                  <span>
                    <strong>
                      {translate({
                        id: "theme.openapi.securitySchemes.scopes",
                        message: "scopes:",
                      })}
                    </strong>{" "}
                    <code>
                      {auth.scopes.length > 0 ? auth.scopes.toString() : "[]"}
                    </code>
                  </span>
                )}
                {renderRest(rest)}
              </pre>
            </React.Fragment>
          );
        }

        if (isOauth2) {
          const { name, key, type, scopes, flows, ...rest } = auth;
          return (
            <React.Fragment key={selected}>
              <pre
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--openapi-card-background-color)",
                }}
              >
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.name",
                      message: "name:",
                    })}
                  </strong>{" "}
                  <Link to={infoAuthPath}>{name ?? key}</Link>
                </span>
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.type",
                      message: "type:",
                    })}
                  </strong>{" "}
                  {type}
                </span>
                {scopes && scopes.length > 0 && (
                  <span>
                    <strong>
                      {translate({
                        id: "theme.openapi.securitySchemes.scopes",
                        message: "scopes:",
                      })}
                    </strong>{" "}
                    <code>
                      {auth.scopes.length > 0 ? auth.scopes.toString() : "[]"}
                    </code>
                  </span>
                )}
                {renderRest(rest)}
                {flows && (
                  <span>
                    <code>
                      <strong>
                        {translate({
                          id: "theme.openapi.securitySchemes.flows",
                          message: "flows:",
                        })}
                      </strong>{" "}
                      {JSON.stringify(flows, null, 2)}
                    </code>
                  </span>
                )}
              </pre>
            </React.Fragment>
          );
        }

        if (isOpenId) {
          const { name, key, scopes, type, ...rest } = auth;
          return (
            <React.Fragment key={auth.key}>
              <pre
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--openapi-card-background-color)",
                }}
              >
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.name",
                      message: "name:",
                    })}
                  </strong>{" "}
                  <Link to={infoAuthPath}>{name ?? key}</Link>
                </span>
                <span>
                  <strong>
                    {translate({
                      id: "theme.openapi.securitySchemes.type",
                      message: "type:",
                    })}
                  </strong>{" "}
                  {type}
                </span>
                {scopes && scopes.length > 0 && (
                  <span>
                    <strong>
                      {translate({
                        id: "theme.openapi.securitySchemes.scopes",
                        message: "scopes:",
                      })}
                    </strong>{" "}
                    <code>
                      {auth.scopes.length > 0 ? auth.scopes.toString() : "[]"}
                    </code>
                  </span>
                )}
                {renderRest(rest)}
              </pre>
            </React.Fragment>
          );
        }

        return undefined;
      })}
    </details>
  );
}

export default SecuritySchemes;
