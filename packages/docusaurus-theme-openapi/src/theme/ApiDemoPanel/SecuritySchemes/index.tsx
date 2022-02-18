import React from "react";
import { useTypedSelector } from "../hooks";

function SecuritySchemes() {
  const options = useTypedSelector((state) => state.auth.options);
  const selected = useTypedSelector((state) => state.auth.selected);

  if (selected === undefined) return null;

  const selectedAuth = options[selected];

  return (
    <div style={{ marginBottom: "var(--ifm-table-cell-padding)" }}>
      {selectedAuth.map((auth) => {
        if (auth.type === "apiKey") {
          return (
            <React.Fragment key={selected + "-apiKey"}>
              <b>Authorization: {auth.name}</b>
              <pre
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--openapi-card-background-color)",
                  borderRadius: "var(--openapi-card-border-radius)",
                }}
              >
                <span>name: {auth.name}</span>
                <span>in: {auth.in}</span>
                <span>type: {auth.type}</span>
              </pre>
            </React.Fragment>
          );
        }

        return null;
      })}
    </div>
  );
}

export default SecuritySchemes;
