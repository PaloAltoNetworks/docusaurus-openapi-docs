/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

describe("test", () => {
  it("loads Petstore index page", () => {
    cy.viewport("macbook-15");
    cy.visit("/petstore/swagger-petstore-yaml");
  });
});
