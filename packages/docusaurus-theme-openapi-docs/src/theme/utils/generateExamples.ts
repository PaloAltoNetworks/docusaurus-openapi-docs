/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useThemeConfig } from "@docusaurus/theme-common";
import type { ThemeConfig } from "docusaurus-theme-openapi-docs/src/types";

export type GenerateExamples = NonNullable<
  NonNullable<ThemeConfig["api"]>["generateExamples"]
>;

export function useGenerateExamples(): GenerateExamples {
  const themeConfig = useThemeConfig() as ThemeConfig;
  return themeConfig.api?.generateExamples ?? "always";
}

/**
 * | mode       | published example | no published example |
 * | ---------- | ----------------- | -------------------- |
 * | `always`   | show              | show                 |
 * | `fallback` | hide              | show                 |
 * | `never`    | hide              | hide                 |
 */
export function showGeneratedExample(
  mode: GenerateExamples,
  hasPublishedExample: boolean
): boolean {
  switch (mode) {
    case "always":
      return true;
    case "fallback":
      return !hasPublishedExample;
    case "never":
      return false;
    default: {
      const unhandled: never = mode;
      return unhandled;
    }
  }
}
