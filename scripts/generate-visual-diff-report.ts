#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

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
  status: string;
}

function clean(p: string): string {
  return p.replace(/^\//, "").replace(/\/$/, "") || "root";
}

function generateHTML(results: { summary: Summary; pages: Page[] }): string {
  const pages = results.pages.map((p) => ({ ...p, clean: clean(p.path) }));
  const listItems = pages
    .map((p, i) => {
      return `<li><a href="#" data-index="${i}" class="status-${p.status}">${p.path}</a></li>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Visual Diff Report</title>
<style>
body { margin:0; display:flex; height:100vh; font-family: Arial, sans-serif; }
#sidebar { width:250px; background:#f7f7f7; overflow-y:auto; border-right:1px solid #ddd; padding:10px; }
#content { flex:1; overflow:auto; padding:10px; }
#diffImages { display:flex; gap:10px; margin-top:1em; }
#diffImages img { border:1px solid #ccc; max-width:100%; background:#000; }
.status-diff { color:#d33; }
.status-match { color:#090; }
.status-skip { color:#999; }
</style>
</head>
<body>
<div id="sidebar">
<h2>Pages</h2>
<ul>${listItems}</ul>
</div>
<div id="content">
<h2 id="title">Select a page</h2>
<div id="diffImages" style="display:none">
  <div><div>Prod</div><img id="img-prod" /></div>
  <div><div>Preview</div><img id="img-prev" /></div>
  <div><div>Diff</div><img id="img-diff" /></div>
</div>
</div>
<script>
const pages = ${JSON.stringify(pages)};
function show(i){
  const p = pages[i];
  if(!p) return;
  document.getElementById('title').textContent = p.path + ' (' + p.status + ')';
  document.getElementById('img-prod').src = 'prod/' + p.clean + '.png';
  document.getElementById('img-prev').src = 'preview/' + p.clean + '.png';
  document.getElementById('img-diff').src = 'diff/' + p.clean + '.png';
  document.getElementById('diffImages').style.display = 'flex';
}
document.querySelectorAll('#sidebar a').forEach((a) => {
  a.addEventListener('click', function(e){
    e.preventDefault();
    show(this.getAttribute('data-index'));
  });
});
if(pages.length) show(0);
</script>
</body>
</html>`;
}

function encodeImage(filePath: string): string {
  try {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return "";
  }
}

function generateMarkdown(
  results: { summary: Summary; pages: Page[] },
  baseDir: string
): string {
  const lines: string[] = [];
  lines.push("### Visual Diff Summary\n");
  lines.push(
    `Total: ${results.summary.total}, Matches: ${results.summary.matches}, Diffs: ${results.summary.mismatches}, Skipped: ${results.summary.skipped}\n`
  );
  if (results.pages.length) {
    lines.push("| Page | Status | Prod | Preview | Diff |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const p of results.pages) {
      const cleanPath = clean(p.path);
      if (p.status === "diff") {
        const prod = encodeImage(
          path.join(baseDir, "prod", `${cleanPath}.png`)
        );
        const prev = encodeImage(
          path.join(baseDir, "preview", `${cleanPath}.png`)
        );
        const diff = encodeImage(
          path.join(baseDir, "diff", `${cleanPath}.png`)
        );
        lines.push(
          `| ${p.path} | <span style="color:#d33">diff</span> | ![](${prod}) | ![](${prev}) | ![](${diff}) |`
        );
      } else {
        const color = p.status === "match" ? "#090" : "#999";
        lines.push(
          `| ${p.path} | <span style="color:${color}">${p.status}</span> | | | |`
        );
      }
    }
  }
  lines.push("");
  lines.push("[Download full report](./visual_diffs/index.html)\n");
  return lines.join("\n");
}

function main() {
  const input = process.argv[2] || path.join("visual_diffs", "results.json");
  const output = process.argv[3] || path.join("visual_diffs", "index.html");
  const results = JSON.parse(fs.readFileSync(input, "utf8"));
  const html = generateHTML(results);
  fs.writeFileSync(output, html);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const markdown = generateMarkdown(results, path.dirname(output));
    fs.appendFileSync(summaryPath, `${markdown}\n`);
  }
}

main();
