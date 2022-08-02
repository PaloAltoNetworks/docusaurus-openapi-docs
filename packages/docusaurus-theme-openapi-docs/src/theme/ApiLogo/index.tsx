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

  return logo ? (
    <img
      alt={colorMode === "dark" && darkLogo ? darkLogo.altText : logo.altText}
      src={colorMode === "dark" && darkLogo ? darkLogo.url : logo.url}
      width="250px"
    />
  ) : (
    <div />
  );
}
