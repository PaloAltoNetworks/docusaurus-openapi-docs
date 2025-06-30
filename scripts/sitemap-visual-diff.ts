#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import { XMLParser } from "fast-xml-parser";
import pixelmatch from "pixelmatch";
import { chromium } from "playwright";
import { PNG } from "pngjs";

interface Options {
  previewUrl: string;
  outputDir: string;
  tolerance: number;
  width: number;
  viewHeight: number;
  concurrency: number;
  summaryFile: string;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const opts: Options = {
    previewUrl: "",
    outputDir: "visual_diffs",
    tolerance: 0,
    width: 1280,
    viewHeight: 1024,
    concurrency: 4,
    summaryFile: "visual_diffs/results.json",
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "-p":
      case "--preview-url":
        opts.previewUrl = args[++i];
        break;
      case "-o":
      case "--output-dir":
        opts.outputDir = args[++i];
        break;
      case "-t":
      case "--tolerance":
        opts.tolerance = Number(args[++i]);
        break;
      case "-w":
      case "--width":
        opts.width = Number(args[++i]);
        break;
      case "-v":
      case "--view-height":
        opts.viewHeight = Number(args[++i]);
        break;
      case "-c":
      case "--concurrency":
        opts.concurrency = Number(args[++i]);
        break;
      case "-s":
      case "--summary-file":
        opts.summaryFile = args[++i];
        break;
    }
  }
  return opts;
}

async function fetchSitemap(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);
  return resp.text();
}

function parseUrlsFromSitemap(xml: string): string[] {
  const parser = new XMLParser();
  const result = parser.parse(xml);
  const urls = result.urlset?.url || [];
  const arr = Array.isArray(urls) ? urls : [urls];
  return arr.map((u: any) => String(u.loc).trim()).filter(Boolean);
}

async function screenshotFullPage(page: any, url: string, outputPath: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.querySelectorAll("details").forEach((d) => {
      const summary = d.querySelector("summary");
      if (!d.open && summary) (summary as HTMLElement).click();
      (d as HTMLDetailsElement).open = true;
      d.setAttribute("data-collapsed", "false");
    });
  });
  await page.waitForTimeout(500);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: true });
}

function compareImages(
  prodPath: string,
  prevPath: string,
  diffPath: string,
  tolerance: number
): boolean {
  const prod = PNG.sync.read(fs.readFileSync(prodPath));
  const prev = PNG.sync.read(fs.readFileSync(prevPath));
  if (prod.width !== prev.width || prod.height !== prev.height) {
    console.warn(`Size mismatch for ${prevPath}`);
    return false;
  }
  const diff = new PNG({ width: prod.width, height: prod.height });
  const numDiff = pixelmatch(
    prod.data,
    prev.data,
    diff.data,
    prod.width,
    prod.height,
    {
      threshold: tolerance,
    }
  );
  if (numDiff > 0) {
    fs.mkdirSync(path.dirname(diffPath), { recursive: true });
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    return false;
  }
  return true;
}

async function promisePool<T>(
  items: T[],
  concurrency: number,
  iteratorFn: (item: T) => Promise<void>
) {
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = iteratorFn(item).then(() => {
      executing.splice(executing.indexOf(p), 1);
    });
    executing.push(p);
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
}

async function run() {
  const opts = parseArgs();
  if (!opts.previewUrl) {
    throw new Error("Missing preview URL");
  }
  if (!opts.previewUrl.endsWith("/")) opts.previewUrl += "/";

  const sitemapXml = await fetchSitemap(
    "https://docusaurus-openapi.tryingpan.dev/sitemap.xml"
  );
  const paths = parseUrlsFromSitemap(await sitemapXml);
  console.log(`Found ${paths.length} paths.`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: opts.width, height: opts.viewHeight },
  });
  let total = 0;
  let matches = 0;
  let mismatches = 0;
  let skipped = 0;
  const pages: { path: string; status: string }[] = [];

  async function processPath(url: string) {
    total += 1;
    const cleanPath =
      new URL(url).pathname.replace(/^\//, "").replace(/\/$/, "") || "root";
    const prodSnap = path.join(opts.outputDir, "prod", `${cleanPath}.png`);
    const prevSnap = path.join(opts.outputDir, "preview", `${cleanPath}.png`);
    const diffImg = path.join(opts.outputDir, "diff", `${cleanPath}.png`);
    const page = await context.newPage();
    try {
      await screenshotFullPage(page, url, prodSnap);
      await screenshotFullPage(
        page,
        new URL(cleanPath, opts.previewUrl).toString(),
        prevSnap
      );
      if (compareImages(prodSnap, prevSnap, diffImg, opts.tolerance)) {
        console.log(`MATCH: /${cleanPath}`);
        matches += 1;
        pages.push({ path: `/${cleanPath}`, status: "match" });
      } else {
        console.warn(`DIFF: /${cleanPath}`);
        mismatches += 1;
        pages.push({ path: `/${cleanPath}`, status: "diff" });
      }
    } catch (e) {
      console.warn(`SKIP: /${cleanPath} - ${e}`);
      skipped += 1;
      pages.push({ path: `/${cleanPath}`, status: "skip" });
    }
    await page.close();
  }

  await promisePool(paths, opts.concurrency, processPath);

  await browser.close();
  console.log(
    `Total: ${total}, Matches: ${matches}, Diffs: ${mismatches}, Skipped: ${skipped}`
  );

  await fs.promises.mkdir(path.dirname(opts.summaryFile), { recursive: true });
  await fs.promises.writeFile(
    opts.summaryFile,
    JSON.stringify(
      { summary: { total, matches, mismatches, skipped }, pages },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
