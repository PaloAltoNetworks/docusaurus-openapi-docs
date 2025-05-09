/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen } from "@testing-library/react";
import StatusCodes from "./index";

// Mock all theme imports used in StatusCodes
jest.mock("@theme/ApiTabs", () => (props: any) => (
  <div data-testid="ApiTabs">{props.children}</div>
));
jest.mock("@theme/Details", () => (props: any) => (
  <div data-testid="Details">{props.children}</div>
));
jest.mock("@theme/Markdown", () => (props: any) => (
  <div data-testid="Markdown">{props.children}</div>
));
jest.mock("@theme/ResponseHeaders", () => (props: any) => (
  <div data-testid="ResponseHeaders">{props.children}</div>
));
jest.mock("@theme/ResponseSchema", () => (props: any) => (
  <div data-testid="ResponseSchema">{props.children}</div>
));
jest.mock("@theme/TabItem", () => (props: any) => (
  <div data-testid="TabItem">{props.children}</div>
));

describe("StatusCodes", () => {
  it("renders nothing if responses prop is missing", () => {
    const { container } = render(<StatusCodes responses={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing if responses is empty", () => {
    const { container } = render(<StatusCodes responses={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders tabs for each response code", () => {
    const responses = {
      200: { description: "OK" },
      404: { description: "Not Found" },
    };
    render(<StatusCodes responses={responses} />);
    // Should render a tab for each code
    expect(screen.getAllByTestId("TabItem").length).toBe(2);
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });
});
