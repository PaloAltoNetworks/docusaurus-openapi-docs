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
  outputDir: "api",
};

export const OptionsSchema = Joi.object({
  path: Joi.string().default(DEFAULT_OPTIONS.path),
  outputDir: Joi.string().default(DEFAULT_OPTIONS.outputDir),
});
