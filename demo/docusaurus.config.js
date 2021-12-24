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
          path: "examples/openapi.json",
        },
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/cloud-annotations/docusaurus-openapi/edit/main/demo/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/cloud-annotations/docusaurus-openapi/edit/main/demo/",
        },
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
        id: "issue",
        path: "examples/openapi-issue-21.json",
        routeBasePath: "issue-21",
      },
    ],
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
        id: "yaml",
        path: "examples/openapi.yaml",
        routeBasePath: "yaml",
      },
    ],
    [
      "docusaurus-plugin-openapi",
      {
        id: "petstore",
        path: "examples/petstore.yaml",
        routeBasePath: "petstore",
      },
    ],
    [
      "docusaurus-plugin-openapi",
      {
        id: "mega",
        path: "examples",
        routeBasePath: "mega",
      },
    ],
  ],

  themeConfig:
    /** @type {import('docusaurus-preset-openapi').ThemeConfig} */
    ({
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
            label: "Tutorial",
          },
          { to: "/api", label: "API", position: "left" },
          { to: "/issue-21", label: "Issue 21", position: "left" },
          { to: "/cos", label: "COS", position: "left" },
          { to: "/yaml", label: "YAML", position: "left" },
          { to: "/petstore", label: "Petstore", position: "left" },
          { to: "/mega", label: "Mega", position: "left" },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/cloud-annotations/docusaurus-openapi",
            label: "GitHub",
            position: "right",
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
                label: "Tutorial",
                to: "/docs/intro",
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
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/cloud-annotations/docusaurus-openapi",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cloud Annotations, Inc. Built with Docusaurus.`,
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
