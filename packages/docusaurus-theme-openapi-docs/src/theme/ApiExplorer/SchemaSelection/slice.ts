/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SchemaSelectionState {
  /**
   * Maps schema path (e.g., "requestBody", "requestBody.anyOf.0.layer3")
   * to the selected anyOf/oneOf option index
   */
  selections: { [schemaPath: string]: number };
}

const initialState: SchemaSelectionState = {
  selections: {},
};

export const slice = createSlice({
  name: "schemaSelection",
  initialState,
  reducers: {
    /**
     * Set the selected index for a specific schema path
     */
    setSchemaSelection: (
      state,
      action: PayloadAction<{ path: string; index: number }>
    ) => {
      state.selections[action.payload.path] = action.payload.index;
    },
    /**
     * Clear all schema selections (useful when navigating to a new API endpoint)
     */
    clearSchemaSelections: (state) => {
      state.selections = {};
    },
  },
});

export const { setSchemaSelection, clearSchemaSelections } = slice.actions;

export default slice.reducer;
