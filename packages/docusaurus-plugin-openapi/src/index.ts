/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import {
  LoadContext,
  Plugin,
  RouteConfig,
  ConfigureWebpackUtils,
} from "@docusaurus/types";
import {
  DEFAULT_PLUGIN_ID,
  normalizeUrl,
  docuHash,
  addTrailingPathSeparator,
  posixPath,
} from "@docusaurus/utils";
import chalk from "chalk";
import { Configuration } from "webpack";

import { createApiPageMD, createInfoPageMD } from "./markdown";
import { readOpenapiFiles, processOpenapiFiles } from "./openapi";
import { generateSidebars } from "./sidebars";
import { PluginOptions, LoadedContent } from "./types";

export default function pluginOpenAPI(
  context: LoadContext,
  options: PluginOptions
): Plugin<LoadedContent> {
  const { baseUrl, generatedFilesDir } = context;

  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;

  const pluginDataDirRoot = path.join(
    generatedFilesDir,
    "docusaurus-plugin-openapi"
  );

  const dataDir = path.join(pluginDataDirRoot, pluginId);

  const aliasedSource = (source: string) =>
    `~api/${posixPath(path.relative(pluginDataDirRoot, source))}`;

  const contentPath = path.resolve(context.siteDir, options.path);

  return {
    name: "docusaurus-plugin-openapi",

    getPathsToWatch() {
      return [contentPath];
    },

    async loadContent() {
      const { routeBasePath } = options;

      try {
        const openapiFiles = await readOpenapiFiles(contentPath, {});
        const loadedApi = await processOpenapiFiles(openapiFiles, {
          baseUrl,
          routeBasePath,
          siteDir: context.siteDir,
        });
        return { loadedApi };
      } catch (e) {
        console.error(chalk.red(`Loading of api failed for "${contentPath}"`));
        throw e;
      }
    },

    async contentLoaded({ content, actions }) {
      const { loadedApi } = content;
      const {
        routeBasePath,
        apiLayoutComponent,
        apiItemComponent,
        sidebarCollapsed,
        sidebarCollapsible,
      } = options;
      const { addRoute, createData } = actions;

      const sidebarName = `openapi-sidebar-${pluginId}`;

      const sidebar = await generateSidebars(loadedApi, {
        sidebarCollapsible,
        sidebarCollapsed,
      });

      const promises = loadedApi.map(async (item) => {
        const pageId = `site-${routeBasePath}-${item.id}`;

        await createData(
          `${docuHash(pageId)}.json`,
          JSON.stringify(item, null, 2)
        );

        // TODO: "-content" should be inside hash to prevent name too long errors.
        const markdown = await createData(
          `${docuHash(pageId)}-content.mdx`,
          item.type === "api" ? createApiPageMD(item) : createInfoPageMD(item)
        );
        return {
          path: item.permalink,
          component: apiItemComponent,
          exact: true,
          modules: {
            content: markdown,
          },
          sidebar: sidebarName,
        };
      });

      // Important: the layout component should not end with /,
      // as it conflicts with the home doc
      // Workaround fix for https://github.com/facebook/docusaurus/issues/2917
      const apiBaseRoute = normalizeUrl([baseUrl, routeBasePath]);
      const basePath = apiBaseRoute === "/" ? "" : apiBaseRoute;

      async function rootRoute() {
        const item = loadedApi[0];
        const pageId = `site-${routeBasePath}-${item.id}`;

        return {
          path: basePath,
          component: apiItemComponent,
          exact: true,
          modules: {
            // TODO: "-content" should be inside hash to prevent name too long errors.
            content: path.join(dataDir, `${docuHash(pageId)}-content.mdx`),
          },
          sidebar: sidebarName,
        };
      }

      const routes = (await Promise.all([
        ...promises,
        rootRoute(),
      ])) as RouteConfig[];

      const apiBaseMetadataPath = await createData(
        `${docuHash(`api-metadata-prop`)}.json`,
        JSON.stringify(
          {
            apiSidebars: {
              [sidebarName]: sidebar,
            },
          },
          null,
          2
        )
      );

      addRoute({
        path: basePath,
        exact: false, // allow matching /api/* as well
        component: apiLayoutComponent, // main api component (ApiPage)
        routes, // subroute for each api
        modules: {
          apiMetadata: aliasedSource(apiBaseMetadataPath),
        },
      });

      return;
    },

    configureWebpack(
      _config: Configuration,
      isServer: boolean,
      { getJSLoader }: ConfigureWebpackUtils
    ) {
      const {
        rehypePlugins,
        remarkPlugins,
        beforeDefaultRehypePlugins,
        beforeDefaultRemarkPlugins,
      } = options;

      return {
        resolve: {
          alias: {
            "~api": pluginDataDirRoot,
          },
        },
        module: {
          rules: [
            {
              test: /(\.mdx?)$/,
              include: [dataDir].map(addTrailingPathSeparator),
              use: [
                getJSLoader({ isServer }),
                {
                  loader: require.resolve("@docusaurus/mdx-loader"),
                  options: {
                    remarkPlugins,
                    rehypePlugins,
                    beforeDefaultRehypePlugins,
                    beforeDefaultRemarkPlugins,
                    metadataPath: (mdxPath: string) => {
                      return mdxPath.replace(/(-content\.mdx?)$/, ".json");
                    },
                  },
                },
              ].filter(Boolean),
            },
          ],
        },
      };
    },
  };
}

export { validateOptions } from "./options";
