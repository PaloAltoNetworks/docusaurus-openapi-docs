/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { clean, MarkdownParser } from "./utils";

export function createDescription(
  description: string | undefined,
  parseMarkdown?: MarkdownParser
) {
  return `\n\n${clean(description, parseMarkdown)}\n\n`;
}
