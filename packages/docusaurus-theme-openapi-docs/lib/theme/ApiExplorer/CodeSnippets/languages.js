"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodeSampleSourceFromLanguage = exports.mergeCodeSampleLanguage =
  void 0;
function mergeCodeSampleLanguage(languages, codeSamples) {
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
exports.mergeCodeSampleLanguage = mergeCodeSampleLanguage;
function getCodeSampleSourceFromLanguage(language) {
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
exports.getCodeSampleSourceFromLanguage = getCodeSampleSourceFromLanguage;
