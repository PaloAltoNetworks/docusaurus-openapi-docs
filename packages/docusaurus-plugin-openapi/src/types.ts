/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type { RemarkAndRehypePluginOptions } from "@docusaurus/mdx-loader";
import { Request } from "postman-collection";

import { OperationObject, SecuritySchemeObject } from "./openapi/types";

export interface PluginOptions extends RemarkAndRehypePluginOptions {
  id: string;
  path: string;
  routeBasePath: string;
  apiLayoutComponent: string;
  apiItemComponent: string;
  admonitions: Record<string, unknown>;
  sidebarCollapsible: boolean;
  sidebarCollapsed: boolean;
}

export interface LoadedContent {
  loadedApi: ApiSection[];
}

export interface ApiSection {
  title: string;
  description: string;
  items: ApiItem[];
}

// TODO: Clean up this object
export interface ApiItem extends OperationObject {
  id: string;
  title: string;
  method: string;
  path: string;
  permalink: string;
  next: Page;
  previous: Page;
  jsonRequestBodyExample: string;
  securitySchemes?: {
    [key: string]: SecuritySchemeObject;
  };
  postman?: Request;
}

export interface Page {
  title: string;
  permalink: string;
}
