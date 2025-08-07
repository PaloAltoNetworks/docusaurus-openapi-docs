/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useState } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { Postman } from "@har-sdk/core";
import { postman2har } from "@har-sdk/postman";
import ApiCodeBlock from "@theme/ApiExplorer/ApiCodeBlock";
import buildPostmanRequest from "@theme/ApiExplorer/buildPostmanRequest";
import CodeTabs from "@theme/ApiExplorer/CodeTabs";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import { HTTPSnippet, TargetId } from "httpsnippet-lite";
import cloneDeep from "lodash/cloneDeep";
import * as sdk from "postman-collection";
import type { Param } from "@theme/ApiExplorer/ParamOptions/slice";

import { CodeSample, Language } from "./code-snippets-types";
import {
  getCodeSampleSourceFromLanguage,
  mergeArraysbyLanguage,
  mergeCodeSampleLanguage,
  generateLanguageSet,
} from "./languages";

export const languageSet: Language[] = generateLanguageSet();

export interface Props {
  postman: sdk.Request;
  codeSamples: CodeSample[];
  maskCredentials?: boolean;
}

function CodeTab({ children, hidden, className }: any): React.JSX.Element {
  return (
    <div role="tabpanel" className={className} {...{ hidden }}>
      {children}
    </div>
  );
}

function CodeSnippets({
  postman,
  codeSamples,
  maskCredentials: propMaskCredentials,
}: Props) {
  const { siteConfig } = useDocusaurusContext();

  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const server = useTypedSelector((state: any) => state.server.value);
  const body = useTypedSelector((state: any) => state.body);

  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const headerParams = useTypedSelector((state: any) => state.params.header);

  const auth = useTypedSelector((state: any) => state.auth);

  // Check if credential masking is enabled (default: true)
  const maskCredentials = propMaskCredentials ?? true;

  // Clone Auth if maskCredentials is not false
  const cleanedAuth = maskCredentials
    ? (() => {
        const clonedAuth = cloneDeep(auth);
        let placeholder: string;

        function cleanCredentials(obj: any) {
          for (const key in obj) {
            if (typeof obj[key] === "object" && obj[key] !== null) {
              // use name as placeholder if exists
              const comboAuthId = Object.keys(obj).join(" and ");
              const authOptions =
                clonedAuth?.options?.[key] ??
                clonedAuth?.options?.[comboAuthId];
              placeholder = authOptions?.[0]?.name;
              obj[key] = cleanCredentials(obj[key]);
            } else {
              obj[key] = `<${placeholder ?? key}>`;
            }
          }

          return obj;
        }

        return {
          ...clonedAuth,
          data: cleanCredentials(clonedAuth.data),
        };
      })()
    : auth;

  // Create a Postman request object using cleanedAuth or original auth
  const cleanedPostmanRequest = buildPostmanRequest(postman, {
    queryParams,
    pathParams,
    cookieParams,
    contentType,
    accept,
    headerParams,
    body,
    server,
    auth: cleanedAuth,
  });

  // User-defined languages array
  // Can override languageSet, change order of langs, override options and variants
  const languageAliases: Record<
    string,
    { language: string; variant?: string }
  > = {
    curl: { language: "shell", variant: "curl" },
    nodejs: { language: "node" },
  };

  const userDefinedLanguageSet = (
    siteConfig?.themeConfig?.languageTabs as Language[] | undefined
  )
    ?.map((lang) => {
      const alias = languageAliases[lang.language];
      if (alias) {
        return {
          ...lang,
          ...alias,
          label: lang.label ?? lang.language,
        };
      }
      return lang;
    })
    .filter((lang) => languageSet.some((ls) => ls.language === lang.language));

  const finalLanguageSet =
    userDefinedLanguageSet && userDefinedLanguageSet.length
      ? userDefinedLanguageSet
      : languageSet;

  // Filter languageSet by user-defined langs
  const filteredLanguageSet = languageSet.filter((ls) =>
    finalLanguageSet.some((lang) => lang.language === ls.language)
  );

  // Merge user-defined langs into languageSet
  const mergedLangs = mergeCodeSampleLanguage(
    mergeArraysbyLanguage(finalLanguageSet, filteredLanguageSet),
    codeSamples
  );

  // Read defaultLang from localStorage
  const defaultLang: Language[] = mergedLangs.filter(
    (lang) =>
      lang.language === localStorage.getItem("docusaurus.tab.code-samples")
  );
  const [language, setLanguage] = useState(() => {
    // Return first index if only 1 user-defined language exists
    if (mergedLangs.length === 1) {
      return mergedLangs[0];
    }
    // Fall back to language in localStorage or first user-defined language
    return defaultLang[0] ?? mergedLangs[0];
  });
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    language.variant
  );
  const [selectedSample, setSelectedSample] = useState<string | undefined>(
    language.sample
  );
  const [codeText, setCodeText] = useState<string>("");
  const [codeSampleCodeText, setCodeSampleCodeText] = useState<
    string | (() => string)
  >(() => getCodeSampleSourceFromLanguage(language));

  useEffect(() => {
    if (language && !!language.sample) {
      setCodeSampleCodeText(getCodeSampleSourceFromLanguage(language));
    }
  }, [language, selectedSample]);

  useEffect(() => {
    async function generateSnippet() {
      if (!language) {
        setCodeText("");
        return;
      }
      const langSource = mergedLangs.filter(
        (lang) => lang.language === language.language
      );
      const mergedLanguage = language.options
        ? language
        : { ...langSource[0], ...language };
      const collection = new sdk.Collection({
        item: [{ name: "request", request: cleanedPostmanRequest }],
      });

      const environment = Object.fromEntries(
        pathParams.map((param: Param) => [
          param.name,
          Array.isArray(param.value)
            ? param.value[0]
            : (param.value ?? `<${param.name}>`),
        ])
      );

      const [harRequest] = await postman2har(
        {
          ...collection.toJSON(),
          info: {
            schema:
              "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
          },
        } as Postman.Document,
        { environment }
      );
      const snippet = await new HTTPSnippet(harRequest).convert(
        mergedLanguage.language as TargetId,
        selectedVariant ?? mergedLanguage.variant,
        mergedLanguage.options
      );
      setCodeText(typeof snippet === "string" ? snippet : "");
    }
    generateSnippet();
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
    cleanedPostmanRequest,
    mergedLangs,
    selectedVariant,
  ]);

  if (language === undefined) {
    return null;
  }

  return (
    <>
      {/* Outer language tabs */}
      <CodeTabs
        groupId="code-samples"
        action={{
          setLanguage: setLanguage,
          setSelectedVariant: setSelectedVariant,
          setSelectedSample: setSelectedSample,
        }}
        languageSet={mergedLangs}
        defaultValue={defaultLang[0]?.language ?? mergedLangs[0].language}
        lazy
      >
        {mergedLangs.map((lang) => {
          return (
            <CodeTab
              value={lang.language}
              label={lang.label ?? lang.language}
              key={lang.language}
              attributes={{
                className: `openapi-tabs__code-item--${lang.logoClass}`,
              }}
            >
              {/* Inner x-codeSamples tabs */}
              {lang.samples && (
                <CodeTabs
                  className="openapi-tabs__code-container-inner"
                  action={{
                    setLanguage: setLanguage,
                    setSelectedSample: setSelectedSample,
                  }}
                  includeSample={true}
                  currentLanguage={lang.language}
                  defaultValue={selectedSample ?? language.sample}
                  languageSet={mergedLangs}
                  lazy
                >
                  {lang.samples.map((sample, index) => {
                    return (
                      <CodeTab
                        value={sample}
                        label={
                          lang.samplesLabels
                            ? lang.samplesLabels[index]
                            : sample
                        }
                        key={`${lang.language}-${lang.sample}`}
                        attributes={{
                          className: `openapi-tabs__code-item--sample`,
                        }}
                      >
                        {/* @ts-ignore */}
                        <ApiCodeBlock
                          language={lang.highlight}
                          className="openapi-explorer__code-block"
                          showLineNumbers={true}
                        >
                          {codeSampleCodeText}
                        </ApiCodeBlock>
                      </CodeTab>
                    );
                  })}
                </CodeTabs>
              )}

              {/* Inner generated code snippets */}
              <CodeTabs
                className="openapi-tabs__code-container-inner"
                action={{
                  setLanguage: setLanguage,
                  setSelectedVariant: setSelectedVariant,
                }}
                includeVariant={true}
                currentLanguage={lang.language}
                defaultValue={selectedVariant ?? language.variant}
                languageSet={mergedLangs}
                lazy
              >
                {lang.variants.map((variant, index) => {
                  return (
                    <CodeTab
                      value={variant.toLowerCase()}
                      label={variant.toUpperCase()}
                      key={`${lang.language}-${lang.variant}`}
                      attributes={{
                        className: `openapi-tabs__code-item--variant`,
                      }}
                    >
                      {/* @ts-ignore */}
                      <ApiCodeBlock
                        language={lang.highlight}
                        className="openapi-explorer__code-block"
                        showLineNumbers={true}
                      >
                        {codeText}
                      </ApiCodeBlock>
                    </CodeTab>
                  );
                })}
              </CodeTabs>
            </CodeTab>
          );
        })}
      </CodeTabs>
    </>
  );
}

export default CodeSnippets;
