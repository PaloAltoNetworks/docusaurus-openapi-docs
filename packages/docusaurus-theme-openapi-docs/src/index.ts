/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import type { Plugin } from "@docusaurus/types";

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

export default function docusaurusThemeOpenAPI(): Plugin<void> {
  return {
    name: "docusaurus-theme-openapi",

    getClientModules() {
      const modules = [require.resolve("./theme/styles.scss")];
      return modules;
    },

    getThemePath() {
      return path.join(__dirname, "..", "lib-next", "theme");
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, "..", "src", "theme");
    },

    configureWebpack(_, isServer, utils) {
      const { getStyleLoaders } = utils;
      const isProd = process.env.NODE_ENV === "production";
      return {
        plugins: [new NodePolyfillPlugin()],
        module: {
          rules: [
            {
              test: /\.s[ca]ss$/,
              oneOf: [
                {
                  test: /\.module\.s[ca]ss$/,
                  use: [
                    ...getStyleLoaders(isServer, {
                      modules: {
                        localIdentName: isProd
                          ? `[local]_[hash:base64:4]`
                          : `[local]_[path][name]`,
                        exportOnlyLocals: isServer,
                      },
                      importLoaders: 2,
                      sourceMap: !isProd,
                    }),
                    {
                      loader: require.resolve("sass-loader"),
                      options: {},
                    },
                  ],
                },
                {
                  use: [
                    ...getStyleLoaders(isServer, {}),
                    {
                      loader: require.resolve("sass-loader"),
                      options: {},
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
    },
  };
}
