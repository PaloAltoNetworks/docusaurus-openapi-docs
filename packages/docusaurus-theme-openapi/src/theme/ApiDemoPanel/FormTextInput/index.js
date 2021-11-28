/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import styles from "./styles.module.css";

function FormTextInput({ placeholder, value, password, onChange }) {
  return (
    <input
      className={styles.input}
      type={password ? "password" : "text"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
  );
}

export default FormTextInput;
