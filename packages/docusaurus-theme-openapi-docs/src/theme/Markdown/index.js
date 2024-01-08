/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

function Markdown({ children }) {
  return (
    <div>
      <ReactMarkdown children={children} rehypePlugins={[rehypeRaw]} />
    </div>
  );
}

export default Markdown;
