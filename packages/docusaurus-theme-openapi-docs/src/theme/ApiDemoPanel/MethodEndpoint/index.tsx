/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

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
    <pre className="openapi__method-endpoint">
      <span className={"badge badge--" + colorForMethod(method)}>
        {method.toUpperCase()}
      </span>{" "}
      <span>{path.replace(/{([a-z0-9-_]+)}/gi, ":$1")}</span>
    </pre>
  );
}

export default MethodEndpoint;
