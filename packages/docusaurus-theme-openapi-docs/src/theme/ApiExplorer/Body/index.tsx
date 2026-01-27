/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useMemo } from "react";

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
import type { RequestBodyObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import { sampleFromSchema } from "docusaurus-plugin-openapi-docs/lib/openapi/createSchemaExample";
import format from "xml-formatter";

import { clearRawBody, setFileRawBody, setStringRawBody } from "./slice";
import FormBodyItem from "./FormBodyItem";
import { resolveSchemaWithSelections } from "./resolveSchemaWithSelections";

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
  const schemaSelections = useTypedSelector(
    (state: any) => state.schemaSelection?.selections ?? {}
  );
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

  const rawSchema = requestBodyMetadata?.content?.[contentType]?.schema;
  const example = requestBodyMetadata?.content?.[contentType]?.example;
  const examples = requestBodyMetadata?.content?.[contentType]?.examples;

  // Resolve the schema based on user's anyOf/oneOf tab selections
  const schema = useMemo(() => {
    if (!rawSchema) return rawSchema;
    return resolveSchemaWithSelections(
      rawSchema,
      schemaSelections,
      "requestBody"
    );
  }, [rawSchema, schemaSelections]);

  // OpenAPI 3.1 / JSON Schema: schema.examples is an array of example values
  const schemaExamples = schema?.examples as any[] | undefined;

  // Compute the default body based on content type and schema
  // This needs to be computed before early returns so the useEffect can use it
  const { defaultBody, exampleBody, examplesBodies, language } = useMemo(() => {
    let lang = "plaintext";
    let defBody = "";
    let exBody;
    let exBodies = [] as any;

    // Skip body generation for binary and form content types
    if (schema?.format === "binary") {
      return {
        defaultBody: defBody,
        exampleBody: exBody,
        examplesBodies: exBodies,
        language: lang,
      };
    }
    if (
      (contentType === "multipart/form-data" ||
        contentType === "application/x-www-form-urlencoded") &&
      schema?.type === "object"
    ) {
      return {
        defaultBody: defBody,
        exampleBody: exBody,
        examplesBodies: exBodies,
        language: lang,
      };
    }

    // Generate example from the schema for the current content type
    let contentTypeExample;
    if (schema) {
      contentTypeExample = sampleFromSchema(schema, { type: "request" });
    } else if (jsonRequestBodyExample) {
      // Fallback to the build-time generated example if no schema is available
      contentTypeExample = jsonRequestBodyExample;
    }

    if (
      contentType?.includes("application/json") ||
      contentType?.endsWith("+json")
    ) {
      if (contentTypeExample) {
        defBody = JSON.stringify(contentTypeExample, null, 2);
      }
      if (example) {
        exBody = JSON.stringify(example, null, 2);
      }
      if (examples) {
        for (const [key, ex] of Object.entries(examples)) {
          let body = ex.value;
          try {
            // If the value is already valid JSON we shouldn't double encode the value
            JSON.parse(ex.value);
          } catch (e) {
            body = JSON.stringify(ex.value, null, 2);
          }

          exBodies.push({
            label: key,
            body,
            summary: ex.summary,
          });
        }
      }
      // OpenAPI 3.1: schema.examples is an array of example values
      if (schemaExamples && Array.isArray(schemaExamples)) {
        schemaExamples.forEach((schemaExample, index) => {
          const body = JSON.stringify(schemaExample, null, 2);
          exBodies.push({
            label: `Example ${index + 1}`,
            body,
            summary: undefined,
          });
        });
      }
      lang = "json";
    }

    if (contentType === "application/xml" || contentType?.endsWith("+xml")) {
      if (contentTypeExample) {
        try {
          defBody = format(json2xml(contentTypeExample, ""), {
            indentation: "  ",
            lineSeparator: "\n",
            collapseContent: true,
          });
        } catch {
          defBody = json2xml(contentTypeExample);
        }
      }
      if (example) {
        try {
          exBody = format(json2xml(example, ""), {
            indentation: "  ",
            lineSeparator: "\n",
            collapseContent: true,
          });
        } catch {
          exBody = json2xml(example);
        }
      }
      if (examples) {
        for (const [key, ex] of Object.entries(examples)) {
          let formattedXmlBody;
          try {
            formattedXmlBody = format(ex.value, {
              indentation: "  ",
              lineSeparator: "\n",
              collapseContent: true,
            });
          } catch {
            formattedXmlBody = ex.value;
          }
          exBodies.push({
            label: key,
            body: formattedXmlBody,
            summary: ex.summary,
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
          exBodies.push({
            label: `Example ${index + 1}`,
            body: formattedXmlBody,
            summary: undefined,
          });
        });
      }
      lang = "xml";
    }

    return {
      defaultBody: defBody,
      exampleBody: exBody,
      examplesBodies: exBodies,
      language: lang,
    };
  }, [
    schema,
    contentType,
    example,
    examples,
    schemaExamples,
    jsonRequestBodyExample,
  ]);

  // Create a stable key for the LiveApp component that changes when schema selection changes
  // This forces the editor to remount and pick up the new defaultBody
  const schemaSelectionKey = useMemo(
    () => JSON.stringify(schemaSelections),
    [schemaSelections]
  );

  // Update body in Redux when content type or schema selection changes
  useEffect(() => {
    if (defaultBody) {
      dispatch(setStringRawBody(defaultBody));
    }
    // Re-run when contentType, schemaSelections, or defaultBody change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, schemaSelections, defaultBody]);

  // Now handle early returns after all hooks have been called
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
              key={`${contentType}-${schemaSelectionKey}`}
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
                key={`${contentType}-example`}
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
              key={`${contentType}-${schemaSelectionKey}`}
              action={(code: string) => dispatch(setStringRawBody(code))}
              language={language}
              required={required}
            >
              {defaultBody}
            </LiveApp>
          </TabItem>
          {examplesBodies.map((ex: any) => {
            return (
              // @ts-ignore
              <TabItem label={ex.label} value={ex.label} key={ex.label}>
                {ex.summary && <Markdown>{ex.summary}</Markdown>}
                {ex.body && (
                  <LiveApp
                    key={`${contentType}-${ex.label}`}
                    action={(code: string) => dispatch(setStringRawBody(code))}
                    language={language}
                  >
                    {ex.body}
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
        key={`${contentType}-${schemaSelectionKey}`}
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
