/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import { posixPath } from "@docusaurus/utils";
import chalk from "chalk";

import {
  createApiMarkdown,
  createInfoMarkdown,
  createSchemaMarkdown,
  createTagMarkdown,
  OperationLink,
} from "./pages";
import { toMarkdownUrl } from "./utils";
import { createItems, readOpenapiFiles } from "../openapi/openapi";
import type { APIOptions, ApiMetadata, PluginOptions } from "../types";

export {
  createApiMarkdown,
  createInfoMarkdown,
  createSchemaMarkdown,
  createTagMarkdown,
} from "./pages";
export { formatSchema } from "./schema";
export { toMarkdownUrl } from "./utils";

interface DocMetadata {
  source: string;
  permalink: string;
}

interface LoadedPluginLike {
  name?: string;
  options?: { id?: string };
  content?: unknown;
}

function isURL(str: string): boolean {
  return /^(https?:)\/\//m.test(str);
}

/**
 * Lists every spec configuration that has markdownExport enabled, including
 * versions, which inherit the setting from their parent configuration.
 */
export function getMarkdownExportConfigs(
  config: PluginOptions["config"]
): APIOptions[] {
  const result: APIOptions[] = [];
  for (const apiOptions of Object.values(config ?? {})) {
    if (!apiOptions?.markdownExport) continue;
    const { versions, version, label, baseUrl, downloadUrl, ...parent } =
      apiOptions;
    result.push(apiOptions);
    for (const versionOptions of Object.values(versions ?? {})) {
      result.push({ ...parent, ...versionOptions } as APIOptions);
    }
  }
  return result;
}

export function getDocsByPath(
  plugins: LoadedPluginLike[],
  docsPluginId: string
): Map<string, DocMetadata> {
  const docs = new Map<string, DocMetadata>();
  const docsPlugin = plugins.find(
    (plugin) =>
      (plugin.options?.id ?? "default") === docsPluginId &&
      Array.isArray((plugin.content as any)?.loadedVersions)
  );
  for (const version of (docsPlugin?.content as any)?.loadedVersions ?? []) {
    for (const doc of version.docs ?? []) {
      if (doc?.source && doc?.permalink) {
        docs.set(doc.source, { source: doc.source, permalink: doc.permalink });
      }
    }
  }
  return docs;
}

export function getDocSource(
  siteDir: string,
  outputDir: string,
  item: ApiMetadata
): string {
  const relativeDir = posixPath(
    path.relative(siteDir, path.resolve(siteDir, outputDir.replace(/\/$/, "")))
  );
  const file =
    item.type === "schema"
      ? `schemas/${item.id}.schema.mdx`
      : `${item.id}.${item.type}.mdx`;
  return `@site/${relativeDir}/${file}`;
}

export function resolveSpecUrl(
  downloadUrl: string | undefined,
  baseUrl: string
): string | undefined {
  if (!downloadUrl) return undefined;
  if (isURL(downloadUrl) || !downloadUrl.startsWith("/")) return downloadUrl;
  if (downloadUrl.startsWith(baseUrl)) return downloadUrl;
  return `${baseUrl.replace(/\/+$/, "")}${downloadUrl}`;
}

function formatPage(
  item: ApiMetadata,
  operations: OperationLink[],
  specUrl?: string
): string {
  switch (item.type) {
    case "api":
      return createApiMarkdown(item, specUrl);
    case "schema":
      return createSchemaMarkdown(item);
    case "info":
      return createInfoMarkdown(item, operations, specUrl);
    case "tag":
      return createTagMarkdown(item, operations);
    default:
      return "";
  }
}

async function loadItems(
  siteDir: string,
  apiOptions: APIOptions
): Promise<ApiMetadata[]> {
  const specPath = isURL(apiOptions.specPath)
    ? apiOptions.specPath
    : path.resolve(siteDir, apiOptions.specPath);
  const files = await readOpenapiFiles(specPath);
  return files
    .filter((file) => file.data !== undefined)
    .flatMap((file) =>
      createItems(file.data, apiOptions, apiOptions.sidebarOptions ?? {})
    );
}

export async function writeMarkdownExports({
  siteDir,
  outDir,
  baseUrl,
  plugins,
  options,
  docsInstanceId,
}: {
  siteDir: string;
  outDir: string;
  baseUrl: string;
  plugins: LoadedPluginLike[];
  options: PluginOptions;
  docsInstanceId: string;
}): Promise<number> {
  const configs = getMarkdownExportConfigs(options.config);
  if (configs.length === 0) return 0;

  const docs = getDocsByPath(plugins, docsInstanceId);
  let written = 0;

  for (const apiOptions of configs) {
    let items: ApiMetadata[];
    try {
      items = await loadItems(siteDir, apiOptions);
    } catch (err) {
      console.error(
        chalk.red(`Markdown export failed to load "${apiOptions.specPath}"`),
        chalk.yellow(err)
      );
      continue;
    }

    const specUrl = resolveSpecUrl(apiOptions.downloadUrl, baseUrl);
    const urlFor = (item: ApiMetadata): string | undefined => {
      const doc = docs.get(getDocSource(siteDir, apiOptions.outputDir, item));
      return doc ? toMarkdownUrl(doc.permalink) : undefined;
    };

    const operations: OperationLink[] = items
      .filter((item) => item.type === "api")
      .map((item: any) => ({
        title: item.title,
        method: item.api.method,
        path: item.api.path,
        url: urlFor(item),
        tags: item.api.tags,
      }));

    for (const item of items) {
      const url = urlFor(item);
      if (!url) continue;
      const relativeUrl = url.startsWith(baseUrl)
        ? url.slice(baseUrl.length)
        : url.replace(/^\/+/, "");
      const filePath = path.join(outDir, relativeUrl);
      try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(
          filePath,
          formatPage(item, operations, specUrl),
          "utf8"
        );
        written += 1;
      } catch (err) {
        console.error(
          chalk.red(`Failed to write markdown export "${filePath}"`),
          chalk.yellow(err)
        );
      }
    }
  }

  console.log(chalk.green(`Markdown export: wrote ${written} page(s).`));
  return written;
}
