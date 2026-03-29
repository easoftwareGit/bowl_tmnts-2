import React from "react";
import { render, screen } from "@testing-library/react";
import RegisterPage from "@/app/(auth)/register/page";

jest.mock("@/app/(auth)/register/form", () => ({
  __esModule: true,
  RegisterForm: () => <div data-testid="RegisterFormMock" />,
}));

describe("RegisterPage", () => {
  it("renders the heading", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("heading", { name: /create your account/i, level: 2 }))
      .toBeInTheDocument();
  });

  it("renders the RegisterForm", () => {
    render(<RegisterPage />);
    expect(screen.getByTestId("RegisterFormMock")).toBeInTheDocument();
  });

});