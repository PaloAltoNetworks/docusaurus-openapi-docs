/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Vendored subset of @docusaurus/theme-common/src/utils/scrollUtils.tsx (MIT)
 * to remove the dependency on @docusaurus/theme-common/internal. Only the
 * ScrollControllerProvider + useScrollPositionBlocker surface is kept, since
 * that's all our tab renderers need. The ScrollControllerProvider must be
 * mounted in the React tree above any consumer of useScrollPositionBlocker
 * (see ApiItem/index.tsx).
 * See: https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import useIsomorphicLayoutEffect from "@docusaurus/useIsomorphicLayoutEffect";

import { ReactContextError } from "./reactUtils";

type ScrollController = {
  scrollEventsEnabledRef: React.RefObject<boolean>;
  enableScrollEvents: () => void;
  disableScrollEvents: () => void;
};

function useScrollControllerContextValue(): ScrollController {
  const scrollEventsEnabledRef = useRef(true);

  return useMemo(
    () => ({
      scrollEventsEnabledRef,
      enableScrollEvents: () => {
        scrollEventsEnabledRef.current = true;
      },
      disableScrollEvents: () => {
        scrollEventsEnabledRef.current = false;
      },
    }),
    []
  );
}

const ScrollMonitorContext = React.createContext<ScrollController | undefined>(
  undefined
);

export function ScrollControllerProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const value = useScrollControllerContextValue();
  return (
    <ScrollMonitorContext.Provider value={value}>
      {children}
    </ScrollMonitorContext.Provider>
  );
}

function useScrollController(): ScrollController {
  const context = useContext(ScrollMonitorContext);
  if (context == null) {
    throw new ReactContextError("ScrollControllerProvider");
  }
  return context;
}

type UseScrollPositionSaver = {
  save: (elem: HTMLElement) => void;
  restore: () => { restored: boolean };
};

function useScrollPositionSaver(): UseScrollPositionSaver {
  const lastElementRef = useRef<{ elem: HTMLElement | null; top: number }>({
    elem: null,
    top: 0,
  });

  const save = useCallback((elem: HTMLElement) => {
    lastElementRef.current = {
      elem,
      top: elem.getBoundingClientRect().top,
    };
  }, []);

  const restore = useCallback(() => {
    const {
      current: { elem, top },
    } = lastElementRef;
    if (!elem) {
      return { restored: false };
    }
    const newTop = elem.getBoundingClientRect().top;
    const heightDiff = newTop - top;
    if (heightDiff) {
      window.scrollBy({ left: 0, top: heightDiff });
    }
    lastElementRef.current = { elem: null, top: 0 };

    return { restored: heightDiff !== 0 };
  }, []);

  return useMemo(() => ({ save, restore }), [restore, save]);
}

export function useScrollPositionBlocker(): {
  blockElementScrollPositionUntilNextRender: (el: HTMLElement) => void;
} {
  const scrollController = useScrollController();
  const scrollPositionSaver = useScrollPositionSaver();

  const nextLayoutEffectCallbackRef = useRef<(() => void) | undefined>(
    undefined
  );

  const blockElementScrollPositionUntilNextRender = useCallback(
    (el: HTMLElement) => {
      scrollPositionSaver.save(el);
      scrollController.disableScrollEvents();
      nextLayoutEffectCallbackRef.current = () => {
        const { restored } = scrollPositionSaver.restore();
        nextLayoutEffectCallbackRef.current = undefined;

        if (restored) {
          const handleScrollRestoreEvent = () => {
            scrollController.enableScrollEvents();
            window.removeEventListener("scroll", handleScrollRestoreEvent);
          };
          window.addEventListener("scroll", handleScrollRestoreEvent);
        } else {
          scrollController.enableScrollEvents();
        }
      };
    },
    [scrollController, scrollPositionSaver]
  );

  useIsomorphicLayoutEffect(() => {
    queueMicrotask(() => nextLayoutEffectCallbackRef.current?.());
  });

  return {
    blockElementScrollPositionUntilNextRender,
  };
}
