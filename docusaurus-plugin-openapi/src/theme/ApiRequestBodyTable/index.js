import React from "react";
import MD from "react-markdown/with-html";

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
  return schema.type;
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
              escapeHtml={false}
              className="table-markdown"
              source={schema.description}
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
      <table
        style={{
          display: "table",
          marginTop: "var(--ifm-table-cell-padding)",
          marginBottom: "0px",
        }}
      >
        <tbody>
          {Object.keys(schema.properties).map((key) => {
            return (
              <Row
                name={key}
                schema={schema.properties[key]}
                required={schema.required?.includes(key)}
              />
            );
          })}
        </tbody>
      </table>
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
              escapeHtml={false}
              className="table-markdown"
              source={schema.description}
            />
          </div>
        )}
      </td>
    </tr>
  );
}

function RequestBodyTable({ body }) {
  if (body === undefined) {
    return null;
  }

  // NOTE: We just pick a random content-type.
  // How common is it to have multiple?

  const randomFirstKey = Object.keys(body.content)[0];

  const firstBody = body.content[randomFirstKey].schema;

  return (
    <>
      <table style={{ display: "table" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>
              Request Body{" "}
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
                  className="table-markdown"
                  escapeHtml={false}
                  source={body.description}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <RowsRoot schema={firstBody} />
        </tbody>
      </table>
    </>
  );
}

export default RequestBodyTable;
