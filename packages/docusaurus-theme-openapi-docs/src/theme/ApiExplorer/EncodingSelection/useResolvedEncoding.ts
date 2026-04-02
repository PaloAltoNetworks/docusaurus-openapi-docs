/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useTypedSelector } from "@theme/ApiItem/hooks";
import type { RequestBodyObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";

/**
 * Merges the spec-declared `encoding` for the active content type with any
 * per-field content-type selections the user has made in the UI.  User picks
 * take precedence over the spec default.
 *
 * Returns `undefined` when no encoding is declared for the current content
 * type so callers can skip the encoding path entirely.
 */
export function useResolvedEncoding(
  requestBody: RequestBodyObject | undefined
): Record<string, { contentType?: string }> | undefined {
  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const encodingSelection = useTypedSelector(
    (state: any) => state.encodingSelection
  );

  const specEncoding: Record<string, { contentType?: string }> =
    requestBody?.content?.[contentType]?.encoding ?? {};

  if (!Object.keys(specEncoding).length) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(specEncoding).map(([field, enc]) => [
      field,
      {
        ...enc,
        contentType: encodingSelection[field] ?? enc.contentType,
      },
    ])
  );
}
