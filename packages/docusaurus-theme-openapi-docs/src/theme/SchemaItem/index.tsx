/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { ReactNode } from "react";

import Markdown from "@theme/Markdown";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import clsx from "clsx";

import { guard } from "../../markdown/utils";

export interface Props {
  children?: ReactNode;
  collapsible?: boolean;
  name?: string;
  qualifierMessage?: string | undefined;
  required?: boolean;
  schemaName?: string;
  // TODO should probably be typed
  schema?: any;
  discriminator?: boolean;
}

const transformEnumDescriptions = (
  enumDescriptions?: Record<string, string>
) => {
  if (enumDescriptions) {
    return Object.entries(enumDescriptions);
  }

  return [];
};

const getEnumDescriptionMarkdown = (enumDescriptions?: [string, string][]) => {
  if (enumDescriptions?.length) {
    return `| Enum Value | Description |
| ---- | ----- |
${enumDescriptions
  .map((desc) => {
    return `| ${desc[0]} | ${desc[1]} | `.replaceAll("\n", "<br/>");
  })
  .join("\n")}
    `;
  }

  return "";
};

export default function SchemaItem(props: Props) {
  const {
    children: collapsibleSchemaContent,
    collapsible,
    name,
    qualifierMessage,
    required,
    schemaName,
    schema,
  } = props;
  let deprecated;
  let schemaDescription;
  let defaultValue: string | undefined;
  let example: string | undefined;
  let examples: string[] | undefined;
  let nullable;
  let enumDescriptions: [string, string][] = [];
  let constValue: string | undefined;

  if (schema) {
    deprecated = schema.deprecated;
    schemaDescription = schema.description;
    enumDescriptions = transformEnumDescriptions(schema["x-enumDescriptions"]);
    defaultValue = schema.default;
    example = schema.example;
    examples = schema.examples;
    nullable =
      schema.nullable ||
      (Array.isArray(schema.type) && schema.type.includes("null")); // support JSON Schema nullable
    constValue = schema.const;
  }

  const renderRequired = guard(
    Array.isArray(required) ? required.includes(name) : required,
    () => <span className="openapi-schema__required">required</span>
  );

  const renderDeprecated = guard(deprecated, () => (
    <span className="openapi-schema__deprecated">deprecated</span>
  ));

  const renderNullable = guard(nullable, () => (
    <span className="openapi-schema__nullable">nullable</span>
  ));

  const renderEnumDescriptions = guard(
    getEnumDescriptionMarkdown(enumDescriptions),
    (value) => {
      return (
        <div style={{ marginTop: ".5rem" }}>
          <Markdown>{value}</Markdown>
        </div>
      );
    }
  );

  const renderSchemaDescription = guard(schemaDescription, (description) => (
    <>
      <Markdown>{description}</Markdown>
    </>
  ));

  const renderQualifierMessage = guard(qualifierMessage, (message) => (
    <>
      <Markdown>{message}</Markdown>
    </>
  ));

  function renderDefaultValue() {
    if (defaultValue !== undefined) {
      if (typeof defaultValue === "string") {
        return (
          <div>
            <strong>Default value: </strong>
            <span>
              <code>{defaultValue}</code>
            </span>
          </div>
        );
      }
      return (
        <div>
          <strong>Default value: </strong>
          <span>
            <code>{JSON.stringify(defaultValue)}</code>
          </span>
        </div>
      );
    }
    return undefined;
  }

  function renderExample() {
    if (example !== undefined) {
      if (typeof example === "string") {
        return (
          <div>
            <strong>Example: </strong>
            <span>
              <code>{example}</code>
            </span>
          </div>
        );
      }
      return (
        <div>
          <strong>Example: </strong>
          <span>
            <code>{JSON.stringify(example)}</code>
          </span>
        </div>
      );
    }
    return undefined;
  }

  // Helper function to format example value
  const formatExample = (example: any) => {
    if (typeof example === "object" && example !== null) {
      return JSON.stringify(example);
    }
    return String(example);
  };

  function renderExamples() {
    if (examples && examples.length > 0) {
      // If there's only one example, display it without tabs
      if (examples.length === 1) {
        return (
          <div>
            <strong>Example: </strong>
            <span>
              <code>{formatExample(examples[0])}</code>
            </span>
          </div>
        );
      }

      // Multiple examples - use tabs
      return (
        <div>
          <strong>Examples:</strong>
          <SchemaTabs>
            {examples.map((example, index) => (
              // @ts-ignore
              <TabItem
                value={`Example ${index + 1}`}
                label={`Example ${index + 1}`}
                key={`Example ${index + 1}`}
              >
                <p>
                  <strong>Example: </strong>
                  <code>{formatExample(example)}</code>
                </p>
              </TabItem>
            ))}
          </SchemaTabs>
        </div>
      );
    }
    return undefined;
  }

  function renderConstValue() {
    if (constValue !== undefined) {
      if (typeof constValue === "string") {
        return (
          <div>
            <strong>Constant value: </strong>
            <span>
              <code>{constValue}</code>
            </span>
          </div>
        );
      }
      return (
        <div>
          <strong>Constant value: </strong>
          <span>
            <code>{JSON.stringify(constValue)}</code>
          </span>
        </div>
      );
    }
    return undefined;
  }

  const schemaContent = (
    <div>
      <span className="openapi-schema__container">
        <strong
          className={clsx("openapi-schema__property", {
            "openapi-schema__strikethrough": deprecated,
          })}
        >
          {name}
        </strong>
        <span className="openapi-schema__name">
          {Array.isArray(schemaName) ? schemaName.join(" | ") : schemaName}
        </span>
        {(nullable || required || deprecated) && (
          <span className="openapi-schema__divider"></span>
        )}
        {renderNullable}
        {renderRequired}
        {renderDeprecated}
      </span>
      {renderSchemaDescription}
      {renderEnumDescriptions}
      {renderQualifierMessage}
      {renderConstValue()}
      {renderDefaultValue()}
      {renderExample()}
      {renderExamples()}
      {collapsibleSchemaContent ?? collapsibleSchemaContent}
    </div>
  );

  return (
    <div className="openapi-schema__list-item">
      {collapsible ? collapsibleSchemaContent : schemaContent}
    </div>
  );
}
