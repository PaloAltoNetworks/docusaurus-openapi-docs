/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useDoc } from "@docusaurus/theme-common/internal";
import sdk from "@paloaltonetworks/postman-collection";
import Accept from "@theme/ApiDemoPanel/Accept";
import Authorization from "@theme/ApiDemoPanel/Authorization";
import Body from "@theme/ApiDemoPanel/Body";
import Execute from "@theme/ApiDemoPanel/Execute";
import ParamOptions from "@theme/ApiDemoPanel/ParamOptions";
import Server from "@theme/ApiDemoPanel/Server";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import { ParameterObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";

import styles from "./styles.module.css";

function Request({ item }: { item: NonNullable<ApiItem> }) {
  const response = useTypedSelector((state: any) => state.response.value);
  const postman = new sdk.Request(item.postman);
  const metadata = useDoc();
  const { proxy, hide_send_button } = metadata.frontMatter;

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
            {item.servers && !hide_send_button && (
              <Execute postman={postman} proxy={proxy} />
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
