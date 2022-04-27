/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import DocItem from "@theme-original/DocItem";
// @ts-ignore
import type { Props } from "@theme/ApiItem";
import DocPaginator from "@theme/DocPaginator";
import clsx from "clsx";

import styles from "./styles.module.css";

let ApiDemoPanel = (_: { item: any }) => <div style={{ marginTop: "3.5em" }} />;
if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}

export default function ApiItem(props: typeof Props): JSX.Element {
  let api = props.content.frontMatter.api ?? false;
  if (!api) {
    return (
      <>
        <DocItem {...props} />
      </>
    );
  } else {
    let next = props.content.metadata.next;
    let previous = props.content.metadata.previous;
    props.content.metadata.next = null;
    props.content.metadata.previous = null;
    props.content.metadata.toc = null;
    return (
      <div className={styles.apiItemContainer}>
        <div className={clsx("theme-api-markdown", "markdown")}>
          <div className="row">
            <div className="col col--7">
              <DocItem {...props} />
            </div>
            <div className="col col--5">
              <ApiDemoPanel item={api} />
            </div>
          </div>
          <div className="row">
            <div className={clsx("col col--7")}>
              <DocPaginator previous={previous} next={next} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
