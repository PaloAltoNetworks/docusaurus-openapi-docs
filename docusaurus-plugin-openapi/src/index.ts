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
import { LoadContext, Plugin } from "@docusaurus/types";

import { PluginOptions, LoadedContent } from "./types";
import { loadOpenapi } from "./x-openapi";

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
  const options: PluginOptions = { ...DEFAULT_OPTIONS, ...opts };
  const homePageDocsRoutePath =
    options.routeBasePath === "" ? "/" : options.routeBasePath;

  if (options.admonitions) {
    options.remarkPlugins = options.remarkPlugins.concat([
      [admonitions, options.admonitions],
    ]);
  }

  const { baseUrl } = context;

  return {
    name: "docusaurus-plugin-openapi",

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
      const { openapiPath } = options;

      if (!openapiPath || !fs.existsSync(openapiPath)) {
        return null;
      }

      const openapiData = await loadOpenapi(openapiPath);

      return { openapiData };
    },

    async contentLoaded({ content, actions }) {
      if (!content || Object.keys(content.openapiData).length === 0) {
        return;
      }

      const { openapiData } = content;
      const { routeBasePath, apiLayoutComponent, apiItemComponent } = options;
      const { addRoute, createData } = actions;

      const sidebar = openapiData.map((category) => {
        return {
          collapsed: true,
          type: "category",
          label: category.title,
          items: category.items.map((item) => {
            return {
              href: `/${routeBasePath}/${item.hashId}`,
              label: item.summary,
              type: "link",
              deprecated: item.deprecated,
            };
          }),
        };
      });

      // Important: the layout component should not end with /,
      // as it conflicts with the home doc
      // Workaround fix for https://github.com/facebook/docusaurus/issues/2917
      const apiBaseRoute = normalizeUrl([baseUrl, routeBasePath]);
      const pathx = apiBaseRoute === "/" ? "" : apiBaseRoute;

      const promises = openapiData
        .map((section) => {
          return section.items.map(async (item) => {
            const pageId = `site-${routeBasePath}-${item.hashId}`;
            const openapiDataPath = await createData(
              `${docuHash(pageId)}.json`,
              JSON.stringify(item)
            );
            return {
              path: pathx + "/" + item.hashId,
              component: apiItemComponent,
              exact: true,
              modules: {
                openapi: openapiDataPath,
              },
            };
          });
        })
        .flat();

      const routes = await Promise.all(promises);

      const permalinkToSidebar = routes.reduce((acc, item) => {
        acc[item.path] = "sidebar";
        return acc;
      }, {});

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
        path: pathx,
        exact: false, // allow matching /docs/* as well
        component: apiLayoutComponent, // main docs component (DocPage)
        routes, // subroute for each doc
        modules: {
          docsMetadata: docsBaseMetadataPath,
        },
      });

      return;
    },

    async routesLoaded(routes) {
      const homeDocsRoutes = routes.filter(
        (routeConfig) => routeConfig.path === homePageDocsRoutePath
      );

      // Remove the route for docs home page if there is a page with the same path (i.e. docs).
      if (homeDocsRoutes.length > 1) {
        const docsHomePageRouteIndex = routes.findIndex(
          (route) =>
            route.component === options.apiLayoutComponent &&
            route.path === homePageDocsRoutePath
        );

        delete routes[docsHomePageRouteIndex!];
      }
    },
  };
}
