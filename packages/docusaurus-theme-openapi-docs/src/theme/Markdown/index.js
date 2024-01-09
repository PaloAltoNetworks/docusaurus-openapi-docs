/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import CodeBlock from "@theme/CodeBlock";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

function Markdown({ children }) {
  return (
    <div>
      <ReactMarkdown
        children={children}
        rehypePlugins={[rehypeRaw]}
        components={{
          pre: "div",
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            if (inline) return <code>{children}</code>;
            return !inline && match ? (
              <CodeBlock className={className}>{children}</CodeBlock>
            ) : (
              <CodeBlock>{children}</CodeBlock>
            );
          },
        }}
      />
    </div>
  );
}

export default Markdown;
