import React from "react";
import MD from "react-markdown/with-html";

import styles from "./styles.module.css";

function getType(val) {
  if (val.type === "object") {
    return val.xml.name;
  }
  if (val.type === "array") {
    return getType(val.items) + "[]";
  }
  return val.format || val.type;
}

function getType3(name, schema, other) {
  for (let [key, val] of Object.entries(schema.properties)) {
    if (other[name] === undefined) {
      other[name] = {};
    }
    other[name][key] = getType(val);
  }
}

function drillThroughArray(val, other) {
  if (val.items.type === "object") {
    getType3(val.items.xml.name, val.items, other);
  } else if (val.items.type === "array") {
    drillThroughArray(val.items, other);
  } else {
    // noop, primitive array covered in the root object already covered.
  }
}

function getType2(schema, other) {
  for (let val of Object.values(schema.properties)) {
    if (val.type === "object") {
      getType3(val.xml.name, val, other);
    } else if (val.type === "array") {
      drillThroughArray(val, other);
    } else {
      // noop, primitives of the root object already covered.
    }
  }
}

function flattenSchema(schema) {
  if (schema.type === "array") {
    // TODO: this will probably break for nested arrays...
    const [x] = flattenSchema(schema.items);
    return [schema.items.xml.name + "[]", { [schema.items.xml.name]: x }];
  }

  // build root object.
  let rootObj = {};
  if (schema.type === "object") {
    Object.entries(schema.properties).forEach(([key, val]) => {
      rootObj[key] = getType(val);
    });
  }

  // other schemas.
  let other = {};
  if (schema.type === "object") {
    getType2(schema, other);
  }

  // return [JSON.stringify(rootObj, null, 2).replace(/[",]/g, ""), other];
  return [JSON.stringify(rootObj, null, 2), other];
}

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
      <table style={{ display: "table" }}>
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
    return (
      <table style={{ display: "table" }}>
        <tbody>
          <Rows schema={schema.items} />
        </tbody>
      </table>
    );
  }

  // primitive
  return null;
}

function RequestBodyTable({ body }) {
  if (body === undefined) {
    return null;
  }

  // TODO: support more than one content type.

  const randomFirstKey = Object.keys(body.content)[0];

  const firstBody = body.content[randomFirstKey].schema;

  // let root = "";
  // let other = "";
  // try {
  //   [root, other] = flattenSchema(firstBody.schema);
  // } catch {}

  // TODO: we don't handle arrays or primitives.

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
          <tr>
            <td>
              <pre
                style={{
                  marginBottom: 0,
                  marginTop: "0",
                }}
              >
                {JSON.stringify(firstBody, null, 2)}
              </pre>
            </td>
          </tr>
          <Rows schema={firstBody} />
        </tbody>
      </table>
    </>
  );
}

export default RequestBodyTable;
