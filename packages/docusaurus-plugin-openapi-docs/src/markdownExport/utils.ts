/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

export function code(value: unknown): string {
  const text = String(value);
  if (!text.includes("`")) {
    return `\`${text}\``;
  }
  return `\`\` ${text} \`\``;
}

export function fence(content: string, language = ""): string {
  const longestRun = Math.max(
    2,
    ...(content.match(/`+/g) ?? []).map((run) => run.length)
  );
  const marker = "`".repeat(longestRun + 1);
  return `${marker}${language}\n${content}\n${marker}`;
}

export function indentLines(text: string, indent: string): string[] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => (line.trim() === "" ? "" : `${indent}${line}`));
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}

export function languageForMediaType(mediaType: string): string {
  if (/json/i.test(mediaType)) return "json";
  if (/xml/i.test(mediaType)) return "xml";
  if (/yaml/i.test(mediaType)) return "yaml";
  return "";
}

export function joinBlocks(blocks: (string | undefined | false)[]): string {
  return (
    blocks
      .filter((block): block is string => !!block && block.trim() !== "")
      .join("\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}

export function toMarkdownUrl(permalink: string, baseUrl = "/"): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const withoutTrailingSlash = permalink.replace(/\/+$/, "");
  return `${withoutTrailingSlash}/` === base || withoutTrailingSlash === ""
    ? `${base}index.md`
    : `${withoutTrailingSlash}.md`;
}

/**
 * Adds the markdown export keys to the front matter of a generated page, so
 * the theme shows the page actions with any page template.
 */
export function withMarkdownExportFrontMatter(
  page: string,
  frontMatter: Record<string, unknown> = {}
): string {
  if (frontMatter.markdown_export !== true) return page;
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(page);
  if (!match) return page;
  const keys = match[1].split(/\r?\n/).map((line) => line.split(":")[0]);
  const lines: string[] = [];
  if (!keys.includes("markdown_export")) {
    lines.push("markdown_export: true");
  }
  if (
    typeof frontMatter.download_url === "string" &&
    !keys.includes("download_url")
  ) {
    lines.push(`download_url: ${JSON.stringify(frontMatter.download_url)}`);
  }
  if (lines.length === 0) return page;
  const end = match.index + match[0].length - 3;
  return `${page.slice(0, end)}${lines.join("\n")}\n${page.slice(end)}`;
}
