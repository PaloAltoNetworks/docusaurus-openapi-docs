/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

const mediaTypeModule = "docusaurus-plugin-openapi-docs/lib/utils/mediaType";
const mediaTypeSource =
  "packages/docusaurus-plugin-openapi-docs/src/utils/mediaType.ts";

const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: {
        target: "ES2019",
        module: "commonjs",
        resolveJsonModule: true,
        esModuleInterop: true,
        jsx: "react",
        baseUrl: __dirname,
        paths: {
          "@theme/*": ["packages/docusaurus-theme-openapi-docs/src/theme/*"],
          [mediaTypeModule]: [mediaTypeSource],
        },
      },
    },
  },
  roots: [
    "<rootDir>/packages/docusaurus-plugin-openapi-docs/src",
    "<rootDir>/packages/docusaurus-theme-openapi-docs/src",
  ],
  moduleNameMapper: {
    [`^${mediaTypeModule}$`]: `<rootDir>/${mediaTypeSource}`,
    "^@theme/(.*)$":
      "<rootDir>/packages/docusaurus-theme-openapi-docs/src/theme/$1",
    "^chalk$": "<rootDir>/__mocks__/chalk.js",
    "^@apidevtools/json-schema-ref-parser$":
      "<rootDir>/__mocks__/@apidevtools/json-schema-ref-parser.js",
    "^@redocly/openapi-core$": "<rootDir>/__mocks__/@redocly/openapi-core.js",
    "^neotraverse/legacy$":
      "<rootDir>/node_modules/neotraverse/dist/legacy/legacy.cjs",
  },
};

const bodyExamplesTest =
  "<rootDir>/packages/docusaurus-theme-openapi-docs/src/theme/ApiExplorer/Body/jsonExamples.test.ts";
const bodyContentTypesTest =
  "<rootDir>/packages/docusaurus-theme-openapi-docs/src/theme/ApiExplorer/Body/index.test.ts";
const samplerModule =
  "docusaurus-plugin-openapi-docs/lib/openapi/createSchemaExample";
const samplerSource =
  "packages/docusaurus-plugin-openapi-docs/src/openapi/createSchemaExample.ts";

const bodyConfig = {
  ...config,
  globals: {
    "ts-jest": {
      ...config.globals["ts-jest"],
      tsconfig: {
        ...config.globals["ts-jest"].tsconfig,
        allowJs: true,
        paths: {
          ...config.globals["ts-jest"].tsconfig.paths,
          [samplerModule]: [samplerSource],
        },
      },
    },
  },
  transform: {
    "[/\\\\]ApiExplorer[/\\\\]Body[/\\\\]json2xml\\.js$": "ts-jest",
  },
  moduleNameMapper: {
    ...config.moduleNameMapper,
    [`^${samplerModule}$`]: `<rootDir>/${samplerSource}`,
  },
};

module.exports = {
  projects: [
    {
      ...config,
      displayName: "default",
      testPathIgnorePatterns: [
        "/node_modules/",
        bodyExamplesTest.replace(/\./g, "\\.") + "$",
        bodyContentTypesTest.replace(/\./g, "\\.") + "$",
      ],
    },
    {
      ...bodyConfig,
      displayName: "body-examples",
      testEnvironment: "jsdom",
      testMatch: [bodyExamplesTest],
    },
    {
      ...bodyConfig,
      displayName: "body-content-types",
      testMatch: [bodyContentTypesTest],
    },
  ],
};
