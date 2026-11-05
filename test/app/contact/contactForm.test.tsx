// test/app/contact/contactForm.test.tsx
// tests src/app/contact/contactForm.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContactForm } from "@/app/contact/contactForm";

const name = "Eric Adolphson";
const email = "easoftware@gmail.com";
const phone = "(925) 689-5397";

describe("ContactForm", () => {
  describe("render the component", () => {
    it("renders the field labels as terms", () => {
      render(<ContactForm />);
      const terms = screen.getAllByRole("term");
      expect(terms).toHaveLength(3);
      expect(terms[0]).toHaveTextContent("Name:");
      expect(terms[1]).toHaveTextContent("Email:");
      expect(terms[2]).toHaveTextContent("Phone:");
    });

    it("renders the values as definitions", () => {
      render(<ContactForm />);
      const definitions = screen.getAllByRole("definition");
      expect(definitions).toHaveLength(3);
      expect(definitions[0]).toHaveTextContent(name);
      expect(definitions[1]).toHaveTextContent(email);
      expect(definitions[2]).toHaveTextContent(phone);
    });

    it("renders the name", () => {
      render(<ContactForm />);
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    it("renders the email as a mailto link", () => {
      render(<ContactForm />);
      const emailLink = screen.getByRole("link", { name: email });
      expect(emailLink).toHaveAttribute("href", `mailto:${email}`);
      expect(emailLink).toHaveClass("email-link");
    });

    it("renders the phone as a tel link", () => {
      render(<ContactForm />);
      const phoneLink = screen.getByRole("link", { name: phone });
      expect(phoneLink).toHaveAttribute("href", "tel:+19256895397");
      expect(phoneLink).toHaveClass("phone-link");
    });

    it("renders exactly two links (email and phone)", () => {
      render(<ContactForm />);
      expect(screen.getAllByRole("link")).toHaveLength(2);
    });

    it("does not render any input controls", () => {
      render(<ContactForm />);
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});