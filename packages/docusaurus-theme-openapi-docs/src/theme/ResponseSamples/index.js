/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import CodeBlock from "@theme/CodeBlock";

import styles from "./styles.module.css";

function ResponseSamples({ responseExample, language }) {
  return (
    <div className={styles.responseSamplesContainer}>
      <CodeBlock
        language={language ? language : "json"}
        className={styles.responseSamplesCodeBlock}
      >
        {responseExample}
      </CodeBlock>
    </div>
  );
}

export default ResponseSamples;
