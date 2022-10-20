/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type Request from "@paloaltonetworks/postman-collection";

import {
  InfoObject,
  OperationObject,
  SecuritySchemeObject,
  TagObject,
} from "./openapi/types";

export type {
  PropSidebarItemCategory,
  SidebarItemLink,
  PropSidebar,
  PropSidebarItem,
} from "@docusaurus/plugin-content-docs-types";
export interface PluginOptions {
  id?: string;
  docsPluginId: string;
  config: {
    [key: string]: APIOptions;
  };
}

export interface APIOptions {
  specPath: string;
  outputDir: string;
  template?: string;
  downloadUrl?: string;
  sidebarOptions?: SidebarOptions;
  version?: string;
  label?: string;
  baseUrl?: string;
  versions?: {
    [key: string]: APIVersionOptions;
  };
}

export interface SidebarOptions {
  groupPathsBy?: string;
  categoryLinkSource?: string;
  customProps?: { [key: string]: unknown };
  sidebarCollapsible?: boolean;
  sidebarCollapsed?: boolean;
}

export interface APIVersionOptions {
  specPath: string;
  outputDir: string;
  label: string;
  baseUrl: string;
}

export interface LoadedContent {
  loadedApi: ApiMetadata[];
  // loadedDocs: DocPageMetadata[]; TODO: cleanup
}

export type ApiMetadata = ApiPageMetadata | InfoPageMetadata | TagPageMetadata;

export interface ApiMetadataBase {
  sidebar?: string;
  previous?: ApiNavLink;
  next?: ApiNavLink;
  //
  id: string; // TODO legacy versioned id => try to remove
  unversionedId: string; // TODO new unversioned id => try to rename to "id"
  infoId?: string;
  infoPath?: string;
  downloadUrl?: string;
  title: string;
  description: string;
  source: string; // @site aliased source => "@site/docs/folder/subFolder/subSubFolder/myDoc.md"
  sourceDirName: string; // relative to the versioned docs folder (can be ".") => "folder/subFolder/subSubFolder"
  slug?: string;
  permalink: string;
  sidebarPosition?: number;
  frontMatter: Record<string, unknown>;
}

export interface ApiPageMetadata extends ApiMetadataBase {
  json?: string;
  type: "api";
  api: ApiItem;
  markdown?: string;
}

export interface ApiItem extends OperationObject {
  method: string; // get, post, put, etc...
  path: string; // The endpoint path => "/api/getPets"
  jsonRequestBodyExample: string;
  securitySchemes?: {
    [key: string]: SecuritySchemeObject;
  };
  postman?: Request;
  info: InfoObject;
}

export interface InfoPageMetadata extends ApiMetadataBase {
  type: "info";
  info: ApiInfo;
  markdown?: string;
  securitySchemes?: {
    [key: string]: SecuritySchemeObject;
  };
}

export interface TagPageMetadata extends ApiMetadataBase {
  type: "tag";
  tag: TagObject;
  markdown?: string;
}

export type ApiInfo = InfoObject;

export interface ApiNavLink {
  title: string;
  permalink: string;
}
