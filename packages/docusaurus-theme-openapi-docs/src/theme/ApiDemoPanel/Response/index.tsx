/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { usePrismTheme } from "@docusaurus/theme-common";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import CodeBlock from "@theme/CodeBlock";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import clsx from "clsx";

import { clearResponse, clearCode, clearHeaders } from "./slice";

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
  const prismTheme = usePrismTheme();
  const code = useTypedSelector((state: any) => state.response.code);
  const headers = useTypedSelector((state: any) => state.response.headers);
  const response = useTypedSelector((state: any) => state.response.value);
  const dispatch = useTypedDispatch();
  const responseStatusClass =
    code &&
    (parseInt(code) >= 400
      ? "response__status--danger"
      : parseInt(code) >= 200 && parseInt(code) < 300
      ? "response__status--success"
      : "response__status--info");

  if (response === undefined) {
    return null;
  }

  let prettyResponse: string = response;
  try {
    prettyResponse = JSON.stringify(JSON.parse(response), null, 2);
  } catch {
    if (response.startsWith("<")) {
      prettyResponse = formatXml(response);
    }
  }

  return (
    <details className="openapi-demo__details" open={true}>
      <summary className="openapi-demo__summary-container">
        <div className="openapi-demo__summary-content">
          <h4 className="openapi-demo__summary-header">Response</h4>
          <button
            className="button button--sm button--secondary"
            onClick={() => {
              dispatch(clearResponse());
              dispatch(clearCode());
              dispatch(clearHeaders());
            }}
          >
            Clear
          </button>
        </div>
      </summary>

      <div
        style={{
          backgroundColor: prismTheme.plain.backgroundColor,
          paddingLeft: "1rem",
          paddingTop: "1rem",
          ...((prettyResponse === "Fetching..." || !code) && {
            paddingBottom: "1rem",
          }),
        }}
      >
        {code && prettyResponse !== "Fetching..." ? (
          <SchemaTabs className={clsx(responseStatusClass)} lazy>
            {/* @ts-ignore */}
            <TabItem label={` ${code}`} value="body" default>
              <CodeBlock
                className="response__status-code"
                language={response.startsWith("<") ? `xml` : `json`}
              >
                {prettyResponse || "No Response"}
              </CodeBlock>
            </TabItem>
            {/* @ts-ignore */}
            <TabItem label="Headers" value="headers">
              <CodeBlock
                className="response__status-headers"
                language={response.startsWith("<") ? `xml` : `json`}
              >
                {JSON.stringify(headers, undefined, 2)}
              </CodeBlock>
            </TabItem>
          </SchemaTabs>
        ) : (
          prettyResponse || "No Response"
        )}
      </div>
    </details>
  );
}

export default Response;
