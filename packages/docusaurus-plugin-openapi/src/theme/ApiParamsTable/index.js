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

import styles from "./styles.module.css";

function parseFinalSchema(schema) {
  if (schema.$ref) {
    return schema.$ref.replace("#/components/schemas/", "");
  }
  if (schema.format) {
    return schema.format;
  }
  return schema.type;
}

function getSchemaName(schema) {
  if (schema.type === "array") {
    return parseFinalSchema(schema.items) + "[]";
  }

  return parseFinalSchema(schema);
}

function ParamsTable({ parameters, type }) {
  if (parameters === undefined) {
    return null;
  }
  const params = parameters.filter((param) => param.in === type);
  if (params.length === 0) {
    return null;
  }
  return (
    <>
      <table style={{ display: "table" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Parameters
            </th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => {
            return (
              <tr key={`${param.in}-${param.name}`}>
                <td>
                  <code>{param.name}</code>
                  <span style={{ opacity: "0.6" }}>
                    {" "}
                    {getSchemaName(param.schema)}
                  </span>
                  {param.required && (
                    <>
                      {<span style={{ opacity: "0.6" }}> — </span>}
                      <strong
                        style={{
                          fontSize: "var(--ifm-code-font-size)",
                          color: "var(--openapi-required)",
                        }}
                      >
                        {" "}
                        REQUIRED
                      </strong>
                    </>
                  )}
                  {param.description && (
                    <div className={styles.description}>
                      <MD
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        className="table-markdown"
                        children={param.description}
                      />
                    </div>
                  )}
                  {param.example && <div>Example: {param.example}</div>}
                  {param.examples &&
                    Object.keys(param.examples).map((key) => (
                      <div>
                        Example ({key}): {param.examples[key].value}
                      </div>
                    ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default ParamsTable;
