/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import { posixPath } from "@docusaurus/utils";

import { readOpenapiFiles } from ".";

// npx jest packages/docusaurus-plugin-openapi/src/openapi/openapi.test.ts --watch

describe("openapi", () => {
  describe("readOpenapiFiles", () => {
    it("readOpenapiFiles", async () => {
      const results = await readOpenapiFiles(
        posixPath(path.join(__dirname, "__fixtures__/examples")),
        { specPath: "./", outputDir: "./" }
      );
      const categoryMeta = results.find((x) =>
        x.source.endsWith("_category_.json")
      );
      expect(categoryMeta).toBeFalsy();
      // console.log(results);
      const yaml = results.find((x) => x.source.endsWith("openapi.yaml"));
      expect(yaml).toBeTruthy();
      expect(yaml?.sourceDirName).toBe(".");
    });
  });
});
