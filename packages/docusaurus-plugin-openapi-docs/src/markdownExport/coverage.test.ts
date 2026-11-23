/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import {
  createApiMarkdown,
  createInfoMarkdown,
  createSchemaMarkdown,
  createTagMarkdown,
} from "./pages";
import { FORMATTED_KEYWORDS, STRUCTURAL_KEYWORDS } from "./schema";
import { createItems, readOpenapiFiles } from "../openapi/openapi";
import type {
  ApiMetadata,
  ApiPageMetadata,
  InfoPageMetadata,
  SchemaPageMetadata,
  TagPageMetadata,
} from "../types";

const KITCHEN_SINK = path.join(__dirname, "__fixtures__/kitchen-sink.yaml");
const DEMO_EXAMPLES = path.resolve(__dirname, "../../../../demo/examples");
const DEMO_SPECS = [
  "petstore.yaml",
  "petstore-3.1.yaml",
  "openapi-cos.json",
  "httpbin.yaml",
  "food/restaurant/openapi.yaml",
  "tests",
];

/**
 * Keywords that reach the markdown only through the generic fallback list.
 * Give a keyword a dedicated rule, then move it to FORMATTED_KEYWORDS.
 */
const FALLBACK_KEYWORDS = new Set([
  "contentEncoding",
  "contentMediaType",
  "dependentRequired",
  "else",
  "examples",
  "externalDocs",
  "if",
  "not",
  "patternProperties",
  "prefixItems",
  "propertyNames",
  "then",
]);

async function loadItems(specPath: string): Promise<ApiMetadata[]> {
  const files = await readOpenapiFiles(specPath);
  return files
    .filter((file) => file.data !== undefined)
    .flatMap((file) =>
      createItems(
        file.data,
        { showSchemas: true } as any,
        { categoryLinkSource: "tag" } as any
      )
    );
}

function inlineCode(markdown: string): Set<string> {
  const withoutFences = markdown.replace(
    /^(`{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm,
    ""
  );
  return new Set(
    [...withoutFences.matchAll(/`([^`]+)`/g)].flatMap((match) =>
      match[1].split(/[.[\]]+/).filter(Boolean)
    )
  );
}

function collectNames(
  node: unknown,
  found: { properties: Set<string>; mappings: Set<string> },
  seen = new Set<unknown>()
) {
  if (!node || typeof node !== "object" || seen.has(node)) return;
  seen.add(node);
  if (Array.isArray(node)) {
    node.forEach((child) => collectNames(child, found, seen));
    return;
  }
  const schema = node as any;
  if (schema.properties && typeof schema.properties === "object") {
    Object.keys(schema.properties).forEach((key) => found.properties.add(key));
  }
  if (schema.discriminator?.mapping) {
    Object.keys(schema.discriminator.mapping).forEach((key) =>
      found.mappings.add(key)
    );
  }
  Object.values(schema).forEach((child) => collectNames(child, found, seen));
}

/** Lists what an operation defines that its markdown does not mention. */
function missingFromMarkdown(item: ApiPageMetadata, markdown: string) {
  const { api } = item;
  const names = inlineCode(markdown);
  const found = { properties: new Set<string>(), mappings: new Set<string>() };
  collectNames(api.parameters, found);
  collectNames(api.requestBody, found);
  collectNames(api.responses, found);

  const missing: string[] = [];
  found.properties.forEach((name) => {
    if (!names.has(name)) missing.push(`property ${name}`);
  });
  found.mappings.forEach((value) => {
    if (!names.has(value)) missing.push(`discriminator value ${value}`);
  });
  (api.parameters ?? []).forEach((param) => {
    if (param && !names.has(param.name)) {
      missing.push(`parameter ${param.name}`);
    }
  });
  Object.keys(api.responses ?? {}).forEach((status) => {
    if (!markdown.includes(`### ${status}`)) missing.push(`status ${status}`);
  });
  [api.requestBody, ...Object.values(api.responses ?? {})].forEach((part) => {
    Object.keys(part?.content ?? {}).forEach((mediaType) => {
      if (!markdown.includes(`\`${mediaType}\``)) {
        missing.push(`content type ${mediaType}`);
      }
    });
  });
  return [...new Set(missing)];
}

const SCHEMA_VALUED = ["items", "not", "if", "then", "else", "contains"];
const SCHEMA_LISTS = ["allOf", "oneOf", "anyOf", "prefixItems"];
const SCHEMA_MAPS = [
  "properties",
  "patternProperties",
  "dependentSchemas",
  "$defs",
];

/** Collects the keywords used by a schema and every schema nested in it. */
function collectKeywords(
  schema: unknown,
  keywords: Set<string>,
  seen = new Set()
) {
  if (!schema || typeof schema !== "object" || seen.has(schema)) return;
  seen.add(schema);
  const node = schema as Record<string, any>;
  Object.keys(node).forEach((key) => keywords.add(key));
  SCHEMA_VALUED.forEach((key) => collectKeywords(node[key], keywords, seen));
  SCHEMA_LISTS.forEach((key) =>
    (Array.isArray(node[key]) ? node[key] : []).forEach((child: unknown) =>
      collectKeywords(child, keywords, seen)
    )
  );
  SCHEMA_MAPS.forEach((key) =>
    Object.values(node[key] ?? {}).forEach((child) =>
      collectKeywords(child, keywords, seen)
    )
  );
  if (typeof node.additionalProperties === "object") {
    collectKeywords(node.additionalProperties, keywords, seen);
  }
  if (typeof node.propertyNames === "object") {
    collectKeywords(node.propertyNames, keywords, seen);
  }
  Object.values(node.discriminator?.mapping ?? {}).forEach((child) =>
    collectKeywords(child, keywords, seen)
  );
}

function operationSchemas(api: ApiPageMetadata["api"]): unknown[] {
  const media = [
    api.requestBody,
    ...Object.values(api.responses ?? {}),
  ].flatMap((part) => Object.values(part?.content ?? {}));
  const headers = Object.values(api.responses ?? {}).flatMap((response) =>
    Object.values(response?.headers ?? {})
  );
  return [
    ...media.map((m) => m?.schema),
    ...headers.map((h) => h?.schema),
    ...(api.parameters ?? []).map((p) => p?.schema),
  ];
}

describe("markdown export coverage", () => {
  let kitchenSink: ApiMetadata[];

  beforeAll(async () => {
    kitchenSink = await loadItems(KITCHEN_SINK);
  });

  it("renders the kitchen-sink spec", () => {
    const operations = kitchenSink
      .filter((item): item is ApiPageMetadata => item.type === "api")
      .map((item) => ({
        title: item.title,
        method: item.api.method,
        path: item.api.path,
        url: `/docs/kitchen-sink/${item.id}.md`,
        tags: item.api.tags,
      }));
    for (const item of kitchenSink) {
      let markdown: string;
      switch (item.type) {
        case "api":
          markdown = createApiMarkdown(item, "/kitchen-sink.yaml");
          break;
        case "schema":
          markdown = createSchemaMarkdown(item as SchemaPageMetadata);
          break;
        case "info":
          markdown = createInfoMarkdown(
            item as InfoPageMetadata,
            operations,
            "/kitchen-sink.yaml"
          );
          break;
        default:
          markdown = createTagMarkdown(item as TagPageMetadata, operations);
      }
      expect(markdown).toMatchSnapshot(`${item.type} ${item.id}`);
    }
  });

  it("mentions everything each operation defines", async () => {
    const specs = [
      KITCHEN_SINK,
      ...DEMO_SPECS.map((spec) => path.join(DEMO_EXAMPLES, spec)).filter(
        (spec) => fs.existsSync(spec)
      ),
    ];
    const problems: string[] = [];
    let checked = 0;
    for (const spec of specs) {
      const items = await loadItems(spec);
      for (const item of items) {
        if (item.type !== "api") continue;
        checked += 1;
        const missing = missingFromMarkdown(item, createApiMarkdown(item));
        if (missing.length > 0) {
          problems.push(
            `${path.basename(spec)} ${item.id}: ${missing.join("; ")}`
          );
        }
      }
    }
    expect(checked).toBeGreaterThan(50);
    expect(problems).toEqual([]);
  }, 120000);

  it("has a rule or a known fallback for every schema keyword", () => {
    const keywords = new Set<string>();
    for (const item of kitchenSink) {
      if (item.type === "schema") collectKeywords(item.schema, keywords);
      if (item.type === "api") {
        operationSchemas(item.api).forEach((schema) =>
          collectKeywords(schema, keywords)
        );
      }
    }
    const unknown = [...keywords]
      .filter(
        (key) =>
          !FORMATTED_KEYWORDS.has(key) &&
          !STRUCTURAL_KEYWORDS.has(key) &&
          !FALLBACK_KEYWORDS.has(key) &&
          !key.startsWith("x-")
      )
      .sort();
    expect(unknown).toEqual([]);
  });
});
