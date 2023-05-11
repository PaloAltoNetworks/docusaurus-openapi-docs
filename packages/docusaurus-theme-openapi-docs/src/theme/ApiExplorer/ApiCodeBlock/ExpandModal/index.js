import React from "react";
import clsx from "clsx";
import Modal from "react-modal";
import Container from "@theme/ApiExplorer/ApiCodeBlock/Container";
import CopyButton from "@theme/ApiExplorer/ApiCodeBlock/CopyButton";
import ExitButton from "@theme/ApiExplorer/ApiCodeBlock/ExitButton";
import Highlight, { defaultProps } from "prism-react-renderer";
import { usePrismTheme } from "@docusaurus/theme-common";
import Line from "@theme/ApiExplorer/ApiCodeBlock/Line";

const ExpandModal = (props) => {
  const prismTheme = usePrismTheme();
  const {
    code,
    language,
    showLineNumbers,
    blockClassName,
    title,
    lineClassNames,
    modalIsOpen,
    closeModal,
  } = props;

  console.log(modalIsOpen);
  return (
    <Modal
      className="openapi-demo__expand-modal-content"
      overlayClassName="openapi-demo__expand-modal-overlay"
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Code Snippet"
    >
      <Container
        as="div"
        className={clsx(
          "openapi-demo__code-block-container",
          language &&
            !blockClassName.includes(`language-${language}`) &&
            `language-${language}`
        )}
      >
        {title && <div className="openapi-demo__code-block-title">{title}</div>}
        <div className="openapi-demo__code-block-content">
          <Highlight
            {...defaultProps}
            theme={prismTheme}
            code={code}
            language={language ?? "text"}
          >
            {({ className, tokens, getLineProps, getTokenProps }) => (
              <pre
                /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                tabIndex={0}
                className={clsx(
                  className,
                  "openapi-demo__code-block",
                  "thin-scrollbar"
                )}
              >
                <code
                  className={clsx(
                    "openapi-demo__code-block-lines",
                    showLineNumbers && "openapi-demo__code-block-lines-numbers"
                  )}
                >
                  {tokens.map((line, i) => (
                    <Line
                      key={i}
                      line={line}
                      getLineProps={getLineProps}
                      getTokenProps={getTokenProps}
                      classNames={lineClassNames[i]}
                      showLineNumbers={showLineNumbers}
                    />
                  ))}
                </code>
              </pre>
            )}
          </Highlight>
          <div className="openapi-demo__code-block-btn-group">
            <CopyButton
              className="openapi-demo__code-block-code-btn"
              code={code}
            />
            <ExitButton
              className="openapi-demo__code-block-code-btn"
              handler={closeModal}
            />
          </div>
        </div>
      </Container>
    </Modal>
  );
};

export default ExpandModal;
