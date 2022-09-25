/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import { useTypedDispatch, useTypedSelector } from "../../ApiItem/hooks";
import FloatingButton from "../FloatingButton";
import FormItem from "./../FormItem";
import FormSelect from "./../FormSelect";
import FormTextInput from "./../FormTextInput";
import { setServer, setServerVariable } from "./slice";
import styles from "./styles.module.css";

function Server() {
  const [isEditing, setIsEditing] = useState(false);
  const value = useTypedSelector((state) => state.server.value);
  const options = useTypedSelector((state) => state.server.options);

  const dispatch = useTypedDispatch();

  if (options.length <= 0) {
    return null;
  }

  if (options.length < 1 && value?.variables === undefined) {
    return null;
  }

  if (!isEditing) {
    let url = "";
    if (value) {
      url = value.url.replace(/\/$/, "");
      if (value.variables) {
        Object.keys(value.variables).forEach((variable) => {
          url = url.replace(
            `{${variable}}`,
            value.variables?.[variable].default ?? ""
          );
        });
      }
    }
    return (
      <FloatingButton onClick={() => setIsEditing(true)} label="Edit">
        <pre
          style={{
            background: "var(--openapi-card-background-color)",
            paddingRight: "60px",
          }}
        >
          <code>{url}</code>
        </pre>
      </FloatingButton>
    );
  }

  return (
    <div className={styles.optionsPanel}>
      <button
        className={styles.showMoreButton}
        onClick={() => setIsEditing(false)}
        tabIndex={0}
      >
        Hide
      </button>
      <FormItem label="Base URL">
        <FormSelect
          options={options.map((s) => s.url)}
          onChange={(e) => dispatch(setServer(e.target.value))}
        />
        <small>{value?.description}</small>
      </FormItem>
      {value?.variables &&
        Object.keys(value.variables).map((key) => {
          if (value.variables?.[key].enum !== undefined) {
            return (
              <FormItem label={key}>
                <FormSelect
                  options={value.variables[key].enum}
                  onChange={(e) => {
                    dispatch(setServerVariable({ key, value: e.target.value }));
                  }}
                />
              </FormItem>
            );
          }
          return (
            <FormItem label={key}>
              <FormTextInput
                placeholder={value.variables?.[key].default}
                onChange={(e) => {
                  dispatch(setServerVariable({ key, value: e.target.value }));
                }}
              />
            </FormItem>
          );
        })}
    </div>
  );
}

export default Server;
