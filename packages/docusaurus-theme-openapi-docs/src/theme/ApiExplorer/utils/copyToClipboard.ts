/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

export async function copyToClipboard(text: string): Promise<boolean> {
  // The clipboard API is only defined in secure contexts (HTTPS / localhost).
  // See https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy fallback, for example when permission is denied.
    }
  }
  // Fall back to copy-text-to-clipboard for non-secure contexts (e.g. HTTP
  // on a local network). The fallback is lazily loaded to avoid bundle
  // overhead for the common HTTPS case.
  const { default: copy } = await import("copy-text-to-clipboard");
  return copy(text);
}
