/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { CodeSample, Language } from "./code-snippets-types";
import { mergeCodeSampleLanguage } from "./languages";

const baseLang = (
  language: string,
  codeSampleLanguage: Language["codeSampleLanguage"]
): Language => ({
  highlight: language,
  language,
  codeSampleLanguage,
  logoClass: language,
  variant: "http",
  variants: ["http"],
});

describe("mergeCodeSampleLanguage", () => {
  it("returns the language unchanged when no codeSamples target it", () => {
    const langs = [baseLang("python", "Python")];
    const result = mergeCodeSampleLanguage(langs, []);
    expect(result[0]).toEqual(langs[0]);
    expect(result[0].samples).toBeUndefined();
  });

  it("attaches a single sample with no label using an indexed id", () => {
    const samples: CodeSample[] = [{ lang: "Python", source: "print('hi')" }];
    const [py] = mergeCodeSampleLanguage(
      [baseLang("python", "Python")],
      samples
    );
    expect(py.samples).toEqual(["Python-0"]);
    expect(py.samplesLabels).toEqual(["Python"]);
    expect(py.samplesSources).toEqual(["print('hi')"]);
    expect(py.sample).toBe("Python-0");
  });

  it("attaches a single sample with a label using lang-label id", () => {
    const samples: CodeSample[] = [
      { lang: "PHP", label: "Custom", source: "<?php" },
    ];
    const [php] = mergeCodeSampleLanguage([baseLang("php", "PHP")], samples);
    expect(php.samples).toEqual(["PHP-Custom"]);
    expect(php.samplesLabels).toEqual(["Custom"]);
  });

  it("produces unique ids for multiple samples sharing a lang with distinct labels (#1204)", () => {
    const samples: CodeSample[] = [
      { lang: "Python", label: "KeyPair Auth", source: "a" },
      { lang: "Python", label: "Basic Auth", source: "b" },
      { lang: "Python", label: "OAuth", source: "c" },
    ];
    const [py] = mergeCodeSampleLanguage(
      [baseLang("python", "Python")],
      samples
    );
    expect(py.samples).toEqual([
      "Python-KeyPair Auth",
      "Python-Basic Auth",
      "Python-OAuth",
    ]);
    expect(new Set(py.samples).size).toBe(3);
    expect(py.samplesLabels).toEqual(["KeyPair Auth", "Basic Auth", "OAuth"]);
    expect(py.samplesSources).toEqual(["a", "b", "c"]);
  });

  it("produces unique indexed ids for multiple samples sharing a lang without labels", () => {
    const samples: CodeSample[] = [
      { lang: "PowerShell", source: "x" },
      { lang: "PowerShell", source: "y" },
    ];
    const [ps] = mergeCodeSampleLanguage(
      [baseLang("powershell", "PowerShell")],
      samples
    );
    expect(ps.samples).toEqual(["PowerShell-0", "PowerShell-1"]);
    expect(new Set(ps.samples).size).toBe(2);
    expect(ps.samplesLabels).toEqual(["PowerShell", "PowerShell"]);
  });

  it("defensively suffixes ids when lang+label collides", () => {
    const samples: CodeSample[] = [
      { lang: "Java", label: "Auth", source: "a" },
      { lang: "Java", label: "Auth", source: "b" },
    ];
    const [java] = mergeCodeSampleLanguage([baseLang("java", "Java")], samples);
    expect(java.samples).toEqual(["Java-Auth", "Java-Auth-1"]);
    expect(new Set(java.samples).size).toBe(2);
    expect(java.samplesLabels).toEqual(["Auth", "Auth"]);
  });

  it("filters codeSamples by codeSampleLanguage and leaves other languages alone", () => {
    const samples: CodeSample[] = [
      { lang: "Python", label: "A", source: "a" },
      { lang: "Java", label: "B", source: "b" },
    ];
    const result = mergeCodeSampleLanguage(
      [baseLang("python", "Python"), baseLang("php", "PHP")],
      samples
    );
    expect(result[0].samples).toEqual(["Python-A"]);
    expect(result[1].samples).toBeUndefined();
  });
});
