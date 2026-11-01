// test/app/auth/register/registerPage.test.tsx
// Tests for src/app/(auth)/register/page.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import RegisterPage from "@/app/(auth)/register/page";

// replace the form with a stub: this file tests the page, not the form
// (the form has its own tests in registerForm.test.tsx)
jest.mock("@/app/(auth)/register/registerForm", () => ({
  __esModule: true,
  RegisterForm: () => <div data-testid="RegisterFormMock" />,
}));

describe("RegisterPage", () => {
  it("renders the heading", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: "Create your Account", level: 2 }),
    ).toBeInTheDocument();
  });

  it("renders only one heading", () => {
    render(<RegisterPage />);

    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("renders the RegisterForm once", () => {
    render(<RegisterPage />);

    expect(screen.getAllByTestId("RegisterFormMock")).toHaveLength(1);
  });

});