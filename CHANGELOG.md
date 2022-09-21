## 1.2.0 (Sep 21, 2022)

High level enhancements

- Re-introduced ability to send API request from browser.

Other enhancements and bug fixes

- Ensure docPath corresponds to docsPluginId when pluginId is passed ([#277](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/277))
- Upgrade lerna
- Allow grouping by operation tag if global tag not defined ([#276](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/276))
- Throw exception when operationId and summary not defined ([#274](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/274))
- [Enhancement] Set title in mustache templates ([#273](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/273))
- Check for mapping object before attempting to resolve discriminators ([#269](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/269))
- Handle both items and non-items schemas in renderDefaultValue ([#268](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/268))
- [Enhancement] Re-introduce ability to send API requests from browser ([#264](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/264))
- [Enhancement] Use operation description as frontmatter description ([#262](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/262))
- Upgrade postman-code-generators ([#261](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/261))

## 1.1.12 (Sep 12, 2022)

High level enhancements

- Relax docusaurus dependencies.

Other enhancements and bug fixes

- [Enhancement] Relax docusaurus dependencies and upgrade demo to v2.1.0 ([#258](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/258))
- Add documentation for languageTabs and request method labels. ([#256](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/256))
- Add Docusaurus version to demo footer. ([#255](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/255))
- Update docs

## 1.1.11 (Sep 8, 2022)

High level enhancements

- Added tooltip support to request option input fields.
- Added multi plugin instance support to CLI.

Other enhancements and bug fixes

- [Enhancement] Split placeholder by newline and add title for tooltip ([#252](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/252))
- [Bug] Delete writeOnly props instead of readOnly and ignore example if present ([#251](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/251))
- Upgrade lerna to 5.5.0 ([#250](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/250))
- Apply flex properties to schema tabs container ([#248](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/248))
- Add gtag
- Fix logic that determines if an object property is required ([#247](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/247))
- Bump terser from 5.14.1 to 5.15.0 ([#240](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/240))
- Bump terser from 5.12.1 to 5.15.0 in /demo ([#241](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/241))
- [Experimental] Adds multi-instance support to plugin CLI ([#244](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/244))
- Add combine dependabot workflow ([#242](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/242))
- Fix missing array opening bracket. ([#238](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/238))
- [Bug] Fix support for markdown template ([#239](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/239))

## 1.1.10 (Sep 2, 2022)

High level enhancements

- Improve CodeTabs and languageTabs support.

Other enhancements and bug fixes

- [Enhancement] Expand supported CodeTab languages ([#235](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/235))

## 1.1.9 (Aug 30, 2022)

High level enhancements

- Introduced PWA support to demo/doc site.
- Improvements to how request/response schemas used to create examples.

Other enhancements and bug fixes

- [Bug] Ignore additional props in mergeAllOf ([#228](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/228))
- [Bug] Various fixes to how request and response schemas are handled ([#224](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/224))
- [Experimental] Introduce PWA support ([#216](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/216))

## 1.1.8 (Aug 17, 2022)

High level enhancements

- Bug fixes.

Other enhancements and bug fixes

- Fix typo TabTtem -> TabItem ([#212](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/212))

## 1.1.7 (Aug 15, 2022)

High level enhancements

- Improved consistency of code block styling.

Other enhancements and bug fixes

- Use CodeBlock to render code fences ([#210](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/210))

## 1.1.6 (Aug 12, 2022)

High level enhancements

- Polish and bug fixes.

Other enhancements and bug fixes

- [Bug] Improve handling of response schemas and examples ([#208](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/208))

## 1.1.5 (Aug 11, 2022)

High level enhancements

- Expanded support for response examples.
- Added support for `readOnly` and `writeOnly`.
- Now retains natural tag order in OAS when grouping by tag.
- Expanded support for MIME types.

Other enhancements and bug fixes

- [Enhancement] Add support for single response example ([#206](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/206))
- [Enhancement] Respect readOnly/writeOnly and improve body sample ([#203](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/203))
- [Bug] Ensure operation tags match global tags before building sidebar ([#202](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/202))
- [Enhancement] Apply sorting to tags/sidebar categories ([#200](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/200))
- [Bug] Ensure required label is consistently applied ([#198](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/198))
- [Enhancement] Expand support for MIME types ([#195](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/195))

## 1.1.4 (Aug 4, 2022)

Other enhancements and bug fixes

- [Enhancement] Add support for rendering default value ([#189](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/189))

## 1.1.3 (Aug 2, 2022)

High level enhancements

- Upgraded to Docusaurus v2.0.1
- Refactored qualifiers to improve readability
- Added support for response headers
- Added support for x-logo and x-dark-logo extensions
- Added support for discriminators
- Added support for response status code examples

Other enhancements and bug fixes

- [Bug] Improve handling of schema.items qualifiers ([#186](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/186))
- Upgrade to Docusaurus v2.0.1 ([#185](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/185))
- [FR] Support for response status code examples ([#176](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/176))
- [Enhancement] Add support for x-logo and x-dark-logo extensions ([#184](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/184))
- [Bug] Fix createPostmanCollection method where a copy of openapiData is generated ([#183](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/183))
- [Enhancement] Refactor qualifiers to improve readability ([#181](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/181))
- [Bug] Use basePath in place of slug to avoid duplicate routes ([#173](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/173))
- [Enhancement] Add support for discriminators ([#174](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/174))
- Add support for response headers ([#171](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/171))

## 1.1.2 (Jul 21, 2022)

High level enhancements

- Rename Endpoint to Base URL.
- Display Base URL form field even if only one URL option is available to select.
- Default `baseId` to `operationId` instead of `summary` to avoid duplicate routes.

Other enhancements and bug fixes

- [Bug] Use copy of openapiData to generate postman collection ([#167](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/167))

## 1.1.1 (Jul 20, 2022)

High level enhancements

- Upgrade to docusaurus 2.0.0-rc.1

Other enhancements and bug fixes

- Upgrade to docusaurus 2.0.0-rc.1 ([#164](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/164))

## 1.1.0 (Jul 19, 2022)

High level enhancements

- Refactor `createSchemaDetails.ts` to improve support for `anyOf`, `oneOf`, and `allOf` schemas ([#160](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/160))
- [Enhancement] Improve support for circular $ref pointers ([#154](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/154))
- [Upgrade] Docusaurus Beta 22 support ([#155](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/155))

Other enhancements and bug fixes

- Check for basePath before defining intro and category link doc ids ([#159](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/159))
- [Enhancement] Integrate ReDoc OpenAPIParser ([#148](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/148))
- [FR] ApiDemoPanel (a11y): Improve keyboard tab support ([#149](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/149))
- Add await to resolveJsonRefs ([#147](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/147))
- [Enhancement] Add oneOf and anyOf support ([#139](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/139))
- Add sidebar and versioning docs ([#137](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/137))

## 1.0.6 (Jun 15, 2022)

High level enhancements

- Rename `docPluginId` option to `docsPluginId`.
- Ensure unique category link for versioned docs when `groupTagsBy` is set to "tag".
- Introduce lower-level `json-schema-ref-parser` for handling non-OpenAPI-compliant `$ref` pointers.

Other enhancements and bug fixes

- Increase dereference timeout ([#135](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/135))
- [Bug] Re-introduce json-schema-ref-parser ([#134](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/134))

## 1.0.5 (Jun 14, 2022)

High level enhancements

- Extended Docusaurus syntax handling to code samples.
- Implemented CodeTab choice synching for code samples.
- Cleanup XML body editing.

Other enhancements and bug fixes

- [Experimental] Code block/editor optimizations ([#132](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/132))

## 1.0.4 (Jun 10, 2022)

High level enhancements

- Converted demo site to official documentation site.
- Added support for generating versioned OpenAPI docs.

Other enhancements and bug fixes

- [Enhancement] Use `docPluginId` to derive `routeBasePath` and `path` ([#127](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/127))
- [Enhancement] Add route base path support ([#126](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/126))
- Re-gen versioned petstore docs
- [Enhancement] Add versioning support to OpenAPI docs plugin ([#125](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/125))
- [FR] OpenApi Docs: Expand details by 1L for Desktop ([#122](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/122))
- [Enhancement] Use plugin-content-docs path when generating sidebar doc items ([#124](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/124))
- Update README.md and documentation

## 1.0.3 (Jun 3, 2022)

High level enhancements

- Upgrade to Docusaurus 2.0.0-beta.21 ([#116](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/116))
- Add support for URL specPath ([#120](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/120))
- [Enhancement] Implement new OpenAPI parser ([#118](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/118))
- [Experimental] Info Docs: Added Authentication section with support for Security Schemes ([#110](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/110))
- [Enhancement] Use docs with embedded links as category link ([#114](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/114))

Other enhancements and bug fixes

- Update README.md
- Add try/catch to createExample ([#115](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/115))
- [Bug] Reinstate support for untagged paths ([#107](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/107))
- [Polish] Add support for head method and badge ([#105](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/105))
- [Polish] Update demo ([#104](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/104))

## 1.0.2 (May 23, 2022)

High level enhancements

- Added support for defining `categoryLinkSource` when grouping paths by tag
- Extend support for additional `SecuritySchemes`

Other enhancements and bug fixes

- Add categoryLinkSource to usage ([#101](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/101))
- [Bug] Refactor categoryLinkSource option and usage ([#100](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/100))
- Add extra conditions to check for undefined info properties ([#98](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/98))
- [Enhancement] Improve category link support when grouping by tags ([#97](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/97))
- [FR] Additional supported fields for index.api.mdx ([#96](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/96))
- [FR] Added security schemes support for SecuritySchemes component ([#93](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/93))
- [Bug] Add missing openapi code colors ([#87](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/87))
- Add conditions for empty body or body content ([#86](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/86))
- Add support for canary releases ([#85](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/85))
- [Theme]: Fix @theme/Tabs namespace collision ([#84](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/84))
- [Polish] Cleanup @ts-ignore usage throughout project ([#80](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/80))

## 1.0.1 (May 4, 2022)

High level enhancements

- Pin Docusaurus to v2.0.0-beta.18
- Adopt strategy of pinning Docusaurus version until viable upgrade path exists

Other enhancements and bug fixes

- [Fix Breaking Change] Pin to docusaurus 2.0.0-beta.18 ([#76](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/76))
- Add keywords and update git URL ([#74](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/74))
- Switch from panw-main to main

## 1.0.0 (May 3, 2022)

High level enhancements

- Update README, LICENSE, and other supporting documentation
- Remove @paloaltonetworks scope from package name
- Rename main repository and packages to:
  - Repository: `docusaurus-openapi-docs`
  - Plugin: `docusaurus-plugin-openapi-docs`
  - Theme: `docusaurus-theme-openapi-docs`

## 18.0.0-beta.2 (Apr 26, 2022)

High level enhancements

- Upgrade to Docusaurus 2.0.0-beta.18
- Remove docusaurus-template-openapi and create-docusaurus-openapi

> Note that template moved to it's own [GitHub repository](https://github.com/PaloAltoNetworks/docusaurus-template-openapi-docs)

## 18.0.0-beta.1 (Apr 25, 2022)

💥 Breaking Changes

- [New Feature]: Extend CLI to support generating API docs ([#55](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/55))

High level enhancements

- [Enhancement]: Wrap `DocItem` for `ApiItem` ([#60](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/60))
- [Cleanup]: Remove unused code ([#57](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/57))

Other enhancements and bug fixes

- Merge pull request #60 from PaloAltoNetworks/update-ApiItem
- fix page width
- Update package.json
- Merge pull request #52 from PaloAltoNetworks/api-demo-panel-styling
- Add important flag to openapi-card-background-color
- Update openapi variables
- Merge branch 'panw-main' of https://github.com/PaloAltoNetworks/docusaurus-openapi into api-demo-panel-styling
- [Workaround]: Ensure info/index doc is first item in sidebar ([#51](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/51))
- Add background styling to demo panel
- Merge pull request #50 from PaloAltoNetworks/editor-cleanup
- Revert light bright styling
- Define openapi-required css variable
- Remove useMonaco hook and import Monaco type
- Remove console log
- Fix mustache template ([#49](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/49))
- [Bug Fix]: CORS Issue - Monaco editor ([#48](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/48))
- [Experimental] Enable prev/next for beforeApiDocs items ([#45](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/45))

## 17.0.9 (Apr 4, 2022)

High level enhancements

- Move over necessary TS modules and types for `SchemaItem` and `ParamsItem` components

Bug fixes

- Fix Babel-loader import warnings ([#42](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/42))

## 17.0.8 (Mar 31, 2022)

High level enhancements

- Refactor `createSchemaDetails` as theme component
- Refactor `createParamsDetails` as theme component
- Reduce overall MDX file sizes in final bundle
- Add/improve support for handling `allOf` schema type

Other enhancements and bug fixes

- Improvements/fixes to `allOf` schema support ([#40](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/40))
- Merge pull request #39 from PaloAltoNetworks/schema-component
- Cleanup unnecessary divs and indentation
- Add margin-bottom after each params type
- Remove param item margin-top
- Use react-markdown for descriptions
- Remove react-markdown from plugin package.json
- Use children props for details in SchemaItem
- Fix imports
- Add react-markdown to theme-openapi dependencies
- Add react-markdown
- Fix linting issues
- Readd createDetails for collapsible content
- Import util functions from @paloaltonetworks
- Merge branch 'panw-main' of https://github.com/PaloAltoNetworks/docusaurus-openapi into schema-component
- Remove margin-left from schemaDescription and schemaQualifierMessage
- Remove empty line
- Remove unused listStyle object
- Add SchemaItem styling
- Create SchemaItem component
- Update ParamsItem styling
- Remove unused import
- Import SchemaItem component into createApiPageMD
- Use SchemaItem component in createSchemaDetails
- Remove escape func for examples
- Organize imports
- Remove unused imports
- Add styling to ParamsItem component
- Import ParamsItem component into createApiPageMD
- Create ParamsItem component
- Remove statically created elements from createParamsDetails

## 17.0.7 (Mar 25, 2022)

High level enhancements

- Switch to forked versions of postman dependencies to reduce bundle size.

Other enhancements and bug fixes

- [Experimental] Switch to forked postman packages ([#36](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/36))
- Remove unnecessary custom styles ([#35](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/35))

## 17.0.6 (Mar 23, 2022)

High level enhancements

- Switch to @paloaltonetworks/postman-code-generators

Other enhancements and bug fixes

- Switch to @paloaltonetworks/postman-code-generators ([#33](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/33))

## 17.0.5 (Mar 21, 2022)

High level enhancements

- Convert patch-package to full dependency.

## 17.0.4 (Mar 21, 2022)

High level enhancements

- Nohoist `postman-collection` and `postman-code-generators` to support package-level patching.
- Add schema guidelines to improve readability.
- Improve responsiveness.

Other enhancements and bug fixes

- Add patch-package to standalone packages ([#29](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/29))
- Add guidelines to collapsible schemas ([#27](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/27))
- Merge pull request #26 from PaloAltoNetworks/response-tweaks-v2
- Update tabs css
- Revert to original ApiPage media query
- Responsiveness tweaks ([#25](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/25))
- Manually bump to 17.0.3 ([#24](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/24))
- Merge pull request #23 from PaloAltoNetworks/ui-cleanup
- Increase cypress viewport size
- Hide ApiItem doc pagination on mobile
- Pass down previous and next props to ApiDemoPanel from ApiItem
- Import DocPaginator into ApiDemoPanel
- Adjust responseTabsContainer width
- Adjust apiSidebarContainer media query

## 17.0.3 (Mar 16, 2022)

High level enhancements

- Added support for frontloading docs ([#20](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/20))
- Optimize webpack bundle size ([#16](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/16))

Other enhancements and bug fixes

- Added workflow for Firebase deployment
- Minor fixes to Tabs component
- Minor fixes to schema indentation

## 17.0.2 (Mar 9, 2022)

Bug fixes

- Merge pull request #13 from PaloAltoNetworks/refactor-tabs
- Update schema indentation
- Refactor response tab dot styling

## 17.0.1 (Mar 7, 2022)

High level enhancements

- Allow GitHub Actions to publish to npm
- Minor fix to status code Tabs component

Other enhancements and bug fixes

- Tabs: Fix Arrow Rendering ([#11](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/11))
- Update validate.yaml
- Update workflows ([#10](https://github.com/PaloAltoNetworks/docusaurus-openapi/pull/10))

## 17.0.0 (Mar 7, 2022)

High level enhancements

- Support for Docusuaurs 2.0.0-beta.17!
- New collapsible schema component (replaces tables)
- New Tabs component for status code responses

Bug fixes and such

- Set max-width for schema component
- Disable exhaustive-deps eslint
- Fix infinite render in ParamOptions
- Upgrade `openapi-to-postmanv2` to latest release (3.0.0)
- Disable `schemaFaker`
- Remove `operationId` from ApiItem
- Change ApiItem title to h2
- Use colored badge for method
- Update cypress tests
- Update sidebars tests

## 15.0.1 (Feb 25, 2022)

Bug fixes

- Fixed type definitions for `showManualAuthentication` and `showExecuteButton` in ApiDemoPanel component

## 15.0.0 (Feb 25, 2022)

First release of @paloaltonetworks/docusaurus-openapi

High level enhancements

- Support for Docusaurus 2.0.0-beta.15
- Use details component for status code response tables
- Adds options to hide Execute button and auth input field

## 0.5.0 (Jan 9, 2022)

High level enhancements

- All theme components are now TypeScript 🎉

Other enhancements and bug fixes

- Fix small theme regression ([#151](https://github.com/cloud-annotations/docusaurus-openapi/pull/151))
- Clear request body when empty ([#147](https://github.com/cloud-annotations/docusaurus-openapi/pull/147))
- Fix code editor background color bug ([#146](https://github.com/cloud-annotations/docusaurus-openapi/pull/146))
- Update theme components to TypeScript ([#130](https://github.com/cloud-annotations/docusaurus-openapi/pull/130))

## 0.4.2 (Dec 30, 2021)

Enhancements and bug fixes

- Update package metadata ([#131](https://github.com/cloud-annotations/docusaurus-openapi/pull/131))
- Fix mobile css bug ([#129](https://github.com/cloud-annotations/docusaurus-openapi/pull/129))

## 0.4.1 (Dec 28, 2021)

Enhancements and bug fixes

- Add `create` command ([#126](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/126))
- Update demo ([#124](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/124))
- Update README.md ([#123](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/123))
- Add README badges ([#122](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/122))

## 0.4.0 (Dec 23, 2021)

High level enhancements

- Docusaurus beta.14 support

  ```js
  // Be sure to update @docusaurus/core:
  "dependencies": {
    "@docusaurus/core": "2.0.0-beta.14",
    // ...
  }
  ```

- With the release of Docusaurus beta.14 (Thanks @slorber!), we can now support configuration of `webpack-dev-server`'s proxy via our `docusaurus-plugin-proxy` plugin.

  This can be useful when you have a separate API backend development server and you want to send API requests on the same domain.

  With the following, a request to `/api/users` will now proxy the request to `http://localhost:3001/api/users`:

  ```js
  // docusaurus.config.js

  const config = {
    plugins: [["docusaurus-plugin-proxy", { "/api": "http://localhost:3001" }]],
    // ...
  };
  ```

  To proxy `/api/users` to `http://localhost:3001/users`, the path can be rewritten:

  ```js
  // docusaurus.config.js

  const config = {
    plugins: [
      [
        "docusaurus-plugin-proxy",
        {
          "/api": {
            target: "http://localhost:3001",
            pathRewrite: { "^/api": "" },
          },
        },
      ],
    ],
    // ...
  };
  ```

  For more config options, see [devServer.proxy](https://webpack.js.org/configuration/dev-server/#devserverproxy).

- Better yarn 3 support

Other enhancements and bug fixes

- Bump to beta 14 and fix proxy plugin ([#120](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/120))
- Fix dependency resolutions ([#119](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/119))

## 0.3.1 (Dec 21, 2021)

High level enhancements

- Added support for more schema qualifiers:

  ```
  - maxLength
  - minLength
  - maximum
  - minumum
  - exclusiveMaximum
  - exclusiveMinimum
  - pattern
  ```

  Example:

  ```yaml
  slug:
    type: string
    description: The human-readable, unique identifier, used to identify the document.
    minLength: 1
    maxLength: 40
    pattern: "^[a-zA-Z0-9_-]*$"
  ```

  Displays:
  <table><tbody><tr><td>

  `slug` string

  **Possible values:** 1 ≤ length ≤ 40, Value must match regular expression `^[a-zA-Z0-9_-]*$`

  The human-readable, unique identifier, used to identify the document.

  </td></tr></tbody></table>

Other enhancements and bug fixes

- Add additional schema qualifiers ([#112](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/112))
- Sidebar generation refactor ([#111](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/111))
- Add recursive folder structure reading & labeling support ([#107](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/107))
- Add experimental support for loading a multiple OpenAPI definitions ([#103](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/103))
- Add sidebar item classname for method ([#104](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/104))
- Fix schema name bug with allOf ([#102](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/102))

## 0.3.0 (Dec 16, 2021)

High level enhancements

- Docusaurus beta.13 support (Thanks @Josh-Cena!)

  ```js
  // Be sure to update @docusaurus/core:
  "dependencies": {
    "@docusaurus/core": "2.0.0-beta.13",
    // ...
  }
  ```

- The OpenAPI `info` stanza will now generate an "Introduction" page

  ```yaml
  openapi: 3.0.3
  info:
    title: Swagger Petstore
    version: 1.0.0
    description: |
      This is a sample server Petstore server.
      You can find out more about Swagger at
      [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).
      For this sample, you can use the api key `special-key` to test the authorization filters.
  ```

- Request bodies will now render JSON Schema with the use of `allOf` keywords

  ```yaml
  requestBody:
    content:
      description: Example request
      application/json:
        schema:
          allOf:
            - $ref: "#/components/schema/Example1"
            - $ref: "#/components/schema/Example2"
  ```

- Enum options will now be displayed in schema tables
  <table>
  <tbody>
  <tr>
  <td>

  `status` string

  Enum: `"available"`, `"pending"`, `"sold"`

  Pet status in the store

  </td>
  </tr>
  </tbody>
  </table>

Other enhancements and bug fixes

- Initial proxy code ([#97](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/97))
- Add support for an introduction page ([#94](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/94))
- Add `allOf` JSON schema support ([#96](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/96))
- Display enum values in tables ([#93](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/93))
- Initial plugin refactor ([#86](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/86))
- Upgrade to Docusaurus beta.13 ([#88](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/88))

## 0.2.3 (Dec 11, 2021)

Enhancements and bug fixes

- Add case-insensitive security scheme support ([#83](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/83))
- Add CodeSandbox CI ([#77](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/77))

## 0.2.2 (Dec 6, 2021)

Fix broken package

## 0.2.1 (Dec 5, 2021)

High level enhancements

- The demo panel now allows you to choose the security scheme from a dropdown that is populated by the OpenAPI definition (only showing the dropdown if more than one is listed)
- Adds support for using multiple auth modes simultaneously (Eg: `(BearerAuth) OR (ApiKeyAuth AND BasicAuth)`)
- Adds an `authPersistence` option to `themeConfig.api`. Defaults to `"localStorage"`, can be set to `false` to disable or `sessionStorage` to only persist while the window is open.

Other enhancements and bug fixes

- Add better auth support ([#74](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/74))

## 0.2.0 (Dec 4, 2021)

### 💥 Breaking Changes

The plugin option `openapiPath` has been renamed to `path` and no longer needs to be wrapped in `require.resolve`.

As recomended my the [Docusaurus documentation](https://docusaurus.io/docs/presets), the plugin `docusaurus-plugin-api` has been properly split into 3 packages:

- `docusaurus-preset-api`
- `docusaurus-plugin-api`
- `docusaurus-theme-api`

The package `docusaurus-plugin-api` will no longer work on it's own without `docusaurus-theme-api`. Instead, the preset `docusaurus-preset-api` can be used on it's own and act as a drop-in replacement for `@docusaurus/preset-classic`.

Example usage:

```diff
// docusaurus.config.js

const config = {
-  plugins: [
-    [
-      "docusaurus-plugin-openapi",
-      {
-        openapiPath: require.resolve("./examples/openapi.json"),
-      },
-    ],
-  ],

  presets: [
    [
-      "@docusaurus/preset-classic",
+      "docusaurus-preset-openapi",
      {
+        api: {
+          path: "examples/openapi.json",
+        }
        docs: {
          // doc options ...
        },
        blog: {
         // blog options ...
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
}
```

Other enhancements and bug fixes

- Fix multi plugin bug ([#69](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/69))
- Add yaml support ([#68](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/68))
- Generate markdown for full page ([#65](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/65))
- Refactor plugin into separate packages ([#64](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/64))
- Update documentation ([#63](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/63))

## 0.1.1 (Nov 24, 2021)

Enhancements and bug fixes

- Fix missing status code description ([#61](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/61))
- Fix narrow tables style regression ([#55](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/55))

## 0.1.0 (Nov 4, 2021)

Enhancements and bug fixes

- Update project structure ([#52](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/52))
- Update plugin to support Docusaurus 2.0.0 beta ([#51](https://github.com/cloud-annotations/docusaurus-plugin-openapi/pull/51))
