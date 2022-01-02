/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import { RequestBodyObject } from "docusaurus-plugin-openapi/src/openapi/types";

import ContentType from "../ContentType";
import FormSelect from "../FormSelect";
import { useTypedDispatch, useTypedSelector } from "../hooks";
import FormFileUpload from "./../FormFileUpload";
import FormItem from "./../FormItem";
import FormTextInput from "./../FormTextInput";
import VSCode from "./../VSCode";
import {
  clearFormBodyKey,
  clearRawBody,
  setFileFormBody,
  setFileRawBody,
  setStringFormBody,
  setStringRawBody,
} from "./slice";
import styles from "./styles.module.css";

interface Props {
  jsonRequestBodyExample: string;
  requestBodyMetadata?: RequestBodyObject;
}

function BodyWrap({ requestBodyMetadata, jsonRequestBodyExample }: Props) {
  const [showOptional, setShowOptional] = useState(false);
  const contentType = useTypedSelector((state) => state.contentType.value);
  const required = requestBodyMetadata?.required;

  // No body
  if (contentType === undefined) {
    return null;
  }

  if (required) {
    return (
      <>
        <ContentType />
        <Body
          requestBodyMetadata={requestBodyMetadata}
          jsonRequestBodyExample={jsonRequestBodyExample}
        />
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
          <Body
            requestBodyMetadata={requestBodyMetadata}
            jsonRequestBodyExample={jsonRequestBodyExample}
          />
        </>
      </div>
    </>
  );
}

function Body({ requestBodyMetadata, jsonRequestBodyExample }: Props) {
  const contentType = useTypedSelector((state) => state.contentType.value);

  const dispatch = useTypedDispatch();

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

  if (schema?.format === "binary") {
    return (
      <FormItem label="Body">
        <FormFileUpload
          placeholder={schema.description || "Body"}
          onChange={(file) => {
            if (file === undefined) {
              dispatch(clearRawBody());
              return;
            }
            dispatch(
              setFileRawBody({
                src: `/path/to/${file.name}`,
                content: file,
              })
            );
          }}
        />
      </FormItem>
    );
  }

  if (
    (contentType === "multipart/form-data" ||
      contentType === "application/x-www-form-urlencoded") &&
    schema?.type === "object"
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
          {Object.entries(schema.properties ?? {}).map(([key, val]: any) => {
            if (val.format === "binary") {
              return (
                <FormItem key={key} label={key}>
                  <FormFileUpload
                    placeholder={val.description || key}
                    onChange={(file) => {
                      if (file === undefined) {
                        dispatch(clearFormBodyKey(key));
                        return;
                      }
                      dispatch(
                        setFileFormBody({
                          key: key,
                          value: {
                            src: `/path/to/${file.name}`,
                            content: file,
                          },
                        })
                      );
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
                      if (val === "---") {
                        dispatch(clearFormBodyKey(key));
                      } else {
                        dispatch(
                          setStringFormBody({
                            key: key,
                            value: val,
                          })
                        );
                      }
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
                    dispatch(
                      setStringFormBody({ key: key, value: e.target.value })
                    );
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
        onChange={(value) => {
          dispatch(setStringRawBody(value));
        }}
      />
    </FormItem>
  );
}

export default BodyWrap;
