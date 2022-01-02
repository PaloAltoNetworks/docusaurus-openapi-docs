/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useRef, useState, useEffect } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";
// @ts-ignore
import codegen from "postman-code-generators";
import sdk from "postman-collection";
import Highlight, { defaultProps } from "prism-react-renderer";

import { useTypedSelector } from "../hooks";
import buildPostmanRequest from "./../buildPostmanRequest";
import FloatingButton from "./../FloatingButton";
import styles from "./styles.module.css";

interface Language {
  tabName: string;
  highlight: string;
  language: string;
  variant: string;
  options: { [key: string]: boolean };
}

const languageSet: Language[] = [
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

interface Props {
  postman: sdk.Request;
  codeSamples: any; // TODO: Type this...
}

function Curl({ postman, codeSamples }: Props) {
  // TODO: match theme for vscode.

  const { siteConfig } = useDocusaurusContext();

  const [copyText, setCopyText] = useState("Copy");

  const contentType = useTypedSelector((state) => state.contentType.value);
  const accept = useTypedSelector((state) => state.accept.value);
  const server = useTypedSelector((state) => state.server.value);
  const body = useTypedSelector((state) => state.body);

  const pathParams = useTypedSelector((state) => state.params.path);
  const queryParams = useTypedSelector((state) => state.params.query);
  const cookieParams = useTypedSelector((state) => state.params.cookie);
  const headerParams = useTypedSelector((state) => state.params.header);

  const auth = useTypedSelector((state) => state.auth);

  // TODO
  const langs = [
    ...((siteConfig?.themeConfig?.languageTabs as Language[] | undefined) ??
      languageSet),
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
        server,
        auth,
      });

      codegen.convert(
        language.language,
        language.variant,
        postmanRequest,
        language.options,
        (error: any, snippet: string) => {
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
    server,
    auth,
  ]);

  const ref = useRef<HTMLDivElement>(null);

  const handleCurlCopy = () => {
    setCopyText("Copied");
    setTimeout(() => {
      setCopyText("Copy");
    }, 2000);
    if (ref.current?.innerText) {
      navigator.clipboard.writeText(ref.current.innerText);
    }
  };

  if (language === undefined) {
    return null;
  }

  return (
    <>
      <div className={clsx(styles.buttonGroup, "api-code-tab-group")}>
        {langs.map((lang) => {
          return (
            <button
              key={lang.tabName || lang.label}
              className={clsx(
                language === lang ? styles.selected : undefined,
                language === lang ? "api-code-tab--active" : undefined,
                "api-code-tab"
              )}
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
