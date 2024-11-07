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
    const paragraphs = [];
    let collectedText = "";

    // Collect all 'paragraph' nodes
    visit(tree, "paragraph", (node) => {
      paragraphs.push(node);
      collectedText +=
        node.children.map((child) => child.value || "").join("\n") + "\n";
    });

    const regex = /^\s*:::(\w+)(?:\[(.*?)\])?\s*([\s\S]*?)\s*:::\s*$/gm;
    const matches = collectedText.matchAll(regex);

    // Collect admonition nodes to insert
    const admonitionNodes = [];

    for (const match of matches) {
      const type = match[1];
      const title = match[2] ? match[2].trim() : undefined;
      const content = match[3];

      const admonitionNode = {
        type: "admonition",
        data: {
          hName: "Admonition", // Tells ReactMarkdown to replace the node with Admonition component
          hProperties: {
            type, // Passed as a prop to the Admonition component
            title,
          },
        },
        children: [
          {
            type: "text",
            value: content.trim(), // Trim leading/trailing whitespace
          },
        ],
      };

      admonitionNodes.push(admonitionNode);
    }

    // Replace the original paragraph nodes if we found any admonition nodes
    if (admonitionNodes.length > 0) {
      const firstParagraphIndex = tree.children.findIndex(
        (node) => node.type === "paragraph"
      );
      tree.children.splice(
        firstParagraphIndex,
        paragraphs.length,
        ...admonitionNodes
      );
    }
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
          // Render custom admonition nodes
          admonition: ({ node, ...props }) => {
            const type = node?.data?.hProperties?.type || "note";
            const title = node?.data?.hProperties?.title;
            const content = node.children
              .map((child) => (child.type === "text" ? child.value : ""))
              .join(" ");
            return (
              <Admonition type={type} title={title} {...props}>
                {content}
              </Admonition>
            );
          },
        }}
      />
    </div>
  );
}

export default Markdown;
