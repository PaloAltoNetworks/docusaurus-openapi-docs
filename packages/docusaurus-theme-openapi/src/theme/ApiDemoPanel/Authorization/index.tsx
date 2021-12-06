/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import clsx from "clsx";
import produce from "immer";
import { useSelector } from "react-redux";

// @ts-ignore
import FormItem from "../FormItem";
// @ts-ignore
import FormSelect from "../FormSelect";
// @ts-ignore
import FormTextInput from "../FormTextInput";
import { useActions } from "../redux/actions";
import styles from "../styles.module.css";

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

function Authorization() {
  const { setAuth, setSelectedAuthID } = useActions();
  const auth = useSelector((state: any) => state.auth);
  const selectedAuthID = useSelector((state: any) => state.selectedAuthID);
  const authOptionIDs = useSelector((state: any) => state.authOptionIDs);
  const [editing, setEditing] = useState(false);

  const noAuthorization = selectedAuthID === undefined;

  if (noAuthorization) {
    return null;
  }

  const selectedAuthIndex = authOptionIDs.indexOf(selectedAuthID);
  const selectedAuth = auth[selectedAuthIndex] as any[];

  const values = selectedAuth.flat().flatMap((a) => Object.values(a.data));
  const authenticated = !values.includes(undefined);

  if (editing) {
    return (
      <div className={styles.optionsPanel}>
        {authOptionIDs.length > 1 && (
          <FormItem label="Security Scheme">
            <FormSelect
              options={authOptionIDs}
              value={selectedAuthID}
              onChange={(e: any) => {
                setSelectedAuthID(e.target.value);
              }}
            />
          </FormItem>
        )}
        {selectedAuth.map((a, i) => {
          if (a.type === "http" && a.scheme === "bearer") {
            return (
              <FormItem label="Bearer Token" key={selectedAuthID + "-bearer"}>
                <FormTextInput
                  placeholder="Bearer Token"
                  value={a.data.token ?? ""}
                  onChange={(e: any) => {
                    const newAuth = produce(auth, (draft: any) => {
                      let value = (e.target.value ?? "").trim();
                      value = !value ? undefined : value;
                      draft[selectedAuthIndex][i].data.token = value;
                    });
                    setAuth(newAuth);
                  }}
                />
              </FormItem>
            );
          }

          if (a.type === "http" && a.scheme === "basic") {
            return (
              <React.Fragment key={selectedAuthID + "-basic"}>
                <FormItem label="Username">
                  <FormTextInput
                    placeholder="Username"
                    value={a.data.username ?? ""}
                    onChange={(e: any) => {
                      const newAuth = produce(auth, (draft: any) => {
                        let value = (e.target.value ?? "").trim();
                        value = !value ? undefined : value;
                        draft[selectedAuthIndex][i].data.username = value;
                      });
                      setAuth(newAuth);
                    }}
                  />
                </FormItem>
                <FormItem label="Password">
                  <FormTextInput
                    placeholder="Password"
                    password
                    value={a.data.password ?? ""}
                    onChange={(e: any) => {
                      const newAuth = produce(auth, (draft: any) => {
                        let value = (e.target.value ?? "").trim();
                        value = !value ? undefined : value;
                        draft[selectedAuthIndex][i].data.password = value;
                      });
                      setAuth(newAuth);
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
