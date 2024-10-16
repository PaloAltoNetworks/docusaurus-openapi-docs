/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

describe("Schema Snapshots", () => {
  const urls = [
    "https://docusaurus-openapi.tryingpan.dev/tests/all-of-with-array-items",
    "https://docusaurus-openapi.tryingpan.dev/tests/all-of-with-deep-merging",
    "https://docusaurus-openapi.tryingpan.dev/tests/all-of-with-nested-all-of",
    "https://docusaurus-openapi.tryingpan.dev/tests/all-of-with-same-level-properties",
    "https://docusaurus-openapi.tryingpan.dev/tests/all-of-with-shared-required-properties",
    "https://docusaurus-openapi.tryingpan.dev/tests/any-of-with-one-of",
    "https://docusaurus-openapi.tryingpan.dev/tests/any-of-with-primitives",
    "https://docusaurus-openapi.tryingpan.dev/tests/basic-discriminator-with-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/basic-discriminator-without-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/discriminator-with-all-of-and-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/discriminator-with-all-of-without-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/discriminator-with-nested-schemas-and-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/discriminator-with-nested-schemas-without-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/discriminator-with-required-properties-and-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/discriminator-with-required-properties-without-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/discriminator-with-shared-properties-and-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/discriminator-with-shared-properties-without-mapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/get-entities-by-multiple-status",
    "https://docusaurus-openapi.tryingpan.dev/tests/get-entities-by-status",
    "https://docusaurus-openapi.tryingpan.dev/tests/multiple-all-of-with-nested-properties",
    "https://docusaurus-openapi.tryingpan.dev/tests/one-of-with-complex-types",
    "https://docusaurus-openapi.tryingpan.dev/tests/one-of-with-nested-one-of",
    "https://docusaurus-openapi.tryingpan.dev/tests/one-of-with-primitive-types",
    "https://docusaurus-openapi.tryingpan.dev/tests/one-of-with-required-properties",
    "https://docusaurus-openapi.tryingpan.dev/tests/one-of-with-shared-properties",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/additionalbookinfo",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/baseallof",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/baseallofmapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/basebasic",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/basebasicmapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/basenested",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/basenestedmapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/baserequired",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/baserequiredmapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/baseshared",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/basesharedmapping",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/book",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/bookbase",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/enumdescriptionsentity",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/existingschema-1",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/existingschema-2",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/nestedtypea",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/nestedtypeb",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/typea",
    "https://docusaurus-openapi.tryingpan.dev/tests/schemas/typeb",
  ];

  urls.forEach((url) => {
    const pageName = url.split("/").pop(); // Extract the page name from the URL
    it(`should match the snapshot for ${pageName}`, () => {
      cy.visit(url);
      // Pause the test to inspect the state of the DOM
      cy.pause();
      // Wait for the container to be visible and then snapshot it
      cy.get(".theme-api-markdown", { timeout: 10000 })
        .should("be.visible")
        .toMatchSnapshot(pageName!);
    });
  });
});
