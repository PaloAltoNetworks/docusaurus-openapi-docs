/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { GenerateExamples, showGeneratedExample } from "./generateExamples";

jest.mock("@docusaurus/theme-common", () => ({ useThemeConfig: () => ({}) }), {
  virtual: true,
});

describe("showGeneratedExample", () => {
  it.each<[GenerateExamples, boolean, boolean]>([
    ["always", true, true],
    ["always", false, true],
    ["fallback", true, false],
    ["fallback", false, true],
    ["never", true, false],
    ["never", false, false],
  ])(
    "%s mode with a published example %s shows the sample: %s",
    (mode, hasPublishedExample, expected) => {
      expect(showGeneratedExample(mode, hasPublishedExample)).toBe(expected);
    }
  );
});
