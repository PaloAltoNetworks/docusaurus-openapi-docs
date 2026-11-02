/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createHash } from "crypto";

import { hashArray } from "./storage-utils";

function nodeHashArray(arr: string[]) {
  const sha1 = (message: string) =>
    createHash("sha1").update(message, "utf8").digest("hex");
  return sha1(arr.map(sha1).sort().join());
}

describe("hashArray", () => {
  it.each([
    [["api_key"], "686ba327f1c72d5e3e0826a3fdb7182bf86aab78"],
    [["bearerAuth", "api_key"], "2f41b949399aa95c4aec28af2badea1e31646e0f"],
    [["clé", "🔑"], "836dd066370dd9a5553e2c77bc6ebb492a351fdd"],
    [[], "da39a3ee5e6b4b0d3255bfef95601890afd80709"],
  ])("keeps the crypto-js storage key for %j", (arr, expected) => {
    expect(hashArray(arr)).toBe(expected);
  });

  it("does not depend on order", () => {
    expect(hashArray(["api_key", "bearerAuth"])).toBe(
      hashArray(["bearerAuth", "api_key"])
    );
  });

  it.each([0, 1, 55, 56, 63, 64, 65, 119, 120, 1000])(
    "matches node crypto for a %i-character name",
    (length) => {
      const name = Array.from("aé中🔑".repeat(length))
        .slice(0, length)
        .join("");
      expect(hashArray([name])).toBe(nodeHashArray([name]));
    }
  );

  it("matches node crypto for mixed scheme names", () => {
    const names = ["BearerAuth and BasicAuth", "api_key", "OAuth2 (scopes)"];
    expect(hashArray(names)).toBe(nodeHashArray(names));
  });
});
