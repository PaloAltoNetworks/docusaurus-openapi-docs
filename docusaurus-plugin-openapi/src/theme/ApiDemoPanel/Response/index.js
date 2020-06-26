import React from "react";
import { useSelector } from "react-redux";

import FloatingButton from "./../FloatingButton";
import { useActions } from "./../redux/actions";

function formatXml(xml) {
  const tab = "  ";
  let formatted = "";
  let indent = "";

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      // decrease indent by one 'tab'
      indent = indent.substring(tab.length);
    }
    formatted += indent + "<" + node + ">\r\n";
    if (node.match(/^<?\w[^>]*[^\/]$/)) {
      // increase indent
      indent += tab;
    }
  });
  return formatted.substring(1, formatted.length - 3);
}

function Response() {
  const response = useSelector((state) => state.response);
  const { clearResponse } = useActions();

  if (response === undefined) {
    return null;
  }

  let prettyResponse = response;
  try {
    prettyResponse = JSON.stringify(JSON.parse(response), null, 2);
  } catch {
    if (response.startsWith("<?xml ")) {
      prettyResponse = formatXml(response);
    }
  }

  return (
    <FloatingButton onClick={() => clearResponse()} label="Clear">
      <pre
        style={{
          background: "var(--openapi-card-background-color)",
          borderRadius: "var(--openapi-card-border-radius)",
          paddingRight: "60px",
        }}
      >
        <code>{prettyResponse || "No Response"}</code>
      </pre>
    </FloatingButton>
  );
}

export default Response;
