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
import { OPENAPI_SECURITY_SCHEMES } from "@theme/translationIds";

function SecuritySchemes(props: any) {
  const options = useTypedSelector((state: any) => state.auth.options);
  const selected = useTypedSelector((state: any) => state.auth.selected);
  const infoAuthPath = `/${props.infoPath}#authentication`;

  if (selected === undefined) return null;

  if (options[selected]?.[0]?.type === undefined) {
    return null;
  }

  const selectedAuth = options[selected];

  const keyTranslations: Record<string, { id: string; message: string }> = {
    description: {
      id: OPENAPI_SECURITY_SCHEMES.DESCRIPTION,
      message: "description:",
    },
    scheme: {
      id: OPENAPI_SECURITY_SCHEMES.SCHEME,
      message: "scheme:",
    },
    bearerFormat: {
      id: OPENAPI_SECURITY_SCHEMES.BEARER_FORMAT,
      message: "bearerFormat:",
    },
    openIdConnectUrl: {
      id: OPENAPI_SECURITY_SCHEMES.OPEN_ID_CONNECT_URL,
      message: "openIdConnectUrl:",
    },
  };

  const renderRest = (rest: Record<string, any>) =>
    Object.keys(rest).map((k) => {
      const translation = keyTranslations[k];
      const label = translation
        ? translate({ id: translation.id, message: translation.message })
        : `${k}:`;
      return (
        <span key={k}>
          <strong>{label} </strong>
          {typeof rest[k] === "object"
            ? JSON.stringify(rest[k], null, 2)
            : String(rest[k])}
        </span>
      );
    });
  return (
    <details className="openapi-security__details" open={false}>
      <summary className="openapi-security__summary-container">
        <h4 className="openapi-security__summary-header">
          Authorization: {selectedAuth[0].name ?? selectedAuth[0].type}
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
                        id: OPENAPI_SECURITY_SCHEMES.NAME,
                        message: "name:",
                      })}
                    </strong>{" "}
                    <Link to={infoAuthPath}>{name ?? key}</Link>
                  </span>
                  <span>
                    <strong>
                      {translate({
                        id: OPENAPI_SECURITY_SCHEMES.TYPE,
                        message: "type:",
                      })}
                    </strong>{" "}
                    {type}
                  </span>
                  {scopes && scopes.length > 0 && (
                    <span>
                      <strong>
                        {translate({
                          id: OPENAPI_SECURITY_SCHEMES.SCOPES,
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
                        id: OPENAPI_SECURITY_SCHEMES.NAME,
                        message: "name:",
                      })}
                    </strong>{" "}
                    <Link to={infoAuthPath}>{name ?? key}</Link>
                  </span>
                  <span>
                    <strong>
                      {translate({
                        id: OPENAPI_SECURITY_SCHEMES.TYPE,
                        message: "type:",
                      })}
                    </strong>{" "}
                    {type}
                  </span>
                  {scopes && scopes.length > 0 && (
                    <span>
                      <strong>
                        {translate({
                          id: OPENAPI_SECURITY_SCHEMES.SCOPES,
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
                      id: OPENAPI_SECURITY_SCHEMES.NAME,
                      message: "name:",
                    })}
                  </strong>{" "}
                  <Link to={infoAuthPath}>{auth.name ?? auth.key}</Link>
                </span>
                <span>
                  <strong>
                    {translate({
                      id: OPENAPI_SECURITY_SCHEMES.TYPE,
                      message: "type:",
                    })}
                  </strong>{" "}
                  {auth.type}
                </span>
                <span>
                  <strong>
                    {translate({
                      id: OPENAPI_SECURITY_SCHEMES.IN,
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
                      id: OPENAPI_SECURITY_SCHEMES.NAME,
                      message: "name:",
                    })}
                  </strong>{" "}
                  <Link to={infoAuthPath}>{name ?? key}</Link>
                </span>
                <span>
                  <strong>
                    {translate({
                      id: OPENAPI_SECURITY_SCHEMES.TYPE,
                      message: "type:",
                    })}
                  </strong>{" "}
                  {type}
                </span>
                {scopes && scopes.length > 0 && (
                  <span>
                    <strong>
                      {translate({
                        id: OPENAPI_SECURITY_SCHEMES.SCOPES,
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
                      id: OPENAPI_SECURITY_SCHEMES.NAME,
                      message: "name:",
                    })}
                  </strong>{" "}
                  <Link to={infoAuthPath}>{name ?? key}</Link>
                </span>
                <span>
                  <strong>
                    {translate({
                      id: OPENAPI_SECURITY_SCHEMES.TYPE,
                      message: "type:",
                    })}
                  </strong>{" "}
                  {type}
                </span>
                {scopes && scopes.length > 0 && (
                  <span>
                    <strong>
                      {translate({
                        id: OPENAPI_SECURITY_SCHEMES.SCOPES,
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
                          id: OPENAPI_SECURITY_SCHEMES.FLOWS,
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
                      id: OPENAPI_SECURITY_SCHEMES.NAME,
                      message: "name:",
                    })}
                  </strong>{" "}
                  <Link to={infoAuthPath}>{name ?? key}</Link>
                </span>
                <span>
                  <strong>
                    {translate({
                      id: OPENAPI_SECURITY_SCHEMES.TYPE,
                      message: "type:",
                    })}
                  </strong>{" "}
                  {type}
                </span>
                {scopes && scopes.length > 0 && (
                  <span>
                    <strong>
                      {translate({
                        id: OPENAPI_SECURITY_SCHEMES.SCOPES,
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
