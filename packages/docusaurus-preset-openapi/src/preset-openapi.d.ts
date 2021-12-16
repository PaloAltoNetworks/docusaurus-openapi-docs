/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type {
  Options as ClassicOptions,
  ThemeConfig as ClassicThemeConfig,
} from "@docusaurus/preset-classic";

export type Options = {
  api?: false | import("docusaurus-plugin-openapi").Options;
  proxy?: false | import("docusaurus-plugin-proxy").Options;
} & ClassicOptions;

export type ThemeConfig = import("docusaurus-theme-openapi").ThemeConfig &
  ClassicThemeConfig;
