/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useState } from "react";

import FormTextInput from "@theme/ApiExplorer/FormTextInput";
import { Param, setParam } from "@theme/ApiExplorer/ParamOptions/slice";
import { useTypedDispatch } from "@theme/ApiItem/hooks";

export interface ParamProps {
  param: Param;
}

export default function ParamTextFormItem({ param }: ParamProps) {
  const dispatch = useTypedDispatch();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (param.schema?.default) {
      setInputValue(param.schema.default);
      dispatch(
        setParam({
          ...param,
          value: param.schema.default,
        })
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      param.in === "path" || param.in === "query"
        ? e.target.value.replace(/\s/g, "%20")
        : e.target.value;
    setInputValue(newValue);
    dispatch(
      setParam({
        ...param,
        value: newValue,
      })
    );
  };

  return (
    <FormTextInput
      isRequired={param.required}
      paramName={param.name}
      placeholder={param.description || param.name}
      value={inputValue}
      onChange={handleChange}
    />
  );
}
