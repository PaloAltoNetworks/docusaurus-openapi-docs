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

## Configuring OpenAPI Definitions

Configuring multiple OpenAPI definitions only require a single `docusaurus-plugin-openapi-docs` and `plugin-content-docs` instance. Any additional needed specs can be added and configured by defining their options within the `config` object of `docusaurus-plugin-openapi-docs`. Refer to the example below:

```js
// docusaurus.config.js

{
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
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "openapi",
        path: "api",
        breadcrumbs: true,
        routeBasePath: "api",
        include: ["**/*.md", "**/*.mdx"],
        sidebarPath: "apiSidebars.js",
        docLayoutComponent: "@theme/DocPage",
        docItemComponent: "@theme/ApiItem",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],
  ],
}
```

## CLI Usage

### Generating OpenAPI Docs

After successfully configuring your `docusaurus.config.js` file, you are now ready to generate your OpenAPI docs with the provided CLI commands.

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

## Configuring API sidebars

Creating a sidebar enables you to create an ordered group of docs, render a sidebar for each doc of that group, and provide next/previous navigation.

Let's take a brief moment to revisit the `docusaurus.config.js` example above. You may have noticed that `petstore` had a slightly different configuration, specifically the added `sidebarOptions` option. When `sidebarOptions` is defined _(optional)_, a custom `sidebar.js` slice will also be generated within the API doc's path after running the `gen-api-docs` command.

Refer to the example below for configuring your API sidebars:

```js
// docusaurus.config.js

plugins: [
  [
    'docusaurus-plugin-openapi-docs',
    {
      id: "apiDocs",
      config: {
        petstore: {
          specPath: "examples/petstore.yaml",
          outputDir: "api/petstore",
          sidebarOptions: { // Passing in this option will generate a sidebar slice
            groupPathsBy: "tags",
          },
        },
        burgers: {
          specPath: "examples/food/burgers/openapi.yaml",
          outputDir: "api/food/burgers",
        }
      }
    },
  ],
  [
    "@docusaurus/plugin-content-docs",
    {
      id: "openapi",
      path: "api",
      breadcrumbs: true,
      routeBasePath: "api",
      include: ["**/*.md", "**/*.mdx"],
      sidebarPath: "apiSidebars.js", // Specified path to sidebars file
      ...
      ...
    },
  ],
```

```js
// apiSidebars.js

const sidebars = {
  openApiSidebar: [
    {
      type: "category",
      label: "Petstore",
      link: {
        type: "generated-index",
        title: "Petstore API",
        description:
          "This is a sample server Petstore server. You can find out more about Swagger at http://swagger.io or on irc.freenode.net, #swagger. For this sample, you can use the api key special-key to test the authorization filters.",
        slug: "/category/petstore-api",
      },
      items: require("./api/petstore/sidebar.js").sidebar, // Path to generated sidebar.js slice
    },
    {
      type: "category",
      label: "Food",
      link: {
        type: "generated-index",
        title: "Food APIs",
        slug: "/category/food-apis",
      },
      items: [
        {
          type: "autogenerated",
          dirName: "food",
        },
      ],
    },

    module.exports = sidebars;
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
