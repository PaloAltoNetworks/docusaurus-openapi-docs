/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { HtmlClassNameProvider } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useIsBrowser from "@docusaurus/useIsBrowser";
import type { Props } from "@theme/DocItem";
import { ServerObject } from "docusaurus-plugin-openapi-docs/lib/openapi/types";
import type { ApiItem as ApiItemType } from "docusaurus-plugin-openapi-docs/lib/types";
import { ParameterObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import { Provider } from "react-redux";

import { DocFrontMatter } from "../../types";
import { ThemeConfig } from "../../types";
import { createAuth } from "../ApiDemoPanel/Authorization/slice";
import { createPersistanceMiddleware } from "../ApiDemoPanel/persistanceMiddleware";
import DocItemLayout from "./Layout";
import DocItemMetadata from "./Metadata";
import { createStoreWithoutState, createStoreWithState } from "./store";

const { DocProvider } = require("@docusaurus/theme-common/internal");

let ApiDemoPanel = (_: { item: any; infoPath: any }) => <div />;

if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}

interface ApiFrontMatter extends DocFrontMatter {
  readonly api?: ApiItemType;
}

export default function ApiItem(props: Props): JSX.Element {
  const docHtmlClassName = `docs-doc-id-${props.content.metadata.unversionedId}`;
  const MDXComponent = props.content;
  const { frontMatter } = MDXComponent;
  const { info_path: infoPath } = frontMatter as DocFrontMatter;
  const { api } = frontMatter as ApiFrontMatter;
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfig;
  const options = themeConfig.api;
  const isBrowser = useIsBrowser();

  // Define store2
  let store2: any = {};
  const persistanceMiddleware = createPersistanceMiddleware(options);

  // Init store for SSR
  if (!isBrowser) {
    store2 = createStoreWithoutState({}, [persistanceMiddleware]);
  }

  // Init store for CSR to hydrate components
  if (isBrowser) {
    const acceptArray = Array.from(
      new Set(
        Object.values(api?.responses ?? {})
          .map((response: any) => Object.keys(response.content ?? {}))
          .flat()
      )
    );
    const content = api?.requestBody?.content ?? {};
    const contentTypeArray = Object.keys(content);
    const servers = api?.servers ?? [];
    const params = {
      path: [] as ParameterObject[],
      query: [] as ParameterObject[],
      header: [] as ParameterObject[],
      cookie: [] as ParameterObject[],
    };
    api?.parameters?.forEach(
      (param: { in: "path" | "query" | "header" | "cookie" }) => {
        const paramType = param.in;
        const paramsArray: ParameterObject[] = params[paramType];
        paramsArray.push(param as ParameterObject);
      }
    );
    const auth = createAuth({
      security: api?.security,
      securitySchemes: api?.securitySchemes,
      options,
    });
    // TODO: determine way to rehydrate without flashing
    // const acceptValue = window?.sessionStorage.getItem("accept");
    // const contentTypeValue = window?.sessionStorage.getItem("contentType");
    const server = window?.sessionStorage.getItem("server");
    const serverObject = (JSON.parse(server!) as ServerObject) ?? {};

    store2 = createStoreWithState(
      {
        accept: {
          value: acceptArray[0],
          options: acceptArray,
        },
        contentType: {
          value: contentTypeArray[0],
          options: contentTypeArray,
        },
        server: {
          value: serverObject.url ? serverObject : undefined,
          options: servers,
        },
        response: { value: undefined },
        body: { type: "empty" },
        params,
        auth,
      },
      [persistanceMiddleware]
    );
  }

  if (api) {
    return (
      <DocProvider content={props.content}>
        <HtmlClassNameProvider className={docHtmlClassName}>
          <DocItemMetadata />
          <DocItemLayout>
            <Provider store={store2}>
              <div className="row">
                <div className="col col--7">
                  <MDXComponent />
                </div>
                <div className="col col--5">
                  <BrowserOnly fallback={<div>Loading...</div>}>
                    {() => {
                      return <ApiDemoPanel item={api} infoPath={infoPath} />;
                    }}
                  </BrowserOnly>
                </div>
              </div>
            </Provider>
          </DocItemLayout>
        </HtmlClassNameProvider>
      </DocProvider>
    );
  }

  // Non-API docs
  return (
    <DocProvider content={props.content}>
      <HtmlClassNameProvider className={docHtmlClassName}>
        <DocItemMetadata />
        <DocItemLayout>
          <div className="row">
            <div className="col col--12">
              <MDXComponent />
            </div>
          </div>
        </DocItemLayout>
      </HtmlClassNameProvider>
    </DocProvider>
  );
}
