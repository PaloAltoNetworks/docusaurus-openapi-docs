/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

module.exports = {
  plugins: ["cypress"],
  env: {
    "cypress/globals": true,
  },
  rules: {
    "testing-library/await-async-query": "off", // Cypress chains don't use promises
    "testing-library/prefer-screen-queries": "off", // screen queries don't make sense in the context of Cypress Testing Library

    // No Jest here
    "jest/expect-expect": "off",
    "jest/valid-expect": "off",
    "jest/valid-expect-in-promise": "off",
    "jest/no-conditional-expect": "off",
  },
};
