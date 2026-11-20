/* ============================================================================
 * Root swizzle — provides the demo layout switch to the OpenAPI theme.
 * ========================================================================== */

import React from "react";

import { DemoLayoutProvider } from "@site/src/components/LayoutPicker/context";

export default function Root({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <DemoLayoutProvider>{children}</DemoLayoutProvider>;
}
