<h1 align="center">Docusaurus OpenAPI Doc Generator</h1>

<div align="center">
<img width="200" src="https://user-images.githubusercontent.com/9343811/165975569-1bc29814-884c-4931-83df-860043b625b7.svg" />
</div>

<div align="center">

OpenAPI plugin for generating API reference docs in Docusaurus v2.

<img src="https://img.shields.io/badge/dynamic/json?style=for-the-badge&logo=meta&color=blueviolet&label=Docusaurus&query=dependencies%5B%22%40docusaurus%2Fcore%22%5D&url=https%3A%2F%2Fraw.githubusercontent.com%2FPaloAltoNetworks%2Fdocusaurus-openapi-docs%2Fmain%2Fdemo%2Fpackage.json" />
<br/><br/>

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/HEAD/LICENSE) [![npm latest package](https://img.shields.io/npm/v/docusaurus-plugin-openapi-docs/latest.svg)](https://www.npmjs.com/package/docusaurus-plugin-openapi-docs) [![npm downloads](https://img.shields.io/npm/dm/docusaurus-plugin-openapi-docs.svg)](https://www.npmjs.com/package/docusaurus-plugin-openapi-docs) [![npm canary package](https://img.shields.io/npm/v/docusaurus-plugin-openapi-docs/canary.svg)](https://www.npmjs.com/package/docusaurus-plugin-openapi-docs)
<br/>
[![build](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/actions/workflows/validate.yaml/badge.svg)](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/actions/workflows/validate.yaml) [![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![Cypress.io](https://img.shields.io/badge/tested%20with-Cypress-04C38E.svg)](https://www.cypress.io/) [![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/HEAD/CONTRIBUTING.md#pull-requests)
<br />

</div>

<p align="center">

<img src="https://user-images.githubusercontent.com/9343811/171651288-0d4b5a64-4818-4862-b41d-29a5e30b3ab1.gif" width="750" />

</p>

## Overview

The `docusaurus-plugin-openapi-docs` package extends the Docusaurus CLI with commands for generating MDX using the OpenAPI specification as the source. The resulting MDX is fully compatible with [plugin-content-docs](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs) and can be used to render beautiful reference API docs by setting `docItemComponent` to `@theme/ApiItem`, a custom component included in the `docusaurus-theme-openapi-docs` theme.

## Installation

Plugin:

```bash
yarn add docusaurus-plugin-openapi-docs
```

Theme:

```bash
yarn add docusaurus-theme-openapi-docs
```

## Configuring `docusaurus.config.js` (Plugin and theme usage)

Here is an example of properly configuring your `docusaurus.config.js` file for `docusaurus-plugin-openapi-docs` and `docusaurus-theme-openapi-docs` usage.

```js
// docusaurus.config.js

{
  presets: [
  [
    "classic",
    /** @type {import('@docusaurus/preset-classic').Options} */
    ({
      docs: {
        sidebarPath: require.resolve("./sidebars.js"),
        // Please change this to your repo.
        // Remove this to remove the "edit this page" links.
        editUrl:
          "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        docLayoutComponent: "@theme/DocPage",
        docItemComponent: "@theme/ApiItem" // Derived from docusaurus-theme-openapi-docs
      },
      blog: {
        showReadingTime: true,
        // Please change this to your repo.
        // Remove this to remove the "edit this page" links.
        editUrl:
          "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/"
      },
      theme: {
        customCss: require.resolve("./src/css/custom.css")
      }
    })
  ]
],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: "apiDocs",
        config: {
          petstore: { // Note: petstore key is treated as the <id> and can be used to specify an API doc instance when using CLI commands
            specPath: "examples/petstore.yaml", // Path to designated spec file
            outputDir: "api/petstore", // Output directory for generated .mdx docs
            sidebarOptions: {
              groupPathsBy: "tag",
            },
          },
          burgers: {
            specPath: "examples/food/burgers/openapi.yaml",
            outputDir: "api/food/burgers",
          }
        }
      },
    ]
  ],
  themes: ["docusaurus-theme-openapi-docs"] // Allows use of @theme/ApiItem and other components
}
```

> Note: You may optionally configure a dedicated `@docusaurus/plugin-content-docs` instance for use with `docusaurus-theme-openapi-docs` by setting `docItemComponent` to `@theme/ApiItem`.

### Plugin Configuration Options

`docusaurus-plugin-openapi-docs` can be configured with the following options:

| Name             | Type     | Default | Description                                                                                                                 |
| ---------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `specPath`       | `string` | `null`  | Designated URL or path to the source of an OpenAPI specification file or directory of multiple OpenAPI specification files. |
| `ouputDir`       | `string` | `null`  | Desired output path for generated MDX files.                                                                                |
| `template`       | `string` | `null`  | _Optional:_ Customize MDX content with a desired template.                                                                  |
| `sidebarOptions` | `object` | `null`  | _Optional:_ Set of options for sidebar configuration. See below for a list of supported options.                            |

`sidebarOptions` can be configured with the following options:

| Name                 | Type      | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `groupPathsBy`       | `string`  | `null`  | Organize and group sidebar slice by specified option. Note: Currently, `groupPathsBy` only contains support for grouping by `tag`.                                                                                                                                                                                                                                                                                                                   |
| `categoryLinkSource` | `string`  | `null`  | Defines what source to use for rendering category link pages when grouping paths by tag. <br/></br>The supported options are as follows: <br/></br> `tag`: Sets the category link config type to `generated-index` and uses the tag description as the link config description. <br/><br/>`info`: Sets the category link config type to `doc` and renders the `info` section as the category link (recommended only for multi/micro-spec scenarios). |
| `sidebarCollapsible` | `boolean` | `true`  | Whether sidebar categories are collapsible by default.                                                                                                                                                                                                                                                                                                                                                                                               |
| `sidebarCollapsed`   | `boolean` | `true`  | Whether sidebar categories are collapsed by default.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `customProps`        | `object`  | `null`  | Additional props for customizing a sidebar item.                                                                                                                                                                                                                                                                                                                                                                                                     |

> Note: You may optionally configure a `sidebarOptions`. In doing so, an individual `sidebar.js` slice with the configured options will be generated within the respective `outputDir`.

## CLI Usage

```bash
Usage: docusaurus <command> [options]

Options:
  -V, --version                                            output the version number
  -h, --help                                               display help for command

Commands:
  build [options] [siteDir]                                Build website.
  swizzle [options] [themeName] [componentName] [siteDir]  Wraps or ejects the original theme files into website folder for customization.
  deploy [options] [siteDir]                               Deploy website to GitHub pages.
  start [options] [siteDir]                                Start the development server.
  serve [options] [siteDir]                                Serve website locally.
  clear [siteDir]                                          Remove build artifacts.
  write-translations [options] [siteDir]                   Extract required translations of your site.
  write-heading-ids [options] [siteDir] [files...]         Generate heading ids in Markdown content.
  docs:version <version>                                   Tag a new docs version
  gen-api-docs <id>                                        Generates API Docs mdx and sidebars.
  clean-api-docs <id>                                      Clears the Generated API Docs mdx and sidebars.
  docs:version:openapi <version>                           Tag a new docs version (openapi)
```

### Generating OpenAPI Docs

To generate all OpenAPI docs, run the following command from the root directory of your project:

```bash
yarn docusaurus gen-api-docs all
```

> This will generate API docs for all of the OpenAPI specification (OAS) files referenced in your `docusaurus-plugin-openapi-docs` config.

You may also generate OpenAPI docs for a single path or OAS by specifying the unique `id`:

```bash
yarn docusaurus gen-api-docs <id>
```

Example:

```bash
yarn docusaurus gen-api-docs burgers
```

> The example above will only generate API docs relative to `burgers`.

### Cleaning API Docs

To clean/remove all API Docs, run the following command from the root directory of your project:

```bash
yarn docusaurus clean-api-docs all
```

You may also remove a particular set of API docs by specifying the unique `id` of your desired spec instance.

```bash
yarn docusaurus clean-api-docs <id>
```

Example:

```bash
yarn docusaurus clean-api-docs burgers
```

> The example above will remove all API docs relative to `burgers`.

## Installing from Template

Run the following to bootstrap a Docsaurus v2 site (classic theme) with `docusaurus-openapi-docs`:

```bash
npx create-docusaurus@2.0.0-beta.18 my-website "Git repository" --package-manager yarn
```

Template Repository URL:

```bash
https://github.com/PaloAltoNetworks/docusaurus-template-openapi-docs.git
```

> When asked how the template repo should be cloned choose "copy" (unless you know better).

```bash
cd my-website
yarn start
```

## Developer Quick Start

> Looking to make a contribution? Make sure to checkout out our contributing guide.

After [forking](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/fork) the main repository, run the following:

```bash
git clone https://github.com/<your account>/docusaurus-openapi-docs.git
cd docusaurus-openapi-docs
yarn
yarn build-packages
yarn watch:demo
```

## Credits

Special thanks to @bourdakos1 (Nick Bourdakos), the author of [docusaurus-openapi](https://github.com/cloud-annotations/cloud-annotations), which this project is heavily based on.

For more insight into why we decided to completely fork see [#47](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/47)

## Contributors

<a href="https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=PaloAltoNetworks/docusaurus-openapi-docs" />
</a>

## Support

Please read [SUPPORT.md](SUPPORT.md) for details on how to get support for this project.
