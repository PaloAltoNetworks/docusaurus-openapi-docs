/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { ThemeClassNames } from "@docusaurus/theme-common";
// @ts-ignore
import { useDoc } from "@docusaurus/theme-common/internal";
import TOCCollapsible from "@theme/TOCCollapsible";
import clsx from "clsx";

import styles from "./styles.module.css";

export default function DocItemTOCMobile(): JSX.Element {
  const { toc, frontMatter } = useDoc();
  return (
    <TOCCollapsible
      toc={toc}
      minHeadingLevel={frontMatter.toc_min_heading_level}
      maxHeadingLevel={frontMatter.toc_max_heading_level}
      className={clsx(ThemeClassNames.docs.docTocMobile, styles.tocMobile)}
    />
  );
}
