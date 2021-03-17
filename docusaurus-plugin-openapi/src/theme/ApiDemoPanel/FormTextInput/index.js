import React from "react";

import styles from "./styles.module.css";

function FormTextInput({ placeholder, value, password, onChange }) {
  return (
    <input
      className={styles.input}
      type={password ? 'password' : 'text'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
  );
}

export default FormTextInput;
