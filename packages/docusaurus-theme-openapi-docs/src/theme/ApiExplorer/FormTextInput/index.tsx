/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// @ts-nocheck
import React, { useId } from "react";

import { translate } from "@docusaurus/Translate";
import { ErrorMessage } from "@hookform/error-message";
import FormLabel from "@theme/ApiExplorer/FormLabel";
import { OPENAPI_FORM } from "@theme/translationIds";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";

export interface Props {
  value?: string;
  placeholder?: string;
  password?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  paramName?: string;
  isRequired?: boolean;
  label?: string;
  type?: string;
  required?: boolean;
}

function FormTextInput({
  isRequired,
  value,
  placeholder,
  password,
  onChange,
  paramName,
  label,
  type,
  required,
}: Props) {
  const id = useId();

  placeholder = placeholder?.split("\n")[0];

  const {
    register,
    formState: { errors },
  } = useFormContext();

  const showErrorMessage = errors?.[paramName]?.message;

  return (
    <>
      {label && (
        <FormLabel htmlFor={id} label={label} type={type} required={required} />
      )}
      {paramName ? (
        <input
          {...register(paramName, {
            required: isRequired
              ? translate({
                  id: OPENAPI_FORM.FIELD_REQUIRED,
                  message: "This field is required",
                })
              : false,
          })}
          id={label ? id : undefined}
          className={clsx("openapi-explorer__form-item-input", {
            error: showErrorMessage,
          })}
          type={password ? "password" : "text"}
          placeholder={placeholder}
          title={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
      ) : (
        <input
          id={label ? id : undefined}
          className="openapi-explorer__form-item-input"
          type={password ? "password" : "text"}
          placeholder={placeholder}
          title={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
      )}
      {showErrorMessage && (
        <ErrorMessage
          errors={errors}
          name={paramName}
          render={({ message }) => (
            <div className="openapi-explorer__input-error">{message}</div>
          )}
        />
      )}
    </>
  );
}

export default FormTextInput;
