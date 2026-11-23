/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { code, formatValue, indentLines } from "./utils";
import { foldSiblingsIntoBranches, mergeAllOf } from "../markdown/createSchema";
import { getSchemaName } from "../markdown/schema";
import { SchemaObject } from "../openapi/types";

const MAX_DEPTH = 15;
const MAX_INLINE_EXAMPLE_LENGTH = 120;

type SchemaNode = SchemaObject | string;

const CIRCULAR_MARKER = "x-markdown-export-circular";

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
    const circular = node.allOf.find((member: unknown) =>
      circularTarget(member)
    );
    if (circular !== undefined) {
      return { [CIRCULAR_MARKER]: circularTarget(circular) };
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
  return node;
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
    try {
      node = mergeAllOf(node);
    } catch {
      // fall back to the unmerged schema
    }
  }
  if ((node.oneOf || node.anyOf) && (node.properties || node.items)) {
    node = foldSiblingsIntoBranches(node);
  }
  return node;
}

function typeLabel(schema: SchemaObject): string {
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
    Object.keys(value).length === 0
  );
}

function qualifiers(schema: SchemaObject): string[] {
  const result: string[] = [];
  const s = schema as any;

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
  } else if (schema.minimum !== undefined) {
    result.push(`${s.exclusiveMinimum ? ">" : ">="} ${schema.minimum}`);
  }
  if (typeof s.exclusiveMaximum === "number") {
    result.push(`< ${s.exclusiveMaximum}`);
  } else if (schema.maximum !== undefined) {
    result.push(`${s.exclusiveMaximum ? "<" : "<="} ${schema.maximum}`);
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
  return result;
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
    schema.oneOf ||
    schema.anyOf
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
  }
  return [];
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
  depth: number
): string[] {
  const kind = schema.oneOf ? "oneOf" : "anyOf";
  const branches = (schema[kind] ?? []) as unknown[];
  const label =
    kind === "oneOf"
      ? "Exactly one of these options:"
      : "One or more of these options:";
  const lines = [
    ...discriminatorLines(schema, path, indent),
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
    const s = node as SchemaObject;
    const heading = [name, s.title].filter(Boolean).join(": ");
    const details = [typeLabel(s), ...qualifiers(s)];
    lines.push(`${indent}  - ${heading} (${details.join(", ")})`);
    if (s.description) {
      lines.push(...indentLines(s.description, `${indent}    `));
    }
    lines.push(...childLines(s, path, `${indent}    `, depth + 1));
  });
  return lines;
}

function propertyLines(
  schema: SchemaObject,
  path: string,
  indent: string,
  depth: number
): string[] {
  if (schema.oneOf || schema.anyOf) {
    return variantLines(schema, path, indent, depth);
  }

  const lines: string[] = [];
  const required = Array.isArray(schema.required) ? schema.required : [];
  for (const [name, property] of Object.entries(schema.properties ?? {})) {
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
