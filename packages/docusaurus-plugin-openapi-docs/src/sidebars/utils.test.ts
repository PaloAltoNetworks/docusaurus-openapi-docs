/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { getBasePathFromOutput } from "./utils";

describe("getBasePathFromOutput", () => {
  it.each([
    ["docs/petstore", "docs", "petstore"],
    ["docs/test/docspace", "docs", "test/docspace"],
    ["docs/api/docs-v2", "docs", "api/docs-v2"],
    ["docs-api/petstore", "docs-api", "petstore"],
    ["docs", "docs", ""],
    ["api/petstore", "docs", "petstore"],
    ["docs/petstore", undefined, "petstore"],
  ])(
    "returns the base path for %s with docPath %s",
    (output, doc, expected) => {
      expect(getBasePathFromOutput(output, doc)).toBe(expected);
    }
  );
});
