/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect } from "react";

import { translate } from "@docusaurus/Translate";

import json2xml from "@theme/ApiExplorer/Body/json2xml";
import FormFileUpload from "@theme/ApiExplorer/FormFileUpload";
import FormItem from "@theme/ApiExplorer/FormItem";
import LiveApp from "@theme/ApiExplorer/LiveEditor";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import Markdown from "@theme/Markdown";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import { OPENAPI_BODY, OPENAPI_REQUEST } from "@theme/translationIds";
import { RequestBodyObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import { sampleFromSchema } from "docusaurus-plugin-openapi-docs/src/openapi/createSchemaExample";
import format from "xml-formatter";

import { clearRawBody, setFileRawBody, setStringRawBody } from "./slice";
import FormBodyItem from "./FormBodyItem";

export interface Props {
  jsonRequestBodyExample: string;
  requestBodyMetadata?: RequestBodyObject;
  methods?: any;
  required?: boolean;
}

function BodyWrap({
  requestBodyMetadata,
  jsonRequestBodyExample,
  methods,
  required,
}: Props) {
  const contentType = useTypedSelector((state: any) => state.contentType.value);

  // NOTE: We used to check if body was required, but opted to always show the request body
  // to reduce confusion, see: https://github.com/cloud-annotations/docusaurus-openapi/issues/145

  // No body
  if (contentType === undefined) {
    return null;
  }

  return (
    <Body
      requestBodyMetadata={requestBodyMetadata}
      jsonRequestBodyExample={jsonRequestBodyExample}
      required={required}
    />
  );
}

function Body({
  requestBodyMetadata,
  jsonRequestBodyExample,
  methods,
  required,
}: Props) {
  const contentType = useTypedSelector((state: any) => state.contentType.value);
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
  // OpenAPI 3.1 / JSON Schema: schema.examples is an array of example values
  const schemaExamples = schema?.examples as any[] | undefined;

  if (schema?.format === "binary") {
    return (
      <FormItem>
        <FormFileUpload
          placeholder={
            schema.description ||
            translate({ id: OPENAPI_REQUEST.BODY_TITLE, message: "Body" })
          }
          onChange={(file: any) => {
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
      <FormItem className="openapi-explorer__form-item-body-container">
        {Object.entries(schema.properties ?? {}).map(([key, val]: any) => {
          return (
            <FormItem
              key={key}
              label={key}
              required={
                Array.isArray(schema.required) && schema.required.includes(key)
              }
            >
              <FormBodyItem
                schemaObject={val}
                id={key}
                schema={schema}
              ></FormBodyItem>
            </FormItem>
          );
        })}
      </FormItem>
    );
  }

  let language = "plaintext";
  let defaultBody = ""; //"body content";
  let exampleBody;
  let examplesBodies = [] as any;

  // Generate example from the schema for the current content type
  let contentTypeExample;
  if (schema) {
    contentTypeExample = sampleFromSchema(schema, { type: "request" });
  } else if (jsonRequestBodyExample) {
    // Fallback to the build-time generated example if no schema is available
    contentTypeExample = jsonRequestBodyExample;
  }

  if (
    contentType.includes("application/json") ||
    contentType.endsWith("+json")
  ) {
    if (contentTypeExample) {
      defaultBody = JSON.stringify(contentTypeExample, null, 2);
    }
    if (example) {
      exampleBody = JSON.stringify(example, null, 2);
    }
    if (examples) {
      for (const [key, example] of Object.entries(examples)) {
        let body = example.value;
        try {
          // If the value is already valid JSON we shouldn't double encode the value
          JSON.parse(example.value);
        } catch (e) {
          body = JSON.stringify(example.value, null, 2);
        }

        examplesBodies.push({
          label: key,
          body,
          summary: example.summary,
        });
      }
    }
    // OpenAPI 3.1: schema.examples is an array of example values
    if (schemaExamples && Array.isArray(schemaExamples)) {
      schemaExamples.forEach((schemaExample, index) => {
        const body = JSON.stringify(schemaExample, null, 2);
        examplesBodies.push({
          label: `Example ${index + 1}`,
          body,
          summary: undefined,
        });
      });
    }
    language = "json";
  }

  if (contentType === "application/xml" || contentType.endsWith("+xml")) {
    if (contentTypeExample) {
      try {
        defaultBody = format(json2xml(contentTypeExample, ""), {
          indentation: "  ",
          lineSeparator: "\n",
          collapseContent: true,
        });
      } catch {
        defaultBody = json2xml(contentTypeExample);
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
    // OpenAPI 3.1: schema.examples is an array of example values
    if (schemaExamples && Array.isArray(schemaExamples)) {
      schemaExamples.forEach((schemaExample, index) => {
        let formattedXmlBody;
        try {
          formattedXmlBody = format(json2xml(schemaExample, ""), {
            indentation: "  ",
            lineSeparator: "\n",
            collapseContent: true,
          });
        } catch {
          formattedXmlBody = json2xml(schemaExample);
        }
        examplesBodies.push({
          label: `Example ${index + 1}`,
          body: formattedXmlBody,
          summary: undefined,
        });
      });
    }
    language = "xml";
  }

  // Update body in Redux when content type changes
  useEffect(() => {
    if (defaultBody) {
      dispatch(setStringRawBody(defaultBody));
    }
    // Only re-run when contentType changes, not when defaultBody changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType]);

  if (exampleBody) {
    return (
      <FormItem>
        <SchemaTabs className="openapi-tabs__schema" lazy>
          {/* @ts-ignore */}
          <TabItem
            label={translate({
              id: OPENAPI_BODY.EXAMPLE_FROM_SCHEMA,
              message: "Example (from schema)",
            })}
            value="Example (from schema)"
            default
          >
            <LiveApp
              key={contentType}
              action={(code: string) => dispatch(setStringRawBody(code))}
              language={language}
              required={required}
            >
              {defaultBody}
            </LiveApp>
          </TabItem>
          {/* @ts-ignore */}
          <TabItem label="Example" value="example">
            {example.summary && <Markdown>{example.summary}</Markdown>}
            {exampleBody && (
              <LiveApp
                key={contentType}
                action={(code: string) => dispatch(setStringRawBody(code))}
                language={language}
                required={required}
              >
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
      <FormItem className="openapi-explorer__form-item-body-container">
        <SchemaTabs className="openapi-tabs__schema" lazy>
          {/* @ts-ignore */}
          <TabItem
            label={translate({
              id: OPENAPI_BODY.EXAMPLE_FROM_SCHEMA,
              message: "Example (from schema)",
            })}
            value="Example (from schema)"
            default
          >
            <LiveApp
              key={contentType}
              action={(code: string) => dispatch(setStringRawBody(code))}
              language={language}
              required={required}
            >
              {defaultBody}
            </LiveApp>
          </TabItem>
          {examplesBodies.map((example: any) => {
            return (
              // @ts-ignore
              <TabItem
                label={example.label}
                value={example.label}
                key={example.label}
              >
                {example.summary && <Markdown>{example.summary}</Markdown>}
                {example.body && (
                  <LiveApp
                    key={`${contentType}-${example.label}`}
                    action={(code: string) => dispatch(setStringRawBody(code))}
                    language={language}
                  >
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
    <FormItem>
      <LiveApp
        key={contentType}
        action={(code: string) => dispatch(setStringRawBody(code))}
        language={language}
        required={required}
      >
        {defaultBody}
      </LiveApp>
    </FormItem>
  );
}

export default BodyWrap;
