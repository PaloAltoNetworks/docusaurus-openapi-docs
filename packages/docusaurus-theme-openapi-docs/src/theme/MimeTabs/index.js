/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { cloneElement, useEffect, useState, useRef } from "react";

import {
  useScrollPositionBlocker,
  useTabs,
} from "@docusaurus/theme-common/internal";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { setAccept } from "@theme/ApiExplorer/Accept/slice";
import { setContentType } from "@theme/ApiExplorer/ContentType/slice";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import clsx from "clsx";

function TabList({
  className,
  block,
  selectedValue: selectedValueProp,
  selectValue,
  tabValues,
  schemaType,
}) {
  const tabRefs = [];
  const { blockElementScrollPositionUntilNextRender } =
    useScrollPositionBlocker();

  // custom
  const dispatch = useTypedDispatch();
  const isRequestSchema = schemaType?.toLowerCase() === "request";

  const [selectedValue, setSelectedValue] = useState(selectedValueProp);
  const contentTypeVal = useTypedSelector((state) => state.contentType.value);
  const acceptTypeVal = useTypedSelector((state) => state.accept.value);

  useEffect(() => {
    if (tabRefs.length > 1) {
      if (isRequestSchema) {
        setSelectedValue(contentTypeVal);
      } else {
        setSelectedValue(acceptTypeVal);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentTypeVal, acceptTypeVal]);

  const handleTabChange = (event) => {
    event.preventDefault();
    const newTab = event.currentTarget;
    const newTabIndex = tabRefs.indexOf(newTab);
    const newTabValue = tabValues[newTabIndex].value;
    // custom
    if (newTabValue !== selectedValue) {
      if (isRequestSchema) {
        dispatch(setContentType(newTabValue));
      } else {
        dispatch(setAccept(newTabValue));
      }
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

  const tabItemListContainerRef = useRef(null);
  const [showTabArrows, setShowTabArrows] = useState(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        requestAnimationFrame(() => {
          if (entry.target.offsetWidth < entry.target.scrollWidth) {
            setShowTabArrows(true);
          } else {
            setShowTabArrows(false);
          }
        });
      }
    });

    resizeObserver.observe(tabItemListContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleRightClick = () => {
    tabItemListContainerRef.current.scrollLeft += 90;
  };

  const handleLeftClick = () => {
    tabItemListContainerRef.current.scrollLeft -= 90;
  };

  return (
    <div className="tabs__container">
      <div className="openapi-tabs__mime-container">
        {showTabArrows && (
          <button
            className={clsx("openapi-tabs__arrow", "left")}
            onClick={handleLeftClick}
          />
        )}
        <ul
          ref={tabItemListContainerRef}
          role="tablist"
          aria-orientation="horizontal"
          className={clsx(
            "openapi-tabs__mime-list-container",
            "tabs",
            {
              "tabs--block": block,
            },
            className
          )}
        >
          {tabValues.map(({ value, label, attributes }) => {
            return (
              <li
                role="tab"
                tabIndex={selectedValue === value ? 0 : -1}
                aria-selected={selectedValue === value}
                key={value}
                ref={(tabControl) => tabRefs.push(tabControl)}
                onKeyDown={handleKeydown}
                onFocus={handleTabChange}
                onClick={(e) => handleTabChange(e)}
                {...attributes}
                className={clsx(
                  "tabs__item",
                  "openapi-tabs__mime-item",
                  attributes?.className,
                  {
                    active: selectedValue === value,
                  }
                )}
              >
                {label ?? value}
              </li>
            );
          })}
        </ul>
        {showTabArrows && (
          <button
            className={clsx("openapi-tabs__arrow", "right")}
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
    <div className="tabs-container">
      <TabList {...props} {...tabs} />
      <TabContent {...props} {...tabs} />
    </div>
  );
}
export default function MimeTabs(props) {
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
