// test/app/auth/register/registrationClosed.test.tsx
// Tests for src/app/(auth)/register/registrationClosed.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RegistrationClosed } from "@/app/(auth)/register/registrationClosed";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("RegistrationClosed", () => {
  it("renders the heading as an h2, matching the register page's heading level", () => {
    render(<RegistrationClosed />);
    expect(
      screen.getByRole("heading", { level: 2, name: /^registration closed$/i })
    ).toBeInTheDocument();
  });

  it("says new accounts are not being accepted", () => {
    render(<RegistrationClosed />);
    expect(
      screen.getByText("New accounts are not being accepted right now.")
    ).toBeInTheDocument();
  });

  it("explains that the administrator creates director accounts", () => {
    render(<RegistrationClosed />);
    expect(
      screen.getByText(/director accounts are created by the site administrator/i)
    ).toBeInTheDocument();
  });

  it("links to the contact page", () => {
    render(<RegistrationClosed />);
    expect(screen.getByRole("link", { name: /^contact us$/i })).toHaveAttribute(
      "href",
      "/contact"
    );
  });

  it("links to the sign-in page", () => {
    render(<RegistrationClosed />);
    expect(screen.getByRole("link", { name: /^sign in$/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("renders only those two links and no form", () => {
    render(<RegistrationClosed />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});