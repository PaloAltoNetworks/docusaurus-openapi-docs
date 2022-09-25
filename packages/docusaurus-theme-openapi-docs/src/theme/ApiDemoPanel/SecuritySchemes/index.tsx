/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Link from "@docusaurus/Link";

import { useTypedSelector } from "../../ApiItem/hooks";

function SecuritySchemes(props: any) {
  const options = useTypedSelector((state) => state.auth.options);
  const selected = useTypedSelector((state) => state.auth.selected);
  const infoAuthPath = `/${props.infoPath}#authentication`;

  if (selected === undefined) return null;

  const selectedAuth = options[selected];
  return (
    <details className={`details__demo-panel`} open={false}>
      <summary className={`details__request-summary`}>
        <h4>Authorization</h4>
      </summary>
      {selectedAuth.map((auth) => {
        const isApiKey = auth.type === "apiKey";
        const isBearer = auth.type === "http" && auth.key === "Bearer";
        const isOauth2 = auth.type === "oauth2";

        if (isApiKey || isBearer) {
          return (
            <React.Fragment key={auth.key}>
              <pre
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--openapi-card-background-color)",
                }}
              >
                <span>type: {auth.type}</span>
                <span>
                  name: <Link to={infoAuthPath}>{auth.name}</Link>
                </span>
                <span>in: {auth.in}</span>
              </pre>
            </React.Fragment>
          );
        }

        if (isOauth2) {
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
                  type: <Link to={infoAuthPath}>{auth.type}</Link>
                </span>
                {Object.keys(auth.flows).map((flow) => {
                  return <span key={flow}>flow: {flow}</span>;
                })}
                <span>
                  scopes: <code>{auth.scopes.toString()}</code>
                </span>
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
