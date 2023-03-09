/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import CodeBlock from "@theme/CodeBlock";

function ResponseSamples({ responseExample, language }) {
  return (
    <div className="openapi-code__response-samples-container">
      <CodeBlock language={language ? language : "json"}>
        {responseExample}
      </CodeBlock>
    </div>
  );
}

export default ResponseSamples;
