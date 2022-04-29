/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import type { ApiItem as ApiItemType } from "@paloaltonetworks/docusaurus-plugin-openapi/lib/types";
import DocItem from "@theme-original/DocItem";
import type { Props, FrontMatter } from "@theme/DocItem";
import DocItemFooter from "@theme/DocItemFooter";
import DocPaginator from "@theme/DocPaginator";
import clsx from "clsx";
// import cloneDeep from "lodash/cloneDeep";

import styles from "./styles.module.css";

let ApiDemoPanel = (_: { item: any }) => <div style={{ marginTop: "3.5em" }} />;
if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}
interface ApiFrontMatter extends FrontMatter {
  readonly api?: ApiItemType;
}

export default function ApiItem(props: Props): JSX.Element {
  const { previous, next } = props.content.metadata;

  // Make deep copy of props so we can show/hide DocItem features
  // as needed when used to wrap api docs.
  const apiDocItemProps = { ...props };
  const { content: ApiItemContent } = apiDocItemProps;
  const { metadata, frontMatter } = ApiItemContent;
  const { api } = frontMatter as ApiFrontMatter;

  if (api) {
    (metadata.next as any) = null;
    (metadata.previous as any) = null;
    // (metadata.lastUpdatedAt as any) = null;
    // (metadata.lastUpdatedBy as any) = null;
    (frontMatter.hide_table_of_contents as any) = true;
    return (
      <div className={styles.apiItemContainer}>
        <div className={clsx("theme-api-markdown", "markdown")}>
          <div className="row">
            <div className="col col--7">
              <DocItem {...apiDocItemProps} />
            </div>
            <div className="col col--5">
              <ApiDemoPanel item={api} />
            </div>
          </div>

          <div className="row">
            <div className={clsx("col col--7")}>
              <DocItemFooter {...props} />
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
  } else {
    return (
      <>
        <DocItem {...props} />
      </>
    );
  }
}
