/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useDispatch } from "react-redux";

export const types = {
  updateParam: "UPDATE_PARAM",
  setResponse: "SET_RESPONSE",
  setBody: "SET_BODY",
  setForm: "SET_FORM",
  setAccept: "SET_ACCEPT",
  setContentType: "SET_CONTENT_TYPE",
  setEndpoint: "SET_ENDPOINT",
  setEndpointValue: "SET_ENDPOINT_VALUE",
  setAuth: "SET_AUTH",
  setSelectedAuthID: "SET_SELECTED_AUTH_ID",
};

export function useActions() {
  const dispatch = useDispatch();

  function updateParam(param: any) {
    dispatch({ type: types.updateParam, param });
  }

  function setResponse(response: any) {
    dispatch({ type: types.setResponse, response });
  }

  function clearResponse() {
    dispatch({ type: types.setResponse, response: undefined });
  }

  function setBody(body: any) {
    dispatch({ type: types.setBody, body });
  }

  function setForm(body: any) {
    dispatch({ type: types.setForm, body });
  }

  function setAccept(accept: any) {
    dispatch({ type: types.setAccept, accept });
  }

  function setContentType(contentType: any) {
    dispatch({ type: types.setContentType, contentType });
  }

  function setEndpoint(endpoint: any) {
    dispatch({ type: types.setEndpoint, endpoint });
  }

  function setEndpointValue(key: any, value: any) {
    dispatch({ type: types.setEndpointValue, key, value });
  }

  function setAuth(auth: any) {
    dispatch({ type: types.setAuth, auth });
  }

  function setSelectedAuthID(selectedAuthID: string) {
    dispatch({ type: types.setSelectedAuthID, selectedAuthID });
  }

  return {
    setAccept,
    setContentType,
    setEndpoint,
    setEndpointValue,
    updateParam,
    setResponse,
    clearResponse,
    setBody,
    setForm,
    setAuth,
    setSelectedAuthID,
  };
}
