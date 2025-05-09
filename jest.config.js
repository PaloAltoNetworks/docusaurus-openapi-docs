/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

module.exports = {
  setupFilesAfterEnv: [
    "<rootDir>/packages/docusaurus-theme-openapi-docs/jest.setup.js",
  ],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: [
    "<rootDir>/packages/docusaurus-plugin-openapi-docs/src",
    "<rootDir>/packages/docusaurus-theme-openapi-docs/src",
  ],
  moduleNameMapper: {
    "^@docusaurus/useBaseUrl$": "<rootDir>/__mocks__/useBaseUrl.js",
    "^@theme/ApiTabs$": "<rootDir>/__mocks__/ApiTabs.js",
    "^@theme/Details$": "<rootDir>/__mocks__/Details.js",
    "^@theme/Markdown$": "<rootDir>/__mocks__/Markdown.js",
    "^@theme/ResponseHeaders$": "<rootDir>/__mocks__/ResponseHeaders.js",
    "^@theme/ResponseSchema$": "<rootDir>/__mocks__/ResponseSchema.js",
    "^@theme/TabItem$": "<rootDir>/__mocks__/TabItem.js",
    "^@theme/ThemedImage$": "<rootDir>/__mocks__/ThemedImage.js",

    "^@theme/(.*)$":
      "<rootDir>/packages/docusaurus-theme-openapi-docs/src/theme/$1",
    "^neotraverse/legacy$":
      "<rootDir>/node_modules/neotraverse/dist/legacy/legacy.cjs",
  },
};
