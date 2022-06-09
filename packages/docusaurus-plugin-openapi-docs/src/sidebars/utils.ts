/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { render } from "mustache";

export default function generateDropdownHtml(versions: object[]) {
  const template = `<div class="dropdown dropdown--hoverable dropdown--right">
  <button class="button button--block button--sm button--secondary">Select API Version</button>
  <ul class="dropdown__menu">
    {{#.}}<li><a class="dropdown__link" href="{{{baseUrl}}}">{{{label}}}</a></li>{{/.}}
  </ul>
</div>
      `;
  const view = render(template, versions);
  return view;
}
