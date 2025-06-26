/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import Details from "@theme/Details";
import {
  ExampleFromSchema,
  MimeExample,
  MimeExamples,
  SchemaExample,
  SchemaExamples,
} from "@theme/Examples";
import Markdown from "@theme/Markdown";
import MimeTabs from "@theme/MimeTabs";
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
  schemaType: "request" | "response";
}

const BaseSchemaComponent: React.FC<Props> = ({
  title,
  body,
  style,
  schemaType,
}) => {
  if (
    body === undefined ||
    body.content === undefined ||
    Object.keys(body).length === 0 ||
    Object.keys(body.content).length === 0
  ) {
    return null;
  }

  const mimeTypes = Object.keys(body.content);
  if (mimeTypes && mimeTypes.length) {
    return (
      <MimeTabs className="openapi-tabs__mime" schemaType={schemaType}>
        {mimeTypes.map((mimeType: any) => {
          const mimeExamples = body.content?.[mimeType]?.examples;
          const mimeExample = body.content?.[mimeType]?.example;
          const schemaExamples = body.content?.[mimeType]?.schema?.examples;
          const schemaExample = body.content?.[mimeType]?.schema?.example;
          const firstBody = body.content?.[mimeType]?.schema;

          if (
            firstBody === undefined ||
            (firstBody.properties &&
              Object.keys(firstBody.properties).length === 0)
          ) {
            return (
              // @ts-ignore
              <TabItem key={mimeType} label={mimeType} value={mimeType}>
                <div>No schema</div>
              </TabItem>
            );
          }

          if (firstBody) {
            const tabTitle = "Schema";
            return (
              // @ts-ignore
              <TabItem key={mimeType} label={mimeType} value={mimeType}>
                <SchemaTabs className="openapi-tabs__schema">
                  {/* @ts-ignore */}
                  <TabItem key={tabTitle} label={tabTitle} value={tabTitle}>
                    <Details
                      className="openapi-markdown__details mime"
                      data-collapsed={false}
                      open={true}
                      style={style}
                      summary={
                        <>
                          <summary>
                            <strong className="openapi-markdown__details-summary-header-body">
                              {title}
                              {body.required && (
                                <strong className="openapi-schema__required">
                                  required
                                </strong>
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
                            <Markdown>{body.description}</Markdown>
                          </div>
                        )}
                      </div>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaNode
                          schema={firstBody}
                          schemaType={schemaType}
                        />
                      </ul>
                    </Details>
                  </TabItem>
                  {firstBody &&
                    ExampleFromSchema({
                      schema: firstBody,
                      mimeType,
                      context: { type: schemaType },
                    })}

                  {mimeExamples &&
                    MimeExamples({ examples: mimeExamples, mimeType })}

                  {mimeExample &&
                    MimeExample({ example: mimeExample, mimeType })}

                  {schemaExamples &&
                    SchemaExamples({ examples: schemaExamples, mimeType })}

                  {schemaExample &&
                    SchemaExample({ example: schemaExample, mimeType })}
                </SchemaTabs>
              </TabItem>
            );
          }
          return null;
        })}
      </MimeTabs>
    );
  }
  return null;
};

const BaseSchema: React.FC<Props> = (props) => {
  return (
    <BrowserOnly fallback={<SkeletonLoader size="sm" />}>
      {() => {
        return <BaseSchemaComponent {...props} />;
      }}
    </BrowserOnly>
  );
};

export default BaseSchema;
