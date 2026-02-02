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
  };
}

export interface DocFrontMatter extends DocusaurusDocFrontMatter {
  /** Provides OpenAPI Docs with a reference path to their respective Info Doc */
  info_path?: string;
}
