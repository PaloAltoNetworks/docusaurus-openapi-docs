/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { ThemeClassNames, useWindowSize } from "@docusaurus/theme-common";
import type { Props } from "@theme/ApiItem";
import DocPaginator from "@theme/DocPaginator";
import Seo from "@theme/Seo";
import TOC from "@theme/TOC";
import TOCCollapsible from "@theme/TOCCollapsible";
import clsx from "clsx";

import styles from "./styles.module.css";

let ApiDemoPanel = (_: {
  item: any;
  showExecuteButton?: boolean;
  showManualAuthentication?: boolean;
  previous?: object;
  next?: object;
}) => <div style={{ marginTop: "3.5em" }} />;
if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}

function ApiItem(props: Props): JSX.Element {
  const { content: ApiContent } = props;
  const { metadata, frontMatter } = ApiContent;
  const {
    image,
    keywords,
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;

  const {
    description,
    title,
    api,
    previous,
    next,
    showExecuteButton,
    showManualAuthentication,
    type,
  } = metadata;

  const windowSize = useWindowSize();

  const canRenderTOC =
    !hideTableOfContents &&
    ApiContent.toc &&
    ApiContent.toc.length > 0 &&
    type === "doc";

  const renderTocDesktop =
    canRenderTOC && (windowSize === "desktop" || windowSize === "ssr");

  return (
    <>
      <Seo {...{ title, description, keywords, image }} />
      <div className="row">
        <div className={clsx("col", api ? "col--7" : "col--9")}>
          <div className={styles.apiItemContainer}>
            <article>
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
                <ApiContent />
              </div>
            </article>
          </div>
        </div>
        <div className={clsx("col", api && "col--5")}>
          {api && (
            <ApiDemoPanel
              item={api}
              showExecuteButton={showExecuteButton}
              showManualAuthentication={showManualAuthentication}
              previous={previous}
              next={next}
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
