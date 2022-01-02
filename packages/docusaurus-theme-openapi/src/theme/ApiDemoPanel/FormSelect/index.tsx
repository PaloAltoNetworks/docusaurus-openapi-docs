/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import styles from "./styles.module.css";

interface Props {
  value?: string;
  options?: string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

function FormSelect({ value, options, onChange }: Props) {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  return (
    <select className={styles.selectInput} value={value} onChange={onChange}>
      {options.map((option) => {
        return (
          <option key={option} value={option}>
            {option}
          </option>
        );
      })}
    </select>
  );
}

export default FormSelect;
