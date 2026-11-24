/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RequestStatus = "idle" | "loading" | "success" | "error";

export interface State {
  value?: string;
  code?: string;
  headers?: string;
  status?: RequestStatus;
  duration?: number;
  size?: number;
}

const initialState: State = {} as any;

export const slice = createSlice({
  name: "response",
  initialState,
  reducers: {
    setResponse: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setHeaders: (state, action: PayloadAction<string>) => {
      state.headers = action.payload;
    },
    setStatus: (state, action: PayloadAction<RequestStatus>) => {
      state.status = action.payload;
    },
    setMetrics: (
      state,
      action: PayloadAction<{ duration?: number; size?: number }>
    ) => {
      state.duration = action.payload.duration;
      state.size = action.payload.size;
    },
    clearResponse: (state) => {
      state.value = undefined;
      state.status = "idle";
      state.duration = undefined;
      state.size = undefined;
    },
    clearCode: (state) => {
      state.code = undefined;
    },
    clearHeaders: (state) => {
      state.headers = undefined;
    },
  },
});

export const {
  setResponse,
  clearResponse,
  setCode,
  clearCode,
  setHeaders,
  clearHeaders,
  setStatus,
  setMetrics,
} = slice.actions;

export default slice.reducer;
