import React, { useRef, useState, useEffect } from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import codegen from "postman-code-generators";
import { useSelector } from "react-redux";

import FloatingButton from "./../FloatingButton";
import buildPostmanRequest from "./../buildPostmanRequest";

import styles from "./styles.module.css";

const globalOptions = {
  followRedirect: true,
  trimRequestBody: true,
};

const languageSet = {
  js: {
    highlight: "javascript",
    language: "javascript",
    variant: "fetch",
    options: {
      ...globalOptions,
    },
  },
  curl: {
    highlight: "bash",
    language: "curl",
    variant: "curl",
    options: {
      longFormat: false,
      ...globalOptions,
    },
  },
  go: {
    highlight: "go",
    language: "go",
    variant: "native",
    options: {
      ...globalOptions,
    },
  },
  python: {
    highlight: "python",
    language: "python",
    variant: "requests",
    options: {
      ...globalOptions,
    },
  },
  node: {
    highlight: "javascript",
    language: "nodejs",
    variant: "axios",
    options: {
      ES6_enabled: true,
      ...globalOptions,
    },
  },
};

const languageTheme = {
  plain: {
    color: "var(--ifm-code-color)",
  },
  styles: [
    {
      types: ["inserted", "attr-name"],
      style: {
        color: "var(--openapi-code-green)",
      },
    },

    {
      types: ["string", "url"],
      style: {
        color: "var(--openapi-code-green)",
      },
    },
    {
      types: ["builtin", "char", "constant", "function"],
      style: {
        color: "var(--openapi-code-blue)",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "#7f7f7f",
      },
    },
    {
      types: ["class-name"],
      style: {
        color: "var(--openapi-code-orange)",
      },
    },
    {
      types: ["tag", "arrow", "keyword"],
      style: {
        color: "#d9a0f9",
      },
    },
    {
      types: ["boolean"],
      style: {
        color: "var(--openapi-code-red)",
      },
    },
  ],
};

function Curl() {
  const [language, setLanguage] = useState("curl");

  const [copyText, setCopyText] = useState("Copy");

  const pathParams = useSelector((state) => state.params.path);
  const queryParams = useSelector((state) => state.params.query);
  const cookieParams = useSelector((state) => state.params.cookie);
  const headerParams = useSelector((state) => state.params.header);
  const contentType = useSelector((state) => state.contentType);
  const body = useSelector((state) => state.body);
  const accept = useSelector((state) => state.accept);
  const endpoint = useSelector((state) => state.endpoint);
  const postman = useSelector((state) => state.postman);

  const [codeText, setCodeText] = useState("");

  useEffect(() => {
    const postmanRequest = buildPostmanRequest(postman, {
      queryParams,
      pathParams,
      cookieParams,
      contentType,
      accept,
      headerParams,
      body,
      endpoint,
    });

    codegen.convert(
      languageSet[language].language,
      languageSet[language].variant,
      postmanRequest,
      languageSet[language].options,
      (error, snippet) => {
        if (error) {
          return;
        }
        setCodeText(snippet);
      }
    );
  }, [
    accept,
    body,
    contentType,
    cookieParams,
    headerParams,
    language,
    pathParams,
    postman,
    queryParams,
    endpoint,
  ]);

  const ref = useRef(null);

  const handleCurlCopy = () => {
    setCopyText("Copied");
    setTimeout(() => {
      setCopyText("Copy");
    }, 2000);
    navigator.clipboard.writeText(ref.current.innerText);
  };

  return (
    <>
      <div className={styles.buttonGroup}>
        <button
          className={language === "curl" ? styles.selected : undefined}
          onClick={() => setLanguage("curl")}
        >
          cURL
        </button>
        <button
          className={language === "node" ? styles.selected : undefined}
          onClick={() => setLanguage("node")}
        >
          Node
        </button>
        <button
          className={language === "go" ? styles.selected : undefined}
          onClick={() => setLanguage("go")}
        >
          Go
        </button>
        <button
          className={language === "python" ? styles.selected : undefined}
          onClick={() => setLanguage("python")}
        >
          Python
        </button>
      </div>

      <Highlight
        {...defaultProps}
        theme={languageTheme}
        code={codeText}
        language={languageSet[language].highlight}
      >
        {({ className, tokens, getLineProps, getTokenProps }) => (
          <FloatingButton onClick={handleCurlCopy} label={copyText}>
            <pre
              className={className}
              style={{
                background: "var(--openapi-card-background-color)",
                paddingRight: "60px",
                borderRadius:
                  "2px 2px var(--openapi-card-border-radius) var(--openapi-card-border-radius)",
              }}
            >
              <code ref={ref}>
                {tokens.map((line, i) => (
                  <span {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => {
                      if (token.types.includes("arrow")) {
                        token.types = ["arrow"];
                      }
                      return <span {...getTokenProps({ token, key })} />;
                    })}
                    {"\n"}
                  </span>
                ))}
              </code>
            </pre>
          </FloatingButton>
        )}
      </Highlight>
    </>
  );
}

export default Curl;
