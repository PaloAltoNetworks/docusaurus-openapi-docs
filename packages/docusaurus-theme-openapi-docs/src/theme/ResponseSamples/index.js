/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import CodeBlock from "@theme/CodeBlock";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";

import styles from "./styles.module.css";

function ResponseSamples({ responseExamples }) {
  const hasMultipleExamples = Object.keys(responseExamples).length > 1;

  const renderResponseSamples = () => {
    if (hasMultipleExamples) {
      return (
        <SchemaTabs>
          {Object.entries(responseExamples).map(
            ([exampleKey, exampleValue]) => (
              <TabItem label={exampleKey} value={exampleKey}>
                <CodeBlock>
                  {JSON.stringify(exampleValue.value, null, 2)}
                </CodeBlock>
              </TabItem>
            )
          )}
        </SchemaTabs>
      );
    } else {
      const responseExampleKey = Object.keys(responseExamples)[0];
      const responseSampleContent = JSON.stringify(
        responseExamples[responseExampleKey].value,
        null,
        2
      );

      return <CodeBlock>{responseSampleContent}</CodeBlock>;
    }
  };

  return (
    <div className={styles.responseSamplesContainer}>
      <strong className={styles.responseSamplesHeader}>Response Samples</strong>
      {renderResponseSamples()}
    </div>
  );
}

export default ResponseSamples;
