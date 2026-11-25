/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useThemeConfig } from "@docusaurus/theme-common";
import type { SchemaObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import type { ThemeConfig } from "docusaurus-theme-openapi-docs/src/types";

export type GenerateExamples = NonNullable<
  NonNullable<ThemeConfig["api"]>["generateExamples"]
>;

export function useGenerateExamples(): GenerateExamples {
  const themeConfig = useThemeConfig() as ThemeConfig;
  return themeConfig.api?.generateExamples ?? "always";
}

function schemaHasExample(schema: SchemaObject | undefined): boolean {
  return (
    schema?.example !== undefined ||
    (Array.isArray(schema?.examples) && schema.examples.length > 0)
  );
}

function showGeneratedExample(
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

/**
 * The sample from the schema is the schema's own `example` / `examples[0]`
 * when it has one, so that sample is published and always shown. Otherwise:
 *
 * | mode       | media-type example | no media-type example |
 * | ---------- | ------------------ | --------------------- |
 * | `always`   | show               | show                  |
 * | `fallback` | hide               | show                  |
 * | `never`    | hide               | hide                  |
 */
export function showExampleFromSchema(
  mode: GenerateExamples,
  schema: SchemaObject | undefined,
  hasPublishedExample: boolean
): boolean {
  return (
    schemaHasExample(schema) || showGeneratedExample(mode, hasPublishedExample)
  );
}
