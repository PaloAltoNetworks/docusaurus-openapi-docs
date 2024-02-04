import type Request from "@paloaltonetworks/postman-collection";
import { InfoObject, OperationObject, SecuritySchemeObject, TagObject } from "./openapi/types";
export type { PropSidebarItemCategory, SidebarItemLink, PropSidebar, PropSidebarItem, } from "@docusaurus/plugin-content-docs-types";
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
    hideSendButton?: boolean;
    showExtensions?: boolean;
    sidebarOptions?: SidebarOptions;
    version?: string;
    label?: string;
    baseUrl?: string;
    versions?: {
        [key: string]: APIVersionOptions;
    };
    proxy?: string;
    markdownGenerators?: MarkdownGenerator;
}
export interface MarkdownGenerator {
    createApiPageMD?: (pageData: ApiPageMetadata) => string;
    createInfoPageMD?: (pageData: InfoPageMetadata) => string;
    createTagPageMD?: (pageData: TagPageMetadata) => string;
}
export interface SidebarOptions {
    groupPathsBy?: string;
    categoryLinkSource?: "info" | "tag" | "auto";
    customProps?: {
        [key: string]: unknown;
    };
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
}
export declare type ApiMetadata = ApiPageMetadata | InfoPageMetadata | TagPageMetadata;
export interface ApiMetadataBase {
    sidebar?: string;
    previous?: ApiNavLink;
    next?: ApiNavLink;
    id: string;
    unversionedId: string;
    infoId?: string;
    infoPath?: string;
    downloadUrl?: string;
    title: string;
    description: string;
    source: string;
    sourceDirName: string;
    slug?: string;
    permalink: string;
    sidebarPosition?: number;
    frontMatter: Record<string, unknown>;
    method?: string;
    path?: string;
}
export interface ApiPageMetadata extends ApiMetadataBase {
    json?: string;
    type: "api";
    api: ApiItem;
    markdown?: string;
}
export interface ApiItem extends OperationObject {
    method: string;
    path: string;
    jsonRequestBodyExample: string;
    securitySchemes?: {
        [key: string]: SecuritySchemeObject;
    };
    postman?: Request;
    proxy?: string;
    info: InfoObject;
    extensions?: object;
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
export declare type ApiInfo = InfoObject;
export interface ApiNavLink {
    title: string;
    permalink: string;
}
