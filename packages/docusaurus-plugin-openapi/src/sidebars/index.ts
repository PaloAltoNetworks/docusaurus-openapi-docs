/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import {
  CategoryMetadataFile,
  CategoryMetadataFilenameBase,
} from "@docusaurus/plugin-content-docs/lib/sidebars/generator";
import { validateCategoryMetadataFile } from "@docusaurus/plugin-content-docs/lib/sidebars/validation";
import { posixPath } from "@docusaurus/utils";
import chalk from "chalk";
import clsx from "clsx";
import fs from "fs-extra";
import Yaml from "js-yaml";
import { groupBy, uniq } from "lodash";
import type { DeepPartial } from "utility-types";

import type {
  InfoPageMetadata,
  PropSidebar,
  PropSidebarItemCategory,
} from "../types";
import { ApiPageMetadata } from "../types";

interface Options {
  contentPath: string;
  sidebarCollapsible: boolean;
  sidebarCollapsed: boolean;
}

type keys = "type" | "title" | "permalink" | "id" | "source" | "sourceDirName";

type InfoItem = Pick<InfoPageMetadata, keys>;
type ApiItem = Pick<ApiPageMetadata, keys> & {
  api: DeepPartial<ApiPageMetadata["api"]>;
};

type Item = InfoItem | ApiItem;

function isApiItem(item: Item): item is ApiItem {
  return item.type === "api";
}

function isInfoItem(item: Item): item is InfoItem {
  return item.type === "info";
}

const Terminator = "."; // a file or folder can never be "."
const BreadcrumbSeparator = "/";
function getBreadcrumbs(dir: string) {
  if (dir === Terminator) {
    // this isn't actually needed, but removing would result in an array: [".", "."]
    return [Terminator];
  }
  return [...dir.split(BreadcrumbSeparator).filter(Boolean), Terminator];
}

export async function generateSidebar(
  items: Item[],
  options: Options
): Promise<PropSidebar> {
  const sourceGroups = groupBy(items, (item) => item.source);

  let sidebar: PropSidebar = [];
  let visiting = sidebar;
  for (const items of Object.values(sourceGroups)) {
    if (items.length === 0) {
      // Since the groups are created based on the items, there should never be a length of zero.
      console.warn(chalk.yellow(`Unnexpected empty group!`));
      continue;
    }

    const { sourceDirName, source } = items[0];

    const breadcrumbs = getBreadcrumbs(sourceDirName);

    let currentPath = [];
    for (const crumb of breadcrumbs) {
      // We hit a spec file, create the groups for it.
      if (crumb === Terminator) {
        const title = items.filter(isApiItem)[0]?.api.info?.title;
        const fileName = path.basename(source, path.extname(source));
        // Title could be an empty string so `??` won't work here.
        const label = !title ? fileName : title;
        visiting.push({
          type: "category" as const,
          label,
          collapsible: options.sidebarCollapsible,
          collapsed: options.sidebarCollapsed,
          items: groupByTags(items, options),
        });
        visiting = sidebar; // reset
        break;
      }

      // Read category file to generate a label for the current path.
      currentPath.push(crumb);
      const categoryPath = path.join(options.contentPath, ...currentPath);
      const meta = await readCategoryMetadataFile(categoryPath);
      const label = meta?.label ?? crumb;

      // Check for existing categories for the current label.
      const existingCategory = visiting
        .filter((c): c is PropSidebarItemCategory => c.type === "category")
        .find((c) => c.label === label);

      // If exists, skip creating a new one.
      if (existingCategory) {
        visiting = existingCategory.items;
        continue;
      }

      // Otherwise, create a new one.
      const newCategory = {
        type: "category" as const,
        label,
        collapsible: options.sidebarCollapsible,
        collapsed: options.sidebarCollapsed,
        items: [],
      };
      visiting.push(newCategory);
      visiting = newCategory.items;
    }
  }

  // The first group should always be a category, but check for type narrowing
  if (sidebar.length === 1 && sidebar[0].type === "category") {
    return sidebar[0].items;
  }

  return sidebar;
}

/**
 * Takes a flat list of pages and groups them into categories based on there tags.
 */
function groupByTags(items: Item[], options: Options): PropSidebar {
  const intros = items.filter(isInfoItem).map((item) => {
    return {
      type: "link" as const,
      label: item.title,
      href: item.permalink,
      docId: item.id,
    };
  });

  const apiItems = items.filter(isApiItem);

  const tags = uniq(
    apiItems
      .flatMap((item) => item.api.tags)
      .filter((item): item is string => !!item)
  );

  function createLink(item: ApiItem) {
    return {
      type: "link" as const,
      label: item.title,
      href: item.permalink,
      docId: item.id,
      className: clsx(
        {
          "menu__list-item--deprecated": item.api.deprecated,
          "api-method": !!item.api.method,
        },
        item.api.method
      ),
    };
  }

  const tagged = tags
    .map((tag) => {
      return {
        type: "category" as const,
        label: tag,
        collapsible: options.sidebarCollapsible,
        collapsed: options.sidebarCollapsed,
        items: apiItems
          .filter((item) => !!item.api.tags?.includes(tag))
          .map(createLink),
      };
    })
    .filter((item) => item.items.length > 0); // Filter out any categories with no items.

  const untagged = [
    {
      type: "category" as const,
      label: "API",
      collapsible: options.sidebarCollapsible,
      collapsed: options.sidebarCollapsed,
      items: apiItems
        .filter(({ api }) => api.tags === undefined || api.tags.length === 0)
        .map(createLink),
    },
  ];

  return [...intros, ...tagged, ...untagged];
}

/**
 * Taken from: https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-plugin-content-docs/src/sidebars/generator.ts
 */
async function readCategoryMetadataFile(
  categoryDirPath: string
): Promise<CategoryMetadataFile | null> {
  async function tryReadFile(filePath: string): Promise<CategoryMetadataFile> {
    const contentString = await fs.readFile(filePath, { encoding: "utf8" });
    const unsafeContent = Yaml.load(contentString);
    try {
      return validateCategoryMetadataFile(unsafeContent);
    } catch (e) {
      console.error(
        chalk.red(
          `The docs sidebar category metadata file path=${filePath} looks invalid!`
        )
      );
      throw e;
    }
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const ext of [".json", ".yml", ".yaml"]) {
    // Simpler to use only posix paths for mocking file metadata in tests
    const filePath = posixPath(
      path.join(categoryDirPath, `${CategoryMetadataFilenameBase}${ext}`)
    );
    if (await fs.pathExists(filePath)) {
      return tryReadFile(filePath);
    }
  }
  return null;
}
