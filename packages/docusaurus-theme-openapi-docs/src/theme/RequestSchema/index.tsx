/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { Suspense, useEffect, useState } from "react";

import Details from "@theme/Details";
import MimeTabs from "@theme/MimeTabs"; // Assume these components exist
import SchemaNode from "@theme/Schema";
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

const RequestSchemaComponent: React.FC<Props> = ({ title, body, style }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  if (!isClient) {
    return (
      <div className="openapi-explorer__loading-container">
        <div className="openapi-response__lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

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
      <MimeTabs className="openapi-tabs__mime" schemaType="request">
        {mimeTypes.map((mimeType) => {
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
                        {body.required === true && (
                          <span className="openapi-schema__required">
                            required
                          </span>
                        )}
                      </h3>
                    </summary>
                  </>
                }
              >
                <div style={{ textAlign: "left", marginLeft: "1rem" }}>
                  {body.description && (
                    <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                      {createDescription(body.description)}
                    </div>
                  )}
                </div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaNode schema={firstBody} schemaType="request" />
                </ul>
              </Details>
            </TabItem>
          );
        })}
      </MimeTabs>
    );
  }

  const randomFirstKey = mimeTypes[0];
  const firstBody =
    body.content[randomFirstKey].schema ?? body.content![randomFirstKey];

  if (firstBody === undefined) {
    return null;
  }

  return (
    <MimeTabs className="openapi-tabs__mime" schemaType="request">
      {/* @ts-ignore */}
      <TabItem label={randomFirstKey} value={`${randomFirstKey}-schema`}>
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
                  {firstBody.type === "array" && (
                    <span style={{ opacity: "0.6" }}> array</span>
                  )}
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
              <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                {createDescription(body.description)}
              </div>
            )}
          </div>
          <ul style={{ marginLeft: "1rem" }}>
            <SchemaNode schema={firstBody} schemaType="request" />
          </ul>
        </Details>
      </TabItem>
    </MimeTabs>
  );
};

const RequestSchema: React.FC<Props> = (props) => {
  const LazyComponent = React.lazy(() =>
    Promise.resolve({ default: RequestSchemaComponent })
  );
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default RequestSchema;
