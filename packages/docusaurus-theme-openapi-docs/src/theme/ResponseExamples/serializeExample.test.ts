/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { dataValueToXml, serializeExampleFields } from "./serializeExample";

describe("serializeExampleFields", () => {
  it("returns undefined for legacy value examples", () => {
    expect(
      serializeExampleFields({ value: { a: 1 } }, "application/json")
    ).toBeUndefined();
  });

  it("returns serializedValue verbatim", () => {
    const serializedValue = "<Pet>\n  <name>Fluffy</name>\n</Pet>\n";
    expect(
      serializeExampleFields(
        { serializedValue, dataValue: { name: "x" } },
        "application/xml"
      )
    ).toBe(serializedValue);
  });

  it("serializes dataValue as JSON", () => {
    expect(
      serializeExampleFields(
        { dataValue: { name: "Fluffy" } },
        "application/json"
      )
    ).toBe('{\n  "name": "Fluffy"\n}');
    expect(
      serializeExampleFields({ dataValue: "hi" }, "application/problem+json")
    ).toBe('"hi"');
  });

  it("serializes string dataValue as-is for non-JSON media types", () => {
    expect(serializeExampleFields({ dataValue: "plain" }, "text/plain")).toBe(
      "plain"
    );
  });

  it("serializes dataValue as XML using the schema xml metadata", () => {
    const schema = {
      type: "object",
      xml: { name: "Pet" },
      properties: { name: { type: "string" } },
    };
    expect(
      serializeExampleFields(
        { dataValue: { name: "Fluffy" } },
        "application/xml; charset=utf-8",
        schema
      )
    ).toBe("<Pet>\n  <name>Fluffy</name>\n</Pet>");
  });
});

describe("dataValueToXml", () => {
  it("falls back to a root element without a schema", () => {
    expect(dataValueToXml({ a: 1, b: [2, 3] })).toBe(
      "<root>\n  <a>1</a>\n  <b>2</b>\n  <b>3</b>\n</root>"
    );
  });

  it("supports attributes, renamed elements, namespaces and prefixes", () => {
    const schema = {
      type: "object",
      xml: { name: "Pet", namespace: "http://example.com/schema", prefix: "p" },
      properties: {
        id: { type: "integer", xml: { attribute: true } },
        name: { type: "string", xml: { name: "title" } },
      },
    };
    expect(dataValueToXml({ id: 7, name: "A & B" }, schema)).toBe(
      '<p:Pet xmlns:p="http://example.com/schema" id="7">\n  <title>A &amp; B</title>\n</p:Pet>'
    );
  });

  it("supports wrapped and unwrapped arrays", () => {
    const schema = {
      type: "object",
      xml: { name: "Pet" },
      properties: {
        tags: {
          type: "array",
          xml: { wrapped: true },
          items: { type: "string", xml: { name: "tag" } },
        },
        photos: {
          type: "array",
          xml: { name: "photo" },
          items: { type: "string" },
        },
      },
    };
    expect(
      dataValueToXml({ tags: ["a", "b"], photos: ["x", "y"] }, schema)
    ).toBe(
      [
        "<Pet>",
        "  <tags>",
        "    <tag>a</tag>",
        "    <tag>b</tag>",
        "  </tags>",
        "  <photo>x</photo>",
        "  <photo>y</photo>",
        "</Pet>",
      ].join("\n")
    );
  });

  it("supports text nodes and nested objects through allOf", () => {
    const schema = {
      allOf: [
        { xml: { name: "Note" } },
        {
          type: "object",
          properties: {
            lang: { type: "string", xml: { nodeType: "attribute" } },
            body: { type: "string", xml: { nodeType: "text" } },
            author: {
              type: "object",
              properties: { name: { type: "string" } },
            },
          },
        },
      ],
    };
    expect(
      dataValueToXml({ lang: "en", body: "Hi", author: { name: "Al" } }, schema)
    ).toBe(
      [
        '<Note lang="en">',
        "  Hi",
        "  <author>",
        "    <name>Al</name>",
        "  </author>",
        "</Note>",
      ].join("\n")
    );
  });

  it("renders empty elements for null values", () => {
    expect(dataValueToXml({ a: null })).toBe("<root>\n  <a/>\n</root>");
  });
});
