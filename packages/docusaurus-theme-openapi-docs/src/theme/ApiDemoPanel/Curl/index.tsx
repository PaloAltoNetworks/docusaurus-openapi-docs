/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState, useEffect } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import sdk from "@paloaltonetworks/postman-collection";
import CodeBlock from "@theme/CodeBlock";
import clsx from "clsx";
// @ts-ignore
import codegen from "postman-code-generators";

import CodeTabs from "../CodeTabs";
import { useTypedSelector } from "../hooks";
import buildPostmanRequest from "./../buildPostmanRequest";
import styles from "./styles.module.css";

interface Language {
  tabName: string;
  highlight: string;
  language: string;
  codeLanguage?: string;
  variant?: string;
  options?: { [key: string]: boolean };
  source?: string;
}

let languages = codegen.getLanguageList();
// eslint-disable-next-line array-callback-return
languages.map((language: any) => {
  language.variants.map((variant: { options: any; key: string }) => {
    codegen.getOptions(
      language.key,
      variant.key,
      function (error: any, options: any) {
        if (error) {
          console.error(error);
        }
        variant.options = options;
      }
    );
  });
});

export const languageSet: Language[] = [
  {
    tabName: "cURL",
    highlight: "bash",
    language: "curl",
    codeLanguage: "bash",
    variant: "curl",
    options: {
      longFormat: false,
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Python",
    highlight: "python",
    language: "python",
    codeLanguage: "python",
    variant: "requests",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Go",
    highlight: "go",
    language: "go",
    codeLanguage: "go",
    variant: "native",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Node",
    highlight: "javascript",
    language: "nodejs",
    codeLanguage: "javascript",
    variant: "axios",
    options: {
      ES6_enabled: true,
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Ruby",
    highlight: "ruby",
    language: "ruby",
    codeLanguage: "ruby",
    variant: "Net::HTTP",
    options: {},
  },
  {
    tabName: "C#",
    highlight: "csharp",
    language: "csharp",
    codeLanguage: "csharp",
    variant: "RestSharp",
    options: {},
  },
];

interface Props {
  postman: sdk.Request;
  codeSamples: any; // TODO: Type this...
}

function CodeTab({ children, hidden, className, onClick }: any): JSX.Element {
  return (
    <div
      role="tabpanel"
      className={clsx(styles.tabItem, className)}
      {...{ hidden }}
    >
      {children}
    </div>
  );
}

function Curl({ postman, codeSamples }: Props) {
  // TODO: match theme for vscode.

  const { siteConfig } = useDocusaurusContext();

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

  const defaultLang: Language[] = languageSet.filter(
    (lang) =>
      lang.codeLanguage === localStorage.getItem("docusaurus.tab.code-samples")
  );

  const [language, setLanguage] = useState(defaultLang[0] ?? langs[0]);

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

  if (language === undefined) {
    return null;
  }

  return (
    <>
      <CodeTabs groupId="code-samples" action={setLanguage}>
        {langs.map((lang) => {
          return (
            <CodeTab
              value={lang.language}
              label={""}
              key={lang.tabName || lang.label}
              attributes={{ className: `code__tab--${lang.codeLanguage}` }}
            >
              <CodeBlock language={lang.codeLanguage}>{codeText}</CodeBlock>
            </CodeTab>
          );
        })}
      </CodeTabs>
    </>
  );
}

export default Curl;
