import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ContactPage from "../../../src/app/contact/page";

describe("ContactPage", () => {
  describe("render the page", () => {
    it("renders the Contact heading as an h1", () => {
      render(<ContactPage />);
      const heading = screen.getByRole("heading", { level: 1, name: "Contact" });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("h2");
    });

    it("renders only one heading", () => {
      render(<ContactPage />);
      expect(screen.getAllByRole("heading")).toHaveLength(1);
    });

    it("renders the ContactForm", () => {
      render(<ContactPage />);
      // the contact details list from ContactForm
      expect(screen.getAllByRole("term")).toHaveLength(3);
      expect(screen.getByText("Name:")).toBeInTheDocument();
      expect(screen.getByText("Email:")).toBeInTheDocument();
      expect(screen.getByText("Phone:")).toBeInTheDocument();
    });

    it("renders the email and phone links from ContactForm", () => {
      render(<ContactPage />);
      expect(
        screen.getByRole("link", { name: "easoftware@gmail.com" })
      ).toHaveAttribute("href", "mailto:easoftware@gmail.com");
      expect(
        screen.getByRole("link", { name: "(925) 689-5397" })
      ).toHaveAttribute("href", "tel:+19256895397");
    });

    it("renders the heading before the contact details", () => {
      render(<ContactPage />);
      const heading = screen.getByRole("heading", { level: 1 });
      const firstTerm = screen.getAllByRole("term")[0];
      // DOCUMENT_POSITION_FOLLOWING (4): firstTerm comes after heading
      expect(
        heading.compareDocumentPosition(firstTerm) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });
});