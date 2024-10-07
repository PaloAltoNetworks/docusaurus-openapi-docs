/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { Suspense } from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import Details from "@theme/Details";
import MimeTabs from "@theme/MimeTabs"; // Assume these components exist
import {
  ExampleFromSchema,
  ResponseExample,
  ResponseExamples,
} from "@theme/ResponseExamples";
import SchemaNode from "@theme/Schema";
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

const ResponseSchemaComponent: React.FC<Props> = ({
  title,
  body,
  style,
}): any => {
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
  if (mimeTypes && mimeTypes.length) {
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
                        <SchemaNode schema={firstBody} schemaType="request" />
                      </ul>
                    </Details>
                  </TabItem>
                  {firstBody &&
                    ExampleFromSchema({
                      schema: firstBody,
                      mimeType: mimeType,
                    })}

                  {responseExamples &&
                    ResponseExamples({ responseExamples, mimeType })}

                  {responseExample &&
                    ResponseExample({ responseExample, mimeType })}
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

const ResponseSchema: React.FC<Props> = (props) => {
  return (
    <BrowserOnly
      fallback={
        <div className="openapi-explorer__loading-container">
          <div className="openapi-response__lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      }
    >
      {() => {
        const LazyComponent = React.lazy(() =>
          Promise.resolve({ default: ResponseSchemaComponent })
        );
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyComponent {...props} />
          </Suspense>
        );
      }}
    </BrowserOnly>
  );
};

export default ResponseSchema;
