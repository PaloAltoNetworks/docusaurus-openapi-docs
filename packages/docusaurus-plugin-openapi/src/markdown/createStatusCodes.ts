/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { ApiItem } from "../types";
import { createDescription } from "./createDescription";
import { createSchemaDetails } from "./createSchemaDetails";
import { create } from "./utils";

interface Props {
  responses: ApiItem["responses"];
}

export function createStatusCodes({ responses }: Props) {
  if (responses === undefined) {
    return undefined;
  }

  const codes = Object.keys(responses);
  if (codes.length === 0) {
    return undefined;
  }

  return create("div", {
    children: [
      create("Tabs", {
        children: codes.map((code) => {
          return create("TabItem", {
            label: code,
            value: code,
            children: [
              create("hr", {}),
              create("div", {
                style: { marginLeft: "16px" },
                children: createDescription(responses[code].description),
              }),
              create("div", {
                style: { marginLeft: "16px" },
                children: createSchemaDetails({
                  title: "Schema",
                  body: {
                    content: responses[code].content,
                  },
                }),
              }),
            ],
          });
        }),
      }),
    ],
  });
}
