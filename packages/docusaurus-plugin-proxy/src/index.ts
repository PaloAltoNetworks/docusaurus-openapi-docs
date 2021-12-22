/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type { LoadContext, Plugin } from "@docusaurus/types";

import type { PluginOptions } from "./types";

export default function pluginOpenAPI(
  _context: LoadContext,
  options: PluginOptions
): Plugin {
  return {
    name: "docusaurus-plugin-proxy",

    // docusaurus type is outdated
    configureWebpack(): any {
      return {
        devServer: {
          proxy: options,
        },
      };
    },
  };
}
