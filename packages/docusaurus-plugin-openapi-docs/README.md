<h1 align="center">Docusaurus OpenAPI Doc Generator</h1>

<div align="center">
<img width="200" src="https://user-images.githubusercontent.com/9343811/165975569-1bc29814-884c-4931-83df-860043b625b7.svg" />
</div>

<div align="center">

OpenAPI plugin for generating API reference docs in Docusaurus v2.

</div>

<p align="center">

<img width="650" alt="delete-a-pet" src="https://user-images.githubusercontent.com/9343811/165620346-d666db22-3587-4ddf-af58-947fddc9fe99.png">

</p>

## Overview

The `docusaurus-plugin-openapi-docs` package extends the Docusaurus CLI with commands for generating MDX using the OpenAPI specification as the source. The resulting MDX is fully compatible with [plugin-content-docs](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs) and can be used to render beautiful reference API docs by setting `docItemComponent` to `@theme/ApiItem`, a custom component included in the `docusaurus-theme-openapi-docs` theme.

Key Features:

- **Compatible:** Works with Swagger 2.0 and OpenAPI 3.x.
- **Fast:** Convert large OpenAPI specs into MDX docs in seconds. 🔥
- **Stylish:** Based on the same [Infima styling framework](https://infima.dev/) that powers the Docusaurus UI.
- **Capable:** Supports single, multi and _even micro_ OpenAPI specs.

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
      'docusaurus-plugin-openapi-docs',
      {
        id: "apiDocs",
        docsPluginId: "classic",
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

## Plugin Configuration Options

The `docusaurus-plugin-openapi-docs` plugin can be configured with the following options:

| Name           | Type     | Default | Description                                                                                                                                          |
| -------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `string` | `null`  | A unique document id.                                                                                                                                |
| `docsPluginId` | `string` | `null`  | The ID associated with the `plugin-content-docs` or `preset` instance used to render the OpenAPI docs (e.g. "your-plugin-id", "classic", "default"). |

### config

`config` can be configured with the following options:

| Name             | Type     | Default | Description                                                                                                                 |
| ---------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `specPath`       | `string` | `null`  | Designated URL or path to the source of an OpenAPI specification file or directory of multiple OpenAPI specification files. |
| `ouputDir`       | `string` | `null`  | Desired output path for generated MDX files.                                                                                |
| `template`       | `string` | `null`  | _Optional:_ Customize MDX content with a desired template.                                                                  |
| `downloadUrl`    | `string` | `null`  | _Optional:_ Designated URL for downloading OpenAPI specification. (requires `info` section/doc)                             |
| `sidebarOptions` | `object` | `null`  | _Optional:_ Set of options for sidebar configuration. See below for a list of supported options.                            |
| `version`        | `string` | `null`  | _Optional:_ Version assigned to single or micro-spec API specified in `specPath`.                                           |
| `label`          | `string` | `null`  | _Optional:_ Version label used when generating version selector dropdown menu.                                              |
| `baseUrl`        | `string` | `null`  | _Optional:_ Version base URL used when generating version selector dropdown menu.                                           |
| `versions`       | `object` | `null`  | _Optional:_ Set of options for versioning configuration. See below for a list of supported options.                         |

`sidebarOptions` can be configured with the following options:

| Name                 | Type      | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `groupPathsBy`       | `string`  | `null`  | Organize and group sidebar slice by specified option. Note: Currently, `groupPathsBy` only contains support for grouping by `tag`.                                                                                                                                                                                                                                                                                                                   |
| `categoryLinkSource` | `string`  | `null`  | Defines what source to use for rendering category link pages when grouping paths by tag. <br/><br/>The supported options are as follows: <br/><br/> `tag`: Sets the category link config type to `generated-index` and uses the tag description as the link config description. <br/><br/>`info`: Sets the category link config type to `doc` and renders the `info` section as the category link (recommended only for multi/micro-spec scenarios). |
| `sidebarCollapsible` | `boolean` | `true`  | Whether sidebar categories are collapsible by default.                                                                                                                                                                                                                                                                                                                                                                                               |
| `sidebarCollapsed`   | `boolean` | `true`  | Whether sidebar categories are collapsed by default.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `customProps`        | `object`  | `null`  | Additional props for customizing a sidebar item.                                                                                                                                                                                                                                                                                                                                                                                                     |

> You may optionally configure a `sidebarOptions`. In doing so, an individual `sidebar.js` slice with the configured options will be generated within the respective `outputDir`.

`versions` can be configured with the following options:

| Name       | Type     | Default | Description                                                                                                              |
| ---------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `specPath` | `string` | `null`  | Designated URL or path to the source of an OpenAPI specification file or directory of micro OpenAPI specification files. |
| `ouputDir` | `string` | `null`  | Desired output path for versioned, generated MDX files.                                                                  |
| `label`    | `string` | `null`  | _Optional:_ Version label used when generating version selector dropdown menu.                                           |
| `baseUrl`  | `string` | `null`  | _Optional:_ Version base URL used when generating version selector dropdown menu.                                        |

> All versions will automatically inherit `sidebarOptions` from the parent/base config.

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
  gen-api-docs <id>                                        Generates OpenAPI docs in MDX file format and sidebar.js (if enabled).
  gen-api-docs:version <id:version>                        Generates versioned OpenAPI docs in MDX file format, versions.js and sidebar.js (if enabled).
  clean-api-docs <id>                                      Clears the generated OpenAPI docs MDX files and sidebar.js (if enabled).
  clean-api-docs:version <id:version>                      Clears the versioned, generated OpenAPI docs MDX files, versions.json and sidebar.js (if
                                                           enabled).
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

### Versioning OpenAPI docs

To generate _all_ versioned OpenAPI docs, run the following command from the root directory of your project:

```bash
yarn docusaurus gen-api-docs:version <id>:all
```

Example:

```bash
yarn docusaurus gen-api-docs:version petstore:all
```

> This will generate API docs for all of the OpenAPI specification (OAS) files referenced in your `versions` config and will also generate a `versions.json` file.

> Substitue `all` with a specific version ID to generate/clean a specific version. Generating for `all` or a specific version ID will automatically update the `versions.json` file.

## Installing from Template

Run the following to bootstrap a Docsaurus v2 site (classic theme) with `docusaurus-openapi-docs`:

```bash
npx create-docusaurus@2.0.1 my-website --package-manager yarn
```

> When prompted to select a template choose `Git repository`.

Template Repository URL:

```bash
https://github.com/PaloAltoNetworks/docusaurus-template-openapi-docs.git
```

> When asked how the template repo should be cloned choose "copy" (unless you know better).

```bash
cd my-website
yarn
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

## Support

Please read [SUPPORT.md](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/main/SUPPORT.md) for details on how to get support for this project.
