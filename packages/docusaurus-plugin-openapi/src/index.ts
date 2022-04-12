/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import type { LoadContext, Plugin } from "@docusaurus/types";
import { DEFAULT_PLUGIN_ID } from "@docusaurus/utils";
import chalk from "chalk";
import { render } from "mustache";

import { createApiPageMD, createInfoPageMD } from "./markdown";
import { readOpenapiFiles, processOpenapiFiles } from "./openapi";
import type { PluginOptions, LoadedContent } from "./types";

export default function pluginOpenAPI(
  context: LoadContext,
  options: PluginOptions
): Plugin<LoadedContent> {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID; // TODO: determine if this is required

  const contentPath = path.resolve(context.siteDir, options.path);

  return {
    name: "docusaurus-plugin-openapi",

    getPathsToWatch() {
      // TODO: determine if options.outputDir should be in paths to watch
      return [contentPath];
    },

    async loadContent() {
      try {
        const openapiFiles = await readOpenapiFiles(contentPath, {});
        const loadedApi = await processOpenapiFiles(openapiFiles);
        return { loadedApi };
      } catch (e) {
        console.error(chalk.red(`Loading of api failed for "${contentPath}"`));
        throw e;
      }
    },

    async contentLoaded({ content }) {
      const { loadedApi } = content;
      const {
        showExecuteButton,
        showManualAuthentication,
        outputDir,
        template,
      } = options;

      // TODO: Address race condition leading to "Module not found"
      // TODO: Determine if mdx cleanup should be separate yarn script
      //
      // const mdFiles = await Globby(["*.mdx"], {
      //   cwd: path.resolve(outputDir),
      // });
      // mdFiles.map((mdx) =>
      //   fs.unlink(`${outputDir}/${mdx}`, (err) => {
      //     if (err) {
      //       console.error(
      //         chalk.red(`Cleanup failed for "${outputDir}/${mdx}"`)
      //       );
      //     } else {
      //       console.log(
      //         chalk.green(`Cleanup succeeded for "${outputDir}/${mdx}"`)
      //       );
      //     }
      //   })
      // );

      const mdTemplate = template
        ? fs.readFileSync(template).toString()
        : `---
id: {{{id}}}
sidebar_label: {{{title}}}
hide_title: true
api: {{{json}}}
---

{{{markdown}}}
      `;

      loadedApi.map(async (item) => {
        // Statically set custom plugin options
        item.showExecuteButton = showExecuteButton;
        item.showManualAuthentication = showManualAuthentication;

        const markdown =
          item.type === "api" ? createApiPageMD(item) : createInfoPageMD(item);
        item.markdown = markdown;
        if (item.type === "api") {
          item.json = JSON.stringify(item.api);
        }
        const view = render(mdTemplate, item);

        if (item.type === "api") {
          if (!fs.existsSync(`${outputDir}/${item.id}.mdx`)) {
            try {
              fs.writeFileSync(`${outputDir}/${item.id}.mdx`, view, "utf8");
              console.log(
                chalk.green(
                  `Successfully created "${outputDir}/${item.id}.mdx"`
                )
              );
            } catch {
              console.error(
                chalk.red(`Failed to write "${outputDir}/${item.id}.mdx"`)
              );
            }
          }
        }

        // TODO: determine if we actually want/need this
        if (item.type === "info") {
          if (!fs.existsSync(`${outputDir}/index.md`)) {
            try {
              fs.writeFileSync(`${outputDir}/index.md`, view, "utf8");
              console.log(
                chalk.green(`Successfully created "${outputDir}/index.md"`)
              );
            } catch {
              console.error(
                chalk.red(`Failed to write "${outputDir}/index.md"`)
              );
            }
          }
        }

        return;
      });

      return;
    },
  };
}
