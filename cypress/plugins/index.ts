/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import { initPlugin } from "cypress-plugin-snapshots/plugin";

const plugins: Cypress.PluginConfig = (on, config) => {
  // Initialize cypress-plugin-snapshots
  initPlugin(on, config);

  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
};

export default plugins;
