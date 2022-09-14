/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Link from "@docusaurus/Link";

import { useTypedSelector } from "../hooks";

function SecuritySchemes(props: any) {
  const options = useTypedSelector((state) => state.auth.options);
  const selected = useTypedSelector((state) => state.auth.selected);
  const infoAuthPath = `/${props.infoPath}#authentication`;

  if (selected === undefined) return null;

  const selectedAuth = options[selected];

  return (
    <div style={{ marginBottom: "var(--ifm-table-cell-padding)" }}>
      {selectedAuth.map((auth) => {
        const isApiKey = auth.type === "apiKey";
        const isBearer = auth.type === "http" && auth.key === "Bearer";
        const isClientCredentials =
          auth.type === "oauth2" && auth.key === "ClientCredentials";
        if (isApiKey || isBearer) {
          return (
            <React.Fragment key={auth.key}>
              <b>
                Authorization: <Link to={infoAuthPath}>{auth.key}</Link>
              </b>
              <pre
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--openapi-card-background-color)",
                  borderRadius: "var(--openapi-card-border-radius)",
                }}
              >
                <span>name: {auth.name}</span>
                <span>in: {auth.in}</span>
                <span>type: {auth.type}</span>
              </pre>
            </React.Fragment>
          );
        }

        if (isClientCredentials) {
          return (
            <React.Fragment key={auth.key}>
              <b>Authorization: {auth.key}</b>
              <pre
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--openapi-card-background-color)",
                  borderRadius: "var(--openapi-card-border-radius)",
                }}
              >
                <span>type: {auth.type}</span>
              </pre>
            </React.Fragment>
          );
        }

        return null;
      })}
    </div>
  );
}

export default SecuritySchemes;
