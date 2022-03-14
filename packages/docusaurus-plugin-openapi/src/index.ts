/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import type {
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

import { readDocFiles } from "./docs";
import { processDocFiles } from "./docs/docs";
import { createApiPageMD, createInfoPageMD } from "./markdown";
import { readOpenapiFiles, processOpenapiFiles } from "./openapi";
import { generateSidebar } from "./sidebars";
import type { PluginOptions, LoadedContent } from "./types";

export default function pluginOpenAPI(
  context: LoadContext,
  options: PluginOptions
): Plugin<LoadedContent> {
  const { baseUrl, generatedFilesDir } = context;
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const beforeApiDocs = options.beforeApiDocs;

  const pluginDataDirRoot = path.join(
    generatedFilesDir,
    "docusaurus-plugin-openapi"
  );

  const dataDir = path.join(pluginDataDirRoot, pluginId);

  const aliasedSource = (source: string) =>
    `~api/${posixPath(path.relative(pluginDataDirRoot, source))}`;

  const contentPath = path.resolve(context.siteDir, options.path);
  const docPaths = beforeApiDocs.map((docPath) => {
    return path.resolve(context.siteDir, docPath);
  });

  return {
    name: "docusaurus-plugin-openapi",

    getPathsToWatch() {
      return [contentPath].concat(docPaths);
    },

    async loadContent() {
      const { routeBasePath } = options;
      const docFiles = await readDocFiles(beforeApiDocs, {});
      const loadedDocs = await processDocFiles(docFiles, {
        baseUrl,
        routeBasePath,
        siteDir: context.siteDir,
      });
      try {
        const openapiFiles = await readOpenapiFiles(contentPath, {});
        const loadedApi = await processOpenapiFiles(openapiFiles, {
          baseUrl,
          routeBasePath,
          siteDir: context.siteDir,
        });
        return { loadedApi, loadedDocs };
      } catch (e) {
        console.error(chalk.red(`Loading of api failed for "${contentPath}"`));
        throw e;
      }
    },

    async contentLoaded({ content, actions }) {
      const { loadedApi, loadedDocs } = content;
      const {
        routeBasePath,
        apiLayoutComponent,
        apiItemComponent,
        sidebarCollapsed,
        sidebarCollapsible,
        showExecuteButton,
        showManualAuthentication,
      } = options;

      const { addRoute, createData } = actions;
      const sidebarName = `openapi-sidebar-${pluginId}`;

      const docSidebar = await generateSidebar(loadedDocs as [], {
        contentPath,
        sidebarCollapsible,
        sidebarCollapsed,
      });

      const sidebar = await generateSidebar(loadedApi, {
        contentPath,
        sidebarCollapsible,
        sidebarCollapsed,
      });

      const docPromises = loadedDocs.map(async (item) => {
        const pageId = `site-${routeBasePath}-${item.id}`;

        await createData(
          `${docuHash(pageId)}.json`,
          JSON.stringify(item, null, 2)
        );

        const markdown = await createData(
          `${docuHash(pageId)}-content.mdx`,
          item.data
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

      const promises = loadedApi.map(async (item) => {
        const pageId = `site-${routeBasePath}-${item.id}`;

        // Statically set custom plugin options
        item["showExecuteButton"] = showExecuteButton;
        item["showManualAuthentication"] = showManualAuthentication;

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
        ...docPromises,
        rootRoute(),
      ])) as RouteConfig[];

      const apiBaseMetadataPath = await createData(
        `${docuHash(`api-metadata-prop`)}.json`,
        JSON.stringify(
          {
            apiSidebars: {
              [sidebarName]: docSidebar.concat(sidebar),
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
