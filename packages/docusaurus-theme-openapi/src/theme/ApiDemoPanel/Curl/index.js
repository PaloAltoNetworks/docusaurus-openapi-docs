/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useRef, useState, useEffect } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import codegen from "postman-code-generators";
import Highlight, { defaultProps } from "prism-react-renderer";
import { useSelector } from "react-redux";

import buildPostmanRequest from "./../buildPostmanRequest";
import FloatingButton from "./../FloatingButton";
import styles from "./styles.module.css";

const languageSet = [
  {
    tabName: "cURL",
    highlight: "bash",
    language: "curl",
    variant: "curl",
    options: {
      longFormat: false,
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Node",
    highlight: "javascript",
    language: "nodejs",
    variant: "axios",
    options: {
      ES6_enabled: true,
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Go",
    highlight: "go",
    language: "go",
    variant: "native",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Python",
    highlight: "python",
    language: "python",
    variant: "requests",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
  },
];

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
        color: "var(--openapi-code-dim)",
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
        color: "var(--openapi-code-purple)",
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
  // TODO: match theme for vscode.

  const { siteConfig } = useDocusaurusContext();

  const [copyText, setCopyText] = useState("Copy");

  const pathParams = useSelector((state) => state.params.path);
  const queryParams = useSelector((state) => state.params.query);
  const cookieParams = useSelector((state) => state.params.cookie);
  const headerParams = useSelector((state) => state.params.header);
  const contentType = useSelector((state) => state.contentType);
  const codeSamples = useSelector((state) => state.codeSamples);
  const body = useSelector((state) => state.body);
  const accept = useSelector((state) => state.accept);
  const endpoint = useSelector((state) => state.endpoint);
  const postman = useSelector((state) => state.postman);
  const auth = useSelector((state) => state.auth);
  const selectedAuthID = useSelector((state) => state.selectedAuthID);
  const authOptionIDs = useSelector((state) => state.authOptionIDs);

  const langs = [
    ...(siteConfig?.themeConfig?.languageTabs ?? languageSet),
    ...codeSamples,
  ];

  const [language, setLanguage] = useState(langs[0]);

  const [codeText, setCodeText] = useState("");

  useEffect(() => {
    if (language && !!language.options) {
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        endpoint,
        auth,
        selectedAuthID,
        authOptionIDs,
      });

      codegen.convert(
        language.language,
        language.variant,
        postmanRequest,
        language.options,
        (error, snippet) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else if (language && !!language.source) {
      setCodeText(language.source);
    } else {
      setCodeText("");
    }
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
    auth,
    selectedAuthID,
    authOptionIDs,
  ]);

  const ref = useRef(null);

  const handleCurlCopy = () => {
    setCopyText("Copied");
    setTimeout(() => {
      setCopyText("Copy");
    }, 2000);
    navigator.clipboard.writeText(ref.current.innerText);
  };

  if (language === undefined) {
    return null;
  }

  return (
    <>
      <div className={styles.buttonGroup}>
        {langs.map((lang) => {
          return (
            <button
              key={lang.tabName || lang.label}
              className={language === lang ? styles.selected : undefined}
              onClick={() => setLanguage(lang)}
            >
              {lang.tabName || lang.label}
            </button>
          );
        })}
      </div>

      <Highlight
        {...defaultProps}
        theme={languageTheme}
        code={codeText}
        language={language.highlight || language.lang}
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
