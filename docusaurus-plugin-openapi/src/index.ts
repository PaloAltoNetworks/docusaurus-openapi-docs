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

// @ts-ignore
import Converter from "openapi-to-postmanv2";
// @ts-ignore
import sdk from "postman-collection";

import { PluginOptions, LoadedContent } from "./types";

// @ts-ignore
import { dereference } from "./x-dereference";
import { sampleFromSchema } from "./x-utils";

import importFresh from "import-fresh";

const DEFAULT_OPTIONS: PluginOptions = {
  routeBasePath: "api", // URL Route.
  openapiPath: "",
  docLayoutComponent: "@theme/DocPage",
  docItemComponent: "@theme/DocItem",
  remarkPlugins: [],
  rehypePlugins: [],
  admonitions: {},
};

export default function pluginContentDocs(
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

      const openapiData = importFresh(openapiPath);

      return { openapiData };
    },

    async contentLoaded({ content, actions }) {
      if (!content || Object.keys(content.openapiData).length === 0) {
        return;
      }

      const { routeBasePath } = options;
      const { openapiData } = content;
      const { addRoute, createData } = actions;

      const postmanSpec = await new Promise((resolve, reject) => {
        Converter.convert(
          // don't mutate.
          { type: "json", data: JSON.parse(JSON.stringify(openapiData)) },
          {},
          // @ts-ignore
          (_, conversionResult) => {
            if (!conversionResult.result) {
              reject(conversionResult.reason);
              return;
            } else {
              const myCollection = new sdk.Collection(
                conversionResult.output[0].data
              );
              // @ts-ignore
              myCollection.forEachItem((item) => {
                const method = item.request.method.toLowerCase();
                const path =
                  "/" +
                  item.request.url.path
                    // @ts-ignore
                    .map((p) => {
                      if (p.startsWith(":")) {
                        return `{${p.slice(1)}}`;
                      }
                      return p;
                    })
                    .join("/");

                openapiData.paths[path][method].postman = item.request;
              });
              return resolve(openapiData);
            }
          }
        );
      });

      function getPaths(spec) {
        const seen = {};
        return Object.entries(spec.paths)
          .map(([path, pathObj]) => {
            const entries = Object.entries(pathObj);
            return entries.map(([method, methodObj]) => {
              let summary = methodObj.summary || "Missing summary";
              const baseId = summary.toLowerCase().replace(/ /g, "-");
              let count = seen[baseId];

              let hashId;
              if (count) {
                hashId = `${baseId}-${count}`;
                seen[baseId] = count + 1;
              } else {
                hashId = baseId;
                seen[baseId] = 1;
              }

              return {
                ...methodObj,
                summary: summary,
                method: method,
                path: path,
                hashId: hashId,
              };
            });
          })
          .flat();
      }

      function organizeSpec(spec) {
        const paths = getPaths(spec);

        let tagNames = [];
        let tagged = [];
        if (spec.tags) {
          tagged = spec.tags
            .map((tag) => {
              return {
                title: tag.name,
                description: tag.description,
                items: paths.filter((p) => p.tags && p.tags.includes(tag.name)),
              };
            })
            .filter((i) => i.items.length > 0);
          tagNames = tagged.map((t) => t.title);
        }

        const all = [
          ...tagged,
          {
            title: "API",
            description: "",
            items: paths.filter((p) => {
              if (p.tags === undefined || p.tags.length === 0) {
                return true;
              }
              for (let tag of p.tags) {
                if (tagNames.includes(tag)) {
                  return false;
                }
              }
              return true;
            }),
          },
        ];

        return all;
      }

      const order = organizeSpec(dereference(postmanSpec));

      order.forEach((x) => {
        x.items.forEach((y) => {
          if (y.requestBody?.content?.["application/json"]?.schema) {
            y.jsonRequestBodyExample = sampleFromSchema(
              y.requestBody.content["application/json"].schema
            );
          }
        });
      });

      const sidebar = order.map((x, i) => {
        return {
          collapsed: true,
          type: "category",
          label: x.title,
          items: x.items.map((y, ii) => {
            if (i === 0 && ii === 0) {
              y.hashId = "";
            }
            return {
              href: `/api/${y.hashId}`,
              label: y.summary,
              type: "link",
              deprecated: y.deprecated,
            };
          }),
        };
      });

      // Important: the layout component should not end with /,
      // as it conflicts with the home doc
      // Workaround fix for https://github.com/facebook/docusaurus/issues/2917
      const docsBaseRoute = normalizeUrl([baseUrl, routeBasePath]);
      const pathx = docsBaseRoute === "/" ? "" : docsBaseRoute;

      // const x = {
      //   id: "doc2",
      //   isDocsHomePage: false,
      //   title: "Document Number 2",
      //   description:
      //     "This is a link to another document. This is a link to an external page.",
      //   source: "@site/docs/doc2.md",
      //   permalink: "/docs/doc2",
      //   editUrl:
      //     "https://github.com/facebook/docusaurus/edit/master/website/docs/doc2.md",
      //   sidebar: "someSidebar",
      //   previous: {
      //     title: "Style Guide",
      //     permalink: "/docs/",
      //   },
      //   next: {
      //     title: "This is Document Number 3",
      //     permalink: "/docs/doc3",
      //   },
      // };

      const promises = order
        .map((section) => {
          return section.items.map(async (item) => {
            const openapiDataPath = await createData(
              `bloop-bleep-${item.hashId}.json`,
              JSON.stringify(item)
            );
            return {
              path: pathx + "/" + item.hashId,
              component: "@theme/ApiItem",
              exact: true,
              modules: {
                openapi: openapiDataPath,
              },
            };
          });
        })
        .flat();

      const routes = await Promise.all(promises);

      // console.log(routes);

      const permalinkToSidebar = routes.reduce((acc, item) => {
        acc[item.path] = "sidebar";
        return acc;
      }, {});

      const docsBaseMetadataPath = await createData(
        `${docuHash(normalizeUrl([docsBaseRoute, ":route"]))}.json`,
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
        component: "@theme/ApiPage", // main docs component (DocPage)
        routes, // subroute for each doc
        modules: {
          docsMetadata: docsBaseMetadataPath,
        },
      });

      // addRoute({
      //   path: normalizeUrl([baseUrl, routeBasePath]),
      //   component: "@theme/FunThing",
      //   modules: {
      //     openapi: openapiDataPath,
      //   },
      //   exact: true,
      // });

      return;

      // if (!content || Object.keys(content.docsMetadata).length === 0) {
      //   return;
      // }

      // const aliasedSource = (source: string) =>
      //   `~docs/${path.relative(dataDir, source)}`;

      // const createDocsBaseMetadata = (version?: string): DocsBaseMetadata => {
      //   const { docsSidebars, permalinkToSidebar, versionToSidebars } = content;
      //   const neededSidebars: Set<string> =
      //     versionToSidebars[version!] || new Set();

      //   return {
      //     docsSidebars: version
      //       ? pick(docsSidebars, Array.from(neededSidebars))
      //       : docsSidebars,
      //     permalinkToSidebar: version
      //       ? pickBy(permalinkToSidebar, (sidebar) =>
      //           neededSidebars.has(sidebar)
      //         )
      //       : permalinkToSidebar,
      //     version,
      //   };
      // };

      // const genRoutes = async (
      //   metadataItems: Metadata[]
      // ): Promise<RouteConfig[]> => {
      //   const routes = await Promise.all(
      //     metadataItems.map(async (metadataItem) => {
      //       await createData(
      //         // Note that this created data path must be in sync with
      //         // metadataPath provided to mdx-loader.
      //         `${docuHash(metadataItem.source)}.json`,
      //         JSON.stringify(metadataItem, null, 2)
      //       );

      //       return {
      //         path: metadataItem.permalink,
      //         component: docItemComponent,
      //         exact: true,
      //         modules: {
      //           content: metadataItem.source,
      //         },
      //       };
      //     })
      //   );

      //   return routes.sort((a, b) =>
      //     a.path > b.path ? 1 : b.path > a.path ? -1 : 0
      //   );
      // };

      // // This is the base route of the document root (for a doc given version)
      // // (/docs, /docs/next, /docs/1.0 etc...)
      // // The component applies the layout and renders the appropriate doc
      // const addBaseRoute = async (
      //   docsBaseRoute: string,
      //   docsBaseMetadata: DocsBaseMetadata,
      //   routes: RouteConfig[],
      //   priority?: number
      // ) => {
      //   const docsBaseMetadataPath = await createData(
      //     `${docuHash(normalizeUrl([docsBaseRoute, ":route"]))}.json`,
      //     JSON.stringify(docsBaseMetadata, null, 2)
      //   );

      //   // Important: the layout component should not end with /,
      //   // as it conflicts with the home doc
      //   // Workaround fix for https://github.com/facebook/docusaurus/issues/2917
      //   const path = docsBaseRoute === "/" ? "" : docsBaseRoute;

      //   addRoute({
      //     path,
      //     exact: false, // allow matching /docs/* as well
      //     component: docLayoutComponent, // main docs component (DocPage)
      //     routes, // subroute for each doc
      //     modules: {
      //       docsMetadata: aliasedSource(docsBaseMetadataPath),
      //     },
      //     priority,
      //   });
      // };

      // const routes = await genRoutes(Object.values(content.docsMetadata));
      // const docsBaseMetadata = createDocsBaseMetadata();
      // const docsBaseRoute = normalizeUrl([baseUrl, routeBasePath]);
      // return addBaseRoute(docsBaseRoute, docsBaseMetadata, routes);
    },

    async routesLoaded(routes) {
      const homeDocsRoutes = routes.filter(
        (routeConfig) => routeConfig.path === homePageDocsRoutePath
      );

      // Remove the route for docs home page if there is a page with the same path (i.e. docs).
      if (homeDocsRoutes.length > 1) {
        const docsHomePageRouteIndex = routes.findIndex(
          (route) =>
            route.component === options.docLayoutComponent &&
            route.path === homePageDocsRoutePath
        );

        delete routes[docsHomePageRouteIndex!];
      }
    },
  };
}
