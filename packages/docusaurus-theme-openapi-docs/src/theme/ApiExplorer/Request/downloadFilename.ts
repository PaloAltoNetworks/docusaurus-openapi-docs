/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/** Whether the response asks the browser to download its body. */
export function isAttachment(header: string | null): boolean {
  return /^\s*attachment\s*(?:;|$)/i.test(header ?? "");
}

function decodeExtendedFilename(value: string): string | undefined {
  const match = /^([^']+)'[^']*'((?:%[\da-f]{2}|[\w!#$&+.^`|~-])*)$/i.exec(
    value
  );
  if (!match) return undefined;
  const [, charset, encoded] = match;
  try {
    if (charset.toLowerCase() === "utf-8") return decodeURIComponent(encoded);
    if (charset.toLowerCase() === "iso-8859-1") {
      return encoded.replace(/%([\da-f]{2})/gi, (_, byte) =>
        String.fromCharCode(parseInt(byte, 16))
      );
    }
  } catch {
    // An invalid extended value must not hide a usable plain filename.
  }
  return undefined;
}

/** Get the suggested download filename without directory components. */
export function getDownloadFilename(
  header: string | null,
  fallback: string,
  extension = ""
): string {
  if (!header) return fallback;
  const type = /^\s*[\w!#$%&'*+.^`|~-]+\s*(?=;|$)/.exec(header);
  if (!type) return fallback;

  // Match complete parameters so semicolons inside quoted values stay local.
  const parameter =
    /;\s*([\w!#$%&'*+.^`|~-]+)\s*=\s*("(?:[^"\\\r\n]|\\[^\r\n])*"|[\w!#$%&'*+.^`|~-]+)\s*/gy;
  const values = new Map<string, string>();
  let index = type[0].length;
  while (index < header.length) {
    parameter.lastIndex = index;
    const match = parameter.exec(header);
    if (!match) return fallback;
    const key = match[1].toLowerCase();
    if (values.has(key)) return fallback;
    const value = match[2];
    values.set(
      key,
      value.startsWith('"') ? value.slice(1, -1).replace(/\\(.)/g, "$1") : value
    );
    index = parameter.lastIndex;
  }

  const filename =
    decodeExtendedFilename(values.get("filename*") ?? "") ??
    values.get("filename");
  // eslint-disable-next-line no-control-regex
  if (!filename || /[\u0000-\u001f\u007f]/.test(filename)) return fallback;
  const basename = filename
    .replace(/\p{Cf}/gu, "")
    .split(/[\\/]/)
    .pop()
    ?.trim();
  if (!basename || basename === "." || basename === "..") return fallback;
  return /\.[^.]+$/.test(basename) ? basename : basename + extension;
}
