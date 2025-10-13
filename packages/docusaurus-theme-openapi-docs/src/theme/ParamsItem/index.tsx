/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { translate } from "@docusaurus/Translate";
import Markdown from "@theme/Markdown";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
/* eslint-disable import/no-extraneous-dependencies*/
import { OPENAPI_SCHEMA_ITEM } from "@theme/translationIds";
import clsx from "clsx";

import { getQualifierMessage, getSchemaName } from "../../markdown/schema";
import { guard, toString } from "../../markdown/utils";

export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export interface Props {
  className: string;
  param: {
    description: string;
    example: any;
    examples: Record<string, ExampleObject> | undefined;
    name: string;
    required: boolean;
    deprecated: boolean;
    schema: any;
    enumDescriptions?: [string, string][];
  };
}

const getEnumDescriptionMarkdown = (enumDescriptions?: [string, string][]) => {
  if (enumDescriptions?.length) {
    const enumValue = translate({
      id: OPENAPI_SCHEMA_ITEM.ENUM_VALUE,
      message: "Enum Value",
    });
    const description = translate({
      id: OPENAPI_SCHEMA_ITEM.ENUM_DESCRIPTION,
      message: "Description",
    });
    return `| ${enumValue} | ${description} |
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

  let examples = param.examples || (schema?.examples as any[] | undefined);
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
    <span className="openapi-schema__required">
      {translate({ id: OPENAPI_SCHEMA_ITEM.REQUIRED, message: "required" })}
    </span>
  ));

  const renderDeprecated = guard(deprecated, () => (
    <span className="openapi-schema__deprecated">
      {translate({ id: OPENAPI_SCHEMA_ITEM.DEPRECATED, message: "deprecated" })}
    </span>
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
            <strong>
              {translate({
                id: OPENAPI_SCHEMA_ITEM.DEFAULT_VALUE,
                message: "Default value:",
              })}{" "}
            </strong>
            <span>
              <code>{defaultValue}</code>
            </span>
          </div>
        );
      }
      return (
        <div>
          <strong>
            {translate({
              id: OPENAPI_SCHEMA_ITEM.DEFAULT_VALUE,
              message: "Default value:",
            })}{" "}
          </strong>
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
      <strong>
        {translate({
          id: OPENAPI_SCHEMA_ITEM.EXAMPLE,
          message: "Example:",
        })}{" "}
      </strong>
      {example}
    </div>
  ));

  const renderExamples = guard(examples, (examples) => {
    const exampleEntries = Object.entries(examples);
    return (
      <>
        <strong>
          {translate({
            id: OPENAPI_SCHEMA_ITEM.EXAMPLES,
            message: "Examples:",
          })}
        </strong>
        <SchemaTabs>
          {exampleEntries.map(([exampleName, exampleProperties]) => (
            // @ts-ignore
            <TabItem value={exampleName} label={exampleName}>
              {exampleProperties.summary && <p>{exampleProperties.summary}</p>}
              {exampleProperties.description && (
                <p>
                  <strong>
                    {translate({
                      id: OPENAPI_SCHEMA_ITEM.DESCRIPTION,
                      message: "Description:",
                    })}{" "}
                  </strong>
                  <span>{exampleProperties.description}</span>
                </p>
              )}
              <p>
                <strong>
                  {translate({
                    id: OPENAPI_SCHEMA_ITEM.EXAMPLE,
                    message: "Example:",
                  })}{" "}
                </strong>
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
