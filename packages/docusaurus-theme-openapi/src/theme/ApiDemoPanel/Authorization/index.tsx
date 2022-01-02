/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import clsx from "clsx";

import FormItem from "../FormItem";
import FormSelect from "../FormSelect";
import FormTextInput from "../FormTextInput";
import { useTypedDispatch, useTypedSelector } from "../hooks";
import styles from "../styles.module.css";
import { AuthState, Scheme, setAuthData, setSelectedAuth } from "./slice";

type Props = {
  mode: "locked" | "unlocked";
} & JSX.IntrinsicElements["button"];

function LockButton({ mode, children, style, ...rest }: Props) {
  return (
    <button
      className={clsx("button", "button--primary", {
        "button--outline": mode !== "locked",
      })}
      style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        marginBottom: "var(--ifm-spacing-vertical)",
        ...style,
      }}
      {...rest}
    >
      <span>{children}</span>

      <svg
        style={{
          marginLeft: "12px",
          width: "18px",
          height: "18px",
          fill: "currentColor",
        }}
        viewBox="0 0 20 20"
        id={mode}
      >
        {mode === "locked" ? (
          <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8zM12 8H8V5.199C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8z"></path>
        ) : (
          <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>
        )}
      </svg>
    </button>
  );
}

function validateData(selectedAuth: Scheme[], data: AuthState["data"]) {
  for (const scheme of selectedAuth) {
    if (data[scheme.key] === undefined) {
      return false;
    }
    const hasMissingKeys = Object.values(data[scheme.key]).includes(undefined);
    if (hasMissingKeys) {
      return false;
    }
  }
  return true;
}

function Authorization() {
  const [editing, setEditing] = useState(false);

  const data = useTypedSelector((state) => state.auth.data);
  const options = useTypedSelector((state) => state.auth.options);
  const selected = useTypedSelector((state) => state.auth.selected);

  const dispatch = useTypedDispatch();

  if (selected === undefined) {
    return null;
  }

  const selectedAuth = options[selected];

  const authenticated = validateData(selectedAuth, data);

  const optionKeys = Object.keys(options);

  if (editing) {
    return (
      <div className={styles.optionsPanel}>
        {optionKeys.length > 1 && (
          <FormItem label="Security Scheme">
            <FormSelect
              options={optionKeys}
              value={selected}
              onChange={(e) => {
                dispatch(setSelectedAuth(e.target.value));
              }}
            />
          </FormItem>
        )}
        {selectedAuth.map((a) => {
          if (a.type === "http" && a.scheme === "bearer") {
            return (
              <FormItem label="Bearer Token" key={selected + "-bearer"}>
                <FormTextInput
                  placeholder="Bearer Token"
                  value={data[a.key].token ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    dispatch(
                      setAuthData({
                        scheme: a.key,
                        key: "token",
                        value: value ? value : undefined,
                      })
                    );
                  }}
                />
              </FormItem>
            );
          }

          if (a.type === "http" && a.scheme === "basic") {
            return (
              <React.Fragment key={selected + "-basic"}>
                <FormItem label="Username">
                  <FormTextInput
                    placeholder="Username"
                    value={data[a.key].username ?? ""}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      dispatch(
                        setAuthData({
                          scheme: a.key,
                          key: "username",
                          value: value ? value : undefined,
                        })
                      );
                    }}
                  />
                </FormItem>
                <FormItem label="Password">
                  <FormTextInput
                    placeholder="Password"
                    password
                    value={data[a.key].password ?? ""}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      dispatch(
                        setAuthData({
                          scheme: a.key,
                          key: "password",
                          value: value ? value : undefined,
                        })
                      );
                    }}
                  />
                </FormItem>
              </React.Fragment>
            );
          }

          return null;
        })}
        <LockButton
          mode="unlocked"
          style={{
            marginTop: "var(--ifm-spacing-vertical)",
            marginBottom: 0,
          }}
          onClick={() => {
            setEditing(false);
          }}
        >
          Save
        </LockButton>
      </div>
    );
  }

  if (authenticated) {
    return (
      <LockButton
        mode="locked"
        onClick={() => {
          setEditing(true);
        }}
      >
        Authorized
      </LockButton>
    );
  }

  return (
    <LockButton
      mode="unlocked"
      onClick={() => {
        setEditing(true);
      }}
    >
      Authorize
    </LockButton>
  );
}

export default Authorization;
