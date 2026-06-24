/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// Passthrough stub for chalk (v5 is ESM-only and incompatible with Jest/ts-jest).
// Supports chained access like chalk.cyan.bold.underline("text").
const chalk = new Proxy((...args) => args.join(""), {
  get: (_, prop) => (prop === "default" ? chalk : chalk),
});

module.exports = chalk;
module.exports.default = chalk;
