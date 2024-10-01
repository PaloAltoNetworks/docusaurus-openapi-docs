/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Details from "@theme/Details";
import MimeTabs from "@theme/MimeTabs"; // Assume these components exist
import { ExampleFromSchema } from "@theme/ResponseExamples";
import ResponseSamples from "@theme/ResponseSamples";
import SchemaComponent from "@theme/Schema";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import { createDescription } from "docusaurus-plugin-openapi-docs/lib/markdown/createDescription";
import { MediaTypeObject } from "docusaurus-plugin-openapi-docs/lib/openapi/types";

interface Props {
  style?: React.CSSProperties;
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: string[] | boolean;
  };
}

const ResponseSchema: React.FC<Props> = ({ title, body, style }): any => {
  if (
    body === undefined ||
    body.content === undefined ||
    Object.keys(body).length === 0 ||
    Object.keys(body.content).length === 0
  ) {
    return null;
  }

  // Get all MIME types, including vendor-specific
  const mimeTypes = Object.keys(body.content);

  if (mimeTypes && mimeTypes.length > 1) {
    return (
      <MimeTabs className="openapi-tabs__mime" schemaType="response">
        {mimeTypes.map((mimeType: any) => {
          const responseExamples = body.content![mimeType].examples;
          const responseExample = body.content![mimeType].example;
          const firstBody: any =
            body.content![mimeType].schema ?? body.content![mimeType];

          if (
            firstBody === undefined &&
            responseExample === undefined &&
            responseExamples === undefined
          ) {
            return undefined;
          }
          let language: string;
          if (mimeType.endsWith("json")) language = "json";
          if (mimeType.endsWith("xml")) language = "xml";

          let examples;
          if (responseExamples) {
            examples = Object.entries(responseExamples!).map(
              ([exampleName, exampleValue]: any) => {
                const isObject = typeof exampleValue.value === "object";
                const responseExample = isObject
                  ? JSON.stringify(exampleValue.value, null, 2)
                  : exampleValue.value;

                return (
                  //@ts-ignore
                  <TabItem
                    label={exampleName}
                    value={exampleName}
                    key={exampleName}
                  >
                    {exampleValue.summary && (
                      <div className="openapi-example__summary">
                        {exampleValue.summary}
                      </div>
                    )}
                    <ResponseSamples
                      responseExample={responseExample}
                      language={language}
                    />
                  </TabItem>
                );
              }
            );
          }

          let example;
          if (responseExample) {
            const isObject = typeof responseExample === "object";
            const exampleContent = isObject
              ? JSON.stringify(responseExample, null, 2)
              : responseExample;
            example = () => {
              return (
                // @ts-ignore
                <TabItem label="Example" value="Example">
                  {responseExample.summary && (
                    <div className="openapi-example__summary">
                      {responseExample.summary}
                    </div>
                  )}
                  <ResponseSamples
                    responseExample={exampleContent}
                    language={language}
                  />
                </TabItem>
              );
            };
          }

          if (firstBody) {
            return (
              // @ts-ignore
              <TabItem key={mimeType} label={mimeType} value={mimeType}>
                <SchemaTabs className="openapi-tabs__schema">
                  {/* @ts-ignore */}
                  <TabItem key={title} label={title} value={title}>
                    <Details
                      className="openapi-markdown__details response"
                      data-collapsed={false}
                      open={true}
                      style={style}
                      summary={
                        <>
                          <summary>
                            <strong className="openapi-markdown__details-summary-response">
                              {title}
                              {body.required === true && (
                                <span className="openapi-schema__required">
                                  required
                                </span>
                              )}
                            </strong>
                          </summary>
                        </>
                      }
                    >
                      <div style={{ textAlign: "left", marginLeft: "1rem" }}>
                        {body.description && (
                          <div
                            style={{ marginTop: "1rem", marginBottom: "1rem" }}
                          >
                            {createDescription(body.description)}
                          </div>
                        )}
                      </div>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaComponent
                          schema={firstBody}
                          schemaType="request"
                        />
                      </ul>
                    </Details>
                  </TabItem>
                  {firstBody && (
                    // @ts-ignore
                    <TabItem
                      label="Example (from schema)"
                      value="Example (from schema)"
                    >
                      <ExampleFromSchema
                        schema={firstBody}
                        mimeType={mimeType}
                      />
                    </TabItem>
                  )}
                  {examples && examples}

                  {example && example()}
                </SchemaTabs>
              </TabItem>
            );
          }
          return undefined;
        })}
      </MimeTabs>
    );
  }
  return undefined;
};

export default ResponseSchema;
