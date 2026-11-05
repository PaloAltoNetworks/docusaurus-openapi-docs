/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createContext, useContext } from "react";

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { ThemeConfig } from "docusaurus-theme-openapi-docs/src/types";

export type ApiLayout = "classic" | "modern";

/**
 * Optional runtime override. Wrap the site (for example in a swizzled
 * `Root`) with a provider to let readers switch layouts.
 */
export const ApiLayoutContext = createContext<ApiLayout | undefined>(undefined);

function isLayout(value: unknown): value is ApiLayout {
  return value === "classic" || value === "modern";
}

/**
 * Resolves the API page layout. Precedence: ApiLayoutContext, then the
 * `api_layout` front matter, then `themeConfig.api.layout`, then "classic".
 */
export default function useApiLayout(): ApiLayout {
  const override = useContext(ApiLayoutContext);
  const { frontMatter } = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const configured = (siteConfig.themeConfig as ThemeConfig).api?.layout;
  const fromPage = (frontMatter as { api_layout?: unknown }).api_layout;

  if (isLayout(override)) return override;
  if (isLayout(fromPage)) return fromPage;
  if (isLayout(configured)) return configured;
  return "classic";
}
