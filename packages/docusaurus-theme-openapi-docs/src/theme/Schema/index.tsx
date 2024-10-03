/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { ClosingArrayBracket, OpeningArrayBracket } from "@theme/ArrayBrackets";
import Details from "@theme/Details";
import DiscriminatorTabs from "@theme/DiscriminatorTabs";
import SchemaItem from "@theme/SchemaItem";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import clsx from "clsx";
import { createDescription } from "docusaurus-plugin-openapi-docs/lib/markdown/createDescription";
import {
  getQualifierMessage,
  getSchemaName,
} from "docusaurus-plugin-openapi-docs/lib/markdown/schema";
import { SchemaObject } from "docusaurus-plugin-openapi-docs/lib/openapi/types";
import { SchemaObjectWithRef } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import isEmpty from "lodash/isEmpty";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

// eslint-disable-next-line import/no-extraneous-dependencies
const jsonSchemaMergeAllOf = require("json-schema-merge-allof");

const mergeAllOf = (allOf: any) => {
  const mergedSchemas = jsonSchemaMergeAllOf(allOf, {
    resolvers: {
      readOnly: () => true,
      writeOnly: () => true,
      example: () => true,
      "x-examples": () => true,
    },
    ignoreAdditionalProperties: true,
  });

  const mergedRequired = allOf.reduce((acc: any, cur: any) => {
    if (Array.isArray(cur.required)) {
      return [...acc, ...cur.required];
    }
    return acc;
  }, []);

  return { mergedSchemas, mergedRequired };
};

interface MarkdownProps {
  text: string;
}

// Renders string as markdown, useful for descriptions and qualifiers
const Markdown: React.FC<MarkdownProps> = ({ text }) => {
  return (
    <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
      <ReactMarkdown
        children={createDescription(text)}
        rehypePlugins={[rehypeRaw]}
      />
    </div>
  );
};

// Common props interface
interface SchemaProps {
  schema: SchemaObject;
  schemaType: "request" | "response";
}

const AnyOneOf: React.FC<SchemaProps> = ({ schema, schemaType }) => {
  const type = schema.oneOf ? "oneOf" : "anyOf";
  return (
    <>
      <span className="badge badge--info" style={{ marginBottom: "1rem" }}>
        {type}
      </span>
      <SchemaTabs>
        {schema[type]?.map((anyOneSchema: any, index: number) => {
          const label = anyOneSchema.title || `MOD${index + 1}`;
          return (
            // @ts-ignore
            <TabItem
              key={index}
              label={label}
              value={`${index}-item-properties`}
            >
              {anyOneSchema.description && (
                <Markdown text={anyOneSchema.description} />
              )}
              {anyOneSchema.type === "object" &&
                !anyOneSchema.properties &&
                !anyOneSchema.allOf &&
                !anyOneSchema.items && (
                  <SchemaComponent
                    schema={anyOneSchema}
                    schemaType={schemaType}
                  />
                )}
              {anyOneSchema.properties && (
                <Properties schema={anyOneSchema} schemaType={schemaType} />
              )}
              {anyOneSchema.allOf && (
                <SchemaComponent
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
              {anyOneSchema.oneOf && (
                <SchemaComponent
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
              {anyOneSchema.anyOf && (
                <SchemaComponent
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
              {anyOneSchema.items && (
                <Items schema={anyOneSchema} schemaType={schemaType} />
              )}
              {(anyOneSchema.type === "string" ||
                anyOneSchema.type === "number" ||
                anyOneSchema.type === "integer" ||
                anyOneSchema.type === "boolean") && (
                <SchemaComponent
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
            </TabItem>
          );
        })}
      </SchemaTabs>
    </>
  );
};

const Properties: React.FC<SchemaProps> = ({ schema, schemaType }) => {
  const discriminator = schema.discriminator;
  if (Object.keys(schema.properties as {}).length === 0) {
    return (
      <SchemaItem
        collapsible={false}
        name=""
        required={false}
        schemaName="object"
        qualifierMessage={undefined}
        schema={{}}
      />
    );
  }
  return (
    <>
      {Object.entries(schema.properties as {}).map(([key, val]) => (
        <Edge
          key={key}
          name={key}
          schema={val}
          required={
            Array.isArray(schema.required)
              ? schema.required.includes(key)
              : false
          }
          discriminator={discriminator}
          schemaType={schemaType}
        />
      ))}
    </>
  );
};

interface DetailsNodeProps {
  name: string;
  schemaName: string;
  schema: SchemaObject;
  required: boolean | string[];
  nullable: boolean;
  schemaType: "request" | "response";
}

const DetailsNode: React.FC<DetailsNodeProps> = ({
  name,
  schemaName,
  schema,
  required,
  nullable,
  schemaType,
}) => {
  return (
    <SchemaItem collapsible={true}>
      <Details
        className="openapi-markdown__details"
        summary={
          <summary>
            <span className="openapi-schema__container">
              <strong
                className={clsx("openapi-schema__property", {
                  "openapi-schema__strikethrough": schema.deprecated,
                })}
              >
                {name}
              </strong>
              <span className="openapi-schema__name"> {schemaName}</span>
              {(Array.isArray(required)
                ? required.includes(name)
                : required === true) ||
              schema.deprecated ||
              nullable ? (
                <span className="openapi-schema__divider" />
              ) : null}
              {nullable && (
                <span className="openapi-schema__nullable">nullable</span>
              )}
              {Array.isArray(required) ? (
                required.includes(name)
              ) : required === true ? (
                <span className="openapi-schema__required">required</span>
              ) : null}
              {schema.deprecated && (
                <span className="openapi-schema__deprecated">deprecated</span>
              )}
            </span>
          </summary>
        }
      >
        <div style={{ marginLeft: "1rem" }}>
          {schema.description && (
            <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
              <ReactMarkdown
                children={createDescription(schema.description)}
                rehypePlugins={[rehypeRaw]}
              />
            </div>
          )}
          {getQualifierMessage(schema) && (
            <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
              <ReactMarkdown
                children={createDescription(getQualifierMessage(schema))}
                rehypePlugins={[rehypeRaw]}
              />
            </div>
          )}
          <SchemaComponent schema={schema} schemaType={schemaType} />
        </div>
      </Details>
    </SchemaItem>
  );
};

const PropertyDiscriminator = ({
  name,
  schemaName,
  schema,
  discriminator,
  required,
}: any) => {
  if (!schema) {
    return null;
  }

  if (discriminator.mapping === undefined) {
    return <Edge name={name} schema={schema} required={required} />;
  }

  return (
    <div className="openapi-discriminator__item openapi-schema__list-item">
      <div>
        <span className="openapi-schema__container">
          <strong className="openapi-discriminator__name openapi-schema__property">
            {name}
          </strong>
          {schemaName && (
            <span className="openapi-schema__name"> {schemaName}</span>
          )}
          {required && (
            <span className="openapi-schema__required">required</span>
          )}
        </span>
        {schema.description && (
          <div style={{ paddingLeft: "1rem" }}>
            <ReactMarkdown
              children={createDescription(schema.description)}
              rehypePlugins={[rehypeRaw]}
            />
          </div>
        )}
        {getQualifierMessage(discriminator) && (
          <div style={{ paddingLeft: "1rem" }}>
            <ReactMarkdown
              children={createDescription(getQualifierMessage(discriminator))}
              rehypePlugins={[rehypeRaw]}
            />
          </div>
        )}
        <DiscriminatorTabs className="openapi-tabs__discriminator">
          {Object.keys(discriminator.mapping).map((key, index) => (
            // @ts-ignore
            <TabItem
              key={index}
              label={key}
              value={`${index}-item-discriminator`}
            >
              <SchemaComponent
                schema={discriminator.mapping[key]}
                schemaType={schema.type}
              />
            </TabItem>
          ))}
        </DiscriminatorTabs>
      </div>
    </div>
  );
};

const AdditionalProperties = ({ schema, schemaType }: any) => {
  const additionalProperties = schema.additionalProperties;

  if (!additionalProperties) return null;

  // Handle free-form objects
  if (additionalProperties === true || isEmpty(additionalProperties)) {
    return (
      <SchemaItem
        name="property name*"
        required={false}
        schemaName="any"
        qualifierMessage={getQualifierMessage(schema)}
        schema={schema}
        collapsible={false}
        discriminator={false}
        children={null}
      />
    );
  }

  // Handle objects, arrays, complex schemas
  if (
    additionalProperties.properties ||
    additionalProperties.items ||
    additionalProperties.allOf ||
    additionalProperties.additionalProperties ||
    additionalProperties.oneOf ||
    additionalProperties.anyOf
  ) {
    const title =
      additionalProperties.title || getSchemaName(additionalProperties);
    const required = schema.required || false;
    return (
      <Details
        className="openapi-markdown__details"
        summary={
          <summary>
            <span className="openapi-schema__container">
              <strong className="openapi-schema__property">
                property name*
              </strong>
              <span className="openapi-schema__name"> {title}</span>
              {required && (
                <span className="openapi-schema__required">required</span>
              )}
            </span>
          </summary>
        }
      >
        <div style={{ marginLeft: "1rem" }}>
          {additionalProperties.description && (
            <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
              {createDescription(additionalProperties.description)}
            </div>
          )}
          <SchemaComponent
            schema={additionalProperties}
            schemaType={schemaType}
          />
        </div>
      </Details>
    );
  }

  // Handle primitive types
  if (
    additionalProperties.type === "string" ||
    additionalProperties.type === "boolean" ||
    additionalProperties.type === "integer" ||
    additionalProperties.type === "number"
  ) {
    const schemaName = getSchemaName(additionalProperties);
    return (
      <SchemaItem
        name="property name*"
        required={false}
        schemaName={schemaName}
        qualifierMessage={getQualifierMessage(schema)}
        schema={additionalProperties}
        collapsible={false}
        discriminator={false}
        children={null}
      />
    );
  }

  // Unknown type
  return null;
};

const Items: React.FC<{
  schema: any;
  schemaType: "request" | "response";
}> = ({ schema, schemaType }) => {
  // Handles case when schema.items has properties
  if (schema.items?.properties) {
    return (
      <>
        <OpeningArrayBracket />
        <Properties schema={schema.items} schemaType={schemaType} />
        <ClosingArrayBracket />
      </>
    );
  }

  // Handles case when schema.items has additionalProperties
  if (schema.items?.additionalProperties) {
    return (
      <>
        <OpeningArrayBracket />
        <AdditionalProperties schema={schema.items} />
        <ClosingArrayBracket />
      </>
    );
  }

  // Handles case when schema.items has oneOf or anyOf
  if (schema.items?.oneOf || schema.items?.anyOf) {
    return (
      <>
        <OpeningArrayBracket />
        <AnyOneOf schema={schema.items} schemaType={schemaType} />
        <ClosingArrayBracket />
      </>
    );
  }

  // Handles case when schema.items has allOf
  if (schema.items?.allOf) {
    const { mergedSchemas } = mergeAllOf(schema.items.allOf);

    // Handles combo anyOf/oneOf + properties
    if (
      (mergedSchemas.oneOf || mergedSchemas.anyOf) &&
      mergedSchemas.properties
    ) {
      return (
        <>
          <OpeningArrayBracket />
          <AnyOneOf schema={mergedSchemas} schemaType={schemaType} />
          <Properties schema={mergedSchemas} schemaType={schemaType} />
          <ClosingArrayBracket />
        </>
      );
    }

    // Handles only anyOf/oneOf
    if (mergedSchemas.oneOf || mergedSchemas.anyOf) {
      return (
        <>
          <OpeningArrayBracket />
          <AnyOneOf schema={mergedSchemas} schemaType={schemaType} />
          <ClosingArrayBracket />
        </>
      );
    }

    // Handles properties
    if (mergedSchemas.properties) {
      return (
        <>
          <OpeningArrayBracket />
          <Properties schema={mergedSchemas} schemaType={schemaType} />
          <ClosingArrayBracket />
        </>
      );
    }
  }

  // Handles basic types (string, number, integer, boolean, object)
  if (
    schema.items?.type === "string" ||
    schema.items?.type === "number" ||
    schema.items?.type === "integer" ||
    schema.items?.type === "boolean" ||
    schema.items?.type === "object"
  ) {
    return (
      <>
        <OpeningArrayBracket />
        <SchemaComponent schema={schema.items} schemaType={schemaType} />
        <ClosingArrayBracket />
      </>
    );
  }

  // Handles fallback case (use createEdges logic)
  return (
    <>
      <OpeningArrayBracket />
      {Object.entries(schema.items || {}).map(([key, val]) => (
        <Edge
          key={key}
          name={key}
          schema={val}
          required={
            Array.isArray(schema.required)
              ? schema.required.includes(key)
              : false
          }
        />
      ))}
      <ClosingArrayBracket />
    </>
  );
};

const Edge = ({ name, schema, required, discriminator, schemaType }: any) => {
  if (
    (schemaType === "request" && schema.readOnly) ||
    (schemaType === "response" && schema.writeOnly)
  ) {
    return null;
  }

  const schemaName = getSchemaName(schema);

  if (discriminator && discriminator.propertyName === name) {
    return (
      <PropertyDiscriminator
        name={name}
        schemaName={schemaName}
        schema={schema}
        discriminator={discriminator}
        required={required}
      />
    );
  }

  if (schema.oneOf || schema.anyOf) {
    return <AnyOneOf schema={schema} schemaType={schemaType} />;
  }

  if (schema.properties) {
    return <Properties schema={schema} schemaType={schemaType} />;
  }

  if (schema.additionalProperties) {
    return <AdditionalProperties schema={schema} />;
  }

  if (schema.items?.properties) {
    return (
      <DetailsNode
        name={name}
        schemaName={schemaName}
        required={required}
        nullable={schema.nullable}
        schema={schema}
        schemaType={schemaType}
      />
    );
  }

  if (schema.items?.anyOf || schema.items?.oneOf) {
    return (
      <DetailsNode
        name={name}
        schemaName={schemaName}
        required={required}
        nullable={schema.nullable}
        schema={schema}
        schemaType={schemaType}
      />
    );
  }

  if (schema.allOf) {
    const { mergedSchemas }: { mergedSchemas: SchemaObject } = mergeAllOf(
      schema.allOf
    );

    if (
      (schemaType === "request" && mergedSchemas.readOnly) ||
      (schemaType === "response" && mergedSchemas.writeOnly)
    ) {
      return null;
    }

    const mergedSchemaName = getSchemaName(mergedSchemas);

    if (mergedSchemas.oneOf || mergedSchemas.anyOf) {
      return (
        <DetailsNode
          name={name}
          schemaName={mergedSchemaName}
          required={required}
          nullable={schema.nullable}
          schema={mergedSchemas}
          schemaType={schemaType}
        />
      );
    }

    if (mergedSchemas.properties !== undefined) {
      return (
        <DetailsNode
          name={name}
          schemaName={mergedSchemaName}
          required={required}
          nullable={schema.nullable}
          schema={mergedSchemas}
          schemaType={schemaType}
        />
      );
    }

    if (mergedSchemas.items?.properties) {
      <DetailsNode
        name={name}
        schemaName={mergedSchemaName}
        required={required}
        nullable={schema.nullable}
        schema={mergedSchemas}
        schemaType={schemaType}
      />;
    }

    return (
      <SchemaItem
        collapsible={false}
        name={name}
        required={Array.isArray(required) ? required.includes(name) : required}
        schemaName={mergedSchemaName}
        qualifierMessage={getQualifierMessage(mergedSchemas)}
        schema={mergedSchemas}
        discriminator={false}
        children={null}
      />
    );
  }

  return (
    <SchemaItem
      collapsible={false}
      name={name}
      required={Array.isArray(required) ? required.includes(name) : required}
      schemaName={schemaName}
      qualifierMessage={getQualifierMessage(schema)}
      schema={schema}
      discriminator={false}
      children={null}
    />
  );
};

const SchemaComponent: React.FC<{
  schema: any;
  schemaType: "request" | "response";
}> = ({ schema, schemaType }) => {
  if (
    (schemaType === "request" && schema.readOnly) ||
    (schemaType === "response" && schema.writeOnly)
  ) {
    return null;
  }

  if (schema.oneOf || schema.anyOf) {
    return <AnyOneOf schema={schema} schemaType={schemaType} />;
  }

  if (schema.properties) {
    return <Properties schema={schema} schemaType={schemaType} />;
  }

  if (schema.additionalProperties) {
    return <AdditionalProperties schema={schema} schemaType={schemaType} />;
  }

  if (schema.items) {
    return <Items schema={schema} schemaType={schemaType} />;
  }

  if (schema.allOf) {
    const { mergedSchemas }: { mergedSchemas: SchemaObject } = mergeAllOf(
      schema.allOf
    );
    if (
      mergedSchemas.oneOf !== undefined ||
      mergedSchemas.anyOf !== undefined
    ) {
      return <AnyOneOf schema={mergedSchemas} schemaType={schemaType} />;
    }

    if (mergedSchemas.properties !== undefined) {
      return <Properties schema={mergedSchemas} schemaType={schemaType} />;
    }
  }

  if (schema.type) {
    return (
      <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
        {createDescription(schema.type)}
        {getQualifierMessage(schema) && (
          <div style={{ paddingTop: "1rem" }}>
            {createDescription(getQualifierMessage(schema))}
          </div>
        )}
      </div>
    );
  }

  if (typeof schema === "string") {
    return (
      <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
        {createDescription(schema)}
        {/* @ts-ignore */}
        {getQualifierMessage(schema) && (
          <div style={{ paddingTop: "1rem" }}>
            {/* @ts-ignore */}
            {createDescription(getQualifierMessage(schema))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default SchemaComponent;
