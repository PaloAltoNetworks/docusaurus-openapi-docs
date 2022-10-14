/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import sdk from "@paloaltonetworks/postman-collection";
import { ParameterObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";

import { ThemeConfig } from "../../../types";
import { useTypedSelector } from "../../ApiItem/hooks";
import Accept from "../Accept";
import Authorization from "../Authorization";
import Body from "../Body";
import Execute from "../Execute";
import ParamOptions from "../ParamOptions";
import Server from "../Server";
import styles from "./styles.module.css";

function Request({ item }: { item: NonNullable<ApiItem> }) {
  const response = useTypedSelector((state) => state.response.value);
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfig;
  const options = themeConfig.api;
  const postman = new sdk.Request(item.postman);

  const params = {
    path: [] as ParameterObject[],
    query: [] as ParameterObject[],
    header: [] as ParameterObject[],
    cookie: [] as ParameterObject[],
  };

  item.parameters?.forEach(
    (param: { in: "path" | "query" | "header" | "cookie" }) => {
      const paramType = param.in;
      const paramsArray: ParameterObject[] = params[paramType];
      paramsArray.push(param as ParameterObject);
    }
  );

  return (
    <div>
      <details className={`details__demo-panel`} open={response ? false : true}>
        <summary>
          <div className={`details__request-summary`}>
            <h4>Request</h4>
            {item.servers && (
              <Execute postman={postman} proxy={options?.proxy} />
            )}
          </div>
        </summary>
        <div className={styles.optionsPanel}>
          <Server />
          <Authorization />
          <ParamOptions />
          <Body
            jsonRequestBodyExample={item.jsonRequestBodyExample}
            requestBodyMetadata={item.requestBody}
          />
          <Accept />
        </div>
      </details>
    </div>
  );
}

export default Request;
