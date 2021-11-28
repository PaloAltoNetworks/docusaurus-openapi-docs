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
import styles from "./styles.module.css";

function parseFinalSchema(schema) {
  if (schema.$ref) {
    return schema.$ref.replace("#/components/schemas/", "") + " (circular)";
  }
  if (schema.format) {
    return schema.format;
  }
  if (schema.type === "object") {
    return schema.xml?.name || schema.type;
  }
  return schema.title || schema.type;
}

function getSchemaName(schema) {
  if (schema.type === "array") {
    return parseFinalSchema(schema.items) + "[]";
  }

  return parseFinalSchema(schema);
}

function Row({ name, schema, required }) {
  return (
    <tr>
      <td>
        <code>{name}</code>
        <span style={{ opacity: "0.6" }}> {getSchemaName(schema)}</span>
        {required && (
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
        {schema.description && (
          <div className={styles.description}>
            <MD
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              className="table-markdown"
              children={schema.description}
            />
          </div>
        )}
        <Rows schema={schema} />
      </td>
    </tr>
  );
}

function Rows({ schema }) {
  // object
  if (schema.properties !== undefined) {
    return (
      <FullWidthTable
        style={{
          marginTop: "var(--ifm-table-cell-padding)",
          marginBottom: "0px",
        }}
      >
        <tbody>
          {Object.keys(schema.properties).map((key) => {
            return (
              <Row
                key={key}
                name={key}
                schema={schema.properties[key]}
                required={schema.required?.includes(key)}
              />
            );
          })}
        </tbody>
      </FullWidthTable>
    );
  }

  // array
  if (schema.items !== undefined) {
    return <Rows schema={schema.items} />;
  }

  // primitive
  return null;
}

function RowsRoot({ schema }) {
  // object
  if (schema.properties !== undefined) {
    return (
      <>
        {Object.keys(schema.properties).map((key) => {
          return (
            <Row
              key={key}
              name={key}
              schema={schema.properties[key]}
              required={schema.required?.includes(key)}
            />
          );
        })}
      </>
    );
  }

  // array
  if (schema.items !== undefined) {
    return <Rows schema={schema.items} />;
  }

  // primitive
  return (
    <tr>
      <td>
        <span style={{ opacity: "0.6" }}> {schema.type}</span>
        {schema.description && (
          <div className={styles.description}>
            <MD
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              className="table-markdown"
              children={schema.description}
            />
          </div>
        )}
      </td>
    </tr>
  );
}

function RequestBodyTable({ body, title, ...rest }) {
  if (body === undefined || body.content === undefined) {
    return null;
  }

  // NOTE: We just pick a random content-type.
  // How common is it to have multiple?

  const randomFirstKey = Object.keys(body.content)[0];

  const firstBody = body.content[randomFirstKey].schema;

  // we don't show the table if there is no properties to show
  if (Object.keys(firstBody.properties || {}).length === 0) {
    return null;
  }

  return (
    <FullWidthTable {...rest}>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>
            {title + " "}
            {body.required && (
              <>
                {
                  <span style={{ opacity: "0.6", fontWeight: "normal" }}>
                    {" "}
                    —{" "}
                  </span>
                }
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
            <div style={{ fontWeight: "normal" }}>
              <MD
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                className="table-markdown"
                children={body.description}
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <RowsRoot schema={firstBody} />
      </tbody>
    </FullWidthTable>
  );
}

export default RequestBodyTable;
