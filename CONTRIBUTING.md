# Contributing to Docusaurus OpenAPI

Our goal is to make API documentation a seamless experience for both the developers creating and the ones using them. In order to achieve this, we built Docusaurus OpenAPI from scratch to be a native extension to Docusaurus. If you're interested in contributing to Docusaurus OpenAPI, hopefully, this document makes the process for contributing easier.

## Get Involved

There are many ways to contribute, and many of them do not involve writing any code. Here's a few ideas to get started:

- Simply start using Docusaurus OpenAPI. Does everything work as expected? If not, we're always looking for improvements. Let us know by [opening an issue](https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues/new).
- Look through the [open issues](https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues). Provide workarounds, ask for clarification, or suggest labels.
- If you find an issue you would like to fix, [open a pull request](https://github.com/cloud-annotations/docusaurus-plugin-openapi/blob/main/CONTRIBUTING.md#your-first-pull-request). Issues tagged as _[Good first issue are](https://github.com/cloud-annotations/docusaurus-plugin-openapi/labels/Good%20first%20issue)_ a good place to get started.
- Read through our documentation (READMEs or even this page). If you find anything that is confusing or can be improved, you can click the "pencil ✏️" icon at the top of the file, which will take you to the GitHub interface to make and propose changes.

Contributions are very welcome. If you think you need help planning your contribution, please reach out to our maintainer on Twitter at [@bourdakos1](https://twitter.com/bourdakos1) and let us know you are looking for a bit of help.

## Our Development Process

All work on Docusaurus OpenAPI happens directly on GitHub. All changes will be public through pull requests and go through the same review process.

All pull requests will be checked by the continuous integration system, GitHub actions. There are unit tests, end-to-end tests and code style/lint tests.

### Branch Organization

Docusaurus OpenAPI has one primary branch `main`. We don't use separate branches for development or for upcoming releases.

## Proposing a Change

If you would like to request a new feature or enhancement, but are not yet thinking about opening a pull request, you can also [open an issue](https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues/new).

If you intend to change the public API (e.g., changes to the options available to the user in `docusaurus.config.js`) or make any non-trivial changes to the implementation, we recommend filing an issue to propose your change. This lets us reach an agreement on your proposal before you put significant effort into it. These types of issues should be rare.

If you're only fixing a bug, it's fine to submit a pull request right away but we still recommend filing an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.

### Bugs

We use [GitHub Issues](https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues) for our public bugs. If you would like to report a problem, take a look around and see if someone already opened an issue about it. If you are certain this is a new, unreported bug, you can submit a bug report.

If you have questions about using Docusaurus OpenAPI, contact our maintainer on Twitter at [@bourdakos1](https://twitter.com/bourdakos1), and we will do our best to answer your questions.

## Pull Requests

### Your First Pull Request

So you have decided to contribute code back to upstream by opening a pull request. You've invested a good chunk of time, and we appreciate it. We will do our best to work with you and get the PR looked at.

#### Repo Setup

1. Fork [the repository](https://github.com/cloud-annotations/docusaurus-plugin-openapi) and create your branch from `main`.

```sh
git clone git@github.com:your-username/docusaurus-plugin-openapi.git
git checkout -b your-feature-or-fix-name
```

#### Installation

1. Ensure you have [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) installed.
2. After cloning the repository, run `yarn install` in the root of the repository.

```sh
cd where-you-cloned-docusaurus-plugin-openapi
yarn install
```

#### Build

1. Build all packages and generate the static content of the demo.

```sh
yarn build
```

2. Serve the generated demo site.

```sh
yarn serve
```

3. Visit [http://localhost:3000/](http://localhost:3000/) or wherever the build directory is being served.

#### Development Workflow

For faster iterations, packages can be built and watched by running:

```sh
yarn watch
```

And in a seperate terminal window, the demo can be built and watched by running:

```sh
yarn watch:demo
```

#### Testing

Before we merge your code into our main branch, we expect it to pass four test groups (format, linting, unit tests and end-to-end tests).

1. **Format**: We use Husky pre-commit hooks and Prettier to automatically format your code, so you shouldn't need to worry too much about this one.
   Husky and Prettier

2. **Linting**: We use ESLint to testing for linting errors and warnings. To check to see if your code has any linting issues you can run:

```sh
yarn lint
```

3. **Unit Tests**: We use Jest for unit testing. Run the unit tests with:

```sh
yarn test
```

4. **End-to-End Tests**: We use Cypress for end-to-end testing. Run the end-to-end with:

```sh
yarn test:cypress
```
