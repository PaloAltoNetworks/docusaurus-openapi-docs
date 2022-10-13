/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";

import { duplicates } from "@docusaurus/theme-common";
import useIsBrowser from "@docusaurus/useIsBrowser";
import clsx from "clsx";

import { setAccept } from "../ApiDemoPanel/Accept/slice";
import { setContentType } from "../ApiDemoPanel/ContentType/slice";
import { useTypedDispatch, useTypedSelector } from "../ApiItem/hooks";
import styles from "./styles.module.css"; // A very rough duck type, but good enough to guard against mistakes while

const {
  useScrollPositionBlocker,
  useTabGroupChoice,
} = require("@docusaurus/theme-common/internal");

// allowing customization

function isTabItem(comp) {
  return typeof comp.props.value !== "undefined";
}

function MimeTabsComponent(props) {
  const {
    lazy,
    block,
    defaultValue: defaultValueProp,
    values: valuesProp,
    groupId,
    className,
    schemaType,
  } = props;
  const children = Children.map(props.children, (child) => {
    if (isValidElement(child) && isTabItem(child)) {
      return child;
    } // child.type.name will give non-sensical values in prod because of
    // minification, but we assume it won't throw in prod.

    throw new Error(
      `Docusaurus error: Bad <Tabs> child <${
        // @ts-expect-error: guarding against unexpected cases
        typeof child.type === "string" ? child.type : child.type.name
      }>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`
    );
  });
  const values =
    valuesProp ?? // We only pick keys that we recognize. MDX would inject some keys by default
    children.map(({ props: { value, label, attributes } }) => ({
      value,
      label,
      attributes,
    }));
  const dup = duplicates(values, (a, b) => a.value === b.value);

  if (dup.length > 0) {
    throw new Error(
      `Docusaurus error: Duplicate values "${dup
        .map((a) => a.value)
        .join(", ")}" found in <Tabs>. Every value needs to be unique.`
    );
  } // When defaultValueProp is null, don't show a default tab

  const defaultValue =
    defaultValueProp === null
      ? defaultValueProp
      : defaultValueProp ??
        children.find((child) => child.props.default)?.props.value ??
        children[0]?.props.value;

  if (defaultValue !== null && !values.some((a) => a.value === defaultValue)) {
    throw new Error(
      `Docusaurus error: The <Tabs> has a defaultValue "${defaultValue}" but none of its children has the corresponding value. Available values are: ${values
        .map((a) => a.value)
        .join(
          ", "
        )}. If you intend to show no default tab, use defaultValue={null} instead.`
    );
  }

  const { tabGroupChoices, setTabGroupChoices } = useTabGroupChoice();
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const tabRefs = [];
  const { blockElementScrollPositionUntilNextRender } =
    useScrollPositionBlocker();

  if (groupId != null) {
    const relevantTabGroupChoice = tabGroupChoices[groupId];

    if (
      relevantTabGroupChoice != null &&
      relevantTabGroupChoice !== selectedValue &&
      values.some((value) => value.value === relevantTabGroupChoice)
    ) {
      setSelectedValue(relevantTabGroupChoice);
    }
  }

  const dispatch = useTypedDispatch();
  const isRequestSchema = schemaType?.toLowerCase() === "request";

  const handleTabChange = (event) => {
    event.preventDefault();
    const newTab = event.currentTarget;
    const newTabIndex = tabRefs.indexOf(newTab);
    const newTabValue = values[newTabIndex].value;

    if (newTabValue !== selectedValue) {
      if (isRequestSchema) {
        dispatch(setContentType(newTabValue));
      } else {
        dispatch(setAccept(newTabValue));
      }

      blockElementScrollPositionUntilNextRender(newTab);
      setSelectedValue(newTabValue);

      if (groupId != null) {
        setTabGroupChoices(groupId, newTabValue);
      }
    }
  };

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

  const handleKeydown = (event) => {
    let focusElement = null;

    switch (event.key) {
      case "ArrowRight": {
        const nextTab = tabRefs.indexOf(event.currentTarget) + 1;
        focusElement = tabRefs[nextTab] || tabRefs[0];
        break;
      }

      case "ArrowLeft": {
        const prevTab = tabRefs.indexOf(event.currentTarget) - 1;
        focusElement = tabRefs[prevTab] || tabRefs[tabRefs.length - 1];
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

  return (
    <div className="tabs__container">
      <div className={styles.mimeTabsTopSection}>
        {/* <strong>MIME Type</strong> */}
        <div className={styles.mimeTabsContainer}>
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
              styles.mimeTabsListContainer,
              "tabs",
              {
                "tabs--block": block,
              },
              className
            )}
          >
            {values.map(({ value, label, attributes }) => {
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
                    styles.tabItem,
                    attributes?.className,
                    {
                      [styles.mimeTabActive]: selectedValue === value,
                    }
                  )}
                >
                  {/* <div
                    className={clsx(styles.mimeTabDot, mimeTabDotStyle)}
                  /> */}
                  {label ?? value}
                </li>
              );
            })}
          </ul>
          {showTabArrows && (
            <button
              className={clsx(styles.tabArrow, styles.tabArrowRight)}
              onClick={handleRightClick}
            />
          )}
        </div>
      </div>
      {/* <hr /> */}
      {lazy ? (
        cloneElement(
          children.filter(
            (tabItem) => tabItem.props.value === selectedValue
          )[0],
          {
            className: clsx("margin-vert--md", styles.mimeSchemaContainer),
          }
        )
      ) : (
        <div className={clsx("margin-vert--md", styles.mimeSchemaContainer)}>
          {children.map((tabItem, i) =>
            cloneElement(tabItem, {
              key: i,
              hidden: tabItem.props.value !== selectedValue,
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function MimeTabs(props) {
  const isBrowser = useIsBrowser();
  return (
    <MimeTabsComponent // Remount tabs after hydration
      // Temporary fix for https://github.com/facebook/docusaurus/issues/5653
      key={String(isBrowser)}
      {...props}
    />
  );
}
