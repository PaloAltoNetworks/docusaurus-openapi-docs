import produce from "immer";
import { types } from "./actions";

const reducer = produce((draft, action) => {
  switch (action.type) {
    case types.updateParam: {
      draft.params[action.param.type][
        draft.params[action.param.type].findIndex(
          (param) => param.name === action.param.name
        )
      ] = action.param;
      break;
    }
    case types.setResponse: {
      draft.response = action.response;
      break;
    }
    case types.setBody: {
      draft.body = action.body;
      break;
    }
    case types.setForm: {
      if (draft.body === undefined) {
        draft.body = {};
      }
      draft.body[action.body.key] = action.body.value;
      break;
    }
    case types.setAccept: {
      draft.accept = action.accept;
      break;
    }
    case types.setEndpoint: {
      draft.endpoint = draft.servers.find((s) => s.url === action.endpoint);
      break;
    }
    case types.setEndpointValue: {
      draft.endpoint.variables[action.key].default = action.value;
      break;
    }
    case types.setContentType: {
      draft.contentType = action.contentType;
      break;
    }
    case types.setBearerToken: {
      sessionStorage.setItem("bearerToken", action.bearerToken);
      draft.bearerToken = action.bearerToken;
      break;
    }
    case types.clearSession: {
      sessionStorage.clear();
      draft.bearerToken = undefined;
      break;
    }
    default:
      break;
  }
});

export default reducer;
