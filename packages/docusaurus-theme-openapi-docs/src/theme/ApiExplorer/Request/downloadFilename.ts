/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { parse } from "content-disposition";

/** Get the suggested download filename without directory components. */
export function getDownloadFilename(
  header: string | null,
  fallback: string
): string {
  if (!header) return fallback;
  try {
    const filename = parse(header).parameters.filename;
    // eslint-disable-next-line no-control-regex
    if (!filename || /[\u0000-\u001f\u007f]/.test(filename)) return fallback;
    const basename = filename.split(/[\\/]/).pop()?.trim();
    return basename && basename !== "." && basename !== ".."
      ? basename
      : fallback;
  } catch {
    return fallback;
  }
}
