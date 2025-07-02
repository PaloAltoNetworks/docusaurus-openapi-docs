/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Markdown from "@theme/Markdown";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
/* eslint-disable import/no-extraneous-dependencies*/
import clsx from "clsx";

import { getQualifierMessage, getSchemaName } from "../../markdown/schema";
import { guard, toString } from "../../markdown/utils";

export interface ExampleObject {
  summary?: string | null;
  description?: string | null;
  value?: any;
  externalValue?: string | null;
}

export interface Props {
  className: string;
  param: {
    description: string;
    example: any;
    examples: Record<string, ExampleObject>;
    name: string;
    required: boolean;
    deprecated: boolean;
    schema: any;
    enumDescriptions?: [string, string][];
  };
}

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

function ParamsItem({ param, ...rest }: Props) {
  const { description, name, required, deprecated, enumDescriptions } = param;

  let schema = param.schema;
  let defaultValue: string | undefined;

  let examples = param.examples || schema?.examples;
  let example = param.example || schema?.example;

  if (!schema) {
    schema = { type: "any" };
  }

  if (!schema.type) {
    schema.type = "any";
  }

  if (schema) {
    if (schema.items) {
      defaultValue = schema.items.default;
    } else {
      defaultValue = schema.default;
    }
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

  const renderQualifier = guard(getQualifierMessage(schema), (qualifier) => (
    <Markdown>{qualifier}</Markdown>
  ));

  const renderDescription = guard(description, (description) => (
    <Markdown>{description}</Markdown>
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

  const renderExample = guard(toString(example), (example) => (
    <div>
      <strong>Example: </strong>
      <code>{example}</code>
    </div>
  ));

  // Helper function to format example value
  const formatExample = (example: any) => {
    if (typeof example === "object" && example !== null) {
      return JSON.stringify(example);
    }
    return String(example);
  };

  const renderExampleTabItem = (
    exampleName: string,
    exampleProperties: ExampleObject
  ) => {
    return (
      // @ts-ignore
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
          <code>{formatExample(exampleProperties.value)}</code>
        </p>
      </TabItem>
    );
  };

  const renderExamples = guard(examples, (examples) => {
    // Handle object-based examples (existing logic)
    let exampleEntries: [string, ExampleObject][];
    if (Array.isArray(examples)) {
      exampleEntries = examples.map((example, index) => [
        `Example ${index + 1}`,
        { value: example, summary: null, description: null },
      ]);
    } else {
      exampleEntries = Object.entries(examples);
    }

    // If there's only one example, display it without tabs
    if (exampleEntries.length === 1) {
      const firstExample = exampleEntries[0][1];
      if (!firstExample) {
        return undefined;
      }
      return (
        <div>
          <strong>Example: </strong>
          <span>
            <code>{formatExample(firstExample.value)}</code>
          </span>
        </div>
      );
    }

    return (
      <>
        <strong>Examples:</strong>
        <SchemaTabs>
          {exampleEntries.map(([exampleName, exampleProperties]) =>
            renderExampleTabItem(exampleName, exampleProperties)
          )}
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
      {renderQualifier}
      {renderDescription}
      {renderEnumDescriptions}
      {renderDefaultValue()}
      {renderExample}
      {renderExamples}
    </div>
  );
}

export default ParamsItem;
