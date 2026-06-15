/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Swizzled from @docusaurus/theme-classic/src/theme/Tabs/index.tsx (MIT).
 * Re-points the internal hooks (useTabs, useTabsContextValue, etc.) to our
 * vendored tabsUtils so that the entire <Tabs>/<TabItem> pair runs through a
 * single React context owned by this package. See:
 * https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { type ReactNode } from "react";

import { ThemeClassNames } from "@docusaurus/theme-common";
import useIsBrowser from "@docusaurus/useIsBrowser";
import clsx from "clsx";

import { useScrollPositionBlocker } from "../../utils/scrollUtils";
import {
  sanitizeTabsChildren,
  type TabsProps,
  TabsProvider,
  useTabs,
  useTabsContextValue,
} from "../../utils/tabsUtils";
import styles from "./styles.module.css";

type Props = TabsProps;

function TabList({ className }: { className?: string }) {
  const { selectedValue, selectValue, tabValues, block } = useTabs();

  const tabRefs: (HTMLLIElement | null)[] = [];
  const { blockElementScrollPositionUntilNextRender } =
    useScrollPositionBlocker();

  const handleTabChange = (
    event:
      | React.FocusEvent<HTMLLIElement>
      | React.MouseEvent<HTMLLIElement>
      | React.KeyboardEvent<HTMLLIElement>
  ) => {
    const newTab = event.currentTarget;
    const newTabIndex = tabRefs.indexOf(newTab);
    const newTabValue = tabValues[newTabIndex]!.value;

    if (newTabValue !== selectedValue) {
      blockElementScrollPositionUntilNextRender(newTab);
      selectValue(newTabValue);
    }
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    let focusElement: HTMLLIElement | null = null;

    switch (event.key) {
      case "Enter": {
        handleTabChange(event);
        break;
      }
      case "ArrowRight": {
        const nextTab = tabRefs.indexOf(event.currentTarget) + 1;
        focusElement = tabRefs[nextTab] ?? tabRefs[0]!;
        break;
      }
      case "ArrowLeft": {
        const prevTab = tabRefs.indexOf(event.currentTarget) - 1;
        focusElement = tabRefs[prevTab] ?? tabRefs[tabRefs.length - 1]!;
        break;
      }
      default:
        break;
    }

    focusElement?.focus();
  };

  return (
    <ul
      role="tablist"
      aria-orientation="horizontal"
      className={clsx(
        "tabs",
        {
          "tabs--block": block,
        },
        className
      )}
    >
      {tabValues.map(({ value, label, attributes }) => (
        <li
          // TODO extract TabListItem
          role="tab"
          tabIndex={selectedValue === value ? 0 : -1}
          aria-selected={selectedValue === value}
          key={value}
          ref={(ref) => {
            tabRefs.push(ref);
          }}
          onKeyDown={handleKeydown}
          onClick={handleTabChange}
          {...attributes}
          className={clsx(
            "tabs__item",
            styles.tabItem,
            attributes?.className as string,
            {
              "tabs__item--active": selectedValue === value,
            }
          )}
        >
          {label ?? value}
        </li>
      ))}
    </ul>
  );
}

function TabContent({ children }: { children: ReactNode }) {
  return <div className="margin-top--md">{children}</div>;
}

function TabsContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div
      className={clsx(
        ThemeClassNames.tabs.container,
        // former name kept for backward compatibility
        // see https://github.com/facebook/docusaurus/pull/4086
        "tabs-container",
        styles.tabList
      )}
    >
      <TabList className={className} />
      <TabContent>{children}</TabContent>
    </div>
  );
}

export default function Tabs(props: Props): ReactNode {
  const isBrowser = useIsBrowser();
  const value = useTabsContextValue(props);
  return (
    <TabsProvider
      value={value}
      // Remount tabs after hydration
      // Temporary fix for https://github.com/facebook/docusaurus/issues/5653
      key={String(isBrowser)}
    >
      <TabsContainer className={props.className}>
        {sanitizeTabsChildren(props.children)}
      </TabsContainer>
    </TabsProvider>
  );
}
