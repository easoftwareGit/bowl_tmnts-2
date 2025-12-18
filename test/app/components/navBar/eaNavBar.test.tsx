import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import EaNavbar from "@/components/navBar/eaNavbar";

// --------- mocks ---------
jest.mock("next/link", () => {
  // react-bootstrap supports `as={Link}`; this keeps it simple in tests
  return function MockNextLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: any;
  }) {
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
  signOut: (...args: any[]) => mockSignOut(...args),
}));

// Capture ModelConfirm props so we can assert show/title/message and invoke handlers.
type ConfirmProps = {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

let lastConfirmProps: ConfirmProps | null = null;

jest.mock("@/components/modal/confirmModal", () => {
  return function MockConfirmModal(props: ConfirmProps) {
    lastConfirmProps = props;
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
function setUnauthed(pathname = "/") {
  mockUsePathname.mockReturnValue(pathname);
  mockUseSession.mockReturnValue({ status: "unauthenticated", data: null });
}

function setAuthed(name = "Eric", pathname = "/") {
  mockUsePathname.mockReturnValue(pathname);
  mockUseSession.mockReturnValue({
    status: "authenticated",
    data: { user: { name } },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  lastConfirmProps = null;
});

// --------- tests ---------
describe("EaNavbar", () => {
  it("renders basic nav links and brand", () => {
    setUnauthed("/");

    render(<EaNavbar />);

    expect(screen.getByText("BT DB")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /hello/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /results/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /upcoming/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sample/i })).toBeInTheDocument();

    // confirm modal exists and is closed by default
    expect(screen.getByTestId("confirm-show")).toHaveTextContent("false");
    expect(screen.getByTestId("confirm-title")).toHaveTextContent("Confirm log out");
    expect(screen.getByTestId("confirm-message")).toHaveTextContent("Do you want to log out?");
  });
  it("when unauthenticated, shows Log In link and no user dropdown", () => {
    setUnauthed("/results");

    render(<EaNavbar />);

    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    expect(screen.queryByText("Eric")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /tournaments/i })).not.toBeInTheDocument();
  });
  it("when authenticated, shows user dropdown title and dropdown items", async () => {
    setAuthed("Eric", "/results");
    const user = userEvent.setup();

    render(<EaNavbar />);

    // Dropdown toggle uses the title text; react-bootstrap renders it as a button-like element
    const dropdownToggle = screen.getByText("Eric");
    expect(dropdownToggle).toBeInTheDocument();

    // Open dropdown
    await user.click(dropdownToggle);

    expect(
      screen.getByRole("link", { name: /^tournaments$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^account$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^log out$/i })
    ).toBeInTheDocument();
  });
  it("clicking 'Log out' opens confirm modal", async () => {
    setAuthed("Eric", "/");
    const user = userEvent.setup();

    render(<EaNavbar />);

    await user.click(screen.getByText("Eric"));
    await user.click(screen.getByText(/^log out$/i));

    expect(screen.getByTestId("confirm-show")).toHaveTextContent("true");
    expect(lastConfirmProps?.show).toBe(true);
  });
  it("cancel closes confirm modal", async () => {
    setAuthed("Eric", "/");
    const user = userEvent.setup();

    render(<EaNavbar />);

    await user.click(screen.getByText("Eric"));
    await user.click(screen.getByText(/^log out$/i));
    expect(screen.getByTestId("confirm-show")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByTestId("confirm-show")).toHaveTextContent("false");
    expect(lastConfirmProps?.show).toBe(false);
  });
  it("confirm signs out (redirect:false), routes to '/', and closes modal", async () => {
    setAuthed("Eric", "/");
    mockSignOut.mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    render(<EaNavbar />);

    await user.click(screen.getByText("Eric"));
    await user.click(screen.getByText(/^log out$/i));
    expect(screen.getByTestId("confirm-show")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: /confirm/i }));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/");

    // modal should be closed after confirm
    expect(screen.getByTestId("confirm-show")).toHaveTextContent("false");
  });
  it("marks the matching pathname link as active (react-bootstrap adds 'active' class)", () => {
    setUnauthed("/results");

    render(<EaNavbar />);

    const resultsLink = screen.getByRole("link", { name: /results/i });
    expect(resultsLink).toHaveClass("active");

    const helloLink = screen.getByRole("link", { name: /hello/i });
    expect(helloLink).not.toHaveClass("active");
  });
});