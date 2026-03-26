/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useId } from "react";

import FormLabel from "@theme/ApiExplorer/FormLabel";

export interface Props {
  value?: string;
  options?: string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  label?: string;
  type?: string;
  required?: boolean;
  ariaLabelledBy?: string;
  ariaLabel?: string;
}

function FormSelect({
  value,
  options,
  onChange,
  label,
  type,
  required,
  ariaLabelledBy,
  ariaLabel,
}: Props) {
  const id = useId();

  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  return (
    <>
      {label && (
        <FormLabel htmlFor={id} label={label} type={type} required={required} />
      )}
      <select
        id={label ? id : undefined}
        className="openapi-explorer__select-input"
        value={value}
        onChange={onChange}
        aria-labelledby={!label ? ariaLabelledBy : undefined}
        aria-label={!label && !ariaLabelledBy ? ariaLabel : undefined}
      >
        {options.map((option) => {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>
    </>
  );
}

export default FormSelect;
