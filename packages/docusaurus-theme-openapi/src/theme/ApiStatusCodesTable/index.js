/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import MD from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

import FullWidthTable from "../FullWidthTable";
import ObjectTable from "../ObjectTable";

function StatusCodesTable({ responses }) {
  // openapi requires at least one response, so we shouldn't HAVE to check...
  if (responses === undefined) {
    return null;
  }

  const codes = Object.keys(responses);
  if (codes.length === 0) {
    return null;
  }

  return (
    <FullWidthTable>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Responses</th>
        </tr>
      </thead>
      <tbody>
        {codes.map((code) => {
          return (
            <tr key={code}>
              <td>
                <div style={{ display: "flex" }}>
                  <div style={{ marginRight: "var(--ifm-table-cell-padding)" }}>
                    <code>{code}</code>
                  </div>
                  <div>
                    <MD
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      className="table-markdown"
                    >
                      {responses[code].description}
                    </MD>
                  </div>
                </div>
                <div>
                  <ObjectTable
                    style={{
                      marginTop: "var(--ifm-table-cell-padding)",
                      marginBottom: "0px",
                    }}
                    body={{
                      ...responses[code],
                      description: "", // remove description since it acts as a subtitle, but is already rendered above.
                    }}
                    title="Schema"
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </FullWidthTable>
  );
}

export default StatusCodesTable;
