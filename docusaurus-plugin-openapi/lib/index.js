"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const remark_admonitions_1 = __importDefault(require("remark-admonitions"));
const utils_1 = require("@docusaurus/utils");
const openapi_1 = require("./openapi");
const DEFAULT_OPTIONS = {
    routeBasePath: "api",
    openapiPath: "",
    apiLayoutComponent: "@theme/ApiPage",
    apiItemComponent: "@theme/ApiItem",
    remarkPlugins: [],
    rehypePlugins: [],
    admonitions: {},
};
function pluginOpenAPI(context, opts) {
    const name = "docusaurus-plugin-openapi";
    const options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), opts);
    const homePageDocsRoutePath = options.routeBasePath === "" ? "/" : options.routeBasePath;
    if (options.admonitions) {
        options.remarkPlugins = options.remarkPlugins.concat([
            [remark_admonitions_1.default, options.admonitions],
        ]);
    }
    const { baseUrl, generatedFilesDir } = context;
    const dataDir = path_1.default.join(generatedFilesDir, name);
    return {
        name: name,
        getThemePath() {
            return path_1.default.resolve(__dirname, "./theme");
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
            if (!openapiPath || !fs_extra_1.default.existsSync(openapiPath)) {
                return null;
            }
            const openapiData = await openapi_1.loadOpenapi(openapiPath, baseUrl, routeBasePath);
            return { openapiData };
        },
        async contentLoaded({ content, actions }) {
            if (!content || Object.keys(content.openapiData).length === 0) {
                return;
            }
            const openapiData = content.openapiData;
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
                    const openapiDataPath = await createData(`${utils_1.docuHash(pageId)}.json`, JSON.stringify(item));
                    const markdown = await createData(`${utils_1.docuHash(pageId)}-description.md`, item.description);
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
            const routes = (await Promise.all(promises));
            const permalinkToSidebar = routes.reduce((acc, item) => {
                acc[item.path] = "sidebar";
                return acc;
            }, {});
            // Important: the layout component should not end with /,
            // as it conflicts with the home doc
            // Workaround fix for https://github.com/facebook/docusaurus/issues/2917
            const apiBaseRoute = utils_1.normalizeUrl([baseUrl, routeBasePath]);
            const basePath = apiBaseRoute === "/" ? "" : apiBaseRoute;
            const docsBaseMetadataPath = await createData(`${utils_1.docuHash(utils_1.normalizeUrl([apiBaseRoute, ":route"]))}.json`, JSON.stringify({
                docsSidebars: {
                    sidebar: sidebar,
                },
                permalinkToSidebar: permalinkToSidebar,
            }, null, 2));
            addRoute({
                path: basePath,
                exact: false,
                component: apiLayoutComponent,
                routes,
                modules: {
                    docsMetadata: docsBaseMetadataPath,
                },
            });
            return;
        },
        async routesLoaded(routes) {
            const homeDocsRoutes = routes.filter((routeConfig) => routeConfig.path === homePageDocsRoutePath);
            // Remove the route for docs home page if there is a page with the same path (i.e. docs).
            if (homeDocsRoutes.length > 1) {
                const docsHomePageRouteIndex = routes.findIndex((route) => route.component === options.apiLayoutComponent &&
                    route.path === homePageDocsRoutePath);
                delete routes[docsHomePageRouteIndex];
            }
        },
        configureWebpack(_config, isServer, { getBabelLoader, getCacheLoader }) {
            const { rehypePlugins, remarkPlugins } = options;
            return {
                resolve: {
                    alias: {
                        "~api": dataDir,
                    },
                },
                module: {
                    rules: [
                        {
                            test: /(\.mdx?)$/,
                            include: [dataDir],
                            use: [
                                getCacheLoader(isServer),
                                getBabelLoader(isServer),
                                {
                                    loader: require.resolve("@docusaurus/mdx-loader"),
                                    options: {
                                        remarkPlugins,
                                        rehypePlugins,
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        },
    };
}
exports.default = pluginOpenAPI;
