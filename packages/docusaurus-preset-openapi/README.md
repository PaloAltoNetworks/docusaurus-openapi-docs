<h1 align="center">Docusaurus OpenAPI</h1>

<div align="center">

OpenAPI plugin for generating API reference docs in Docusaurus v2.

</div>

<p align="center">

![](https://user-images.githubusercontent.com/4212769/85324376-b9e3d900-b497-11ea-9765-c42a8ad1ff61.png)

</p>

## Installation

Install the preset in your docusaurus project by running:

```sh
// with npm
npm install docusaurus-preset-openapi

// with yarn
yarn add docusaurus-preset-openapi
```

## Usage

1. Add your OpenAPI definition to the root of your site dir as `openapi.json` (See [Configuration](#Configuration) options below).

2. The OpenAPI preset can be used as a drop-in replacement for `@docusaurus/preset-classic`, replace it as follows:

   ```js
   /* docusaurus.config.js */

   {
     presets: [
       [
         "docusaurus-preset-openapi",
         {
           // docs: { ... },
           // blogs: { ... },
           // theme: { ... },
         },
       ],
     ],
   }
   ```

3. Add a link to the API section of your site by updating `themeConfig.navbar.items`:

   ```js
   /* docusaurus.config.js */

   {
     themeConfig: {
       navbar: {
         items: [
           // ... other items
           { to: "/api", label: "API", position: "left" },
           // ... other items
         ],
       },
     },
   }
   ```

## Configuration

The OpenAPI plugin can be configured with the following options:

| Name                         | Type      | Default            | Description                                                                                                                  |
| ---------------------------- | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `path`                       | `string`  | `'openapi.json'`   | Path to OpenAPI definition (`json` or `yaml`) on filesystem relative to site dir.                                            |
| `routeBasePath`              | `string`  | `'api'`            | URL route for the API section of your site. **DO NOT** include a trailing slash. Use `/` for shipping API without base path. |
| `sidebarCollapsible`         | `boolean` | `true`             | Whether sidebar categories are collapsible by default.                                                                       |
| `sidebarCollapsed`           | `boolean` | `true`             | Whether sidebar categories are collapsed by default.                                                                         |
| `apiLayoutComponent`         | `string`  | `'@theme/ApiPage'` | Root Layout component of each API page.                                                                                      |
| `apiItemComponent`           | `string`  | `'@theme/ApiItem'` | Main API container, with demo panel, pagination, etc.                                                                        |
| `remarkPlugins`              | `any[]`   | `[]`               | Remark plugins passed to MDX.                                                                                                |
| `rehypePlugins`              | `any[]`   | `[]`               | Rehype plugins passed to MDX.                                                                                                |
| `beforeDefaultRemarkPlugins` | `any[]`   | `[]`               | Custom Remark plugins passed to MDX before the default Docusaurus Remark plugins.                                            |
| `beforeDefaultRehypePlugins` | `any[]`   | `[]`               | Custom Rehype plugins passed to MDX before the default Docusaurus Rehype plugins.                                            |

Example:

```js
/* docusaurus.config.js */

{
  presets: [
    [
      "docusaurus-preset-openapi",
      {
        api: {
          path: "api/cars.yaml",
          routeBasePath: "cars",
          // ... other options
        }
      },
    ],
  ],
}
```
