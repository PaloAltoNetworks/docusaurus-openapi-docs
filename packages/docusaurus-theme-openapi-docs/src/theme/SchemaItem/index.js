/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ReactMarkdown from "react-markdown";

import { createDescription } from "../../markdown/createDescription";
import { guard } from "../../markdown/utils";
import styles from "./styles.module.css";

function SchemaItem({
  children: collapsibleSchemaContent,
  collapsible,
  name,
  qualifierMessage,
  required,
  schemaDescription,
  schemaName,
  defaultValue,
}) {
  const renderRequired = guard(
    Array.isArray(required) ? required.includes(name) : required,
    () => <strong className={styles.required}> required</strong>
  );

  const renderSchemaDescription = guard(schemaDescription, (description) => (
    <div className={styles.schemaDescription}>
      <ReactMarkdown children={createDescription(description)} />
    </div>
  ));

  const renderQualifierMessage = guard(qualifierMessage, (message) => (
    <div className={styles.schemaQualifierMessage}>
      <ReactMarkdown children={createDescription(message)} />
    </div>
  ));

  const renderDefaultValue = guard(
    typeof defaultValue === "boolean" ? defaultValue.toString() : defaultValue,
    (value) => (
      <div className={styles.schemaQualifierMessage}>
        <ReactMarkdown children={`**Default value:** \`${value}\``} />
      </div>
    )
  );

  const schemaContent = (
    <div>
      <strong>{name}</strong>
      <span className={styles.schemaName}> {schemaName}</span>
      {renderRequired}
      {renderQualifierMessage}
      {renderDefaultValue}
      {renderSchemaDescription}
    </div>
  );

  return (
    <li className={styles.schemaItem}>
      {collapsible ? collapsibleSchemaContent : schemaContent}
    </li>
  );
}

export default SchemaItem;
