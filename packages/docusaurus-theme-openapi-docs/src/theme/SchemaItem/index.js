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
  guard,
  toString,
} from "docusaurus-theme-openapi-docs/lib/markdown/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import styles from "./styles.module.css";

function SchemaItem({
  children: collapsibleSchemaContent,
  collapsible,
  name,
  qualifierMessage,
  required,
  schemaName,
  schema,
  discriminator,
}) {
  let deprecated;
  let schemaDescription;
  let defaultValue;
  let nullable;
  if (schema) {
    deprecated = schema.deprecated;
    schemaDescription = schema.description;
    defaultValue = schema.default;
    nullable = schema.nullable;
  }

  const renderRequired = guard(
    Array.isArray(required) ? required.includes(name) : required,
    () => <strong className={styles.required}> required</strong>
  );

  const renderDeprecated = guard(deprecated, () => (
    <strong className={styles.deprecated}> deprecated</strong>
  ));

  const renderNullable = guard(nullable, () => (
    <strong className={styles.nullable}> nullable</strong>
  ));

  const renderSchemaDescription = guard(schemaDescription, (description) => (
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

  const renderQualifierMessage = guard(qualifierMessage, (message) => (
    <div className={styles.schemaQualifierMessage}>
      <ReactMarkdown
        children={createDescription(message)}
        rehypePlugins={[rehypeRaw]}
      />
    </div>
  ));

  const renderDefaultValue = guard(toString(defaultValue), (value) => (
    <div className={styles.schemaQualifierMessage}>
      <ReactMarkdown children={`**Default value:** \`${value}\``} />
    </div>
  ));

  const schemaContent = (
    <div>
      <strong className={deprecated && styles.strikethrough}>{name}</strong>
      <span className={styles.schemaName}> {schemaName}</span>
      {renderNullable}
      {!deprecated && renderRequired}
      {renderDeprecated}
      {renderQualifierMessage}
      {renderDefaultValue}
      {renderSchemaDescription}
      {collapsibleSchemaContent ?? collapsibleSchemaContent}
    </div>
  );

  return (
    <div className={styles.schemaItem}>
      {collapsible ? collapsibleSchemaContent : schemaContent}
    </div>
  );
}

export default SchemaItem;
