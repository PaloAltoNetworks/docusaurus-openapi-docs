/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import RequestBodyTable from "../ApiRequestBodyTable";

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
    <>
      <table style={{ display: "table" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Status Codes</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => {
            return (
              <tr key={code}>
                <td>
                  <div style={{ display: "flex" }}>
                    <div
                      style={{ marginRight: "var(--ifm-table-cell-padding)" }}
                    >
                      <code>{code}</code>
                    </div>
                    <div>
                      <RequestBodyTable
                        body={{ ...responses[code], description: "" }}
                        title={responses[code].description}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default StatusCodesTable;
