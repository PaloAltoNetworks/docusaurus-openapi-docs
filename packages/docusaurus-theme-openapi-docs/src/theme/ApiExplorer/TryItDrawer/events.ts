/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

export const TRY_IT_EVENT = "openapi:try-it";

export function openTryIt() {
  window.dispatchEvent(new CustomEvent(TRY_IT_EVENT));
}
