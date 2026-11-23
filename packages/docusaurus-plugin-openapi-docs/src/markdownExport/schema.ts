/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { code, fence, formatValue, indentLines } from "./utils";
import { foldSiblingsIntoBranches, mergeAllOf } from "../markdown/createSchema";
import { getSchemaName } from "../markdown/schema";
import { SchemaObject } from "../openapi/types";

const MAX_DEPTH = 15;
const MAX_INLINE_EXAMPLE_LENGTH = 120;
const MAX_FALLBACK_VALUE_LENGTH = 500;

/** Keywords with a dedicated rule in this file. */
export const FORMATTED_KEYWORDS = new Set([
  "type",
  "format",
  "title",
  "description",
  "properties",
  "required",
  "items",
  "additionalProperties",
  "allOf",
  "oneOf",
  "anyOf",
  "discriminator",
  "enum",
  "const",
  "default",
  "example",
  "deprecated",
  "readOnly",
  "writeOnly",
  "nullable",
  "minLength",
  "maxLength",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minItems",
  "maxItems",
  "uniqueItems",
  "minProperties",
  "maxProperties",
  "pattern",
  "x-enumDescriptions",
  "examples",
  "externalDocs",
  "contentMediaType",
  "contentEncoding",
  "not",
  "prefixItems",
  "patternProperties",
  "propertyNames",
  "if",
  "then",
  "else",
  "dependentRequired",
  "dependentSchemas",
  "contains",
  "minContains",
  "maxContains",
]);

/** Keywords that only affect naming or tooling, not the shape of the data. */
export const STRUCTURAL_KEYWORDS = new Set([
  "$schema",
  "$id",
  "$anchor",
  "$comment",
  "$defs",
  "definitions",
  "xml",
  "x-tags",
]);

function isOwnMarker(key: string): boolean {
  return key.startsWith("x-markdown-export-");
}

/**
 * Lists keywords that have no dedicated rule, so they are never dropped
 * without a trace. Vendor extensions are left to their own option.
 */
function fallbackQualifiers(schema: SchemaObject): string[] {
  return Object.entries(schema)
    .filter(
      ([key, value]) =>
        value !== undefined &&
        !FORMATTED_KEYWORDS.has(key) &&
        !STRUCTURAL_KEYWORDS.has(key) &&
        !isOwnMarker(key) &&
        !key.startsWith("x-")
    )
    .map(([key, value]) => {
      let text = formatValue(value);
      if (text.length > MAX_FALLBACK_VALUE_LENGTH) {
        text = `${text.slice(0, MAX_FALLBACK_VALUE_LENGTH)}... (truncated)`;
      }
      return `${key}: ${code(text)}`;
    });
}

type SchemaNode = SchemaObject | string;

const CIRCULAR_MARKER = "x-markdown-export-circular";
const INHERITS_MARKER = "x-markdown-export-inherits";
const CONFLICT_MARKER = "x-markdown-export-conflict";

export function circularTarget(schema: unknown): string | undefined {
  if (schema && typeof schema === "object") {
    const marker = (schema as any)[CIRCULAR_MARKER];
    return typeof marker === "string" ? marker : undefined;
  }
  if (typeof schema !== "string") return undefined;
  const match = schema.match(/^circular\((.*)\)$/);
  if (!match) return undefined;
  return match[1] || "parent schema";
}

/**
 * The allOf merge drops string members, which is how the spec loader marks
 * circular references. Replace them with marker objects that survive merging.
 * An allOf that extends a circular parent keeps its own members and records
 * the parent, so the extension's fields are not lost.
 */
function protectCircular(schema: unknown, depth = 0): unknown {
  const target = circularTarget(schema);
  if (target !== undefined) {
    return { [CIRCULAR_MARKER]: target };
  }
  if (!schema || typeof schema !== "object" || depth > MAX_DEPTH * 2) {
    return schema;
  }
  if (Array.isArray(schema)) {
    return schema.map((member) => protectCircular(member, depth + 1));
  }
  const node: any = { ...(schema as any) };
  if (Array.isArray(node.allOf)) {
    const inherited = node.allOf
      .map((member: unknown) => circularTarget(member))
      .filter((target: string | undefined) => target !== undefined);
    if (inherited.length > 0) {
      const own = node.allOf.filter(
        (member: unknown) => circularTarget(member) === undefined
      );
      if (own.length === 0) {
        return { [CIRCULAR_MARKER]: inherited[0] };
      }
      node.allOf = own;
      node[INHERITS_MARKER] = [...(node[INHERITS_MARKER] ?? []), ...inherited];
    }
  }
  for (const key of [
    "allOf",
    "oneOf",
    "anyOf",
    "items",
    "additionalProperties",
    "not",
  ]) {
    if (node[key] !== undefined) {
      node[key] = protectCircular(node[key], depth + 1);
    }
  }
  if (node.properties && typeof node.properties === "object") {
    node.properties = Object.fromEntries(
      Object.entries(node.properties).map(([name, property]) => [
        name,
        protectCircular(property, depth + 1),
      ])
    );
  }
  const mapping = node.discriminator?.mapping;
  if (mapping && typeof mapping === "object") {
    node.discriminator = {
      ...node.discriminator,
      mapping: Object.fromEntries(
        Object.entries(mapping).map(([value, target]) => [
          value,
          typeof target === "object"
            ? protectCircular(target, depth + 1)
            : target,
        ])
      ),
    };
  }
  return node;
}

function inheritLines(schema: SchemaObject, indent: string): string[] {
  const inherited = (schema as any)[INHERITS_MARKER] as string[] | undefined;
  if (!inherited || inherited.length === 0) return [];
  const names = [...new Set(inherited)].join(", ");
  return [
    `${indent}Also includes all fields of ${names} (circular reference, not repeated here).`,
  ];
}

function discriminatorMapping(
  schema: SchemaObject
): [string, unknown][] | undefined {
  const mapping = schema.discriminator?.mapping as
    Record<string, unknown> | undefined;
  if (!schema.discriminator?.propertyName || !mapping) return undefined;
  const entries = Object.entries(mapping);
  return entries.length > 0 ? entries : undefined;
}

function withoutProperty(schema: SchemaObject, name: string): SchemaObject {
  if (!schema.properties?.[name]) return schema;
  const { [name]: _removed, ...properties } = schema.properties;
  return {
    ...schema,
    properties,
    required: Array.isArray(schema.required)
      ? schema.required.filter((key) => key !== name)
      : schema.required,
  };
}

function normalize(schema: unknown): SchemaNode {
  if (schema === undefined || schema === null || schema === true) {
    return {};
  }
  if (typeof schema === "string" || circularTarget(schema) !== undefined) {
    return schema as SchemaNode;
  }
  let node = schema as SchemaObject;
  if (Array.isArray(node.allOf)) {
    node = protectCircular(node) as SchemaObject;
    if (circularTarget(node) !== undefined) {
      return node;
    }
    const members = node.allOf ?? [];
    const conflicts: string[] = [];
    try {
      node = mergeAllOf(node, (message) => conflicts.push(message));
    } catch {
      // fall back to the unmerged schema
    }
    if (conflicts.length > 0) {
      const labels = members
        .map((member) => normalize(member))
        .map((member) =>
          circularTarget(member) !== undefined
            ? `circular reference to ${circularTarget(member)}`
            : typeLabel(member as SchemaObject)
        );
      node = {
        ...node,
        [CONFLICT_MARKER]: [...new Set(labels)],
      } as SchemaObject;
    }
  }
  const branches = (node.oneOf ?? node.anyOf) as unknown[] | undefined;
  if (
    branches &&
    (node.properties || node.items) &&
    !branches.some((branch) => circularTarget(branch) !== undefined)
  ) {
    const { discriminator } = node;
    node = foldSiblingsIntoBranches(node);
    if (discriminator) {
      node = { ...node, discriminator };
    }
  }
  return node;
}

function typeLabel(schema: SchemaObject): string {
  const conflict = (schema as any)[CONFLICT_MARKER] as string[] | undefined;
  if (conflict && !schema.type) return `all of: ${conflict.join(", ")}`;
  if (schema.allOf) return "all of";
  if (schema.oneOf) return "one of";
  if (schema.anyOf) return "any of";
  if (schema.const !== undefined && !schema.type) return "constant";
  const name = getSchemaName(schema);
  if (name) return name;
  if (schema.properties || schema.additionalProperties) return "object";
  return "any";
}

function isEmptyObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

function qualifiers(schema: SchemaObject): string[] {
  const result: string[] = [];
  const s = schema as any;

  if ((schema as any)[CONFLICT_MARKER]) {
    result.push("conflicting allOf members, no value can match all of them");
  }
  if (schema.deprecated) result.push("deprecated");
  if (schema.readOnly) result.push("read-only");
  if (schema.writeOnly) result.push("write-only");
  if (schema.nullable || (Array.isArray(s.type) && s.type.includes("null"))) {
    result.push("nullable");
  }

  if (schema.minLength === 1 && schema.maxLength === undefined) {
    result.push("non-empty");
  } else {
    if (schema.minLength) result.push(`min length: ${schema.minLength}`);
    if (schema.maxLength !== undefined) {
      result.push(`max length: ${schema.maxLength}`);
    }
  }

  if (typeof s.exclusiveMinimum === "number") {
    result.push(`> ${s.exclusiveMinimum}`);
  }
  if (schema.minimum !== undefined) {
    result.push(
      `${s.exclusiveMinimum === true ? ">" : ">="} ${schema.minimum}`
    );
  }
  if (typeof s.exclusiveMaximum === "number") {
    result.push(`< ${s.exclusiveMaximum}`);
  }
  if (schema.maximum !== undefined) {
    result.push(
      `${s.exclusiveMaximum === true ? "<" : "<="} ${schema.maximum}`
    );
  }
  if (schema.multipleOf !== undefined) {
    result.push(`multiple of ${schema.multipleOf}`);
  }

  if (schema.minItems) result.push(`min items: ${schema.minItems}`);
  if (schema.maxItems !== undefined) {
    result.push(`max items: ${schema.maxItems}`);
  }
  if (schema.uniqueItems) result.push("unique items");
  if (schema.minProperties) {
    result.push(`min properties: ${schema.minProperties}`);
  }
  if (schema.maxProperties !== undefined) {
    result.push(`max properties: ${schema.maxProperties}`);
  }

  if (schema.pattern) result.push(`pattern: ${code(schema.pattern)}`);
  if (Array.isArray(schema.enum)) {
    result.push(
      `possible values: ${schema.enum.map((v) => code(formatValue(v))).join(", ")}`
    );
  }
  const items = schema.items as SchemaObject | undefined;
  if (items && typeof items === "object" && Array.isArray(items.enum)) {
    result.push(
      `possible item values: ${items.enum.map((v) => code(formatValue(v))).join(", ")}`
    );
  }
  if (schema.const !== undefined) {
    result.push(`value: ${code(formatValue(schema.const))}`);
  }
  if (schema.default !== undefined && !isEmptyObject(schema.default)) {
    result.push(`default: ${code(formatValue(schema.default))}`);
  }
  if (schema.example !== undefined) {
    const example = formatValue(schema.example);
    if (example.length <= MAX_INLINE_EXAMPLE_LENGTH) {
      result.push(`example: ${code(example)}`);
    }
  }
  const examples = Array.isArray(s.examples) ? s.examples : [];
  const shortExamples = examples
    .map((value: unknown) => formatValue(value))
    .filter((text: string) => text.length <= MAX_INLINE_EXAMPLE_LENGTH);
  if (shortExamples.length > 0) {
    result.push(
      `examples: ${shortExamples.map((text: string) => code(text)).join(", ")}`
    );
  }
  if (s.contentMediaType)
    result.push(`media type: ${code(s.contentMediaType)}`);
  if (s.contentEncoding) result.push(`encoding: ${code(s.contentEncoding)}`);
  if (s.not !== undefined) {
    result.push(`must not be: ${schemaSummary(s.not)}`);
  }
  if (s.propertyNames && typeof s.propertyNames === "object") {
    result.push(`property names: ${schemaSummary(s.propertyNames)}`);
  }
  if (s.contains !== undefined) {
    const bounds = [
      s.minContains !== undefined && `at least ${s.minContains}`,
      s.maxContains !== undefined && `at most ${s.maxContains}`,
    ]
      .filter(Boolean)
      .join(" and ");
    result.push(
      `contains ${bounds || "at least one"} item(s) matching: ${schemaSummary(s.contains)}`
    );
  }
  if (s.dependentRequired && typeof s.dependentRequired === "object") {
    for (const [key, needs] of Object.entries(s.dependentRequired)) {
      const list = (Array.isArray(needs) ? needs : [needs])
        .map((name) => code(name))
        .join(", ");
      result.push(`${code(key)} requires ${list}`);
    }
  }
  result.push(...fallbackQualifiers(schema));
  return result;
}

/** One-line description of a schema, for keywords that take a schema. */
function schemaSummary(schema: unknown): string {
  const node = normalize(schema);
  const target = circularTarget(node);
  if (target !== undefined) return `circular reference to ${target}`;
  const s = node as SchemaObject;
  const parts = [
    ...(s.type || s.format || s.items ? [typeLabel(s)] : []),
    ...qualifiers(s),
  ];
  if (s.properties) {
    parts.push(
      `fields: ${Object.keys(s.properties)
        .map((name) => code(name))
        .join(", ")}`
    );
  }
  return parts.length > 0 ? parts.join(", ") : "any value";
}

/** Examples too long for the field line, shown as code blocks below it. */
function longExampleLines(schema: SchemaObject, indent: string): string[] {
  const s = schema as any;
  const values = [
    ...(s.example !== undefined ? [s.example] : []),
    ...(Array.isArray(s.examples) ? s.examples : []),
  ];
  return values
    .filter((value) => formatValue(value).length > MAX_INLINE_EXAMPLE_LENGTH)
    .flatMap((value) => {
      const text =
        typeof value === "string" ? value : JSON.stringify(value, null, 2);
      return [
        `${indent}Example:`,
        "",
        ...fence(text, typeof value === "string" ? "" : "json")
          .split("\n")
          .map((line) => `${indent}${line}`),
        "",
      ];
    });
}

function externalDocsLines(schema: SchemaObject, indent: string): string[] {
  const docs = schema.externalDocs;
  if (!docs?.url) return [];
  return [
    `${indent}More information: ${docs.description ? `${docs.description} ` : ""}${docs.url}`,
  ];
}

function enumDescriptionLines(schema: SchemaObject, indent: string): string[] {
  const descriptions = schema["x-enumDescriptions"];
  if (!descriptions) return [];
  return Object.entries(descriptions).flatMap(([value, description]) => {
    const [first, ...rest] = indentLines(String(description), "");
    return [
      `${indent}- ${code(value)}: ${first ?? ""}`,
      ...rest.map((line) => (line === "" ? "" : `${indent}  ${line}`)),
    ];
  });
}

function joinPath(prefix: string, name: string): string {
  return prefix ? `${prefix}.${name}` : name;
}

function hasFields(schema: SchemaObject): boolean {
  return Boolean(
    schema.properties ||
    (schema.additionalProperties &&
      typeof schema.additionalProperties === "object") ||
    schema.allOf ||
    schema.oneOf ||
    schema.anyOf ||
    discriminatorMapping(schema)
  );
}

function fieldLine(
  path: string,
  schema: SchemaNode,
  required: boolean,
  indent: string,
  extra: string[] = []
): string[] {
  const target = circularTarget(schema);
  if (target !== undefined) {
    return [`${indent}- ${code(path)} (circular reference to ${target})`];
  }
  const s = schema as SchemaObject;
  const details = [typeLabel(s), ...(required ? ["required"] : []), ...extra];
  details.push(...qualifiers(s));
  const lines = [`${indent}- ${code(path)} (${details.join(", ")})`];
  const title = s.title && !getSchemaName(s).includes(s.title) ? s.title : "";
  if (title && !s.description) {
    lines.push(`${indent}  ${title}`);
  }
  if (s.description) {
    lines.push(...indentLines(s.description, `${indent}  `));
  }
  lines.push(...enumDescriptionLines(s, `${indent}  `));
  lines.push(...inheritLines(s, `${indent}  `));
  lines.push(...externalDocsLines(s, `${indent}  `));
  lines.push(...longExampleLines(s, `${indent}  `));
  return lines;
}

function childLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  if (depth > MAX_DEPTH) {
    return [`${indent}- Nested fields omitted (depth limit reached).`];
  }
  return [
    ...prefixItemLines(schema, path, indent, depth),
    ...baseChildLines(schema, path, indent, depth),
    ...patternPropertyLines(schema, path, indent, depth),
    ...conditionalLines(schema, path, indent, depth),
    ...dependentSchemaLines(schema, path, indent, depth),
  ];
}

function baseChildLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  if (hasFields(schema)) {
    return propertyLines(schema, path, indent, depth);
  }
  if (schema.items !== undefined) {
    const items = normalize(schema.items);
    const target = circularTarget(items);
    if (target !== undefined) {
      return [
        `${indent}- ${code(`${path}[]`)} (circular reference to ${target})`,
      ];
    }
    const itemSchema = items as SchemaObject;
    if (hasFields(itemSchema) || itemSchema.items !== undefined) {
      return childLines(itemSchema, `${path}[]`, indent, depth + 1);
    }
    return scalarItemLines(itemSchema, `${path}[]`, indent);
  }
  return [];
}

/**
 * Details of a scalar array item. The parent line already shows the item type
 * and its possible values, so a line is added only when there is more.
 */
function scalarItemLines(
  items: SchemaObject,
  path: string,
  indent: string
): string[] {
  const rest = { ...items };
  delete rest.enum;
  const lines = fieldLine(path, rest, false, indent);
  const bare = `${indent}- ${code(path)} (${typeLabel(rest)})`;
  return lines.length === 1 && lines[0] === bare ? [] : lines;
}

function prefixItemLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  const prefixItems = (schema as any).prefixItems;
  if (!Array.isArray(prefixItems)) return [];
  return prefixItems.flatMap((item: unknown, index: number) =>
    fieldLines(`${path}[${index}]`, item, false, indent, depth, [
      `item ${index + 1}`,
    ])
  );
}

function patternPropertyLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  const patterns = (schema as any).patternProperties;
  if (!patterns || typeof patterns !== "object") return [];
  return Object.entries(patterns).flatMap(([pattern, property]) =>
    fieldLines(
      joinPath(path, `<key matching ${pattern}>`),
      property,
      false,
      indent,
      depth,
      ["pattern property"]
    )
  );
}

/** A sub-schema shown as nested fields, or as a summary when it has none. */
function subschemaLines(
  schema: unknown,
  path: string,
  indent: string,
  depth: number
): string[] {
  const node = normalize(schema);
  const target = circularTarget(node);
  if (target !== undefined) {
    return [`${indent}- Circular reference to ${target}`];
  }
  const nested = childLines(node as SchemaObject, path, indent, depth + 1);
  return nested.length > 0 ? nested : [`${indent}- ${schemaSummary(node)}`];
}

function conditionalLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  const s = schema as any;
  if (s.if === undefined) return [];
  const lines = [
    `${indent}- Conditional rule:`,
    `${indent}  - If the value matches:`,
    ...subschemaLines(s.if, path, `${indent}    `, depth),
  ];
  if (s.then !== undefined) {
    lines.push(
      `${indent}  - Then it must also match:`,
      ...subschemaLines(s.then, path, `${indent}    `, depth)
    );
  }
  if (s.else !== undefined) {
    lines.push(
      `${indent}  - Otherwise it must match:`,
      ...subschemaLines(s.else, path, `${indent}    `, depth)
    );
  }
  return lines;
}

function dependentSchemaLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  const dependents = (schema as any).dependentSchemas;
  if (!dependents || typeof dependents !== "object") return [];
  return Object.entries(dependents).flatMap(([key, dependent]) => [
    `${indent}- If ${code(joinPath(path, key))} is present, the value must also match:`,
    ...subschemaLines(dependent, path, `${indent}  `, depth),
  ]);
}

function fieldLines(
  path: string,
  schema: unknown,
  required: boolean,
  indent: string,
  depth: number,
  extra: string[] = []
): string[] {
  const node = normalize(schema);
  const lines = fieldLine(path, node, required, indent, extra);
  if (typeof node === "string" || circularTarget(node) !== undefined) {
    return lines;
  }
  return lines.concat(childLines(node, path, `${indent}  `, depth + 1));
}

function discriminatorLines(
  schema: SchemaObject,
  path: string,
  indent: string
): string[] {
  const discriminator = schema.discriminator;
  if (!discriminator?.propertyName) return [];
  const lines = [
    `${indent}- Discriminator: ${code(joinPath(path, discriminator.propertyName))}`,
  ];
  const mapping = discriminator.mapping as Record<string, unknown> | undefined;
  if (mapping) {
    for (const [value, target] of Object.entries(mapping)) {
      const name =
        typeof target === "string"
          ? target.split("/").pop()
          : ((target as SchemaObject)?.title ?? "");
      lines.push(`${indent}  - ${code(value)} selects ${name}`);
    }
  }
  return lines;
}

function variantLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number,
  kind: "allOf" | "oneOf" | "anyOf"
): string[] {
  const branches = (schema[kind] ?? []) as unknown[];
  const label = {
    allOf: "All of these must match:",
    oneOf: "Exactly one of these options:",
    anyOf: "One or more of these options:",
  }[kind];
  const lines = [
    ...(kind === "oneOf" || (kind === "anyOf" && !schema.oneOf)
      ? discriminatorLines(schema, path, indent)
      : []),
    `${indent}- ${label}`,
  ];

  branches.forEach((branch, index) => {
    const node = normalize(branch);
    const target = circularTarget(node);
    const name = `Option ${index + 1}`;
    if (target !== undefined) {
      lines.push(`${indent}  - ${name}: circular reference to ${target}`);
      return;
    }
    let s = node as SchemaObject;
    if (
      s.discriminator?.propertyName &&
      s.discriminator.propertyName === schema.discriminator?.propertyName
    ) {
      s = { ...s, discriminator: undefined };
    }
    const heading = [name, s.title].filter(Boolean).join(": ");
    const details = [typeLabel(s), ...qualifiers(s)];
    lines.push(`${indent}  - ${heading} (${details.join(", ")})`);
    if (s.description) {
      lines.push(...indentLines(s.description, `${indent}    `));
    }
    lines.push(...inheritLines(s, `${indent}    `));
    lines.push(...childLines(s, path, `${indent}    `, depth + 1));
  });
  return lines;
}

function mappingLines(
  entries: [string, unknown][],
  propertyName: string,
  path: string,
  indent: string,
  depth: number
): string[] {
  const lines = [`${indent}  - The value selects one of these schemas:`];
  for (const [value, target] of entries) {
    const label = `${indent}    - ${code(value)}`;
    if (typeof target === "string" && circularTarget(target) === undefined) {
      lines.push(`${label}: ${target.split("/").pop()}`);
      continue;
    }
    const node = normalize(target);
    const circular = circularTarget(node);
    if (circular !== undefined) {
      lines.push(`${label}: circular reference to ${circular}`);
      continue;
    }
    const s = withoutProperty(node as SchemaObject, propertyName);
    lines.push(
      `${label}: ${[s.title, `(${typeLabel(s)})`].filter(Boolean).join(" ")}`
    );
    if (s.description) {
      lines.push(...indentLines(s.description, `${indent}      `));
    }
    lines.push(...inheritLines(s, `${indent}      `));
    lines.push(...childLines(s, path, `${indent}      `, depth + 1));
  }
  return lines;
}

/**
 * An object-level discriminator, rendered by the theme as one tab per mapping
 * value. Lists every mapped schema under the discriminator property.
 */
function discriminatorPropertyLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  const entries = discriminatorMapping(schema)!;
  const name = schema.discriminator!.propertyName;
  const required = Array.isArray(schema.required)
    ? schema.required.includes(name)
    : false;
  const property = normalize(schema.properties?.[name] ?? {});
  const field =
    typeof property === "string" || circularTarget(property) !== undefined
      ? fieldLine(joinPath(path, name), property, required, indent)
      : fieldLine(
          joinPath(path, name),
          { ...(property as SchemaObject), oneOf: undefined, anyOf: undefined },
          required,
          indent,
          ["discriminator"]
        );
  return [...field, ...mappingLines(entries, name, path, indent, depth)];
}

function propertyLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  const kinds = (["allOf", "oneOf", "anyOf"] as const).filter(
    (kind) => schema[kind]
  );
  if (kinds.length > 0) {
    const required = Array.isArray(schema.required) ? schema.required : [];
    const shared = Object.entries(schema.properties ?? {}).flatMap(
      ([name, property]) =>
        fieldLines(
          joinPath(path, name),
          property,
          required.includes(name),
          indent,
          depth
        )
    );
    return [
      ...shared,
      ...kinds.flatMap((kind) =>
        variantLines(schema, path, indent, depth, kind)
      ),
    ];
  }

  const lines: string[] = [];
  const required = Array.isArray(schema.required) ? schema.required : [];
  const discriminatorName = discriminatorMapping(schema)
    ? schema.discriminator!.propertyName
    : undefined;
  if (discriminatorName && !schema.properties?.[discriminatorName]) {
    lines.push(...discriminatorPropertyLines(schema, path, indent, depth));
  }
  for (const [name, property] of Object.entries(schema.properties ?? {})) {
    if (name === discriminatorName) {
      lines.push(...discriminatorPropertyLines(schema, path, indent, depth));
      continue;
    }
    lines.push(
      ...fieldLines(
        joinPath(path, name),
        property,
        required.includes(name),
        indent,
        depth
      )
    );
  }

  const additional = schema.additionalProperties;
  if (additional && typeof additional === "object") {
    lines.push(
      ...fieldLines(joinPath(path, "<key>"), additional, false, indent, depth, [
        "additional property",
      ])
    );
  }
  return lines;
}

/**
 * Renders a schema as a markdown list. Every field shows its full dotted path,
 * so each line can be read on its own. Nested fields are always included.
 */
export function formatSchema(schema: unknown): string {
  const node = normalize(schema);
  const target = circularTarget(node);
  if (target !== undefined) {
    return `Schema: circular reference to ${target}`;
  }
  const s = node as SchemaObject;
  const details = [typeLabel(s), ...qualifiers(s)];
  const lines = [`Schema: ${code(details[0])}`];
  if (details.length > 1) {
    lines[0] += ` (${details.slice(1).join(", ")})`;
  }
  if (s.title && !s.description && !getSchemaName(s).includes(s.title)) {
    lines.push("", s.title);
  }
  if (s.description) {
    lines.push("", s.description.trim());
  }
  const enumLines = enumDescriptionLines(s, "");
  if (enumLines.length > 0) {
    lines.push("", ...enumLines);
  }
  const inherited = inheritLines(s, "");
  if (inherited.length > 0) {
    lines.push("", ...inherited);
  }
  const docs = externalDocsLines(s, "");
  if (docs.length > 0) {
    lines.push("", ...docs);
  }

  const fields = childLines(s, "", "", 0);
  if (fields.length > 0) {
    lines.push("", ...fields);
  }
  return lines.join("\n");
}

export function formatSchemaField(
  name: string,
  schema: unknown,
  required: boolean,
  extra: string[] = []
): string {
  return fieldLines(name, schema, required, "", 0, extra).join("\n");
}
