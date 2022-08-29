/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import type { LoadContext, Plugin } from "@docusaurus/types";
import { Globby } from "@docusaurus/utils";
import chalk from "chalk";
import { render } from "mustache";

import { createApiPageMD, createInfoPageMD, createTagPageMD } from "./markdown";
import { readOpenapiFiles, processOpenapiFiles } from "./openapi";
import { OptionsSchema } from "./options";
import generateSidebarSlice from "./sidebars";
import type { PluginOptions, LoadedContent, APIOptions } from "./types";

export function isURL(str: string): boolean {
  return /^(https?:)\/\//m.test(str);
}

export function getDocsData(
  dataArray: any[],
  filter: string
): Object | undefined {
  // eslint-disable-next-line array-callback-return
  const filteredData = dataArray.filter((data) => {
    if (data[0] === filter) {
      return data[1];
    }

    // Search plugin-content-docs instances
    if (data[0] === "@docusaurus/plugin-content-docs") {
      const pluginId = data[1].id ? data[1].id : "default";
      if (pluginId === filter) {
        return data[1];
      }
    }
  })[0];
  if (filteredData) {
    // Search presets, e.g. "classic"
    if (filteredData[0] === filter) {
      return filteredData[1].docs;
    }

    // Search plugin-content-docs instances
    if (filteredData[0] === "@docusaurus/plugin-content-docs") {
      const pluginId = filteredData[1].id ? filteredData[1].id : "default";
      if (pluginId === filter) {
        return filteredData[1];
      }
    }
  }
  return;
}

export default function pluginOpenAPIDocs(
  context: LoadContext,
  options: PluginOptions
): Plugin<LoadedContent> {
  const { config, docsPluginId } = options;
  const { siteDir, siteConfig } = context;

  // Get routeBasePath and path from plugin-content-docs or preset
  const presets: any = siteConfig.presets;
  const plugins: any = siteConfig.plugins;
  const presetsPlugins = presets.concat(plugins);
  const docData: any = getDocsData(presetsPlugins, docsPluginId);
  const docRouteBasePath = docData ? docData.routeBasePath : undefined;
  const docPath = docData ? (docData.path ? docData.path : "docs") : undefined;

  async function generateApiDocs(options: APIOptions) {
    let { specPath, outputDir, template, sidebarOptions } = options;

    const contentPath = isURL(specPath)
      ? specPath
      : path.resolve(siteDir, specPath);

    try {
      const openapiFiles = await readOpenapiFiles(contentPath, options);
      const [loadedApi, tags] = await processOpenapiFiles(
        openapiFiles,
        sidebarOptions!
      );
      if (!fs.existsSync(outputDir)) {
        try {
          fs.mkdirSync(outputDir, { recursive: true });
          console.log(chalk.green(`Successfully created "${outputDir}"`));
        } catch (err) {
          console.error(
            chalk.red(`Failed to create "${outputDir}"`),
            chalk.yellow(err)
          );
        }
      }

      // TODO: figure out better way to set default
      if (Object.keys(sidebarOptions ?? {}).length > 0) {
        const sidebarSlice = generateSidebarSlice(
          sidebarOptions!,
          options,
          loadedApi,
          tags,
          docPath
        );

        const sidebarSliceTemplate = template
          ? fs.readFileSync(template).toString()
          : `module.exports = {{{slice}}};`;

        const view = render(sidebarSliceTemplate, {
          slice: JSON.stringify(sidebarSlice),
        });

        if (!fs.existsSync(`${outputDir}/sidebar.js`)) {
          try {
            fs.writeFileSync(`${outputDir}/sidebar.js`, view, "utf8");
            console.log(
              chalk.green(`Successfully created "${outputDir}/sidebar.js"`)
            );
          } catch (err) {
            console.error(
              chalk.red(`Failed to write "${outputDir}/sidebar.js"`),
              chalk.yellow(err)
            );
          }
        }
      }

      const mdTemplate = template
        ? fs.readFileSync(template).toString()
        : `---
id: {{{id}}}
{{^api}}
sidebar_label: Introduction
{{/api}}
{{#api}}
sidebar_label: {{{title}}}
{{/api}}
{{^api}}
sidebar_position: 0
{{/api}}
hide_title: true
{{#api}}
hide_table_of_contents: true
{{/api}}
{{#json}}
api: {{{json}}}
{{/json}}
{{#api.method}}
sidebar_class_name: "{{{api.method}}} api-method"
{{/api.method}}
{{#infoPath}}
info_path: {{{infoPath}}}
{{/infoPath}}
---

{{{markdown}}}
      `;

      const infoMdTemplate = template
        ? fs.readFileSync(template).toString()
        : `---
id: {{{id}}}
sidebar_label: {{{title}}}
hide_title: true
---

{{{markdown}}}

\`\`\`mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
\`\`\`
      `;

      const tagMdTemplate = template
        ? fs.readFileSync(template).toString()
        : `---
id: {{{id}}}
title: {{{description}}}
description: {{{description}}}
---

{{{markdown}}}

\`\`\`mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
\`\`\`
      `;

      loadedApi.map(async (item) => {
        const markdown =
          item.type === "api"
            ? createApiPageMD(item)
            : item.type === "info"
            ? createInfoPageMD(item)
            : createTagPageMD(item);
        item.markdown = markdown;
        if (item.type === "api") {
          item.json = JSON.stringify(item.api);
          let infoBasePath = `${outputDir}/${item.infoId}`;
          if (docRouteBasePath) {
            infoBasePath = `${docRouteBasePath}/${outputDir
              .split(docPath!)[1]
              .replace(/^\/+/g, "")}/${item.infoId}`.replace(/^\/+/g, "");
          }
          if (item.infoId) item.infoPath = infoBasePath;
        }

        const view = render(mdTemplate, item);
        const utils = render(infoMdTemplate, item);
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const tagUtils = render(tagMdTemplate, item);

        if (item.type === "api") {
          if (!fs.existsSync(`${outputDir}/${item.id}.api.mdx`)) {
            try {
              fs.writeFileSync(`${outputDir}/${item.id}.api.mdx`, view, "utf8");
              console.log(
                chalk.green(
                  `Successfully created "${outputDir}/${item.id}.api.mdx"`
                )
              );
            } catch (err) {
              console.error(
                chalk.red(`Failed to write "${outputDir}/${item.id}.api.mdx"`),
                chalk.yellow(err)
              );
            }
          }
        }

        // TODO: determine if we actually want/need this
        if (item.type === "info") {
          if (!fs.existsSync(`${outputDir}/${item.id}.info.mdx`)) {
            try {
              sidebarOptions?.categoryLinkSource === "info" // Only use utils template if set to "info"
                ? fs.writeFileSync(
                    `${outputDir}/${item.id}.info.mdx`,
                    utils,
                    "utf8"
                  )
                : fs.writeFileSync(
                    `${outputDir}/${item.id}.info.mdx`,
                    view,
                    "utf8"
                  );
              console.log(
                chalk.green(
                  `Successfully created "${outputDir}/${item.id}.info.mdx"`
                )
              );
            } catch (err) {
              console.error(
                chalk.red(`Failed to write "${outputDir}/${item.id}.info.mdx"`),
                chalk.yellow(err)
              );
            }
          }
        }

        if (item.type === "tag") {
          if (!fs.existsSync(`${outputDir}/${item.id}.tag.mdx`)) {
            try {
              fs.writeFileSync(
                `${outputDir}/${item.id}.tag.mdx`,
                tagUtils,
                "utf8"
              );
              console.log(
                chalk.green(
                  `Successfully created "${outputDir}/${item.id}.tag.mdx"`
                )
              );
            } catch (err) {
              console.error(
                chalk.red(`Failed to write "${outputDir}/${item.id}.tag.mdx"`),
                chalk.yellow(err)
              );
            }
          }
        }
        return;
      });

      return;
    } catch (e) {
      console.error(chalk.red(`Loading of api failed for "${contentPath}"`));
      throw e;
    }
  }

  async function cleanApiDocs(options: APIOptions) {
    const { outputDir } = options;
    const apiDir = path.join(siteDir, outputDir);
    const apiMdxFiles = await Globby(["*.api.mdx", "*.info.mdx", "*.tag.mdx"], {
      cwd: path.resolve(apiDir),
      deep: 1,
    });
    const sidebarFile = await Globby(["sidebar.js"], {
      cwd: path.resolve(apiDir),
      deep: 1,
    });
    apiMdxFiles.map((mdx) =>
      fs.unlink(`${apiDir}/${mdx}`, (err) => {
        if (err) {
          console.error(
            chalk.red(`Cleanup failed for "${apiDir}/${mdx}"`),
            chalk.yellow(err)
          );
        } else {
          console.log(chalk.green(`Cleanup succeeded for "${apiDir}/${mdx}"`));
        }
      })
    );

    sidebarFile.map((sidebar) =>
      fs.unlink(`${apiDir}/${sidebar}`, (err) => {
        if (err) {
          console.error(
            chalk.red(`Cleanup failed for "${apiDir}/${sidebar}"`),
            chalk.yellow(err)
          );
        } else {
          console.log(
            chalk.green(`Cleanup succeeded for "${apiDir}/${sidebar}"`)
          );
        }
      })
    );
  }

  async function generateVersions(versions: object, outputDir: string) {
    let versionsArray = [] as object[];
    for (const [version, metadata] of Object.entries(versions)) {
      versionsArray.push({
        version: version,
        label: metadata.label,
        baseUrl: metadata.baseUrl,
      });
    }

    const versionsJson = JSON.stringify(versionsArray, null, 2);
    try {
      fs.writeFileSync(`${outputDir}/versions.json`, versionsJson, "utf8");
      console.log(
        chalk.green(`Successfully created "${outputDir}/versions.json"`)
      );
    } catch (err) {
      console.error(
        chalk.red(`Failed to write "${outputDir}/versions.json"`),
        chalk.yellow(err)
      );
    }
  }

  async function cleanVersions(outputDir: string) {
    if (fs.existsSync(`${outputDir}/versions.json`)) {
      fs.unlink(`${outputDir}/versions.json`, (err) => {
        if (err) {
          console.error(
            chalk.red(`Cleanup failed for "${outputDir}/versions.json"`),
            chalk.yellow(err)
          );
        } else {
          console.log(
            chalk.green(`Cleanup succeeded for "${outputDir}/versions.json"`)
          );
        }
      });
    }
  }

  return {
    name: `docusaurus-plugin-openapi-docs`,

    extendCli(cli): void {
      cli
        .command(`gen-api-docs`)
        .description(
          `Generates OpenAPI docs in MDX file format and sidebar.js (if enabled).`
        )
        .usage("<id>")
        .arguments("<id>")
        .action(async (command, instance, args) => {
          if (!args || command !== "gen-api-docs") {
            return;
          }
          const id = args[0];
          if (id === "all") {
            if (config[id]) {
              console.error(
                chalk.red(
                  "Can't use id 'all' for OpenAPI docs configuration key."
                )
              );
            } else {
              Object.keys(config).forEach(async function (key) {
                await generateApiDocs(config[key]);
              });
            }
          } else if (!config[id]) {
            console.error(
              chalk.red(`ID '${id}' does not exist in OpenAPI docs config.`)
            );
          } else {
            await generateApiDocs(config[id]);
          }
        })
        .parseAsync();

      cli
        .command(`gen-api-docs:version`)
        .description(
          `Generates versioned OpenAPI docs in MDX file format, versions.js and sidebar.js (if enabled).`
        )
        .usage("<id:version>")
        .arguments("<id:version>")
        .action(async (command, instance, args) => {
          if (!args || command !== "gen-api-docs:version") {
            return;
          }
          const id = args[0];
          const [parentId, versionId] = id.split(":");
          const parentConfig = Object.assign({}, config[parentId]);

          const version = parentConfig.version as string;
          const label = parentConfig.label as string;
          const baseUrl = parentConfig.baseUrl as string;

          let parentVersion = {} as any;
          parentVersion[version] = { label: label, baseUrl: baseUrl };

          const { versions } = config[parentId] as any;
          const mergedVersions = Object.assign(parentVersion, versions);

          // Prepare for merge
          delete parentConfig.versions;
          delete parentConfig.version;
          delete parentConfig.label;
          delete parentConfig.baseUrl;

          // TODO: handle when no versions are defined by version command is passed
          if (versionId === "all") {
            if (versions[id]) {
              console.error(
                chalk.red(
                  "Can't use id 'all' for OpenAPI docs versions configuration key."
                )
              );
            } else {
              await generateVersions(mergedVersions, parentConfig.outputDir);
              Object.keys(versions).forEach(async (key) => {
                const versionConfig = versions[key];
                const mergedConfig = {
                  ...parentConfig,
                  ...versionConfig,
                };
                await generateApiDocs(mergedConfig);
              });
            }
          } else if (!versions[versionId]) {
            console.error(
              chalk.red(
                `Version ID '${versionId}' does not exist in OpenAPI docs versions config.`
              )
            );
          } else {
            const versionConfig = versions[versionId];
            const mergedConfig = {
              ...parentConfig,
              ...versionConfig,
            };
            await generateVersions(mergedVersions, parentConfig.outputDir);
            await generateApiDocs(mergedConfig);
          }
        })
        .parseAsync();

      cli
        .command(`clean-api-docs`)
        .description(
          `Clears the generated OpenAPI docs MDX files and sidebar.js (if enabled).`
        )
        .usage("<id>")
        .arguments("<id>")
        .action(async (command, instance, args) => {
          if (!args || command !== "clean-api-docs") {
            return;
          }
          const id = args[0];
          if (id === "all") {
            if (config[id]) {
              console.error(
                chalk.red(
                  "Can't use id 'all' for OpenAPI docs configuration key."
                )
              );
            } else {
              Object.keys(config).forEach(async function (key) {
                await cleanApiDocs(config[key]);
              });
            }
          } else {
            await cleanApiDocs(config[id]);
          }
        })
        .parseAsync();

      cli
        .command(`clean-api-docs:version`)
        .description(
          `Clears the versioned, generated OpenAPI docs MDX files, versions.json and sidebar.js (if enabled).`
        )
        .usage("<id:version>")
        .arguments("<id:version>")
        .action(async (command, instance, args) => {
          if (!args || command !== "clean-api-docs:version") {
            return;
          }
          const id = args[0];
          const [parentId, versionId] = id.split(":");
          const { versions } = config[parentId] as any;

          const parentConfig = Object.assign({}, config[parentId]);
          delete parentConfig.versions;

          if (versionId === "all") {
            if (versions[id]) {
              chalk.red(
                "Can't use id 'all' for OpenAPI docs versions configuration key."
              );
            } else {
              await cleanVersions(parentConfig.outputDir);
              Object.keys(versions).forEach(async (key) => {
                const versionConfig = versions[key];
                const mergedConfig = {
                  ...parentConfig,
                  ...versionConfig,
                };
                await cleanApiDocs(mergedConfig);
              });
            }
          } else {
            const versionConfig = versions[versionId];
            const mergedConfig = {
              ...parentConfig,
              ...versionConfig,
            };
            await cleanApiDocs(mergedConfig);
          }
        })
        .parseAsync();
    },
  };
}

pluginOpenAPIDocs.validateOptions = ({ options, validate }: any) => {
  const validatedOptions = validate(OptionsSchema, options);
  return validatedOptions;
};
