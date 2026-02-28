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
});
