/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

function colorForMethod(method: string) {
  switch (method.toLowerCase()) {
    case "get":
      return "var(--openapi-code-blue)";
    case "put":
      return "var(--openapi-code-orange)";
    case "post":
      return "var(--openapi-code-green)";
    case "delete":
      return "var(--openapi-code-red)";
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
      <span style={{ color: colorForMethod(method) }}>
        {method.toUpperCase()}
      </span>{" "}
      <span>{path.replace(/{([a-z0-9-_]+)}/gi, ":$1")}</span>
    </pre>
  );
}

export default MethodEndpoint;
