export interface PluginOptions {
  openapiPath: string;
  routeBasePath: string;
  apiLayoutComponent: string;
  apiItemComponent: string;
  remarkPlugins: ([Function, object] | Function)[];
  rehypePlugins: string[];
  admonitions: any;
}

export interface LoadedContent {
  openapiData: any;
}
