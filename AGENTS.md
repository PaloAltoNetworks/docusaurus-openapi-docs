# Contributor Guide

This repository hosts the **docusaurus-plugin-openapi-docs** and **docusaurus-theme-openapi-docs** packages. The plugin converts OpenAPI specs to MDX and the theme provides React components for rendering those docs. The `demo` directory shows them working together.

```
root
├─ packages
│  ├─ docusaurus-plugin-openapi-docs   # generates MDX from OpenAPI specs
│  └─ docusaurus-theme-openapi-docs    # theme components for API docs
├─ demo                                # example site using the plugin and theme
└─ scripts                             # release and helper scripts
```

The plugin and theme are typically used together:

```
OpenAPI spec ──▶ plugin ──▶ generated MDX ──▶ docs plugin ──▶ theme ──▶ website
```

## Developer Quick Start

Steps from the top-level `README.md` for getting started:

```bash
 git clone https://github.com/<your account>/docusaurus-openapi-docs.git
 cd docusaurus-openapi-docs
yarn
yarn build-packages
yarn watch:demo
```

## Contributing Tips

See `CONTRIBUTING.md` for the full guide. Use clear commit messages so reviewers can understand what each commit does.

## Required Checks

Run the following before committing any code changes (except documentation or comment-only updates):

```bash
yarn lint
yarn test
```

## Other Common Tasks

- `yarn` – install dependencies
- `yarn build-packages` – compile all packages

## Publish a New Release

1. **Bump the version** (use semantic versioning):
   ```bash
   yarn release:version <patch|minor|major>
   ```
2. **Update `CHANGELOG.md`** by running:
   ```bash
   yarn release:changelog
   ```
   Copy the output to the top of `CHANGELOG.md` with the current date. Update the "High level enhancements" section (high-level summary of new features or bug fixes) and clean up the history for public release.
3. **Cleanup documentation** in `README.md`, `packages/docusaurus-plugin-openapi-docs/README.md` and `demo/docs/intro.mdx`.
4. **Commit** all changes with the message `Prepare release vX.Y.Z`.

Once merged, the `release.yaml` workflow will publish the release automatically.

## Handling Issues and Pull Requests

### Issues

- Triage each report to figure out whether it's a question, documentation request, or bug.
- Investigate carefully to confirm the problem is within this project and not caused by user error, dependency mismatches, or other external factors.
- Consider how a fix might affect existing features and avoid any regression or breaking change.

### Pull Requests

- Start by checking if the contribution updates documentation, fixes a bug, or adds or enhances a feature.
- Ensure the proposal fits the scope of the project and doesn't duplicate existing docs or functionality.
- Provide a summary of whether the pull request is ready to merge or what changes are still needed from the contributor.
- Consider how merging the pull request might affect existing features and make sure it does not introduce regressions or breaking changes.
