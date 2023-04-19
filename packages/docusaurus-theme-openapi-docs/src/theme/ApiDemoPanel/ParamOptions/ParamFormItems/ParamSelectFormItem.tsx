/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import FormSelect from "@theme/ApiDemoPanel/FormSelect";
import { Param, setParam } from "@theme/ApiDemoPanel/ParamOptions/slice";
import { useTypedDispatch } from "@theme/ApiItem/hooks";

export interface ParamProps {
  param: Param;
}

export default function ParamSelectFormItem({ param }: ParamProps) {
  const dispatch = useTypedDispatch();

  const options = param.schema?.enum ?? [];

  return (
    <FormSelect
      options={["---", ...(options as string[])]}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        dispatch(
          setParam({
            ...param,
            value: val === "---" ? undefined : val,
          })
        );
      }}
    />
  );
}
