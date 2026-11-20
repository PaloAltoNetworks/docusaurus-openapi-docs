/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createAuth } from "./slice";

const bearerApiKey = {
  type: "apiKey",
  name: "Authorization",
  in: "header",
} as const;

const bearerHttp = {
  type: "http",
  scheme: "bearer",
} as const;

describe("createAuth", () => {
  it("dedupes a scheme reused by OR security alternatives", () => {
    const state = createAuth({
      security: [
        { bearer: ["read:users"] },
        { bearer: ["read:minimal:users"] },
      ],
      securitySchemes: { bearer: bearerApiKey },
      options: { authPersistence: false },
    });

    expect(Object.keys(state.options)).toEqual(["bearer"]);
    expect(state.selected).toBe("bearer");
    expect(state.options["bearer"]).toHaveLength(1);
    expect(state.options["bearer"][0].key).toBe("bearer");
  });

  it("dedupes an http bearer scheme reused by OR alternatives", () => {
    const state = createAuth({
      security: [{ BearerAuth: [] }, { BearerAuth: ["read:users"] }],
      securitySchemes: { BearerAuth: bearerHttp },
      options: { authPersistence: false },
    });

    expect(state.options["BearerAuth"]).toHaveLength(1);
    expect(state.options["BearerAuth"][0].key).toBe("BearerAuth");
  });

  it("keeps different schemes combined with AND in one option", () => {
    const state = createAuth({
      security: [{ BearerAuth: [], ApiKey: [] }],
      securitySchemes: {
        BearerAuth: bearerHttp,
        ApiKey: bearerApiKey,
      },
      options: { authPersistence: false },
    });

    expect(state.options["BearerAuth and ApiKey"]).toHaveLength(2);
    expect(
      state.options["BearerAuth and ApiKey"].map((scheme) => scheme.key)
    ).toEqual(["BearerAuth", "ApiKey"]);
  });

  it("keeps distinct OR alternatives as separate options", () => {
    const state = createAuth({
      security: [{ BearerAuth: [] }, { ApiKey: [] }],
      securitySchemes: {
        BearerAuth: bearerHttp,
        ApiKey: bearerApiKey,
      },
      options: { authPersistence: false },
    });

    expect(Object.keys(state.options)).toEqual(["BearerAuth", "ApiKey"]);
    expect(state.options["BearerAuth"]).toHaveLength(1);
    expect(state.options["ApiKey"]).toHaveLength(1);
  });
});
