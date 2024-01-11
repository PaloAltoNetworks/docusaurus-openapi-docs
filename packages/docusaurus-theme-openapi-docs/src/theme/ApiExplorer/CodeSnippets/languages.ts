/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { CodeSample, Language } from "./code-snippets-types";

export function mergeCodeSampleLanguage(
  languages: Language[],
  codeSamples: CodeSample[]
): Language[] {
  return languages.map((language) => {
    const sample = codeSamples.find(
      ({ lang }) => lang === language.codeSampleLanguage
    );

    if (sample) {
      const label = sample.label || sample.lang;
      const variant = (sample.label || sample.lang).toLowerCase();
      const source = sample.source;

      return {
        ...language,
        source,
        labels: [label, ...(language.labels || [])],
        variant,
        variants: [variant, ...language.variants],
      };
    }

    return language;
  });
}
