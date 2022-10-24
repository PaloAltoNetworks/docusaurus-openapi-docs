/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface State {
  value?: string;
  status?: string;
  headers?: string;
}

const initialState: State = {} as any;

export const slice = createSlice({
  name: "response",
  initialState,
  reducers: {
    setResponse: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
    clearResponse: (state) => {
      state.value = undefined;
    },
    clearStatus: (state) => {
      state.status = undefined;
    },
  },
});

export const { setResponse, clearResponse, setStatus, clearStatus } =
  slice.actions;

export default slice.reducer;
