/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ParameterObject } from "docusaurus-plugin-openapi-docs-slashid/src/openapi/types";
import { values } from "lodash";

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
    resetParams: (state) => {
      ["path", "query", "header", "cookie"].forEach((group) => {
        // @ts-ignore
        state[group].forEach((p) => (p.value = undefined));
      });
    },
  },
});

export const { setParam, resetParams } = slice.actions;

export default slice.reducer;
