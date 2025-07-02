/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

// eslint-disable-next-line import/no-extraneous-dependencies
import { posixPath } from "@docusaurus/utils";

import { readOpenapiFiles, processOpenapiFiles } from ".";

describe("webhooks", () => {
  it("uses event name when summary and operationId are missing", async () => {
    const files = await readOpenapiFiles(
      posixPath(path.join(__dirname, "__fixtures__/webhook/openapi.yaml"))
    );

    const [items] = await processOpenapiFiles(
      files,
      { specPath: "", outputDir: "" } as any,
      {}
    );

    const webhookItem = items.find((item) => item.type === "api");
    expect(webhookItem?.id).toBe("order-created");
  });
});
