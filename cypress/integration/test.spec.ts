/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

describe("test", () => {
  before(() => {
    cy.visit("/api");
  });

  it("renders query parameters", () => {
    cy.findByText(/query parameters/i).should("exist");
  });
});
