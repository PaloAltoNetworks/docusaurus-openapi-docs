/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import produce from "immer";

import { types } from "./actions";
import { persistAuth, persistSelectedAuth } from "./persistance";

const reducer = produce((draft, action) => {
  switch (action.type) {
    case types.updateParam: {
      draft.params[action.param.type][
        draft.params[action.param.type].findIndex(
          (param: any) => param.name === action.param.name
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
      draft.endpoint = draft.servers.find(
        (s: any) => s.url === action.endpoint
      );
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
    case types.setAuth: {
      //  TODO: This is a side effect and shouldn't be done here.
      persistAuth({
        security: action.auth,
        persistance: draft.options.authPersistance,
      });
      draft.auth = action.auth;
      break;
    }
    case types.setSelectedAuthID: {
      //  TODO: This is a side effect and shouldn't be done here.
      persistSelectedAuth({
        key: draft._uniqueAuthKey,
        selectedAuthID: action.selectedAuthID,
        persistance: draft.options.authPersistance,
      });
      draft.selectedAuthID = action.selectedAuthID;
      break;
    }
    default:
      break;
  }
});

export default reducer;
