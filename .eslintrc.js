/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

const tsExtensions = [".ts", ".tsx", ".d.ts"];
const allExtensions = [...tsExtensions, ".js", ".jsx"];

module.exports = {
  ignorePatterns: ["demo/**"],
  root: true,
  extends: [
    "react-app",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:testing-library/react",
    "plugin:jest-dom/recommended",
  ],
  plugins: ["import", "header"],
  rules: {
    "header/header": [
      "warn",
      "block",
      [
        " ============================================================================",
        " * Copyright (c) Cloud Annotations",
        " *",
        " * This source code is licensed under the MIT license found in the",
        " * LICENSE file in the root directory of this source tree.",
        " * ========================================================================== ",
      ],
      2,
    ],
    "import/newline-after-import": ["warn", { count: 1 }],
    "import/no-extraneous-dependencies": [
      "warn",
      {
        devDependencies: false,
        optionalDependencies: false,
        peerDependencies: true,
        bundledDependencies: true,
      },
    ],
    "import/order": [
      "warn",
      {
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        "newlines-between": "always",
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling", "index"],
          "object",
        ],
        pathGroups: [
          {
            pattern: "react?(-dom)",
            group: "external",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
      },
    ],
  },
  overrides: [
    {
      files: ["**/scripts/**", "cypress/**"],
      rules: {
        "import/no-extraneous-dependencies": [
          "warn",
          {
            devDependencies: true,
            optionalDependencies: false,
            peerDependencies: true,
            bundledDependencies: true,
          },
        ],
      },
    },
  ],
  settings: {
    "import/extensions": allExtensions,
    "import/external-module-folders": ["node_modules", "node_modules/@types"],
    "import/parsers": {
      "@typescript-eslint/parser": tsExtensions,
    },
    "import/resolver": {
      node: {
        extensions: allExtensions,
      },
    },
  },
};
