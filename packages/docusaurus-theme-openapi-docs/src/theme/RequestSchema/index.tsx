/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import Details from "@theme/Details";
import Markdown from "@theme/Markdown";
import MimeTabs from "@theme/MimeTabs"; // Assume these components exist
import {
  ExampleFromSchema,
  RequestMimeExample,
  RequestMimeExamples,
  RequestSchemaExample,
  RequestSchemaExamples,
} from "@theme/RequestExamples";
import SchemaNode from "@theme/Schema";
import SchemaTabs from "@theme/SchemaTabs";
import SkeletonLoader from "@theme/SkeletonLoader";
import TabItem from "@theme/TabItem";
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

const RequestSchemaComponent: React.FC<Props> = ({ title, body, style }) => {
  if (
    body === undefined ||
    body.content === undefined ||
    Object.keys(body).length === 0 ||
    Object.keys(body.content).length === 0
  ) {
    return null;
  }

  const SchemaTitle = "Schema";
  const mimeTypes = Object.keys(body.content);
  if (mimeTypes && mimeTypes.length) {
    return (
      <MimeTabs className="openapi-tabs__mime" schemaType="request">
        {mimeTypes.map((mimeType) => {
          const mimeExamples = body.content![mimeType].examples;
          const mimeExample = body.content![mimeType].example;
          const schemaExamples = body.content![mimeType].schema?.examples;
          const schemaExample = body.content![mimeType].schema?.example;

          const firstBody = body.content![mimeType].schema;
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
                <TabItem
                  key={SchemaTitle}
                  label={SchemaTitle}
                  value={SchemaTitle}
                >
                  <Details
                    className="openapi-markdown__details mime"
                    data-collapsed={false}
                    open={true}
                    style={style}
                    summary={
                      <>
                        <summary>
                          <h3 className="openapi-markdown__details-summary-header-body">
                            {title}
                            {body.required && (
                              <strong className="openapi-schema__required">
                                required
                              </strong>
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
                      <SchemaNode schema={firstBody} schemaType="request" />
                    </ul>
                  </Details>
                </TabItem>
                {firstBody &&
                  ExampleFromSchema({ schema: firstBody, mimeType })}

                {mimeExamples &&
                  RequestMimeExamples({ examples: mimeExamples, mimeType })}

                {mimeExample &&
                  RequestMimeExample({ example: mimeExample, mimeType })}

                {schemaExamples &&
                  RequestSchemaExamples({ examples: schemaExamples, mimeType })}

                {schemaExample &&
                  RequestSchemaExample({ example: schemaExample, mimeType })}
              </SchemaTabs>
            </TabItem>
          );
        })}
      </MimeTabs>
    );
  }
  return null;
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
