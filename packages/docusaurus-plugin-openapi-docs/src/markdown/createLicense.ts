/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { LicenseObject } from "../openapi/types";
import { create, guard } from "./utils";

export function createLicense(license: LicenseObject) {
  if (!license || !Object.keys(license).length) return "";
  const { name, url } = license;

  return create("div", {
    style: {
      marginBottom: "var(--ifm-paragraph-margin-bottom)",
    },
    children: [
      create("h3", {
        style: {
          marginBottom: "0.25rem",
        },
        children: "License",
      }),
      guard(url, () =>
        create("a", {
          href: url,
          children: name ?? url,
        })
      ),
    ],
  });
}
