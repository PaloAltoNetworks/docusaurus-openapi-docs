/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Vendored subset of @docusaurus/theme-common/src/utils/codeBlockUtils.tsx (MIT)
 * to remove the dependency on @docusaurus/theme-common/internal.
 * See: https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type { CSSProperties } from "react";

import rangeParser from "parse-numeric-range";
import type { PrismTheme, PrismThemeEntry } from "prism-react-renderer";

const codeBlockTitleRegex = /title=(?<quote>["'])(?<title>.*?)\1/;
const metastringLinesRangeRegex = /\{(?<range>[\d,-]+)\}/;

const popularCommentPatterns = {
  js: { start: "\\/\\/", end: "" },
  jsBlock: { start: "\\/\\*", end: "\\*\\/" },
  jsx: { start: "\\{\\s*\\/\\*", end: "\\*\\/\\s*\\}" },
  bash: { start: "#", end: "" },
  html: { start: "<!--", end: "-->" },
} as const;

const commentPatterns = {
  ...popularCommentPatterns,
  lua: { start: "--", end: "" },
  wasm: { start: "\\;\\;", end: "" },
  tex: { start: "%", end: "" },
  vb: { start: "['‘’]", end: "" },
  vbnet: { start: "(?:_\\s*)?['‘’]", end: "" },
  rem: { start: "[Rr][Ee][Mm]\\b", end: "" },
  f90: { start: "!", end: "" },
  ml: { start: "\\(\\*", end: "\\*\\)" },
  cobol: { start: "\\*>", end: "" },
} as const;

type CommentType = keyof typeof commentPatterns;
const popularCommentTypes = Object.keys(
  popularCommentPatterns
) as CommentType[];

export type MagicCommentConfig = {
  className: string;
  line?: string;
  block?: { start: string; end: string };
};

function getCommentPattern(
  languages: CommentType[],
  magicCommentDirectives: MagicCommentConfig[]
) {
  const commentPattern = languages
    .map((lang) => {
      const { start, end } = commentPatterns[lang];
      return `(?:${start}\\s*(${magicCommentDirectives
        .flatMap((d) => [d.line, d.block?.start, d.block?.end].filter(Boolean))
        .join("|")})\\s*${end})`;
    })
    .join("|");
  return new RegExp(`^\\s*(?:${commentPattern})\\s*$`);
}

function getAllMagicCommentDirectiveStyles(
  lang: string,
  magicCommentDirectives: MagicCommentConfig[]
) {
  switch (lang) {
    case "js":
    case "javascript":
    case "ts":
    case "typescript":
      return getCommentPattern(["js", "jsBlock"], magicCommentDirectives);

    case "jsx":
    case "tsx":
      return getCommentPattern(
        ["js", "jsBlock", "jsx"],
        magicCommentDirectives
      );

    case "html":
      return getCommentPattern(
        ["js", "jsBlock", "html"],
        magicCommentDirectives
      );

    case "python":
    case "py":
    case "bash":
      return getCommentPattern(["bash"], magicCommentDirectives);

    case "markdown":
    case "md":
      return getCommentPattern(["html", "jsx", "bash"], magicCommentDirectives);

    case "tex":
    case "latex":
    case "matlab":
      return getCommentPattern(["tex"], magicCommentDirectives);

    case "lua":
    case "haskell":
      return getCommentPattern(["lua"], magicCommentDirectives);

    case "sql":
      return getCommentPattern(["lua", "jsBlock"], magicCommentDirectives);

    case "wasm":
      return getCommentPattern(["wasm"], magicCommentDirectives);

    case "vb":
    case "vba":
    case "visual-basic":
      return getCommentPattern(["vb", "rem"], magicCommentDirectives);
    case "vbnet":
      return getCommentPattern(["vbnet", "rem"], magicCommentDirectives);

    case "batch":
      return getCommentPattern(["rem"], magicCommentDirectives);

    case "basic":
      return getCommentPattern(["rem", "f90"], magicCommentDirectives);

    case "fsharp":
      return getCommentPattern(["js", "ml"], magicCommentDirectives);

    case "ocaml":
    case "sml":
      return getCommentPattern(["ml"], magicCommentDirectives);

    case "fortran":
      return getCommentPattern(["f90"], magicCommentDirectives);

    case "cobol":
      return getCommentPattern(["cobol"], magicCommentDirectives);

    default:
      return getCommentPattern(popularCommentTypes, magicCommentDirectives);
  }
}

export function parseCodeBlockTitle(metastring?: string): string {
  return metastring?.match(codeBlockTitleRegex)?.groups!.title ?? "";
}

export function containsLineNumbers(metastring?: string): boolean {
  return Boolean(metastring?.includes("showLineNumbers"));
}

type ParseCodeLinesParam = {
  metastring: string | undefined;
  language: string | undefined;
  magicComments: MagicCommentConfig[];
};

type CodeLineClassNames = { [lineIndex: number]: string[] };

type ParsedCodeLines = {
  code: string;
  lineClassNames: CodeLineClassNames;
};

function parseCodeLinesFromMetastring(
  code: string,
  { metastring, magicComments }: ParseCodeLinesParam
): ParsedCodeLines | null {
  if (metastring && metastringLinesRangeRegex.test(metastring)) {
    const linesRange = metastring.match(metastringLinesRangeRegex)!.groups!
      .range!;
    if (magicComments.length === 0) {
      throw new Error(
        `A highlight range has been given in code block's metastring (\`\`\` ${metastring}), but no magic comment config is available. Docusaurus applies the first magic comment entry's className for metastring ranges.`
      );
    }
    const metastringRangeClassName = magicComments[0]!.className;
    const lines = rangeParser(linesRange)
      .filter((n) => n > 0)
      .map((n) => [n - 1, [metastringRangeClassName]] as [number, string[]]);
    return { lineClassNames: Object.fromEntries(lines), code };
  }
  return null;
}

function parseCodeLinesFromContent(
  code: string,
  params: ParseCodeLinesParam
): ParsedCodeLines {
  const { language, magicComments } = params;
  if (language === undefined) {
    return { lineClassNames: {}, code };
  }
  const directiveRegex = getAllMagicCommentDirectiveStyles(
    language,
    magicComments
  );
  const lines = code.split(/\r?\n/);
  const blocks = Object.fromEntries(
    magicComments.map((d) => [d.className, { start: 0, range: "" }])
  );
  const lineToClassName: { [comment: string]: string } = Object.fromEntries(
    magicComments
      .filter((d) => d.line)
      .map(({ className, line }) => [line!, className] as [string, string])
  );
  const blockStartToClassName: { [comment: string]: string } =
    Object.fromEntries(
      magicComments
        .filter((d) => d.block)
        .map(({ className, block }) => [block!.start, className])
    );
  const blockEndToClassName: { [comment: string]: string } = Object.fromEntries(
    magicComments
      .filter((d) => d.block)
      .map(({ className, block }) => [block!.end, className])
  );
  for (let lineNumber = 0; lineNumber < lines.length; ) {
    const line = lines[lineNumber]!;
    const match = line.match(directiveRegex);
    if (!match) {
      lineNumber += 1;
      continue;
    }
    const directive = match
      .slice(1)
      .find((item: string | undefined) => item !== undefined)!;
    if (lineToClassName[directive]) {
      blocks[lineToClassName[directive]!]!.range += `${lineNumber},`;
    } else if (blockStartToClassName[directive]) {
      blocks[blockStartToClassName[directive]!]!.start = lineNumber;
    } else if (blockEndToClassName[directive]) {
      blocks[blockEndToClassName[directive]!]!.range += `${
        blocks[blockEndToClassName[directive]!]!.start
      }-${lineNumber - 1},`;
    }
    lines.splice(lineNumber, 1);
  }

  const lineClassNames: { [lineIndex: number]: string[] } = {};
  Object.entries(blocks).forEach(([className, { range }]) => {
    rangeParser(range).forEach((l) => {
      lineClassNames[l] ??= [];
      lineClassNames[l]!.push(className);
    });
  });

  return { code: lines.join("\n"), lineClassNames };
}

export function parseLines(
  code: string,
  params: ParseCodeLinesParam
): ParsedCodeLines {
  const newCode = code.replace(/\r?\n$/, "");
  return (
    parseCodeLinesFromMetastring(newCode, { ...params }) ??
    parseCodeLinesFromContent(newCode, { ...params })
  );
}

function parseClassNameLanguage(
  className: string | undefined
): string | undefined {
  if (!className) {
    return undefined;
  }
  const languageClassName = className
    .split(" ")
    .find((str) => str.startsWith("language-"));
  return languageClassName?.replace(/language-/, "");
}

// Upstream renamed `parseLanguage` to `parseClassNameLanguage`; the back-compat
// shim in @docusaurus/theme-common/internal re-exports it under the old name.
// We keep the old name here since our call sites still use it.
export { parseClassNameLanguage as parseLanguage };

export function getPrismCssVariables(prismTheme: PrismTheme): CSSProperties {
  const mapping: PrismThemeEntry = {
    color: "--prism-color",
    backgroundColor: "--prism-background-color",
  };

  const properties: { [key: string]: string } = {};
  Object.entries(prismTheme.plain).forEach(([key, value]) => {
    const varName = mapping[key as keyof PrismThemeEntry];
    if (varName && typeof value === "string") {
      properties[varName] = value;
    }
  });
  return properties;
}
