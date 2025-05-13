// @ts-nocheck
/// <reference types="@testing-library/jest-dom" />
import React from "react";

import { render } from "@testing-library/react";
import ApiItem from "./index";

jest.mock("@docusaurus/useIsBrowser", () => () => true);
jest.mock("@theme/Heading", () => (props: any) => (
  <div data-testid="Heading">{props.children}</div>
));

const mockRoute = { path: "/test", component: () => null, exact: true };
const MockContent = () => <div data-testid="mock-mdx">MDX Content</div>;
MockContent.frontMatter = {};
MockContent.metadata = {
  id: "test-id",
  version: "1.0",
  title: "Test Title",
  description: "Test Description",
  source: "test.md",
  sourceDirName: ".",
  slug: "/test",
  permalink: "/test",
  draft: false,
  unlisted: false,
  tags: [],
  frontMatter: {},
  lastUpdatedAt: 0,
  lastUpdatedBy: "",
  formattedLastUpdatedAt: "",
  editUrl: "",
  next: undefined,
  previous: undefined,
  sidebar: undefined,
  isDocsHomePage: false,
  displayTOC: false,
  tocMinHeadingLevel: 2,
  tocMaxHeadingLevel: 3,
};
MockContent.assets = {};
MockContent.toc = [];
MockContent.contentTitle = "";

describe("ApiItem", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<ApiItem route={mockRoute} content={MockContent} />)
    ).not.toThrow();
  });
});
