/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// CJS stub for @apidevtools/json-schema-ref-parser (ESM-only in v15+).
// Returns the input unchanged — sufficient for tests using inline specs
// without $ref pointers.
const $RefParser = {
  dereference: async (input) => input,
};

module.exports = $RefParser;
module.exports.default = $RefParser;
