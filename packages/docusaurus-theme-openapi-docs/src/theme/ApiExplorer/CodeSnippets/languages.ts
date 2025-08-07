/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { availableTargets } from "httpsnippet-lite";
import find from "lodash/find";
import mergeWith from "lodash/mergeWith";
import unionBy from "lodash/unionBy";

import {
  CodeSample,
  Language,
  CodeSampleLanguage,
} from "./code-snippets-types";

export function mergeCodeSampleLanguage(
  languages: Language[],
  codeSamples: CodeSample[]
): Language[] {
  return languages.map((language) => {
    const languageCodeSamples = codeSamples.filter(
      ({ lang }) => lang === language.codeSampleLanguage
    );

    if (languageCodeSamples.length) {
      const samples = languageCodeSamples.map(({ lang }) => lang);
      const samplesLabels = languageCodeSamples.map(
        ({ label, lang }) => label || lang
      );
      const samplesSources = languageCodeSamples.map(({ source }) => source);

      return {
        ...language,
        sample: samples[0],
        samples,
        samplesSources,
        samplesLabels,
      };
    }

    return language;
  });
}

export const mergeArraysbyLanguage = (arr1: any, arr2: any) => {
  const mergedArray = unionBy(arr1, arr2, "language");

  return mergedArray.map((item: any) => {
    const matchingItems = [
      find(arr1, ["language", item["language"]]),
      find(arr2, ["language", item["language"]]),
    ];
    return mergeWith({}, ...matchingItems, (objValue: any) => {
      return objValue;
    });
  });
};

export function getCodeSampleSourceFromLanguage(language: Language) {
  if (
    language &&
    language.sample &&
    language.samples &&
    language.samplesSources
  ) {
    const sampleIndex = language.samples.findIndex(
      (smp) => smp === language.sample
    );
    return language.samplesSources[sampleIndex];
  }

  return "";
}

export function generateLanguageSet() {
  const languageSet: Language[] = [];
  const languageMap: Record<string, CodeSampleLanguage> = {
    c: "C",
    csharp: "C#",
    go: "Go",
    java: "Java",
    javascript: "JavaScript",
    kotlin: "Kotlin",
    node: "JavaScript",
    objc: "Objective-C",
    ocaml: "OCaml",
    php: "PHP",
    powershell: "PowerShell",
    python: "Python",
    r: "R",
    ruby: "Ruby",
    rust: "Rust",
    shell: "Shell",
    swift: "Swift",
  };
  const highlightMap: Record<string, string> = {
    node: "javascript",
  };
  availableTargets().forEach((target) => {
    const codeSample = languageMap[target.key];
    if (!codeSample) {
      return;
    }
    const variants = target.clients.map((client: any) => client.key);
    languageSet.push({
      highlight: highlightMap[target.key] ?? target.key,
      language: target.key,
      codeSampleLanguage: codeSample,
      logoClass: target.key,
      options: {},
      variant: variants[0],
      variants,
    });
  });
  return languageSet;
}
