/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/// <reference types="docusaurus-plugin-openapi" />

declare module "docusaurus-theme-openapi" {
  export type ThemeConfig = Partial<import("./types").ThemeConfig>;
}
