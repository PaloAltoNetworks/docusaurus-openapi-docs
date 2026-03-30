/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Maps form field name → user-selected content type
export type State = Record<string, string>;

const initialState: State = {};

export const slice = createSlice({
  name: "encodingSelection",
  initialState,
  reducers: {
    setFieldEncoding: (
      state,
      action: PayloadAction<{ field: string; contentType: string }>
    ) => {
      state[action.payload.field] = action.payload.contentType;
    },
    clearEncodingSelection: () => initialState,
  },
});

export const { setFieldEncoding, clearEncodingSelection } = slice.actions;

export default slice.reducer;
