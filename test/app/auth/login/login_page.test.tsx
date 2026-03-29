// test/app/auth/login/login_page.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";

jest.mock("@/app/(auth)/login/form", () => ({
  __esModule: true,
  LoginForm: () => <div data-testid="LoginFormMock" />,
}));

describe("LoginPage", () => {
  it("renders the heading", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: /^login$/i, level: 2 })).toBeInTheDocument();
  });

  it("renders the LoginForm", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("LoginFormMock")).toBeInTheDocument();
  });
});