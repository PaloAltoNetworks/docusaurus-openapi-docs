/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

describe("test", () => {
  before(() => {
    cy.visit("/api/recursive");
  });

  it("renders query parameters", () => {
    cy.findByText(/query parameters/i).should("exist");
  });

  it("loads issue 21 tab", () => {
    checkTab(/issue 21/i, [], /missing summary/i);
  });

  it("loads cos tab", () => {
    checkTab(/cos/i, [], /generating an iam token/i);
  });

  it("loads yaml tab", () => {
    checkTab(/yaml/i, [/api/i, /hello world/i], /hello world/i);
  });

  it("loads petstore tab", () => {
    checkTab(
      /petstore/i,
      [/pet/i, /add a new pet to the store/i],
      /add a new pet to the store/i
    );
  });

  it("loads api tab", () => {
    checkTab(/api/i, [/^pet$/i, /recursive/i], /recursive/i);
  });

  it("loads a page with authentication", () => {
    cy.visit("/cos/list-buckets");
    cy.findByRole("button", { name: /authorize/i }).should("exist");

    cy.visit("/cos/create-a-bucket");
    cy.findByRole("button", { name: /authorize/i }).should("exist");
  });
});

function checkTab(tab: RegExp, links: RegExp[], heading: RegExp) {
  cy.on("uncaught:exception", () => {
    // there is an uncaught error trying to load monaco in ci
    return false;
  });

  cy.get(".navbar").findByRole("link", { name: tab }).click();

  for (let link of links) {
    cy.get("nav.menu")
      .findByRole("link", { name: link })
      .click({ force: true }); // sometimes the sidebar items get covered by the navbar in CI.
  }

  cy.findByRole("heading", { name: heading, level: 1 }).should("exist");
}
