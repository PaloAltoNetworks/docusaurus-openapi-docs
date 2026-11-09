/* ============================================================================
 * Demo-only layout state shared by the navbar picker and the theme.
 * Persists the choice in localStorage under 'openapi-demo-layout'.
 * ========================================================================== */

import React, { createContext, useContext, useEffect, useState } from "react";

import {
  ApiLayoutContext,
  type ApiLayout,
} from "@theme/ApiExplorer/useApiLayout";

const STORAGE_KEY = "openapi-demo-layout";

type DemoLayoutState = [ApiLayout | undefined, (layout: ApiLayout) => void];

const DemoLayoutContext = createContext<DemoLayoutState>([undefined, () => {}]);
const PageLayoutContext = createContext<
  [ApiLayout | undefined, (layout: ApiLayout | undefined) => void]
>([undefined, () => {}]);

export function DemoLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [layout, setLayoutState] = useState<ApiLayout | undefined>();
  const [pageLayout, setPageLayout] = useState<ApiLayout | undefined>();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "classic" || saved === "modern") setLayoutState(saved);
  }, []);

  const setLayout = (next: ApiLayout) => {
    setLayoutState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <DemoLayoutContext.Provider value={[layout, setLayout]}>
      <PageLayoutContext.Provider value={[pageLayout, setPageLayout]}>
        <ApiLayoutContext.Provider value={layout}>
          {children}
        </ApiLayoutContext.Provider>
      </PageLayoutContext.Provider>
    </DemoLayoutContext.Provider>
  );
}

export function useDemoLayout(): DemoLayoutState {
  return useContext(DemoLayoutContext);
}

/** The `api_layout` front matter of the current API page, if any. */
export function usePageLayout(): ApiLayout | undefined {
  return useContext(PageLayoutContext)[0];
}

export function useReportPageLayout(layout: ApiLayout | undefined): void {
  const setPageLayout = useContext(PageLayoutContext)[1];
  useEffect(() => {
    setPageLayout(layout);
    return () => setPageLayout(undefined);
  }, [layout, setPageLayout]);
}
