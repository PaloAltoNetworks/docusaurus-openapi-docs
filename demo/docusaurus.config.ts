import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import type * as Plugin from "@docusaurus/types/src/plugin";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";

import { DOCUSAURUS_VERSION } from "@docusaurus/utils";
import { myCustomApiMdGenerator } from "./customMdGenerators";

const config: Config = {
  title: "Docusaurus OpenAPI Docs",
  tagline: "OpenAPI plugin for generating API reference docs in Docusaurus v2",
  url: "https://docusaurus-openapi.tryingpan.dev",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "PaloAltoNetworks",
  projectName: "docusaurus-openapi-docs",

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/tree/main/demo",
          docItemComponent: "@theme/ApiItem", // Derived from docusaurus-theme-openapi
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        gtag: {
          trackingID: "GTM-THVM29S",
          anonymizeIP: false,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "OpenAPI Docs",
      logo: {
        alt: "Keytar",
        src: "img/docusaurus-openapi-docs-logo.svg",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          position: "left",
          label: "Docs",
        },
        {
          type: "dropdown",
          label: "Demos",
          position: "left",
          items: [
            {
              label: "API Zoo",
              to: "/category/petstore-api",
            },
            {
              label: "Petstore (versioned)",
              to: "/category/petstore-versioned-api",
            },
            {
              label: "Tests",
              to: "/category/tests",
            },
          ],
        },
        {
          href: "https://medium.com/palo-alto-networks-developer-blog",
          position: "right",
          className: "header-medium-link",
          "aria-label": "Palo Alto Networks Developer Blog",
        },
        {
          href: "https://github.com/PaloAltoNetworks/docusaurus-openapi-docs",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repository",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "OpenAPI Docs",
              to: "/",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/docusaurus",
            },
            {
              label: "Discord",
              href: "https://discordapp.com/invite/docusaurus",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/docusaurus",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              href: "https://medium.com/palo-alto-networks-developer-blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/PaloAltoNetworks/docusaurus-openapi-docs",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Palo Alto Networks, Inc. Built with Docusaurus ${DOCUSAURUS_VERSION}.`,
    },
    prism: {
      additionalLanguages: [
        "ruby",
        "csharp",
        "php",
        "java",
        "powershell",
        "json",
        "bash",
        "dart",
        "objectivec",
        "r",
      ],
    },
    languageTabs: [
      {
        highlight: "python",
        language: "python",
        logoClass: "python",
      },
      {
        highlight: "bash",
        language: "curl",
        logoClass: "curl",
      },
      {
        highlight: "csharp",
        language: "csharp",
        logoClass: "csharp",
      },
      {
        highlight: "go",
        language: "go",
        logoClass: "go",
      },
      {
        highlight: "javascript",
        language: "nodejs",
        logoClass: "nodejs",
      },
      {
        highlight: "ruby",
        language: "ruby",
        logoClass: "ruby",
      },
      {
        highlight: "php",
        language: "php",
        logoClass: "php",
      },
      {
        highlight: "java",
        language: "java",
        logoClass: "java",
        variant: "unirest",
      },
      {
        highlight: "powershell",
        language: "powershell",
        logoClass: "powershell",
      },
      {
        highlight: "dart",
        language: "dart",
        logoClass: "dart",
      },
      {
        highlight: "javascript",
        language: "javascript",
        logoClass: "javascript",
      },
      {
        highlight: "c",
        language: "c",
        logoClass: "c",
      },
      {
        highlight: "objective-c",
        language: "objective-c",
        logoClass: "objective-c",
      },
      {
        highlight: "ocaml",
        language: "ocaml",
        logoClass: "ocaml",
      },
      {
        highlight: "r",
        language: "r",
        logoClass: "r",
      },
      {
        highlight: "swift",
        language: "swift",
        logoClass: "swift",
      },
      {
        highlight: "kotlin",
        language: "kotlin",
        logoClass: "kotlin",
      },
      {
        highlight: "rust",
        language: "rust",
        logoClass: "rust",
      },
    ],
    algolia: {
      apiKey: "441074cace987cbf4640c039ebed303c",
      appId: "J0EABTYI1A",
      indexName: "docusaurus-openapi",
    },
    announcementBar: {
      id: "announcementBar_1",
      content: "First stable release for Docusaurus v3 now available!",
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "openapi",
        docsPluginId: "classic",
        config: {
          petstore_versioned: {
            specPath: "examples/petstore.yaml",
            outputDir: "docs/petstore_versioned", // No trailing slash
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            version: "2.0.0", // Current version
            label: "v2.0.0", // Current version label
            baseUrl: "/petstore_versioned/swagger-petstore-yaml", // Leading slash is important
            downloadUrl:
              "https://raw.githubusercontent.com/PaloAltoNetworks/docusaurus-openapi-docs/main/demo/examples/petstore.yaml",
            versions: {
              "1.0.0": {
                specPath: "examples/petstore-1.0.0.yaml",
                outputDir: "docs/petstore_versioned/1.0.0", // No trailing slash
                label: "v1.0.0",
                baseUrl: "/petstore_versioned/1.0.0/swagger-petstore-yaml", // Leading slash is important
                downloadUrl:
                  "https://redocly.com/_spec/docs/openapi/petstore.json",
              },
            },
          } satisfies OpenApiPlugin.Options,
          petstore: {
            specPath: "examples/petstore.yaml",
            proxy: "https://cors.pan.dev",
            outputDir: "docs/petstore",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            template: "api.mustache", // Customize API MDX with mustache template
            downloadUrl: "/petstore.yaml",
            hideSendButton: false,
            showSchemas: true,
          } satisfies OpenApiPlugin.Options,
          petstore31: {
            specPath: "examples/petstore-3.1.yaml",
            proxy: "https://cors.pan.dev",
            outputDir: "docs/petstore31",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            downloadUrl: "/petstore-3.1.yaml",
            hideSendButton: false,
            showSchemas: true,
            markdownGenerators: { createApiPageMD: myCustomApiMdGenerator }, // customize MDX with markdown generator
          } satisfies OpenApiPlugin.Options,
          cos: {
            specPath: "examples/openapi-cos.json",
            outputDir: "docs/cos",
            sidebarOptions: {
              groupPathsBy: "tag",
            },
          } satisfies OpenApiPlugin.Options,
          burgers: {
            specPath: "examples/food/burgers/openapi.yaml",
            outputDir: "docs/food/burgers",
          } satisfies OpenApiPlugin.Options,
          yogurt: {
            specPath: "examples/food/yogurtstore/openapi.yaml",
            outputDir: "docs/food/yogurtstore",
          } satisfies OpenApiPlugin.Options,
          restaurant: {
            specPath: "examples/food/restaurant/openapi.yaml",
            outputDir: "docs/restaurant",
            sidebarOptions: {
              groupPathsBy: "tagGroup",
            },
            showSchemas: true,
          } satisfies OpenApiPlugin.Options,
          tests: {
            specPath: "examples/tests",
            outputDir: "docs/tests",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "info",
            },
            hideSendButton: true,
            showSchemas: true,
          } satisfies OpenApiPlugin.Options,
        } satisfies Plugin.PluginOptions,
      },
    ],
  ],
  themes: ["docusaurus-theme-openapi-docs"],
  stylesheets: [
    {
      href: "https://use.fontawesome.com/releases/v5.11.0/css/all.css",
      type: "text/css",
    },
  ],
};

export default async function createConfig() {
  return config;
}
