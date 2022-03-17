/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type { VersionBanner } from "@docusaurus/plugin-content-docs";
import type { Tag, FrontMatterTag } from "@docusaurus/utils";
import type { ContentPaths } from "@docusaurus/utils/lib/markdownLinks";

export interface DocObject {}

export type DocFrontMatter = {
  // Front matter uses snake case
  id?: string;
  title?: string;
  tags?: FrontMatterTag[];
  hide_title?: boolean;
  hide_table_of_contents?: boolean;
  keywords?: string[];
  image?: string;
  description?: string;
  slug?: string;
  sidebar_label?: string;
  sidebar_position?: number;
  sidebar_class_name?: string;
  sidebar_custom_props?: Record<string, unknown>;
  displayed_sidebar?: string | null;
  pagination_label?: string;
  custom_edit_url?: string | null;
  parse_number_prefixes?: boolean;
  toc_min_heading_level?: number;
  toc_max_heading_level?: number;
  pagination_next?: string | null;
  pagination_prev?: string | null;
};

export type LastUpdateData = {
  lastUpdatedAt?: number;
  formattedLastUpdatedAt?: string;
  lastUpdatedBy?: string;
};

export type DocMetadataBase = LastUpdateData & {
  id: string; // TODO legacy versioned id => try to remove
  unversionedId: string; // TODO new unversioned id => try to rename to "id"
  version: string;
  title: string;
  description: string;
  source: string; // @site aliased posix source => "@site/docs/folder/subFolder/subSubFolder/myDoc.md"
  sourceDirName: string; // posix path relative to the versioned docs folder (can be ".") => "folder/subFolder/subSubFolder"
  slug: string;
  permalink: string;
  sidebarPosition?: number;
  editUrl?: string | null;
  tags: Tag[];
  frontMatter: DocFrontMatter & Record<string, unknown>;
};

export type VersionMetadata = ContentPaths & {
  versionName: string; // 1.0.0
  versionLabel: string; // Version 1.0.0
  versionPath: string; // /baseUrl/docs/1.0.0
  tagsPath: string;
  versionEditUrl?: string | undefined;
  versionEditUrlLocalized?: string | undefined;
  versionBanner: VersionBanner | null;
  versionBadge: boolean;
  versionClassName: string;
  isLast: boolean;
  sidebarFilePath: string | false | undefined; // versioned_sidebars/1.0.0.json
  routePriority: number | undefined; // -1 for the latest docs
};
