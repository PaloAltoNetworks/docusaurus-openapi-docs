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

  describe("specInfoPagePath", () => {
    it("uses default kebab-cased info.title when specInfoPagePath is not provided", async () => {
      const openapiData = {
        openapi: "3.0.0",
        info: {
          title: "Company Foo",
          version: "1.0.0",
          description: "Test API",
        },
        paths: {},
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

      const infoItem = items.find((item) => item.type === "info");
      expect(infoItem).toBeDefined();
      expect(infoItem?.id).toBe("company-foo");
    });

    it("uses custom specInfoPagePath when provided", async () => {
      const openapiData = {
        openapi: "3.0.0",
        info: {
          title: "Company Foo",
          version: "1.0.0",
          description: "Test API",
        },
        paths: {},
      };

      const options: APIOptions = {
        specPath: "dummy",
        outputDir: "build",
        specInfoPagePath: "custom-api-intro",
      };

      const sidebarOptions = {} as SidebarOptions;

      const [items] = await processOpenapiFile(
        openapiData as any,
        options,
        sidebarOptions
      );

      const infoItem = items.find((item) => item.type === "info");
      expect(infoItem).toBeDefined();
      expect(infoItem?.id).toBe("custom-api-intro");
    });

    it("kebab-cases custom specInfoPagePath", async () => {
      const openapiData = {
        openapi: "3.0.0",
        info: {
          title: "Company Foo",
          version: "1.0.0",
          description: "Test API",
        },
        paths: {},
      };

      const options: APIOptions = {
        specPath: "dummy",
        outputDir: "build",
        specInfoPagePath: "Custom API Introduction",
      };

      const sidebarOptions = {} as SidebarOptions;

      const [items] = await processOpenapiFile(
        openapiData as any,
        options,
        sidebarOptions
      );

      const infoItem = items.find((item) => item.type === "info");
      expect(infoItem).toBeDefined();
      expect(infoItem?.id).toBe("custom-api-introduction");
    });
  });
});
