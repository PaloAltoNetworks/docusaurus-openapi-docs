/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen } from "@testing-library/react";
import { OpeningArrayBracket, ClosingArrayBracket } from "./index";

describe("ArrayBrackets", () => {
  it("renders the opening array bracket", () => {
    render(<OpeningArrayBracket />);
    expect(screen.getByText(/Array \[/)).toBeInTheDocument();
  });

  it("renders the closing array bracket", () => {
    render(<ClosingArrayBracket />);
    expect(screen.getByText("]")).toBeInTheDocument();
  });
});
