/* ============================================================================
 * Copyright (c) Cloud Annotations
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
  // Remove later
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

    try {
      const openapiFiles = await readOpenapiFiles(contentPath, {});
      const loadedApi = await processOpenapiFiles(openapiFiles);

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
                chalk.red(`Failed to write "${outputDir}/${item.id}.api.mdx"`),
                chalk.yellow(err)
              );
            }
          }
        }

        // TODO: determine if we actually want/need this
        if (item.type === "info") {
          if (!fs.existsSync(`${outputDir}/index.api.mdx`)) {
            try {
              fs.writeFileSync(`${outputDir}/index.api.mdx`, view, "utf8");
              console.log(
                chalk.green(`Successfully created "${outputDir}/index.api.mdx"`)
              );
            } catch (err) {
              console.error(
                chalk.red(`Failed to write "${outputDir}/index.api.mdx"`),
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
    const apiMdxFiles = await Globby(["*.api.mdx"], {
      cwd: path.resolve(apiDir),
    });
    const sidebarFile = await Globby(["sidebar.js"], {
      cwd: path.resolve(apiDir),
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

  return {
    name: `docusaurus-plugin-openapi`,

    extendCli(cli): void {
      cli
        .command(`gen-api-docs`)
        .description(`Generates API Docs mdx and sidebars.`)
        .usage(
          "[options] <id key value in plugin config within docusaurus.config.js>"
        )
        .arguments("<id>")
        .action(async (id) => {
          if (id === "all") {
            if (config[id]) {
              console.error(chalk.red("Can't use id 'all' for API Doc."));
            } else {
              Object.keys(config).forEach(async function (key) {
                await generateApiDocs(config[key]);
              });
            }
          } else if (!config[id]) {
            console.error(
              chalk.red(`ID ${id} does not exist in openapi-plugin config`)
            );
          } else {
            await generateApiDocs(config[id]);
          }
        });

      cli
        .command(`clean-api-docs`)
        .description(`Clears the Generated API Docs mdx and sidebars.`)
        .usage(
          "[options] <id key value in plugin config within docusaurus.config.js>"
        )
        .arguments("<id>")
        .action(async (id) => {
          if (id === "all") {
            if (config[id]) {
              console.error(chalk.red("Can't use id 'all' for API Doc."));
            } else {
              Object.keys(config).forEach(async function (key) {
                await cleanApiDocs(config[key]);
              });
            }
          } else {
            await cleanApiDocs(config[id]);
          }
        });
    },
  };
}
