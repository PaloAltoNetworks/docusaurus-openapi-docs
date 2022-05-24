/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

const methodStyle = {
  borderRadius: "var(--ifm-global-radius)",
};

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
    default:
      return undefined;
  }
}

interface Props {
  method: string;
  path: string;
}

function MethodEndpoint({ method, path }: Props) {
  return (
    <pre
      style={{
        background: "var(--openapi-card-background-color)",
        borderRadius: "var(--openapi-card-border-radius)",
      }}
    >
      <span
        style={methodStyle}
        className={"badge badge--" + colorForMethod(method)}
      >
        {method.toUpperCase()}
      </span>{" "}
      <span>{path.replace(/{([a-z0-9-_]+)}/gi, ":$1")}</span>
    </pre>
  );
}

export default MethodEndpoint;
