/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen } from "@testing-library/react";
import ApiLogo from "./index";

// Mock ThemedImage and useColorMode
jest.mock(
  "@theme/ThemedImage",
  () => {
    return {
      __esModule: true,
      default: (props: any) => <img data-testid="themed-image" {...props} />,
    };
  },
  { virtual: true }
);
jest.mock("@docusaurus/theme-common", () => ({
  useColorMode: jest.fn(),
}));
jest.mock("@docusaurus/useBaseUrl", () => () => (url: string) => url);

const { useColorMode } = require("@docusaurus/theme-common");

describe("ApiLogo", () => {
  const logo = { url: "/img/logo-light.png", altText: "Light Logo" };
  const darkLogo = { url: "/img/logo-dark.png", altText: "Dark Logo" };

  it("renders light and dark logos with correct alt text in light mode", () => {
    useColorMode.mockReturnValue({ colorMode: "light" });
    render(<ApiLogo logo={logo} darkLogo={darkLogo} />);
    const img = screen.getByTestId("themed-image");
    expect(img).toHaveAttribute("alt", "Light Logo");
    expect(img).toHaveAttribute("sources"); // ThemedImage uses sources prop
  });

  it("renders dark logo alt text in dark mode if provided", () => {
    useColorMode.mockReturnValue({ colorMode: "dark" });
    render(<ApiLogo logo={logo} darkLogo={darkLogo} />);
    const img = screen.getByTestId("themed-image");
    expect(img).toHaveAttribute("alt", "Dark Logo");
  });

  it("renders only the logo if darkLogo is not provided", () => {
    useColorMode.mockReturnValue({ colorMode: "light" });
    render(<ApiLogo logo={logo} />);
    const img = screen.getByTestId("themed-image");
    expect(img).toHaveAttribute("alt", "Light Logo");
  });

  it("renders only the darkLogo if logo is not provided", () => {
    useColorMode.mockReturnValue({ colorMode: "dark" });
    render(<ApiLogo darkLogo={darkLogo} />);
    const img = screen.getByTestId("themed-image");
    expect(img).toHaveAttribute("alt", "Dark Logo");
  });
});
