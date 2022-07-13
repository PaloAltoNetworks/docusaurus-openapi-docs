/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useWindowSize } from "@docusaurus/theme-common";
// @ts-ignore
import { useDoc } from "@docusaurus/theme-common/internal";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import type { Props } from "@theme/DocItem/Layout";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocVersionBanner from "@theme/DocVersionBanner";
import clsx from "clsx";

import DocItemContent from "../Content";
import DocItemFooter from "../Footer";
import DocItemPaginator from "../Paginator";
import DocItemTOCDesktop from "../TOC/Desktop";
import DocItemTOCMobile from "../TOC/Mobile";
import styles from "./styles.module.css";

/**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */
function useDocTOC() {
  const { frontMatter, toc } = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;

  const desktop =
    canRender && (windowSize === "desktop" || windowSize === "ssr") ? (
      <DocItemTOCDesktop />
    ) : undefined;

  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout({ children }: Props): JSX.Element {
  const docTOC = useDocTOC();
  const {
    frontMatter: { api },
  } = useDoc();

  return (
    <div className="row">
      <div className={clsx("col", !docTOC.hidden && styles.docItemCol)}>
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <div className={clsx("col", api ? "col--7" : "col--12")}>
              <DocItemFooter />
            </div>
          </article>
          <div className={clsx("col", api ? "col--7" : "col--12")}>
            <DocItemPaginator />
          </div>
        </div>
      </div>
      {docTOC.desktop && <div className="col col--3">{docTOC.desktop}</div>}
    </div>
  );
}
