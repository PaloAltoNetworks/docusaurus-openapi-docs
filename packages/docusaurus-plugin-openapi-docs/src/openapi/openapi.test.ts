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

  describe("path template and custom verb handling", () => {
    it("binds postman requests for OpenAPI templates and path verbs", async () => {
      const openapiData = {
        openapi: "3.0.0",
        info: {
          title: "Path Template API",
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
          "/files/{name}.{ext}": {
            get: {
              summary: "Get file by name and extension",
              operationId: "getFileByNameAndExt",
              parameters: [
                {
                  name: "name",
                  in: "path",
                  required: true,
                  schema: {
                    type: "string",
                  },
                },
                {
                  name: "ext",
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
          "/jobs/{id}:cancel": {
            post: {
              summary: "Cancel job",
              operationId: "cancelJob",
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
      expect(apiItems).toHaveLength(5);

      const customVerbItem = apiItems.find(
        (item) => item.type === "api" && item.id === "custom-verb-operation"
      ) as any;
      expect(customVerbItem.api.path).toBe("/api/resource:customVerb");
      expect(customVerbItem.api.method).toBe("post");
      expect(customVerbItem.api.postman).toBeDefined();

      const standardItem = apiItems.find(
        (item) => item.type === "api" && item.id === "get-user-by-id"
      ) as any;
      expect(standardItem.api.path).toBe("/api/users/{id}");
      expect(standardItem.api.method).toBe("get");
      expect(standardItem.api.postman).toBeDefined();

      const multiParamItem = apiItems.find(
        (item) => item.type === "api" && item.id === "get-user-post"
      ) as any;
      expect(multiParamItem.api.path).toBe(
        "/api/users/{userId}/posts/{postId}"
      );
      expect(multiParamItem.api.method).toBe("get");
      expect(multiParamItem.api.postman).toBeDefined();

      const sameSegmentItem = apiItems.find(
        (item) => item.type === "api" && item.id === "get-file-by-name-and-ext"
      ) as any;
      expect(sameSegmentItem.api.path).toBe("/files/{name}.{ext}");
      expect(sameSegmentItem.api.method).toBe("get");
      expect(sameSegmentItem.api.postman).toBeDefined();

      const templatedVerbItem = apiItems.find(
        (item) => item.type === "api" && item.id === "cancel-job"
      ) as any;
      expect(templatedVerbItem.api.path).toBe("/jobs/{id}:cancel");
      expect(templatedVerbItem.api.method).toBe("post");
      expect(templatedVerbItem.api.postman).toBeDefined();
    });
  });

  describe("static paths after parametric paths (#1519)", () => {
    it("binds correct postman requests when static paths follow parametric siblings", async () => {
      const openapiData = {
        openapi: "3.0.1",
        info: {
          title: "Petstore",
          version: "0.0.1",
          description: "This is a sample server Petstore server.",
        },
        servers: [{ url: "https://petstore.swagger.io/v2" }],
        paths: {
          "/pet/findByStatus": {
            get: {
              summary: "Finds Pets by status",
              operationId: "findPetsByStatus",
              parameters: [
                {
                  name: "status",
                  in: "query",
                  required: true,
                  schema: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["available", "pending", "sold"],
                    },
                    default: ["available"],
                  },
                },
              ],
              responses: { "200": { description: "Success" } },
            },
          },
          "/pet/{petId}": {
            get: {
              summary: "Find pet by ID",
              operationId: "getPetById",
              parameters: [
                {
                  name: "petId",
                  in: "path",
                  required: true,
                  schema: { type: "integer", format: "int64" },
                },
              ],
              responses: { "200": { description: "Success" } },
            },
          },
          "/pet/findByTags": {
            get: {
              summary: "Finds Pets by tags",
              operationId: "findPetsByTags",
              parameters: [
                {
                  name: "tags",
                  in: "query",
                  required: true,
                  style: "form",
                  explode: true,
                  schema: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              ],
              responses: { "200": { description: "Success" } },
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

      const findByStatus = apiItems.find(
        (item) => item.type === "api" && item.id === "find-pets-by-status"
      ) as any;
      expect(findByStatus.api.postman).toBeDefined();
      expect(
        findByStatus.api.postman.url.getPath({ unresolved: true })
      ).toContain("/pet/findByStatus");

      const getPetById = apiItems.find(
        (item) => item.type === "api" && item.id === "get-pet-by-id"
      ) as any;
      expect(getPetById.api.postman).toBeDefined();
      expect(
        getPetById.api.postman.url.getPath({ unresolved: true })
      ).toContain("/pet/:petId");

      const findByTags = apiItems.find(
        (item) => item.type === "api" && item.id === "find-pets-by-tags"
      ) as any;
      expect(findByTags.api.postman).toBeDefined();
      expect(
        findByTags.api.postman.url.getPath({ unresolved: true })
      ).toContain("/pet/findByTags");
    });
  });

  describe("mixed parametric paths at same depth (#1526)", () => {
    it("binds correct postman requests when a static tail collides with a parametric tail", async () => {
      const openapiData = {
        openapi: "3.0.1",
        info: {
          title: "Petstore",
          version: "0.0.1",
          description: "This is a sample server Petstore server.",
        },
        servers: [{ url: "https://petstore.swagger.io/v2" }],
        paths: {
          "/pet/{petId}": {
            get: {
              summary: "Find pet by ID",
              operationId: "getPetById",
              parameters: [
                {
                  name: "petId",
                  in: "path",
                  required: true,
                  schema: { type: "integer", format: "int64" },
                },
              ],
              responses: { "200": { description: "Success" } },
            },
          },
          "/pet/{petId}/{tagId}": {
            get: {
              summary: "Find pet tag by ID",
              operationId: "getPetTagById",
              parameters: [
                {
                  name: "petId",
                  in: "path",
                  required: true,
                  schema: { type: "integer", format: "int64" },
                },
                {
                  name: "tagId",
                  in: "path",
                  required: true,
                  schema: { type: "integer", format: "int64" },
                },
              ],
              responses: { "200": { description: "Success" } },
            },
          },
          "/pet/{petIds}/summary": {
            get: {
              summary: "Get summary for multiple pets",
              operationId: "getPetsSummary",
              parameters: [
                {
                  name: "petIds",
                  in: "path",
                  required: true,
                  schema: { type: "string", example: "1,2,3" },
                },
              ],
              responses: { "200": { description: "Success" } },
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

      const getPetById = apiItems.find(
        (item) => item.type === "api" && item.id === "get-pet-by-id"
      ) as any;
      expect(getPetById.api.postman).toBeDefined();
      expect(getPetById.api.postman.url.getPath({ unresolved: true })).toBe(
        "/pet/:petId"
      );

      const getPetTagById = apiItems.find(
        (item) => item.type === "api" && item.id === "get-pet-tag-by-id"
      ) as any;
      expect(getPetTagById.api.postman).toBeDefined();
      expect(getPetTagById.api.postman.url.getPath({ unresolved: true })).toBe(
        "/pet/:petId/:tagId"
      );

      const getPetsSummary = apiItems.find(
        (item) => item.type === "api" && item.id === "get-pets-summary"
      ) as any;
      expect(getPetsSummary.api.postman).toBeDefined();
      expect(getPetsSummary.api.postman.url.getPath({ unresolved: true })).toBe(
        "/pet/:petIds/summary"
      );
    });
  });

  describe("vendor extensions at path level", () => {
    it("does not throw and skips x-* keys and unknown keys on path objects", async () => {
      const openapiData = {
        openapi: "3.0.0",
        info: { title: "Vendor Ext API", version: "1.0.0" },
        paths: {
          "/items": {
            "x-custom-string": "test",
            "x-custom-bool": true,
            unknownKey: { someField: true },
            get: {
              summary: "List items",
              operationId: "listItems",
              responses: { "200": { description: "OK" } },
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
      expect(apiItems).toHaveLength(1);
      expect((apiItems[0] as any).api.method).toBe("get");
    });
  });
});
