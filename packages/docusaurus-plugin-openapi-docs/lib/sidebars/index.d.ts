import { ProcessedSidebar } from "@docusaurus/plugin-content-docs/src/sidebars/types";
import { TagObject } from "../openapi/types";
import type { SidebarOptions, APIOptions, ApiMetadata } from "../types";
export default function generateSidebarSlice(sidebarOptions: SidebarOptions, options: APIOptions, api: ApiMetadata[], tags: TagObject[][], docPath: string): ProcessedSidebar;
