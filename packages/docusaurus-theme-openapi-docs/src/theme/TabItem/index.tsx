/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Swizzled from @docusaurus/theme-classic/src/theme/TabItem/index.tsx (MIT).
 * Re-points useTabs to our vendored tabsUtils so that <TabItem> reads the same
 * context our swizzled <Tabs> and OpenAPI tab variants (ApiTabs, MimeTabs,
 * SchemaTabs, etc.) provide. See:
 * https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { type ReactNode } from "react";

import clsx from "clsx";

import { type TabItemProps, useTabs } from "../../utils/tabsUtils";

type Props = TabItemProps;
import styles from "./styles.module.css";

function TabItemPanel({
  children,
  className,
  hidden,
}: {
  children: ReactNode;
  className?: string;
  hidden?: boolean;
}) {
  return (
    <div
      role="tabpanel"
      className={clsx(styles.tabItem, className)}
      {...{ hidden }}
    >
      {children}
    </div>
  );
}

export default function TabItem({
  children,
  className,
  value,
}: Props): ReactNode {
  const { selectedValue, lazy } = useTabs();
  const isSelected = value === selectedValue;

  if (!isSelected && lazy) {
    return null;
  }

  return (
    <TabItemPanel className={className} hidden={!isSelected}>
      {children}
    </TabItemPanel>
  );
}
