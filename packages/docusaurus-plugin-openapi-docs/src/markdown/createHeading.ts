/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { create } from "./utils";

export function createHeading(heading: string) {
  return [
    create("h1", {
      className: "openapi__heading",
      children: `${heading}`,
    }),
    `\n\n`,
  ];
}
