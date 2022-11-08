/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import {
  ProcessedSidebar,
  SidebarItemCategory,
  SidebarItemCategoryLinkConfig,
  SidebarItemDoc,
} from "@docusaurus/plugin-content-docs/src/sidebars/types";
import { posixPath } from "@docusaurus/utils";
import clsx from "clsx";
import { kebabCase } from "lodash";
import uniq from "lodash/uniq";

import { TagObject } from "../openapi/types";
import type {
  SidebarOptions,
  APIOptions,
  ApiPageMetadata,
  ApiMetadata,
} from "../types";

function isApiItem(item: ApiMetadata): item is ApiMetadata {
  return item.type === "api";
}

function isInfoItem(item: ApiMetadata): item is ApiMetadata {
  return item.type === "info";
}

function groupByTags(
  items: ApiPageMetadata[],
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  tags: TagObject[][],
  docPath: string
): ProcessedSidebar {
  const { outputDir, label } = options;
  const {
    sidebarCollapsed,
    sidebarCollapsible,
    customProps,
    categoryLinkSource,
  } = sidebarOptions;

  const apiItems = items.filter(isApiItem);
  const infoItems = items.filter(isInfoItem);
  const intros = infoItems.map((item: any) => {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.info.tags,
    };
  });

  // TODO: make sure we only take the first tag
  const operationTags = uniq(
    apiItems
      .flatMap((item) => item.api.tags)
      .filter((item): item is string => !!item)
  );

  // Combine globally defined tags with operation tags
  let apiTags: string[] = [];
  tags.flat().forEach((tag) => {
    apiTags.push(tag.name!);
  });
  apiTags = uniq(apiTags.concat(operationTags));

  const basePath = docPath
    ? outputDir.split(docPath!)[1].replace(/^\/+/g, "")
    : outputDir.slice(outputDir.indexOf("/", 1)).replace(/^\/+/g, "");
  function createDocItem(item: ApiPageMetadata): SidebarItemDoc {
    const sidebar_label = item.frontMatter.sidebar_label;
    const title = item.title;
    const id = item.id;
    return {
      type: "doc" as const,
      id:
        basePath === "" || undefined ? `${item.id}` : `${basePath}/${item.id}`,
      label: (sidebar_label as string) ?? title ?? id,
      customProps: customProps,
      className: clsx(
        {
          "menu__list-item--deprecated": item.api.deprecated,
          "api-method": !!item.api.method,
        },
        item.api.method
      ),
    };
  }

  let rootIntroDoc = undefined;
  if (infoItems.length === 1) {
    const infoItem = infoItems[0];
    const id = infoItem.id;
    rootIntroDoc = {
      type: "doc" as const,
      id: basePath === "" || undefined ? `${id}` : `${basePath}/${id}`,
    };
  }

  const tagged = apiTags
    .map((tag) => {
      // Map info object to tag
      const taggedInfoObject = intros.find((i) =>
        i.tags ? i.tags.find((t: any) => t.name === tag) : undefined
      );
      const tagObject = tags.flat().find(
        (t) =>
          tag === t.name ?? {
            name: tag,
            description: `${tag} Index`,
          }
      );

      // TODO: perhaps move this into a getLinkConfig() function
      let linkConfig = undefined;
      if (taggedInfoObject !== undefined && categoryLinkSource === "info") {
        linkConfig = {
          type: "doc",
          id:
            basePath === "" || undefined
              ? `${taggedInfoObject.id}`
              : `${basePath}/${taggedInfoObject.id}`,
        } as SidebarItemCategoryLinkConfig;
      }

      // TODO: perhaps move this into a getLinkConfig() function
      if (tagObject !== undefined && categoryLinkSource === "tag") {
        const tagId = kebabCase(tagObject.name);
        linkConfig = {
          type: "doc",
          id:
            basePath === "" || undefined ? `${tagId}` : `${basePath}/${tagId}`,
        } as SidebarItemCategoryLinkConfig;
      }

      // Default behavior
      if (categoryLinkSource === undefined) {
        linkConfig = {
          type: "generated-index" as "generated-index",
          title: tag,
          slug: label
            ? posixPath(
                path.join(
                  "/category",
                  basePath,
                  kebabCase(label),
                  kebabCase(tag)
                )
              )
            : posixPath(path.join("/category", basePath, kebabCase(tag))),
        } as SidebarItemCategoryLinkConfig;
      }

      return {
        type: "category" as const,
        label: tagObject?.["x-displayName"] ?? tag,
        link: linkConfig,
        collapsible: sidebarCollapsible,
        collapsed: sidebarCollapsed,
        items: apiItems
          .filter((item) => !!item.api.tags?.includes(tag))
          .map(createDocItem),
      };
    })
    .filter((item) => item.items.length > 0); // Filter out any categories with no items.

  // Handle items with no tag
  const untaggedItems = apiItems
    .filter(({ api }) => api.tags === undefined || api.tags.length === 0)
    .map(createDocItem);
  let untagged: SidebarItemCategory[] = [];
  if (untaggedItems.length > 0) {
    untagged = [
      {
        type: "category" as const,
        label: "UNTAGGED",
        collapsible: sidebarCollapsible!,
        collapsed: sidebarCollapsed!,
        items: apiItems
          .filter(({ api }) => api.tags === undefined || api.tags.length === 0)
          .map(createDocItem),
      },
    ];
  }

  // Shift root intro doc to top of sidebar
  // TODO: Add input validation for categoryLinkSource options
  if (rootIntroDoc && categoryLinkSource !== "info") {
    tagged.unshift(rootIntroDoc as any);
  }

  return [...tagged, ...untagged];
}

export default function generateSidebarSlice(
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  api: ApiMetadata[],
  tags: TagObject[][],
  docPath: string
) {
  let sidebarSlice: ProcessedSidebar = [];
  if (sidebarOptions.groupPathsBy === "tag") {
    sidebarSlice = groupByTags(
      api as ApiPageMetadata[],
      sidebarOptions,
      options,
      tags,
      docPath
    );
  }
  return sidebarSlice;
}
