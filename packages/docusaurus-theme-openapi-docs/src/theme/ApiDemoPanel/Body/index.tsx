/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import TabItem from "@theme/TabItem";
import { RequestBodyObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import format from "xml-formatter";

import { useTypedDispatch, useTypedSelector } from "../../ApiItem/hooks";
// @ts-ignore
import SchemaTabs from "../../SchemaTabs";
import ContentType from "../ContentType";
import FormSelect from "../FormSelect";
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
  const required = requestBodyMetadata?.required;

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
  const example = requestBodyMetadata?.content?.[contentType]?.example;
  const examples = requestBodyMetadata?.content?.[contentType]?.examples;

  if (schema?.format === "binary") {
    return (
      <FormItem label="Body" required={required}>
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
      <FormItem label="Body" required={required}>
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
                <FormItem
                  key={key}
                  label={key}
                  required={
                    Array.isArray(schema.required) &&
                    schema.required.includes(key)
                  }
                >
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
                <FormItem
                  key={key}
                  label={key}
                  required={
                    Array.isArray(schema.required) &&
                    schema.required.includes(key)
                  }
                >
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
              <FormItem
                key={key}
                label={key}
                required={
                  Array.isArray(schema.required) &&
                  schema.required.includes(key)
                }
              >
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
  let defaultBody = ""; //"body content";
  let exampleBody;
  let examplesBodies = [] as any;

  if (contentType === "application/json" || contentType.endsWith("+json")) {
    if (jsonRequestBodyExample) {
      defaultBody = JSON.stringify(jsonRequestBodyExample, null, 2);
    }
    if (example) {
      exampleBody = JSON.stringify(example, null, 2);
    }
    if (examples) {
      for (const [key, example] of Object.entries(examples)) {
        examplesBodies.push({
          label: key,
          body: JSON.stringify(example.value, null, 2),
          summary: example.summary,
        });
      }
    }
    language = "json";
  }

  if (contentType === "application/xml" || contentType.endsWith("+xml")) {
    if (jsonRequestBodyExample) {
      try {
        defaultBody = format(json2xml(jsonRequestBodyExample, ""), {
          indentation: "  ",
          lineSeparator: "\n",
          collapseContent: true,
        });
      } catch {
        defaultBody = json2xml(jsonRequestBodyExample);
      }
    }
    if (example) {
      try {
        exampleBody = format(json2xml(example, ""), {
          indentation: "  ",
          lineSeparator: "\n",
          collapseContent: true,
        });
      } catch {
        exampleBody = json2xml(example);
      }
    }
    if (examples) {
      for (const [key, example] of Object.entries(examples)) {
        let formattedXmlBody;
        try {
          formattedXmlBody = format(example.value, {
            indentation: "  ",
            lineSeparator: "\n",
            collapseContent: true,
          });
        } catch {
          formattedXmlBody = example.value;
        }
        examplesBodies.push({
          label: key,
          body: formattedXmlBody,
          summary: example.summary,
        });
      }
    }
    language = "xml";
  }

  if (exampleBody) {
    return (
      <FormItem label="Body" required={required}>
        <SchemaTabs lazy>
          <TabItem label="Default" value="default" default>
            <LiveApp action={dispatch} language={language}>
              {defaultBody}
            </LiveApp>
          </TabItem>
          <TabItem label="Example" value="example">
            {exampleBody && (
              <LiveApp action={dispatch} language={language}>
                {exampleBody}
              </LiveApp>
            )}
          </TabItem>
        </SchemaTabs>
      </FormItem>
    );
  }

  if (examplesBodies && examplesBodies.length > 0) {
    return (
      <FormItem label="Body" required={required}>
        <SchemaTabs lazy>
          <TabItem label="Default" value="default" default>
            <LiveApp action={dispatch} language={language}>
              {defaultBody}
            </LiveApp>
          </TabItem>
          {examplesBodies.map((example: any) => {
            return (
              <TabItem
                label={example.label}
                value={example.label}
                key={example.label}
              >
                {example.summary && <p>{example.summary}</p>}
                {example.body && (
                  <LiveApp action={dispatch} language={language}>
                    {example.body}
                  </LiveApp>
                )}
              </TabItem>
            );
          })}
        </SchemaTabs>
      </FormItem>
    );
  }

  return (
    <FormItem label="Body" required={required}>
      <LiveApp action={dispatch} language={language}>
        {defaultBody}
      </LiveApp>
    </FormItem>
  );
}

export default BodyWrap;
