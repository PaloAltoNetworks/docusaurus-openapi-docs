/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// CJS stub for @redocly/openapi-core (ESM-only).
// For inline specs (doc provided), returns them unchanged.
// For file refs, reads and parses the YAML/JSON from disk.
const fs = require("fs");
const yaml = require("yaml");

module.exports = {
  createConfig: async () => ({}),
  bundle: async (opts) => {
    if (opts.doc) {
      return { bundle: { parsed: opts.doc.parsed } };
    }
    if (opts.ref) {
      const content = fs.readFileSync(opts.ref, "utf8");
      const parsed = opts.ref.endsWith(".json")
        ? JSON.parse(content)
        : yaml.parse(content);
      return { bundle: { parsed } };
    }
    return { bundle: { parsed: {} } };
  },
};
