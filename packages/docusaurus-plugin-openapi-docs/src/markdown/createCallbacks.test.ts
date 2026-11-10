/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createCallbacks } from "./createCallbacks";

describe("createCallbacks", () => {
  it("renders a tab for a QUERY callback operation (RFC 10008)", () => {
    const callbacks = {
      onResult: {
        "{$request.body#/callbackUrl}": {
          query: {
            description: "Fetch the result",
            responses: { "200": { description: "OK" } },
          },
        },
      },
    };

    const markdown = createCallbacks({ callbacks: callbacks as any });

    expect(markdown).toContain('label={"QUERY onResult"}');
    expect(markdown).toContain('value={"query-onResult"}');
    expect(markdown).toContain('method={"query"}');
  });
});
