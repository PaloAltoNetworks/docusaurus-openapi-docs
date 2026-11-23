/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { formatSchema, formatSchemaField } from "./schema";
import {
  code,
  fence,
  formatValue,
  joinBlocks,
  languageForMediaType,
} from "./utils";
import type {
  CallbackObject,
  EncodingObject,
  HeaderObject,
  LinkObject,
  MediaTypeObject,
  ParameterObject,
  ResponseObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
  ServerObject,
} from "../openapi/types";
import type {
  ApiPageMetadata,
  InfoPageMetadata,
  SchemaPageMetadata,
  TagPageMetadata,
} from "../types";

export interface OperationLink {
  title: string;
  method: string;
  path: string;
  url?: string;
  tags?: string[];
}

function exampleBlock(value: unknown, mediaType: string): string {
  if (typeof value === "string") {
    return fence(value, languageForMediaType(mediaType));
  }
  return fence(JSON.stringify(value, null, 2), "json");
}

function exampleBlocks(media: MediaTypeObject, mediaType: string): string[] {
  const blocks: string[] = [];
  if (media.example !== undefined) {
    blocks.push("Example:", exampleBlock(media.example, mediaType));
  }
  for (const [name, example] of Object.entries(media.examples ?? {})) {
    if (!example) continue;
    const label = example.summary ? `${name} (${example.summary})` : name;
    blocks.push(`Example ${code(label)}:`);
    if (example.description) blocks.push(example.description.trim());
    if (example.value !== undefined) {
      blocks.push(exampleBlock(example.value, mediaType));
    } else if (example.externalValue) {
      blocks.push(`External value: ${example.externalValue}`);
    }
  }
  return blocks;
}

function indent(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => (line === "" ? "" : `${prefix}${line}`))
    .join("\n");
}

function headerLines(
  headers: Record<string, HeaderObject> | undefined
): string {
  return Object.entries(headers ?? {})
    .filter(([, header]) => !!header)
    .map(([name, header]) =>
      formatSchemaField(
        name,
        {
          ...(header.schema ?? {}),
          description: header.description ?? header.schema?.description,
          deprecated: header.deprecated || header.schema?.deprecated,
          example: header.example ?? header.schema?.example,
        },
        !!header.required
      )
    )
    .join("\n");
}

function serializationDetails(
  options: Pick<EncodingObject, "style" | "explode" | "allowReserved"> & {
    allowEmptyValue?: boolean;
  }
): string[] {
  return [
    options.style ? `style: ${options.style}` : "",
    options.explode !== undefined ? `explode: ${options.explode}` : "",
    options.allowReserved ? "reserved characters allowed" : "",
    options.allowEmptyValue ? "empty value allowed" : "",
  ].filter(Boolean);
}

function encodingBlocks(
  encoding: Record<string, EncodingObject> | undefined
): string[] {
  const entries = Object.entries(encoding ?? {}).filter(([, value]) => !!value);
  if (entries.length === 0) return [];
  const lines = entries.map(([name, value]) => {
    const details = [
      value.contentType ? `content type ${code(value.contentType)}` : "",
      ...serializationDetails(value),
    ].filter(Boolean);
    const entry = `- ${code(name)}${details.length > 0 ? `: ${details.join(", ")}` : ""}`;
    const headers = headerLines(value.headers);
    return headers ? `${entry}\n  Headers:\n${indent(headers, "  ")}` : entry;
  });
  return ["Encoding of each part:", lines.join("\n")];
}

function contentBlocks(
  content: Record<string, MediaTypeObject> | undefined,
  level: string
): string[] {
  const blocks: string[] = [];
  for (const [mediaType, media] of Object.entries(content ?? {})) {
    blocks.push(`${level} Content type: ${code(mediaType)}`);
    if (!media) continue;
    if (media.schema !== undefined && media.schema !== null) {
      blocks.push(formatSchema(media.schema));
    }
    blocks.push(...encodingBlocks(media.encoding));
    blocks.push(...exampleBlocks(media, mediaType));
  }
  return blocks;
}

function serverBlocks(servers: ServerObject[] | undefined): string[] {
  if (!servers || servers.length === 0) return [];
  const lines = servers.flatMap((server) => {
    const entry = [
      `- ${code(server.url)}${server.description ? `: ${server.description}` : ""}`,
    ];
    for (const [name, variable] of Object.entries(server.variables ?? {})) {
      const values = variable.enum
        ? `, possible values: ${variable.enum.map((v) => code(v)).join(", ")}`
        : "";
      entry.push(
        `  - Variable ${code(name)} (default: ${code(variable.default)}${values})${variable.description ? `: ${variable.description}` : ""}`
      );
    }
    return entry;
  });
  return ["## Servers", lines.join("\n")];
}

function describeScheme(scheme: SecuritySchemeObject | undefined): string {
  if (!scheme) return "";
  switch (scheme.type) {
    case "apiKey":
      return `API key in ${scheme.in} ${code(scheme.name)}`;
    case "http":
      return `HTTP ${scheme.scheme}${scheme.bearerFormat ? ` (${scheme.bearerFormat})` : ""}`;
    case "oauth2": {
      const flows = Object.entries(scheme.flows ?? {}).map(([flow, value]) => {
        const urls = [
          value?.authorizationUrl &&
            `authorization URL ${value.authorizationUrl}`,
          value?.tokenUrl && `token URL ${value.tokenUrl}`,
        ].filter(Boolean);
        return urls.length > 0 ? `${flow} (${urls.join(", ")})` : flow;
      });
      return `OAuth 2.0${flows.length > 0 ? `: ${flows.join("; ")}` : ""}`;
    }
    case "openIdConnect":
      return `OpenID Connect (${scheme.openIdConnectUrl})`;
    default:
      return (scheme as any).type ?? "";
  }
}

function securityBlocks(
  security: SecurityRequirementObject[] | undefined,
  schemes: Record<string, SecuritySchemeObject> | undefined
): string[] {
  if (!security || security.length === 0) return [];
  const options = security.map((requirement) => {
    const entries = Object.entries(requirement);
    if (entries.length === 0) return "- No authentication";
    const parts = entries.map(([name, scopes]) => {
      const description = describeScheme(schemes?.[name]);
      const scopeText =
        scopes.length > 0
          ? `, scopes: ${scopes.map((s) => code(s)).join(", ")}`
          : "";
      return `${code(name)}${description ? ` (${description}${scopeText})` : scopeText}`;
    });
    return `- ${parts.join(" and ")}`;
  });
  const intro =
    options.length > 1
      ? "Use one of these options:"
      : "This operation requires:";
  return ["## Authentication", intro, options.join("\n")];
}

const PARAMETER_LOCATIONS: Array<[ParameterObject["in"], string]> = [
  ["path", "Path parameters"],
  ["query", "Query parameters"],
  ["header", "Header parameters"],
  ["cookie", "Cookie parameters"],
];

function formatParameter(param: ParameterObject): string {
  const schema =
    param.schema ?? Object.values(param.content ?? {})[0]?.schema ?? {};
  const merged = {
    ...schema,
    description: param.description ?? (schema as any).description,
    deprecated: param.deprecated || (schema as any).deprecated,
    example: param.example ?? (schema as any).example,
    "x-enumDescriptions":
      param["x-enumDescriptions"] ?? (schema as any)["x-enumDescriptions"],
  };
  const lines = [
    formatSchemaField(
      param.name,
      merged,
      !!param.required,
      serializationDetails(param as any)
    ),
  ];
  for (const [name, example] of Object.entries(param.examples ?? {})) {
    if (example?.value !== undefined) {
      lines.push(
        `  Example ${code(name)}: ${code(formatValue(example.value))}`
      );
    }
  }
  return lines.join("\n");
}

function parameterBlocks(
  parameters: ParameterObject[] | undefined,
  level = "##"
): string[] {
  const blocks: string[] = [];
  for (const [location, heading] of PARAMETER_LOCATIONS) {
    const params = (parameters ?? []).filter((p) => p?.in === location);
    if (params.length === 0) continue;
    blocks.push(`${level}# ${heading}`, params.map(formatParameter).join("\n"));
  }
  return blocks.length > 0 ? [`${level} Parameters`, ...blocks] : [];
}

function linkBlocks(links: Record<string, LinkObject> | undefined): string[] {
  const entries = Object.entries(links ?? {}).filter(([, link]) => !!link);
  if (entries.length === 0) return [];
  const lines = entries.map(([name, link]) => {
    const target = link.operationId
      ? `operation ${code(link.operationId)}`
      : link.operationRef
        ? `operation ${code(link.operationRef)}`
        : "";
    const head = `- ${code(name)}${target ? `: ${target}` : ""}${link.description ? `. ${link.description.trim()}` : ""}`;
    const params = Object.entries(link.parameters ?? {}).map(
      ([param, value]) =>
        `  - Parameter ${code(param)}: ${code(formatValue(value))}`
    );
    const body =
      link.requestBody !== undefined
        ? [`  - Request body: ${code(formatValue(link.requestBody))}`]
        : [];
    const server = link.server?.url
      ? [`  - Server: ${code(link.server.url)}`]
      : [];
    return [head, ...params, ...body, ...server].join("\n");
  });
  return ["Links:", lines.join("\n")];
}

function responseBlocks(
  responses: Record<string, ResponseObject> | undefined,
  level: string
): string[] {
  const blocks: string[] = [];
  for (const [status, response] of Object.entries(responses ?? {})) {
    blocks.push(`${level} ${status}`);
    if (!response) continue;
    if (response.description) blocks.push(response.description.trim());
    const headers = headerLines(response.headers);
    if (headers) blocks.push("Response headers:", headers);
    blocks.push(...contentBlocks(response.content, `${level}#`));
    blocks.push(...linkBlocks(response.links));
  }
  return blocks;
}

function callbackBlocks(
  callbacks: Record<string, CallbackObject> | undefined
): string[] {
  const blocks: string[] = [];
  for (const [name, callback] of Object.entries(callbacks ?? {})) {
    for (const [expression, pathItem] of Object.entries(callback ?? {})) {
      for (const [method, op] of Object.entries(pathItem ?? {}) as [
        string,
        any,
      ][]) {
        if (!op || typeof op !== "object" || !("responses" in op)) continue;
        blocks.push(
          `### Callback ${code(name)}: ${code(`${method.toUpperCase()} ${expression}`)}`
        );
        if (op.summary) blocks.push(op.summary.trim());
        if (op.description && op.description !== op.summary) {
          blocks.push(op.description.trim());
        }
        blocks.push(...parameterBlocks(op.parameters, "####"));
        if (op.requestBody) {
          blocks.push(
            `#### Request body${op.requestBody.required ? " (required)" : ""}`,
            ...[op.requestBody.description?.trim()].filter(Boolean),
            ...contentBlocks(op.requestBody.content, "#####")
          );
        }
        const responses = responseBlocks(op.responses, "#####");
        if (responses.length > 0) blocks.push("#### Responses", ...responses);
      }
    }
  }
  return blocks.length > 0 ? ["## Callbacks", ...blocks] : [];
}

function extensionBlocks(item: ApiPageMetadata): string[] {
  const extensions = (item.api.extensions ?? []) as {
    key: string;
    value: unknown;
  }[];
  if (!item.frontMatter?.show_extensions || extensions.length === 0) return [];
  const lines = extensions.map(
    ({ key, value }) => `- ${code(key)}: ${code(formatValue(value))}`
  );
  return ["## Vendor extensions", lines.join("\n")];
}

export function createApiMarkdown(
  item: ApiPageMetadata,
  specUrl?: string
): string {
  const { api } = item;
  const isWebhook = api.method === "event";
  const overview = [
    isWebhook
      ? "Webhook: the API sends this request to you."
      : `${code(`${api.method.toUpperCase()} ${api.path}`)}`,
    api.operationId ? `Operation ID: ${code(api.operationId)}` : undefined,
    api.tags && api.tags.length > 0
      ? `Tags: ${api.tags.map((tag) => code(tag)).join(", ")}`
      : undefined,
    specUrl ? `OpenAPI specification: ${specUrl}` : undefined,
    api.externalDocs?.url
      ? `More information: ${api.externalDocs.description ? `${api.externalDocs.description} ` : ""}${api.externalDocs.url}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n\n");

  const deprecated = api.deprecated
    ? `> **Deprecated.**${api["x-deprecated-description"] ? ` ${api["x-deprecated-description"]}` : ""}`
    : undefined;

  const requestBody = api.requestBody
    ? [
        `## Request body${api.requestBody.required ? " (required)" : ""}`,
        api.requestBody.description?.trim(),
        ...contentBlocks(api.requestBody.content, "###"),
      ]
    : [];

  return joinBlocks([
    `# ${item.title}`,
    overview,
    deprecated,
    item.description && item.description !== item.title
      ? item.description.trim()
      : undefined,
    ...(isWebhook ? [] : serverBlocks(api.servers)),
    ...securityBlocks(api.security, api.securitySchemes),
    ...parameterBlocks(api.parameters),
    ...(requestBody as string[]),
    ...(Object.keys(api.responses ?? {}).length > 0 ? ["## Responses"] : []),
    ...responseBlocks(api.responses, "###"),
    ...callbackBlocks(api.callbacks),
    ...extensionBlocks(item),
  ]);
}

export function createSchemaMarkdown(item: SchemaPageMetadata): string {
  const example = item.schema.example;
  return joinBlocks([
    `# ${item.title}`,
    formatSchema({ ...item.schema, title: undefined }),
    example !== undefined ? "Example:" : undefined,
    example !== undefined
      ? exampleBlock(example, "application/json")
      : undefined,
  ]);
}

function operationListBlocks(operations: OperationLink[]): string[] {
  if (operations.length === 0) return [];
  const lines = operations.map((op) => {
    const label = `${op.method.toUpperCase()} ${op.path}`;
    const title = op.url ? `[${op.title}](${op.url})` : op.title;
    return `- ${title}: ${code(label)}`;
  });
  return ["## Operations", lines.join("\n")];
}

export function createInfoMarkdown(
  item: InfoPageMetadata,
  operations: OperationLink[] = [],
  specUrl?: string
): string {
  const { info } = item;
  const contact = info.contact
    ? [info.contact.name, info.contact.email, info.contact.url]
        .filter(Boolean)
        .join(", ")
    : "";
  const meta = [
    info.version ? `Version: ${code(info.version)}` : undefined,
    specUrl ? `OpenAPI specification: ${specUrl}` : undefined,
    info.termsOfService
      ? `Terms of service: ${info.termsOfService}`
      : undefined,
    contact ? `Contact: ${contact}` : undefined,
    info.license
      ? `License: ${info.license.name}${info.license.url ? ` (${info.license.url})` : ""}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n\n");

  const schemes = Object.entries(item.securitySchemes ?? {});
  const auth =
    schemes.length > 0
      ? [
          "## Authentication",
          schemes
            .map(
              ([name, scheme]) =>
                `- ${code(name)}: ${describeScheme(scheme)}${scheme.description ? `. ${scheme.description.trim()}` : ""}`
            )
            .join("\n"),
        ]
      : [];

  return joinBlocks([
    `# ${item.title}`,
    meta,
    info.description?.trim(),
    ...auth,
    ...operationListBlocks(operations),
  ]);
}

export function createTagMarkdown(
  item: TagPageMetadata,
  operations: OperationLink[] = []
): string {
  const { tag } = item;
  const externalDocs = tag.externalDocs?.url
    ? `More information: ${tag.externalDocs.description ? `${tag.externalDocs.description} ` : ""}${tag.externalDocs.url}`
    : undefined;
  return joinBlocks([
    `# ${item.title}`,
    tag.description?.trim(),
    externalDocs,
    ...operationListBlocks(
      operations.filter((op) => tag.name && op.tags?.includes(tag.name))
    ),
  ]);
}
