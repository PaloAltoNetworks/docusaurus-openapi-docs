/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import type { Props } from "@theme/ApiItem";
import DocPaginator from "@theme/DocPaginator";
import Seo from "@theme/Seo";
import clsx from "clsx";

import styles from "./styles.module.css";

let ApiDemoPanel = (_: { item: any }) => <div style={{ marginTop: "3.5em" }} />;
if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}

function ApiItem(props: Props): JSX.Element {
  const { content: ApiContent } = props;
  const { metadata, frontMatter } = ApiContent;
  const { image, keywords } = frontMatter;
  const { description, title, api, previous, next } = metadata;

  return (
    <>
      <Seo {...{ title, description, keywords, image }} />

      <div className="row">
        <div className="col">
          <div className={styles.apiItemContainer}>
            <article>
              <div className={clsx("theme-api-markdown", "markdown")}>
                <ApiContent />
              </div>
            </article>

            <DocPaginator previous={previous} next={next} />
          </div>
        </div>
        <div className={clsx("col", api ? "col--5" : "col--3")}>
          {api && <ApiDemoPanel item={api} />}
        </div>
      </div>
    </>
  );
}

export default ApiItem;
