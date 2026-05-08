/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type { DocFrontMatter as DocusaurusDocFrontMatter } from "@docusaurus/plugin-content-docs";

// Re-export types from plugin for consistency
export type {
  DiscriminatorObject,
  ExternalDocumentationObject,
  SchemaObject,
  XMLObject,
} from "docusaurus-plugin-openapi-docs/src/openapi/types";

export interface ThemeConfig {
  api?: {
    proxy?: string;
    /**
     * Controls how authentication credentials are persisted in the API explorer.
     * - `false`: No persistence (in-memory only)
     * - `"sessionStorage"`: Persist for the browser session (default)
     * - `"localStorage"`: Persist across browser sessions
     */
    authPersistence?: false | "sessionStorage" | "localStorage";
    /** Request timeout in milliseconds. Defaults to 30000 (30 seconds). */
    requestTimeout?: number;
    /**
     * Controls whether cookies and credentials are sent with API requests.
     * - `"omit"`: Never send cookies (useful when docs are on same domain as app)
     * - `"same-origin"`: Send cookies for same-origin requests (default browser behavior)
     * - `"include"`: Always send cookies, even for cross-origin requests
     */
    requestCredentials?: "omit" | "same-origin" | "include";
    /**
     * Controls automatic expansion of nested schema trees in request/response
     * documentation. Inspired by Redoc's `schemaExpansionLevel`.
     *
     * `default` applies whether or not `enabled` is `true` — set
     * `{ default: 1 }` alone to auto-expand the first level on every page
     * without rendering the depth control.
     */
    /**
     * When `true`, suppresses Postman-generated code snippets (HTTP, cURL,
     * language variants, etc.) on a per-operation, per-language basis whenever
     * `x-codeSamples` are provided for that language on that operation.
     * Languages without custom samples render generated snippets normally.
     * Defaults to `false` (both custom and generated snippets render side by
     * side, preserving existing behavior).
     */
    hideGeneratedSnippets?: boolean;
    schemaExpansion?: {
      /** Render an interactive depth control next to each schema header so readers can change the depth at view time. Defaults to `false`. */
      enabled?: boolean;
      /** Initial expansion depth applied on every page load. Use `"all"` to expand everything. Defaults to `0` (all collapsed). */
      default?: number | "all";
      /** Highest numeric depth offered by the UI control. Ignored when `enabled` is `false`. Defaults to `4`. */
      max?: number;
      /** Persist the reader's selected depth in `localStorage`. Only meaningful when `enabled` is `true`; defaults to `true` in that case. */
      persist?: boolean;
    };
  };
}

export interface DocFrontMatter extends DocusaurusDocFrontMatter {
  /** Provides OpenAPI Docs with a reference path to their respective Info Doc */
  info_path?: string;
}
