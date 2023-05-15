/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { ThemeClassNames, usePrismTheme } from "@docusaurus/theme-common";
import { getPrismCssVariables } from "@docusaurus/theme-common/internal";
import clsx from "clsx";

export default function CodeBlockContainer({ as: As, ...props }) {
  const prismTheme = usePrismTheme();
  const prismCssVariables = getPrismCssVariables(prismTheme);
  return (
    <As
      // Polymorphic components are hard to type, without `oneOf` generics
      {...props}
      style={prismCssVariables}
      className={clsx(
        "openapi-explorer__code-block-container",
        props.className,
        ThemeClassNames.common.codeBlock
      )}
    />
  );
}
