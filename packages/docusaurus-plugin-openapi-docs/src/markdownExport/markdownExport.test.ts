/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import {
  createApiMarkdown,
  createInfoMarkdown,
  createSchemaMarkdown,
  createTagMarkdown,
  getDocSource,
  getDocsByPath,
  getMarkdownExportConfigs,
  formatSchema,
  resolveSpecUrl,
  toMarkdownUrl,
} from ".";
import { SchemaObject } from "../openapi/types";
import type {
  ApiPageMetadata,
  InfoPageMetadata,
  SchemaPageMetadata,
  TagPageMetadata,
} from "../types";

const orderSchema: SchemaObject = {
  type: "object",
  required: ["orderItems"],
  properties: {
    id: { type: "string", format: "ulid", readOnly: true, description: "ID." },
    orderItems: {
      type: "array",
      minItems: 1,
      description: "List of items to include in the order.",
      items: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: {
            type: "integer",
            minimum: 1,
            description: "Quantity of the menu item.",
          },
          comment: { type: "string", maxLength: 500 },
        },
      },
    },
  },
};

describe("formatSchema", () => {
  it("lists nested fields with full dotted paths", () => {
    const output = formatSchema(orderSchema);
    expect(output).toContain("- `id` (string<ulid>, read-only)");
    expect(output).toContain(
      "- `orderItems` (object[], required, min items: 1)\n  List of items to include in the order."
    );
    expect(output).toContain(
      "  - `orderItems[].quantity` (integer, required, >= 1)\n    Quantity of the menu item."
    );
    expect(output).toContain(
      "  - `orderItems[].comment` (string, max length: 500)"
    );
  });

  it("renders every oneOf variant and the discriminator", () => {
    const output = formatSchema({
      type: "object",
      properties: {
        pet: {
          oneOf: [
            {
              title: "Cat",
              type: "object",
              properties: { meows: { type: "boolean" } },
            },
            {
              title: "Dog",
              type: "object",
              properties: { barks: { type: "boolean" } },
            },
          ],
          discriminator: {
            propertyName: "petType",
            mapping: { cat: "#/components/schemas/Cat" },
          },
        },
      },
    });
    expect(output).toContain("- `pet` (one of)");
    expect(output).toContain("  - Discriminator: `pet.petType`");
    expect(output).toContain("    - `cat` selects Cat");
    expect(output).toContain("  - Exactly one of these options:");
    expect(output).toContain("    - Option 1: Cat (object)");
    expect(output).toContain("      - `pet.meows` (boolean)");
    expect(output).toContain("    - Option 2: Dog (object)");
    expect(output).toContain("      - `pet.barks` (boolean)");
  });

  it("merges allOf members", () => {
    const output = formatSchema({
      allOf: [
        { type: "object", properties: { a: { type: "string" } } },
        { type: "object", properties: { b: { type: "number" } } },
      ],
    });
    expect(output).toContain("- `a` (string)");
    expect(output).toContain("- `b` (number)");
  });

  it("stops at circular references", () => {
    const output = formatSchema({
      type: "object",
      properties: {
        parent: "circular(Node)" as unknown as SchemaObject,
        children: {
          type: "array",
          items: "circular(Node)" as unknown as SchemaObject,
        },
      },
    });
    expect(output).toContain("- `parent` (circular reference to Node)");
    expect(output).toContain("  - `children[]` (circular reference to Node)");
  });

  it("keeps circular references nested in a merged allOf", () => {
    const output = formatSchema({
      allOf: [
        { title: "Pettie" },
        {
          type: "object",
          properties: {
            friend: { allOf: ["circular(Pet)" as unknown as SchemaObject] },
          },
        },
      ],
    });
    expect(output).toContain("- `friend` (circular reference to Pet)");
  });

  it("uses [] paths for top-level arrays and shows additional properties", () => {
    const output = formatSchema({
      type: "array",
      items: {
        type: "object",
        properties: {
          labels: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
      },
    });
    expect(output).toContain("Schema: `object[]`");
    expect(output).toContain("- `[].labels` (object)");
    expect(output).toContain(
      "  - `[].labels.<key>` (string, additional property)"
    );
  });

  it("shows enum values and enum descriptions", () => {
    const output = formatSchema({
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["open", "closed"],
          default: "open",
          "x-enumDescriptions": { open: "Still active." },
        },
      },
    });
    expect(output).toContain(
      "- `status` (string, possible values: `open`, `closed`, default: `open`)"
    );
    expect(output).toContain("  - `open`: Still active.");
  });
});

const apiItem = {
  type: "api",
  id: "create-order",
  unversionedId: "create-order",
  title: "Create an order",
  description: "Creates a new order.",
  frontMatter: {},
  api: {
    method: "post",
    path: "/orders/{storeId}",
    operationId: "createOrder",
    tags: ["orders"],
    parameters: [
      {
        name: "storeId",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Store ID.",
      },
      {
        name: "dryRun",
        in: "query",
        schema: { type: "boolean", default: false },
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: orderSchema,
          example: { orderItems: [{ quantity: 2 }] },
        },
      },
    },
    responses: {
      "201": {
        description: "Order created.",
        headers: {
          "X-Request-Id": {
            schema: { type: "string" },
            description: "Request ID.",
          },
        },
        content: { "application/json": { schema: orderSchema } },
      },
      "400": { description: "Bad request." },
    },
    security: [{ bearer: [] }],
    securitySchemes: { bearer: { type: "http", scheme: "bearer" } },
    servers: [{ url: "https://api.example.com" }],
    jsonRequestBodyExample: "",
    info: { title: "Shop", version: "1.0.0" },
  },
} as unknown as ApiPageMetadata;

describe("createApiMarkdown", () => {
  it("renders the full operation", () => {
    expect(createApiMarkdown(apiItem)).toMatchSnapshot();
  });

  it("tolerates null media types and responses", () => {
    const output = createApiMarkdown({
      ...apiItem,
      api: {
        ...apiItem.api,
        parameters: undefined,
        requestBody: undefined,
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": null },
          },
          "204": null,
        },
      },
    } as unknown as ApiPageMetadata);
    expect(output).toContain("#### Content type: `application/json`");
    expect(output).toContain("### 204");
  });

  it("includes every section without hidden content", () => {
    const output = createApiMarkdown(apiItem);
    expect(output).toContain("`POST /orders/{storeId}`");
    expect(output).toContain(
      "### Path parameters\n\n- `storeId` (string, required)"
    );
    expect(output).toContain(
      "### Query parameters\n\n- `dryRun` (boolean, default: `false`)"
    );
    expect(output).toContain("## Request body (required)");
    expect(output).toContain('"quantity": 2');
    expect(output).toContain("### 201\n\nOrder created.");
    expect(output).toContain("- `X-Request-Id` (string)\n  Request ID.");
    expect(output).toContain("### 400\n\nBad request.");
    expect(output).toContain("- `bearer` (HTTP bearer)");
  });
});

describe("other page types", () => {
  const operations = [
    {
      title: "Create an order",
      method: "post",
      path: "/orders",
      url: "/docs/shop/create-order.md",
      tags: ["orders"],
    },
    {
      title: "List users",
      method: "get",
      path: "/users",
      url: "/docs/shop/list-users.md",
      tags: ["users"],
    },
  ];

  it("renders schema pages", () => {
    const output = createSchemaMarkdown({
      type: "schema",
      title: "Order",
      schema: { ...orderSchema, title: "Order", example: { id: "1" } },
    } as unknown as SchemaPageMetadata);
    expect(output.startsWith("# Order\n\nSchema: `object`")).toBe(true);
    expect(output).toContain("- `orderItems[].quantity`");
    expect(output).toContain('"id": "1"');
  });

  it("renders info pages with an operation index", () => {
    const output = createInfoMarkdown(
      {
        type: "info",
        title: "Shop API",
        info: { title: "Shop API", version: "1.0.0", description: "Intro." },
        securitySchemes: { bearer: { type: "http", scheme: "bearer" } },
      } as unknown as InfoPageMetadata,
      operations
    );
    expect(output).toContain("Version: `1.0.0`");
    expect(output).toContain("- `bearer`: HTTP bearer");
    expect(output).toContain(
      "- [Create an order](/docs/shop/create-order.md): `POST /orders`"
    );
  });

  it("renders tag pages with only the tag's operations", () => {
    const output = createTagMarkdown(
      {
        type: "tag",
        title: "Orders",
        tag: { name: "orders", description: "Order operations." },
      } as unknown as TagPageMetadata,
      operations
    );
    expect(output).toContain("Order operations.");
    expect(output).toContain("[Create an order](/docs/shop/create-order.md)");
    expect(output).not.toContain("List users");
  });
});

describe("routing helpers", () => {
  it("resolves the spec URL against the site baseUrl", () => {
    expect(resolveSpecUrl(undefined, "/")).toBeUndefined();
    expect(resolveSpecUrl("/petstore.yaml", "/")).toBe("/petstore.yaml");
    expect(resolveSpecUrl("/petstore.yaml", "/docs/")).toBe(
      "/docs/petstore.yaml"
    );
    expect(resolveSpecUrl("/docs/petstore.yaml", "/docs/")).toBe(
      "/docs/petstore.yaml"
    );
    expect(resolveSpecUrl("https://example.com/spec.json", "/docs/")).toBe(
      "https://example.com/spec.json"
    );
  });

  it("links the spec from API pages", () => {
    expect(createApiMarkdown(apiItem, "/shop.yaml")).toContain(
      "OpenAPI specification: /shop.yaml"
    );
  });

  it("builds markdown URLs from permalinks", () => {
    expect(toMarkdownUrl("/docs/shop/create-order")).toBe(
      "/docs/shop/create-order.md"
    );
    expect(toMarkdownUrl("/docs/shop/create-order/")).toBe(
      "/docs/shop/create-order.md"
    );
    expect(toMarkdownUrl("/")).toBe("/index.md");
  });

  it("maps items to their generated MDX sources", () => {
    expect(
      getDocSource("/site", "docs/shop/", {
        type: "api",
        id: "create-order",
      } as any)
    ).toBe("@site/docs/shop/create-order.api.mdx");
    expect(
      getDocSource("/site", "docs/shop", { type: "schema", id: "order" } as any)
    ).toBe("@site/docs/shop/schemas/order.schema.mdx");
  });

  it("indexes docs of the matching docs plugin instance", () => {
    const docs = getDocsByPath(
      [
        { options: { id: "other" }, content: { loadedVersions: [] } },
        {
          options: { id: "default" },
          content: {
            loadedVersions: [
              {
                docs: [
                  {
                    source: "@site/docs/shop/create-order.api.mdx",
                    permalink: "/docs/shop/create-order",
                  },
                ],
              },
            ],
          },
        },
      ],
      "default"
    );
    expect(docs.get("@site/docs/shop/create-order.api.mdx")?.permalink).toBe(
      "/docs/shop/create-order"
    );
  });

  it("includes versions only when markdownExport is enabled", () => {
    const configs = getMarkdownExportConfigs({
      shop: {
        specPath: "shop.yaml",
        outputDir: "docs/shop",
        markdownExport: true,
        version: "2.0",
        label: "v2",
        baseUrl: "/docs/shop",
        versions: {
          "1.0": {
            specPath: "shop-1.yaml",
            outputDir: "docs/shop/1.0",
            label: "v1",
            baseUrl: "/docs/shop/1.0",
          },
        },
      },
      other: { specPath: "other.yaml", outputDir: "docs/other" },
    });
    expect(configs.map((c) => c.outputDir)).toEqual([
      "docs/shop",
      "docs/shop/1.0",
    ]);
    expect(configs[1].markdownExport).toBe(true);
  });
});
