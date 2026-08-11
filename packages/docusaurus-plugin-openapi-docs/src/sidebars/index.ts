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
  InfoPageMetadata,
  SchemaPageMetadata,
  ApiDocItemGenerator,
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

const createDocItem: ApiDocItemGenerator = (
  item,
  { sidebarOptions: { customProps }, basePath }
) => {
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
      : clsx(
          {
            "menu__list-item--deprecated": item.schema.deprecated,
          },
          "schema"
        );
  return {
    type: "doc" as const,
    id: basePath === "" || undefined ? `${id}` : `${basePath}/${id}`,
    label: (sidebar_label as string) ?? title ?? id,
    customProps: customProps,
    className: className ? className : undefined,
  };
};

function groupByTags(
  items: ApiMetadata[],
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  tags: TagObject[][],
  docPath: string,
  tagGroupKey?: string
): ProcessedSidebar {
  let { outputDir, label, showSchemas } = options;

  // Remove trailing slash before proceeding
  outputDir = outputDir.replace(/\/$/, "");

  const { sidebarCollapsed, sidebarCollapsible, categoryLinkSource } =
    sidebarOptions;

  const apiItems = items.filter(isApiItem) as ApiPageMetadata[];
  const infoItems = items.filter(isInfoItem) as InfoPageMetadata[];
  const schemaItems = items.filter(isSchemaItem) as SchemaPageMetadata[];
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
  const schemaTags = uniq(
    schemaItems
      .flatMap((item) => item.schema["x-tags"])
      .filter((item): item is string => !!item)
  );

  // Combine globally defined tags with operation and schema tags
  // Only include global tag if referenced in operation/schema tags
  let apiTags: string[] = [];
  tags.flat().forEach((tag) => {
    // Should we also check x-displayName?
    if (operationTags.includes(tag.name!) || schemaTags.includes(tag.name!)) {
      apiTags.push(tag.name!);
    }
  });

  if (sidebarOptions.groupPathsBy !== "tagGroup") {
    apiTags = uniq(apiTags.concat(operationTags, schemaTags));
  }

  // Extract base path from outputDir, handling cases where docPath may not be in outputDir
  const getBasePathFromOutput = (
    output: string,
    doc: string | undefined
  ): string => {
    if (doc && output.startsWith(doc + "/")) {
      return output.substring((doc + "/").length);
    }
    const slashIndex = output.indexOf("/", 1);
    return slashIndex === -1
      ? ""
      : output.slice(slashIndex).replace(/^\/+/g, "");
  };

  const basePath = getBasePathFromOutput(outputDir, docPath);

  const createDocItemFnContext = {
    sidebarOptions,
    basePath,
  };
  const createDocItemFn =
    sidebarOptions.sidebarGenerators?.createDocItem ?? createDocItem;

  let rootIntroDoc = undefined;
  if (infoItems.length === 1) {
    const infoItem = infoItems[0];
    const id = infoItem.id;
    const docId = basePath === "" || undefined ? `${id}` : `${basePath}/${id}`;
    rootIntroDoc = {
      type: "doc" as const,
      id: docId,
      ...(tagGroupKey && { key: kebabCase(`${tagGroupKey}-${docId}`) }),
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
          tag === t.name && {
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

      const taggedApiItems = apiItems.filter(
        (item) => !!item.api.tags?.includes(tag)
      );
      const taggedSchemaItems = schemaItems.filter(
        (item) => !!item.schema["x-tags"]?.includes(tag)
      );

      const categoryLabel = tagObject?.["x-displayName"] ?? tag;
      const categoryKey = tagGroupKey
        ? kebabCase(`${tagGroupKey}-${categoryLabel}`)
        : undefined;

      return {
        type: "category" as const,
        label: categoryLabel,
        ...(categoryKey && { key: categoryKey }),
        link: linkConfig,
        collapsible: sidebarCollapsible,
        collapsed: sidebarCollapsed,
        items: [...taggedSchemaItems, ...taggedApiItems].map((item) => {
          const docItem = createDocItemFn(item, createDocItemFnContext);
          if (tagGroupKey && docItem.type === "doc") {
            return {
              ...docItem,
              key: kebabCase(`${tagGroupKey}-${tag}-${docItem.id}`),
            };
          }
          return docItem;
        }),
      };
    })
    .filter((item) => item.items.length > 0); // Filter out any categories with no items.

  // Handle items with no tag
  const untaggedItems = apiItems
    .filter(({ api }) => api.tags === undefined || api.tags.length === 0)
    .map((item) => createDocItemFn(item, createDocItemFnContext));
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
          .map((item) => createDocItemFn(item, createDocItemFnContext)),
      },
    ];
  }

  let schemas: SidebarItemCategory[] = [];
  if (showSchemas && schemaItems.length > 0) {
    schemas = [
      {
        type: "category" as const,
        label: "Schemas",
        collapsible: sidebarCollapsible!,
        collapsed: sidebarCollapsed!,
        items: schemaItems
          .filter(({ schema }) => !schema["x-tags"])
          .map((item) => createDocItemFn(item, createDocItemFnContext)),
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

// Nest the flat tag categories produced by `groupByTags` into a hierarchy
// driven by the OpenAPI 3.2 `tags[].parent` field.
function nestByTagParents(
  flatSidebar: ProcessedSidebar,
  tags: TagObject[][],
  sidebarOptions: SidebarOptions
): ProcessedSidebar {
  const { sidebarCollapsed, sidebarCollapsible } = sidebarOptions;

  // Dedupe global tags by name, preserving declaration order.
  const seen = new Set<string>();
  const uniqueTags: TagObject[] = [];
  tags.flat().forEach((tag) => {
    if (tag.name && !seen.has(tag.name)) {
      seen.add(tag.name);
      uniqueTags.push(tag);
    }
  });
  const tagByName = new Map(uniqueTags.map((t) => [t.name!, t]));

  // Resolve a tag's effective parent, guarding against dangling refs and
  // cycles (both are treated as "no parent" so the tag becomes a root).
  const effectiveParent = (tag: TagObject): string | undefined => {
    if (!tag.parent || !tagByName.has(tag.parent)) return undefined;
    const chain = new Set<string>([tag.name!]);
    let cursor: TagObject | undefined = tagByName.get(tag.parent);
    while (cursor) {
      if (chain.has(cursor.name!)) return undefined; // cycle -> treat as root
      chain.add(cursor.name!);
      if (!cursor.parent || !tagByName.has(cursor.parent)) break;
      cursor = tagByName.get(cursor.parent);
    }
    return tag.parent;
  };

  // Keep the root intro doc(s) at the front and the UNTAGGED/Schemas
  // categories at the end; only the remaining tag categories get nested.
  const isTrailing = (item: ProcessedSidebarItem) =>
    item.type === "category" &&
    (item.label === "UNTAGGED" || item.label === "Schemas");
  const leading = flatSidebar.filter((item) => item.type === "doc");
  const trailing = flatSidebar.filter((item) => isTrailing(item));
  const tagCategories = flatSidebar.filter(
    (item) => item.type === "category" && !isTrailing(item)
  ) as SidebarItemCategory[];

  // Claim each generated category to a tag, matched by its display label.
  const claimed = new Set<SidebarItemCategory>();
  const categoryByTag = new Map<string, SidebarItemCategory>();
  uniqueTags.forEach((tag) => {
    const label = tag["x-displayName"] ?? tag.name;
    const match = tagCategories.find(
      (cat) => !claimed.has(cat) && cat.label === label
    );
    if (match) {
      claimed.add(match);
      categoryByTag.set(tag.name!, match);
    }
  });

  const childrenOf = (name: string | undefined) =>
    uniqueTags.filter((tag) => effectiveParent(tag) === name);

  const buildNode = (tag: TagObject): ProcessedSidebarItem | null => {
    const childNodes = childrenOf(tag.name)
      .map(buildNode)
      .filter((node): node is ProcessedSidebarItem => node !== null);
    const flatCategory = categoryByTag.get(tag.name!);
    const docItems = flatCategory ? flatCategory.items : [];
    // Prune tags that have neither their own operations nor any children.
    if (docItems.length === 0 && childNodes.length === 0) {
      return null;
    }
    return {
      type: "category" as const,
      label: flatCategory?.label ?? tag["x-displayName"] ?? tag.name,
      ...(flatCategory?.link && { link: flatCategory.link }),
      collapsible: sidebarCollapsible,
      collapsed: sidebarCollapsed,
      items: [...docItems, ...childNodes],
    } as ProcessedSidebarItem;
  };

  const roots = childrenOf(undefined)
    .map(buildNode)
    .filter((node): node is ProcessedSidebarItem => node !== null);

  // Preserve any categories that couldn't be matched to a declared tag
  // (e.g. operation-only tags never listed under top-level `tags`).
  const orphans = tagCategories.filter((cat) => !claimed.has(cat));

  return [...leading, ...roots, ...orphans, ...trailing];
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
    let schemasGroup: ProcessedSidebar = [];
    tagGroups?.forEach((tagGroup) => {
      //filter tags only included in group
      const filteredTags: TagObject[] = [];
      tags[0].forEach((tag) => {
        if (tagGroup.tags.includes(tag.name as string)) {
          filteredTags.push(tag);
        }
      });

      const tagGroupKey = kebabCase(tagGroup.name);

      const groupCategory = {
        type: "category" as const,
        label: tagGroup.name,
        collapsible: true,
        collapsed: true,
        items: groupByTags(
          api,
          sidebarOptions,
          options,
          [filteredTags],
          docPath,
          tagGroupKey
        ),
      };

      if (options.showSchemas) {
        // For the first tagGroup, save the generated "Schemas" category for later.
        if (schemasGroup.length === 0) {
          schemasGroup = groupCategory.items?.filter(
            (item) => item.type === "category" && item.label === "Schemas"
          );
        }
        // Remove the "Schemas" category from every `groupCategory`.
        groupCategory.items = groupCategory.items.filter((item) =>
          "label" in item ? item.label !== "Schemas" : true
        );
      }
      sidebarSlice.push(groupCategory as ProcessedSidebarItem);
    });
    // Add `schemasGroup` to the end of the sidebar.
    sidebarSlice.push(...schemasGroup);
  } else if (sidebarOptions.groupPathsBy === "tagParent") {
    const flat = groupByTags(api, sidebarOptions, options, tags, docPath);
    sidebarSlice = nestByTagParents(flat, tags, sidebarOptions);
  } else if (sidebarOptions.groupPathsBy === "tag") {
    sidebarSlice = groupByTags(api, sidebarOptions, options, tags, docPath);
  }

  return sidebarSlice;
}
