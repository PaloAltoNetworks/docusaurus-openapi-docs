/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { getPluginConfig, getPluginInstances } from "./index";

describe("index", () => {
  describe("getPluginInstances", () => {
    it("should filter plugins to only include docusaurus-plugin-openapi-docs instances", () => {
      const plugins = [
        ["@docusaurus/plugin-content-docs", { id: "docs" }],
        ["docusaurus-plugin-openapi-docs", { id: "api", config: {} }],
        ["@docusaurus/plugin-content-pages", { id: "pages" }],
        ["docusaurus-plugin-openapi-docs", { id: "api-v2", config: {} }],
      ];

      const result = getPluginInstances(plugins);

      expect(result).toEqual([
        ["docusaurus-plugin-openapi-docs", { id: "api", config: {} }],
        ["docusaurus-plugin-openapi-docs", { id: "api-v2", config: {} }],
      ]);
    });

    it("should return empty array when no openapi-docs plugin instances exist", () => {
      const plugins = [
        ["@docusaurus/plugin-content-docs", { id: "docs" }],
        ["@docusaurus/plugin-content-pages", { id: "pages" }],
      ];

      const result = getPluginInstances(plugins);

      expect(result).toEqual([]);
    });

    it("should return empty array when plugins array is empty", () => {
      const plugins = [];

      const result = getPluginInstances(plugins);

      expect(result).toEqual([]);
    });

    it("should handle single openapi-docs plugin instance", () => {
      const plugins = [
        ["@docusaurus/plugin-content-docs", { id: "docs" }],
        ["docusaurus-plugin-openapi-docs", { id: "api", config: {} }],
      ];

      const result = getPluginInstances(plugins);

      expect(result).toEqual([
        ["docusaurus-plugin-openapi-docs", { id: "api", config: {} }],
      ]);
    });
  });

  describe("getPluginConfig", () => {
    it("should return config for matching plugin ID", () => {
      const pluginInstances = [
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api", config: { foo: "bar" } },
        ],
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api-v2", config: { baz: "qux" } },
        ],
      ];

      const result = getPluginConfig(pluginInstances, "api");

      expect(result).toEqual({ id: "api", config: { foo: "bar" } });
    });

    it("should return correct config when multiple instances exist", () => {
      const pluginInstances = [
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api", config: { version: "1.0" } },
        ],
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api-v2", config: { version: "2.0" } },
        ],
        [
          "docusaurus-plugin-openapi-docs",
          { id: "internal", config: { version: "internal" } },
        ],
      ];

      const result = getPluginConfig(pluginInstances, "api-v2");

      expect(result).toEqual({ id: "api-v2", config: { version: "2.0" } });
    });

    it("should return config with docsPluginId when present", () => {
      const pluginInstances = [
        [
          "docusaurus-plugin-openapi-docs",
          {
            id: "api",
            config: { foo: "bar" },
            docsPluginId: "custom-docs",
          },
        ],
      ];

      const result = getPluginConfig(pluginInstances, "api");

      expect(result).toEqual({
        id: "api",
        config: { foo: "bar" },
        docsPluginId: "custom-docs",
      });
    });

    it("should throw error when plugin ID not found", () => {
      const pluginInstances = [
        ["docusaurus-plugin-openapi-docs", { id: "api", config: {} }],
        ["docusaurus-plugin-openapi-docs", { id: "api-v2", config: {} }],
      ];

      expect(() => {
        getPluginConfig(pluginInstances, "non-existent");
      }).toThrow();
    });

    it("should throw error when called with empty plugin instances array", () => {
      const pluginInstances = [];

      expect(() => {
        getPluginConfig(pluginInstances, "api");
      }).toThrow();
    });
  });

  describe("getPluginConfig with getPluginInstances integration", () => {
    it("should work correctly when chained together (bug fix verification)", () => {
      // This test verifies the bug fix where getPluginConfig should be called
      // with pluginInstances (filtered array) not the raw plugins array
      const plugins = [
        ["@docusaurus/plugin-content-docs", { id: "docs" }],
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api", config: { test: "value" } },
        ],
        ["@docusaurus/plugin-content-pages", { id: "pages" }],
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api-v2", config: { test: "value2" } },
        ],
      ];

      // First get plugin instances (this is what the bug fix does)
      const pluginInstances = getPluginInstances(plugins);

      // Then get the specific plugin config
      const result = getPluginConfig(pluginInstances, "api");

      expect(result).toEqual({ id: "api", config: { test: "value" } });
    });

    it("should return incorrect result when getPluginConfig is called with raw plugins array with conflicting IDs", () => {
      // This test demonstrates the bug that was fixed
      // When there are plugins with the same ID but different plugin types,
      // calling getPluginConfig with raw plugins array could return wrong config
      const plugins = [
        [
          "@docusaurus/plugin-content-docs",
          { id: "api", routeBasePath: "/docs" },
        ],
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api", config: { test: "value" } },
        ],
      ];

      // This is the bug - calling getPluginConfig with raw plugins array
      // It will match the FIRST plugin with id "api", not the openapi-docs one
      const result = getPluginConfig(plugins, "api");

      // This returns the wrong config (from content-docs instead of openapi-docs)
      expect(result).toEqual({ id: "api", routeBasePath: "/docs" });
      expect(result).not.toEqual({ id: "api", config: { test: "value" } });

      // The correct way is to filter first
      const pluginInstances = getPluginInstances(plugins);
      const correctResult = getPluginConfig(pluginInstances, "api");
      expect(correctResult).toEqual({ id: "api", config: { test: "value" } });
    });

    it("should handle single plugin instance scenario", () => {
      const plugins = [
        ["@docusaurus/plugin-content-docs", { id: "docs" }],
        [
          "docusaurus-plugin-openapi-docs",
          { id: "default", config: { api: "config" } },
        ],
      ];

      const pluginInstances = getPluginInstances(plugins);
      const result = getPluginConfig(pluginInstances, "default");

      expect(result).toEqual({ id: "default", config: { api: "config" } });
      expect(pluginInstances.length).toBe(1);
    });

    it("should handle multiple plugin instances scenario", () => {
      const plugins = [
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api-public", config: { public: true } },
        ],
        [
          "docusaurus-plugin-openapi-docs",
          { id: "api-internal", config: { public: false } },
        ],
        ["@docusaurus/plugin-content-docs", { id: "docs" }],
      ];

      const pluginInstances = getPluginInstances(plugins);

      expect(pluginInstances.length).toBe(2);

      const publicConfig = getPluginConfig(pluginInstances, "api-public");
      const internalConfig = getPluginConfig(pluginInstances, "api-internal");

      expect(publicConfig).toEqual({
        id: "api-public",
        config: { public: true },
      });
      expect(internalConfig).toEqual({
        id: "api-internal",
        config: { public: false },
      });
    });
  });
});
