/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect } from "react";

import { translate } from "@docusaurus/Translate";
import { ErrorMessage } from "@hookform/error-message";
import FormSelect from "@theme/ApiExplorer/FormSelect";
import { getSchemaEnum } from "@theme/ApiExplorer/ParamOptions";
import { Param, setParam } from "@theme/ApiExplorer/ParamOptions/slice";
import { useTypedDispatch } from "@theme/ApiItem/hooks";
import { OPENAPI_FORM } from "@theme/translationIds";
import { Controller, useFormContext } from "react-hook-form";

export interface ParamProps {
  param: Param;
  label?: string;
  type?: string;
  required?: boolean;
}

export default function ParamSelectFormItem({
  param,
  label,
  type,
  required,
}: ParamProps) {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext();

  const showErrorMessage = errors?.paramSelect;

  const dispatch = useTypedDispatch();

  const options = getSchemaEnum(param.schema) ?? [];

  useEffect(() => {
    if (
      typeof param.value === "string" &&
      (options as string[]).includes(param.value)
    ) {
      setValue("paramSelect", param.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Controller
        control={control}
        rules={{
          required: param.required
            ? translate({
                id: OPENAPI_FORM.FIELD_REQUIRED,
                message: "This field is required",
              })
            : false,
        }}
        name="paramSelect"
        render={({ field: { onChange, value } }) => (
          <FormSelect
            label={label}
            type={type}
            required={required}
            value={value ?? "---"}
            options={["---", ...(options as string[])]}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const val = e.target.value;
              dispatch(
                setParam({
                  ...param,
                  value: val === "---" ? undefined : val,
                })
              );
              onChange(val);
            }}
          />
        )}
      />
      {showErrorMessage && (
        <ErrorMessage
          errors={errors}
          name="paramSelect"
          render={({ message }) => (
            <div className="openapi-explorer__input-error">{message}</div>
          )}
        />
      )}
    </>
  );
}
