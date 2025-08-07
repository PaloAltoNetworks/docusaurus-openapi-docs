/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import type { Plugin, ConfigureWebpackUtils } from "@docusaurus/types";
import type { Configuration } from "webpack";

export default function docusaurusThemeOpenAPI(): Plugin<void> {
  return {
    name: "docusaurus-theme-openapi",

    getClientModules() {
      return [
        require.resolve(
          path.join(__dirname, "..", "lib", "theme", "styles.scss")
        ),
      ];
    },

    getThemePath() {
      return path.join(__dirname, "..", "lib", "theme");
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, "..", "src", "theme");
    },

    configureWebpack(
      config: Configuration,
      isServer: boolean,
      utils: ConfigureWebpackUtils
    ): Configuration {
      const { getStyleLoaders, currentBundler } = utils;

      const fakerAlias = {
        "@faker-js/faker": path.resolve(
          __dirname,
          "..",
          "src",
          "shims",
          "faker.ts"
        ),
      };

      const ignoreFaker = new currentBundler.instance.IgnorePlugin({
        resourceRegExp: /^@faker-js\/faker$/,
      });

      const existingRules: any[] = config.module?.rules ?? [];
      const hasSassRule = existingRules.some(
        (r) => String(r.test) === String(/\.s[ca]ss$/)
      );

      const baseConfig: Configuration = {
        resolve: {
          alias: fakerAlias,
          fallback: {
            buffer: require.resolve("buffer/"),
          },
        },
        plugins: [
          ignoreFaker,
          new currentBundler.instance.ProvidePlugin({
            process: require.resolve("process/browser"),
            Buffer: ["buffer", "Buffer"],
          }),
        ],
      };

      if (!hasSassRule) {
        return {
          ...baseConfig,
          module: {
            rules: [
              {
                test: /\.s[ac]ss$/,
                include: path.resolve(__dirname, "..", "lib", "theme"),
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
        };
      }

      return baseConfig;
    },
  };
}
