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

  if (!value) {
    const defaultOption = options[0];
    dispatch(setServer(JSON.stringify(defaultOption)));
  }

  // Default to first option when existing server state is mismatched
  if (value) {
    const urlExists = options.find((s) => s.url === value.url);
    if (!urlExists) {
      const defaultOption = options[0];
      dispatch(setServer(JSON.stringify(defaultOption)));
    }
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
        <FormItem label="Base URL">
          <pre
            style={{
              background: "var(--openapi-card-background-color)",
              paddingLeft: "0px",
            }}
          >
            <code title={url}>{url}</code>
          </pre>
        </FormItem>
      </FloatingButton>
    );
  }
  return (
    <div className={styles.optionsPanel}>
      <FloatingButton onClick={() => setIsEditing(false)} label="Hide">
        <FormItem label="Base URL">
          <FormSelect
            options={options.map((s) => s.url)}
            onChange={(e) => {
              dispatch(
                setServer(
                  JSON.stringify(
                    options.filter((s) => s.url === e.target.value)[0]
                  )
                )
              );
            }}
            value={value?.url}
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
                      dispatch(
                        setServerVariable(
                          JSON.stringify({ key, value: e.target.value })
                        )
                      );
                    }}
                    value={value?.variables[key].default}
                  />
                </FormItem>
              );
            }
            return (
              <FormItem label={key}>
                <FormTextInput
                  placeholder={value.variables?.[key].default}
                  onChange={(e) => {
                    dispatch(
                      setServerVariable(
                        JSON.stringify({ key, value: e.target.value })
                      )
                    );
                  }}
                  value={value?.variables?.[key].default}
                />
              </FormItem>
            );
          })}
      </FloatingButton>
    </div>
  );
}

export default Server;
