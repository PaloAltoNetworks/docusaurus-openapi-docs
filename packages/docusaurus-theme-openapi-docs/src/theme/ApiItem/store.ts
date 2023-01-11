/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import accept from "@theme/ApiDemoPanel/Accept/slice";
import auth from "@theme/ApiDemoPanel/Authorization/slice";
import body from "@theme/ApiDemoPanel/Body/slice";
import contentType from "@theme/ApiDemoPanel/ContentType/slice";
import params from "@theme/ApiDemoPanel/ParamOptions/slice";
import response from "@theme/ApiDemoPanel/Response/slice";
import server from "@theme/ApiDemoPanel/Server/slice";

const rootReducer = combineReducers({
  accept,
  contentType,
  response,
  server,
  body,
  params,
  auth,
});

export type RootState = ReturnType<typeof rootReducer>;

export const createStoreWithState = (
  preloadedState: RootState,
  middlewares: any[]
) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...middlewares),
  });

export const createStoreWithoutState = (
  preloadedState: {},
  middlewares: any[]
) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...middlewares),
  });

export type AppDispatch = ReturnType<typeof createStoreWithState>["dispatch"];
