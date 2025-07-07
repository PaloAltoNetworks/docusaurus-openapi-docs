/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { ExampleObject } from "@theme/ParamsItem";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";

/**
 * Format example value
 *
 * @param example
 * @returns
 */
const formatExample = (example: any) => {
  if (typeof example === "object" && example !== null) {
    return JSON.stringify(example);
  }
  return String(example);
};

/**
 * Render string examples
 *
 * @param examples
 * @returns
 */
export function renderStringExamples(
  examples: string[] | undefined
): React.JSX.Element | undefined {
  if (examples && examples.length > 0) {
    // If there's only one example, display it without tabs
    if (examples.length === 1) {
      return (
        <div>
          <strong>Example: </strong>
          <span>
            <code>{formatExample(examples[0])}</code>
          </span>
        </div>
      );
    }

    // Multiple examples - use tabs
    return (
      <div>
        <strong>Examples:</strong>
        <SchemaTabs>
          {examples.map((example, index) => (
            // @ts-ignore
            <TabItem
              value={`Example ${index + 1}`}
              label={`Example ${index + 1}`}
              key={`Example ${index + 1}`}
            >
              <p>
                <strong>Example: </strong>
                <code>{formatExample(example)}</code>
              </p>
            </TabItem>
          ))}
        </SchemaTabs>
      </div>
    );
  }
  return undefined;
}

export const renderExamplesRecord = (
  examples: Record<string, ExampleObject>
) => {
  const exampleEntries = Object.entries(examples);
  // If there's only one example, display it without tabs
  if (exampleEntries.length === 1) {
    const firstExample = exampleEntries[0][1];
    if (!firstExample) {
      return undefined;
    }
    return (
      <div>
        <strong>Example: </strong>
        <span>
          <code>{formatExample(firstExample.value)}</code>
        </span>
      </div>
    );
  }

  return (
    <>
      <strong>Examples:</strong>
      <SchemaTabs>
        {exampleEntries.map(([exampleName, exampleProperties]) =>
          renderExampleObject(exampleName, exampleProperties)
        )}
      </SchemaTabs>
    </>
  );
};

/**
 * Render example object
 *
 * @param exampleName
 * @param exampleProperties
 * @returns
 */
const renderExampleObject = (
  exampleName: string,
  exampleProperties: ExampleObject
) => {
  return (
    // @ts-ignore
    <TabItem value={exampleName} label={exampleName}>
      {exampleProperties.summary && <p>{exampleProperties.summary}</p>}
      {exampleProperties.description && (
        <p>
          <strong>Description: </strong>
          <span>{exampleProperties.description}</span>
        </p>
      )}
      <p>
        <strong>Example: </strong>
        <code>{formatExample(exampleProperties.value)}</code>
      </p>
    </TabItem>
  );
};
