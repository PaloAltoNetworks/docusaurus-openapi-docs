import React from 'react';

import styles from './styles.module.css';

function FormTextInput({ placeholder, value, onChange }) {
  return (
    <input
      className={styles.input}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
  );
}

export default FormTextInput;
