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
import generateSidebarSlice from "./sidebars";
import type { PluginOptions, LoadedContent, APIOptions } from "./types";

export default function pluginOpenAPI(
  context: LoadContext,
  options: PluginOptions
): Plugin<LoadedContent> {
  let { config } = options;
  let { siteDir } = context;

  // Generate md/mdx before loadContent() life cycle method
  async function generateApiDocs(options: APIOptions) {
    let {
      specPath,
      showExecuteButton,
      showManualAuthentication,
      outputDir,
      template,
      sidebarOptions,
    } = options;

    const contentPath = path.resolve(siteDir, specPath);
    if (!fs.existsSync(`${outputDir}/.gitinclude`)) {
      try {
        fs.writeFileSync(`${outputDir}/.gitinclude`, "");
        console.log(
          chalk.green(`Successfully created "${outputDir}/.gitinclude"`)
        );
      } catch (err) {
        console.error(
          chalk.red(`Failed to write "${outputDir}/.gitinclude" | ${err}`)
        );
      }
    }
    try {
      const openapiFiles = await readOpenapiFiles(contentPath, {});
      const loadedApi = await processOpenapiFiles(openapiFiles);

      if (!fs.existsSync(`${outputDir}/.gitinclude`)) {
        try {
          fs.writeFileSync(`${outputDir}/.gitinclude`, "");
          console.log(
            chalk.green(`Successfully created "${outputDir}/.gitinclude"`)
          );
        } catch (err) {
          console.error(
            chalk.red(`Failed to write "${outputDir}/.gitinclude" | ${err}`)
          );
        }
      }

      // TODO: figure out better way to set default
      if (Object.keys(sidebarOptions ?? {}).length > 0) {
        const sidebarSlice = generateSidebarSlice(
          sidebarOptions!, // TODO: find a better way to handle null
          options,
          loadedApi
        );

        const sidebarSliceTemplate = template
          ? fs.readFileSync(template).toString()
          : `module.exports = {
  sidebar: {{{slice}}},
};
      `;

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
              chalk.red(`Failed to write "${outputDir}/sidebar.js" | ${err}`)
            );
          }
        }
      }

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
                chalk.red(
                  `Failed to write "${outputDir}/${item.id}.api.mdx" | ${err}`
                )
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
            } catch (err) {
              console.error(
                chalk.red(`Failed to write "${outputDir}/index.mdx" | ${err}`)
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
    const apiDir = path.join(siteDir, options.outputDir);
    const files = fs.readdirSync(apiDir);
    files.forEach((file) => {
      if (path.extname(file) === ".mdx") {
        fs.unlinkSync(path.join(apiDir, file));
        console.log(chalk.blue(`Removed ${file}`));
      } else if (file === "sidebar.js") {
        fs.unlinkSync(path.join(apiDir, file));
        console.log(chalk.blue(`Removed ${file}`));
      }
    });
  }

  return {
    name: `docusaurus-plugin-openapi`,

    extendCli(cli): void {
      cli
        .command(`gen-api-docs`)
        .description(`Generates API Docs mdx and sidebars.`)
        .usage("[options] <id in docusaurus.config.js>")
        .arguments("<id>")
        .parse(process.argv)
        .action(async (id) => {
          if (id === "all") {
            Object.keys(config).forEach(async function (key) {
              await generateApiDocs(config[key]);
            });
          } else {
            console.log(config[id]);
            await generateApiDocs(config[id]);
          }
        });

      cli
        .command(`clean-api-docs`)
        .description(`Clears the Generated API Docs mdx and sidebars.`)
        .usage("[options] <id in docusaurus.config.js>")
        .arguments("<id>")
        .parse(process.argv)
        .action(async (id) => {
          if (id === "all") {
            Object.keys(config).forEach(async function (key) {
              await cleanApiDocs(config[key]);
            });
          } else {
            console.log(config[id]);
            await cleanApiDocs(config[id]);
          }
        });
    },
  };
}
