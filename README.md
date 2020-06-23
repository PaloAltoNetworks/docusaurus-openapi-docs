# Docusaurus Plugin OpenAPI (WIP)

Install the plugin in your docusaurus project:
```
yarn add docusaurus-plugin-openapi
```

Add it as a plugin to `docusaurus.config.js`:
```js
plugins: [
  ["docusaurus-plugin-openapi", {
    openapiPath: require.resolve("./openapi.json"),
  }],
]
```

Add it as a link in `docusaurus.config.js` to `themeConfig.navbar.links`:
```js
{
  to: "api/",
  activeBasePath: "api",
  label: "API",
  position: "left",
}
```