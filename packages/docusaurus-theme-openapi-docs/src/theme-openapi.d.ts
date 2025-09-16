/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/// <reference types="docusaurus-plugin-openapi-docs" />

export type {
  PropSidebarItemCategory,
  SidebarItemLink,
  PropSidebar,
  PropSidebarItem,
  PropSidebars,
} from "@docusaurus/plugin-content-docs/lib/sidebars/types";

declare module "docusaurus-theme-openapi-docs" {
  export type ThemeConfig = Partial<import("./types").ThemeConfig>;
}
