/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { LoadContext, Plugin } from "@docusaurus/types";

import { PluginOptions } from "./types";

export default function pluginOpenAPI(
  _context: LoadContext,
  options: PluginOptions
): Plugin {
  return {
    name: "docusaurus-plugin-proxy",

    configureWebpack() {
      const { proxy } = options;

      return {
        devServer: {
          proxy: proxy,
        },
      } as any;
    },
  };
}
