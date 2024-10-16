/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to match snapshot
     * @example cy.document().toMatchSnapshot()
     */
    toMatchSnapshot(
      name: string,
      options?: SnapshotOptions
    ): Chainable<Subject>;
  }
}
