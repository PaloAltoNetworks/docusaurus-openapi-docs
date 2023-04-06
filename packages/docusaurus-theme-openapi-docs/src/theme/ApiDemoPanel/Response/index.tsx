/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useDoc } from "@docusaurus/theme-common/internal";
import { usePrismTheme } from "@docusaurus/theme-common";
import { Loading } from "@nextui-org/react";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
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

function Response({ item }: { item: NonNullable<ApiItem> }) {
  const metadata = useDoc();
  const hideSendButton = metadata.frontMatter.hide_send_button;
  const prismTheme = usePrismTheme();
  const code = useTypedSelector((state: any) => state.response.code);
  const headers = useTypedSelector((state: any) => state.response.headers);
  const response = useTypedSelector((state: any) => state.response.value);
  const dispatch = useTypedDispatch();
  const responseStatusClass =
    code &&
    "openapi-response__dot " +
      (parseInt(code) >= 400
        ? "openapi-response__dot--danger"
        : parseInt(code) >= 200 && parseInt(code) < 300
        ? "openapi-response__dot--success"
        : "openapi-response__dot--info");

  if (!item.servers || hideSendButton) {
    return null;
  }

  let prettyResponse: string = response;

  if (prettyResponse) {
    try {
      prettyResponse = JSON.stringify(JSON.parse(response), null, 2);
    } catch {
      if (response.startsWith("<")) {
        prettyResponse = formatXml(response);
      }
    }
  }

  return (
    <div className="openapi-demo__response-container">
      <div className="openapi-demo__response-title-container">
        <span className="openapi-demo__response-title">Response</span>
        <span
          className="openapi-demo__response-clear-btn"
          onClick={() => {
            dispatch(clearResponse());
            dispatch(clearCode());
            dispatch(clearHeaders());
          }}
        >
          Clear
        </span>
      </div>
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
          <SchemaTabs lazy>
            {/* @ts-ignore */}
            <TabItem
              label={` ${code}`}
              value="body"
              attributes={{
                className: clsx("openapi-response__dot", responseStatusClass),
              }}
              default
            >
              <CodeBlock
                className="openapi-demo__code-block openapi-response__status-code"
                language={response.startsWith("<") ? `xml` : `json`}
              >
                {prettyResponse || (
                  <p className="openapi-demo__response-placeholder-message">
                    Click the <code>Send API Request</code> button above and see
                    the response here!
                  </p>
                )}
              </CodeBlock>
            </TabItem>
            {/* @ts-ignore */}
            <TabItem label="Headers" value="headers">
              <CodeBlock
                className="openapi-demo__code-block openapi-response__status-headers"
                language={response.startsWith("<") ? `xml` : `json`}
              >
                {JSON.stringify(headers, undefined, 2)}
              </CodeBlock>
            </TabItem>
          </SchemaTabs>
        ) : prettyResponse === "Fetching..." ? (
          <div className="openapi-demo__loading-container">
            <Loading color="success" />
          </div>
        ) : (
          <p className="openapi-demo__response-placeholder-message">
            Click the <code>Send API Request</code> button above and see the
            response here!
          </p>
        )}
      </div>
    </div>
  );
}

export default Response;
