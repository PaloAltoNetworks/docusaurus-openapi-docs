/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/* eslint-disable import/no-extraneous-dependencies -- Declared by the theme workspace. */

const React = require("react");

module.exports = ({ summary, children }) =>
  React.createElement(React.Fragment, null, summary, children);
