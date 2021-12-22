/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import type { Plugin } from "@docusaurus/types";
import { ProvidePlugin } from "webpack";

export default function docusaurusThemeOpenAPI(): Plugin<void> {
  return {
    name: "docusaurus-theme-openapi",

    getThemePath() {
      return path.join(__dirname, "..", "lib-next", "theme");
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, "..", "src", "theme");
    },

    configureWebpack() {
      return {
        plugins: [
          new ProvidePlugin({
            Buffer: [require.resolve("buffer/"), "Buffer"],
            process: require.resolve("process/browser"),
          }),
        ],
        resolve: {
          fallback: {
            buffer: require.resolve("buffer/"),
            process: require.resolve("process/browser"),
          },
        },
      };
    },
  };
}
