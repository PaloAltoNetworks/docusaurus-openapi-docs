---
id: styling
hide_title: true
sidebar_label: Styling
title: Styling
description: Styling tweaks for docusaurus-openapi-docs.
---

## Overview

The Docusaurus OpenAPI docs plugin comes with Infima based styling as standard. In the demos on this site you'll see some features which are not included in the default styling including the request method labels before each request. To add these to your site you can use one of the two options outlined below.

The method labels are pure CSS and as a result there are few, if any, limits on how you style / present these on your site.

## Demo Styling

The demo site uses the following CSS to add coloured labels to each request including the name of the method. Adding this to your site's custom CSS will replicate exactly the demo-site's label aesthetic using your site's variables.

```css
/* API Menu Items */
.api-method > .menu__link {
  align-items: center;
  justify-content: start;
}

.api-method > .menu__link::before {
  width: 50px;
  height: 20px;
  font-size: 12px;
  line-height: 20px;
  text-transform: uppercase;
  font-weight: 600;
  border-radius: 0.25rem;
  border: 1px solid;
  margin-right: var(--ifm-spacing-horizontal);
  text-align: center;
  flex-shrink: 0;
  border-color: transparent;
  color: white;
}

.get > .menu__link::before {
  content: "get";
  background-color: var(--ifm-color-primary);
}

.post > .menu__link::before {
  content: "post";
  background-color: var(--openapi-code-green);
}

.delete > .menu__link::before {
  content: "del";
  background-color: var(--openapi-code-red);
}

.put > .menu__link::before {
  content: "put";
  background-color: var(--openapi-code-blue);
}

.patch > .menu__link::before {
  content: "patch";
  background-color: var(--openapi-code-orange);
}

.head > .menu__link::before {
  content: "head";
  background-color: var(--ifm-color-secondary-darkest);
}
```

## Alternative Styling

In [this issue](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/249) community member [@ThomasHeartman](https://github.com/thomasheartman) shared some alternative CSS with better contrast and some other stylistic tweaks to the method labels. The CSS to replicate this is below:

```css
/* Sidebar Method labels */
.api-method > .menu__link {
  align-items: center;
  justify-content: start;
}

.api-method > .menu__link::before {
  width: 50px;
  height: 20px;
  font-size: 12px;
  line-height: 20px;
  text-transform: uppercase;
  font-weight: 600;
  border-radius: 0.25rem;
  border: 1px solid;
  border-inline-start-width: 5px;
  margin-right: var(--ifm-spacing-horizontal);
  text-align: center;
  flex-shrink: 0;
}

.get > .menu__link::before {
  content: "get";
  background-color: var(--ifm-color-info-contrast-background);
  color: var(--ifm-color-info-contrast-foreground);
  border-color: var(--ifm-color-info-dark);
}

.post > .menu__link::before {
  content: "post";
  background-color: var(--ifm-color-success-contrast-background);
  color: var(--ifm-color-success-contrast-foreground);
  border-color: var(--ifm-color-success-dark);
}

.delete > .menu__link::before {
  content: "del";
  background-color: var(--ifm-color-danger-contrast-background);
  color: var(--ifm-color-danger-contrast-foreground);
  border-color: var(--ifm-color-danger-dark);
}

.put > .menu__link::before {
  content: "put";
  background-color: var(--ifm-color-warning-contrast-background);
  color: var(--ifm-color-warning-contrast-foreground);
  border-color: var(--ifm-color-warning-dark);
}

.patch > .menu__link::before {
  content: "patch";
  background-color: var(--ifm-color-success-contrast-background);
  color: var(--ifm-color-success-contrast-foreground);
  border-color: var(--ifm-color-success-dark);
}

.head > .menu__link::before {
  content: "head";
  background-color: var(--ifm-color-secondary-contrast-background);
  color: var(--ifm-color-secondary-contrast-foreground);
  border-color: var(--ifm-color-secondary-dark);
}
```
