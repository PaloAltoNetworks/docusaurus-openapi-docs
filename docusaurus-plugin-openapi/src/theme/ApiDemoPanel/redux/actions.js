import { useDispatch } from 'react-redux';

export const types = {
  updateParam: 'UPDATE_PARAM',
  setResponse: 'SET_RESPONSE',
  setBody: 'SET_BODY',
  setForm: 'SET_FORM',
  setAccept: 'SET_ACCEPT',
  setContentType: 'SET_CONTENT_TYPE',
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

  return {
    setAccept,
    setContentType,
    updateParam,
    setResponse,
    clearResponse,
    setBody,
    setForm,
  };
}
