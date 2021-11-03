/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "fs-extra";
import path from "path";
import admonitions from "remark-admonitions";
import { normalizeUrl, docuHash } from "@docusaurus/utils";
import {
  LoadContext,
  Plugin,
  RouteConfig,
  ConfigureWebpackUtils,
} from "@docusaurus/types";
import webpack, { Configuration } from "webpack";

import { PluginOptions, LoadedContent, ApiSection } from "./types";
import { loadOpenapi } from "./openapi";

const DEFAULT_OPTIONS: PluginOptions = {
  routeBasePath: "api",
  openapiPath: "",
  apiLayoutComponent: "@theme/ApiPage",
  apiItemComponent: "@theme/ApiItem",
  remarkPlugins: [],
  rehypePlugins: [],
  admonitions: {},
};

export default function pluginOpenAPI(
  context: LoadContext,
  opts: Partial<PluginOptions>
): Plugin<LoadedContent | null> {
  const name = "docusaurus-plugin-openapi";

  const options: PluginOptions = { ...DEFAULT_OPTIONS, ...opts };

  if (options.admonitions) {
    options.remarkPlugins = options.remarkPlugins.concat([
      [admonitions, options.admonitions],
    ]);
  }

  const { baseUrl, generatedFilesDir } = context;

  const dataDir = path.join(generatedFilesDir, name);

  return {
    name: name,

    getThemePath() {
      return path.resolve(__dirname, "./theme");
    },

    getPathsToWatch() {
      return [options.openapiPath];
    },

    getClientModules() {
      const modules = [];

      if (options.admonitions) {
        modules.push(require.resolve("remark-admonitions/styles/infima.css"));
      }

      return modules;
    },

    async loadContent() {
      const { routeBasePath, openapiPath } = options;

      if (!openapiPath || !fs.existsSync(openapiPath)) {
        return null;
      }

      const openapiData = await loadOpenapi(
        openapiPath,
        baseUrl,
        routeBasePath
      );

      return { openapiData };
    },

    async contentLoaded({ content, actions }) {
      if (!content || Object.keys(content.openapiData).length === 0) {
        return;
      }

      const openapiData = content.openapiData as ApiSection[];
      const { routeBasePath, apiLayoutComponent, apiItemComponent } = options;
      const { addRoute, createData } = actions;

      const sidebar = openapiData.map((category) => {
        return {
          collapsed: true,
          type: "category",
          label: category.title,
          items: category.items.map((item) => {
            return {
              href: item.permalink,
              label: item.summary,
              type: "link",
              deprecated: item.deprecated,
            };
          }),
        };
      });

      const promises = openapiData
        .map((section) => {
          return section.items.map(async (item) => {
            const pageId = `site-${routeBasePath}-${item.hashId}`;
            const openapiDataPath = await createData(
              `${docuHash(pageId)}.json`,
              JSON.stringify(item)
            );

            const markdown = await createData(
              `${docuHash(pageId)}-description.md`,
              item.description
            );
            return {
              path: item.permalink,
              component: apiItemComponent,
              exact: true,
              modules: {
                openapi: openapiDataPath,
                content: {
                  __import: true,
                  path: markdown,
                },
              },
            };
          });
        })
        .flat();

      const routes = (await Promise.all(promises)) as RouteConfig[];

      const permalinkToSidebar = routes.reduce(
        (acc: { [key: string]: string }, item) => {
          acc[item.path] = "sidebar";
          return acc;
        },
        {}
      );

      // Important: the layout component should not end with /,
      // as it conflicts with the home doc
      // Workaround fix for https://github.com/facebook/docusaurus/issues/2917
      const apiBaseRoute = normalizeUrl([baseUrl, routeBasePath]);
      const basePath = apiBaseRoute === "/" ? "" : apiBaseRoute;

      const docsBaseMetadataPath = await createData(
        `${docuHash(normalizeUrl([apiBaseRoute, ":route"]))}.json`,
        JSON.stringify(
          {
            docsSidebars: {
              sidebar: sidebar,
            },
            permalinkToSidebar: permalinkToSidebar,
          },
          null,
          2
        )
      );

      addRoute({
        path: basePath,
        exact: false, // allow matching /docs/* as well
        component: apiLayoutComponent, // main docs component (DocPage)
        routes, // subroute for each doc
        modules: {
          docsMetadata: docsBaseMetadataPath,
        },
      });

      return;
    },

    configureWebpack(
      _config: Configuration,
      isServer: boolean,
      { getJSLoader }: ConfigureWebpackUtils
    ) {
      const { rehypePlugins, remarkPlugins } = options;

      const wp: Configuration = {
        resolve: {
          alias: {
            "~api": dataDir,
          },
          fallback: {
            buffer: require.resolve('buffer/'),
            process: require.resolve("process/browser"),
          },
        },
        plugins: [
          new webpack.ProvidePlugin({
            Buffer: [require.resolve("buffer/"), 'Buffer'],
            process: require.resolve("process/browser"),
          }),
        ],
        module: {
          rules: [
            {
              test: /(\.mdx?)$/,
              include: [dataDir],
              use: compact([ 
                getJSLoader({ isServer }),
                {
                  loader: require.resolve("@docusaurus/mdx-loader"),
                  options: {
                    remarkPlugins,
                    rehypePlugins,
                  },
                },
              ]),
            },
          ],
        },
      };

      return wp;
    },
  };
}

function compact<T>(elems: (T | null)[]): T[] {
  return elems.filter((t) => !!t) as T[];
}