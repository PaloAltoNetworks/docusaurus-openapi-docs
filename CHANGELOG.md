## 2.0.0-beta.3 (May 5, 2023)

High level enhancements

- [UI Enhancement] Updated left doc panel styling ([#557](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/557))
- Improve support for additional properties, cleanup nested <li>, support SchemaItem children ([#563](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/563))
- Upgrade demo to 2.4.0 and update supported range in plugin and theme ([#554](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/554))
- [UI Enhancement] Enable Expand button for Response ([#553](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/553))
- [UI Enhancement] Request form validation and updated styling ([#530](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/530))
- [UI Enhancement] Response Examples: Updated styling and support for multiple language variants ([#542](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/542))
- [UI Enhancement] Add expand button to CodeBlock ([#537](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/537))
- [Enhancement] Add support for rendering vendor extensions ([#527](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/527))

Other enhancements and bug fixes

- [UI Enhancement] ApiDemoPanel: Expand modal cleanup ([#566](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/566))
- Add more debug info to resolveJsonRefs ([#560](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/560))
- [UI Enhancement] Restyle schema property labels ([#534](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/534))
- Restyle details markers ([#540](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/540))
- Remove PWA ([#548](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/548))
- Upgrade redocly-core and json-schema-ref-parser ([#551](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/551))
- [UI Enhancement] Move CodeTabs above Request ([#533](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/533))
- [UI Enhancement] Move authorization card to ApiItem ([#531](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/531))
- Update bash/curl logo and refactor how logo width/height are defined ([#525](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/525))
- [Cleanup] Optimize theme typescript build ([#524](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/524))
- Point test and include to lib dir ([#521](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/521))
- [Bug] Narrow SASS loader rules to avoid conflicts with docusaurus-plugin-sass ([#519](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/519))

## 2.0.0-beta.2 (Mar 20, 2023)

High level enhancements

- Added support for powershell
- Added `categorySourceLink` "auto" option
- Restyled tree lines to match toc-border-color

Other enhancements and bug fixes

- Add powershell styles
- Remove old styles.css
- [Enhancement] Add support for powershell ([#507](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/507))
- Resolve conflicts
- Bump webpack from 5.75.0 to 5.76.0 ([#498](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/498))
- Breaking: Default categoryLinkSource to none, add `auto` option ([#495](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/495))
- Hide details marker ([#497](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/497))
- Set ignoreAdditionalProperties back to true ([#493](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/493))
- [UI Enhancement] Restyle tree lines ([#489](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/489))
- Update banner and badges

## 2.0.0-beta.1 (Mar 10, 2023)

High level enhancements

- Added sass loader to theme webpack config

Other enhancements and bug fixes

- Checkout v2.0.0 instead of main ([#486](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/486))
- Add sass loader to theme webpack config ([#484](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/484))
- Add canary support to v2 ([#485](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/485))

## 2.0.0-beta.0 (Mar 9, 2023)

High level enhancements

- Add support for Docusaurus 2.3.0 ([#471](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/471))
- [UI Enhancement] Move MethodEndpoint from ApiDemoPanel to left doc panel ([#429](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/429))
- [UI Enhancement] Migration to SCSS and BEM-style convention for theme components ([#450](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/450))
- [UI Enhancement] Include status code tabs in Response card ([#476](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/476))

Other enhancements and bug fixes

- Split beta release into separate script/workflow ([#480](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/480))
- Add bold, svg and ensure parity between opening/closing regex ([#479](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/479))
- Relax if statement ([#477](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/477))
- Add v2.0.0 branch to release workflows ([#475](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/475))

## 1.6.1 (Feb 28, 2023)

High level enhancements

- Add support for rendering additionalProperties schemas ([#465](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/465))
- Add response status class name to response tab item ([#461](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/461))
- Update usage docs ([#463](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/463))
- Allow "none" option for categoryLinkSource ([#462](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/462))
- Add code, thead and tbody to greaterThan regex ([#459](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/459))

Other enhancements and bug fixes

- Eval guard value as double not ([#468](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/468))
- Remove code tab test styling ([#469](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/469))

## 1.6.0 (Feb 24, 2023)

High level enhancements

- Add support for security vendor extensions ([#457](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/457))
- [Enhancement] Add option to hide send button ([#456](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/456))
- Lock supported docusaurus versions ([#449](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/449))
- Handle missing params/header schema ([#446](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/446))
- Apply docusaurus.io styles to demo ([#443](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/443))
- [FR] Added support for summary and description for param schema examples ([#406](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/406))

Other enhancements and bug fixes

- Avoid falling back to MOD label when rendering oneOf/anyOf and title not defined ([#455](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/455))
- Expand support for nullable objects and default to any for empty/unknown schemas ([#452](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/452))
- Fix security schemes ([#444](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/444))
- [bug] Use toString() utility to always convert example to string ([#442](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/442))
- Improve handling of non-string default values ([#436](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/436))
- Remove trailing slash in outputDir option if present ([#435](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/435))
- Fix: date-time examples should include time ([#427](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/427))
- Fix logo/darkLogo and colorMode synching ([#426](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/426))
- fix: fix logic that determines if an object property is required in response ([#424](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/424))
- Implement NodePolyfillPlugin in theme webpack config ([#422](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/422))
- revert `max-width` and `max-height` on code blocks in code tabs ([#417](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/417))
- Update sidebars.md ([#413](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/413))
- Clarify support for OpenAPI 3.0 ([#420](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/420))
- Add support for java and expand language variants ([#404](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/404))

## 1.5.2 (Feb 2, 2023)

High level enhancements

- Improved support for rendering items/arrays
- Fixed issue that prevented some schemas from fully-rendering ([#397](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/397))
- Added support for `nullable`

Other enhancements and bug fixes

- Cleanup API doc demos ([#400](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/400))
- [Bug] Support multiple same-level node types and improve items/array support ([#397](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/397))
- Bump ua-parser-js from 0.7.32 to 0.7.33 ([#395](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/395))
- Add support for nullable ([#393](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/393))
- Bump cookiejar from 2.1.3 to 2.1.4 ([#390](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/390))
- Update intro/README ([#384](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/384))
- Update a link in the credits ([#382](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/382))

## 1.5.1 (Jan 10, 2023)

High level enhancements

- Added support for x-webhooks extension
- Improvements to how Swagger 2.0 is upconverted to OpenAPI 3.0

Other enhancements and bug fixes

- [Bug] Refactor selective sanitization of > and < symbols in generated markdown descriptions ([#377](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/377))
- fix jsonSchemaMergeAllOf options in createRequestSchema ([#374](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/374))
- Add resolveInternal to swagger2openapi options ([#375](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/375))
- [Enhancement] Introduce support for webhooks extension ([#370](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/370))

## 1.5.0 (Dec 16, 2022)

High level enhancements

- Introduced proxy support
- Added support for rendering deprecated schema items/properties

Other enhancements and bug fixes

- Only create list of 2xx content types for request samples ([#365](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/365))
- [Enhancement] Add deprecated support to schema items ([#367](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/367))
- [Enhancement] Add proxy support ([#366](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/366))
- kebab case fix for info pages ([#363](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/363))
- Hide edit URL by default ([#364](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/364))
- Update index.ts ([#361](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/361))

## 1.4.7 (Dec 2, 2022)

High level enhancements

- Emergency patch to address regression bug introdudced by #351

Other enhancements and bug fixes

- Import markdown utils from lib ([#358](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/358))

## 1.4.6 (Dec 2, 2022)

High level enhancements

- Added support for swizzling `ApiItem` and `ApiDemoPanel` components!

Other enhancements and bug fixes

- Remove createProperties from items anyOneOf condition and add new condition for handling items.properties ([#356](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/356))
- [Enhancement] Allow whitespace in key/token/password input ([#354](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/354))
- [Bug] Respect readOnly/writeOnly when creating example from schema ([#353](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/353))
- [Bug] Import Body from @theme in makeRequest ([#352](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/352))
- [Experimental] Improve support for swizzling theme components ([#351](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/351))
- Bump loader-utils from 2.0.3 to 2.0.4 ([#346](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/346))

## 1.4.5 (Nov 15, 2022)

High level enhancements

- Bug fixes and polish
- Re-introduce missing `--openapi-input-background` variable to `styles.css`

Other enhancements and bug fixes

- [Bug] Add condition for handling arrays of discriminators ([#344](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/344))

## 1.4.4 (Nov 11, 2022)

High level enhancements

- Introduce Docusaurus v2.2.0 support

Other enhancements and bug fixes

- Include global tags and tag docs only if referenced by operation ([#340](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/340))
- [Bug] Handle double quotes in sidebar_label frontmatter ([#338](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/338))
- Fix error when allOf two refs ([#335](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/335))
- [Bug] Introduce Docusaurus v2.2.0 support ([#336](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/336))

## 1.4.3 (Nov 9, 2022)

High level enhancements

- Added support for Algolia DocSearch

Other enhancements and bug fixes

- Update posixPath to wrap path.join to fix backslash issue when buildi… ([#332](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/332))
- Add pointer events styling to Execute button for invalid requests ([#331](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/331))
- Add algolia config ([#328](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/328))

## 1.4.2 (Nov 4, 2022)

High level enhancements

- Bug fixes and polish

Other enhancements and bug fixes

- [Bug] Improve support for multiline descriptions in frontmatter ([#325](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/325))
- Use ResizeObserver to conditionally render SchemaTabs arrows ([#322](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/322))
- Check if plugin is array before accessing first index ([#321](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/321))
- Use find instead of include to match tags ([#320](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/320))
- [Cleanup]: Remove "lorem ipsum" instances and boilerplate docs ([#318](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/318))

## 1.4.1 (Oct 27, 2022)

High level enhancements

- SEO Improvements

Other enhancements and bug fixes

- [Bug] Support SSR for ApiItem ([#314](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/314))

## 1.4.0 (Oct 26, 2022)

High level enhancements

- Support for downloading OpenAPI specification file

Other enhancements and bug fixes

- [Bug] Wrap API docs in BrowserOnly ([#310](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/310))
- Extend regex to ignore <= and >= ([#309](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/309))
- [Enhancement] Introduce support for downloading OpenAPI spec ([#307](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/307))
- Update package.json

## 1.3.2 (Oct 19, 2022)

High level enhancements

- Bug fixes

Other enhancements and bug fixes

- [Bug] Use endsWith to match docsPluginId to preset ([#305](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/305))
- Wait for component to mount before calling setStringRawBody ([#304](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/304))

## 1.3.1 (Oct 18, 2022)

High level enhancements

- Various bug fixes and polish.

Other enhancements and bug fixes

- Disable warning when loading specs from directory ([#302](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/302))
- [Bug] Implement selective escape for sanitizing titles and descriptions ([#301](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/301))
- Return example if present when generating from schema ([#300](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/300))

## 1.3.0 (Oct 14, 2022)

High level enhancements

- [FR] Sync Content-Type/Accept with Request/Response ([#218](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/218))
- Generate API docs on build ([#290](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/290))
- [Enhancement] Add support for request examples ([#293](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/293))
- Add support for common params ([#292](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/292))

Other enhancements and bug fixes

- Switch from nowrap to pre ([#294](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/294))
- Update docs ([#288](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/288))

## 1.2.2 (Sep 30, 2022)

High level enhancements

- [Experimental] Move server input to request card ([#286](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/286))
- Manually bump to v1.2.1
- [Enhancement] Add support for rendering example `summary` as description ([#285](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/285))

## 1.2.1 (Sep 27, 2022)

High level enhancements

- Decrease opacity and for non-active schema/response tabs ([#281](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/pull/281))

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
