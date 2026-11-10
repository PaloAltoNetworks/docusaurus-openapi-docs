/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/* eslint-disable import/no-extraneous-dependencies -- Declared by this theme workspace. */

import React from "react";

import MethodEndpoint from ".";

const {
  renderToStaticMarkup,
}: {
  renderToStaticMarkup: (children: React.ReactNode) => string;
} = require("react-dom/server");

jest.mock(
  "@docusaurus/ExecutionEnvironment",
  () => ({ __esModule: true, default: { canUseDOM: false } }),
  { virtual: true }
);
jest.mock("@docusaurus/BrowserOnly", () => () => null, { virtual: true });
jest.mock("@theme/ApiItem/hooks", () => ({ useTypedSelector: jest.fn() }));

describe("MethodEndpoint", () => {
  it("renders the QUERY method (RFC 10008) with the GET badge colour", () => {
    expect(
      renderToStaticMarkup(
        React.createElement(MethodEndpoint, {
          method: "query",
          path: "/pets/search",
        })
      )
    ).toContain('<span class="badge badge--primary">QUERY</span>');
  });
});
