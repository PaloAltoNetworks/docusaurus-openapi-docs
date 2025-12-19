/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { translate } from "@docusaurus/Translate";
import { ExampleObject } from "@theme/ParamsItem";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import { OPENAPI_SCHEMA_ITEM } from "@theme/translationIds";

const EXAMPLE_CLASS_NAME = "openapi-example";
const EXAMPLES_CLASS_NAME = "openapi-examples";

type ExampleType = string;
type ExamplesType = Record<string, ExampleObject> | string[];

/**
 * Example Component Props
 */
type ExampleProps = {
  example?: ExampleType;
  examples?: ExamplesType;
};

/**
 * Example Component
 */
export const Example = ({ example, examples }: ExampleProps) => {
  if (example !== undefined) {
    return renderExample(example);
  }
  if (examples !== undefined) {
    return renderExamples(examples);
  }
  return undefined;
};

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

const renderExample = (example: ExampleType) => {
  return (
    <div className={EXAMPLE_CLASS_NAME}>
      <strong>
        {translate({
          id: OPENAPI_SCHEMA_ITEM.EXAMPLE,
          message: "Example:",
        })}{" "}
      </strong>
      <span>
        <code>{formatExample(example)}</code>
      </span>
    </div>
  );
};

const renderExamples = (examples: ExamplesType) => {
  if (Array.isArray(examples)) {
    return renderStringArrayExamples(examples);
  }
  return renderExamplesRecord(examples);
};

/**
 * Render string examples
 *
 * @param examples
 * @returns
 */
export function renderStringArrayExamples(examples: string[]) {
  if (examples.length === 0) {
    return undefined;
  }
  // If there's only one example, display it without tabs
  if (examples.length === 1) {
    return renderExample(examples[0]);
  }

  // Multiple examples - use tabs
  const exampleEntries = examples.reduce(
    (acc, example, index) => ({
      ...acc,
      [`Example ${index + 1}`]: {
        value: example,
      },
    }),
    {} as Record<string, ExampleObject>
  );
  return renderExamplesRecord(exampleEntries);
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
    return renderExample(firstExample.value);
  }

  return (
    <div className={EXAMPLES_CLASS_NAME}>
      <strong>
        {translate({
          id: OPENAPI_SCHEMA_ITEM.EXAMPLES,
          message: "Examples:",
        })}
      </strong>
      <SchemaTabs>
        {exampleEntries.map(([exampleName, exampleProperties]) =>
          renderExampleObject(exampleName, exampleProperties)
        )}
      </SchemaTabs>
    </div>
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
          <strong>
            {translate({
              id: OPENAPI_SCHEMA_ITEM.DESCRIPTION,
              message: "Description:",
            })}{" "}
          </strong>
          <span>{exampleProperties.description}</span>
        </p>
      )}
      {exampleProperties.value !== undefined
        ? renderExample(exampleProperties.value)
        : undefined}
    </TabItem>
  );
};
