/// <reference types="@testing-library/jest-dom" />
// Mock ResizeObserver for Jest environment
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ApiTabs from "./index";
// @ts-ignore
import TabItem from "@theme/TabItem";

// Mocks for Docusaurus internals and theme

jest.mock("@docusaurus/useIsBrowser", () => () => true);
jest.mock("@theme/Heading", () => (props: any) => (
  <div data-testid="Heading">{props.children}</div>
));

describe("ApiTabs", () => {
  it("renders tab labels and content", () => {
    render(
      // @ts-ignore
      <ApiTabs label="Test Tabs" id="test-tabs">
        {/* @ts-ignore */}
        <TabItem value="tab1" label="Tab 1">
          Tab 1 Content
        </TabItem>
        {/* @ts-ignore */}
        <TabItem value="tab2" label="Tab 2">
          Tab 2 Content
        </TabItem>
      </ApiTabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 1 Content")).toBeInTheDocument();
  });
});
