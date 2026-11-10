/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { isOperationName } from "./openapi";

describe("isOperationName", () => {
  it.each(["get", "query", "trace", "$ref"])("accepts %s", (key) => {
    expect(isOperationName(key)).toBe(true);
  });

  it("rejects path item fields that hold no operation", () => {
    expect(isOperationName("parameters")).toBe(false);
  });
});
