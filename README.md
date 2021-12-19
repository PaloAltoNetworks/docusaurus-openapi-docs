# Docusaurus OpenAPI (beta)

OpenAPI plugin for generating API reference docs in Docusaurus v2.

![](https://user-images.githubusercontent.com/4212769/85324376-b9e3d900-b497-11ea-9765-c42a8ad1ff61.png)

> ### 💥 [Breaking Changes](https://github.com/cloud-annotations/docusaurus-plugin-openapi/releases/tag/v0.2.0): v0.1.0 -> v0.2.0

## Preset usage

Install the preset in your docusaurus project by running:

```sh
// with npm
npm install docusaurus-preset-openapi

// with yarn
yarn add docusaurus-preset-openapi
```

The OpenAPI preset can be used as a drop-in replacement to `@docusaurus/preset-classic`:

```js
/* docusaurus.config.js */

{
  presets: [
    [
      "docusaurus-preset-openapi",
      {
        // ... options
      },
    ],
  ],
}
```

The default preset options will expose a route, `/api`, and look for an OpenAPI definition at `./openapi.json`.

To explictly configure this, add an `api` stanza as follows:

```js
/* docusaurus.config.js */

{
  presets: [
    [
      "docusaurus-preset-openapi",
      {
        api: {
          path: 'openapi.json',
          routeBasePath: 'api',
        },
        // ... other options
      },
    ],
  ],
}
```

To add a link to the API page, add a new item to the navbar by updating `themeConfig.navbar.items`:

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

## Multiple OpenAPI Definitions

To have more than one OpenAPI pages, add additional OpenAPI plugin instances:

```js
/* docusaurus.config.js */

{
  presets: [
    [
      'docusaurus-preset-openapi',
      {
        api: {
          // id: 'cars', // omitted => default instance
          path: 'cars/openapi.json',
          routeBasePath: 'cars',
          // ... other options
        },
      },
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-openapi',
      {
        id: 'trains',
        path: 'trains/openapi.json',
        routeBasePath: 'trains',
        // ... other options
      },
    ],
    [
      'docusaurus-plugin-openapi',
      {
        id: 'bikes',
        path: 'bikes/openapi.json',
        routeBasePath: 'bikes',
        // ... other options
      },
    ],
  ],
}
```

This will create routes for `/cars`, `/trains` and `/bikes`.

> **Note:** One instance of the plugin is included in the preset. All additional plugin instances will require an `id`.

## Contributing

We encourage you to contribute to Docusaurus OpenAPI! Please check out the
[Contributing to Docusaurus OpenAPI guide](https://github.com/cloud-annotations/docusaurus-plugin-openapi/blob/main/CONTRIBUTING.md) for guidelines about how to proceed.

## License

Docusaurus OpenAPI is released under the [MIT License](https://opensource.org/licenses/MIT).
