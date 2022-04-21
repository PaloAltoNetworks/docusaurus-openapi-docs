/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
// @ts-ignore
import { ParameterObject } from "@paloaltonetworks/docusaurus-plugin-openapi/src/openapi/types";
// @ts-ignore
import sdk from "@paloaltonetworks/postman-collection";
// @ts-ignore
import { Metadata } from "@theme/ApiItem";
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
import SecuritySchemes from "./SecuritySchemes";
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
      Object.values(item.responses ?? {})
        // @ts-ignore
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

  item.parameters?.forEach((param: { in: string | number }) => {
    // @ts-ignore
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
      <div
        className={styles.apiDemoPanelContainer}
        style={{ marginTop: "3.5em" }}
      >
        <MethodEndpoint method={method} path={path} />

        <SecuritySchemes />

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

        <Response />
      </div>
    </Provider>
  );
}

export default ApiDemoPanel;
