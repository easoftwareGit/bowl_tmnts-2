// test/app/auth/register/registerPage.test.tsx
// Tests for src/app/(auth)/register/page.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// ---- mocks ----

// next/server extends the global Request class, which jsdom doesn't have;
// the page only uses connection() from it
jest.mock("next/server", () => ({
  __esModule: true,
  connection: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/auth/registration", () => ({
  __esModule: true,
  isBetaRegistrationOpen: jest.fn(),
}));

// replace the form with a stub: this file tests the page, not the form
// (the form has its own tests in registerForm.test.tsx)
jest.mock("@/app/(auth)/register/registerForm", () => ({
  __esModule: true,
  RegisterForm: () => <div data-testid="RegisterFormMock" />,
}));

// next/link mocked the same way as the other auth tests
// (RegistrationClosed is NOT mocked, so the closed tests check it too)
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

// Import AFTER mocks
import RegisterPage from "@/app/(auth)/register/page";
import { connection } from "next/server";
import { isBetaRegistrationOpen } from "@/lib/auth/registration";

const mockConnection = connection as jest.Mock;
const mockIsOpen = isBetaRegistrationOpen as jest.Mock;

// RegisterPage is async: await it, then render the JSX it returns
async function renderPage() {
  const ui = await RegisterPage();
  return render(ui);
}

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when registration is open", () => {
    beforeEach(() => mockIsOpen.mockReturnValue(true));

    it("renders the heading", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: "Create your Account", level: 2 }),
      ).toBeInTheDocument();
    });

    it("renders only one heading", async () => {
      await renderPage();

      expect(screen.getAllByRole("heading")).toHaveLength(1);
    });

    it("renders the RegisterForm once", async () => {
      await renderPage();

      expect(screen.getAllByTestId("RegisterFormMock")).toHaveLength(1);
    });

    it("does not render the closed message", async () => {
      await renderPage();

      expect(
        screen.queryByRole("heading", { name: /registration closed/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("when registration is closed", () => {
    beforeEach(() => mockIsOpen.mockReturnValue(false));

    it("renders the closed heading instead of the form", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: "Registration Closed", level: 2 }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("RegisterFormMock")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /create your account/i }),
      ).not.toBeInTheDocument();
    });

    it("renders only one heading", async () => {
      await renderPage();

      expect(screen.getAllByRole("heading")).toHaveLength(1);
    });

    it("links to the contact and sign-in pages", async () => {
      await renderPage();

      expect(screen.getByRole("link", { name: /contact us/i })).toHaveAttribute(
        "href",
        "/contact",
      );
      expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
        "href",
        "/login",
      );
    });
  });

  it("opts into per-request rendering before reading the registration mode", async () => {
    mockIsOpen.mockReturnValue(true);
    await renderPage();

    expect(mockConnection).toHaveBeenCalledTimes(1);
    expect(mockConnection.mock.invocationCallOrder[0]).toBeLessThan(
      mockIsOpen.mock.invocationCallOrder[0],
    );
  });
});