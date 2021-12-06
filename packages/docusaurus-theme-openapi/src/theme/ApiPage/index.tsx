/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { ReactNode, useState, useCallback } from "react";

import renderRoutes from "@docusaurus/renderRoutes";
import { matchPath } from "@docusaurus/router";
import { translate } from "@docusaurus/Translate";
import { MDXProvider } from "@mdx-js/react";
import type { ApiRoute } from "@theme/ApiItem";
import type { Props } from "@theme/ApiPage";
import BackToTopButton from "@theme/BackToTopButton";
import DocSidebar from "@theme/DocSidebar";
import IconArrow from "@theme/IconArrow";
import Layout from "@theme/Layout";
import MDXComponents from "@theme/MDXComponents";
import NotFound from "@theme/NotFound";
import clsx from "clsx";
import { PropApiMetadata } from "docusaurus-plugin-openapi";

import styles from "./styles.module.css";

type ApiPageContentProps = {
  readonly currentApiRoute: ApiRoute;
  readonly apiMetadata: PropApiMetadata;
  readonly children: ReactNode;
};

type SidebarMetadata = Omit<ApiPageContentProps, "children">;

function getSidebar({ currentApiRoute, apiMetadata }: SidebarMetadata) {
  const sidebarName = currentApiRoute.sidebar;
  const sidebar = sidebarName
    ? apiMetadata.apiSidebars[sidebarName]
    : undefined;

  return sidebar;
}

function getSidebarPaths({
  currentApiRoute,
  apiMetadata,
}: SidebarMetadata): string[] {
  const sidebar = getSidebar({ currentApiRoute, apiMetadata });
  if (!sidebar) {
    return [];
  }

  return sidebar.flatMap((category) => {
    if (category.type === "category") {
      return category.items
        .map((link) => {
          if (link.type === "link") {
            return link.href;
          }
          // kinda hacky but don't feel like wrestling typescript
          // the empty string will get filtered our
          return "";
        })
        .filter(Boolean);
    }
    return [];
  });
}

function ApiPageContent({
  currentApiRoute,
  apiMetadata,
  children,
}: ApiPageContentProps): JSX.Element {
  const sidebar = getSidebar({ currentApiRoute, apiMetadata });

  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }

    setHiddenSidebarContainer((value) => !value);
  }, [hiddenSidebar]);

  return (
    <Layout wrapperClassName="api-wrapper" pageClassName="api-page">
      <div className={styles.apiPage}>
        <BackToTopButton />

        {sidebar && (
          <aside
            className={clsx(styles.apiSidebarContainer, {
              [styles.apiSidebarContainerHidden]: hiddenSidebarContainer,
            })}
            onTransitionEnd={(e) => {
              if (
                !e.currentTarget.classList.contains(styles.apiSidebarContainer)
              ) {
                return;
              }

              if (hiddenSidebarContainer) {
                setHiddenSidebar(true);
              }
            }}
          >
            <DocSidebar
              key={
                // Reset sidebar state on sidebar changes
                // See https://github.com/facebook/docusaurus/issues/3414
                currentApiRoute.sidebar
              }
              sidebar={sidebar}
              path={currentApiRoute.path}
              onCollapse={toggleSidebar}
              isHidden={hiddenSidebar}
            />

            {hiddenSidebar && (
              <div
                className={styles.collapsedApiSidebar}
                title={translate({
                  id: "theme.docs.sidebar.expandButtonTitle",
                  message: "Expand sidebar",
                  description:
                    "The ARIA label and title attribute for expand button of doc sidebar",
                })}
                aria-label={translate({
                  id: "theme.docs.sidebar.expandButtonAriaLabel",
                  message: "Expand sidebar",
                  description:
                    "The ARIA label and title attribute for expand button of doc sidebar",
                })}
                tabIndex={0}
                role="button"
                onKeyDown={toggleSidebar}
                onClick={toggleSidebar}
              >
                <IconArrow className={styles.expandSidebarButtonIcon} />
              </div>
            )}
          </aside>
        )}
        <main
          className={clsx(styles.apiMainContainer, {
            [styles.apiMainContainerEnhanced]:
              hiddenSidebarContainer || !sidebar,
          })}
        >
          <div
            className={clsx("container padding-top--md padding-bottom--lg", {
              [styles.apiItemWrapperEnhanced]: hiddenSidebarContainer,
            })}
          >
            <MDXProvider components={MDXComponents}>{children}</MDXProvider>
          </div>
        </main>
      </div>
    </Layout>
  );
}

function ApiPage(props: Props): JSX.Element {
  const {
    route: { routes: apiRoutes },
    apiMetadata,
    location,
  } = props;
  let currentApiRoute = apiRoutes.find((apiRoute) =>
    matchPath(location.pathname, apiRoute)
  );
  if (!currentApiRoute) {
    return <NotFound />;
  }

  // Override the current route path to the first page if it can't be found on the sidebar.
  const paths = getSidebarPaths({ currentApiRoute, apiMetadata });
  if (!paths.includes(location.pathname)) {
    currentApiRoute = {
      ...currentApiRoute,
      path: paths[0],
    };
  }

  return (
    <>
      <ApiPageContent
        currentApiRoute={currentApiRoute}
        apiMetadata={apiMetadata}
      >
        {renderRoutes(apiRoutes)}
      </ApiPageContent>
    </>
  );
}

export default ApiPage;
