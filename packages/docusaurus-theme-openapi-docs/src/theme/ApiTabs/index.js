/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { cloneElement, useRef, useState, useEffect } from "react";

import {
  useScrollPositionBlocker,
  useTabs,
} from "@docusaurus/theme-common/internal";
import useIsBrowser from "@docusaurus/useIsBrowser";
import clsx from "clsx";

import styles from "./styles.module.css";

function TabList({ className, block, selectedValue, selectValue, tabValues }) {
  const tabRefs = [];
  const { blockElementScrollPositionUntilNextRender } =
    useScrollPositionBlocker();

  const tabItemListContainerRef = useRef(null);
  const [showTabArrows, setShowTabArrows] = useState(false);

  useEffect(() => {
    const tabOffsetWidth = tabItemListContainerRef.current.offsetWidth;
    const tabScrollWidth = tabItemListContainerRef.current.scrollWidth;

    if (tabOffsetWidth < tabScrollWidth) {
      setShowTabArrows(true);
    }
  }, []);
  const handleRightClick = () => {
    tabItemListContainerRef.current.scrollLeft += 90;
  };

  const handleLeftClick = () => {
    tabItemListContainerRef.current.scrollLeft -= 90;
  };

  const handleTabChange = (event) => {
    const newTab = event.currentTarget;
    const newTabIndex = tabRefs.indexOf(newTab);
    const newTabValue = tabValues[newTabIndex].value;
    if (newTabValue !== selectedValue) {
      blockElementScrollPositionUntilNextRender(newTab);
      selectValue(newTabValue);
    }
  };
  const handleKeydown = (event) => {
    let focusElement = null;
    switch (event.key) {
      case "Enter": {
        handleTabChange(event);
        break;
      }
      case "ArrowRight": {
        const nextTab = tabRefs.indexOf(event.currentTarget) + 1;
        focusElement = tabRefs[nextTab] ?? tabRefs[0];
        break;
      }
      case "ArrowLeft": {
        const prevTab = tabRefs.indexOf(event.currentTarget) - 1;
        focusElement = tabRefs[prevTab] ?? tabRefs[tabRefs.length - 1];
        break;
      }
      default:
        break;
    }
    focusElement?.focus();
  };
  return (
    <div className={styles.responseTabsTopSection}>
      <strong>Responses</strong>
      <div className={styles.responseTabsContainer}>
        {showTabArrows && (
          <button
            className={clsx(styles.tabArrow, styles.tabArrowLeft)}
            onClick={handleLeftClick}
          />
        )}
        <ul
          ref={tabItemListContainerRef}
          role="tablist"
          aria-orientation="horizontal"
          className={clsx(
            styles.responseTabsListContainer,
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
              ref={(tabControl) => tabRefs.push(tabControl)}
              onKeyDown={handleKeydown}
              onClick={handleTabChange}
              {...attributes}
              className={clsx(
                "tabs__item",
                "openapi-tabs__response-code-item",
                attributes?.className,
                parseInt(value) >= 400
                  ? styles.responseStatusDanger
                  : parseInt(value) >= 200 && parseInt(value) < 300
                  ? styles.responseStatusSuccess
                  : styles.responseStatusInfo,
                {
                  "openapi-tabs__response-code-item--active":
                    selectedValue === value,
                }
              )}
            >
              <div className={styles.responseTabDot} />
              {label ?? value}
            </li>
          ))}
        </ul>
        {showTabArrows && (
          <button
            className={clsx(styles.tabArrow, styles.tabArrowRight)}
            onClick={handleRightClick}
          />
        )}
      </div>
    </div>
  );
}
function TabContent({ lazy, children, selectedValue }) {
  // eslint-disable-next-line no-param-reassign
  children = Array.isArray(children) ? children : [children];
  if (lazy) {
    const selectedTabItem = children.find(
      (tabItem) => tabItem.props.value === selectedValue
    );
    if (!selectedTabItem) {
      // fail-safe or fail-fast? not sure what's best here
      return null;
    }
    return cloneElement(selectedTabItem, { className: "margin-top--md" });
  }
  return (
    <div className="margin-top--md">
      {children.map((tabItem, i) =>
        cloneElement(tabItem, {
          key: i,
          hidden: tabItem.props.value !== selectedValue,
        })
      )}
    </div>
  );
}
function TabsComponent(props) {
  const tabs = useTabs(props);
  return (
    <div className={clsx("tabs-container", styles.tabList)}>
      <TabList {...props} {...tabs} />
      <hr />
      <TabContent {...props} {...tabs} />
    </div>
  );
}
export default function ApiTabs(props) {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent
      // Remount tabs after hydration
      // Temporary fix for https://github.com/facebook/docusaurus/issues/5653
      key={String(isBrowser)}
      {...props}
    />
  );
}
