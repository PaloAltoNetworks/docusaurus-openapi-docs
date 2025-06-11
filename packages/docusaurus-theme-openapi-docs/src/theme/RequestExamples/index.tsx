/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import {
  MimeExamples,
  MimeExample,
  SchemaExample,
  SchemaExamples,
  MimeExampleProps,
  MimeExamplesProps,
  SchemaExampleProps,
  SchemaExamplesProps,
  ExampleFromSchema,
} from "@theme/Examples";

export const RequestMimeExample: React.FC<MimeExampleProps> = ({
  example,
  mimeType,
}) => {
  return MimeExample({ example, mimeType });
};

export const RequestMimeExamples: React.FC<MimeExamplesProps> = ({
  examples,
  mimeType,
}) => {
  return MimeExamples({ examples, mimeType });
};

export const RequestSchemaExample: React.FC<SchemaExampleProps> = ({
  example,
  mimeType,
}) => {
  return SchemaExample({ example, mimeType });
};

export const RequestSchemaExamples: React.FC<SchemaExamplesProps> = ({
  examples,
  mimeType,
}) => {
  return SchemaExamples({ examples, mimeType });
};

export { ExampleFromSchema };
