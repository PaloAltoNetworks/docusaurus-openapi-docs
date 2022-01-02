/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { Metadata } from "@theme/ApiItem";
import { ParameterObject } from "docusaurus-plugin-openapi/src/openapi/types";
import sdk from "postman-collection";
import { Provider } from "react-redux";

import { ThemeConfig } from "../../types";
import Accept from "./Accept";
import Authorization from "./Authorization";
import { createAuth } from "./Authorization/slice";
import Body from "./Body";
import Curl from "./Curl";
import Execute from "./Execute";
import MethodEndpoint from "./MethodEndpoint";
import ParamOptions from "./ParamOptions";
import { createPersistanceMiddleware } from "./persistanceMiddleware";
import Response from "./Response";
import Server from "./Server";
import { createStoreWithState } from "./store";
import styles from "./styles.module.css";

function ApiDemoPanel({ item }: { item: NonNullable<Metadata["api"]> }) {
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfig;
  const options = themeConfig.api;

  const postman = new sdk.Request(item.postman);

  const acceptArray = Array.from(
    new Set(
      Object.values(item.responses)
        .map((response) => Object.keys(response.content ?? {}))
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

  item.parameters?.forEach((param) => {
    params[param.in].push(param);
  });

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
      <div style={{ marginTop: "3.5em" }}>
        <Authorization />

        {item.operationId !== undefined && (
          <div style={{ marginBottom: "var(--ifm-table-cell-padding)" }}>
            <code>
              <b>{item.operationId}</b>
            </code>
          </div>
        )}

        <MethodEndpoint method={method} path={path} />

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
