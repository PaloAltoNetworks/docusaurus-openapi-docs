/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import styles from "./styles.module.css";

interface Props {
  value?: string;
  placeholder?: string;
  password?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function FormTextInput({ value, placeholder, password, onChange }: Props) {
  placeholder = placeholder?.split("\n")[0];
  return (
    <input
      className={styles.input}
      type={password ? "password" : "text"}
      placeholder={placeholder}
      title={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
  );
}

export default FormTextInput;
