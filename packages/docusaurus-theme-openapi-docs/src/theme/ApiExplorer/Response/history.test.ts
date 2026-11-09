/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import {
  addHistoryEntry,
  clearHistory,
  getHistory,
  retainHistory,
} from "./history";

describe("request history", () => {
  afterEach(() => {
    clearHistory("a");
    clearHistory("b");
  });

  it("stores newest entries first", () => {
    addHistoryEntry("a", { status: "success", code: "200" });
    addHistoryEntry("a", { status: "error", value: "Connection failed" });
    expect(getHistory("a").map((e) => e.status)).toEqual(["error", "success"]);
  });

  it("keeps at most five entries per key", () => {
    for (let i = 0; i < 7; i++) {
      addHistoryEntry("a", { status: "success", code: String(200 + i) });
    }
    const codes = getHistory("a").map((e) => e.code);
    expect(codes).toEqual(["206", "205", "204", "203", "202"]);
  });

  it("isolates keys and clears them independently", () => {
    addHistoryEntry("a", { status: "success" });
    addHistoryEntry("b", { status: "success" });
    clearHistory("a");
    expect(getHistory("a")).toHaveLength(0);
    expect(getHistory("b")).toHaveLength(1);
  });

  it("clears a key when its last holder releases it", () => {
    const releaseFirst = retainHistory("a");
    const releaseSecond = retainHistory("a");
    addHistoryEntry("a", { status: "success" });
    releaseFirst();
    expect(getHistory("a")).toHaveLength(1);
    releaseSecond();
    expect(getHistory("a")).toHaveLength(0);
  });

  it("ignores a repeated release", () => {
    const releaseFirst = retainHistory("a");
    const releaseSecond = retainHistory("a");
    releaseFirst();
    releaseFirst();
    addHistoryEntry("a", { status: "success" });
    expect(getHistory("a")).toHaveLength(1);
    releaseSecond();
    expect(getHistory("a")).toHaveLength(0);
  });

  it("returns a stable empty array for unknown keys", () => {
    expect(getHistory("missing")).toBe(getHistory("other"));
  });
});
