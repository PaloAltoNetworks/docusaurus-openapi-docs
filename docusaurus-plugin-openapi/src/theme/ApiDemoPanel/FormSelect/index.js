import React from "react";

import styles from "./styles.module.css";

function FormSelect({ options, value, onChange }) {
  if (options.length === 0) {
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
