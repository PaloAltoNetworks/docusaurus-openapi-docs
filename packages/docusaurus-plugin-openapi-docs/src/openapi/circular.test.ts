/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

// eslint-disable-next-line import/no-extraneous-dependencies
import { posixPath } from "@docusaurus/utils";

import { loadAndResolveSpec } from "./utils/loadAndResolveSpec";

describe("circular references", () => {
  it("flags self referencing schemas", async () => {
    const file = posixPath(
      path.join(__dirname, "__fixtures__/examples/self-ref.yaml")
    );
    const spec: any = await loadAndResolveSpec(file);
    expect(spec.components.schemas.Node.properties.child).toBe(
      "circular(Node)"
    );
  });
});
