/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";
import ReactMarkdown from "react-markdown";
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
      <ReactMarkdown children={createDescription(message)} />
    </div>
  ));

  const renderDescription = guard(description, (description) => (
    <div>
      <ReactMarkdown children={createDescription(description)} />
    </div>
  ));

  const renderExample = guard(example, (example) => (
    <div>{`Example: ${example}`}</div>
  ));

  const renderExamples = guard(examples, (examples) => {
    const exampleEntries = Object.entries(examples);
    return (
      <React.Fragment>
        {exampleEntries.map(([k, v]) => (
          <div>{`Example (${k}): ${v.value}`}</div>
        ))}
      </React.Fragment>
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
