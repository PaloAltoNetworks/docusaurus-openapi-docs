# Template

This template is built for [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Usage

```bash
npx create-docusaurus@2.0.0-beta.18 my-website "Git repository" --package-manager yarn
```

This will trigger a wizard that will step you through selecting your template.

When prompted:

- Enter a repository URL:

```bash
https://github.com/PaloAltoNetworks/docusaurus-template-openapi-docs.git
```

- How should we clone this repo? Copy: do a shallow clone, but do not create a git repo

Example output:

```bash
Need to install the following packages:
  create-docusaurus@2.0.0-beta.18
Ok to proceed? (y)
✔ Enter a repository URL from GitHub, Bitbucket, GitLab, or any other public repo.
(e.g: https://github.com/ownerName/repoName.git) … https://github.com/PaloAltoNetworks/docusaurus-template-openapi-docs.git
✔ How should we clone this repo? › Copy: do a shallow clone, but do not create a git repo
[INFO] Creating new Docusaurus project...
[INFO] Cloning Git template https://github.com/PaloAltoNetworks/docusaurus-template-openapi-docs.git...

```

### Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
