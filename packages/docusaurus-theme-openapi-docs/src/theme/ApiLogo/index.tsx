/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useColorMode } from "@docusaurus/theme-common";

export default function ApiLogo(props: any): JSX.Element {
  const { colorMode } = useColorMode();
  const { logo, darkLogo } = props;

  if (colorMode === "dark") {
    if (darkLogo) {
      return (
        <img
          alt={darkLogo.altText ?? logo.altText}
          src={darkLogo.url}
          width="250px"
        />
      );
    }
    if (logo) {
      return <img alt={logo.altText} src={logo.url} width="250px" />;
    }
    return <div />;
  }

  if (colorMode === "light" && logo) {
    return <img alt={logo.altText} src={logo.url} width="250px" />;
  }

  return <div />;
}
