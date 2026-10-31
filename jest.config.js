/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

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
        },
      },
    },
  },
  roots: [
    "<rootDir>/packages/docusaurus-plugin-openapi-docs/src",
    "<rootDir>/packages/docusaurus-theme-openapi-docs/src",
  ],
  moduleNameMapper: {
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
const requestTest =
  "<rootDir>/packages/docusaurus-theme-openapi-docs/src/theme/ApiExplorer/Request/makeRequest.test.ts";
const requestBodyTest =
  "<rootDir>/packages/docusaurus-theme-openapi-docs/src/theme/ApiExplorer/buildPostmanRequest.consumer.test.ts";
const samplerModule =
  "docusaurus-plugin-openapi-docs/lib/openapi/createSchemaExample";
const samplerSource =
  "packages/docusaurus-plugin-openapi-docs/src/openapi/createSchemaExample.ts";

module.exports = {
  projects: [
    {
      ...config,
      displayName: "default",
      testPathIgnorePatterns: [
        "/node_modules/",
        bodyExamplesTest.replace(/\./g, "\\.") + "$",
        requestTest.replace(/\./g, "\\.") + "$",
        requestBodyTest.replace(/\./g, "\\.") + "$",
      ],
    },
    {
      ...config,
      displayName: "request",
      testEnvironment: "jsdom",
      testMatch: [requestTest],
    },
    {
      ...config,
      displayName: "request-body",
      testEnvironment: "jsdom",
      testMatch: [requestBodyTest],
    },
    {
      ...config,
      displayName: "body-examples",
      testEnvironment: "jsdom",
      testMatch: [bodyExamplesTest],
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
    },
  ],
};
