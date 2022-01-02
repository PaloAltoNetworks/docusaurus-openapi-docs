/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// TODO: we might want to export this
import { ServerObject } from "docusaurus-plugin-openapi/src/openapi/types";

export interface State {
  value?: ServerObject;
  options: ServerObject[];
}

const initialState: State = {} as any;

export const slice = createSlice({
  name: "server",
  initialState,
  reducers: {
    setServer: (state, action: PayloadAction<string>) => {
      state.value = state.options.find((s) => s.url === action.payload);
    },
    setServerVariable: (
      state,
      action: PayloadAction<{ key: string; value: string }>
    ) => {
      if (state.value?.variables) {
        state.value.variables[action.payload.key].default =
          action.payload.value;
      }
    },
  },
});

export const { setServer, setServerVariable } = slice.actions;

export default slice.reducer;
