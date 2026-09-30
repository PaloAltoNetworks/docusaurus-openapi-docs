/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { clean } from "./utils";

describe("clean", () => {
  it.each(["{", "}", "<", ">"])(
    "preserves the single-character inline code %s",
    (character) => {
      const inlineCode = "`" + character + "`";

      expect(clean(`${inlineCode} and {text}`)).toBe(
        `${inlineCode} and \\{text\\}`
      );
      expect(clean(`Before {text} and ${inlineCode}`)).toBe(
        `Before \\{text\\} and ${inlineCode}`
      );
    }
  );

  it("escapes curly brackets outside code", () => {
    expect(
      clean("Use {value}, `const value = {}`, and ~removed~ {text}.")
    ).toBe("Use \\{value\\}, `const value = {}`, and ~removed~ \\{text\\}.");
  });

  it.each([
    ["backtick", '```json\n{\n  "ok": true\n}\n```'],
    ["tilde", '~~~json\n{\n  "ok": true\n}\n~~~'],
  ])("preserves %s fenced code blocks", (_name, codeBlock) => {
    const input = `Before {value}\n${codeBlock}\nAfter {value}`;
    const expected = `Before \\{value\\}\n${codeBlock}\nAfter \\{value\\}`;

    expect(clean(input)).toBe(expected);
  });
});
