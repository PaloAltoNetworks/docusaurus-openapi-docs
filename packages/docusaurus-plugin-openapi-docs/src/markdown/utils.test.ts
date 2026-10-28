/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import os from "os";
import path from "path";

import * as markdownUtils from "./utils";
import {
  clean as cleanMarkdown,
  createMarkdownCleaner,
  loadMarkdownParser,
  MarkdownParser,
} from "./utils";
import pluginOpenAPIDocs from "../index";
import { MarkdownGenerator } from "../types";

let parseMarkdown: MarkdownParser;
const clean = (value: string | undefined) =>
  cleanMarkdown(value, parseMarkdown);

beforeAll(async () => {
  parseMarkdown = await loadMarkdownParser();
});

describe("clean", () => {
  it.each([
    ["See[^1]\n\n[^1]: {x}", "See[^1]\n\n[^1]: \\{x\\}"],
    ["| value |\n| --- |\n| `a|{b}` |", "| value |\n| --- |\n| `a|\\{b\\}` |"],
    ["\\{x\\}", "\\{x\\}"],
    ["\\<", "\\<"],
    ["\\>", "\\>"],
    ["\\<custom\\> and {x}", "\\<custom\\> and \\{x\\}"],
    ["\\\\{x}", "\\\\\\{x\\}"],
    ["\\\\<custom>", "\\\\&lt;custom&gt;"],
    ["\\\\\\{x\\}", "\\\\\\{x\\}"],
  ])("respects GFM and author escapes in %j", (input, expected) => {
    expect(clean(input)).toBe(expected);
  });

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

describe("Markdown parser loading and compatibility", () => {
  it("shares asynchronous parser loading", () => {
    expect(loadMarkdownParser()).toBe(loadMarkdownParser());
  });

  it("provides an asynchronous factory for synchronous description cleaning", async () => {
    const cleaner = await createMarkdownCleaner();
    expect(cleaner("See[^1]\n\n[^1]: {x}")).toBe("See[^1]\n\n[^1]: \\{x\\}");
  });

  it.each([
    undefined,
    "",
    "Plain description",
    "# Heading\n\n- item",
    "`code`",
  ])("does not parse descriptions without target characters: %j", (value) => {
    const parser = jest.fn(parseMarkdown);
    expect(cleanMarkdown(value, parser)).toBe(value ?? "");
    expect(parser).not.toHaveBeenCalled();
  });

  it("keeps the published synchronous one-argument regex behavior", () => {
    expect(cleanMarkdown("Use {a} and `{b}`")).toBe("Use \\{a\\} and `{b}`");
    expect(cleanMarkdown("~~~\n{a}\n~~~")).toBe("~~~\n\\{a\\}\n~~~");
  });

  it("retains the deprecated regex exports", () => {
    expect(markdownUtils).toMatchObject({
      codeFence: expect.any(RegExp),
      codeBlock: expect.any(RegExp),
    });
  });
});

const description = (name: string) => `See[^${name}]\n\n[^${name}]: {${name}}`;

describe("asynchronous Markdown generation", () => {
  let siteDir: string;
  let outputDir: string;
  let errors: jest.SpyInstance;

  beforeEach(() => {
    siteDir = fs.mkdtempSync(path.join(os.tmpdir(), "openapi-markdown-"));
    outputDir = path.join(siteDir, "docs");
    errors = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    fs.writeFileSync(
      path.join(siteDir, "spec.json"),
      JSON.stringify({
        openapi: "3.0.3",
        info: {
          title: "Parser",
          version: "1",
          description: description("info"),
        },
        tags: [{ name: "pets", description: description("tag") }],
        paths: {
          "/pets": {
            get: {
              operationId: "getPets",
              tags: ["pets"],
              description: description("api"),
              deprecated: true,
              "x-deprecated-description": description("deprecated"),
              responses: { "200": { description: "OK" } },
              callbacks: {
                notification: {
                  "{$request.body#/url}": {
                    post: {
                      description: description("callback"),
                      responses: { "200": { description: "OK" } },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Pet: {
              title: "Pet",
              type: "object",
              description: description("schema"),
            },
          },
          securitySchemes: {
            token: {
              type: "apiKey",
              in: "header",
              name: "Authorization",
              description: description("authentication"),
            },
          },
        },
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(siteDir, { recursive: true, force: true });
  });

  async function generate(markdownGenerators?: MarkdownGenerator) {
    const plugin = pluginOpenAPIDocs(
      { siteDir, siteConfig: { presets: [], plugins: [] } } as any,
      {
        id: "openapi",
        config: {
          test: {
            specPath: "spec.json",
            outputDir,
            showSchemas: true,
            sidebarOptions: { groupPathsBy: "tag", categoryLinkSource: "tag" },
            markdownGenerators,
          },
        },
      } as any
    );
    const actions: Record<string, (...args: any[]) => Promise<void>> = {};
    let command = "";
    const cli: any = {
      command: (name: string) => {
        command = name;
        return cli;
      },
      description: () => cli,
      usage: () => cli,
      arguments: () => cli,
      option: () => cli,
      action: (fn: (...args: any[]) => Promise<void>) => {
        actions[command] = fn;
        return cli;
      },
    };
    plugin.extendCli!(cli);
    await actions["gen-api-docs"]("test", { opts: () => ({}) });
    expect(errors).not.toHaveBeenCalled();
  }

  function page(suffix: string, directory = outputDir) {
    const file = fs
      .readdirSync(directory)
      .find((name) => name.endsWith(suffix));
    expect(file).toBeDefined();
    return fs.readFileSync(path.join(directory, file!), "utf8");
  }

  it("loads the parser and passes it through all default page generators", async () => {
    await generate();
    const api = page(".api.mdx");
    const info = page(".info.mdx");
    const tag = page(".tag.mdx");
    const schema = page(".schema.mdx", path.join(outputDir, "schemas"));
    for (const name of ["api", "deprecated", "callback"]) {
      expect(api).toContain(`[^${name}]: \\{${name}\\}`);
    }
    for (const name of ["info", "authentication"]) {
      expect(info).toContain(`[^${name}]: \\{${name}\\}`);
    }
    expect(tag).toContain("[^tag]: \\{tag\\}");
    expect(schema).toContain("[^schema]: \\{schema\\}");
  });

  it("keeps custom generators synchronous and passes only page metadata", async () => {
    const generators = {
      createApiPageMD: jest.fn(() => "custom api"),
      createInfoPageMD: jest.fn(() => "custom info"),
      createTagPageMD: jest.fn(() => "custom tag"),
      createSchemaPageMD: jest.fn(() => "custom schema"),
    };
    await generate(generators);
    for (const generator of Object.values(generators)) {
      expect(generator).toHaveBeenCalledTimes(1);
      expect(generator).toHaveBeenCalledWith(
        expect.objectContaining({ type: expect.any(String) })
      );
    }
    expect(page(".api.mdx")).toContain("custom api");
    expect(page(".info.mdx")).toContain("custom info");
    expect(page(".tag.mdx")).toContain("custom tag");
    expect(page(".schema.mdx", path.join(outputDir, "schemas"))).toContain(
      "custom schema"
    );
  });
});
