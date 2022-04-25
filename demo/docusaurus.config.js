// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Docusaurus OpenAPI",
  tagline: "OpenAPI plugin for generating API reference docs in Docusaurus v2.",
  url: "https://docusaurus-openapi.tryingpan.dev",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "PaloAltoNetworks", // Usually your GitHub org/user name.
  projectName: "docusaurus-openapi", // Usually your repo name.

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/edit/master/website/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/edit/master/website/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],

  plugins: [
    [
      "@paloaltonetworks/docusaurus-plugin-openapi",
      {
        id: "here",
        config: {
          petstore: {
            specPath: "examples/petstore.yaml",
            outputDir: "api/petstore",
            sidebarOptions: {
              groupPathsBy: "tags",
            },
          },
          cos: {
            specPath: "examples/openapi-cos.json",
            outputDir: "api/cos",
          },
          burgers: {
            specPath: "examples/food/burgers/openapi.yaml",
            outputDir: "api/food/burgers",
          },
          yogurt: {
            specPath: "examples/food/yogurtstore/openapi.yaml",
            outputDir: "api/food/yogurtstore",
          },
          "openapi-issue": {
            specPath: "examples/openapi-issue-21.json",
            outputDir: "api/openapi-issue",
          },
        },
      },
    ],
    // [require.resolve("./plugins/webpackOptimizer"), {}],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "openapi",
        path: "api",
        breadcrumbs: true,
        routeBasePath: "api",
        include: ["**/*.md", "**/*.mdx"],
        sidebarPath: "apiSidebars.js",
        docLayoutComponent: "@theme/DocPage", // This solves the providers issue and drop the need for ApiPage component
        docItemComponent: "@theme/ApiItem", // Will probably need to clean this up/refactor to get it fully updated
        remarkPlugins: [],
        rehypePlugins: [],
        beforeDefaultRemarkPlugins: [],
        beforeDefaultRehypePlugins: [],
        showLastUpdateAuthor: true, // We can now add stuff like this :)
        showLastUpdateTime: true,
      },
    ],
  ],
  themes: ["@paloaltonetworks/docusaurus-theme-openapi"],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        disableSwitch: false,
        defaultMode: "dark",
      },
      navbar: {
        title: "OpenAPI",
        logo: {
          alt: "Docusaurus Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Docs",
          },
          {
            label: "Examples",
            position: "left",
            items: [
              { to: "/api/category/petstore-api", label: "Petstore" },
              {
                to: "/api/category/cos-api",
                label: "Cloud Object Storage",
              },
              { to: "/api/category/food-apis", label: "Food" },
            ],
          },
          {
            href: "https://github.com/PaloAltoNetworks/docusaurus-openapi",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      footer: {
        style: "dark",
        logo: {
          alt: "Deploys by Firebase",
          src: "https://firebase.google.com/downloads/brand-guidelines/SVG/logo-built_knockout.svg",
          width: 160,
          height: 51,
          href: "https://firebase.google.com",
        },
        copyright: `Copyright © ${new Date().getFullYear()} Palo Alto Networks. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
