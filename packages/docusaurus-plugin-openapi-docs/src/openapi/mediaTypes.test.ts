/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { processOpenapiFile } from "./openapi";
import type { APIOptions, SidebarOptions } from "../types";

async function requestExamples(contentType: string) {
  const operation = {
    requestBody: {
      content: {
        [contentType]: {
          schema: {
            type: "object",
            properties: { message: { type: "string", example: "raw key" } },
          },
        },
      },
    },
    responses: { "200": { description: "OK" } },
  };
  const [items] = await processOpenapiFile(
    {
      openapi: "3.0.0",
      info: { title: "Media Types", version: "1.0.0" },
      paths: { "/example": { post: { ...operation, operationId: "example" } } },
      "x-webhooks": {
        event: { post: { ...operation, operationId: "event" } },
      },
    } as any,
    { specPath: "unused", outputDir: "build" } as APIOptions,
    {} as SidebarOptions
  );
  return items.filter((item) => item.type === "api");
}

describe("request sample media types", () => {
  it.each([
    "application/json",
    "application/json;charset=UTF-8",
    "APPLICATION/JSON ; charset=UTF-8",
    "application/problem+json; charset=utf-8",
    "Application/Problem+JSON; charset=utf-8",
    "application/json-seq; charset=utf-8",
    "application/jsonl",
  ])("generates API and webhook examples for %s", async (contentType) => {
    const items = await requestExamples(contentType);
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item.api.jsonRequestBodyExample).toEqual({ message: "raw key" });
      expect(Object.keys(item.api.requestBody?.content ?? {})).toEqual([
        contentType,
      ]);
    }
  });

  it.each(["text/plain; format=application/json", "xapplication/json"])(
    "does not generate a JSON example for %s",
    async (contentType) => {
      const items = await requestExamples(contentType);
      expect(items).toHaveLength(2);
      expect(items.map((item) => item.api.jsonRequestBodyExample)).toEqual([
        undefined,
        undefined,
      ]);
    }
  );
});
