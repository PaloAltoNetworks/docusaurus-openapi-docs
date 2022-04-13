/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { ThemeClassNames, useWindowSize } from "@docusaurus/theme-common";
// @ts-ignore
import type { Props } from "@theme/ApiItem";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import DocItemFooter from "@theme/DocItemFooter";
import DocPaginator from "@theme/DocPaginator";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocVersionBanner from "@theme/DocVersionBanner";
import Heading from "@theme/Heading";
import Seo from "@theme/Seo";
import TOC from "@theme/TOC";
import TOCCollapsible from "@theme/TOCCollapsible";
import clsx from "clsx";

import styles from "./styles.module.css";

let ApiDemoPanel = (_: {
  item: any;
  showExecuteButton?: boolean;
  showManualAuthentication?: boolean;
}) => <div style={{ marginTop: "3.5em" }} />;
if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}

function ApiItem(props: typeof Props): JSX.Element {
  const { content: ApiContent } = props;
  const { metadata, frontMatter } = ApiContent;
  const {
    image,
    keywords,
    hide_title: hideTitle,
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
    api,
  } = frontMatter;
  const {
    description,
    title,
    previous,
    next,
    showExecuteButton,
    showManualAuthentication,
  } = metadata;

  // We only add a title if:
  // - user doesn't ask to hide it with front matter
  // - the markdown content does not already contain a top-level h1 heading
  const shouldAddTitle =
    !hideTitle && typeof ApiContent.contentTitle === "undefined";

  const windowSize = useWindowSize();

  const canRenderTOC =
    !hideTableOfContents && ApiContent.toc && ApiContent.toc.length > 0;

  const renderTocDesktop =
    canRenderTOC && (windowSize === "desktop" || windowSize === "ssr");

  return (
    <>
      <Seo {...{ title, description, keywords, image }} />
      <div className="row">
        <div className={clsx("col", api ? "col--7" : "col--9")}>
          <DocVersionBanner />
          <div className={styles.apiItemContainer}>
            <article>
              <DocBreadcrumbs />
              <DocVersionBadge />

              <div className={clsx("theme-api-markdown", "markdown")}>
                {canRenderTOC && (
                  <TOCCollapsible
                    toc={ApiContent.toc}
                    minHeadingLevel={tocMinHeadingLevel}
                    maxHeadingLevel={tocMaxHeadingLevel}
                    className={clsx(
                      ThemeClassNames.docs.docTocMobile,
                      styles.tocMobile
                    )}
                  />
                )}
                {shouldAddTitle && (
                  <header>
                    <Heading as="h1">{title}</Heading>
                  </header>
                )}
                <ApiContent />
              </div>
              <DocItemFooter {...props} />
            </article>
          </div>
        </div>
        <div className={clsx("col", api && "col--5")}>
          {api && (
            <ApiDemoPanel
              item={api}
              showExecuteButton={showExecuteButton}
              showManualAuthentication={showManualAuthentication}
            />
          )}
          {renderTocDesktop && (
            <TOC
              toc={ApiContent.toc}
              minHeadingLevel={tocMinHeadingLevel}
              maxHeadingLevel={tocMaxHeadingLevel}
              className={ThemeClassNames.docs.docTocDesktop}
            />
          )}
        </div>
      </div>
      <div className="row">
        <div className={clsx("col", api ? "col--7" : "col--9")}>
          <DocPaginator previous={previous} next={next} />
        </div>
      </div>
    </>
  );
}

export default ApiItem;
