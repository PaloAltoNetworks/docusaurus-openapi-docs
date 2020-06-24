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

export enum Type {
  string = "string",
  number = "number",
  integer = "integer",
  boolean = "boolean",
  object = "object",
  array = "array",
}

export interface Schema {
  type?: Type;
  format?: string;
  example?: any;
  additionalProperties?: any;
  enum?: any;
  default?: any;
  deprecated?: boolean;

  properties?: Schema;
  items?: Schema;
  oneOf?: Schema;
  anyOf?: Schema;
}

export interface Primitives {
  string: { [key: string]: (schema: Schema) => any };
  number: { [key: string]: (schema: Schema) => any };
  integer: { [key: string]: (schema: Schema) => any };
  boolean: { [key: string]: (schema: Schema) => any };
  object: { [key: string]: (schema: Schema) => any };
  array: { [key: string]: (schema: Schema) => any };
}
