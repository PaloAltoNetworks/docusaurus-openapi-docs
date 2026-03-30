/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import { translate } from "@docusaurus/Translate";
import Details from "@theme/Details";
import Markdown from "@theme/Markdown";
import MimeTabs from "@theme/MimeTabs"; // Assume these components exist
import {
  ExampleFromSchema,
  ResponseExample,
  ResponseExamples,
} from "@theme/ResponseExamples";
import SchemaNode from "@theme/Schema";
import SchemaTabs from "@theme/SchemaTabs";
import SkeletonLoader from "@theme/SkeletonLoader";
import TabItem from "@theme/TabItem";
import { OPENAPI_REQUEST, OPENAPI_SCHEMA_ITEM } from "@theme/translationIds";
import type { MediaTypeObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";

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

const RequestSchemaComponent: React.FC<Props> = ({ title, body, style }) => {
  if (
    body === undefined ||
    body.content === undefined ||
    Object.keys(body).length === 0 ||
    Object.keys(body.content).length === 0
  ) {
    return null;
  }

  const mimeTypes = Object.keys(body.content);

  if (mimeTypes.length > 1) {
    return (
      <MimeTabs className="openapi-tabs__mime" schemaType="request" lazy>
        {mimeTypes.map((mimeType) => {
          const mediaTypeObject = body.content![mimeType];
          const firstBody = mediaTypeObject?.schema;
          const requestExamples = mediaTypeObject?.examples;
          const requestExample = mediaTypeObject?.example;

          if (
            firstBody === undefined ||
            (firstBody.properties &&
              Object.keys(firstBody.properties).length === 0)
          ) {
            return null;
          }
          return (
            // @ts-ignore
            <TabItem key={mimeType} label={mimeType} value={mimeType}>
              <SchemaTabs className="openapi-tabs__schema">
                {/* @ts-ignore */}
                <TabItem key={title} label={title} value={title}>
                  <div style={{ marginTop: "1rem" }}>
                    <Details
                      className="openapi-markdown__details mime"
                      data-collapsed={false}
                      open={true}
                      style={style}
                      summary={
                        <>
                          <summary>
                            <h3 className="openapi-markdown__details-summary-header-body">
                              {translate({
                                id: OPENAPI_REQUEST.BODY_TITLE,
                                message: title,
                              })}
                              {body.required === true && (
                                <span className="openapi-schema__required">
                                  {translate({
                                    id: OPENAPI_SCHEMA_ITEM.REQUIRED,
                                    message: "required",
                                  })}
                                </span>
                              )}
                            </h3>
                          </summary>
                        </>
                      }
                    >
                      <div style={{ textAlign: "left", marginLeft: "1rem" }}>
                        {body.description && (
                          <div
                            style={{ marginTop: "1rem", marginBottom: "1rem" }}
                          >
                            <Markdown>{body.description}</Markdown>
                          </div>
                        )}
                      </div>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaNode
                          schema={firstBody}
                          schemaType="request"
                          schemaPath="requestBody"
                        />
                      </ul>
                    </Details>
                  </div>
                </TabItem>
                {firstBody &&
                  ExampleFromSchema({
                    schema: firstBody,
                    mimeType: mimeType,
                  })}
                {requestExamples &&
                  ResponseExamples({
                    responseExamples: requestExamples,
                    mimeType,
                  })}
                {requestExample &&
                  ResponseExample({
                    responseExample: requestExample,
                    mimeType,
                  })}
              </SchemaTabs>
            </TabItem>
          );
        })}
      </MimeTabs>
    );
  }

  const randomFirstKey = mimeTypes[0];
  const mediaTypeObject = body.content[randomFirstKey];
  const firstBody = mediaTypeObject?.schema ?? body.content![randomFirstKey];
  const requestExamples = mediaTypeObject?.examples;
  const requestExample = mediaTypeObject?.example;

  if (firstBody === undefined) {
    return null;
  }

  return (
    <MimeTabs className="openapi-tabs__mime" schemaType="request">
      {/* @ts-ignore */}
      <TabItem label={randomFirstKey} value={`${randomFirstKey}-schema`}>
        <SchemaTabs className="openapi-tabs__schema">
          {/* @ts-ignore */}
          <TabItem key={title} label={title} value={title}>
            <Details
              className="openapi-markdown__details mime"
              data-collapsed={false}
              open={true}
              style={style}
              summary={
                <>
                  <summary>
                    <h3 className="openapi-markdown__details-summary-header-body">
                      {translate({
                        id: OPENAPI_REQUEST.BODY_TITLE,
                        message: title,
                      })}
                      {firstBody.type === "array" && (
                        <span style={{ opacity: "0.6" }}> array</span>
                      )}
                      {body.required && (
                        <strong className="openapi-schema__required">
                          {translate({
                            id: OPENAPI_SCHEMA_ITEM.REQUIRED,
                            message: "required",
                          })}
                        </strong>
                      )}
                    </h3>
                  </summary>
                </>
              }
            >
              <div style={{ textAlign: "left", marginLeft: "1rem" }}>
                {body.description && (
                  <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                    <Markdown>{body.description}</Markdown>
                  </div>
                )}
              </div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaNode
                  schema={firstBody}
                  schemaType="request"
                  schemaPath="requestBody"
                />
              </ul>
            </Details>
          </TabItem>
          {firstBody &&
            ExampleFromSchema({
              schema: firstBody,
              mimeType: randomFirstKey,
            })}
          {requestExamples &&
            ResponseExamples({
              responseExamples: requestExamples,
              mimeType: randomFirstKey,
            })}
          {requestExample &&
            ResponseExample({
              responseExample: requestExample,
              mimeType: randomFirstKey,
            })}
        </SchemaTabs>
      </TabItem>
    </MimeTabs>
  );
};

const RequestSchema: React.FC<Props> = (props) => {
  return (
    <BrowserOnly fallback={<SkeletonLoader size="sm" />}>
      {() => {
        return <RequestSchemaComponent {...props} />;
      }}
    </BrowserOnly>
  );
};

export default RequestSchema;
