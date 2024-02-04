/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { cloneElement } from "react";

import {
  useScrollPositionBlocker,
  useTabs,
} from "@docusaurus/theme-common/internal";
import useIsBrowser from "@docusaurus/useIsBrowser";
import clsx from "clsx";

function TabList({
  action,
  currentLanguage,
  languageSet,
  includeVariant,
  includeSample,
  className,
  block,
  selectedValue,
  selectValue,
  tabValues,
}) {
  const tabRefs = [];
  const { blockElementScrollPositionUntilNextRender } =
    useScrollPositionBlocker();

  const handleTabChange = (event) => {
    const newTab = event.currentTarget;
    const newTabIndex = tabRefs.indexOf(newTab);
    const newTabValue = tabValues[newTabIndex].value;

    if (newTabValue !== selectedValue) {
      blockElementScrollPositionUntilNextRender(newTab);
      selectValue(newTabValue);
    }

    if (action) {
      let newLanguage;
      if (currentLanguage && includeVariant) {
        newLanguage = languageSet.filter(
          (lang) => lang.language === currentLanguage
        )[0];
        newLanguage.variant = newTabValue;
        action.setSelectedVariant(newTabValue.toLowerCase());
      } else if (currentLanguage && includeSample) {
        newLanguage = languageSet.filter(
          (lang) => lang.language === currentLanguage
        )[0];
        newLanguage.sample = newTabValue;
        action.setSelectedSample(newTabValue);
      } else {
        newLanguage = languageSet.filter(
          (lang) => lang.language === newTabValue
        )[0];
        action.setSelectedVariant(newLanguage.variant.toLowerCase());
        action.setSelectedSample(newLanguage.sample);
      }

      action.setLanguage(newLanguage);
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
    <ul
      role="tablist"
      aria-orientation="horizontal"
      className={clsx(
        "tabs",
        "openapi-tabs__code-list-container",
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
            "openapi-tabs__code-item",
            attributes?.className,
            {
              active: selectedValue === value,
            }
          )}
        >
          <span>{label ?? value}</span>
        </li>
      ))}
    </ul>
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
    <div className="margin-top--md openapi-tabs__code-content">
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
  const { className } = props;

  return (
    <div
      className={clsx("tabs-container openapi-tabs__code-container", {
        [className]: className,
      })}
    >
      <TabList {...props} {...tabs} />
      <TabContent {...props} {...tabs} />
    </div>
  );
}

export default function CodeTabs(props) {
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
