/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState, useCallback, useEffect, useRef } from "react";

import isInternalUrl from "@docusaurus/isInternalUrl";
import Link from "@docusaurus/Link";
import { useScrollPosition } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useLockBodyScroll from "@theme/hooks/useLockBodyScroll";
import useUserPreferencesContext from "@theme/hooks/useUserPreferencesContext";
import useWindowSize from "@theme/hooks/useWindowSize";
import clsx from "clsx";

import styles from "./styles.module.css";

const MOBILE_TOGGLE_SIZE = 24;

function usePrevious(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// Compare the 2 paths, ignoring trailing /
const isSamePath = (path1, path2) => {
  const normalize = (str) => (str.endsWith("/") ? str : `${str}/`);
  return normalize(path1) === normalize(path2);
};

const isActiveSidebarItem = (item, activePath) => {
  if (item.type === "link") {
    return isSamePath(item.href, activePath);
  }
  if (item.type === "category") {
    return item.items.some((subItem) =>
      isActiveSidebarItem(subItem, activePath)
    );
  }
  return false;
};

function DocSidebarItemCategory({
  item,
  onItemClick,
  collapsible,
  activePath,
  ...props
}) {
  const { items, label } = item;

  const isActive = isActiveSidebarItem(item, activePath);
  const wasActive = usePrevious(isActive);

  // active categories are always initialized as expanded
  // the default (item.collapsed) is only used for non-active categories
  const [collapsed, setCollapsed] = useState(() => {
    if (!collapsible) {
      return false;
    }
    return isActive ? false : item.collapsed;
  });

  // If we navigate to a category, it should automatically expand itself
  useEffect(() => {
    const justBecameActive = isActive && !wasActive;
    if (justBecameActive && collapsed) {
      setCollapsed(false);
    }
  }, [isActive, wasActive, collapsed]);

  const handleItemClick = useCallback(
    (e) => {
      e.preventDefault();
      setCollapsed((state) => !state);
    },
    [setCollapsed]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <li
      className={clsx("menu__list-item", {
        "menu__list-item--collapsed": collapsed,
      })}
      key={label}
    >
      <a
        className={clsx("menu__link", {
          "menu__link--sublist": collapsible,
          "menu__link--active": collapsible && isActive,
          [styles.menuLinkText]: !collapsible,
        })}
        onClick={collapsible ? handleItemClick : undefined}
        href={collapsible ? "#!" : undefined}
        {...props}
      >
        {label}
      </a>
      <ul className="menu__list">
        {items.map((childItem) => (
          <DocSidebarItem
            tabIndex={collapsed ? "-1" : "0"}
            key={childItem.label}
            item={childItem}
            onItemClick={onItemClick}
            collapsible={collapsible}
            activePath={activePath}
          />
        ))}
      </ul>
    </li>
  );
}

function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  collapsible: _collapsible,
  ...props
}) {
  const { href, label, deprecated } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  return (
    <li className="menu__list-item" key={label}>
      <Link
        className={clsx("menu__link", {
          "menu__link--active": isActive,
          "menu__link--deprecated": deprecated,
        })}
        style={{ justifyContent: "start" }}
        to={href}
        {...(isInternalUrl(href)
          ? {
              isNavLink: true,
              exact: true,
              onClick: onItemClick,
            }
          : {
              target: "_blank",
              rel: "noreferrer noopener",
            })}
        {...props}
      >
        {deprecated && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{
              alignSelf: "center",
              flexShrink: 0,
              marginRight:
                "calc(var(--ifm-menu-link-padding-horizontal) / 1.5)",
            }}
            fill="currentColor"
            width="18px"
            height="18px"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" />
          </svg>
        )}

        {label}
      </Link>
    </li>
  );
}

function DocSidebarItem(props) {
  switch (props.item.type) {
    case "category":
      return <DocSidebarItemCategory {...props} />;
    case "link":
    default:
      return <DocSidebarItemLink {...props} />;
  }
}

function DocSidebar(props) {
  const [showResponsiveSidebar, setShowResponsiveSidebar] = useState(false);
  const {
    siteConfig: { themeConfig: { navbar: { hideOnScroll = false } = {} } } = {},
  } = useDocusaurusContext();
  const { isAnnouncementBarClosed } = useUserPreferencesContext();
  const [scrollY, setScrollY] = useState(0);
  useScrollPosition(({ scrollY }) => {
    setScrollY(scrollY);
  });

  const {
    docsSidebars,
    path,
    sidebar: currentSidebar,
    sidebarCollapsible,
  } = props;

  useLockBodyScroll(showResponsiveSidebar);
  const windowSize = useWindowSize();

  useEffect(() => {
    if (windowSize === "desktop") {
      setShowResponsiveSidebar(false);
    }
  }, [windowSize]);

  if (!currentSidebar) {
    return null;
  }

  const sidebarData = docsSidebars[currentSidebar];

  if (!sidebarData) {
    throw new Error(
      `Cannot find the sidebar "${currentSidebar}" in the sidebar config!`
    );
  }

  return (
    <div
      className={clsx(styles.sidebar, {
        [styles.sidebarWithHideableNavbar]: hideOnScroll,
      })}
    >
      <div
        className={clsx("menu", "menu--responsive", styles.menu, {
          "menu--show": showResponsiveSidebar,
          [styles.menuWithAnnouncementBar]:
            !isAnnouncementBarClosed && scrollY === 0,
        })}
      >
        <button
          aria-label={showResponsiveSidebar ? "Close Menu" : "Open Menu"}
          aria-haspopup="true"
          className="button button--secondary button--sm menu__button"
          type="button"
          onClick={() => {
            setShowResponsiveSidebar(!showResponsiveSidebar);
          }}
        >
          {showResponsiveSidebar ? (
            <span
              className={clsx(
                styles.sidebarMenuIcon,
                styles.sidebarMenuCloseIcon
              )}
            >
              &times;
            </span>
          ) : (
            <svg
              aria-label="Menu"
              className={styles.sidebarMenuIcon}
              xmlns="http://www.w3.org/2000/svg"
              height={MOBILE_TOGGLE_SIZE}
              width={MOBILE_TOGGLE_SIZE}
              viewBox="0 0 32 32"
              role="img"
              focusable="false"
            >
              <title>Menu</title>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeMiterlimit="10"
                strokeWidth="2"
                d="M4 7h22M4 15h22M4 23h22"
              />
            </svg>
          )}
        </button>
        <ul className="menu__list">
          {sidebarData.map((item, idx) => (
            <DocSidebarItem
              key={idx}
              item={item}
              onItemClick={(e) => {
                e.target.blur();
                setShowResponsiveSidebar(false);
              }}
              collapsible={sidebarCollapsible}
              activePath={path}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DocSidebar;
