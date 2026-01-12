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

## Versioning and Releases

This project uses [semantic versioning](https://semver.org/) and Lerna for package management. Releases are triggered automatically when version changes are merged to `main`.

### Version Types

| Bump Type    | Example                         | When to Use                             |
| ------------ | ------------------------------- | --------------------------------------- |
| `patch`      | `4.5.0` → `4.5.1`               | Bug fixes, minor documentation updates  |
| `minor`      | `4.5.1` → `4.6.0`               | New features, non-breaking enhancements |
| `major`      | `4.6.0` → `5.0.0`               | Breaking changes                        |
| `preminor`   | `4.5.1` → `4.6.0-rc.0`          | Pre-release for upcoming minor version  |
| `prerelease` | `4.6.0-rc.0` → `4.6.0-rc.1`     | Iterate on existing pre-release         |
| `graduate`   | `4.6.0-rc.5` → `4.6.0`          | Promote pre-release to stable           |
| `betamajor`  | `4.5.1` → `5.0.0-beta.0`        | Start a new beta major version          |
| `betapatch`  | `5.0.0-beta.0` → `5.0.0-beta.1` | Iterate on beta version                 |

### Preparing a Release

#### Step 1: Bump the Version

Run the version command with the appropriate bump type:

```bash
yarn release:version <bump>
```

This updates `lerna.json` and all package versions. The version is stored in `lerna.json` and propagated to all packages.

#### Step 2: Generate the Changelog

```bash
yarn release:changelog
```

This outputs a changelog template comparing commits between the latest tag and `main`. Copy the output and prepend it to `CHANGELOG.md`.

**Changelog format:**

```markdown
## X.Y.Z (Mon DD, YYYY)

High level enhancements

- Brief summary of major features or fixes

Other enhancements and bug fixes

- Commit message ([#123](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/123))
```

**Guidelines for changelog entries:**

- Replace `TODO HIGHLIGHTS` with a concise summary of user-facing changes
- Remove internal commits (CI changes, minor refactors) that don't affect users
- Group related changes together when appropriate
- Use past tense for descriptions

#### Step 3: Update Documentation (if needed)

Review and update version references in:

- `README.md`
- `packages/docusaurus-plugin-openapi-docs/README.md`
- `demo/docs/intro.mdx`

#### Step 4: Commit and Open a PR

```bash
git add .
git commit -m "Prepare release vX.Y.Z"
```

Open a pull request targeting `main`. The PR title should follow the format: `(release) vX.Y.Z`.

### Automatic Publishing

Once the release PR is merged to `main`, the `release.yaml` GitHub Action:

1. Checks if the version tag already exists (skips if it does)
2. Installs dependencies and builds packages
3. Publishes packages to npm
4. Creates and pushes a git tag (`vX.Y.Z`)

**Important:** Do not manually publish or create tags. The workflow handles this automatically.

### Beta Releases

Beta releases follow a separate workflow on the `v3.0.0` branch (or other designated beta branches):

1. Use `betamajor` or `betapatch` to bump versions
2. Generate changelog with `yarn release:changelog`
3. Merge to the beta branch
4. The `release-beta.yaml` workflow publishes with the `beta` npm tag

Users install beta versions with:

```bash
npm install docusaurus-plugin-openapi-docs@beta
```

### Troubleshooting Releases

| Issue              | Solution                                                            |
| ------------------ | ------------------------------------------------------------------- |
| Release skipped    | Version tag already exists; bump to a new version                   |
| Changelog empty    | No commits between latest tag and main; verify remote is configured |
| Publish failed     | Check npm token in GitHub secrets (`NPM_AUTH_TOKEN`)                |
| Tag already exists | A previous release used this version; bump again                    |

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
