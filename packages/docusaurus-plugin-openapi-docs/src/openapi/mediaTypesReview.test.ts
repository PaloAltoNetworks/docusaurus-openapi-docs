/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { processOpenapiFile } from "./openapi";
import type { APIOptions, SidebarOptions } from "../types";
import { isFormUrlEncoded } from "./utils/utils/openapi";

function mediaType(message: string) {
  return {
    schema: {
      type: "object",
      properties: { message: { type: "string", example: message } },
    },
  };
}

async function example(kind: string, content: Record<string, any>) {
  const operation = {
    operationId: "example",
    requestBody: { content },
    responses: { "200": { description: "OK" } },
  };
  const [items] = await processOpenapiFile(
    {
      openapi: "3.0.0",
      info: { title: "Media Types", version: "1.0.0" },
      paths: kind === "API" ? { "/example": { post: operation } } : {},
      ...(kind === "webhook" && {
        "x-webhooks": { event: { post: operation } },
      }),
    } as any,
    { specPath: "unused", outputDir: "build" } as APIOptions,
    {} as SidebarOptions
  );
  const apis = items.filter((item) => item.type === "api");
  expect(apis).toHaveLength(1);
  return apis[0].api.jsonRequestBodyExample;
}

describe.each(["API", "webhook"])("%s request example priority", (kind) => {
  it.each([
    {
      "application/jsonl": mediaType("jsonl"),
      "APPLICATION/JSON; charset=UTF-8": mediaType("json"),
    },
    {
      "application/problem+json": mediaType("vendor"),
      "application/json": mediaType("json"),
    },
  ])("prefers exact JSON over an earlier JSON-like key %j", async (content) => {
    expect(await example(kind, content)).toEqual({ message: "json" });
  });

  it("prefers vendor JSON over an earlier line-oriented variant", async () => {
    expect(
      await example(kind, {
        "text/plain": mediaType("text"),
        "application/json-seq": mediaType("sequence"),
        "application/problem+json; charset=UTF-8": mediaType("vendor"),
      })
    ).toEqual({ message: "vendor" });
  });

  it.each(["application/jsonl", "application/json-seq; charset=UTF-8"])(
    "retains the existing standalone %s example",
    async (contentType) => {
      expect(
        await example(kind, { [contentType]: mediaType("legacy") })
      ).toEqual({
        message: "legacy",
      });
    }
  );
});

it.each([
  ["application/x-www-form-urlencoded; charset=UTF-8", true],
  [" Application/X-WWW-Form-Urlencoded ; charset=UTF-8", true],
  ["application/x-www-form-urlencoded", true],
  ["application/x-www-form-urlencoded-extra", false],
])("recognizes the plugin form type %s", (contentType, expected) => {
  expect(isFormUrlEncoded(contentType as string)).toBe(expected);
});
