/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createRows } from "./createSchemaDetails";
import { create } from "./utils";

export function createAnyOneOf(anyOneOf: any[], type: string) {
  if (anyOneOf === undefined) {
    return undefined;
  }

  if (anyOneOf.length === 0) {
    return undefined;
  }

  return create("div", {
    children: [
      create("span", {
        className: "badge badge--info",
        children: type,
      }),
      create("SchemaTabs", {
        children: anyOneOf.map((schema, index) => {
          const label = schema.title ? schema.title : `MOD${index + 1}`;

          if (schema.properties !== undefined) {
            return create("TabItem", {
              label: label,
              value: `${index}-properties`,
              children: [createRows({ schema: schema })],
            });
          }

          if (schema.allOf !== undefined) {
            return create("TabItem", {
              label: label,
              value: `${index}-allOf`,
              children: [createRows({ schema: schema })],
            });
          }

          if (schema.items !== undefined) {
            if (schema.items.properties !== undefined) {
              return create("TabItem", {
                label: label,
                value: `${index}-item-properties`,
                children: [createRows({ schema: schema.items })],
              });
            }
          }

          return undefined;
        }),
      }),
    ],
  });
}
