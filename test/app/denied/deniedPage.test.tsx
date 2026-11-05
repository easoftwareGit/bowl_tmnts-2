// test/app/denied/deniedPage.test.tsx
// tests src/app/denied/page.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Denied from "@/app/denied/page";

describe("Denied page", () => {
  describe("render the page", () => {
    it("renders the heading", () => {
      render(<Denied />);
      expect(
        screen.getByRole("heading", { level: 1, name: "Access Denied" })
      ).toBeInTheDocument();
    });

    it("renders the permission message", () => {
      render(<Denied />);
      expect(
        screen.getByText("You do not have permission to access this page.")
      ).toBeInTheDocument();
    });

    it("renders a link back to the home page", () => {
      render(<Denied />);
      const homeLink = screen.getByRole("link", { name: "Return to Home Page" });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("renders exactly one link", () => {
      render(<Denied />);
      expect(screen.getAllByRole("link")).toHaveLength(1);
    });
  });
});