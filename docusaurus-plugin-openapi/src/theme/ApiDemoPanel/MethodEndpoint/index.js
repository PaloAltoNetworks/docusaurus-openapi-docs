import React from "react";

import { useSelector } from "react-redux";

function colorForMethod(method) {
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

function MethodEndpoint() {
  const method = useSelector((state) => state.method);
  const path = useSelector((state) => state.path);

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
