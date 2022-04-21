/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import type { LoadContext, Plugin } from "@docusaurus/types";
import chalk from "chalk";
import { render } from "mustache";

import { createApiPageMD, createInfoPageMD } from "./markdown";
import { readOpenapiFiles, processOpenapiFiles } from "./openapi";
import type { PluginOptions, LoadedContent } from "./types";

export default function pluginOpenAPI(
  context: LoadContext,
  options: PluginOptions
): Plugin<LoadedContent> {
  const contentPath = path.resolve(context.siteDir, options.path);

  // Generate md/mdx before loadContent() life cycle method
  async function beforeLoadContent() {
    try {
      const openapiFiles = await readOpenapiFiles(contentPath, {});
      const loadedApi = await processOpenapiFiles(openapiFiles);
      const { outputDir, template } = options;

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
---

{{{markdown}}}
      `;

      loadedApi.map(async (item) => {
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
          if (!fs.existsSync(`${outputDir}/index.mdx`)) {
            try {
              fs.writeFileSync(`${outputDir}/index.mdx`, view, "utf8");
              console.log(
                chalk.green(`Successfully created "${outputDir}/index.mdx"`)
              );
            } catch {
              console.error(
                chalk.red(`Failed to write "${outputDir}/index.mdx"`)
              );
            }
          }
        }
        return;
      });
      return loadedApi;
    } catch (e) {
      console.error(chalk.red(`Loading of api failed for "${contentPath}"`));
      throw e;
    }
  }

  beforeLoadContent();

  return {
    name: "docusaurus-plugin-openapi",

    getPathsToWatch() {
      return [contentPath];
    },
  };
}
