/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import CodeBlock from "@theme/CodeBlock";
/* eslint-disable import/no-extraneous-dependencies*/
import { createDescription } from "docusaurus-theme-openapi-docs/lib/markdown/createDescription";
/* eslint-disable import/no-extraneous-dependencies*/
import {
  getQualifierMessage,
  getSchemaName,
} from "docusaurus-theme-openapi-docs/lib/markdown/schema";
/* eslint-disable import/no-extraneous-dependencies*/
import { guard } from "docusaurus-theme-openapi-docs/lib/markdown/utils";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import styles from "./styles.module.css";

function ParamsItem({
  param: { description, example, examples, name, required, schema },
}) {
  const renderSchemaName = guard(schema, (schema) => (
    <span className={styles.schemaName}> {getSchemaName(schema)}</span>
  ));

  const renderSchemaRequired = guard(required, () => (
    <strong className={styles.paramsRequired}> required</strong>
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

  const renderExample = guard(example, (example) => (
    <>
      <strong>Example: </strong>
      {example}
    </>
  ));

  const renderExamples = guard(examples, (examples) => {
    const exampleEntries = Object.entries(examples);
    return (
      <SchemaTabs>
        {exampleEntries.map(([exampleName, exampleProperties]) => (
          <TabItem
            className={styles.paramsItemExamplesContainer}
            value={exampleName}
            label={exampleName}
          >
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
    );
  });

  console.log(example, examples);
  return (
    <li className={styles.paramsItem}>
      <strong>{name}</strong>
      {renderSchemaName}
      {renderSchemaRequired}
      {renderSchema}
      {renderDefaultValue}
      {renderDescription}
      {renderExample}
      {renderExamples}
    </li>
  );
}

export default ParamsItem;
