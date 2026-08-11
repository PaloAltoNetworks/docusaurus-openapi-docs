/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type { TagGroupObject, TagObject } from "../openapi/types";
import type { ApiMetadata } from "../types";
import generateSidebarSlice from "./index";

describe("generateSidebarSlice", () => {
  describe("tagGroup with overlapping tags", () => {
    const mockApiItems: ApiMetadata[] = [
      {
        type: "api",
        id: "get-books",
        unversionedId: "get-books",
        title: "Get Books",
        description: "",
        source: "",
        sourceDirName: "",
        permalink: "/get-books",
        frontMatter: {},
        api: {
          method: "get",
          path: "/books",
          tags: ["Books", "Deprecated"],
          jsonRequestBodyExample: "",
          info: { title: "Test API", version: "1.0.0" },
        },
      } as ApiMetadata,
    ];

    const mockTags: TagObject[][] = [
      [
        { name: "Books", description: "Book operations" },
        { name: "Deprecated", description: "Deprecated endpoints" },
      ],
    ];

    const mockTagGroups: TagGroupObject[] = [
      { name: "Library", tags: ["Books"] },
      { name: "Deprecation", tags: ["Deprecated"] },
    ];

    function collectKeys(obj: unknown): string[] {
      const keys: string[] = [];
      JSON.stringify(obj, (k, v) => {
        if (k === "key" && typeof v === "string") {
          keys.push(v);
        }
        return v;
      });
      return keys;
    }

    it("should generate unique keys for items appearing in multiple tagGroups", () => {
      const result = generateSidebarSlice(
        { groupPathsBy: "tagGroup" },
        { outputDir: "docs/test", specPath: "" },
        mockApiItems,
        mockTags,
        "",
        mockTagGroups
      );

      const keys = collectKeys(result);

      expect(keys.length).toBeGreaterThan(0);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("should include tagGroup name in keys to differentiate same items", () => {
      const result = generateSidebarSlice(
        { groupPathsBy: "tagGroup" },
        { outputDir: "docs/test", specPath: "" },
        mockApiItems,
        mockTags,
        "",
        mockTagGroups
      );

      const keys = collectKeys(result);

      expect(keys.filter((k) => k.includes("library")).length).toBeGreaterThan(
        0
      );
      expect(
        keys.filter((k) => k.includes("deprecation")).length
      ).toBeGreaterThan(0);
    });
  });

  describe("tagParent (OpenAPI 3.2 hierarchical tags)", () => {
    const apiItem = (id: string, path: string, tag: string): ApiMetadata =>
      ({
        type: "api",
        id,
        unversionedId: id,
        title: id,
        description: "",
        source: "",
        sourceDirName: "",
        permalink: `/${id}`,
        frontMatter: {},
        api: {
          method: "get",
          path,
          tags: [tag],
          jsonRequestBodyExample: "",
          info: { title: "Test API", version: "1.0.0" },
        },
      }) as ApiMetadata;

    const mockApiItems: ApiMetadata[] = [
      apiItem("get-cakes", "/cakes", "Cakes"),
      apiItem("get-seasonal", "/cakes/seasonal", "Seasonal Cakes"),
    ];

    // "Products" is a pure container tag with no operations of its own.
    const mockTags: TagObject[][] = [
      [
        { name: "Products" },
        { name: "Cakes", parent: "Products" },
        { name: "Seasonal Cakes", parent: "Cakes" },
      ],
    ];

    function findCategory(items: any[], label: string): any {
      for (const item of items ?? []) {
        if (item.type === "category" && item.label === label) return item;
        const nested = findCategory(item.items ?? [], label);
        if (nested) return nested;
      }
      return undefined;
    }

    function labelsOf(items: any[]): string[] {
      return (items ?? []).map((i) => i.label);
    }

    it("nests tags into a hierarchy driven by tags[].parent", () => {
      const result = generateSidebarSlice(
        { groupPathsBy: "tagParent" },
        { outputDir: "docs/test", specPath: "" },
        mockApiItems,
        mockTags,
        ""
      );

      // Root should be the container "Products".
      expect(labelsOf(result)).toEqual(["Products"]);

      const products = findCategory(result, "Products");
      const cakes = findCategory(products.items, "Cakes");
      expect(cakes).toBeDefined();

      // "Cakes" holds its operation doc followed by the "Seasonal Cakes" child.
      const cakesTypes = cakes.items.map((i: any) => i.type);
      expect(cakesTypes).toContain("doc");
      expect(cakesTypes).toContain("category");

      const seasonal = findCategory(cakes.items, "Seasonal Cakes");
      expect(seasonal).toBeDefined();
      expect(seasonal.items.some((i: any) => i.type === "doc")).toBe(true);
    });

    it("prunes empty container tags with no operations or children", () => {
      const tagsWithEmptyContainer: TagObject[][] = [
        [
          { name: "Products" },
          { name: "Cakes", parent: "Products" },
          { name: "Empty" }, // no operations, no children
        ],
      ];

      const result = generateSidebarSlice(
        { groupPathsBy: "tagParent" },
        { outputDir: "docs/test", specPath: "" },
        [apiItem("get-cakes", "/cakes", "Cakes")],
        tagsWithEmptyContainer,
        ""
      );

      expect(findCategory(result, "Empty")).toBeUndefined();
      expect(findCategory(result, "Products")).toBeDefined();
    });

    it("treats cyclic parent references as roots without recursing forever", () => {
      const cyclicTags: TagObject[][] = [
        [
          { name: "A", parent: "B" },
          { name: "B", parent: "A" },
        ],
      ];

      const result = generateSidebarSlice(
        { groupPathsBy: "tagParent" },
        { outputDir: "docs/test", specPath: "" },
        [apiItem("get-a", "/a", "A"), apiItem("get-b", "/b", "B")],
        cyclicTags,
        ""
      );

      // Both surface as top-level categories; neither nests the other.
      expect(findCategory(result, "A")).toBeDefined();
      expect(findCategory(result, "B")).toBeDefined();
      expect(
        findCategory(findCategory(result, "A").items, "B")
      ).toBeUndefined();
    });

    it("treats a dangling parent reference as a root", () => {
      const danglingTags: TagObject[][] = [
        [{ name: "Cakes", parent: "DoesNotExist" }],
      ];

      const result = generateSidebarSlice(
        { groupPathsBy: "tagParent" },
        { outputDir: "docs/test", specPath: "" },
        [apiItem("get-cakes", "/cakes", "Cakes")],
        danglingTags,
        ""
      );

      expect(labelsOf(result)).toContain("Cakes");
    });
  });
});
