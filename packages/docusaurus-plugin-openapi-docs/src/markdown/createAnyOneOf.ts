/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSchemaDetails } from "./createSchemaDetails";
import { create } from "./utils";

// {
//   'application/json': {
//     schema: { properties: [Object], required: [Array], type: 'object' }
//   }
// }
// {
//   'application/json': { schema: { allOf: [Array], example: [Object] } }
// }

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
          // Prep schema details
          let schemaDetails: any = {};
          schemaDetails["application/json"] = {}; // Placeholder content type
          schemaDetails["application/json"].schema = {};
          const label = schema.title ? schema.title : `MOD${index + 1}`;

          if (schema.properties !== undefined) {
            schemaDetails["application/json"].schema.properties =
              schema.properties;
            schemaDetails["application/json"].schema.required = schema.required;
            schemaDetails["application/json"].schema.type = "object";
            return create("TabItem", {
              label: label,
              value: `${index}-properties`,
              children: [
                create("div", {
                  children: createSchemaDetails({
                    title: "Schema",
                    body: {
                      content: schemaDetails,
                    },
                  }),
                }),
              ],
            });
          }

          if (schema.allOf !== undefined) {
            schemaDetails["application/json"].schema.allOf = schema.allOf;
            schemaDetails["application/json"].schema.example = schema.example;
            return create("TabItem", {
              label: label,
              value: `${index}-allOf`,
              children: [
                create("div", {
                  children: createSchemaDetails({
                    title: "Schema",
                    body: {
                      content: schemaDetails,
                    },
                  }),
                }),
              ],
            });
          }

          return undefined;
        }),
      }),
    ],
  });
}
