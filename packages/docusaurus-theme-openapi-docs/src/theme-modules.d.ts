declare module "@theme/ApiTabs" {
  const ApiTabs: React.FC<any>;
  export default ApiTabs;
}
declare module "@theme/Details" {
  const Details: React.FC<any>;
  export default Details;
}
declare module "@docusaurus/theme-common/internal" {
  import * as React from "react";
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
declare module "@theme/Markdown" {
  const Markdown: React.FC<any>;
  export default Markdown;
}
declare module "@theme/ResponseHeaders" {
  const ResponseHeaders: React.FC<any>;
  export default ResponseHeaders;
}
declare module "@theme/ResponseSchema" {
  const ResponseSchema: React.FC<any>;
  export default ResponseSchema;
}
declare module "@theme/TabItem" {
  declare module "@docusaurus/plugin-content-docs/client";
  declare module "@theme/ApiExplorer/Authorization/slice";
  declare module "@theme/ApiExplorer/persistanceMiddleware";
  declare module "@theme/ApiItem/Layout";
  declare module "@theme/SkeletonLoader";
  declare module "@docusaurus/theme-common/internal";

  import * as React from "react";
  interface TabItemProps {
    value: string;
    label: string;
    children?: React.ReactNode;
  }
  const TabItem: React.FC<TabItemProps>;
  export default TabItem;
}
