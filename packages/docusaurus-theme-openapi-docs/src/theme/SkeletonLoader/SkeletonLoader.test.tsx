/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render } from "@testing-library/react";
import SkeletonLoader from "./index";

describe("SkeletonLoader", () => {
  it("renders with default size (md)", () => {
    const { container } = render(<SkeletonLoader />);
    expect(container.firstChild).toHaveClass("openapi-skeleton");
    expect(container.firstChild).toHaveClass("md");
  });

  it("renders with size 'sm'", () => {
    const { container } = render(<SkeletonLoader size="sm" />);
    expect(container.firstChild).toHaveClass("sm");
  });

  it("renders with size 'lg'", () => {
    const { container } = render(<SkeletonLoader size="lg" />);
    expect(container.firstChild).toHaveClass("lg");
  });
});
