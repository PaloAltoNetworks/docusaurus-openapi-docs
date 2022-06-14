/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { RequestBodyObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";

import ContentType from "../ContentType";
import FormSelect from "../FormSelect";
import { useTypedDispatch, useTypedSelector } from "../hooks";
import LiveApp from "../LiveEditor";
import FormFileUpload from "./../FormFileUpload";
import FormItem from "./../FormItem";
import FormTextInput from "./../FormTextInput";
// @ts-ignore
import json2xml from "./json2xml";
import {
  clearFormBodyKey,
  clearRawBody,
  setFileFormBody,
  setFileRawBody,
  setStringFormBody,
} from "./slice";

interface Props {
  jsonRequestBodyExample: string;
  requestBodyMetadata?: RequestBodyObject;
}

function BodyWrap({ requestBodyMetadata, jsonRequestBodyExample }: Props) {
  const contentType = useTypedSelector((state) => state.contentType.value);

  // NOTE: We used to check if body was required, but opted to always show the request body
  // to reduce confusion, see: https://github.com/cloud-annotations/docusaurus-openapi/issues/145

  // No body
  if (contentType === undefined) {
    return null;
  }

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
    if (jsonRequestBodyExample) {
      exampleBodyString = json2xml(jsonRequestBodyExample);
    }
    language = "xml";
  }

  return (
    <FormItem label="Body">
      <LiveApp action={dispatch} language={language}>
        {exampleBodyString}
      </LiveApp>
    </FormItem>
  );
}

export default BodyWrap;
