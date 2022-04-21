/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

describe("test", () => {
  it("loads Petstore page", () => {
    cy.viewport("macbook-15");
    cy.visit("/api/petstore/add-a-new-pet-to-the-store");
    navTo(
      [/^petstore$/i, /update an existing pet/i],
      /update an existing pet/i
    );
  });
});

/**
 * Navigate to page using the sidebar
 */
function navTo(links: RegExp[], heading: RegExp) {
  cy.on("uncaught:exception", () => {
    // there is an uncaught error trying to load monaco in ci
    return false;
  });

  for (let link of links) {
    cy.get("nav.menu")
      .findByRole("link", { name: link })
      .click({ force: true }); // sometimes the sidebar items get covered by the navbar in CI.
  }

  cy.findByRole("heading", { name: heading, level: 2 }).should("exist");
}
