---
id: versioning
hide_title: true
sidebar_label: Versioning
title: Versioning
---

## Overview

Although Docusaurus offers its own versioning system the OpenAPI Docs plugin comes equipped with one specifically aimed at versioning API docs. Aside from being relatively "lighter" than the Docusaurus system, it offers a way to automatically generate some useful UI components including:

- A dropdown version selector for quickly switching API versions.
- A version badge/breadcrumb for quickly knowing which version you are looking at.

Finally, the OpenAPI Docs versioning implementation allows API docs to be versioned separately from non-API docs which provides greater flexibility.

## Versioning CLI

The OpenAPI Docs plugin versioning system is driven by the CLI and is not unlike the experience of generating and cleaning non-versioned API docs.

:::info TIP
For details around how to configure versioning see the [Plugin Configuration Options](./intro.mdx#plugin-configuration-options) and [Versioning](./intro.mdx#versioning-openapi-docs) guides.
:::

### Generating and Cleaning

Generating versioned API docs example:

```bash
yarn docusaurus gen-api-docs:version petstore:1.0.0
```

Cleaning versioned API docs example:

```bash
yarn docusaurus clean-api-docs:version petstore:1.0.0
```

Generating all Petstore versioned API docs:

```bash
yarn docusaurus gen-api-docs:version petstore:all
```

### `versions.json`

The `versions.json` file contains metadata that could be useful for building UI navigation and breadcrumb components. It is generated and written each time `gen-api-docs:version` is executed, whether for a specific version `id` or `all` versions. It is only automatically deleted when `yarn docusaurus clean-api-docs:version <your-api-config-key>:all` is executed. When attempting to remove or cleanup versions there are some details to keep in mind:

- Removing/deleting a version will require multiple steps.
  - **Step 1**: Run the appropriate `clean-api-docs:version` command.
  - **Step 2**: Manually delete the version folder from the docs `path`.
  - **Step 3**: Remove the version from the OpenAPI plugin config.
  - **Step 4**: Run the `gen-api-docs:version` command to update the `versions.json` file.

:::info TIP
The OpenAPI Docs plugin will **not** delete a versioned `outputDir` after executing the `clean-api-docs:version` command. This is by design, as the plugin tries to avoid removing non-API docs/files.
:::

:::note
In the future, we may decide to introduce a separate command for generating/updating the `versioning.json` file. For now, you can run the `gen-api-docs:version` command for any version, including `all`, to trigger the update.
:::

## UI Helpers

As mentioned earlier, the OpenAPI plugin comes equipped with utilities for generating navigational UI components to help users switch API versions and quickly determine which version they are looking at.

Both the version selector and version crumb components leverage the Docusaurus `html` sidebar item type to inject pure HTML sidebar items.

:::info
Although convenient, `html` sidebar items are somewhat limited in terms of rendering content dynamically or accessing state, since javascript is ignored.
:::

### Version selector

As the name implies, this utility will generate a pure HTML version selector base on the `versions.json` file.

Import:

```javascript
const {
  versionSelector,
} = require("docusaurus-plugin-openapi-docs/lib/sidebars/utils"); // imports utility
const petstoreVersions = require("./docs/petstore/versions.json"); // imports Petstore versions.json
```

Add to existing sidebar:

```javascript
{
  type: "html",
  defaultStyle: true,
  value: versionSelector(petstoreVersions),
  className: "version-button",
}
```

### Version Crumb

As the name implies, this utility will generate a pure HTML crumb to help users identify which version they are currently on.

Import:

```javascript
const {
  versionCrumb,
} = require("docusaurus-plugin-openapi-docs/lib/sidebars/utils");
```

Add to existing sidebar:

```javascript
{
  type: "html",
  defaultStyle: true,
  value: versionCrumb(`v1.0.0`), // The version label you wish to display
}
```
