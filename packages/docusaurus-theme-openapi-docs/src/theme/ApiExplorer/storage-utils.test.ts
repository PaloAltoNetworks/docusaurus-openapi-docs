/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { hashArray } from "./storage-utils";

// Values produced by the previous crypto-js implementation. They are storage
// keys for persisted auth, so they must not change.
it.each([
  [["api_key"], "686ba327f1c72d5e3e0826a3fdb7182bf86aab78"],
  [["bearerAuth", "api_key"], "2f41b949399aa95c4aec28af2badea1e31646e0f"],
  [["clé", "🔑"], "836dd066370dd9a5553e2c77bc6ebb492a351fdd"],
  [[], "da39a3ee5e6b4b0d3255bfef95601890afd80709"],
])("hashes %j to a stable key", (arr, expected) => {
  expect(hashArray(arr)).toBe(expected);
});

it("does not depend on order", () => {
  expect(hashArray(["api_key", "bearerAuth"])).toBe(
    hashArray(["bearerAuth", "api_key"])
  );
});
