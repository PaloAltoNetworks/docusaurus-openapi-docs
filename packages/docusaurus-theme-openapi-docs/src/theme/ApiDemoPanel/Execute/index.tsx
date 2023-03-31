/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
// @ts-nocheck
import React from "react";

import sdk from "@paloaltonetworks/postman-collection";
import buildPostmanRequest from "@theme/ApiDemoPanel/buildPostmanRequest";
import { Param } from "@theme/ApiDemoPanel/ParamOptions/slice";
import {
  setResponse,
  setCode,
  clearCode,
  setHeaders,
  clearHeaders,
} from "@theme/ApiDemoPanel/Response/slice";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import Modal from "react-modal";

import makeRequest from "./makeRequest";

function validateRequest(params: {
  path: Param[];
  query: Param[];
  header: Param[];
  cookie: Param[];
}) {
  for (let paramList of Object.values(params)) {
    for (let param of paramList) {
      if (param.required && !param.value) {
        return false;
      }
    }
  }
  return true;
}

export interface Props {
  postman: sdk.Request;
  proxy?: string;
}

function Execute({ postman, proxy }: Props) {
  // Execute takes all the necessary params from the redux store to validate, and create a postmanRequest
  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const headerParams = useTypedSelector((state: any) => state.params.header);
  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const body = useTypedSelector((state: any) => state.body);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const server = useTypedSelector((state: any) => state.server.value);
  const params = useTypedSelector((state: any) => state.params);
  const auth = useTypedSelector((state: any) => state.auth);

  const isValidRequest = validateRequest(params);

  const dispatch = useTypedDispatch();

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

  return (
    <input
      value="Send API Request"
      className="button button--sm button--secondary"
      disabled={!isValidRequest}
      style={!isValidRequest ? { pointerEvents: "all" } : {}}
      onClick={async () => {
        dispatch(setResponse("Fetching..."));
        try {
          await delay(1200);
          const res = await makeRequest(postmanRequest, proxy, body);
          dispatch(setResponse(await res.text()));
          dispatch(setCode(res.status));
          res.headers && dispatch(setHeaders(Object.fromEntries(res.headers)));
        } catch (e: any) {
          console.log(e);
          dispatch(setResponse("Connection failed"));
          dispatch(clearCode());
          dispatch(clearHeaders());
        }
      }}
    />
  );
}

export default Execute;
