/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { ParameterObject } from "@paloaltonetworks/docusaurus-plugin-openapi/src/openapi/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Param = ParameterObject & { value?: string[] | string };

export interface State {
  path: Param[];
  query: Param[];
  header: Param[];
  cookie: Param[];
}

const initialState: State = {} as any;

export const slice = createSlice({
  name: "params",
  initialState,
  reducers: {
    setParam: (state, action: PayloadAction<Param>) => {
      const newParam = action.payload;
      const paramGroup = state[action.payload.in];
      const index = paramGroup.findIndex((p) => p.name === newParam.name);
      paramGroup[index] = newParam;
    },
  },
});

export const { setParam } = slice.actions;

export default slice.reducer;
