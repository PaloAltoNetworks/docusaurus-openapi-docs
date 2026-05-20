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
  diffAlpha: number;
  summaryFile: string;
  paths: string;
  maxDiffRatio: number;
  navRetries: number;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const opts: Options = {
    previewUrl: "",
    outputDir: "visual_diffs",
    tolerance: 0.3,
    width: 1280,
    viewHeight: 1024,
    concurrency: 4,
    diffAlpha: 1,
    summaryFile: "visual_diffs/results.json",
    paths: "",
    maxDiffRatio: 0.005,
    navRetries: 3,
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
      case "-a":
      case "--diff-alpha":
        opts.diffAlpha = Number(args[++i]);
        break;
      case "-s":
      case "--summary-file":
        opts.summaryFile = args[++i];
        break;
      case "-P":
      case "--paths":
        opts.paths = args[++i];
        break;
      case "-r":
      case "--max-diff-ratio":
        opts.maxDiffRatio = Number(args[++i]);
        break;
      case "--nav-retries":
        opts.navRetries = Number(args[++i]);
        break;
    }
  }
  return opts;
}

// Navigate with retry-on-5xx, then settle the page so screenshots aren't
// taken mid-render. Throws on persistent failure so the caller can mark the
// page as `skip` rather than logging a phantom `diff`.
async function gotoSettled(page: any, url: string, maxAttempts: number) {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
      const status = resp?.status() ?? 0;
      if (status >= 500) {
        throw new Error(`HTTP ${status} for ${url}`);
      }
      // Web fonts loading late are a major source of vertical layout shift.
      await page.evaluate(() => (document as any).fonts?.ready);
      // Scroll the full page to trigger lazy-loaded images/iframes, then
      // return to the top so the screenshot origin is deterministic.
      await page.evaluate(async () => {
        const step = 600;
        const delay = 80;
        while (
          window.scrollY + window.innerHeight <
          document.documentElement.scrollHeight
        ) {
          window.scrollBy(0, step);
          await new Promise((r) => setTimeout(r, delay));
        }
        window.scrollTo(0, 0);
      });
      await page
        .waitForLoadState("networkidle", { timeout: 15_000 })
        .catch(() => undefined);
      // Async client-side work (e.g., Prism syntax highlighting, late hydration)
      // can still be pending after networkidle. Wait until the browser is idle
      // and the next two animation frames have painted before capturing.
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            const done = () =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve())
              );
            if (typeof (window as any).requestIdleCallback === "function") {
              (window as any).requestIdleCallback(done, { timeout: 2000 });
            } else {
              setTimeout(done, 500);
            }
          })
      );
      return;
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts) {
        const backoff = 5_000 * attempt;
        console.warn(
          `Retry ${attempt}/${maxAttempts} for ${url} after ${backoff}ms: ${e}`
        );
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastErr;
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

async function screenshotFullPage(
  page: any,
  url: string,
  outputPath: string,
  navRetries: number
) {
  await gotoSettled(page, url, navRetries);
  // Freeze all CSS animations and transitions before screenshotting so that
  // mid-animation frames don't produce spurious pixel differences.
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }`,
  });
  // Expand details elements by setting the attribute directly; avoid
  // simulating clicks, which can fire framework event handlers and cause
  // re-renders that race with the subsequent screenshot.
  await page.evaluate(() => {
    document.querySelectorAll("div.container details").forEach((el) => {
      (el as HTMLDetailsElement).open = true;
    });
  });
  // Wait until every details element is confirmed open before capturing.
  await page.waitForFunction(
    () =>
      document.querySelectorAll("div.container details:not([open])").length ===
      0
  );
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  const container = await page.$("div.container");
  if (container) {
    await container.screenshot({ path: outputPath });
  } else {
    await page.screenshot({ path: outputPath, fullPage: true });
  }
}

// Crop an image to the given dimensions (which must be <= the image's own).
// Used to bring two captures to a common size by trimming overflow rather
// than padding with transparent black — padding compares blank pixels against
// real content and produces a massive phantom diff at the bottom/right when
// the two captures rendered at different heights.
function cropImage(img: PNG, width: number, height: number): PNG {
  if (img.width === width && img.height === height) {
    return img;
  }
  const out = new PNG({ width, height });
  PNG.bitblt(img, out, 0, 0, width, height, 0, 0);
  return out;
}

function compareImages(
  prodPath: string,
  prevPath: string,
  diffPath: string,
  tolerance: number,
  diffAlpha: number,
  maxDiffRatio: number
): boolean {
  let prod = PNG.sync.read(fs.readFileSync(prodPath));
  let prev = PNG.sync.read(fs.readFileSync(prevPath));
  if (prod.width !== prev.width || prod.height !== prev.height) {
    const width = Math.min(prod.width, prev.width);
    const height = Math.min(prod.height, prev.height);
    console.warn(
      `Size mismatch for ${prevPath}, cropping images to ${width}x${height}`
    );
    prod = cropImage(prod, width, height);
    prev = cropImage(prev, width, height);
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
      alpha: diffAlpha,
    }
  );
  const totalPixels = prod.width * prod.height;
  const diffRatio = totalPixels > 0 ? numDiff / totalPixels : 0;
  if (diffRatio > maxDiffRatio) {
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
  let paths = parseUrlsFromSitemap(sitemapXml);
  if (opts.paths) {
    const regex = new RegExp(opts.paths);
    paths = paths.filter((p) => regex.test(p));
  }
  console.log(`Found ${paths.length} paths.`);

  const browser = await chromium.launch({
    args: ["--disable-font-subpixel-positioning", "--disable-lcd-text"],
  });
  const context = await browser.newContext({
    viewport: { width: opts.width, height: opts.viewHeight },
  });
  // Reserve scrollbar space whether or not a scrollbar is actually shown.
  // Without this, captures where content barely fits the viewport toggle the
  // scrollbar between runs, changing effective page width by ~15px and
  // reflowing flex/grid layouts (e.g., card title ellipsis truncation).
  await context.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "html { scrollbar-gutter: stable; }";
    document.documentElement.appendChild(style);
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
      if (fs.existsSync(prodSnap)) {
        console.log(`CACHED prod: /${cleanPath}`);
      } else {
        await screenshotFullPage(page, url, prodSnap, opts.navRetries);
      }
      await screenshotFullPage(
        page,
        new URL(cleanPath, opts.previewUrl).toString(),
        prevSnap,
        opts.navRetries
      );
      if (
        compareImages(
          prodSnap,
          prevSnap,
          diffImg,
          opts.tolerance,
          opts.diffAlpha,
          opts.maxDiffRatio
        )
      ) {
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
