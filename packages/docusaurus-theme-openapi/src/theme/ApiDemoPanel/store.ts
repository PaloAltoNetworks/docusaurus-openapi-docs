/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { configureStore, combineReducers } from "@reduxjs/toolkit";

import accept from "./Accept/slice";
import auth from "./Authorization/slice";
import body from "./Body/slice";
import contentType from "./ContentType/slice";
import params from "./ParamOptions/slice";
import response from "./Response/slice";
import server from "./Server/slice";

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

export type AppDispatch = ReturnType<typeof createStoreWithState>["dispatch"];
