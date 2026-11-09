/* ============================================================================
 * LayoutPicker — demo-only switch between the classic and modern API page
 * layouts. Desktop: segmented control in the navbar. Mobile: same control
 * inside the hamburger drawer (mobile={true}).
 * ========================================================================== */

import React from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { ApiLayout } from "@theme/ApiExplorer/useApiLayout";

import { useDemoLayout, usePageLayout } from "./context";
import styles from "./styles.module.css";

const OPTIONS: { id: ApiLayout; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
];

export default function LayoutPicker({
  mobile,
}: {
  mobile?: boolean;
}): JSX.Element {
  const [layout, setLayout] = useDemoLayout();
  const pageLayout = usePageLayout();
  const { siteConfig } = useDocusaurusContext();
  const configured =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((siteConfig.themeConfig as any).api?.layout as ApiLayout) ?? "classic";
  const active = layout ?? pageLayout ?? configured;

  return (
    <div
      className={mobile ? styles.mobileRoot : styles.root}
      role="radiogroup"
      aria-label="API page layout"
    >
      {mobile && <span className={styles.mobileLabel}>API layout</span>}
      <div className={styles.segmented}>
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={option.id === active}
            className={`${styles.option} ${option.id === active ? styles.optionActive : ""}`}
            onClick={() => setLayout(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
