/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import * as prettier from "prettier";

import { createNodes } from "./createSchema";
import { SchemaObject } from "../openapi/types";

describe("createNodes", () => {
  it("should create readable MODs for oneOf primitive properties", () => {
    const schema: SchemaObject = {
      type: "object",
      properties: {
        oneOfProperty: {
          oneOf: [
            {
              type: "object",
              properties: {
                noseLength: {
                  type: "number",
                },
              },
              required: ["noseLength"],
              description: "Clown's nose length",
            },
            {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of strings",
            },
            {
              type: "boolean",
            },
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };
    expect(
      createNodes(schema, "request").map((md: any) =>
        prettier.format(md, { parser: "babel" })
      )
    ).toMatchSnapshot();
  });
});
