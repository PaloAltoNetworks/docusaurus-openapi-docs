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
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
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
  text: string | undefined;
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

interface SummaryProps {
  name: string;
  schemaName: string | undefined;
  schema: {
    deprecated?: boolean;
    nullable?: boolean;
  };
  required?: boolean | string[];
}

const Summary: React.FC<SummaryProps> = ({
  name,
  schemaName,
  schema,
  required,
}) => {
  const { deprecated, nullable } = schema;

  const isRequired = Array.isArray(required)
    ? required.includes(name)
    : required === true;

  return (
    <summary>
      <span className="openapi-schema__container">
        <strong
          className={clsx("openapi-schema__property", {
            "openapi-schema__strikethrough": deprecated,
          })}
        >
          {name}
        </strong>
        <span className="openapi-schema__name"> {schemaName}</span>
        {(isRequired || deprecated || nullable) && (
          <span className="openapi-schema__divider" />
        )}
        {nullable && <span className="openapi-schema__nullable">nullable</span>}
        {isRequired && (
          <span className="openapi-schema__required">required</span>
        )}
        {deprecated && (
          <span className="openapi-schema__deprecated">deprecated</span>
        )}
      </span>
    </summary>
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
              {/* Handle primitive types directly */}
              {["string", "number", "integer", "boolean"].includes(
                anyOneSchema.type
              ) && (
                <SchemaItem
                  collapsible={false}
                  name={undefined}
                  schemaName={anyOneSchema.type}
                  qualifierMessage={getQualifierMessage(anyOneSchema)}
                  schema={anyOneSchema}
                  discriminator={false}
                  children={null}
                />
              )}

              {/* Handle empty object as a primitive type */}
              {anyOneSchema.type === "object" &&
                !anyOneSchema.properties &&
                !anyOneSchema.allOf &&
                !anyOneSchema.oneOf &&
                !anyOneSchema.anyOf && (
                  <SchemaItem
                    collapsible={false}
                    name={undefined}
                    schemaName={anyOneSchema.type}
                    qualifierMessage={getQualifierMessage(anyOneSchema)}
                    schema={anyOneSchema}
                    discriminator={false}
                    children={null}
                  />
                )}

              {/* Handle actual object types with properties or nested schemas */}
              {anyOneSchema.type === "object" && anyOneSchema.properties && (
                <Properties schema={anyOneSchema} schemaType={schemaType} />
              )}
              {anyOneSchema.allOf && (
                <SchemaNode schema={anyOneSchema} schemaType={schemaType} />
              )}
              {anyOneSchema.oneOf && (
                <SchemaNode schema={anyOneSchema} schemaType={schemaType} />
              )}
              {anyOneSchema.anyOf && (
                <SchemaNode schema={anyOneSchema} schemaType={schemaType} />
              )}
              {anyOneSchema.items && (
                <Items schema={anyOneSchema} schemaType={schemaType} />
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
      {Object.entries(schema.properties as {}).map(
        ([key, val]: [string, any]) => (
          <SchemaEdge
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
        )
      )}
    </>
  );
};

const PropertyDiscriminator: React.FC<SchemaEdgeProps> = ({
  name,
  schemaName,
  schema,
  schemaType,
  discriminator,
  required,
}) => {
  if (!schema) {
    return null;
  }

  if (discriminator.mapping === undefined) {
    return (
      <SchemaEdge
        name={name}
        schema={schema}
        required={required}
        schemaName={schemaName}
        schemaType={schemaType}
      />
    );
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
        <div style={{ marginLeft: "1rem" }}>
          {schema.description && <Markdown text={schema.description} />}
          {getQualifierMessage(discriminator) && (
            <Markdown text={getQualifierMessage(discriminator)} />
          )}
        </div>
        <DiscriminatorTabs className="openapi-tabs__discriminator">
          {Object.keys(discriminator.mapping).map((key, index) => (
            // @ts-ignore
            <TabItem
              key={index}
              label={key}
              value={`${index}-item-discriminator`}
            >
              <SchemaNode
                schema={discriminator.mapping[key]}
                schemaType={schemaType}
              />
            </TabItem>
          ))}
        </DiscriminatorTabs>
      </div>
    </div>
  );
};

const AdditionalProperties: React.FC<SchemaProps> = ({
  schema,
  schemaType,
}) => {
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
      <SchemaNodeDetails
        name="property name*"
        schemaName={title}
        required={required}
        nullable={schema.nullable}
        schema={additionalProperties}
        schemaType={schemaType}
      />
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

const SchemaNodeDetails: React.FC<SchemaEdgeProps> = ({
  name,
  schemaName,
  schema,
  required,
  schemaType,
}) => {
  return (
    <SchemaItem collapsible={true}>
      <Details
        className="openapi-markdown__details"
        summary={
          <Summary
            name={name}
            schemaName={schemaName}
            schema={schema}
            required={required}
          />
        }
      >
        <div style={{ marginLeft: "1rem" }}>
          {schema.description && <Markdown text={schema.description} />}
          {getQualifierMessage(schema) && (
            <Markdown text={getQualifierMessage(schema)} />
          )}
          <SchemaNode schema={schema} schemaType={schemaType} />
        </div>
      </Details>
    </SchemaItem>
  );
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
        <AdditionalProperties schema={schema.items} schemaType={schemaType} />
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
        <SchemaNode schema={schema.items} schemaType={schemaType} />
        <ClosingArrayBracket />
      </>
    );
  }

  // Handles fallback case (use createEdges logic)
  return (
    <>
      <OpeningArrayBracket />
      {Object.entries(schema.items || {}).map(([key, val]: [string, any]) => (
        <SchemaEdge
          key={key}
          name={key}
          schema={val}
          schemaType={schemaType}
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

interface SchemaEdgeProps {
  name: string;
  schemaName?: string;
  schema: SchemaObject;
  required?: boolean | string[];
  nullable?: boolean | undefined;
  discriminator?: any;
  schemaType: "request" | "response";
}

const SchemaEdge: React.FC<SchemaEdgeProps> = ({
  name,
  schema,
  required,
  discriminator,
  schemaType,
}) => {
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
        schemaType={schemaType}
        discriminator={discriminator}
        required={required}
      />
    );
  }

  if (schema.oneOf || schema.anyOf) {
    // return <AnyOneOf schema={schema} schemaType={schemaType} />;
    return (
      <SchemaNodeDetails
        name={name}
        schemaName={schemaName}
        schemaType={schemaType}
        required={required}
        schema={schema}
        nullable={schema.nullable}
      />
    );
  }

  if (schema.properties) {
    return (
      <SchemaNodeDetails
        name={name}
        schemaName={schemaName}
        schemaType={schemaType}
        required={required}
        schema={schema}
        nullable={schema.nullable}
      />
    );
  }

  if (schema.additionalProperties) {
    return (
      <SchemaNodeDetails
        name={name}
        schemaName={schemaName}
        schemaType={schemaType}
        required={required}
        schema={schema}
        nullable={schema.nullable}
      />
    );
  }

  if (schema.items?.properties) {
    return (
      <SchemaNodeDetails
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
      <SchemaNodeDetails
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
    delete schema.allOf;

    const combinedSchemas = merge(schema, mergedSchemas);

    if (
      (schemaType === "request" && combinedSchemas.readOnly) ||
      (schemaType === "response" && combinedSchemas.writeOnly)
    ) {
      return null;
    }

    const combinedSchemaName = getSchemaName(combinedSchemas);

    if (combinedSchemas.oneOf || combinedSchemas.anyOf) {
      return (
        <SchemaNodeDetails
          name={name}
          schemaName={combinedSchemaName}
          required={required}
          nullable={combinedSchemas.nullable}
          schema={combinedSchemas}
          schemaType={schemaType}
        />
      );
    }

    if (combinedSchemas.properties !== undefined) {
      return (
        <SchemaNodeDetails
          name={name}
          schemaName={combinedSchemaName}
          required={required}
          nullable={combinedSchemas.nullable}
          schema={combinedSchemas}
          schemaType={schemaType}
        />
      );
    }

    if (combinedSchemas.items?.properties) {
      <SchemaNodeDetails
        name={name}
        schemaName={combinedSchemaName}
        required={required}
        nullable={combinedSchemas.nullable}
        schema={combinedSchemas}
        schemaType={schemaType}
      />;
    }

    return (
      <SchemaItem
        collapsible={false}
        name={name}
        required={Array.isArray(required) ? required.includes(name) : required}
        schemaName={combinedSchemaName}
        qualifierMessage={getQualifierMessage(combinedSchemas)}
        schema={combinedSchemas}
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

const SchemaNode: React.FC<SchemaProps> = ({ schema, schemaType }) => {
  if (
    (schemaType === "request" && schema.readOnly) ||
    (schemaType === "response" && schema.writeOnly)
  ) {
    return null;
  }

  if (schema.allOf) {
    const { mergedSchemas }: { mergedSchemas: SchemaObject } = mergeAllOf(
      schema.allOf
    );
    delete schema.allOf;

    const combinedSchemas = merge(schema, mergedSchemas);

    return (
      <div>
        {combinedSchemas.oneOf && (
          <AnyOneOf schema={combinedSchemas} schemaType={schemaType} />
        )}
        {combinedSchemas.anyOf && (
          <AnyOneOf schema={combinedSchemas} schemaType={schemaType} />
        )}
        {combinedSchemas.properties && (
          <Properties schema={combinedSchemas} schemaType={schemaType} />
        )}
        {combinedSchemas.items && (
          <Items schema={combinedSchemas} schemaType={schemaType} />
        )}
      </div>
    );
  }

  return (
    <div>
      {schema.oneOf && <AnyOneOf schema={schema} schemaType={schemaType} />}
      {schema.anyOf && <AnyOneOf schema={schema} schemaType={schemaType} />}
      {schema.properties && (
        <Properties schema={schema} schemaType={schemaType} />
      )}
      {schema.additionalProperties && (
        <AdditionalProperties schema={schema} schemaType={schemaType} />
      )}
      {schema.items && <Items schema={schema} schemaType={schemaType} />}
    </div>
  );
};

export default SchemaNode;
