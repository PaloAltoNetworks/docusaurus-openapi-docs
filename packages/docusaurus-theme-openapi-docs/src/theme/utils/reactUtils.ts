/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Vendored subset of @docusaurus/theme-common/src/utils/reactUtils.tsx (MIT)
 * to remove the dependency on @docusaurus/theme-common/internal, which is
 * scheduled for removal in Docusaurus v4.
 * See: https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useCallback, useMemo, useRef } from "react";

import useIsomorphicLayoutEffect from "@docusaurus/useIsomorphicLayoutEffect";

export function useEvent<T extends (...args: never[]) => unknown>(
  callback: T
): T {
  const ref = useRef<T>(callback);

  useIsomorphicLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);

  // @ts-expect-error: TS is right that this callback may be a supertype of T,
  // but good enough for our use
  return useCallback<T>((...args) => ref.current(...args), []);
}

export function useShallowMemoObject<O extends object>(obj: O): O {
  const deps = Object.entries(obj);
  deps.sort((a, b) => a[0].localeCompare(b[0]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => obj, deps.flat());
}

export class ReactContextError extends Error {
  constructor(providerName: string, additionalInfo?: string) {
    super();
    this.name = "ReactContextError";
    this.message = `Hook ${
      this.stack?.split("\n")[1]?.match(/at (?:\w+\.)?(?<name>\w+)/)?.groups!
        .name ?? ""
    } is called outside the <${providerName}>. ${additionalInfo ?? ""}`;
  }
}
