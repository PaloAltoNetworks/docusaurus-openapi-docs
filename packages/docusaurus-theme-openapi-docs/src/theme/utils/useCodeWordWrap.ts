/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Vendored from @docusaurus/theme-common/src/hooks/useCodeWordWrap.ts (MIT)
 * to remove the dependency on @docusaurus/theme-common/internal.
 * See: https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useMutationObserver } from "./useMutationObserver";

// Callback fires when the "hidden" attribute of a tabpanel changes
// See https://github.com/facebook/docusaurus/pull/7485
function useTabBecameVisibleCallback(
  codeBlockRef: RefObject<HTMLPreElement | null>,
  callback: () => void
) {
  const [hiddenTabElement, setHiddenTabElement] = useState<
    Element | null | undefined
  >();

  const updateHiddenTabElement = useCallback(() => {
    setHiddenTabElement(
      codeBlockRef.current?.closest("[role=tabpanel][hidden]")
    );
  }, [codeBlockRef, setHiddenTabElement]);

  useEffect(() => {
    updateHiddenTabElement();
  }, [updateHiddenTabElement]);

  useMutationObserver(
    hiddenTabElement,
    (mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "hidden"
        ) {
          callback();
          updateHiddenTabElement();
        }
      });
    },
    {
      attributes: true,
      characterData: false,
      childList: false,
      subtree: false,
    }
  );
}

export type WordWrap = {
  readonly codeBlockRef: RefObject<HTMLPreElement | null>;
  readonly isEnabled: boolean;
  readonly isCodeScrollable: boolean;
  readonly toggle: () => void;
};

export function useCodeWordWrap(): WordWrap {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isCodeScrollable, setIsCodeScrollable] = useState<boolean>(false);
  const codeBlockRef = useRef<HTMLPreElement>(null);

  const toggle = useCallback(() => {
    const codeElement = codeBlockRef.current!.querySelector("code")!;

    if (isEnabled) {
      codeElement.removeAttribute("style");
    } else {
      codeElement.style.whiteSpace = "pre-wrap";
      codeElement.style.overflowWrap = "anywhere";
    }

    setIsEnabled((value) => !value);
  }, [codeBlockRef, isEnabled]);

  const updateCodeIsScrollable = useCallback(() => {
    const { scrollWidth, clientWidth } = codeBlockRef.current!;
    const isScrollable =
      scrollWidth > clientWidth ||
      codeBlockRef.current!.querySelector("code")!.hasAttribute("style");
    setIsCodeScrollable(isScrollable);
  }, [codeBlockRef]);

  useTabBecameVisibleCallback(codeBlockRef, updateCodeIsScrollable);

  useEffect(() => {
    updateCodeIsScrollable();
  }, [isEnabled, updateCodeIsScrollable]);

  useEffect(() => {
    window.addEventListener("resize", updateCodeIsScrollable, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", updateCodeIsScrollable);
    };
  }, [updateCodeIsScrollable]);

  return { codeBlockRef, isEnabled, isCodeScrollable, toggle };
}
