/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect } from "react";

import FormTextInput from "@theme/ApiExplorer/FormTextInput";
import { Param, setParam } from "@theme/ApiExplorer/ParamOptions/slice";
import { useTypedDispatch } from "@theme/ApiItem/hooks";
import { useFormContext } from "react-hook-form";

export interface ParamProps {
  param: Param;
  label?: string;
  type?: string;
  required?: boolean;
}

export default function ParamTextFormItem({
  param,
  label,
  type,
  required,
}: ParamProps) {
  const dispatch = useTypedDispatch();
  const { setValue } = useFormContext();

  useEffect(() => {
    if (param.value !== undefined && !Array.isArray(param.value)) {
      setValue(param.name, param.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormTextInput
      label={label}
      type={type}
      required={required}
      isRequired={param.required}
      paramName={param.name}
      placeholder={param.description || param.name}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        dispatch(
          setParam({
            ...param,
            value:
              param.in === "path"
                ? e.target.value.replace(/\s/g, "%20")
                : param.in === "query"
                  ? encodeURIComponent(e.target.value)
                  : e.target.value,
          })
        )
      }
    />
  );
}
