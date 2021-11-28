/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import { Plugin } from "@docusaurus/types";
import webpack, { Configuration } from "webpack";

export default function docusaurusThemeOpenAPI(): Plugin<void> {
  return {
    name: "docusaurus-theme-openapi",

    getThemePath() {
      return path.resolve(__dirname, "./theme");
    },

    configureWebpack() {
      const wp: Configuration = {
        resolve: {
          fallback: {
            buffer: require.resolve("buffer/"),
            process: require.resolve("process/browser"),
          },
        },
        plugins: [
          new webpack.ProvidePlugin({
            Buffer: [require.resolve("buffer/"), "Buffer"],
            process: require.resolve("process/browser"),
          }),
        ],
      };

      return wp;
    },
  };
}
