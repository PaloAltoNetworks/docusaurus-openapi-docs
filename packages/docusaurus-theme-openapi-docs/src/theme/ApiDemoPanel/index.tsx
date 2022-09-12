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
import { Provider } from "react-redux";

import { ThemeConfig } from "../../types";
import Accept from "./Accept";
import { createAuth } from "./Authorization/slice";
import Body from "./Body";
import Curl from "./Curl";
import Execute from "./Execute";
import MethodEndpoint from "./MethodEndpoint";
import ParamOptions from "./ParamOptions";
import { createPersistanceMiddleware } from "./persistanceMiddleware";
import Response from "./Response";
import SecuritySchemes from "./SecuritySchemes";
import Server from "./Server";
import { createStoreWithState } from "./store";
import styles from "./styles.module.css";

function ApiDemoPanel({
  item,
  infoPath,
}: {
  item: NonNullable<ApiItem>;
  infoPath: string;
}) {
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfig;
  const options = themeConfig.api;
  const postman = new sdk.Request(item.postman);

  const acceptArray = Array.from(
    new Set(
      Object.values(item.responses ?? {})
        .map((response: any) => Object.keys(response.content ?? {}))
        .flat()
    )
  );

  const content = item.requestBody?.content ?? {};

  const contentTypeArray = Object.keys(content);

  const servers = item.servers ?? [];

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

  const auth = createAuth({
    security: item.security,
    securitySchemes: item.securitySchemes,
    options,
  });

  const persistanceMiddleware = createPersistanceMiddleware(options);

  const store2 = createStoreWithState(
    {
      accept: { value: acceptArray[0], options: acceptArray },
      contentType: { value: contentTypeArray[0], options: contentTypeArray },
      server: { value: servers[0], options: servers },
      response: { value: undefined },
      body: { type: "empty" },
      params,
      auth,
    },
    [persistanceMiddleware]
  );

  const { path, method } = item;

  return (
    <Provider store={store2}>
      <div className={styles.apiDemoPanelContainer}>
        <MethodEndpoint method={method} path={path} />
        <SecuritySchemes infoPath={infoPath} />
        <div className={styles.optionsPanel}>
          <ParamOptions />
          <Body
            jsonRequestBodyExample={item.jsonRequestBodyExample}
            requestBodyMetadata={item.requestBody}
          />
          <Accept />
        </div>
        <Server />
        <Curl
          postman={postman}
          codeSamples={(item as any)["x-code-samples"] ?? []}
        />
        <Execute postman={postman} proxy={options?.proxy} />

        <Response />
      </div>
    </Provider>
  );
}

export default ApiDemoPanel;
