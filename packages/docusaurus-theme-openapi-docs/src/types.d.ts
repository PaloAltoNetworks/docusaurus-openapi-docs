/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type { DocFrontMatter as DocusaurusDocFrontMatter } from "@docusaurus/plugin-content-docs";
import type {
  JSONSchema4,
  JSONSchema6,
  JSONSchema7,
  JSONSchema7TypeName,
} from "json-schema";

export type SchemaType = JSONSchema7TypeName;

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
  };
}

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
export type SchemaObject = Omit<
  JSONSchema,
  | "type"
  | "allOf"
  | "oneOf"
  | "anyOf"
  | "not"
  | "items"
  | "properties"
  | "additionalProperties"
> & {
  // OpenAPI specific overrides
  type?: "string" | "number" | "integer" | "boolean" | "object" | "array";
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  not?: SchemaObject;
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
  additionalProperties?: boolean | SchemaObject;

  // OpenAPI additions
  nullable?: boolean;
  discriminator?: DiscriminatorObject;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XMLObject;
  externalDocs?: ExternalDocumentationObject;
  example?: any;
  deprecated?: boolean;
};

export interface DiscriminatorObject {
  propertyName: string;
  mapping?: Record<string, string>;
}

export interface XMLObject {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}

export interface DocFrontMatter extends DocusaurusDocFrontMatter {
  /** Provides OpenAPI Docs with a reference path to their respective Info Doc */
  info_path?: string;
}

// OpenAPI Server types
export interface ServerObject {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariable>;
}

export interface ServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

// OpenAPI Parameter types
export interface ParameterObject {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: string;
  allowReserved?: boolean;
  schema?: SchemaObject;
  example?: any;
  examples?: Record<string, ExampleObject>;
  content?: Record<string, MediaTypeObject>;
  param?: object;
  "x-enumDescriptions"?: Record<string, string>;
}

// OpenAPI Request Body types
export interface RequestBodyObject {
  description?: string;
  content: Record<string, MediaTypeObject>;
  required?: boolean;
}

export interface MediaTypeObject {
  schema?: SchemaObject;
  example?: any;
  examples?: Record<string, ExampleObject>;
  encoding?: Record<string, EncodingObject>;
  type?: any;
}

export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export interface EncodingObject {
  contentType?: string;
  headers?: Record<string, any>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

// OpenAPI Security types
export type SecuritySchemeObject =
  | ApiKeySecuritySchemeObject
  | HttpSecuritySchemeObject
  | Oauth2SecuritySchemeObject
  | OpenIdConnectSecuritySchemeObject;

export interface ApiKeySecuritySchemeObject {
  type: "apiKey";
  description?: string;
  name: string;
  in: "query" | "header" | "cookie";
}

export interface HttpSecuritySchemeObject {
  type: "http";
  description?: string;
  scheme: string;
  bearerFormat?: string;
  name?: string;
  in?: string;
}

export interface Oauth2SecuritySchemeObject {
  type: "oauth2";
  description?: string;
  flows: OAuthFlowsObject;
}

export interface OpenIdConnectSecuritySchemeObject {
  type: "openIdConnect";
  description?: string;
  openIdConnectUrl: string;
}

export interface OAuthFlowsObject {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}

export interface OAuthFlowObject {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export type SecurityRequirementObject = Record<string, string[]>;
