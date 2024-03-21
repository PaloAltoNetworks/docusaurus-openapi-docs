/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import { ProcessedSidebarItem } from "@docusaurus/plugin-content-docs/lib/sidebars/types";
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

import { TagGroupObject, TagObject } from "../openapi/types";
import type {
  SidebarOptions,
  APIOptions,
  ApiPageMetadata,
  ApiMetadata,
  SchemaPageMetadata,
} from "../types";

function isApiItem(item: ApiMetadata): item is ApiMetadata {
  return item.type === "api";
}

function isInfoItem(item: ApiMetadata): item is ApiMetadata {
  return item.type === "info";
}

function isSchemaItem(item: ApiMetadata): item is ApiMetadata {
  return item.type === "schema";
}

function groupByTags(
  items: ApiPageMetadata[],
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  tags: TagObject[][],
  docPath: string
): ProcessedSidebar {
  let { outputDir, label } = options;

  // Remove trailing slash before proceeding
  outputDir = outputDir.replace(/\/$/, "");

  const {
    sidebarCollapsed,
    sidebarCollapsible,
    customProps,
    categoryLinkSource,
  } = sidebarOptions;

  const apiItems = items.filter(isApiItem);
  const infoItems = items.filter(isInfoItem);
  const schemaItems = items.filter(isSchemaItem);
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
  // Only include global tag if referenced in operation tags
  let apiTags: string[] = [];
  tags.flat().forEach((tag) => {
    // Should we also check x-displayName?
    if (operationTags.includes(tag.name!)) {
      apiTags.push(tag.name!);
    }
  });
  apiTags = uniq(apiTags.concat(operationTags));

  const basePath = docPath
    ? outputDir.split(docPath!)[1].replace(/^\/+/g, "")
    : outputDir.slice(outputDir.indexOf("/", 1)).replace(/^\/+/g, "");
  function createDocItem(
    item: ApiPageMetadata | SchemaPageMetadata
  ): SidebarItemDoc {
    const sidebar_label = item.frontMatter.sidebar_label;
    const title = item.title;
    const id = item.type === "schema" ? `schemas/${item.id}` : item.id;
    const className =
      item.type === "api"
        ? clsx(
            {
              "menu__list-item--deprecated": item.api.deprecated,
              "api-method": !!item.api.method,
            },
            item.api.method
          )
        : clsx({
            "menu__list-item--deprecated": item.schema.deprecated,
          });
    return {
      type: "doc" as const,
      id: basePath === "" || undefined ? `${id}` : `${basePath}/${id}`,
      label: (sidebar_label as string) ?? title ?? id,
      customProps: customProps,
      className: className ? className : undefined,
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
      // Default to no link config (spindowns only)
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

      if (categoryLinkSource === "auto") {
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

  let schemas: SidebarItemCategory[] = [];
  if (schemaItems.length > 0) {
    schemas = [
      {
        type: "category" as const,
        label: "Schemas",
        collapsible: sidebarCollapsible!,
        collapsed: sidebarCollapsed!,
        items: schemaItems.map(createDocItem),
      },
    ];
  }

  // Shift root intro doc to top of sidebar
  // TODO: Add input validation for categoryLinkSource options
  if (rootIntroDoc && categoryLinkSource !== "info") {
    tagged.unshift(rootIntroDoc as any);
  }

  return [...tagged, ...untagged, ...schemas];
}

export default function generateSidebarSlice(
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  api: ApiMetadata[],
  tags: TagObject[][],
  docPath: string,
  tagGroups?: TagGroupObject[]
) {
  let sidebarSlice: ProcessedSidebar = [];

  if (sidebarOptions.groupPathsBy === "tagGroup") {
    tagGroups?.forEach((tagGroup) => {
      //filter tags only included in group
      const filteredTags: TagObject[] = [];
      tags[0].forEach((tag) => {
        if (tagGroup.tags.includes(tag.name as string)) {
          filteredTags.push(tag);
        }
      });

      const groupCategory = {
        type: "category" as const,
        label: tagGroup.name,
        collapsible: true,
        collapsed: true,
        items: groupByTags(
          api as ApiPageMetadata[],
          sidebarOptions,
          options,
          [filteredTags],
          docPath
        ),
      } as ProcessedSidebarItem;

      sidebarSlice.push(groupCategory);
    });
  } else if (sidebarOptions.groupPathsBy === "tag") {
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
