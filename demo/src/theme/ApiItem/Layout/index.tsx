/* ============================================================================
 * ApiItem/Layout wrapper — reports the page's api_layout front matter to the
 * demo layout picker, which renders outside the doc page.
 * ========================================================================== */

import React from "react";

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import OriginalLayout from "@theme-original/ApiItem/Layout";

import { useReportPageLayout } from "@site/src/components/LayoutPicker/context";

type Props = React.ComponentProps<typeof OriginalLayout>;

export default function Layout(props: Props): JSX.Element {
  const { frontMatter } = useDoc();
  const { api, schema, api_layout } = frontMatter as {
    api?: unknown;
    schema?: unknown;
    api_layout?: unknown;
  };
  useReportPageLayout(
    (api || schema) && (api_layout === "classic" || api_layout === "modern")
      ? api_layout
      : undefined
  );
  return <OriginalLayout {...props} />;
}
