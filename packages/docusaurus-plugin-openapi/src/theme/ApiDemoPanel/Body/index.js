/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import { useSelector } from "react-redux";

import ContentType from "../ContentType";
import FormSelect from "../FormSelect";
import FormFileUpload from "./../FormFileUpload";
import FormItem from "./../FormItem";
import FormTextInput from "./../FormTextInput";
import { useActions } from "./../redux/actions";
import VSCode from "./../VSCode";
import styles from "./styles.module.css";

function BodyWrap() {
  const [showOptional, setShowOptional] = useState(false);
  const contentType = useSelector((state) => state.contentType);
  const required = useSelector((state) => state.requestBodyMetadata.required);

  // No body
  if (contentType === undefined) {
    return null;
  }

  if (required) {
    return (
      <>
        <ContentType />
        <Body />
      </>
    );
  }
  return (
    <>
      <button
        className={styles.showMoreButton}
        onClick={() => setShowOptional((prev) => !prev)}
      >
        <span
          style={{
            width: "1.5em",
            display: "inline-block",
            textAlign: "center",
          }}
        >
          <span className={showOptional ? styles.plusExpanded : styles.plus}>
            <div>
              <svg
                style={{
                  fill: "currentColor",
                  width: "10px",
                  height: "10px",
                }}
                height="16"
                viewBox="0 0 16 16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 7h6a1 1 0 0 1 0 2H9v6a1 1 0 0 1-2 0V9H1a1 1 0 1 1 0-2h6V1a1 1 0 1 1 2 0z"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
          </span>
        </span>
        {showOptional ? "Hide optional body" : "Show optional body"}
      </button>

      <div className={showOptional ? styles.showOptions : styles.hideOptions}>
        <>
          <ContentType />
          <Body />
        </>
      </div>
    </>
  );
}

function Body() {
  const contentType = useSelector((state) => state.contentType);
  const requestBodyMetadata = useSelector((state) => state.requestBodyMetadata);
  const jsonRequestBodyExample = useSelector(
    (state) => state.jsonRequestBodyExample
  );
  const { setBody, setForm } = useActions();

  // Lot's of possible content-types:
  // - application/json
  // - application/xml
  // - text/plain
  // - text/css
  // - text/html
  // - text/javascript
  // - application/javascript
  // - multipart/form-data
  // - application/x-www-form-urlencoded
  // - image/svg+xml;charset=US-ASCII

  // Show editor:
  // - application/json
  // - application/xml
  // - */*

  // Show form:
  // - multipart/form-data
  // - application/x-www-form-urlencoded

  // No body
  if (contentType === undefined) {
    return null;
  }

  const schema = requestBodyMetadata?.content?.[contentType]?.schema;
  if (schema.format === "binary") {
    return (
      <FormItem label="Body">
        <FormFileUpload
          placeholder={schema.description || "Body"}
          onChange={(file) => {
            if (file === undefined) {
              setBody(undefined);
              return;
            }
            setBody({
              type: "file",
              src: `/path/to/${file.name}`,
              content: file,
            });
          }}
        />
      </FormItem>
    );
  }

  if (
    (contentType === "multipart/form-data" ||
      contentType === "application/x-www-form-urlencoded") &&
    requestBodyMetadata?.content?.[contentType]?.schema.type === "object"
  ) {
    return (
      <FormItem label="Body">
        <div
          style={{
            marginTop: "calc(var(--ifm-pre-padding) / 2)",
            borderRadius: "4px",
            padding: "var(--ifm-pre-padding)",
            border: "1px solid var(--openapi-monaco-border-color)",
          }}
        >
          {Object.entries(
            requestBodyMetadata?.content?.[contentType]?.schema.properties
          ).map(([key, val]) => {
            if (val.format === "binary") {
              return (
                <FormItem key={key} label={key}>
                  <FormFileUpload
                    placeholder={val.description || key}
                    onChange={(file) => {
                      if (file === undefined) {
                        setForm({ key: key, value: undefined });
                        return;
                      }
                      setForm({
                        key: key,
                        value: {
                          type: "file",
                          src: `/path/to/${file.name}`,
                          content: file,
                        },
                      });
                    }}
                  />
                </FormItem>
              );
            }

            if (val.enum) {
              return (
                <FormItem key={key} label={key}>
                  <FormSelect
                    options={["---", ...val.enum]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({
                        key: key,
                        value: val === "---" ? undefined : val,
                      });
                    }}
                  />
                </FormItem>
              );
            }
            // TODO: support all the other types.
            return (
              <FormItem key={key} label={key}>
                <FormTextInput
                  placeholder={val.description || key}
                  onChange={(e) => {
                    setForm({ key: key, value: e.target.value });
                  }}
                />
              </FormItem>
            );
          })}
        </div>
      </FormItem>
    );
  }

  let language = "plaintext";
  let exampleBodyString = ""; //"body content";

  if (contentType === "application/json") {
    if (jsonRequestBodyExample) {
      exampleBodyString = JSON.stringify(jsonRequestBodyExample, null, 2);
    }
    language = "json";
  }

  if (contentType === "application/xml") {
    language = "xml";
  }

  return (
    <FormItem label="Body">
      <VSCode
        value={exampleBodyString}
        language={language}
        onChange={setBody}
      />
    </FormItem>
  );
}

export default BodyWrap;
