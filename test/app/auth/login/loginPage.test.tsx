// test/app/auth/login/loginPage.test.tsx
// Tests for src/app/(auth)/login/page.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// the form has its own tests; here we only check the page wraps it
jest.mock("@/app/(auth)/login/loginForm", () => ({
  __esModule: true,
  LoginForm: () => <div data-testid="LoginFormMock" />,
}));

import LoginPage from "@/app/(auth)/login/page";

describe("LoginPage", () => {
  it("renders the Login heading as an h2", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: /^login$/i }),
    ).toBeInTheDocument();
  });

  it("renders the login form", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("LoginFormMock")).toBeInTheDocument();
  });
});