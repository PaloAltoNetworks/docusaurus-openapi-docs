/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import CodeBlock from "@theme/CodeBlock";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
/* eslint-disable import/no-extraneous-dependencies*/
import clsx from "clsx";
import { createDescription } from "docusaurus-theme-openapi-docs/lib/markdown/createDescription";
/* eslint-disable import/no-extraneous-dependencies*/
import {
  getQualifierMessage,
  getSchemaName,
} from "docusaurus-theme-openapi-docs/lib/markdown/schema";
/* eslint-disable import/no-extraneous-dependencies*/
import {
  guard,
  toString,
} from "docusaurus-theme-openapi-docs/lib/markdown/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

function ParamsItem({
  param: { description, example, examples, name, required, schema, deprecated },
}) {
  if (!schema || !schema?.type) {
    schema = { type: "any" };
  }

  const renderSchemaName = guard(schema, (schema) => (
    <span className="openapi-schema__type"> {getSchemaName(schema)}</span>
  ));

  const renderSchemaRequired = guard(required, () => (
    <span className="openapi-schema__required">required</span>
  ));

  const renderDeprecated = guard(deprecated, () => (
    <span className="openapi-schema__deprecated">deprecated</span>
  ));

  const renderSchema = guard(getQualifierMessage(schema), (message) => (
    <div>
      <ReactMarkdown
        children={createDescription(message)}
        rehypePlugins={[rehypeRaw]}
      />
    </div>
  ));

  const renderDescription = guard(description, (description) => (
    <div>
      <ReactMarkdown
        children={createDescription(description)}
        components={{
          pre: "div",
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            if (inline) return <code>{children}</code>;
            return !inline && match ? (
              <CodeBlock className={className}>{children}</CodeBlock>
            ) : (
              <CodeBlock>{children}</CodeBlock>
            );
          },
        }}
        rehypePlugins={[rehypeRaw]}
      />
    </div>
  ));

  const renderDefaultValue = guard(
    schema && schema.items
      ? schema.items.default
      : schema
      ? schema.default
      : undefined,
    (value) => (
      <div>
        <ReactMarkdown children={`**Default value:** \`${value}\``} />
      </div>
    )
  );

  const renderExample = guard(toString(example), (example) => (
    <div>
      <strong>Example: </strong>
      {example}
    </div>
  ));

  const renderExamples = guard(examples, (examples) => {
    const exampleEntries = Object.entries(examples);
    return (
      <>
        <strong>Examples:</strong>
        <SchemaTabs>
          {exampleEntries.map(([exampleName, exampleProperties]) => (
            <TabItem value={exampleName} label={exampleName}>
              {exampleProperties.summary && <p>{exampleProperties.summary}</p>}
              {exampleProperties.description && (
                <p>
                  <strong>Description: </strong>
                  <span>{exampleProperties.description}</span>
                </p>
              )}
              <p>
                <strong>Example: </strong>
                <code>{exampleProperties.value}</code>
              </p>
            </TabItem>
          ))}
        </SchemaTabs>
      </>
    );
  });

  return (
    <div className="openapi-params__list-item">
      <span className="openapi-schema__container">
        <strong
          className={clsx("openapi-schema__property", {
            "openapi-schema__strikethrough": deprecated,
          })}
        >
          {name}
        </strong>
        {renderSchemaName}
        {(required || deprecated) && (
          <span className="openapi-schema__divider"></span>
        )}
        {renderSchemaRequired}
        {renderDeprecated}
      </span>
      {renderSchema}
      {renderDefaultValue}
      {renderDescription}
      {renderExample}
      {renderExamples}
    </div>
  );
}

export default ParamsItem;
