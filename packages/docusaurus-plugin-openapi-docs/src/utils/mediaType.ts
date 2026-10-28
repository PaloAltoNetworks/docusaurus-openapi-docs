/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

export function getMediaType(contentType?: string): string {
  return contentType?.split(";", 1)[0].trim().toLowerCase() ?? "";
}
