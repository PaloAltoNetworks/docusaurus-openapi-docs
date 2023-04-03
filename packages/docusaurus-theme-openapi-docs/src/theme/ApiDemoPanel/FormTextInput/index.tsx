/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
// @ts-nocheck
import React from "react";
import clsx from "clsx";
import { ErrorMessage } from "@hookform/error-message";

export interface Props {
  value?: string;
  placeholder?: string;
  password?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function FormTextInput({
  isRequired,
  value,
  placeholder,
  password,
  onChange,
  register,
  paramName,
  errors,
}: Props) {
  placeholder = placeholder?.split("\n")[0];

  const showErrorMessage = errors?.[paramName]?.message;
  console.log({ errors });
  // const registerInput = register ? {...register.register}
  return (
    <>
      {register ? (
        <input
          {...register(paramName, {
            required: isRequired ? "This field is required" : false,
          })}
          className={clsx("openpai-demo__form-item-input", {
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
          className="openpai-demo__form-item-input"
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
            <div className="openapi-demo__input-error">{message}</div>
          )}
        />
      )}
    </>
  );
}

export default FormTextInput;
