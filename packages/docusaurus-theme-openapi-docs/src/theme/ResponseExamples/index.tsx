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
  MimeExampleProps,
  MimeExamplesProps,
  ExampleFromSchema,
} from "@theme/Examples";

export const ResponseExamples: React.FC<MimeExamplesProps> = ({
  examples,
  mimeType,
}) => {
  return MimeExamples({ examples, mimeType });
  // return <MimeExamples examples={examples} mimeType={mimeType} />;
};

export const ResponseExample: React.FC<MimeExampleProps> = ({
  example,
  mimeType,
}) => {
  return MimeExample({ example, mimeType });
  // return <MimeExample example={example} mimeType={mimeType} />;
};

// Re-export ExampleFromSchema with original name
export { ExampleFromSchema };
