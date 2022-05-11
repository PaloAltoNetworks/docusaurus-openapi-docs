/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  useWindowSize,
} from "@docusaurus/theme-common";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import type { Props } from "@theme/DocItem";
import DocItemFooter from "@theme/DocItemFooter";
import DocPaginator from "@theme/DocPaginator";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocVersionBanner from "@theme/DocVersionBanner";
import Heading from "@theme/Heading";
import MDXContent from "@theme/MDXContent";
import TOC from "@theme/TOC";
import TOCCollapsible from "@theme/TOCCollapsible";
import clsx from "clsx";
import type { ApiItem as ApiItemType } from "docusaurus-plugin-openapi-docs/src/types";

import { DocFrontMatter } from "../../types";
import styles from "./styles.module.css";

let ApiDemoPanel = (_: { item: any }) => <div style={{ marginTop: "3.5em" }} />;
if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}

interface ApiFrontMatter extends DocFrontMatter {
  readonly api?: ApiItemType;
}

function DocItemMetadata(props: Props): JSX.Element {
  const { content: DocContent } = props;
  const { metadata, frontMatter, assets } = DocContent;
  const { keywords } = frontMatter;
  const { description, title } = metadata;
  const image = assets.image ?? frontMatter.image;

  return <PageMetadata {...{ title, description, keywords, image }} />;
}

function DocItemContent(props: Props): JSX.Element {
  const { content: DocContent } = props;
  const { metadata, frontMatter } = DocContent;
  const {
    hide_title: hideTitle,
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;
  const { title } = metadata;

  const { api } = frontMatter as ApiFrontMatter;

  // We only add a title if:
  // - user doesn't ask to hide it with front matter
  // - the markdown content does not already contain a top-level h1 heading
  const shouldAddTitle =
    !hideTitle && typeof DocContent.contentTitle === "undefined";

  const windowSize = useWindowSize();

  const canRenderTOC =
    !hideTableOfContents && DocContent.toc && DocContent.toc.length > 0;

  const renderTocDesktop =
    canRenderTOC && (windowSize === "desktop" || windowSize === "ssr");

  return (
    <div className="row">
      <div className={clsx("col", !hideTableOfContents && styles.docItemCol)}>
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />

            {canRenderTOC && (
              <TOCCollapsible
                toc={DocContent.toc}
                minHeadingLevel={tocMinHeadingLevel}
                maxHeadingLevel={tocMaxHeadingLevel}
                className={clsx(
                  ThemeClassNames.docs.docTocMobile,
                  styles.tocMobile
                )}
              />
            )}

            <div
              className={clsx(
                ThemeClassNames.docs.docMarkdown,
                "theme-api-markdown",
                "markdown"
              )}
            >
              {/*
                Title can be declared inside md content or declared through
                front matter and added manually. To make both cases consistent,
                the added title is added under the same div.markdown block
                See https://github.com/facebook/docusaurus/pull/4882#issuecomment-853021120
                */}
              {shouldAddTitle && (
                <header>
                  <Heading as="h1">{title}</Heading>
                </header>
              )}
              <MDXContent>
                <div className="row">
                  <div className={clsx("col", api ? "col--7" : "col--12")}>
                    <DocContent />
                  </div>
                  {api && (
                    <div className="col col--5">
                      <ApiDemoPanel item={api} />
                    </div>
                  )}
                </div>
              </MDXContent>
            </div>
            <div
              className={clsx(
                "col",
                api ? "col--7" : !canRenderTOC ? "col--9" : "col--12"
              )}
            >
              <DocItemFooter {...props} />
            </div>
          </article>
          <div
            className={clsx(
              "col",
              api ? "col--7" : !canRenderTOC ? "col--9" : "col--12"
            )}
          >
            <DocPaginator previous={metadata.previous} next={metadata.next} />
          </div>
        </div>
      </div>
      {renderTocDesktop && (
        <div className="col col--3">
          <TOC
            toc={DocContent.toc}
            minHeadingLevel={tocMinHeadingLevel}
            maxHeadingLevel={tocMaxHeadingLevel}
            className={ThemeClassNames.docs.docTocDesktop}
          />
        </div>
      )}
    </div>
  );
}

export default function DocItem(props: Props): JSX.Element {
  const docHtmlClassName = `docs-doc-id-${props.content.metadata.unversionedId}`;
  return (
    <HtmlClassNameProvider className={docHtmlClassName}>
      <DocItemMetadata {...props} />
      <DocItemContent {...props} />
    </HtmlClassNameProvider>
  );
}
