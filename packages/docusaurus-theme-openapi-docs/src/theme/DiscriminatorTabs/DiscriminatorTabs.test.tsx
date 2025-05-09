/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DiscriminatorTabs from "./index";

// Mock Docusaurus theme-common internals and hooks
jest.mock("@docusaurus/theme-common/internal", () => ({
  sanitizeTabsChildren: (children: any) => children,
  useTabs: () => ({
    selectedValue: "tab1",
    selectValue: jest.fn(),
    tabValues: [
      { value: "tab1", label: "Tab 1" },
      { value: "tab2", label: "Tab 2" },
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

describe("DiscriminatorTabs", () => {
  it("renders tab labels and content", () => {
    render(
      // @ts-ignore
      <DiscriminatorTabs>
        {/* @ts-ignore */}
        <TabItem value="tab1" label="Tab 1">
          Tab 1 Content
        </TabItem>
        {/* @ts-ignore */}
        <TabItem value="tab2" label="Tab 2">
          Tab 2 Content
        </TabItem>
      </DiscriminatorTabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 1 Content")).toBeInTheDocument();
  });
});
