/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import CodeBlock from "@theme/CodeBlock";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { createDescription } from "../../markdown/createDescription";
import { getQualifierMessage, getSchemaName } from "../../markdown/schema";
import { guard } from "../../markdown/utils";
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
    <div>{`Example: ${example}`}</div>
  ));

  const renderExamples = guard(examples, (examples) => {
    const exampleEntries = Object.entries(examples);
    return (
      <>
        {exampleEntries.map(([k, v]) => (
          <div>{`Example (${k}): ${v.value}`}</div>
        ))}
      </>
    );
  });

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
