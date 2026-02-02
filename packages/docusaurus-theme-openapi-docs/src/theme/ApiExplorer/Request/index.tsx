/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// @ts-nocheck
import React, { useState } from "react";

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { translate } from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Accept from "@theme/ApiExplorer/Accept";
import Authorization from "@theme/ApiExplorer/Authorization";
import Body from "@theme/ApiExplorer/Body";
import buildPostmanRequest from "@theme/ApiExplorer/buildPostmanRequest";
import ContentType from "@theme/ApiExplorer/ContentType";
import ParamOptions from "@theme/ApiExplorer/ParamOptions";
import {
  setResponse,
  setCode,
  clearCode,
  setHeaders,
  clearHeaders,
} from "@theme/ApiExplorer/Response/slice";
import Server from "@theme/ApiExplorer/Server";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import { OPENAPI_REQUEST } from "@theme/translationIds";
import type { ParameterObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import type { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
import type { ThemeConfig } from "docusaurus-theme-openapi-docs/src/types";
import * as sdk from "postman-collection";
import { FormProvider, useForm } from "react-hook-form";

import makeRequest, { RequestError, RequestErrorType } from "./makeRequest";

function Request({ item }: { item: ApiItem }) {
  const postman = new sdk.Request(item.postman);
  const metadata = useDoc();
  const { proxy: frontMatterProxy, hide_send_button: hideSendButton } =
    metadata.frontMatter;
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfig;
  const requestTimeout = themeConfig.api?.requestTimeout;
  const requestCredentials = themeConfig.api?.requestCredentials;
  // Frontmatter proxy (per-spec) takes precedence over theme config proxy (site-wide)
  const proxy = frontMatterProxy ?? themeConfig.api?.proxy;

  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const headerParams = useTypedSelector((state: any) => state.params.header);
  const body = useTypedSelector((state: any) => state.body);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const acceptOptions = useTypedDispatch((state: any) => state.accept.options);
  const authSelected = useTypedSelector((state: any) => state.auth.selected);
  const server = useTypedSelector((state: any) => state.server.value);
  const serverOptions = useTypedSelector((state: any) => state.server.options);
  const auth = useTypedSelector((state: any) => state.auth);
  const dispatch = useTypedDispatch();

  const [expandAccept, setExpandAccept] = useState(true);
  const [expandAuth, setExpandAuth] = useState(true);
  const [expandBody, setExpandBody] = useState(true);
  const [expandParams, setExpandParams] = useState(true);
  const [expandServer, setExpandServer] = useState(true);

  const allParams = [
    ...pathParams,
    ...queryParams,
    ...cookieParams,
    ...headerParams,
  ];

  const postmanRequest = buildPostmanRequest(postman, {
    queryParams,
    pathParams,
    cookieParams,
    contentType,
    accept,
    headerParams,
    body,
    server,
    auth,
  });

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const paramsObject = {
    path: [] as ParameterObject[],
    query: [] as ParameterObject[],
    header: [] as ParameterObject[],
    cookie: [] as ParameterObject[],
  };

  item.parameters?.forEach(
    (param: { in: "path" | "query" | "header" | "cookie" }) => {
      const paramType = param.in;
      const paramsArray: ParameterObject[] = paramsObject[paramType];
      paramsArray.push(param as ParameterObject);
    }
  );

  const methods = useForm({ shouldFocusError: false });

  const handleEventStream = async (res) => {
    res.headers && dispatch(setHeaders(Object.fromEntries(res.headers)));
    dispatch(setCode(res.status));

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      dispatch(setResponse(result));
    }
  };

  const handleResponse = async (res) => {
    dispatch(setResponse(await res.text()));
    dispatch(setCode(res.status));
    res.headers && dispatch(setHeaders(Object.fromEntries(res.headers)));
  };

  const getErrorMessage = (errorType: RequestErrorType): string => {
    switch (errorType) {
      case "timeout":
        return translate({
          id: OPENAPI_REQUEST.ERROR_TIMEOUT,
          message:
            "The request timed out waiting for the server to respond. Please try again. If the issue persists, try using a different client (e.g., curl) with a longer timeout.",
        });
      case "network":
        return translate({
          id: OPENAPI_REQUEST.ERROR_NETWORK,
          message:
            "Unable to reach the server. Please check your network connection and verify the server URL is correct. If the server is running, this may be a CORS issue.",
        });
      case "cors":
        return translate({
          id: OPENAPI_REQUEST.ERROR_CORS,
          message:
            "The request was blocked, possibly due to CORS restrictions. Ensure the server allows requests from this origin, or try using a proxy.",
        });
      case "unknown":
      default:
        return translate({
          id: OPENAPI_REQUEST.ERROR_UNKNOWN,
          message:
            "An unexpected error occurred while making the request. Please try again.",
        });
    }
  };

  const onSubmit = async (data) => {
    dispatch(
      setResponse(
        translate({
          id: OPENAPI_REQUEST.FETCHING_MESSAGE,
          message: "Fetching...",
        })
      )
    );
    try {
      await delay(1200);
      const res = await makeRequest(
        postmanRequest,
        proxy,
        body,
        requestTimeout,
        requestCredentials
      );
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        await handleEventStream(res);
      } else {
        await handleResponse(res);
      }
    } catch (e) {
      console.log(e);

      let errorMessage: string;
      if (e instanceof RequestError) {
        errorMessage = getErrorMessage(e.type);
      } else {
        errorMessage = translate({
          id: OPENAPI_REQUEST.CONNECTION_FAILED,
          message: "Connection failed",
        });
      }

      dispatch(setResponse(errorMessage));
      dispatch(clearCode());
      dispatch(clearHeaders());
    }
  };

  const showServerOptions = serverOptions.length > 0;
  const showAcceptOptions = acceptOptions.length > 1;
  const showRequestBody = contentType !== undefined;
  const showRequestButton = (item.servers || proxy) && !hideSendButton;
  const showAuth = authSelected !== undefined;
  const showParams = allParams.length > 0;
  const requestBodyRequired = item.requestBody?.required;

  if (
    !showAcceptOptions &&
    !showAuth &&
    !showParams &&
    !showRequestBody &&
    !showServerOptions &&
    !showRequestButton
  ) {
    return null;
  }

  const expandAllDetails = () => {
    setExpandAccept(true);
    setExpandAuth(true);
    setExpandBody(true);
    setExpandParams(true);
    setExpandServer(true);
  };

  const collapseAllDetails = () => {
    setExpandAccept(false);
    setExpandAuth(false);
    setExpandBody(false);
    setExpandParams(false);
    setExpandServer(false);
  };

  const allDetailsExpanded =
    expandParams && expandBody && expandServer && expandAuth && expandAccept;

  return (
    <FormProvider {...methods}>
      <form
        className="openapi-explorer__request-form"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className="openapi-explorer__request-header-container">
          <span className="openapi-explorer__request-title">
            {translate({
              id: OPENAPI_REQUEST.REQUEST_TITLE,
              message: "Request",
            })}
          </span>
          {allDetailsExpanded ? (
            <span
              className="openapi-explorer__expand-details-btn"
              onClick={collapseAllDetails}
            >
              {translate({
                id: OPENAPI_REQUEST.COLLAPSE_ALL,
                message: "Collapse all",
              })}
            </span>
          ) : (
            <span
              className="openapi-explorer__expand-details-btn"
              onClick={expandAllDetails}
            >
              {translate({
                id: OPENAPI_REQUEST.EXPAND_ALL,
                message: "Expand all",
              })}
            </span>
          )}
        </div>
        <div className="openapi-explorer__details-outer-container">
          {showServerOptions && item.method !== "event" && (
            <details
              open={expandServer}
              className="openapi-explorer__details-container"
            >
              <summary
                className="openapi-explorer__details-summary"
                onClick={(e) => {
                  e.preventDefault();
                  setExpandServer(!expandServer);
                }}
              >
                {translate({
                  id: OPENAPI_REQUEST.BASE_URL_TITLE,
                  message: "Base URL",
                })}
              </summary>
              <Server />
            </details>
          )}
          {showAuth && (
            <details
              open={expandAuth}
              className="openapi-explorer__details-container"
            >
              <summary
                className="openapi-explorer__details-summary"
                onClick={(e) => {
                  e.preventDefault();
                  setExpandAuth(!expandAuth);
                }}
              >
                {translate({ id: OPENAPI_REQUEST.AUTH_TITLE, message: "Auth" })}
              </summary>
              <Authorization />
            </details>
          )}
          {showParams && (
            <details
              open={
                expandParams || Object.keys(methods.formState.errors).length
              }
              className="openapi-explorer__details-container"
            >
              <summary
                className="openapi-explorer__details-summary"
                onClick={(e) => {
                  e.preventDefault();
                  setExpandParams(!expandParams);
                }}
              >
                {translate({
                  id: OPENAPI_REQUEST.PARAMETERS_TITLE,
                  message: "Parameters",
                })}
              </summary>
              <ParamOptions />
            </details>
          )}
          {showRequestBody && (
            <details
              open={expandBody}
              className="openapi-explorer__details-container"
            >
              <summary
                className="openapi-explorer__details-summary"
                onClick={(e) => {
                  e.preventDefault();
                  setExpandBody(!expandBody);
                }}
              >
                {translate({ id: OPENAPI_REQUEST.BODY_TITLE, message: "Body" })}
                {requestBodyRequired && (
                  <span className="openapi-schema__required">
                    &nbsp;
                    {translate({
                      id: OPENAPI_REQUEST.REQUIRED_LABEL,
                      message: "required",
                    })}
                  </span>
                )}
              </summary>
              <>
                <ContentType />
                <Body
                  jsonRequestBodyExample={item.jsonRequestBodyExample}
                  requestBodyMetadata={item.requestBody}
                  required={requestBodyRequired}
                />
              </>
            </details>
          )}
          {showAcceptOptions && (
            <details
              open={expandAccept}
              className="openapi-explorer__details-container"
            >
              <summary
                className="openapi-explorer__details-summary"
                onClick={(e) => {
                  e.preventDefault();
                  setExpandAccept(!expandAccept);
                }}
              >
                {translate({
                  id: OPENAPI_REQUEST.ACCEPT_TITLE,
                  message: "Accept",
                })}
              </summary>
              <Accept />
            </details>
          )}
          {showRequestButton && item.method !== "event" && (
            <button className="openapi-explorer__request-btn" type="submit">
              {translate({
                id: OPENAPI_REQUEST.SEND_BUTTON,
                message: "Send API Request",
              })}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

export default Request;
