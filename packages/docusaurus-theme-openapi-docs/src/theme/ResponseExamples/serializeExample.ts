/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/**
 * Helpers for the OpenAPI 3.2 Example Object fields `dataValue` and
 * `serializedValue`.
 *
 * - `serializedValue` is the example exactly as it appears on the wire and is
 *   displayed verbatim.
 * - `dataValue` is the structured example data and has to be serialized
 *   according to the media type (and, for XML, the schema's `xml` metadata).
 */

interface XmlObject {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
  nodeType?: "element" | "attribute" | "text" | "cdata" | "none";
}

const INDENT = "  ";

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Flattens `allOf` (and picks the first `oneOf`/`anyOf` branch) so that the
 * `properties`, `items` and `xml` metadata can be read from a single object.
 */
function resolveSchema(schema: any): Record<string, any> {
  if (!isPlainObject(schema)) {
    return {};
  }

  let resolved: Record<string, any> = schema;

  if (Array.isArray(schema.allOf)) {
    const { allOf, ...rest } = schema;
    resolved = allOf.reduce((merged: Record<string, any>, part: any) => {
      const next = resolveSchema(part);
      return {
        ...next,
        ...merged,
        properties: { ...next.properties, ...merged.properties },
        xml: { ...next.xml, ...merged.xml },
      };
    }, rest);
  }

  const alternatives = resolved.oneOf ?? resolved.anyOf;
  if (
    Array.isArray(alternatives) &&
    alternatives.length > 0 &&
    resolved.properties === undefined &&
    resolved.items === undefined
  ) {
    const { oneOf, anyOf, ...rest } = resolved;
    const first = resolveSchema(alternatives[0]);
    return { ...first, ...rest, xml: { ...first.xml, ...rest.xml } };
  }

  return resolved;
}

function nodeTypeOf(xml: XmlObject): NonNullable<XmlObject["nodeType"]> {
  if (xml.nodeType) return xml.nodeType;
  return xml.attribute ? "attribute" : "element";
}

function qualify(name: string, xml: XmlObject): string {
  return xml.prefix ? `${xml.prefix}:${name}` : name;
}

function namespaceAttribute(xml: XmlObject): string {
  if (!xml.namespace) return "";
  const declaration = xml.prefix ? `xmlns:${xml.prefix}` : "xmlns";
  return ` ${declaration}="${escapeAttribute(xml.namespace)}"`;
}

function renderXml(
  data: unknown,
  schemaInput: unknown,
  fallbackName: string,
  depth: number
): string[] {
  const schema = resolveSchema(schemaInput);
  const xml: XmlObject = schema.xml ?? {};
  const pad = INDENT.repeat(depth);

  if (Array.isArray(data)) {
    const wrapped = xml.wrapped === true;
    const itemName = wrapped ? fallbackName : (xml.name ?? fallbackName);
    const itemDepth = wrapped ? depth + 1 : depth;
    const items = data.flatMap((item) =>
      renderXml(item, schema.items, itemName, itemDepth)
    );
    if (!wrapped) return items;
    const tag = qualify(xml.name ?? fallbackName, xml);
    return [
      `${pad}<${tag}${namespaceAttribute(xml)}>`,
      ...items,
      `${pad}</${tag}>`,
    ];
  }

  const tag = qualify(xml.name ?? fallbackName, xml);
  let attributes = namespaceAttribute(xml);
  let text = "";
  let children: string[] = [];

  if (isPlainObject(data)) {
    const properties = isPlainObject(schema.properties)
      ? schema.properties
      : {};
    const childDepth = nodeTypeOf(xml) === "none" ? depth : depth + 1;
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (value === undefined) continue;
      const childSchema = resolveSchema(properties[key]);
      const childXml: XmlObject = childSchema.xml ?? {};
      const childName = qualify(childXml.name ?? key, childXml);
      switch (nodeTypeOf(childXml)) {
        case "attribute":
          attributes += ` ${childName}="${escapeAttribute(String(value))}"`;
          break;
        case "text":
          text += escapeText(String(value));
          break;
        case "cdata":
          text += `<![CDATA[${String(value)}]]>`;
          break;
        default:
          children = children.concat(
            renderXml(value, childSchema, key, childDepth)
          );
      }
    }
    if (nodeTypeOf(xml) === "none") return children;
  } else if (data !== null && data !== undefined) {
    text = escapeText(String(data));
  }

  if (children.length > 0) {
    return [
      `${pad}<${tag}${attributes}>`,
      ...(text ? [`${pad}${INDENT}${text}`] : []),
      ...children,
      `${pad}</${tag}>`,
    ];
  }
  if (text) return [`${pad}<${tag}${attributes}>${text}</${tag}>`];
  return [`${pad}<${tag}${attributes}/>`];
}

/**
 * Serializes structured example data as XML, honoring the schema's `xml`
 * metadata (`name`, `namespace`, `prefix`, `attribute`, `wrapped` and
 * `nodeType`).
 */
export function dataValueToXml(
  dataValue: unknown,
  schema?: unknown,
  rootName: string = "root"
): string {
  return renderXml(dataValue, schema, rootName, 0).join("\n");
}

function serializeDataValue(
  dataValue: unknown,
  mimeType: string,
  schema?: unknown
): string {
  const mediaType = mimeType.split(";")[0].trim().toLowerCase();
  if (mediaType.endsWith("xml")) {
    return dataValueToXml(dataValue, schema);
  }
  if (typeof dataValue === "string" && !mediaType.endsWith("json")) {
    return dataValue;
  }
  return JSON.stringify(dataValue, null, 2);
}

/**
 * Returns the display string for an Example Object that uses the OpenAPI 3.2
 * `serializedValue` or `dataValue` fields, or `undefined` when neither is set
 * so callers can fall back to the legacy `value` field.
 */
export function serializeExampleFields(
  example: any,
  mimeType: string,
  schema?: unknown
): string | undefined {
  if (!isPlainObject(example)) return undefined;

  const { serializedValue, dataValue } = example;
  if (serializedValue !== undefined) {
    return typeof serializedValue === "string"
      ? serializedValue
      : JSON.stringify(serializedValue, null, 2);
  }
  if (dataValue !== undefined) {
    return serializeDataValue(dataValue, mimeType, schema);
  }
  return undefined;
}
