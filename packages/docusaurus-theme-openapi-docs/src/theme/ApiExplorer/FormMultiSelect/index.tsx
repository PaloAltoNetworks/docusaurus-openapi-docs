/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useId } from "react";

import FormLabel from "@theme/ApiExplorer/FormLabel";
import clsx from "clsx";

export interface Props {
  value?: string;
  options: string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  showErrors?: boolean;
  label?: string;
  type?: string;
  required?: boolean;
}

function FormMultiSelect({
  value,
  options,
  onChange,
  showErrors,
  label,
  type,
  required,
}: Props) {
  const id = useId();

  if (options.length === 0) {
    return null;
  }

  let height;
  if (options.length < 6) {
    const selectPadding = 12 * 2;
    const rawHeight = options.length * 29;
    const innerMargins = 4 * options.length - 1;
    const outerMargins = 4 * 2;
    const mysteryScroll = 1;
    height =
      rawHeight + innerMargins + outerMargins + selectPadding + mysteryScroll;
  }

  return (
    <>
      {label && (
        <FormLabel htmlFor={id} label={label} type={type} required={required} />
      )}
      <select
        id={label ? id : undefined}
        style={{ height: height }}
        className={clsx("openapi-explorer__multi-select-input", {
          error: showErrors,
        })}
        value={value}
        onChange={onChange}
        size={Math.min(6, options.length + 1)}
        multiple
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

export default FormMultiSelect;
