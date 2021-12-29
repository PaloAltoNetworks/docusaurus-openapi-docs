/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

describe("test", () => {
  it("loads Petstore page", () => {
    cy.visit("/petstore");
    navTo(
      [/pet/i, /add a new pet to the store/i],
      /add a new pet to the store/i
    );
  });

  it("loads Cloud Object Storage page", () => {
    cy.visit("/cos");
    navTo([], /generating an iam token/i);
  });

  it("loads Multi-spec page", () => {
    cy.visit("/multi-spec");
    navTo(
      [
        /foods/i,
        /burger store/i,
        /burger example/i,
        /^api$/i,
        /list all burgers/i,
      ],
      /list all burgers/i
    );
  });

  it("loads a page with authentication", () => {
    cy.visit("/cos/list-buckets");
    cy.findByRole("button", { name: /authorize/i }).should("exist");

    cy.visit("/cos/create-a-bucket");
    cy.findByRole("button", { name: /authorize/i }).should("exist");
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

  cy.findByRole("heading", { name: heading, level: 1 }).should("exist");
}
