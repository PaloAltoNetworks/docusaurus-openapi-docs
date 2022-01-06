// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Docusaurus OpenAPI",
  tagline: "OpenAPI plugin for generating API reference docs in Docusaurus v2.",
  url: "https://docusaurus-openapi.netlify.app",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "cloud-annotations", // Usually your GitHub org/user name.
  projectName: "docusaurus-openapi", // Usually your repo name.

  presets: [
    [
      "docusaurus-preset-openapi",
      /** @type {import('docusaurus-preset-openapi').Options} */
      ({
        api: {
          path: "examples/petstore.yaml",
          routeBasePath: "petstore",
        },
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/cloud-annotations/docusaurus-openapi/edit/main/demo/",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        proxy: {
          "/proxy": {
            target: "http://localhost:8091",
            pathRewrite: { "^/proxy": "" },
          },
        },
      }),
    ],
  ],

  plugins: [
    [
      "docusaurus-plugin-openapi",
      {
        id: "cos",
        path: "examples/openapi-cos.json",
        routeBasePath: "cos",
      },
    ],
    [
      "docusaurus-plugin-openapi",
      {
        id: "multi-spec",
        path: "examples",
        routeBasePath: "multi-spec",
      },
    ],
  ],

  themeConfig:
    /** @type {import('docusaurus-preset-openapi').ThemeConfig} */
    ({
      colorMode: {
        disableSwitch: true,
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
              { to: "/petstore", label: "Petstore" },
              { to: "/cos", label: "Cloud Object Storage" },
              { to: "/multi-spec", label: "Multi-spec" },
            ],
          },
          {
            href: "https://github.com/cloud-annotations/docusaurus-openapi",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      footer: {
        style: "dark",
        logo: {
          alt: "Deploys by Netlify",
          src: "https://www.netlify.com/img/global/badges/netlify-color-accent.svg",
          width: 160,
          height: 51,
          href: "https://www.netlify.com",
        },
        copyright: `Copyright © ${new Date().getFullYear()} Cloud Annotations. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      api: {
        authPersistance: "localStorage",
      },
    }),
};

module.exports = config;
