/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { HtmlClassNameProvider } from "@docusaurus/theme-common";
import type { Props } from "@theme/DocItem";
import clsx from "clsx";
import type { ApiItem as ApiItemType } from "docusaurus-plugin-openapi-docs/lib/types";

import { DocFrontMatter } from "../../types";
import DocItemLayout from "./Layout";
import DocItemMetadata from "./Metadata";

const { DocProvider } = require("@docusaurus/theme-common/internal");

let ApiDemoPanel = (_: { item: any; infoPath: any }) => (
  <div style={{ marginTop: "3.5em" }} />
);
if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}

interface ApiFrontMatter extends DocFrontMatter {
  readonly api?: ApiItemType;
}

export default function DocItem(props: Props): JSX.Element {
  const docHtmlClassName = `docs-doc-id-${props.content.metadata.unversionedId}`;

  const DocContent = () => {
    const MDXComponent = props.content;
    const { frontMatter } = MDXComponent;
    const { info_path: infoPath } = frontMatter as DocFrontMatter;
    const { api } = frontMatter as ApiFrontMatter;

    return (
      <div className="row">
        <div className={clsx("col", api ? "col--7" : "col--12")}>
          <MDXComponent />
        </div>
        {api && (
          <div className="col col--5">
            <ApiDemoPanel item={api} infoPath={infoPath} />
          </div>
        )}
      </div>
    );
  };

  return (
    <DocProvider content={props.content}>
      <HtmlClassNameProvider className={docHtmlClassName}>
        <DocItemMetadata />
        <DocItemLayout>
          <DocContent />
        </DocItemLayout>
      </HtmlClassNameProvider>
    </DocProvider>
  );
}
