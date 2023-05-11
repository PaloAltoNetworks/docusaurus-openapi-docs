/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useState } from "react";

import { translate } from "@docusaurus/Translate";
import clsx from "clsx";
import Modal from "react-modal";
import ExpandModal from "../ExpandModal";

export default function ExpandButton({
  code,
  className,
  language,
  showLineNumbers,
  blockClassName,
  title,
  lineClassNames,
}) {
  const [modalIsOpen, setIsOpen] = useState(false);
  console.log(modalIsOpen);
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    console.log("close modal calledx");
    setIsOpen(false);
  }
  useEffect(() => {
    Modal.setAppElement("body");
  });

  return (
    <>
      <button
        type="button"
        aria-label={
          modalIsOpen
            ? translate({
                id: "theme.CodeBlock.expanded",
                message: "Expanded",
                description: "The expanded button label on code blocks",
              })
            : translate({
                id: "theme.CodeBlock.expandButtonAriaLabel",
                message: "Expand code to fullscreen",
                description: "The ARIA label for expand code blocks button",
              })
        }
        title={translate({
          id: "theme.CodeBlock.expand",
          message: "Expand",
          description: "The expand button label on code blocks",
        })}
        className={clsx(
          "clean-btn",
          className,
          "openapi-demo__code-block-expand-btn",
          modalIsOpen && "openapi-demo__code-block-expand-btn--copied"
        )}
        onClick={openModal}
      >
        <span
          className="openapi-demo__code-block-expand-btn-icons"
          aria-hidden="true"
        >
          <svg
            className="openapi-demo__code-block-expand-btn-icon"
            viewBox="0 0 448 512"
          >
            <path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z" />
          </svg>
          <svg
            className="openapi-demo__code-block-expand-btn-icon--success"
            viewBox="0 0 24 24"
          >
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
          </svg>
        </span>
        <ExpandModal
          code={code}
          language={language}
          showLineNumbers={showLineNumbers}
          blockClassName={blockClassName}
          title={title}
          lineClassNames={lineClassNames}
          modalIsOpen={modalIsOpen}
          closeModal={closeModal}
        />
      </button>
    </>
  );
}
