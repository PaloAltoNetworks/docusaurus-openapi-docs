/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Details from "@theme/Details";
import SchemaItem from "@theme/SchemaItem";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import clsx from "clsx";
import {
  createClosingArrayBracket,
  createOpeningArrayBracket,
} from "docusaurus-plugin-openapi-docs/lib/markdown/createArrayBracket";
import { createDescription } from "docusaurus-plugin-openapi-docs/lib/markdown/createDescription";
import {
  getQualifierMessage,
  getSchemaName,
} from "docusaurus-plugin-openapi-docs/lib/markdown/schema";
import isEmpty from "lodash/isEmpty";

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

const AnyOneOf = ({ schema, schemaType }: any) => {
  const type = schema.oneOf ? "oneOf" : "anyOf";
  return (
    <div>
      <span className="badge badge--info" style={{ marginBottom: "1rem" }}>
        {type}
      </span>
      <SchemaTabs>
        {schema[type].map((anyOneSchema: any, index: number) => {
          const label = anyOneSchema.title || `MOD${index + 1}`;
          return (
            // @ts-ignore
            <TabItem
              key={index}
              label={label}
              value={`${index}-item-properties`}
            >
              {anyOneSchema.description && (
                <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
                  {createDescription(anyOneSchema.description)}
                </div>
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
    </div>
  );
};

const Properties = ({ schema, schemaType }: any) => {
  if (Object.keys(schema.properties).length === 0) {
    return (
      <SchemaItem
        collapsible={false}
        name=""
        required={false}
        schemaName="object"
        qualifierMessage={undefined}
        schema={{}}
        discriminator={false}
        children={null}
      />
    );
  }
  return (
    <>
      {Object.entries(schema.properties).map(([key, val]) => (
        <Edge
          key={key}
          name={key}
          schema={val}
          required={
            Array.isArray(schema.required)
              ? schema.required.includes(key)
              : false
          }
          discriminator={schema.discriminator}
          schemaType={schemaType}
        />
      ))}
    </>
  );
};

const PropertyDiscriminator = ({
  name,
  schema,
  discriminator,
  required,
}: any) => {
  if (!schema) {
    return null;
  }

  const schemaName = getSchemaName(schema);

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
            {createDescription(schema.description)}
          </div>
        )}
        {getQualifierMessage(discriminator) && (
          <div style={{ paddingLeft: "1rem" }}>
            {createDescription(getQualifierMessage(discriminator))}
          </div>
        )}
        <SchemaTabs className="openapi-tabs__discriminator">
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
        </SchemaTabs>
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
          <span className="openapi-schema__container">
            <strong className="openapi-schema__property">property name*</strong>
            <span className="openapi-schema__name"> {title}</span>
            {required && (
              <span className="openapi-schema__required">required</span>
            )}
          </span>
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

const Items = ({ schema, schemaType }: any) => {
  if (schema.items?.properties) {
    return (
      <>
        {createOpeningArrayBracket()}
        <Properties schema={schema.items} schemaType={schemaType} />
        {createClosingArrayBracket()}
      </>
    );
  }
  // Add other conditions for items here...
  return null;
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
        schema={schema}
        discriminator={discriminator}
        required={required}
      />
    );
  }

  if (
    schema.oneOf ||
    schema.anyOf ||
    schema.properties ||
    schema.additionalProperties ||
    (schema.items &&
      (schema.items.properties || schema.items.anyOf || schema.items.oneOf))
  ) {
    return (
      <Details
        className="openapi-markdown__details"
        summary={
          <Summary
            name={name}
            schemaName={schemaName}
            required={required}
            nullable={schema.nullable}
            deprecated={schema.deprecated}
          />
        }
      >
        <div style={{ marginLeft: "1rem" }}>
          {schema.description && (
            <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
              {createDescription(schema.description)}
            </div>
          )}
          {getQualifierMessage(schema) && (
            <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
              {createDescription(getQualifierMessage(schema))}
            </div>
          )}
          <SchemaComponent schema={schema} schemaType={schemaType} />
        </div>
      </Details>
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

const Summary = ({ name, schemaName, required, nullable, deprecated }: any) => (
  <span className="openapi-schema__container">
    <strong
      className={clsx("openapi-schema__property", {
        "openapi-schema__strikethrough": deprecated,
      })}
    >
      {name}
    </strong>
    <span className="openapi-schema__name"> {schemaName}</span>
    {(required || nullable || deprecated) && (
      <span className="openapi-schema__divider" />
    )}
    {nullable && <span className="openapi-schema__nullable">nullable</span>}
    {required && <span className="openapi-schema__required">required</span>}
    {deprecated && (
      <span className="openapi-schema__deprecated">deprecated</span>
    )}
  </span>
);

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
    const { mergedSchemas } = mergeAllOf(schema.allOf);
    return <SchemaComponent schema={mergedSchemas} schemaType={schemaType} />;
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

  return null; // Replace "any" with null
};

export default SchemaComponent;
