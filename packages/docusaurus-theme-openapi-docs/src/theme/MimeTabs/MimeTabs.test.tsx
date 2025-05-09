/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen } from "@testing-library/react";
import MimeTabs from "./index";

// Mock Docusaurus theme-common internals and hooks
jest.mock("@docusaurus/theme-common/internal", () => ({
  sanitizeTabsChildren: (children: any) => children,
  useTabs: () => ({
    selectedValue: "application/json",
    selectValue: jest.fn(),
    tabValues: [
      { value: "application/json", label: "JSON" },
      { value: "application/xml", label: "XML" },
    ],
  }),
  useScrollPositionBlocker: () => ({
    blockElementScrollPositionUntilNextRender: jest.fn(),
  }),
}));
jest.mock("@docusaurus/useIsBrowser", () => () => true);

// Mock theme actions/hooks
jest.mock("@theme/ApiExplorer/Accept/slice", () => ({ setAccept: jest.fn() }));
jest.mock("@theme/ApiExplorer/ContentType/slice", () => ({
  setContentType: jest.fn(),
}));
jest.mock("@theme/ApiItem/hooks", () => ({
  useTypedDispatch: () => jest.fn(),
  useTypedSelector: () => jest.fn(),
}));
jest.mock("@theme/ApiItem/store", () => ({}));

// Minimal TabItem mock
const TabItem = ({ value, label, children }: any) => (
  <div data-testid={`tab-content-${value}`}>{children}</div>
);

// Test suite

describe("MimeTabs", () => {
  it("renders mime type tab labels and content", () => {
    render(
      // @ts-ignore
      <MimeTabs schemaType="string">
        {/* @ts-ignore */}
        <TabItem value="application/json" label="JSON">
          JSON Content
        </TabItem>
        {/* @ts-ignore */}
        <TabItem value="application/xml" label="XML">
          XML Content
        </TabItem>
      </MimeTabs>
    );
    expect(screen.getByText("JSON")).toBeInTheDocument();
    expect(screen.getByText("XML")).toBeInTheDocument();
    expect(screen.getByText("JSON Content")).toBeInTheDocument();
  });
});
