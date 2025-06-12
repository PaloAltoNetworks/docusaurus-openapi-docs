/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { guard, create, render } from "./utils";

describe("guard", () => {
  it("should guard empty strings", () => {
    const actual = guard("", (_) => {
      throw new Error("Should not be called");
    });
    expect(actual).toBe("");
  });

  it("should guard undefined", () => {
    const actual = guard(undefined, (value) => {
      throw new Error("Should not be called");
    });
    expect(actual).toBe("");
  });

  it("should guard false booleans", () => {
    const actual = guard(false, (value) => `${value}`);
    expect(actual).toBe("");
  });

  it("should not guard strings", () => {
    const actual = guard("hello", (value) => value);
    expect(actual).toBe("hello");
  });

  it("should not guard numbers", () => {
    const actual = guard(1, (value) => `${value}`);
    expect(actual).toBe("1");
  });

  it("should not guard numbers equals to 0", () => {
    const actual = guard(0, (value) => `${value}`);
    expect(actual).toBe("0");
  });

  it("should not guard true booleans", () => {
    const actual = guard(true, (value) => `${value}`);
    expect(actual).toBe("true");
  });
});

describe("create", () => {
  it("should create element with props and children", () => {
    const actual = create("div", { className: "x", children: "hello" });
    expect(actual).toBe('<div className={"x"}>hello</div>');
  });
});

describe("render", () => {
  it("should render arrays while filtering undefined", () => {
    const actual = render(["a", undefined, "b"]);
    expect(actual).toBe("ab");
  });

  it("should render undefined as empty string", () => {
    const actual = render(undefined);
    expect(actual).toBe("");
  });
});
