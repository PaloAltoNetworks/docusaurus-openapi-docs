/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import renderRoutes from "@docusaurus/renderRoutes";
import Layout from "@theme/Layout";
import ApiSidebar from "@theme/ApiSidebar";
import NotFound from "@theme/NotFound";
import { matchPath } from "@docusaurus/router";

import styles from "./styles.module.css";

function DocPage(props) {
  const { route: baseRoute, docsMetadata, location } = props;
  // case-sensitive route such as it is defined in the sidebar
  const currentRoute =
    baseRoute.routes.find((route) => {
      return matchPath(location.pathname, route);
    }) || {};
  const { permalinkToSidebar, docsSidebars, version } = docsMetadata;
  const sidebar = permalinkToSidebar[currentRoute.path];
  const {
    siteConfig: { themeConfig = {} } = {},
    isClient,
  } = useDocusaurusContext();

  const { sidebarCollapsible = true } = themeConfig;

  if (Object.keys(currentRoute).length === 0) {
    return <NotFound {...props} />;
  }

  return (
    <Layout version={version} key={isClient}>
      <div className={styles.docPage}>
        {sidebar && (
          <div className={styles.docSidebarContainer} role="complementary">
            <ApiSidebar
              docsSidebars={docsSidebars}
              path={currentRoute.path}
              sidebar={sidebar}
              sidebarCollapsible={sidebarCollapsible}
            />
          </div>
        )}
        <main className={styles.docMainContainer}>
          {renderRoutes(baseRoute.routes)}
        </main>
      </div>
    </Layout>
  );
}

export default DocPage;
