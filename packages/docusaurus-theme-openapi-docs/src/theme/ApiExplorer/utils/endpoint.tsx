/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

export function colorForMethod(method: string) {
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

export function renderPath(path: string) {
  return path.split(/({[a-z0-9-_]+})/gi).map((segment, i) => {
    const match = segment.match(/^{([a-z0-9-_]+)}$/i);
    if (!match) return segment;
    return (
      <span key={i} className="openapi__method-endpoint-param">
        :{match[1]}
      </span>
    );
  });
}

export function statusTone(code: number | string) {
  const value = String(code);
  if (value.startsWith("2")) return "success";
  if (value.startsWith("4") || value.startsWith("5")) return "danger";
  return "info";
}
