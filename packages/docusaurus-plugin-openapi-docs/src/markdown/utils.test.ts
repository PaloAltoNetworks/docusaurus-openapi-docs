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

  describe.each(["```", "~~~"])("%s fences", (fence) => {
    it.each([" ", "\t", " \t"])(
      "allows trailing whitespace %j on closing fences",
      (whitespace) => {
        const block = `${fence}\n{a}\n${fence}${whitespace}`;

        expect(clean(`${block}\nafter {b}`)).toBe(`${block}\nafter \\{b\\}`);
      }
    );

    it.each(["", "\n{a}\nno close"])(
      "preserves an unclosed fence through the end of input %j",
      (content) => {
        const input = `before {b}\n${fence}${content}`;

        expect(clean(input)).toBe(`before \\{b\\}\n${fence}${content}`);
      }
    );

    it("does not close a longer fence at a shorter inner fence", () => {
      const longerFence = fence + fence[0];
      const block = `${longerFence}\n${fence}\n{a}\n${fence}\n${longerFence}`;

      expect(clean(`${block}\n{b}`)).toBe(`${block}\n\\{b\\}`);
    });

    it("allows a closing fence longer than the opening fence", () => {
      const block = `${fence}\n{a}\n${fence}${fence[0]}`;

      expect(clean(`${block}\n{b}`)).toBe(`${block}\n\\{b\\}`);
    });

    it.each([
      ["prefixed text", `echo foo${fence}`],
      ["suffixed text", `${fence}suffix`],
      ["a different character", fence === "```" ? "~~~" : "```"],
      ["too few characters", fence.slice(1)],
    ])("does not close at %s", (_name, falseCloser) => {
      const block = `${fence}sh\n${falseCloser}\n{a}\n${fence}`;

      expect(clean(`${block}\nafter {b}`)).toBe(`${block}\nafter \\{b\\}`);
    });

    it("matches MDX handling of indented closing fences", () => {
      const block = `${fence}\n{a}\n    ${fence}`;

      expect(clean(`${block}\nafter {b}`)).toBe(`${block}\nafter \\{b\\}`);
    });

    it.each([0, 1, 2, 3])(
      "allows %i spaces before the opening and closing fences",
      (indent) => {
        const openingIndent = " ".repeat(indent);
        const closingIndent = " ".repeat(3 - indent);
        const block = `${openingIndent}${fence}json\n  {a}\n${closingIndent}${fence}`;

        expect(clean(`${block}\nafter {b}`)).toBe(`${block}\nafter \\{b\\}`);
      }
    );

    it("preserves fences indented inside a list item", () => {
      const block = `- item\n  ${fence}json\n  {a}\n  ${fence}`;

      expect(clean(block)).toBe(block);
    });

    it.each(["\r\n", "\r"])("preserves %j line endings", (newline) => {
      const block = [fence, "{a}", `${fence} \t`].join(newline);

      expect(clean(`${block}${newline}after {b}`)).toBe(
        `${block}${newline}after \\{b\\}`
      );
    });

    it("escapes angle brackets and braces surrounding fenced code", () => {
      const block = `${fence}\n<T>{a}</T>\n${fence}`;

      expect(clean(`<T>{b}</T>\n${block}\n<T>{c}</T>`)).toBe(
        `&lt;T&gt;\\{b\\}&lt;/T&gt;\n${block}\n&lt;T&gt;\\{c\\}&lt;/T&gt;`
      );
    });
  });

  it.each([
    ["a line break", "`multi\nline {a}`"],
    ["CRLF", "`multi\r\nline {a}`"],
    ["a backtick inside double backticks", "``a ` {b}``"],
    ["a longer run inside single backticks", "`a `` {b} `` {c}`"],
    ["more than three backticks", "````{a} ``` {b}````"],
    ["a backslash before the closing delimiter", "`{a}\\`"],
  ])("preserves inline code with %s", (_name, inlineCode) => {
    expect(clean(`${inlineCode} after {c}`)).toBe(
      `${inlineCode} after \\{c\\}`
    );
  });

  it.each(["`unclosed {a}", "``unclosed {a}`", "`unclosed {a}``"])(
    "escapes prose following unmatched inline delimiters in %j",
    (input) => {
      expect(clean(input)).toBe(input.replace("{a}", "\\{a\\}"));
    }
  );

  it("does not open inline code at an escaped backtick", () => {
    expect(clean("\\`{a}` and {b}")).toBe("\\`\\{a\\}` and \\{b\\}");
  });

  it("allows an inline opener after an escaped backslash", () => {
    expect(clean("\\\\`{a}` and {b}")).toBe("\\\\`{a}` and \\{b\\}");
  });

  it.each(["\\``{a}`", "\\```{a}``"])(
    "allows an inline opener after the first backtick is escaped in %j",
    (inlineCode) => {
      expect(clean(`${inlineCode} and {b}`)).toBe(`${inlineCode} and \\{b\\}`);
    }
  );

  it.each(["\n\n", "\r\n\r\n", "\n \t\n"])(
    "does not match inline delimiters across a blank line %j",
    (separator) => {
      expect(clean(`\`before${separator}{a}\` and {b}`)).toBe(
        `\`before${separator}\\{a\\}\` and \\{b\\}`
      );
    }
  );

  it.each([
    ["a heading", "# {a}` and {b}"],
    ["an unordered list", "- {a}` and {b}"],
    ["an ordered list", "1. {a}` and {b}"],
    ["a blockquote", "> {a}` and {b}"],
    ["an indented blockquote", " > {a}` and {b}"],
    ["a thematic break", "***\n{a}` and {b}"],
    ["a setext heading", "---\n{a}` and {b}"],
  ])("does not match inline delimiters across %s", (_name, nextBlock) => {
    expect(clean(`\`before\n${nextBlock}`)).toBe(
      `\`before\n${nextBlock.replace("{a}", "\\{a\\}").replace("{b}", "\\{b\\}")}`
    );
  });

  it.each([
    ["a list item", "- `multi\n  line {a}` and {b}"],
    ["a blockquote", "> `multi\n> line {a}` and {b}"],
    ["an indented blockquote", " > `multi\n > line {a}` and {b}"],
  ])("preserves multiline inline code continuing within %s", (_name, input) => {
    expect(clean(input)).toBe(input.replace("{b}", "\\{b\\}"));
  });

  it.each(["```", "~~~"])(
    "ends an unclosed %s fence when its enclosing list item ends",
    (fence) => {
      const block = `- item\n  ${fence}\n  {a}`;

      expect(clean(`${block}\n{b}`)).toBe(`${block}\n\\{b\\}`);
      expect(clean(`${block}\n\n{b}`)).toBe(`${block}\n\n\\{b\\}`);
    }
  );

  it.each(["```", "~~~"])(
    "preserves a standalone indented unclosed %s fence through EOF",
    (fence) => {
      const block = `  ${fence}\n  {a}\n{b}`;

      expect(clean(block)).toBe(block);
    }
  );

  it("does not treat a backtick in the info string as an opening fence", () => {
    expect(clean("```js` metadata\n{a}")).toBe("```js` metadata\n\\{a\\}");
  });

  it("allows backticks in a tilde fence info string", () => {
    const block = "~~~js `metadata`\n{a}\n~~~";

    expect(clean(`${block}\n{b}`)).toBe(`${block}\n\\{b\\}`);
  });

  it.each(["> quote", "para\n\n> quote", "# Title\n> quote"])(
    "preserves blockquote markers in %j",
    (input) => {
      expect(clean(input)).toBe(input);
    }
  );

  it.each([
    [
      "ordered items",
      "1. use `foo\n2. bar {x} `baz",
      "1. use `foo\n2. bar \\{x\\} `baz",
    ],
    [
      "nested items",
      "- a\n  - b `x\n    - c {y} `z",
      "- a\n  - b `x\n    - c \\{y\\} `z",
    ],
  ])("does not pair backticks across %s", (_name, input, expected) => {
    expect(clean(input)).toBe(expected);
  });

  it.each([
    ["a list marker", "- ~~~\n  {a}\n  ~~~"],
    ["a blockquote", "> ~~~\n> {a}\n> ~~~"],
    ["tabs", "-\titem\n\t~~~\n\t{a}\n\t~~~"],
    ["nested quote and list", "> - ~~~\n>   {a}\n>   ~~~"],
  ])("preserves fenced code inside %s", (_name, input) => {
    expect(clean(input)).toBe(input);
  });

  it("keeps source spelling of entities and Markdown escapes", () => {
    expect(clean("&#123;x&#125; &amp; \\*text\\* {a}")).toBe(
      "&#123;x&#125; &amp; \\*text\\* \\{a\\}"
    );
  });

  it.each(["```", "~~~"])(
    "preserves %s fenced examples inside HTML",
    (fence) => {
      const block = `<div>\n${fence}\n{a}\n${fence}\n</div>`;

      expect(clean(`${block}\n\nOutside {b}`)).toBe(
        `${block}\n\nOutside \\{b\\}`
      );
      expect(clean("<div>{a}</div>")).toBe("<div>\\{a\\}</div>");
    }
  );

  it.each(["https://example.com", "user@example.com", "dev@example.com"])(
    "escapes the angle brackets around the autolink %s",
    (link) => {
      expect(clean(`See <${link}> and {a}`)).toBe(
        `See &lt;${link}&gt; and \\{a\\}`
      );
    }
  );

  it("preserves Markdown links and autolinks inside code", () => {
    expect(
      clean("[link](<https://example.com>) and `<user@example.com>`")
    ).toBe("[link](<https://example.com>) and `<user@example.com>`");
  });

  it.each([
    ["![{](image.png)", "![\\{](image.png)"],
    ["![<custom> {a}](image.png)", "![&lt;custom&gt; \\{a\\}](image.png)"],
    [
      "![<https://example.com>](image.png)",
      "![&lt;https://example.com&gt;](image.png)",
    ],
    ["![`{a}` and {b}](image.png)", "![`{a}` and \\{b\\}](image.png)"],
    [
      '![{a}][image]\n\n[image]: image.png "title {b}"',
      '![\\{a\\}][image]\n\n[image]: image.png "title {b}"',
    ],
  ])("escapes image alt prose in %j", (input, expected) => {
    expect(clean(input)).toBe(expected);
  });

  it.each([
    ['    {"a": 1}', '    \\{"a": 1\\}'],
    ["    <custom>", "    &lt;custom&gt;"],
    ["- item\n\n      {a}", "- item\n\n      \\{a\\}"],
  ])("escapes indented MDX prose in %j", (input, expected) => {
    expect(clean(input)).toBe(expected);
  });
});
