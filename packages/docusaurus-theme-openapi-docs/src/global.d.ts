// Global declaration for Docusaurus theme-common/internal for TS tests
import * as React from "react";
declare module "@docusaurus/theme-common/internal" {
  export interface TabListProps {
    label: string;
    id: string;
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const sanitizeTabsChildren: (children: any) => any;
  export const useTabs: () => any;
  export type TabProps = any;
}
