/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { createDescription } from "@paloaltonetworks/docusaurus-plugin-openapi/src/markdown/createDescription";
import {
  getSchemaName,
  getQualifierMessage,
} from "@paloaltonetworks/docusaurus-plugin-openapi/src/markdown/schema";
import { guard } from "@paloaltonetworks/docusaurus-plugin-openapi/src/markdown/utils";
import ReactMarkdown from "react-markdown";

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

  // TODO: getQualiferMessage() contains output in MD format, need to be able to handle formatting here?
  const renderSchema = guard(getQualifierMessage(schema), (message) => (
    <div>
      <ReactMarkdown children={createDescription(message)} />
    </div>
  ));

  const renderDescription = guard(description, (description) => (
    <div>{createDescription(description)}</div>
  ));

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
      {renderDescription}
      {renderExample}
      {renderExamples}
    </li>
  );
}

export default ParamsItem;
