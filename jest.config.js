/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: [
    "<rootDir>/packages/docusaurus-plugin-openapi/src",
    "<rootDir>/packages/docusaurus-preset-openapi/src",
    "<rootDir>/packages/docusaurus-theme-openapi/src",
  ],
};
