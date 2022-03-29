/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { createDescription } from "@paloaltonetworks/docusaurus-plugin-openapi/src/markdown/createDescription";
import { guard } from "@paloaltonetworks/docusaurus-plugin-openapi/src/markdown/utils";

import styles from "./styles.module.css";

function SchemaItem({
  name,
  qualifierMessage,
  required,
  schemaDescription,
  schemaName,
}) {
  const renderRequired = guard(required, () => (
    <strong className={styles.required}> required</strong>
  ));

  const renderSchemaDescription = guard(schemaDescription, (description) => (
    <div className={styles.schemaDescription}>
      {createDescription(description)}
    </div>
  ));

  const renderQualifierMessage = guard(qualifierMessage, (message) => (
    <div className={styles.schemaQualifierMessage}>
      {createDescription(message)}
    </div>
  ));

  return (
    <li className={styles.schemaItem}>
      <div>
        <strong>{name}</strong>
        <span className={styles.schemaName}> {schemaName}</span>
        {renderRequired}
        {renderQualifierMessage}
        {renderSchemaDescription}
      </div>
    </li>
  );
}

export default SchemaItem;
