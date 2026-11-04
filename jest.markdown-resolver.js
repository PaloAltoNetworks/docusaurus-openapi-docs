/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

module.exports = (request, options) => {
  if (request === "unist-util-visit-parents/do-not-use-color") {
    return require.resolve(request, { paths: [options.basedir] });
  }
  return options.defaultResolver(request, options);
};
