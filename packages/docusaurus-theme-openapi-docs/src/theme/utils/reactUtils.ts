/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Vendored from @docusaurus/theme-common/src/utils/reactUtils.tsx (MIT).
 * Only useShallowMemoObject is kept here — it is not re-exported by
 * @docusaurus/theme-common (public or /internal). useEvent and
 * ReactContextError are public APIs imported directly from the package.
 * See: https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useMemo } from "react";

export function useShallowMemoObject<O extends object>(obj: O): O {
  const deps = Object.entries(obj);
  deps.sort((a, b) => a[0].localeCompare(b[0]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => obj, deps.flat());
}
