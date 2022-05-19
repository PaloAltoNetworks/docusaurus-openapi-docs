/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import {
  ProcessedSidebar,
  SidebarItemDoc,
} from "@docusaurus/plugin-content-docs/src/sidebars/types";
import clsx from "clsx";
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

function groupByTags(
  items: ApiPageMetadata[],
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  tags: TagObject[]
): ProcessedSidebar {
  // TODO: Figure out how to handle these
  // const intros = items.filter(isInfoItem).map((item) => {
  //   return {
  //     type: "link" as const,
  //     label: item.title,
  //     href: item.permalink,
  //     docId: item.id,
  //   };
  // });

  const { outputDir } = options;
  const { sidebarCollapsed, sidebarCollapsible, customProps } = sidebarOptions;

  const apiItems = items.filter(isApiItem);

  // TODO: make sure we only take the first tag
  const tags_ = uniq(
    apiItems
      .flatMap((item) => item.api.tags)
      .filter((item): item is string => !!item)
  );

  // TODO: optimize this or make it a function
  const basePath = outputDir
    .slice(outputDir.indexOf("/", 1))
    .replace(/^\/+/g, "");

  function createDocItem(item: ApiPageMetadata): SidebarItemDoc {
    const sidebar_label = item.frontMatter.sidebar_label;
    const title = item.title;
    const id = item.id;
    return {
      type: "doc" as const,
      id: `${basePath}/${item.id}`,
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

  const tagged = tags_
    .map((tag) => {
      return {
        type: "category" as const,
        label: tag,
        link: {
          type: "generated-index",
          title: tag,
          description: "Learn about the most important Docusaurus concepts!",
          slug: "/category/docusaurus-guides",
          keywords: ["guides"],
          image: "/img/docusaurus.png",
        },
        collapsible: sidebarCollapsible,
        collapsed: sidebarCollapsed,
        items: apiItems
          .filter((item) => !!item.api.tags?.includes(tag))
          .map(createDocItem),
      };
    })
    .filter((item) => item.items.length > 0); // Filter out any categories with no items.

  // const untagged = [
  //   // TODO: determine if needed and how
  //   {
  //     type: "category" as const,
  //     label: "UNTAGGED",
  //     // collapsible: options.sidebarCollapsible, TODO: add option
  //     // collapsed: options.sidebarCollapsed, TODO: add option
  //     items: apiItems
  //       //@ts-ignore
  //       .filter(({ api }) => api.tags === undefined || api.tags.length === 0)
  //       .map(createDocItem),
  //   },
  // ];
  return [...tagged];
}

export default function generateSidebarSlice(
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  api: ApiMetadata[],
  tags: TagObject[]
) {
  let sidebarSlice: ProcessedSidebar = [];
  if (sidebarOptions.groupPathsBy === "tags") {
    sidebarSlice = groupByTags(
      api as ApiPageMetadata[],
      sidebarOptions,
      options,
      tags
    );
  }
  return sidebarSlice;
}
