/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import presetClassic from "@docusaurus/preset-classic";
import type { Preset, LoadContext, PluginOptions } from "@docusaurus/types";
import type { Options } from "@paloaltonetworks/docusaurus-preset-openapi";

function makePluginConfig(
  source: string,
  options?: PluginOptions
): string | [string, PluginOptions] {
  if (options) {
    return [require.resolve(source), options];
  }
  return require.resolve(source);
}

export default function preset(
  context: LoadContext,
  options: Options = {}
): Preset {
  const { proxy, api, ...rest } = options;

  const { themes = [], plugins = [] } = presetClassic(context, rest);

  themes.push(makePluginConfig("@paloaltonetworks/docusaurus-theme-openapi"));

  if (api !== false) {
    plugins.push(
      makePluginConfig("@paloaltonetworks/docusaurus-plugin-openapi", api)
    );
  }

  if (proxy !== false) {
    plugins.push(
      makePluginConfig("@paloaltonetworks/docusaurus-plugin-proxy", proxy)
    );
  }

  return { themes, plugins };
}
