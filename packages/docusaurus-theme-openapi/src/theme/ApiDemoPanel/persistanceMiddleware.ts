/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Middleware } from "@reduxjs/toolkit";

import { ThemeConfig } from "../../types";
import { setAuthData, setSelectedAuth } from "./Authorization/slice";
import { createStorage, hashArray } from "./storage-utils";
import { AppDispatch, RootState } from "./store";

export function createPersistanceMiddleware(options: ThemeConfig["api"]) {
  const persistanceMiddleware: Middleware<{}, RootState, AppDispatch> =
    (storeAPI) => (next) => (action) => {
      const result = next(action);

      const state = storeAPI.getState();

      const storage = createStorage(options?.authPersistance);

      if (action.type === setAuthData.type) {
        for (const [key, value] of Object.entries(state.auth.data)) {
          if (Object.values(value).filter(Boolean).length > 0) {
            storage.setItem(key, JSON.stringify(value));
          } else {
            storage.removeItem(key);
          }
        }
      }

      if (action.type === setSelectedAuth.type) {
        if (state.auth.selected) {
          storage.setItem(
            hashArray(Object.keys(state.auth.options)),
            state.auth.selected
          );
        }
      }

      return result;
    };
  return persistanceMiddleware;
}
