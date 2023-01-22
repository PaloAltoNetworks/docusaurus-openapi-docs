/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Link from "@docusaurus/Link";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import clsx from "clsx";

import styles from "./styles.module.css";

function SecuritySchemes(props: any) {
  const options = useTypedSelector((state: any) => state.auth.options);
  const selected = useTypedSelector((state: any) => state.auth.selected);
  const infoAuthPath = `/${props.infoPath}#authentication`;

  if (selected === undefined) return null;

  const selectedAuth = options[selected];
  const authPropertiesClasses = clsx(
    "openapi-demo__authorization-properties",
    styles.authProperties
  );
  const authPropertiesLinkClass =
    "openapi-demo__authorization-properties__link";
  return (
    <div
      className={clsx(
        "openapi-demo__panel",
        "openapi-demo__panel--authorization"
      )}
    >
      <details className={`openapi-demo__panel__detail`} open={false}>
        <summary className={`openapi-demo__panel__summary`}>
          <h4>Authorization</h4>
        </summary>
        {selectedAuth.map((auth: any) => {
          const isApiKey = auth.type === "apiKey";
          const isBearer = auth.type === "http" && auth.key === "Bearer";
          const isOauth2 = auth.type === "oauth2";

          if (isApiKey || isBearer) {
            return (
              <React.Fragment key={auth.key}>
                <pre className={authPropertiesClasses}>
                  <span>type: {auth.type}</span>
                  <span>
                    name:{" "}
                    <Link className={authPropertiesLinkClass} to={infoAuthPath}>
                      {auth.name}
                    </Link>
                  </span>
                  <span>in: {auth.in}</span>
                </pre>
              </React.Fragment>
            );
          }

          if (isOauth2) {
            return (
              <React.Fragment key={selected}>
                <pre className={authPropertiesClasses}>
                  <span>
                    type:{" "}
                    <Link className={authPropertiesLinkClass} to={infoAuthPath}>
                      {auth.type}
                    </Link>
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
    </div>
  );
}

export default SecuritySchemes;
