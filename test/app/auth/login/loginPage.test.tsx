// test/app/auth/login/loginPage.test.tsx
// Tests for src/app/(auth)/login/loginForm.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { LoginForm } from "@/app/(auth)/login/loginForm";
import {
  maxEmailLength,
  maxPasswordLength,
} from "@/lib/validation/constants";

// ---- mocks ----

const mockPush = jest.fn();
const mockGet = jest.fn();
jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));

jest.mock("next-auth/react", () => ({
  __esModule: true,
  signIn: jest.fn(),
}));
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  },
}));

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

jest.mock("@/components/ui/index", () => ({
  __esModule: true,
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div role="alert">{children}</div>
  ),
}));

// isEmail is tested elsewhere; keep the rest of the module real
const mockIsEmail = jest.fn();
jest.mock("@/lib/validation/validation", () => ({
  __esModule: true,
  ...jest.requireActual("@/lib/validation/validation"),
  isEmail: (email: string) => mockIsEmail(email),
}));

// ---- helpers ----

type User = ReturnType<typeof userEvent.setup>;

const defaultCallback = "/user/tmnts";
const testUser = { email: "test@email.com", password: "Test123!" };

const signInOk = { error: undefined, status: 200, ok: true, url: null, code: undefined };
const signInFailed = {
  error: "CredentialsSignin",
  status: 401,
  ok: false,
  url: null,
  code: "credentials",
};

// selector: "input" so the label query never matches the
// "Show password" toggle button
const emailInput = () =>
  screen.getByLabelText(/^email$/i, { selector: "input" }) as HTMLInputElement;
const passwordInput = () =>
  screen.getByLabelText(/^password$/i, { selector: "input" }) as HTMLInputElement;

// exact names, so this only matches the Login submit button
const loginButton = () =>
  screen.getByRole("button", { name: /^(login|logging in\.\.\.)$/i });
const passwordToggle = () => screen.getByRole("button", { name: "Show password" });
const googleButton = () =>
  screen.getByRole("button", { name: /sign in with google/i });

// renders the form with the given callbackUrl search param
const setup = (callbackUrl: string | null = null) => {
  mockGet.mockImplementation((key: string) =>
    key === "callbackUrl" ? callbackUrl : null,
  );
  const user = userEvent.setup();
  render(<LoginForm />);
  return user;
};

const fillAndSubmit = async (
  user: User,
  email = testUser.email,
  password = testUser.password,
) => {
  if (email) await user.type(emailInput(), email);
  if (password) await user.type(passwordInput(), password);
  await user.click(loginButton());
};

// makes signIn wait until the test resolves it
const deferSignIn = () => {
  const handle: { resolve: (v: unknown) => void } = { resolve: () => {} };
  mockSignIn.mockImplementation(
    () =>
      new Promise((res) => {
        handle.resolve = res;
      }) as never,
  );
  return handle;
};

beforeEach(() => {
  jest.resetAllMocks();
  mockIsEmail.mockImplementation((email: string) => /\S+@\S+\.\S+/.test(email));
  mockSignIn.mockResolvedValue(signInOk);
});

describe("LoginForm", () => {
  describe("render", () => {
    it("renders fields, links and buttons", () => {
      setup();

      expect(emailInput()).toBeInTheDocument();
      expect(passwordInput()).toBeInTheDocument();
      expect(loginButton()).toHaveTextContent("Login");
      expect(googleButton()).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /create account/i }),
      ).toHaveAttribute("href", "/register");
    });

    it("starts blank, with no errors or alerts", () => {
      setup();

      expect(emailInput()).toHaveValue("");
      expect(passwordInput()).toHaveValue("");
      expect(emailInput()).not.toHaveClass("is-invalid");
      expect(passwordInput()).not.toHaveClass("is-invalid");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(loginButton()).toBeEnabled();
    });

    it("limits the email length with maxLength", () => {
      setup();

      expect(emailInput()).toHaveAttribute("maxlength", String(maxEmailLength));
    });

    it("hides the password by default", () => {
      setup();

      expect(passwordInput()).toHaveAttribute("type", "password");
      expect(passwordToggle()).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("show / hide password", () => {
    it("toggles password visibility", async () => {
      const user = setup();

      await user.click(passwordToggle());
      expect(passwordInput()).toHaveAttribute("type", "text");
      expect(passwordToggle()).toHaveAttribute("aria-pressed", "true");

      await user.click(passwordToggle());
      expect(passwordInput()).toHaveAttribute("type", "password");
      expect(passwordToggle()).toHaveAttribute("aria-pressed", "false");
    });

    it("keeps the typed password when toggling", async () => {
      const user = setup();

      await user.type(passwordInput(), testUser.password);
      await user.click(passwordToggle());

      expect(passwordInput()).toHaveValue(testUser.password);
    });

    it("does not submit the form when the toggle is clicked", async () => {
      const user = setup();

      await user.click(passwordToggle());

      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("shows required errors for an empty form and does not sign in", async () => {
      const user = setup();

      await user.click(loginButton());

      expect(await screen.findByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(emailInput()).toHaveClass("is-invalid");
      expect(passwordInput()).toHaveClass("is-invalid");
      expect(mockSignIn).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("treats a password of only spaces as missing", async () => {
      const user = setup();

      await fillAndSubmit(user, testUser.email, "   ");

      expect(await screen.findByText("Password is required")).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("shows 'Email is not valid' when isEmail fails and does not sign in", async () => {
      mockIsEmail.mockReturnValue(false);
      const user = setup();

      await fillAndSubmit(user, "not-an-email");

      expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
      expect(mockIsEmail).toHaveBeenCalledWith("not-an-email");
      expect(emailInput()).toHaveClass("is-invalid");
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("checks the email in lower case", async () => {
      const user = setup();

      await fillAndSubmit(user, "Test@Email.COM");

      await waitFor(() => expect(mockIsEmail).toHaveBeenCalledWith("test@email.com"));
    });

    it("blocks a password longer than the max length", async () => {
      const user = setup();
      // paste: much faster than typing a long password key by key
      await user.type(emailInput(), testUser.email);
      await user.click(passwordInput());
      await user.paste("a".repeat(maxPasswordLength + 1));
      await user.click(loginButton());

      expect(
        await screen.findByText(
          `Password must be ${maxPasswordLength} characters or less`,
        ),
      ).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("allows a password of exactly the max length", async () => {
      const user = setup();
      await user.type(emailInput(), testUser.email);
      await user.click(passwordInput());
      await user.paste("a".repeat(maxPasswordLength));
      await user.click(loginButton());

      await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));
    });

    it("clears a field error when that input changes", async () => {
      const user = setup();

      await user.click(loginButton());
      expect(await screen.findByText("Email is required")).toBeInTheDocument();

      await user.type(emailInput(), "a");

      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
      expect(emailInput()).not.toHaveClass("is-invalid");
      // the other field's error stays
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  describe("callbackUrl", () => {
    it.each([
      ["missing", null, defaultCallback],
      ["empty", "", defaultCallback],
      ["'/'", "/", defaultCallback],
      ["a relative path", "/dataEntry/runTmnt/123", "/dataEntry/runTmnt/123"],
      ["a relative path with search and hash", "/user/tmnts?page=2#top", "/user/tmnts?page=2#top"],
      ["an absolute URL", "https://example.com/user/tmnts?page=2#top", "/user/tmnts?page=2#top"],
      ["an absolute http URL", "http://localhost:3000/dataEntry/runTmnt/1", "/dataEntry/runTmnt/1"],
      ["an absolute URL with no path", "https://example.com", defaultCallback],
      ["an absolute URL with only '/'", "https://example.com/", defaultCallback],
      // SECURITY: anything that could leave the site goes to the default
      ["protocol-relative", "//evil.com", defaultCallback],
      ["protocol-relative with a path", "//evil.com/user/tmnts", defaultCallback],
      ["a backslash trick", "/\\evil.com", defaultCallback],
      ["an absolute URL whose path is protocol-relative", "https://example.com//evil.com", defaultCallback],
      ["a javascript: URL", "javascript:alert(1)", defaultCallback],
      ["a data: URL", "data:text/html,hi", defaultCallback],
      ["a bare host", "evil.com", defaultCallback],
      ["a broken absolute URL", "http://", defaultCallback],
    ])("when callbackUrl is %s, uses %p -> %p", async (_label, raw, expected) => {
      const user = setup(raw);

      await fillAndSubmit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith(expected));
      expect(mockSignIn).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({ callbackUrl: expected }),
      );
    });

    it("reads the callbackUrl search param", () => {
      setup("/user/tmnts");

      expect(mockGet).toHaveBeenCalledWith("callbackUrl");
    });
  });

  describe("credentials sign in", () => {
    it("signs in and goes to the callbackUrl", async () => {
      const user = setup();

      await fillAndSubmit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith(defaultCallback));
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: testUser.email,
        password: testUser.password,
        callbackUrl: defaultCallback,
      });
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("signs in with the email in lower case", async () => {
      const user = setup();

      await fillAndSubmit(user, "Test@Email.COM");

      await waitFor(() =>
        expect(mockSignIn).toHaveBeenCalledWith(
          "credentials",
          expect.objectContaining({ email: "test@email.com" }),
        ),
      );
    });

    it("sends the password exactly as typed", async () => {
      const user = setup();

      await fillAndSubmit(user, testUser.email, "Test123! ");

      await waitFor(() =>
        expect(mockSignIn).toHaveBeenCalledWith(
          "credentials",
          expect.objectContaining({ password: "Test123! " }),
        ),
      );
    });

    it("goes to the callbackUrl when signIn returns undefined", async () => {
      // the form only checks res?.error
      mockSignIn.mockResolvedValue(undefined as never);
      const user = setup();

      await fillAndSubmit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith(defaultCallback));
    });

    it("shows 'Invalid email or password' when signIn fails and does not navigate", async () => {
      mockSignIn.mockResolvedValue(signInFailed);
      const user = setup();

      await fillAndSubmit(user, testUser.email, "wrongpass");

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Invalid email or password",
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows 'Other error logging in' when signIn throws and does not navigate", async () => {
      mockSignIn.mockRejectedValue(new Error("boom"));
      const user = setup();

      await fillAndSubmit(user);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Other error logging in",
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("clears the login alert when an input changes", async () => {
      mockSignIn.mockResolvedValue(signInFailed);
      const user = setup();

      await fillAndSubmit(user);
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      await user.type(passwordInput(), "x");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("clears the login alert when the form is submitted again", async () => {
      mockSignIn.mockResolvedValueOnce(signInFailed);
      const user = setup();

      await fillAndSubmit(user);
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      // 2nd submit succeeds (default mock)
      await user.click(loginButton());

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith(defaultCallback));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("keeps what the user typed after a failed sign in", async () => {
      mockSignIn.mockResolvedValue(signInFailed);
      const user = setup();

      await fillAndSubmit(user);
      await screen.findByRole("alert");

      expect(emailInput()).toHaveValue(testUser.email);
      expect(passwordInput()).toHaveValue(testUser.password);
    });
  });

  describe("submitting state", () => {
    it("disables the button and shows 'Logging in...' while signing in", async () => {
      const pending = deferSignIn();
      const user = setup();

      await fillAndSubmit(user);

      await waitFor(() => expect(loginButton()).toBeDisabled());
      expect(loginButton()).toHaveTextContent("Logging in...");
      expect(loginButton()).toHaveAttribute("aria-busy", "true");

      pending.resolve(signInOk);
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith(defaultCallback));
    });

    it("signs in only once when Login is clicked twice", async () => {
      const pending = deferSignIn();
      const user = setup();

      await fillAndSubmit(user);
      await user.click(loginButton());

      pending.resolve(signInOk);
      await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });

    it("re-enables the button after a failed sign in", async () => {
      mockSignIn.mockResolvedValue(signInFailed);
      const user = setup();

      await fillAndSubmit(user);
      await screen.findByRole("alert");

      expect(loginButton()).toBeEnabled();
      expect(loginButton()).toHaveTextContent(/^Login$/);
    });

    it("re-enables the button after signIn throws", async () => {
      mockSignIn.mockRejectedValue(new Error("boom"));
      const user = setup();

      await fillAndSubmit(user);
      await screen.findByRole("alert");

      expect(loginButton()).toBeEnabled();
    });

    it("keeps the button disabled after success, while navigating", async () => {
      const user = setup();

      await fillAndSubmit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalled());
      expect(loginButton()).toBeDisabled();
    });

    it("does not disable the button when validation fails", async () => {
      const user = setup();

      await user.click(loginButton());

      expect(await screen.findByText("Email is required")).toBeInTheDocument();
      expect(loginButton()).toBeEnabled();
    });
  });

  describe("Google sign in", () => {
    it("calls signIn('google') with the callbackUrl", async () => {
      const user = setup("/dataEntry/runTmnt/999");

      await user.click(googleButton());

      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith("google", {
        callbackUrl: "/dataEntry/runTmnt/999",
      });
    });

    it("uses the default callbackUrl for an unsafe callbackUrl", async () => {
      const user = setup("//evil.com");

      await user.click(googleButton());

      expect(mockSignIn).toHaveBeenCalledWith("google", {
        callbackUrl: defaultCallback,
      });
    });

    it("does not submit the credentials form", async () => {
      const user = setup();

      await user.click(googleButton());

      expect(mockSignIn).not.toHaveBeenCalledWith("credentials", expect.anything());
      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });

    it("shows 'Other error logging in with Google' when signIn throws", async () => {
      mockSignIn.mockRejectedValue(new Error("google down"));
      const user = setup();

      await user.click(googleButton());

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Other error logging in with Google",
      );
    });

    it("clears the Google error when clicked again", async () => {
      mockSignIn.mockRejectedValueOnce(new Error("google down"));
      const user = setup();

      await user.click(googleButton());
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      // 2nd click works (default mock)
      await user.click(googleButton());

      await waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
      );
    });
  });
});


// // // test/app/auth/login/login_page.test.tsx
// // Tests for src\app\(auth)\login\loginPage.tsx
// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { signIn } from "next-auth/react";
// import { LoginForm } from "@/app/(auth)/login/loginForm";
// import {
//   maxEmailLength,
//   maxPasswordLength,
// } from "@/lib/validation/constants";

// // ---- mocks ----

// const mockPush = jest.fn();
// const mockGet = jest.fn();
// jest.mock("next/navigation", () => ({
//   __esModule: true,
//   useRouter: () => ({ push: mockPush }),
//   useSearchParams: () => ({ get: mockGet }),
// }));

// jest.mock("next-auth/react", () => ({
//   __esModule: true,
//   signIn: jest.fn(),
// }));
// const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
//     // eslint-disable-next-line @next/next/no-img-element
//     return <img {...props} alt={props.alt ?? ""} />;
//   },
// }));

// jest.mock("next/link", () => ({
//   __esModule: true,
//   default: ({
//     href,
//     children,
//     ...rest
//   }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
//     href: string;
//     children: React.ReactNode;
//   }) => (
//     <a href={href} {...rest}>
//       {children}
//     </a>
//   ),
// }));

// jest.mock("@/components/ui/index", () => ({
//   __esModule: true,
//   Alert: ({ children }: { children: React.ReactNode }) => (
//     <div role="alert">{children}</div>
//   ),
// }));

// // isEmail is tested elsewhere; keep the rest of the module real
// const mockIsEmail = jest.fn();
// jest.mock("@/lib/validation/validation", () => ({
//   __esModule: true,
//   ...jest.requireActual("@/lib/validation/validation"),
//   isEmail: (email: string) => mockIsEmail(email),
// }));

// // ---- helpers ----

// type User = ReturnType<typeof userEvent.setup>;

// const defaultCallback = "/user/tmnts";
// const demoUser = { email: "adam@email.com", password: "Test123!" };

// const signInOk = { error: undefined, status: 200, ok: true, url: null, code: undefined };
// const signInFailed = {
//   error: "CredentialsSignin",
//   status: 401,
//   ok: false,
//   url: null,
//   code: "credentials",
// };

// // selector: "input" so the label query never matches the
// // "Show password" toggle button
// const emailInput = () =>
//   screen.getByLabelText(/^email$/i, { selector: "input" }) as HTMLInputElement;
// const passwordInput = () =>
//   screen.getByLabelText(/^password$/i, { selector: "input" }) as HTMLInputElement;

// // exact names, so this never also matches "login as Adam Smith"
// const loginButton = () =>
//   screen.getByRole("button", { name: /^(login|logging in\.\.\.)$/i });
// const passwordToggle = () => screen.getByRole("button", { name: "Show password" });
// const demoButton = () => screen.getByRole("button", { name: /login as adam smith/i });
// const googleButton = () =>
//   screen.getByRole("button", { name: /sign in with google/i });

// // renders the form with the given callbackUrl search param
// const setup = (callbackUrl: string | null = null) => {
//   mockGet.mockImplementation((key: string) =>
//     key === "callbackUrl" ? callbackUrl : null,
//   );
//   const user = userEvent.setup();
//   render(<LoginForm />);
//   return user;
// };

// const fillAndSubmit = async (
//   user: User,
//   email = demoUser.email,
//   password = demoUser.password,
// ) => {
//   if (email) await user.type(emailInput(), email);
//   if (password) await user.type(passwordInput(), password);
//   await user.click(loginButton());
// };

// // makes signIn wait until the test resolves it
// const deferSignIn = () => {
//   const handle: { resolve: (v: unknown) => void } = { resolve: () => {} };
//   mockSignIn.mockImplementation(
//     () =>
//       new Promise((res) => {
//         handle.resolve = res;
//       }) as never,
//   );
//   return handle;
// };

// beforeEach(() => {
//   jest.resetAllMocks();
//   mockIsEmail.mockImplementation((email: string) => /\S+@\S+\.\S+/.test(email));
//   mockSignIn.mockResolvedValue(signInOk);
// });

// describe("LoginForm", () => {
//   describe("render", () => {
//     it("renders fields, links and buttons", () => {
//       setup();

//       expect(emailInput()).toBeInTheDocument();
//       expect(passwordInput()).toBeInTheDocument();
//       expect(loginButton()).toHaveTextContent("Login");
//       expect(demoButton()).toBeInTheDocument();
//       expect(googleButton()).toBeInTheDocument();
//       expect(
//         screen.getByRole("link", { name: /create account/i }),
//       ).toHaveAttribute("href", "/register");
//     });

//     it("starts blank, with no errors or alerts", () => {
//       setup();

//       expect(emailInput()).toHaveValue("");
//       expect(passwordInput()).toHaveValue("");
//       expect(emailInput()).not.toHaveClass("is-invalid");
//       expect(passwordInput()).not.toHaveClass("is-invalid");
//       expect(screen.queryByRole("alert")).not.toBeInTheDocument();
//       expect(loginButton()).toBeEnabled();
//     });

//     it("limits the email length with maxLength", () => {
//       setup();

//       expect(emailInput()).toHaveAttribute("maxlength", String(maxEmailLength));
//     });

//     it("hides the password by default", () => {
//       setup();

//       expect(passwordInput()).toHaveAttribute("type", "password");
//       expect(passwordToggle()).toHaveAttribute("aria-pressed", "false");
//     });
//   });

//   describe("show / hide password", () => {
//     it("toggles password visibility", async () => {
//       const user = setup();

//       await user.click(passwordToggle());
//       expect(passwordInput()).toHaveAttribute("type", "text");
//       expect(passwordToggle()).toHaveAttribute("aria-pressed", "true");

//       await user.click(passwordToggle());
//       expect(passwordInput()).toHaveAttribute("type", "password");
//       expect(passwordToggle()).toHaveAttribute("aria-pressed", "false");
//     });

//     it("keeps the typed password when toggling", async () => {
//       const user = setup();

//       await user.type(passwordInput(), demoUser.password);
//       await user.click(passwordToggle());

//       expect(passwordInput()).toHaveValue(demoUser.password);
//     });

//     it("does not submit the form when the toggle is clicked", async () => {
//       const user = setup();

//       await user.click(passwordToggle());

//       expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
//       expect(mockSignIn).not.toHaveBeenCalled();
//     });
//   });

//   describe("validation", () => {
//     it("shows required errors for an empty form and does not sign in", async () => {
//       const user = setup();

//       await user.click(loginButton());

//       expect(await screen.findByText("Email is required")).toBeInTheDocument();
//       expect(screen.getByText("Password is required")).toBeInTheDocument();
//       expect(emailInput()).toHaveClass("is-invalid");
//       expect(passwordInput()).toHaveClass("is-invalid");
//       expect(mockSignIn).not.toHaveBeenCalled();
//       expect(mockPush).not.toHaveBeenCalled();
//     });

//     it("treats a password of only spaces as missing", async () => {
//       const user = setup();

//       await fillAndSubmit(user, demoUser.email, "   ");

//       expect(await screen.findByText("Password is required")).toBeInTheDocument();
//       expect(mockSignIn).not.toHaveBeenCalled();
//     });

//     it("shows 'Email is not valid' when isEmail fails and does not sign in", async () => {
//       mockIsEmail.mockReturnValue(false);
//       const user = setup();

//       await fillAndSubmit(user, "not-an-email");

//       expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
//       expect(mockIsEmail).toHaveBeenCalledWith("not-an-email");
//       expect(emailInput()).toHaveClass("is-invalid");
//       expect(mockSignIn).not.toHaveBeenCalled();
//     });

//     it("checks the email in lower case", async () => {
//       const user = setup();

//       await fillAndSubmit(user, "Adam@Email.COM");

//       await waitFor(() => expect(mockIsEmail).toHaveBeenCalledWith("adam@email.com"));
//     });

//     it("blocks a password longer than the max length", async () => {
//       const user = setup();
//       // paste: much faster than typing a long password key by key
//       await user.type(emailInput(), demoUser.email);
//       await user.click(passwordInput());
//       await user.paste("a".repeat(maxPasswordLength + 1));
//       await user.click(loginButton());

//       expect(
//         await screen.findByText(
//           `Password must be ${maxPasswordLength} characters or less`,
//         ),
//       ).toBeInTheDocument();
//       expect(mockSignIn).not.toHaveBeenCalled();
//     });

//     it("allows a password of exactly the max length", async () => {
//       const user = setup();
//       await user.type(emailInput(), demoUser.email);
//       await user.click(passwordInput());
//       await user.paste("a".repeat(maxPasswordLength));
//       await user.click(loginButton());

//       await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));
//     });

//     it("clears a field error when that input changes", async () => {
//       const user = setup();

//       await user.click(loginButton());
//       expect(await screen.findByText("Email is required")).toBeInTheDocument();

//       await user.type(emailInput(), "a");

//       expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
//       expect(emailInput()).not.toHaveClass("is-invalid");
//       // the other field's error stays
//       expect(screen.getByText("Password is required")).toBeInTheDocument();
//     });
//   });

//   describe("callbackUrl", () => {
//     it.each([
//       ["missing", null, defaultCallback],
//       ["empty", "", defaultCallback],
//       ["'/'", "/", defaultCallback],
//       ["a relative path", "/dataEntry/runTmnt/123", "/dataEntry/runTmnt/123"],
//       ["a relative path with search and hash", "/user/tmnts?page=2#top", "/user/tmnts?page=2#top"],
//       ["an absolute URL", "https://example.com/user/tmnts?page=2#top", "/user/tmnts?page=2#top"],
//       ["an absolute http URL", "http://localhost:3000/dataEntry/runTmnt/1", "/dataEntry/runTmnt/1"],
//       ["an absolute URL with no path", "https://example.com", defaultCallback],
//       ["an absolute URL with only '/'", "https://example.com/", defaultCallback],
//       // SECURITY: anything that could leave the site goes to the default
//       ["protocol-relative", "//evil.com", defaultCallback],
//       ["protocol-relative with a path", "//evil.com/user/tmnts", defaultCallback],
//       ["a backslash trick", "/\\evil.com", defaultCallback],
//       ["an absolute URL whose path is protocol-relative", "https://example.com//evil.com", defaultCallback],
//       ["a javascript: URL", "javascript:alert(1)", defaultCallback],
//       ["a data: URL", "data:text/html,hi", defaultCallback],
//       ["a bare host", "evil.com", defaultCallback],
//       ["a broken absolute URL", "http://", defaultCallback],
//     ])("when callbackUrl is %s, uses %p -> %p", async (_label, raw, expected) => {
//       const user = setup(raw);

//       await fillAndSubmit(user);

//       await waitFor(() => expect(mockPush).toHaveBeenCalledWith(expected));
//       expect(mockSignIn).toHaveBeenCalledWith(
//         "credentials",
//         expect.objectContaining({ callbackUrl: expected }),
//       );
//     });

//     it("reads the callbackUrl search param", () => {
//       setup("/user/tmnts");

//       expect(mockGet).toHaveBeenCalledWith("callbackUrl");
//     });
//   });

//   describe("credentials sign in", () => {
//     it("signs in and goes to the callbackUrl", async () => {
//       const user = setup();

//       await fillAndSubmit(user);

//       await waitFor(() => expect(mockPush).toHaveBeenCalledWith(defaultCallback));
//       expect(mockSignIn).toHaveBeenCalledTimes(1);
//       expect(mockSignIn).toHaveBeenCalledWith("credentials", {
//         redirect: false,
//         email: demoUser.email,
//         password: demoUser.password,
//         callbackUrl: defaultCallback,
//       });
//       expect(mockPush).toHaveBeenCalledTimes(1);
//     });

//     it("signs in with the email in lower case", async () => {
//       const user = setup();

//       await fillAndSubmit(user, "Adam@Email.COM");

//       await waitFor(() =>
//         expect(mockSignIn).toHaveBeenCalledWith(
//           "credentials",
//           expect.objectContaining({ email: "adam@email.com" }),
//         ),
//       );
//     });

//     it("sends the password exactly as typed", async () => {
//       const user = setup();

//       await fillAndSubmit(user, demoUser.email, "Test123! ");

//       await waitFor(() =>
//         expect(mockSignIn).toHaveBeenCalledWith(
//           "credentials",
//           expect.objectContaining({ password: "Test123! " }),
//         ),
//       );
//     });

//     it("goes to the callbackUrl when signIn returns undefined", async () => {
//       // the form only checks res?.error
//       mockSignIn.mockResolvedValue(undefined as never);
//       const user = setup();

//       await fillAndSubmit(user);

//       await waitFor(() => expect(mockPush).toHaveBeenCalledWith(defaultCallback));
//     });

//     it("shows 'Invalid email or password' when signIn fails and does not navigate", async () => {
//       mockSignIn.mockResolvedValue(signInFailed);
//       const user = setup();

//       await fillAndSubmit(user, demoUser.email, "wrongpass");

//       expect(await screen.findByRole("alert")).toHaveTextContent(
//         "Invalid email or password",
//       );
//       expect(mockPush).not.toHaveBeenCalled();
//     });

//     it("shows 'Other error logging in' when signIn throws and does not navigate", async () => {
//       mockSignIn.mockRejectedValue(new Error("boom"));
//       const user = setup();

//       await fillAndSubmit(user);

//       expect(await screen.findByRole("alert")).toHaveTextContent(
//         "Other error logging in",
//       );
//       expect(mockPush).not.toHaveBeenCalled();
//     });

//     it("clears the login alert when an input changes", async () => {
//       mockSignIn.mockResolvedValue(signInFailed);
//       const user = setup();

//       await fillAndSubmit(user);
//       expect(await screen.findByRole("alert")).toBeInTheDocument();

//       await user.type(passwordInput(), "x");

//       expect(screen.queryByRole("alert")).not.toBeInTheDocument();
//     });

//     it("clears the login alert when the form is submitted again", async () => {
//       mockSignIn.mockResolvedValueOnce(signInFailed);
//       const user = setup();

//       await fillAndSubmit(user);
//       expect(await screen.findByRole("alert")).toBeInTheDocument();

//       // 2nd submit succeeds (default mock)
//       await user.click(loginButton());

//       await waitFor(() => expect(mockPush).toHaveBeenCalledWith(defaultCallback));
//       expect(screen.queryByRole("alert")).not.toBeInTheDocument();
//     });

//     it("keeps what the user typed after a failed sign in", async () => {
//       mockSignIn.mockResolvedValue(signInFailed);
//       const user = setup();

//       await fillAndSubmit(user);
//       await screen.findByRole("alert");

//       expect(emailInput()).toHaveValue(demoUser.email);
//       expect(passwordInput()).toHaveValue(demoUser.password);
//     });
//   });

//   describe("submitting state", () => {
//     it("disables the button and shows 'Logging in...' while signing in", async () => {
//       const pending = deferSignIn();
//       const user = setup();

//       await fillAndSubmit(user);

//       await waitFor(() => expect(loginButton()).toBeDisabled());
//       expect(loginButton()).toHaveTextContent("Logging in...");
//       expect(loginButton()).toHaveAttribute("aria-busy", "true");

//       pending.resolve(signInOk);
//       await waitFor(() => expect(mockPush).toHaveBeenCalledWith(defaultCallback));
//     });

//     it("signs in only once when Login is clicked twice", async () => {
//       const pending = deferSignIn();
//       const user = setup();

//       await fillAndSubmit(user);
//       await user.click(loginButton());

//       pending.resolve(signInOk);
//       await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
//       expect(mockSignIn).toHaveBeenCalledTimes(1);
//     });

//     it("re-enables the button after a failed sign in", async () => {
//       mockSignIn.mockResolvedValue(signInFailed);
//       const user = setup();

//       await fillAndSubmit(user);
//       await screen.findByRole("alert");

//       expect(loginButton()).toBeEnabled();
//       expect(loginButton()).toHaveTextContent(/^Login$/);
//     });

//     it("re-enables the button after signIn throws", async () => {
//       mockSignIn.mockRejectedValue(new Error("boom"));
//       const user = setup();

//       await fillAndSubmit(user);
//       await screen.findByRole("alert");

//       expect(loginButton()).toBeEnabled();
//     });

//     it("keeps the button disabled after success, while navigating", async () => {
//       const user = setup();

//       await fillAndSubmit(user);

//       await waitFor(() => expect(mockPush).toHaveBeenCalled());
//       expect(loginButton()).toBeDisabled();
//     });

//     it("does not disable the button when validation fails", async () => {
//       const user = setup();

//       await user.click(loginButton());

//       expect(await screen.findByText("Email is required")).toBeInTheDocument();
//       expect(loginButton()).toBeEnabled();
//     });
//   });

//   describe("login as Adam Smith", () => {
//     it("fills in the demo email and password", async () => {
//       const user = setup();

//       await user.click(demoButton());

//       expect(emailInput()).toHaveValue(demoUser.email);
//       expect(passwordInput()).toHaveValue(demoUser.password);
//     });

//     it("does not submit the form", async () => {
//       // the button is type="button"; before, it defaulted to submit and
//       // validated the old (empty) values
//       const user = setup();

//       await user.click(demoButton());

//       expect(mockSignIn).not.toHaveBeenCalled();
//       expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
//       expect(screen.queryByText("Password is required")).not.toBeInTheDocument();
//     });

//     it("clears old errors and alerts", async () => {
//       mockSignIn.mockResolvedValueOnce(signInFailed);
//       const user = setup();

//       await fillAndSubmit(user, demoUser.email, "wrongpass");
//       expect(await screen.findByRole("alert")).toBeInTheDocument();

//       await user.click(demoButton());

//       expect(screen.queryByRole("alert")).not.toBeInTheDocument();
//     });

//     it("signs in with the demo account after clicking Login", async () => {
//       const user = setup();

//       await user.click(demoButton());
//       await user.click(loginButton());

//       await waitFor(() =>
//         expect(mockSignIn).toHaveBeenCalledWith(
//           "credentials",
//           expect.objectContaining(demoUser),
//         ),
//       );
//     });
//   });

//   describe("Google sign in", () => {
//     it("calls signIn('google') with the callbackUrl", async () => {
//       const user = setup("/dataEntry/runTmnt/999");

//       await user.click(googleButton());

//       expect(mockSignIn).toHaveBeenCalledTimes(1);
//       expect(mockSignIn).toHaveBeenCalledWith("google", {
//         callbackUrl: "/dataEntry/runTmnt/999",
//       });
//     });

//     it("uses the default callbackUrl for an unsafe callbackUrl", async () => {
//       const user = setup("//evil.com");

//       await user.click(googleButton());

//       expect(mockSignIn).toHaveBeenCalledWith("google", {
//         callbackUrl: defaultCallback,
//       });
//     });

//     it("does not submit the credentials form", async () => {
//       const user = setup();

//       await user.click(googleButton());

//       expect(mockSignIn).not.toHaveBeenCalledWith("credentials", expect.anything());
//       expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
//     });

//     it("shows 'Other error logging in with Google' when signIn throws", async () => {
//       mockSignIn.mockRejectedValue(new Error("google down"));
//       const user = setup();

//       await user.click(googleButton());

//       expect(await screen.findByRole("alert")).toHaveTextContent(
//         "Other error logging in with Google",
//       );
//     });

//     it("clears the Google error when clicked again", async () => {
//       mockSignIn.mockRejectedValueOnce(new Error("google down"));
//       const user = setup();

//       await user.click(googleButton());
//       expect(await screen.findByRole("alert")).toBeInTheDocument();

//       // 2nd click works (default mock)
//       await user.click(googleButton());

//       await waitFor(() =>
//         expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
//       );
//     });
//   });
// });

