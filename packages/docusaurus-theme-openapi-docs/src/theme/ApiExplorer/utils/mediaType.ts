/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

export function getMediaType(contentType?: string): string {
  return contentType?.split(";", 1)[0].trim().toLowerCase() ?? "";
}

export function getContentTypeHeader(contentType: string): string {
  if (getMediaType(contentType) !== "multipart/form-data") {
    return contentType;
  }

  // A quoted parameter may itself contain semicolons or escaped quotes.
  const parameters = contentType.match(/(?:[^;"]|"(?:\\.|[^"\\])*")+/g) ?? [];
  return parameters
    .filter(
      (parameter, index) => index === 0 || !/^\s*boundary\s*=/i.test(parameter)
    )
    .join(";");
}
