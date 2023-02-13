/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useColorMode } from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";
import ThemedImage from "@theme/ThemedImage";

export default function ApiLogo(props: any): JSX.Element {
  const { colorMode } = useColorMode();
  const { logo, darkLogo } = props;
  const altText = () => {
    if (colorMode === "dark") {
      return darkLogo?.altText ?? logo?.altText;
    }
    return logo?.altText;
  };

  return (
    <ThemedImage
      alt={altText()}
      sources={{
        light: useBaseUrl(logo?.url),
        dark: useBaseUrl(darkLogo?.url),
      }}
      className="openapi__logo"
    />
  );
}
