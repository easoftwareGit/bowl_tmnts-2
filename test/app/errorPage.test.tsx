// test/app/error.test.tsx
// tests src/app/error.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ErrorPage from "@/app/error";

describe("ErrorPage (src/app/error.tsx)", () => {
  const testError = Object.assign(new Error("Test failure"), {
    digest: "abc123",
  });
  const mockReset = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence and capture the component's console.error
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders the heading without the emoji in its accessible name", () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Error" })
    ).toBeInTheDocument();
  });

  it("renders the message inside an alert region", () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong!");
  });

  it("does not show the raw error message to the user", () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    expect(screen.queryByText("Test failure")).not.toBeInTheDocument();
  });

  it("renders a warning-styled Try Again button", () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    const button = screen.getByRole("button", { name: /^try again$/i });
    expect(button).toHaveClass("btn", "btn-warning");
    expect(button).not.toHaveClass("btn-primary");
  });

  it("calls reset once when Try Again is clicked", async () => {
    const user = userEvent.setup();
    render(<ErrorPage error={testError} reset={mockReset} />);

    await user.click(screen.getByRole("button", { name: /^try again$/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("logs the error to the console", () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
  });

  it("logs again when a different error is passed", () => {
    const { rerender } = render(<ErrorPage error={testError} reset={mockReset} />);
    const secondError = new Error("Second failure");

    rerender(<ErrorPage error={secondError} reset={mockReset} />);
    expect(consoleErrorSpy).toHaveBeenCalledWith(secondError);
  });
});