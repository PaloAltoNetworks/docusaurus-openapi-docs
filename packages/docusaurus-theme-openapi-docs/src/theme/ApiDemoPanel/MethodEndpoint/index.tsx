/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";

import { useTypedSelector } from "../../ApiItem/hooks";

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
  const serverValue = useTypedSelector((state: any) => state.server.value);

  return (
    <BrowserOnly>
      {() => (
        <pre className="openapi__method-endpoint">
          <span className={"badge badge--" + colorForMethod(method)}>
            {method.toUpperCase()}
          </span>{" "}
          <span>{`${serverValue && serverValue.url}${path.replace(
            /{([a-z0-9-_]+)}/gi,
            ":$1"
          )}`}</span>
        </pre>
      )}
    </BrowserOnly>
  );
}

export default MethodEndpoint;
