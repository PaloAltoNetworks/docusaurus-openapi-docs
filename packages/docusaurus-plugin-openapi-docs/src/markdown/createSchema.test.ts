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
  describe("oneOf", () => {
    it("should create readable MODs for oneOf primitive properties", async () => {
      const schema: SchemaObject = {
        "x-tags": ["clown"],
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
        await Promise.all(
          createNodes(schema, "request").map(
            async (md: any) => await prettier.format(md, { parser: "babel" })
          )
        )
      ).toMatchSnapshot();
    });
  });

  describe("allOf", () => {
    it("should render same-level properties with allOf", async () => {
      const schema: SchemaObject = {
        allOf: [
          {
            type: "object",
            properties: {
              allOfProp1: {
                type: "string",
              },
              allOfProp2: {
                type: "string",
              },
            },
          },
        ],
        properties: {
          parentProp1: {
            type: "string",
          },
          parentProp2: {
            type: "string",
          },
        },
      };

      expect(
        await Promise.all(
          createNodes(schema, "response").map(
            async (md: any) => await prettier.format(md, { parser: "babel" })
          )
        )
      ).toMatchSnapshot();
    });

    it("should correctly merge nested properties from multiple allOf schemas", async () => {
      const schema: SchemaObject = {
        allOf: [
          {
            type: "object",
            properties: {
              outerProp1: {
                type: "object",
                properties: {
                  innerProp1: {
                    type: "string",
                  },
                },
              },
            },
          },
          {
            type: "object",
            properties: {
              outerProp2: {
                type: "object",
                properties: {
                  innerProp2: {
                    type: "number",
                  },
                },
              },
            },
          },
        ],
      };

      expect(
        await Promise.all(
          createNodes(schema, "response").map(
            async (md: any) => await prettier.format(md, { parser: "babel" })
          )
        )
      ).toMatchSnapshot();
    });

    it("should correctly handle shared required properties across allOf schemas", async () => {
      const schema: SchemaObject = {
        allOf: [
          {
            type: "object",
            properties: {
              sharedProp: {
                type: "string",
              },
            },
            required: ["sharedProp"],
          },
          {
            type: "object",
            properties: {
              anotherProp: {
                type: "number",
              },
            },
            required: ["anotherProp"],
          },
        ],
      };

      expect(
        await Promise.all(
          createNodes(schema, "response").map(
            async (md: any) => await prettier.format(md, { parser: "babel" })
          )
        )
      ).toMatchSnapshot();
    });

    // Could not resolve values for path:"properties.conflictingProp.type". They are probably incompatible. Values:
    // "string"
    // "number"
    // it("should handle conflicting properties in allOf schemas", async () => {
    //   const schema: SchemaObject = {
    //     allOf: [
    //       {
    //         type: "object",
    //         properties: {
    //           conflictingProp: {
    //             type: "string",
    //           },
    //         },
    //       },
    //       {
    //         type: "object",
    //         properties: {
    //           conflictingProp: {
    //             type: "number",
    //           },
    //         },
    //       },
    //     ],
    //   };

    //   expect(
    //     await Promise.all(
    //       createNodes(schema, "response").map(
    //         async (md: any) => await prettier.format(md, { parser: "babel" })
    //       )
    //     )
    //   ).toMatchSnapshot();
    // });

    // Could not resolve values for path:"type". They are probably incompatible. Values:
    // "object"
    // "array"
    // it("should handle mixed data types in allOf schemas", async () => {
    //   const schema: SchemaObject = {
    //     allOf: [
    //       {
    //         type: "object",
    //         properties: {
    //           mixedTypeProp1: {
    //             type: "string",
    //           },
    //         },
    //       },
    //       {
    //         type: "array",
    //         items: {
    //           type: "number",
    //         },
    //       },
    //     ],
    //   };

    //   expect(
    //     await Promise.all(
    //       createNodes(schema, "response").map(
    //         async (md: any) => await prettier.format(md, { parser: "babel" })
    //       )
    //     )
    //   ).toMatchSnapshot();
    // });

    it("should correctly deep merge properties in allOf schemas", async () => {
      const schema: SchemaObject = {
        allOf: [
          {
            type: "object",
            properties: {
              deepProp: {
                type: "object",
                properties: {
                  innerProp1: {
                    type: "string",
                  },
                },
              },
            },
          },
          {
            type: "object",
            properties: {
              deepProp: {
                type: "object",
                properties: {
                  innerProp2: {
                    type: "number",
                  },
                },
              },
            },
          },
        ],
      };

      expect(
        await Promise.all(
          createNodes(schema, "response").map(
            async (md: any) => await prettier.format(md, { parser: "babel" })
          )
        )
      ).toMatchSnapshot();
    });

    // it("should handle discriminator with allOf schemas", async () => {
    //   const schema: SchemaObject = {
    //     allOf: [
    //       {
    //         type: "object",
    //         discriminator: {
    //           propertyName: "type",
    //         },
    //         properties: {
    //           type: {
    //             type: "string",
    //           },
    //         },
    //       },
    //       {
    //         type: "object",
    //         properties: {
    //           specificProp: {
    //             type: "string",
    //           },
    //         },
    //       },
    //     ],
    //   };

    //   expect(
    //     await Promise.all(
    //       createNodes(schema, "response").map(
    //         async (md: any) => await prettier.format(md, { parser: "babel" })
    //       )
    //     )
    //   ).toMatchSnapshot();
    // });
  });

  describe("additionalProperties", () => {
    it.each([
      [
        {
          allOf: [
            {
              oneOf: [
                {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["nose"],
                    },
                  },
                  required: ["type"],
                },
                {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["mouth"],
                    },
                  },
                  required: ["type"],
                },
                {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["eyes"],
                    },
                    default: {
                      type: "string",
                    },
                  },
                  required: ["type"],
                },
              ],
            },
            {
              type: "object",
              properties: {
                description: {
                  type: "string",
                  description: "Description of the body part.",
                },
              },
              required: ["description"],
            },
          ],
        },
      ],
      [
        {
          type: "array",
          items: { type: "object", properties: { a: "string", b: "number" } },
        },
      ],
      [{ type: "string" }],
      [{ type: "number" }],
      [{ type: "integer" }],
      [{ type: "boolean" }],
      [false],
      [true],
      [{}],
    ] as [SchemaObject["additionalProperties"]][])(
      "should handle additionalProperties: %p",
      async (additionalProperties) => {
        const schema: SchemaObject = {
          type: "object",
          additionalProperties,
        };

        expect(
          await Promise.all(
            createNodes(schema, "request").map(
              async (md: any) => await prettier.format(md, { parser: "babel" })
            )
          )
        ).toMatchSnapshot();
      }
    );
  });
});
