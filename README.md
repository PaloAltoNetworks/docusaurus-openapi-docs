<h1 align="center">Docusaurus OpenAPI (beta)</h1>

<div align="center">

OpenAPI plugin for generating API reference docs in Docusaurus v2.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cloud-annotations/docusaurus-plugin-openapi/blob/HEAD/LICENSE)
[![npm latest package](https://img.shields.io/npm/v/docusaurus-preset-openapi/latest.svg)](https://www.npmjs.com/package/docusaurus-preset-openapi)
[![npm downloads](https://img.shields.io/npm/dm/docusaurus-plugin-openapi.svg)](https://www.npmjs.com/package/docusaurus-preset-openapi)
[![build](https://github.com/cloud-annotations/docusaurus-plugin-openapi/actions/workflows/validate.yaml/badge.svg)](https://github.com/cloud-annotations/docusaurus-plugin-openapi/actions/workflows/validate.yaml)
<br/>
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Cypress.io](https://img.shields.io/badge/tested%20with-Cypress-04C38E.svg)](https://www.cypress.io/)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/cloud-annotations/docusaurus-plugin-openapi/blob/HEAD/CONTRIBUTING.md#pull-requests)

</div>

<p align="center">

![](https://user-images.githubusercontent.com/4212769/85324376-b9e3d900-b497-11ea-9765-c42a8ad1ff61.png)

</p>

## Quick Overview

```sh
npx create-docusaurus-openapi my-website
cd my-website
npm start
```

> Coming from `v0.1.0`? See the [migration guide](https://github.com/cloud-annotations/docusaurus-plugin-openapi/releases/tag/v0.2.0).

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher)_

Then open [http://localhost:3000/](http://localhost:3000/) to see your site.<br>
When you’re ready to deploy to production, create a minified bundle with `npm run build`.

## Creating a Site

**You’ll need to have Node 14.0.0 or later version on your local development machine** (but it’s not required on the server). We recommend using the latest LTS version. You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to switch Node versions between different projects.

To create a new site, you may choose one of the following methods:

### npx

```sh
npx create-docusaurus-openapi my-website
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) is a package runner tool that comes with npm 5.2+ and higher)_

### npm

```sh
npm init docusaurus-openapi my-website
```

_`npm init <initializer>` is available in npm 6+_

### Yarn

```sh
yarn create docusaurus-openapi my-website
```

_[`yarn create <starter-kit-package>`](https://yarnpkg.com/lang/en/docs/cli/create/) is available in Yarn 0.25+_

It will create a directory called `my-website` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-website
├── blog
│   ├── 2019-05-28-hola.md
│   ├── 2019-05-29-hello-world.md
│   └── 2020-05-30-welcome.md
├── docs
│   ├── doc1.md
│   ├── doc2.md
│   ├── doc3.md
│   └── mdx.md
├── src
│   ├── css
│   │   └── custom.css
│   └── pages
│       ├── styles.module.css
│       └── index.js
├── static
│   └── img
├── .gitignore
├── openapi.json
├── docusaurus.config.js
├── babel.config.js
├── package.json
├── sidebars.js
└── README.md
```

- `/docusaurus.config.js` - A config file containing the site configuration. This can be used to configure the OpenAPI preset
- `/openapi.json` - The default OpenAPI defination that will be served _(path can be configured in `docusaurus.config.js`)_.

For more info see [project structure rundown](https://docusaurus.io/docs/installation#project-structure-rundown).

Once the installation is done, you can open your project folder:

```sh
cd my-website
```

Inside the newly created project, you can run some built-in commands:

### `npm start` or `yarn start`

Runs the site in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload if you make changes to the code.

### `npm run build` or `yarn build`

Builds the site for production to the `build` folder.

Docusaurus is a modern static website generator that will build the website into a directory of static contents, which can be copied to any static file hosting service like [GitHub pages](https://pages.github.com/), [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

## Popular Alternatives

Docusaurus OpenAPI is great for:

- **Static generation** All OpenAPI operations will be rendered as static pages at build time, giving many performance benefits.
- **Demo panel** Allow users to try out your API with an interactive demo panel.
- **Native Docusaurus feel** Built from scratch to work with Docusaurus.

Here are a few common cases where you might want to try something else:

- If you need better support for more advanced OpenAPI features, check out [Redocusaurus](https://github.com/rohit-gohri/redocusaurus/). Redocusaurus embeds the much more mature OpenAPI documentation generator, [Redoc](https://github.com/Redocly/redoc), into Docusaurus as a React component.

## Contributing

We encourage you to contribute to Docusaurus OpenAPI! Please check out the
[Contributing to Docusaurus OpenAPI guide](https://github.com/cloud-annotations/docusaurus-plugin-openapi/blob/main/CONTRIBUTING.md) for guidelines about how to proceed.

## License

Docusaurus OpenAPI is released under the [MIT License](https://opensource.org/licenses/MIT).
