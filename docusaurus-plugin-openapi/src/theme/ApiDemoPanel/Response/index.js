import React from "react";
import { useSelector } from "react-redux";

import FloatingButton from "./../FloatingButton";
import { useActions } from "./../redux/actions";

function Response() {
  const response = useSelector((state) => state.response);
  const { clearResponse } = useActions();

  if (response === undefined) {
    return null;
  }

  let prettyResponse = response;
  try {
    prettyResponse = JSON.stringify(JSON.parse(response), null, 2);
  } catch {}

  return (
    <FloatingButton onClick={() => clearResponse()} label="Clear">
      <pre
        style={{
          background: "var(--openapi-card-background-color)",
          borderRadius: "var(--openapi-card-border-radius)",
        }}
      >
        {prettyResponse || "No Response"}
      </pre>
    </FloatingButton>
  );
}

export default Response;
