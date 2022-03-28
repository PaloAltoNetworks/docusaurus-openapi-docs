import React from "react";
import escape from "lodash/escape";
import { createDescription } from "../../../../docusaurus-plugin-openapi/src/markdown/createDescription";
import { guard } from "../../../../docusaurus-plugin-openapi/src/markdown/utils";
import {
  getQualifierMessage,
  getSchemaName,
} from "../../../../docusaurus-plugin-openapi/src/markdown/schema";

import styles from "./styles.module.css";

function ParamsItem({
  param: { description, example, examples, name, required, schema },
}) {
  const renderSchemaName = guard(schema, (schema) => (
    <span> {getSchemaName(schema)}</span>
  ));

  const renderSchemaRequired = guard(required, () => (
    <strong> required</strong>
  ));

  const renderSchema = guard(getQualifierMessage(schema), (message) => (
    <div>{createDescription(message)}</div>
  ));

  const renderDescription = guard(description, (description) => (
    <div>{createDescription(description)}</div>
  ));

  const renderExample = guard(example, (example) => (
    <div>{escape(`Example: ${example}`)}</div>
  ));

  const renderExamples = guard(examples, (examples) => {
    const exampleEntries = Object.entries(examples);
    return (
      <>
        {exampleEntries.map(([k, v]) => (
          <div>{escape(`Example (${k}): ${v.value}`)}</div>
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
      {renderDescription}
      {renderExample}
      {renderExamples}
    </li>
  );
}

export default ParamsItem;
