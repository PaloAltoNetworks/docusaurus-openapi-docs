// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Docusaurus OpenAPI",
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
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/demo",
          docLayoutComponent: "@theme/DocPage",
          docItemComponent: "@theme/ApiItem", // Derived from docusaurus-theme-openapi
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
        copyright: `Copyright © ${new Date().getFullYear()} Palo Alto Networks, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

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
            versions: {
              "1.0.0": {
                specPath: "examples/petstore-1.0.0.yaml",
                outputDir: "docs/petstore_versioned/1.0.0", // No trailing slash
                label: "v1.0.0",
                baseUrl: "/petstore_versioned/1.0.0/swagger-petstore-yaml", // Leading slash is important
              },
            },
          },
          petstore: {
            specPath: "examples/petstore.yaml",
            outputDir: "docs/petstore",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
          },
          panos: {
            specPath: "examples/panos-rest-api.yaml",
            outputDir: "docs/panos",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
          },
          cos: {
            specPath: "examples/openapi-cos.json",
            outputDir: "docs/cos",
            sidebarOptions: {
              groupPathsBy: "tag",
            },
          },
          burgers: {
            specPath: "examples/food/burgers/openapi.yaml",
            outputDir: "docs/food/burgers",
          },
          yogurt: {
            specPath: "examples/food/yogurtstore/openapi.yaml",
            outputDir: "docs/food/yogurtstore",
          },
        },
      },
    ],
    [
      "@docusaurus/plugin-pwa",
      {
        debug: true,
        offlineModeActivationStrategies: [
          "appInstalled",
          "standalone",
          "queryString",
        ],
        pwaHead: [
          {
            tagName: "link",
            rel: "icon",
            href: "/img/docusaurus-openapi-docs-logo.svg",
          },
          {
            tagName: "link",
            rel: "manifest",
            href: "/manifest.json", // your PWA manifest
          },
          {
            tagName: "meta",
            name: "theme-color",
            content: "rgb(37, 194, 160)",
          },
        ],
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

  // ES Build Loader
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve("esbuild-loader"),
      options: {
        loader: "tsx",
        format: isServer ? "cjs" : undefined,
        target: isServer ? "node12" : "es2017",
      },
    }),
  },
};

module.exports = config;
