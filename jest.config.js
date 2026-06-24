/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: [
    "<rootDir>/packages/docusaurus-plugin-openapi-docs/src",
    "<rootDir>/packages/docusaurus-theme-openapi-docs/src",
  ],
  moduleNameMapper: {
    "^chalk$": "<rootDir>/__mocks__/chalk.js",
    "^@apidevtools/json-schema-ref-parser$":
      "<rootDir>/__mocks__/@apidevtools/json-schema-ref-parser.js",
    "^@redocly/openapi-core$": "<rootDir>/__mocks__/@redocly/openapi-core.js",
    "^neotraverse/legacy$":
      "<rootDir>/node_modules/neotraverse/dist/legacy/legacy.cjs",
  },
};
