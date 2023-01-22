/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import clsx from "clsx";

import styles from "./styles.module.css";

function colorForMethod(method: string) {
  switch (method.toLowerCase()) {
    case "get":
      return "primary";
    case "post":
      return "success";
    case "delete":
      return "danger";
    case "put":
      return "info";
    case "patch":
      return "warning";
    case "head":
      return "secondary";
    case "event":
      return "secondary";
    default:
      return undefined;
  }
}

export interface Props {
  method: string;
  path: string;
}

function MethodEndpoint({ method, path }: Props) {
  return (
    <div
      className={clsx(
        "openapi-demo__panel",
        "openapi-demo__panel__method-endpoint",
        styles.panel
      )}
    >
      <span
        className={clsx(
          "badge",
          "badge--" + colorForMethod(method),
          "openapi-demo__method-badge",
          "openapi-demo__method-badge--" + method,
          styles.method
        )}
      >
        {method.toUpperCase()}
      </span>{" "}
      <span className={clsx("openapi-demo__endpoint-path")}>
        {path.replace(/{([a-z0-9-_]+)}/gi, ":$1")}
      </span>
    </div>
  );
}

export default MethodEndpoint;
