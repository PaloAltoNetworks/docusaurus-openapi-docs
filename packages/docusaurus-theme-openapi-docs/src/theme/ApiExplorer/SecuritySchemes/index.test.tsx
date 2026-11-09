/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { renderToStaticMarkup } from "react-dom/server";

import SecuritySchemes from "./index";

const mockState = {
  auth: {
    selected: "ApiKey",
    options: {
      ApiKey: [
        { key: "ApiKey", type: "apiKey", in: "header", name: "X-API-KEY" },
      ],
    },
  },
};

jest.mock(
  "@docusaurus/Link",
  () => ({
    __esModule: true,
    default: ({ to, children }: any) =>
      require("react").createElement("a", { href: to }, children),
  }),
  { virtual: true }
);
jest.mock(
  "@docusaurus/Translate",
  () => ({ translate: ({ message }: { message: string }) => message }),
  { virtual: true }
);
jest.mock("@theme/ApiItem/hooks", () => ({
  useTypedSelector: (select: (state: any) => any) => select(mockState),
}));

describe("SecuritySchemes", () => {
  it("links the scheme name to the info page", () => {
    const view = renderToStaticMarkup(
      <SecuritySchemes infoPath="docs/petstore/petstore-api" />
    );
    expect(view).toContain(
      '<a href="/docs/petstore/petstore-api#authentication">X-API-KEY</a>'
    );
  });

  it("renders the scheme name as text without an info page", () => {
    const view = renderToStaticMarkup(<SecuritySchemes />);
    expect(view).toContain("X-API-KEY");
    expect(view).not.toContain("<a");
    expect(view).not.toContain("undefined");
  });
});
