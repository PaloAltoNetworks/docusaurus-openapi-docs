/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

// eslint-disable-next-line import/no-extraneous-dependencies
import { posixPath } from "@docusaurus/utils";

import { readOpenapiFiles } from ".";
import { processOpenapiFile } from "./openapi";
import type { APIOptions, SidebarOptions } from "../types";

// npx jest packages/docusaurus-plugin-openapi/src/openapi/openapi.test.ts --watch

describe("openapi", () => {
  describe("readOpenapiFiles", () => {
    it("readOpenapiFiles", async () => {
      const results = await readOpenapiFiles(
        posixPath(path.join(__dirname, "__fixtures__/examples"))
      );
      const categoryMeta = results.find((x) =>
        x.source.endsWith("_category_.json")
      );
      expect(categoryMeta).toBeFalsy();
      // console.log(results);
      const yaml = results.find((x) => x.source.endsWith("openapi.yaml"));
      expect(yaml).toBeTruthy();
      expect(yaml?.sourceDirName).toBe(".");

      expect(yaml?.data.tags).toBeDefined();
      expect(yaml?.data["x-tagGroups"]).toBeDefined();

      expect(
        yaml?.data.components?.schemas?.HelloString["x-tags"]
      ).toBeDefined();
    });
  });

  describe("schemasOnly", () => {
    it("includes schema metadata when showSchemas is disabled", async () => {
      const openapiData = {
        openapi: "3.0.0",
        info: {
          title: "Schema Only",
          version: "1.0.0",
        },
        paths: {
          "/ping": {
            get: {
              summary: "Ping",
              responses: {
                "200": {
                  description: "OK",
                },
              },
            },
          },
        },
        components: {
          schemas: {
            WithoutTags: {
              title: "Without Tags",
              type: "object",
              properties: {
                value: {
                  type: "string",
                },
              },
            },
          },
        },
      };

      const options: APIOptions = {
        specPath: "dummy", // required by the type but unused in this context
        outputDir: "build",
        showSchemas: false,
        schemasOnly: true,
      };

      const sidebarOptions = {} as SidebarOptions;

      const [items] = await processOpenapiFile(
        openapiData as any,
        options,
        sidebarOptions
      );

      const schemaItems = items.filter((item) => item.type === "schema");
      expect(schemaItems).toHaveLength(1);
      expect(schemaItems[0].id).toBe("without-tags");
    });
  });

  describe("path parameter and custom verb handling", () => {
    it("correctly converts path parameters and preserves custom verbs during postman binding", async () => {
      const openapiData = {
        openapi: "3.0.0",
        info: {
          title: "Path Parameter API",
          version: "1.0.0",
        },
        paths: {
          "/api/resource:customVerb": {
            post: {
              summary: "Custom verb endpoint",
              operationId: "customVerbOperation",
              responses: {
                "200": {
                  description: "OK",
                },
              },
            },
          },
          "/api/users/{id}": {
            get: {
              summary: "Get user by ID",
              operationId: "getUserById",
              parameters: [
                {
                  name: "id",
                  in: "path",
                  required: true,
                  schema: {
                    type: "string",
                  },
                },
              ],
              responses: {
                "200": {
                  description: "OK",
                },
              },
            },
          },
          "/api/users/{userId}/posts/{postId}": {
            get: {
              summary: "Get user post",
              operationId: "getUserPost",
              parameters: [
                {
                  name: "userId",
                  in: "path",
                  required: true,
                  schema: {
                    type: "string",
                  },
                },
                {
                  name: "postId",
                  in: "path",
                  required: true,
                  schema: {
                    type: "string",
                  },
                },
              ],
              responses: {
                "200": {
                  description: "OK",
                },
              },
            },
          },
        },
      };

      const options: APIOptions = {
        specPath: "dummy",
        outputDir: "build",
      };

      const sidebarOptions = {} as SidebarOptions;

      const [items] = await processOpenapiFile(
        openapiData as any,
        options,
        sidebarOptions
      );

      const apiItems = items.filter((item) => item.type === "api");
      expect(apiItems).toHaveLength(3);

      // Test 1: Custom verb path should be preserved (NOT converted to {customVerb})
      // The path /api/resource:customVerb should remain unchanged
      const customVerbItem = apiItems.find(
        (item) => item.type === "api" && item.id === "custom-verb-operation"
      );
      expect(customVerbItem).toBeDefined();
      expect(customVerbItem?.type).toBe("api");
      const customVerbApiItem = customVerbItem as any;
      expect(customVerbApiItem.api.path).toBe("/api/resource:customVerb");
      expect(customVerbApiItem.api.method).toBe("post");
      expect(customVerbApiItem.api.postman).toBeDefined();
      expect(customVerbApiItem.api.postman).not.toEqual({});

      // Test 2: Standard path parameter should work (/:id -> /{id} conversion)
      // OpenAPI format {id} -> Postman format /:id -> Regex converts back to {id} -> Match succeeds
      const standardItem = apiItems.find(
        (item) => item.type === "api" && item.id === "get-user-by-id"
      );
      expect(standardItem).toBeDefined();
      expect(standardItem?.type).toBe("api");
      const standardApiItem = standardItem as any;
      expect(standardApiItem.api.path).toBe("/api/users/{id}");
      expect(standardApiItem.api.method).toBe("get");
      expect(standardApiItem.api.postman).toBeDefined();
      expect(standardApiItem.api.postman).not.toEqual({});

      // Test 3: Multiple path parameters should all be converted (/:userId/:postId -> /{userId}/{postId})
      const multiParamItem = apiItems.find(
        (item) => item.type === "api" && item.id === "get-user-post"
      );
      expect(multiParamItem).toBeDefined();
      expect(multiParamItem?.type).toBe("api");
      const multiParamApiItem = multiParamItem as any;
      expect(multiParamApiItem.api.path).toBe("/api/users/{userId}/posts/{postId}");
      expect(multiParamApiItem.api.method).toBe("get");
      expect(multiParamApiItem.api.postman).toBeDefined();
      expect(multiParamApiItem.api.postman).not.toEqual({});
    });
  });
});
