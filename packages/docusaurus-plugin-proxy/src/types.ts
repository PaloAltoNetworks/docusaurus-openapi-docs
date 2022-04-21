/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type { Configuration } from "webpack-dev-server";

export interface PluginOptions {
  proxy: Configuration["proxy"];
}
