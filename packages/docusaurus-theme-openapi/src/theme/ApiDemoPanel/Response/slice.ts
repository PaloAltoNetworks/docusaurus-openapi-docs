/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface State {
  value?: string;
}

const initialState: State = {} as any;

export const slice = createSlice({
  name: "response",
  initialState,
  reducers: {
    setResponse: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    clearResponse: (state) => {
      state.value = undefined;
    },
  },
});

export const { setResponse, clearResponse } = slice.actions;

export default slice.reducer;
