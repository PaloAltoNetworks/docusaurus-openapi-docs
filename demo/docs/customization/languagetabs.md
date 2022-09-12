---
id: languagetabs
hide_title: true
sidebar_label: Language Tabs
title: Language Tabs
description: Configuring language tabs for the API Demo Panel.
---

## Overview

The Docusaurus OpenAPI docs plugin comes with support for 7 languages which you can render as tabs on an API method page. Currently supported languages are:

1. `bash`/`cURL`
1. `python`/`requests`
1. `go`/`native`
1. `nodejs`/`axios`
1. `ruby`/`Net::HTTP`
1. `c#`/`RestSharp`
1. `php`/`cURL`

The enabled languages are defined for your site in a `languageTabs` array in the `themeConfig` object in your config file. If you do not define this configuration item all of the languages above are enabled. The config schema for each language is as follows:

| Name              | Type      | Default              | Description                                                                                                            |
| ----------------- | --------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `highlight`       | `string`  | `null`               | The syntax highlighting ruleset to use.                                                                                |
| `language`        | `string`  | `null`               | The programming language to use when generating the example.                                                           |
| `logoClass`       | `string`  | `null`               | The CSS class to be added to render the appropriate logo.                                                              |
| `variant`         | `string`  | `null`               | The language variant to use when generating the example, see below for a tip on where you can find the variants.       |
| `options`         | `object`  | `null`               | _Optional:_ Set of options for language customization. See below for common options, exact options depend on language. |
| `followRedirect`  | `string`  | `null`               | _Optional:_ Follow redirects when handling requests.                                                                   |
| `trimRequestBody` | `string`  | `null`               | _Optional:_ Trim request body fields.                                                                                  |
| `indentCount`     | `integer` | _language dependent_ | _Optional:_ Alter the number of indentations used when generating the examples.                                        |
| `indentType`      | `string`  | _language dependent_ | _Optional:_ Alter the type of indentation used, `Space` or `Tab` are acceptable options for this.                      |

## Demo Languages

The demo site disables the `ruby` and `php` languages using the following `languageTabs` config object.

```js
languageTabs: [
    {
        highlight: "bash",
        language: "curl",
        logoClass: "bash",
    },
    {
        highlight: "python",
        language: "python",
        logoClass: "python",
    },
    {
        highlight: "go",
        language: "go",
        logoClass: "go",
    },
    {
        highlight: "javascript",
        language: "nodejs",
        logoClass: "nodejs",
    },
    //{
    //  highlight: "ruby",
    //  language: "ruby",
    //  logoClass: "ruby",
    //},
    {
        highlight: "csharp",
        language: "csharp",
        logoClass: "csharp",
    },
    // {
    //   highlight: "php",
    //   language: "php",
    //   logoClass: "php",
    // },
],
```
