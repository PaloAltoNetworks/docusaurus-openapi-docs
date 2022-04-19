/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Joi } from "@docusaurus/utils-validation";

import type { PluginOptions } from "./types";

export const DEFAULT_OPTIONS: PluginOptions = {
  path: "openapi.json", // Path to data on filesystem, relative to site dir.
  showExecuteButton: true,
  showManualAuthentication: true,
  outputDir: "api",
  sidebarOptions: {},
};

export const OptionsSchema = Joi.object({
  path: Joi.string().default(DEFAULT_OPTIONS.path),
  showExecuteButton: Joi.boolean().default(DEFAULT_OPTIONS.showExecuteButton),
  showManualAuthentication: Joi.boolean().default(
    DEFAULT_OPTIONS.showManualAuthentication
  ),
  outputDir: Joi.string().default(DEFAULT_OPTIONS.outputDir),
  sidebarOptions: Joi.object().default(DEFAULT_OPTIONS.sidebarOptions),
});
