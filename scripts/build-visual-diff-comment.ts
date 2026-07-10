#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/*
 * Turns the visual-diff results.json into a Markdown body suitable for a
 * sticky PR comment. Every mismatched page gets a side-by-side prod / preview
 * / diff row (thumbnails link to the full images hosted on the per-PR diffs
 * Firebase channel). Skipped pages are collapsed. Clean runs still produce a
 * body so the sticky comment can overwrite a stale prior report.
 *
 * The <!-- visual-diff-report --> marker is what the workflow's sticky-comment
 * step matches against to decide between create vs update.
 *
 * Env:
 *   DIFFS_URL   base URL of the pr<N>-diffs Firebase channel (prod/preview/diff PNGs live under it)
 *   PREVIEW_URL preview channel URL of the demo site
 *   RUN_URL     GitHub Actions run URL (used for the "download artifact" link)
 */

import fs from "fs";
import path from "path";

interface Summary {
  total: number;
  matches: number;
  mismatches: number;
  skipped: number;
}

interface Page {
  path: string;
  status: "match" | "diff" | "skip";
}

interface Results {
  summary: Summary;
  pages: Page[];
}

const MARKER = "<!-- visual-diff-report -->";
const BASELINE_URL = "https://docusaurus-openapi.tryingpan.dev/";
const MAX_INLINE_DIFFS = 25;
const MAX_INLINE_SKIPS = 50;
const THUMB_WIDTH = 240;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v.replace(/\/$/, "");
}

function cleanPath(p: string): string {
  return p.replace(/^\//, "").replace(/\/$/, "") || "root";
}

function imageUrl(base: string, kind: "prod" | "preview" | "diff", p: string) {
  return `${base}/${kind}/${cleanPath(p)}.png`;
}

function diffRow(base: string, p: Page): string {
  const prod = imageUrl(base, "prod", p.path);
  const prev = imageUrl(base, "preview", p.path);
  const diff = imageUrl(base, "diff", p.path);
  return [
    `### \`${p.path}\``,
    "",
    "<table>",
    "<tr>",
    `<td align="center"><strong>Prod</strong></td>`,
    `<td align="center"><strong>Preview</strong></td>`,
    `<td align="center"><strong>Diff</strong></td>`,
    "</tr>",
    "<tr>",
    `<td><a href="${prod}"><img src="${prod}" width="${THUMB_WIDTH}" alt="prod screenshot for ${p.path}"></a></td>`,
    `<td><a href="${prev}"><img src="${prev}" width="${THUMB_WIDTH}" alt="preview screenshot for ${p.path}"></a></td>`,
    `<td><a href="${diff}"><img src="${diff}" width="${THUMB_WIDTH}" alt="pixel diff for ${p.path}"></a></td>`,
    "</tr>",
    "</table>",
  ].join("\n");
}

function build(
  results: Results,
  diffsUrl: string,
  previewUrl: string,
  runUrl: string
): string {
  const { total, matches, mismatches, skipped } = results.summary;
  const diffs = results.pages.filter((p) => p.status === "diff");
  const skips = results.pages.filter((p) => p.status === "skip");

  const lines: string[] = [];
  lines.push(MARKER);
  lines.push("## 📸 Visual Diff Report");
  lines.push("");
  lines.push(
    `<sub>Snapshot comparison against <a href="${BASELINE_URL}">${BASELINE_URL}</a></sub>`
  );
  lines.push("");
  lines.push("| Total | ✅ Match | ❌ Diff | ⏭ Skip |");
  lines.push("|:---:|:---:|:---:|:---:|");
  lines.push(
    `| ${total} | ${matches} | ${mismatches > 0 ? `**${mismatches}**` : mismatches} | ${skipped} |`
  );
  lines.push("");
  lines.push(`- **Preview:** ${previewUrl}`);
  lines.push(`- **Diff images:** ${diffsUrl}/`);
  lines.push(
    `- **Full HTML report:** [download from run artifacts](${runUrl})`
  );
  lines.push("");

  if (diffs.length === 0) {
    lines.push("✅ **No visual regressions detected.**");
  } else {
    lines.push(
      `<details open>`,
      `<summary><strong>❌ ${diffs.length} page(s) with visual regressions</strong></summary>`,
      ""
    );
    for (const p of diffs.slice(0, MAX_INLINE_DIFFS)) {
      lines.push(diffRow(diffsUrl, p));
      lines.push("");
    }
    if (diffs.length > MAX_INLINE_DIFFS) {
      lines.push(
        `_… and ${diffs.length - MAX_INLINE_DIFFS} more page(s) with regressions. See the [HTML report](${runUrl}) for the full list._`
      );
    }
    lines.push("</details>");
  }
  lines.push("");

  if (skips.length > 0) {
    lines.push(
      `<details>`,
      `<summary><strong>⏭ ${skips.length} page(s) skipped (navigation or screenshot errors)</strong></summary>`,
      ""
    );
    for (const p of skips.slice(0, MAX_INLINE_SKIPS)) {
      lines.push(`- \`${p.path}\``);
    }
    if (skips.length > MAX_INLINE_SKIPS) {
      lines.push(`- _… and ${skips.length - MAX_INLINE_SKIPS} more._`);
    }
    lines.push("</details>");
    lines.push("");
  }

  const runId = process.env.GITHUB_RUN_ID ?? "local";
  lines.push(
    `<sub>Updated at ${new Date().toISOString()} · run [${runId}](${runUrl})</sub>`
  );

  return lines.join("\n") + "\n";
}

function main() {
  const [, , inputFile, outputFile] = process.argv;
  if (!inputFile || !outputFile) {
    console.error(
      "usage: build-visual-diff-comment.ts <results.json> <comment.md>"
    );
    process.exit(2);
  }
  const diffsUrl = requireEnv("DIFFS_URL");
  const previewUrl = requireEnv("PREVIEW_URL");
  const runUrl = requireEnv("RUN_URL");

  const results: Results = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const body = build(results, diffsUrl, previewUrl, runUrl);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, body);
  console.log(
    `Wrote ${outputFile} (${body.length} chars, ${results.pages.filter((p) => p.status === "diff").length} diffs)`
  );
}

main();
