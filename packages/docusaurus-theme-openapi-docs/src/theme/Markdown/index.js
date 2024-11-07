/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Admonition from "@theme/Admonition";
import CodeBlock from "@theme/CodeBlock";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
// eslint-disable-next-line import/no-extraneous-dependencies
import { visit } from "unist-util-visit";

function remarkAdmonition() {
  return (tree) => {
    visit(tree, "paragraph", (node, index, parent) => {
      const { children } = node;
      if (children.length > 0 && children[0].type === "text") {
        const text = children[0].value;
        const match = text.match(/^:::(\w+)\s+(.*?)\s*:::$/);

        if (match) {
          const type = match[1];
          const content = match[2];

          const admonitionNode = {
            type: "admonition",
            data: {
              hName: "div",
              hProperties: {
                className: `theme-admonition theme-admonition-${type} alert alert--success`,
              },
            },
            children: [
              {
                type: "div",
                value: content,
              },
            ],
          };

          parent.children.splice(index, 1, admonitionNode);
        }
      }
    });
  };
}
function Markdown({ children }) {
  return (
    <div>
      <ReactMarkdown
        children={children}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkAdmonition]}
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
          admonition: ({ node, ...props }) => {
            const className = node.data.hProperties.className;
            return <Admonition className={className} {...props} />;
          },
        }}
      />
    </div>
  );
}

export default Markdown;
