<h1 align="center">Docusaurus OpenAPI Doc Generator</h1>

<div align="center">
<img width="200" src="https://user-images.githubusercontent.com/9343811/165975569-1bc29814-884c-4931-83df-860043b625b7.svg" />
</div>

<div align="center">

OpenAPI plugin for generating API reference docs in Docusaurus v2.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/HEAD/LICENSE)
[![npm latest package](https://img.shields.io/npm/v/@paloaltonetworks/docusaurus-plugin-openapi/latest.svg)](https://www.npmjs.com/package/@paloaltonetworks/docusaurus-plugin-openapi)
[![npm downloads](https://img.shields.io/npm/dm/@paloaltonetworks/docusaurus-plugin-openapi.svg)](https://www.npmjs.com/package/@paloaltonetworks/docusaurus-preset-openapi)
[![build](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/actions/workflows/validate.yaml/badge.svg)](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/actions/workflows/validate.yaml)
<br/>
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Cypress.io](https://img.shields.io/badge/tested%20with-Cypress-04C38E.svg)](https://www.cypress.io/)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/blob/HEAD/CONTRIBUTING.md#pull-requests)

</div>

<p align="center">

<img width="650" alt="delete-a-pet" src="https://user-images.githubusercontent.com/9343811/165620346-d666db22-3587-4ddf-af58-947fddc9fe99.png">

</p>

## User Quick Start

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

> Start by forking the main repository

```bash
git clone https://github.com/<your account>/docusaurus-openapi-docs.git
cd docusaurus-openapi-docs
yarn
yarn build-packages
yarn watch:demo
```

## CLI Usage built-in with `docusaurus-plugin-openapi-docs`

The `docusaurus-plugin-openapi-docs` plugin is a CLI, that allows you to generate or clean API `MDX` docs from OAS files.

### Generating OpenAPI Docs

To generate all OpenAPI Docs, simply run the following command from the root directory of your project:

```bash
yarn docusaurus gen-api-docs all
```

> This will generate API docs for all of the specs configured in your `docusaurus.config.js` file.

You may also generate a particular set of OpenAPI docs by specifying the unique `id` of your desired spec instance.

```bash
yarn docusaurus gen-api-docs <id>
```

Example:

```bash
yarn docusaurus gen-api-docs burgers
```

> This will only generate API docs relative to `burgers`, configured in the example `docusaurus.config.js` above.

### Cleaning API Docs

To remove all API Docs, simply run the following command from the root directory of your project:

```bash
yarn docusaurus clean-api-docs all
```

You may also remove a particular set of API docs by specifying the unique `id` of your desired spec instance.

```bash
yarn docusaurus gen-api-docs <id>
```

Example:

```bash
yarn docusaurus gen-api-docs burgers
```

> This will remove all API docs relative to `burgers`, configured in the example `docusaurus.config.js` above.

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
              groupPathsBy: "tags",
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

  themes: ["@paloaltonetworks/docusaurus-theme-openapi-docs"]
}
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
