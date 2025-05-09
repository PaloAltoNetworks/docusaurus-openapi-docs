/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen } from "@testing-library/react";
import OperationTabs from "./index";

// Mock Docusaurus theme-common internals and hooks
jest.mock("@docusaurus/theme-common/internal", () => ({
  sanitizeTabsChildren: (children: any) => children,
  useTabs: () => ({
    selectedValue: "get",
    selectValue: jest.fn(),
    tabValues: [
      { value: "get", label: "GET" },
      { value: "post", label: "POST" },
    ],
  }),
  useScrollPositionBlocker: () => ({
    blockElementScrollPositionUntilNextRender: jest.fn(),
  }),
}));
jest.mock("@docusaurus/useIsBrowser", () => () => true);

// Minimal TabItem mock
const TabItem = ({ value, label, children }: any) => (
  <div data-testid={`tab-content-${value}`}>{children}</div>
);

// Test suite

describe("OperationTabs", () => {
  it("renders operation tab labels and content", () => {
    render(
      // @ts-ignore
      <OperationTabs>
        {/* @ts-ignore */}
        <TabItem value="get" label="GET">
          GET Content
        </TabItem>
        {/* @ts-ignore */}
        <TabItem value="post" label="POST">
          POST Content
        </TabItem>
      </OperationTabs>
    );
    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByText("POST")).toBeInTheDocument();
    expect(screen.getByText("GET Content")).toBeInTheDocument();
  });
});
