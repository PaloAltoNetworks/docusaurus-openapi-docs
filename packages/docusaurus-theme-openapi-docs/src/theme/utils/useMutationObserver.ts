/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Vendored from @docusaurus/theme-common/src/hooks/useMutationObserver.ts (MIT)
 * to remove the dependency on @docusaurus/theme-common/internal.
 * See: https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useEffect } from "react";

import { useEvent, useShallowMemoObject } from "./reactUtils";

type Options = MutationObserverInit;

const DefaultOptions: Options = {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
};

export function useMutationObserver(
  target: Element | undefined | null,
  callback: MutationCallback,
  options: Options = DefaultOptions
): void {
  const stableCallback = useEvent(callback);
  const stableOptions: Options = useShallowMemoObject(options);

  useEffect(() => {
    const observer = new MutationObserver(stableCallback);
    if (target) {
      observer.observe(target, stableOptions);
    }
    return () => observer.disconnect();
  }, [target, stableCallback, stableOptions]);
}
