/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Joi } from "@docusaurus/utils-validation";

import type { PluginOptions } from "./types";

export const DEFAULT_OPTIONS: PluginOptions = {
  id: "default",
  config: {},
};

export const OptionsSchema = Joi.object({
  id: Joi.string().default(DEFAULT_OPTIONS.id),
  config: Joi.object().default(DEFAULT_OPTIONS.config),
});
