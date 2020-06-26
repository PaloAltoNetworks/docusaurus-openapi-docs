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
  setBearerToken: "SET_BEARER_TOKEN",
  clearSession: "CLEAR_SESSION",
};

export function useActions() {
  const dispatch = useDispatch();

  function updateParam(param) {
    dispatch({ type: types.updateParam, param });
  }

  function setResponse(response) {
    dispatch({ type: types.setResponse, response });
  }

  function clearResponse() {
    dispatch({ type: types.setResponse, response: undefined });
  }

  function setBody(body) {
    dispatch({ type: types.setBody, body });
  }

  function setForm(body) {
    dispatch({ type: types.setForm, body });
  }

  function setAccept(accept) {
    dispatch({ type: types.setAccept, accept });
  }

  function setContentType(contentType) {
    dispatch({ type: types.setContentType, contentType });
  }

  function setEndpoint(endpoint) {
    dispatch({ type: types.setEndpoint, endpoint });
  }

  function setEndpointValue(key, value) {
    dispatch({ type: types.setEndpointValue, key, value });
  }

  function setBearerToken(bearerToken) {
    dispatch({ type: types.setBearerToken, bearerToken });
  }

  function clearSession() {
    dispatch({ type: types.clearSession });
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
    setBearerToken,
    clearSession,
  };
}
