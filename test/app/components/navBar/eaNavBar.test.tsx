// test/app/components/navBar/eaNavbar.test.tsx
// tests src/app/components/navBar/eaNavbar.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import EaNavbar from "@/components/navBar/eaNavbar";

// --------- mocks ---------
jest.mock("next/link", () => {
  return function MockNextLink({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

const mockUsePathname = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush }),
}));

const mockUseSession = jest.fn();
const mockSignOut = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

type ConfirmProps = {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

jest.mock("@/components/modal/confirmModal", () => {
  return function MockConfirmModal(props: ConfirmProps) {
    return (
      <div data-testid="confirm-modal">
        <div data-testid="confirm-show">{String(props.show)}</div>
        <div data-testid="confirm-title">{props.title}</div>
        <div data-testid="confirm-message">{props.message}</div>
        <button type="button" onClick={props.onConfirm}>
          confirm
        </button>
        <button type="button" onClick={props.onCancel}>
          cancel
        </button>
      </div>
    );
  };
});

// --------- helpers ---------
function setLoading(pathname = "/") {
  mockUsePathname.mockReturnValue(pathname);
  mockUseSession.mockReturnValue({ status: "loading", data: null });
}

function setUnauthed(pathname = "/") {
  mockUsePathname.mockReturnValue(pathname);
  mockUseSession.mockReturnValue({ status: "unauthenticated", data: null });
}

function setAuthed(
  user: { name?: string | null; email?: string | null } = { name: "Eric" },
  pathname = "/"
) {
  mockUsePathname.mockReturnValue(pathname);
  mockUseSession.mockReturnValue({ status: "authenticated", data: { user } });
}

async function openLogoutModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Eric" }));
  await user.click(screen.getByRole("button", { name: /^log out$/i }));
}

beforeEach(() => {
  jest.clearAllMocks();
});

// --------- tests ---------
describe("EaNavbar", () => {
  describe("public links", () => {
    it("renders the brand linking to home and the public nav links", () => {
      setUnauthed();
      render(<EaNavbar />);

      expect(screen.getByRole("link", { name: "BT DB" })).toHaveAttribute("href", "/");
      expect(screen.getByRole("link", { name: /hello/i })).toHaveAttribute("href", "/hello");
      expect(screen.getByRole("link", { name: /results/i })).toHaveAttribute("href", "/results");
      expect(screen.getByRole("link", { name: /upcoming/i })).toHaveAttribute("href", "/upcoming");
      expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "/contact");
      expect(screen.getByRole("link", { name: /sample/i })).toHaveAttribute("href", "/sample");
    });

    it("marks the link matching the pathname as active", () => {
      setUnauthed("/results");
      render(<EaNavbar />);

      expect(screen.getByRole("link", { name: /results/i })).toHaveClass("active");
      expect(screen.getByRole("link", { name: /hello/i })).not.toHaveClass("active");
    });

    it("renders the confirm modal closed by default with the right text", () => {
      setUnauthed();
      render(<EaNavbar />);

      expect(screen.getByTestId("confirm-show")).toHaveTextContent("false");
      expect(screen.getByTestId("confirm-title")).toHaveTextContent("Confirm log out");
      expect(screen.getByTestId("confirm-message")).toHaveTextContent("Do you want to log out?");
    });
  });

  describe("while the session is loading", () => {
    it("shows a placeholder instead of Log In or the user menu", () => {
      setLoading();
      render(<EaNavbar />);

      expect(screen.getByTestId("auth-loading")).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Eric" })).not.toBeInTheDocument();
    });

    it("still renders the public links", () => {
      setLoading();
      render(<EaNavbar />);

      expect(screen.getByRole("link", { name: /results/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /upcoming/i })).toBeInTheDocument();
    });
  });

  describe("when unauthenticated", () => {
    it("shows the Log In link and no user menu or placeholder", () => {
      setUnauthed("/results");
      render(<EaNavbar />);

      expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
        "href",
        "/api/auth/signin"
      );
      expect(screen.queryByRole("button", { name: "Eric" })).not.toBeInTheDocument();
      expect(screen.queryByTestId("auth-loading")).not.toBeInTheDocument();
    });
  });

  describe("when authenticated", () => {
    it("shows the user menu with Tournaments, Account and Log out", async () => {
      setAuthed({ name: "Eric" }, "/results");
      const user = userEvent.setup();
      render(<EaNavbar />);

      expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
      expect(screen.queryByTestId("auth-loading")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Eric" }));

      expect(screen.getByRole("link", { name: /^tournaments$/i })).toHaveAttribute(
        "href",
        "/user/tmnts"
      );
      expect(screen.getByRole("link", { name: /^account$/i })).toHaveAttribute(
        "href",
        "/user/acctInfo"
      );
      expect(screen.getByRole("button", { name: /^log out$/i })).toBeInTheDocument();
    });

    it("falls back to the email when the user has no name", () => {
      setAuthed({ name: null, email: "eric@example.com" });
      render(<EaNavbar />);

      expect(screen.getByRole("button", { name: "eric@example.com" })).toBeInTheDocument();
    });

    it("falls back to 'Account' when the user has no name or email", () => {
      setAuthed({ name: null, email: null });
      render(<EaNavbar />);

      expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
    });
  });

  describe("log out flow", () => {
    it("clicking Log out opens the confirm modal", async () => {
      setAuthed();
      const user = userEvent.setup();
      render(<EaNavbar />);

      await openLogoutModal(user);

      expect(screen.getByTestId("confirm-show")).toHaveTextContent("true");
    });

    it("cancel closes the modal without signing out", async () => {
      setAuthed();
      const user = userEvent.setup();
      render(<EaNavbar />);

      await openLogoutModal(user);
      await user.click(screen.getByRole("button", { name: /^cancel$/i }));

      expect(screen.getByTestId("confirm-show")).toHaveTextContent("false");
      expect(mockSignOut).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("confirm signs out with redirect:false, routes to '/', and closes the modal", async () => {
      setAuthed();
      mockSignOut.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      render(<EaNavbar />);

      await openLogoutModal(user);
      await user.click(screen.getByRole("button", { name: /^confirm$/i }));

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
      expect(mockPush).toHaveBeenCalledTimes(1);
      await waitFor(() =>
        expect(screen.getByTestId("confirm-show")).toHaveTextContent("false")
      );
    });
  });
});
