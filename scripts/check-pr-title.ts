#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { getOutput } from "./utils/get-output";
import { version } from "../lerna.json";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

function versions() {
  return getOutput(`git tag --list 'v*'`).split("\n");
}

function main() {
  const actualTitle = process.argv[2];
  const expectedTitle = `Prepare release v${version}`;

  if (!versions().includes(`v${version}`)) {
    if (actualTitle !== expectedTitle) {
      console.log(`\x1b[31mPR title should be: "${expectedTitle}"\x1b[0m`);
      process.exit(1);
    }
  }
}

main();
