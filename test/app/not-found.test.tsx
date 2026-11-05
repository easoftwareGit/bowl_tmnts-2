// test/app/not-found.test.tsx
// tests src/app/not-found.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotFound from "@/app/not-found";

describe("NotFound (src/app/not-found.tsx)", () => {
  it("renders the page heading as an h1", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: /^not found$/i })
    ).toBeInTheDocument();
  });

  it("renders exactly one h1", () => {
    render(<NotFound />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders the explanation message", () => {
    render(<NotFound />);
    expect(
      screen.getByText("Sorry, this page does not exist")
    ).toBeInTheDocument();
  });
});