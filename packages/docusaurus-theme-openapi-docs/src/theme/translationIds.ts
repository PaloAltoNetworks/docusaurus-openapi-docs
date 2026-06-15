/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/*
 * The central dictionary of translation-id constants that used to live here
 * (OPENAPI_REQUEST, OPENAPI_SCHEMA_ITEM, ...) has been removed. Each
 * `translate({ id, message })` / `<Translate id="...">` call site now passes
 * its id as an inline string literal instead.
 *
 * WHY THE DICTIONARY WAS REMOVED
 * ------------------------------
 * `docusaurus write-translations` only performs STATIC analysis of the source
 * code (via @docusaurus/babel) — it never runs the site. To collect a string
 * it evaluates the argument of every `translate()` / `<Translate>` call with
 * Babel's `path.evaluate()` and keeps it only when the result is `confident`.
 *
 * An id referenced through an imported constant, e.g.
 *
 *     import { OPENAPI_REQUEST } from "@theme/translationIds";
 *     translate({ id: OPENAPI_REQUEST.COLLAPSE_ALL, message: "Collapse all" });
 *
 * is a member expression on a binding imported from another module. Babel
 * cannot statically resolve a cross-module binding, so `evaluate()` returns
 * `confident === false`, the extractor skips the call (emitting a warning), and
 * NOTHING is written to the locale `code.json`. As a result `write-translations`
 * produced an empty template and downstream projects had no ids to translate,
 * even though the strings rendered fine at runtime (the inlined constant value
 * matched the runtime lookup key).
 *
 * The id and message must therefore be static string literals AT THE CALL SITE.
 * This is the approach Docusaurus' own theme-classic uses and what its i18n
 * guide mandates ("Text labels must be static"):
 *
 *   - https://docusaurus.io/docs/i18n/tutorial#translate-your-react-code
 *   - https://docusaurus.io/docs/docusaurus-core#translate
 *
 * Keep this note here so the removal of the constants is discoverable; do not
 * reintroduce a shared id dictionary for `translate()` arguments.
 */

export {};
