#!/usr/bin/env node

/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

"use strict";

const pkg = require("../package.json");

const { program } = require("commander");

program
  .name("create-docusaurus-openapi-docs")
  .version(pkg.version)
  .arguments("[siteName]")
  .option(
    "-p, --package-manager <manager>",
    "package manager to use (yarn, npm, pnpm, bun)"
  )
  .option("-s, --skip-install", "skip dependency installation")
  .description("Create a new Docusaurus site with OpenAPI docs.")
  .action(async (siteName, options) => {
    try {
      const { init } = require("../lib/index.js");
      await init(process.cwd(), siteName, options);
    } catch (err) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program.parse(process.argv);
