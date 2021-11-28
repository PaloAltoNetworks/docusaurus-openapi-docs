/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import { useSelector } from "react-redux";

import { useActions } from "../redux/actions";
import FloatingButton from "./../FloatingButton";
import FormItem from "./../FormItem";
import FormTextInput from "./../FormTextInput";

function Authorization() {
  const security = useSelector((state) => state.security);
  const bearerToken = useSelector((state) => state.bearerToken);
  const { setBearerToken, clearSession } = useActions();
  const [editing, setEditing] = useState(false);
  const [basicMode, setBasicMode] = useState(true);
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState(null);
  const requiresAuthorization = security?.length > 0;

  if (!requiresAuthorization) {
    return null;
  }

  if (!!bearerToken) {
    return (
      <div style={{ display: "flex" }}>
        <button
          className="button button--primary"
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            marginBottom: "var(--ifm-spacing-vertical)",
          }}
          onClick={() => {
            clearSession();
          }}
        >
          <span>Authorized</span>

          <svg
            style={{
              marginLeft: "12px",
              width: "18px",
              height: "18px",
              fill: "currentColor",
            }}
            viewBox="0 0 20 20"
            id="locked"
          >
            <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8zM12 8H8V5.199C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8z"></path>
          </svg>
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button
          className="button button--outline button--primary"
          style={{
            marginBottom: "var(--ifm-spacing-vertical)",
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => {
            setBearerToken(
              `${basicMode ? "Basic" : "Bearer"} ${
                basicMode ? btoa(`${token}:${password}`) : token
              }`
            );
            setEditing(false);
          }}
        >
          <span>Save</span>

          <svg
            style={{
              marginLeft: "12px",
              width: "18px",
              height: "18px",
              fill: "currentColor",
            }}
            viewBox="0 0 20 20"
          >
            <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>
          </svg>
        </button>
        <FloatingButton
          onClick={() => setBasicMode((mode) => !mode)}
          label="Switch Mode"
        >
          <pre>
            {!basicMode ? (
              <FormItem label="Bearer Token">
                <FormTextInput
                  placeholder={"Bearer Token"}
                  onChange={(e) => {
                    setToken(e.target.value);
                  }}
                />
              </FormItem>
            ) : (
              <>
                <FormItem label="Username">
                  <FormTextInput
                    placeholder={"Username"}
                    onChange={(e) => {
                      setToken(e.target.value);
                    }}
                  />
                </FormItem>
                <FormItem label="Password">
                  <FormTextInput
                    password
                    placeholder={"Password"}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                </FormItem>
              </>
            )}
          </pre>
        </FloatingButton>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <button
        className="button button--outline button--primary"
        style={{
          marginBottom: "var(--ifm-spacing-vertical)",
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => {
          setEditing(true);
        }}
      >
        <span>Authorize</span>

        <svg
          style={{
            marginLeft: "12px",
            width: "18px",
            height: "18px",
            fill: "currentColor",
          }}
          viewBox="0 0 20 20"
        >
          <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>
        </svg>
      </button>
    </div>
  );
}

export default Authorization;
