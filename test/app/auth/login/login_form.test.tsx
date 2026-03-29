// src/app/(auth)/login/form.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/app/(auth)/login/form";

// ---- mocks ----
const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));

const mockSignIn = jest.fn();

jest.mock("next-auth/react", () => ({
  __esModule: true,
  signIn: (...args: any[]) => mockSignIn(...args),
}));

// next/image -> plain img so RTL can see it
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  },
}));

// next/link -> plain anchor
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Alert -> simple wrapper
jest.mock("@/components/ui/index", () => ({
  __esModule: true,
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div role="alert">{children}</div>
  ),
}));

// isEmail implementation is already tested elsewhere, so it's fine to mock it here.
// These tests focus on LoginForm behavior.
const mockIsEmail = jest.fn();
jest.mock("@/lib/validation/validation", () => ({
  __esModule: true,
  isEmail: (email: string) => mockIsEmail(email),
}));

// Keep real constants (or mock if you prefer)
jest.mock("@/lib/validation/constants", () => ({
  __esModule: true,
  maxEmailLength: 100,
  maxPasswordLength: 50,
}));

// ---- Helpers----
const setup = async (callbackUrlValue: string | null = null) => {
  mockGet.mockReturnValue(callbackUrlValue);
  const user = userEvent.setup();
  render(<LoginForm />);
  const email = screen.getByLabelText(/email/i) as HTMLInputElement;
  const password = screen.getByLabelText(/password/i) as HTMLInputElement;
  const loginBtn = screen.getByTestId("btnSubmit")
  const googleBtn = screen.getByRole("button", { name: /sign in with google/i });
  return { user, email, password, loginBtn, googleBtn };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsEmail.mockImplementation((email: string) => /\S+@\S+\.\S+/.test(email));
});

// ---- Tests ----
describe("LoginForm", () => {
  it("renders fields, links, and buttons", async () => {
    await setup();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.getByTestId("btnSubmit")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create account/i })).toHaveAttribute(
      "href",
      "/register"
    );

    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();

    // default is hidden password
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    // default icon for "show"
    expect(screen.getByAltText("show")).toBeInTheDocument();
  });

  it("toggles password visibility (password <-> text) and swaps the icon alt text", async () => {
    const { user, password } = await setup();

    // toggle button is the small button next to password; easiest is click the icon
    await user.click(screen.getByAltText("show"));
    expect(password.type).toBe("text");
    expect(screen.getByAltText("hide")).toBeInTheDocument();

    await user.click(screen.getByAltText("hide"));
    expect(password.type).toBe("password");
    expect(screen.getByAltText("show")).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form; does not call signIn", async () => {
    const { user, loginBtn } = await setup();

    await user.click(loginBtn);

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();

    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows 'Email is not valid' when email fails validation; does not call signIn", async () => {
    mockIsEmail.mockReturnValue(false);

    const { user, email, password, loginBtn } = await setup();

    await user.type(email, "not-an-email");
    await user.type(password, "abc123");
    await user.click(loginBtn);

    expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears a field error when that input changes", async () => {
    const { user, email, loginBtn } = await setup();

    await user.click(loginBtn);
    expect(await screen.findByText("Email is required")).toBeInTheDocument();

    await user.type(email, "a"); // handleInputChange clears email error
    await waitFor(() => {
      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });
  });

  it("credentials sign-in success pushes to default callbackUrl when callbackUrl is missing", async () => {
    const { user, email, password, loginBtn } = await setup(null);

    mockSignIn.mockResolvedValue({ ok: true, error: null });

    await user.type(email, "adam@email.com");
    await user.type(password, "Test123!");
    await user.click(loginBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "adam@email.com",
        password: "Test123!",
        callbackUrl: "/user/tmnts",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
  });

  it("treats callbackUrl '/' as default '/user/tmnts'", async () => {
    const { user, email, password, loginBtn } = await setup("/");

    mockSignIn.mockResolvedValue({ ok: true, error: null });

    await user.type(email, "adam@email.com");
    await user.type(password, "Test123!");
    await user.click(loginBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", expect.objectContaining({}));
    });

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      redirect: false,
      email: "adam@email.com",
      password: "Test123!",
      callbackUrl: "/user/tmnts",
    });
    expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
  });

  it("accepts a relative callbackUrl as-is (e.g., '/dataEntry/runTmnt/123')", async () => {
    const { user, email, password, loginBtn } = await setup("/dataEntry/runTmnt/123");

    mockSignIn.mockResolvedValue({ ok: true, error: null });

    await user.type(email, "adam@email.com");
    await user.type(password, "Test123!");
    await user.click(loginBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "adam@email.com",
        password: "Test123!",
        callbackUrl: "/dataEntry/runTmnt/123",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/dataEntry/runTmnt/123");
  });

  it("strips an absolute callbackUrl down to path+search+hash", async () => {
    const { user, email, password, loginBtn } = await setup(
      "https://example.com/user/tmnts?page=2#top"
    );

    mockSignIn.mockResolvedValue({ ok: true, error: null });

    await user.type(email, "adam@email.com");
    await user.type(password, "Test123!");
    await user.click(loginBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "adam@email.com",
        password: "Test123!",
        callbackUrl: "/user/tmnts?page=2#top",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/user/tmnts?page=2#top");
  });

  it("credentials sign-in failure shows 'Invalid email or password' and does not push", async () => {
    const { user, email, password, loginBtn } = await setup("/user/tmnts");

    mockSignIn.mockResolvedValue({ ok: false, error: "CredentialsSignin" });

    await user.type(email, "adam@email.com");
    await user.type(password, "wrongpass");
    await user.click(loginBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("credentials sign-in throw shows 'Other error logging in' and does not push", async () => {
    const { user, email, password, loginBtn } = await setup("/user/tmnts");

    mockSignIn.mockRejectedValue(new Error("boom"));

    await user.type(email, "adam@email.com");
    await user.type(password, "Test123!");
    await user.click(loginBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent("Other error logging in");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clicking Google sign-in calls signIn('google', { callbackUrl })", async () => {
    const { user, googleBtn } = await setup("/dataEntry/runTmnt/999");

    mockSignIn.mockResolvedValue({ ok: true });

    await user.click(googleBtn);

    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/dataEntry/runTmnt/999" });
  });

  it("Google sign-in throw shows 'Other error logging in with Google'", async () => {
    const { user, googleBtn } = await setup("/user/tmnts");

    mockSignIn.mockRejectedValue(new Error("google down"));

    await user.click(googleBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Other error logging in with Google"
    );
  });
});