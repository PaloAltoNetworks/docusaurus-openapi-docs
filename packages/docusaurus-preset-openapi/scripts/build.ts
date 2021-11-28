#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import concurrently, { CommandObj } from "concurrently";

const watch = process.argv.includes("--watch");

const watchFlag = watch ? "--watch" : "";

const commands: CommandObj[] = [
  {
    command: `tsc --preserveWatchOutput ${watchFlag}`,
    name: "tsc",
    prefixColor: "yellow",
  },
  {
    // Copy all files BUT *.ts and *.tsx (which will be turned into JS by TS).
    // Notice that we include *.d.ts, they're perfectly valid to copy.
    command: `cpx 'src/**/{*.d.ts,!(*.ts|*.tsx)}' dist ${watchFlag}`,
    name: "cpx",
    prefixColor: "yellow",
  },
];

concurrently(commands, {
  killOthers: ["failure"],
  prefix: "[{time} {name}]",
  timestampFormat: "mm:ss.S",
}).catch(() => {
  process.exit(1);
});
