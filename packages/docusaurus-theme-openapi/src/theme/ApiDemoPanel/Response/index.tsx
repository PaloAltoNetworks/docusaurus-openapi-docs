/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useTypedDispatch, useTypedSelector } from "../hooks";
import FloatingButton from "./../FloatingButton";
import { clearResponse } from "./slice";

// TODO: We probably shouldn't attempt to format XML...
function formatXml(xml: string) {
  const tab = "  ";
  let formatted = "";
  let indent = "";

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      // decrease indent by one 'tab'
      indent = indent.substring(tab.length);
    }
    formatted += indent + "<" + node + ">\r\n";
    if (node.match(/^<?\w[^>]*[^/]$/)) {
      // increase indent
      indent += tab;
    }
  });
  return formatted.substring(1, formatted.length - 3);
}

function Response() {
  const response = useTypedSelector((state) => state.response.value);
  const dispatch = useTypedDispatch();

  if (response === undefined) {
    return null;
  }

  let prettyResponse: string = response;
  try {
    prettyResponse = JSON.stringify(JSON.parse(response), null, 2);
  } catch {
    if (response.startsWith("<?xml ")) {
      prettyResponse = formatXml(response);
    }
  }

  return (
    <FloatingButton onClick={() => dispatch(clearResponse())} label="Clear">
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
