// test/app/auth/register/registerForm.test.tsx
// Tests for src/app/(auth)/register/registerForm.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { signIn } from "next-auth/react";
import { RegisterForm } from "@/app/(auth)/register/registerForm";
import { registerUser } from "@/lib/db/auth/dbAuth";
import {
  maxEmailLength,
  maxFirstNameLength,
  maxLastNameLength,
  maxPhoneLength,
} from "@/lib/validation/constants";

// ---- mocks ----

// the form calls registerUser (which uses axios); mock it directly so the
// tests do not depend on how dbAuth builds the request
jest.mock("@/lib/db/auth/dbAuth", () => ({
  __esModule: true,
  registerUser: jest.fn(),
}));
const mockRegisterUser = registerUser as jest.MockedFunction<
  typeof registerUser
>;

// only axios.isAxiosError is used by the form
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));
const mockedSignIn = signIn as jest.MockedFunction<typeof signIn>;

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

const phoneMock = jest.fn();
jest.mock("phone", () => ({
  __esModule: true,
  phone: (v: string) => phoneMock(v),
}));

const isEmailMock = jest.fn();
const isPassword8to20Mock = jest.fn();
jest.mock("@/lib/validation/validation", () => ({
  __esModule: true,
  // keep the real functions (e.g. isValidBtDbType, used by initVals)
  ...jest.requireActual("@/lib/validation/validation"),
  isEmail: (v: string) => isEmailMock(v),
  isPassword8to20: (v: string) => isPassword8to20Mock(v),
}));

const sanitizeNameMock = jest.fn();
jest.mock("@/lib/validation/sanitize", () => ({
  __esModule: true,
  // keep the real functions, override only sanitizeName
  ...jest.requireActual("@/lib/validation/sanitize"),
  sanitizeName: (v: unknown) => sanitizeNameMock(v),
}));

// ---- helpers ----

type User = ReturnType<typeof userEvent.setup>;

const validUser = {
  first_name: "Eric",
  last_name: "Adolphson",
  email: "eric@example.com",
  phone: "925-555-1212",
  password: "Aa1!aaaa",
};

const passwordFormatError = /Password not in a valid format/i;

// an error shaped like the AxiosError registerUser throws
const axiosError = (status: number, data?: unknown) => ({
  isAxiosError: true,
  response: { status, data },
});

// selector: "input" so a label query never also matches the show/hide
// buttons, whose aria-labels ("Show password", "Show confirm password")
// contain the same words
const byLabel = (label: RegExp) =>
  screen.getByLabelText(label, { selector: "input" }) as HTMLInputElement;

const inputs = () => ({
  firstName: byLabel(/^first name$/i),
  lastName: byLabel(/^last name$/i),
  email: byLabel(/^email$/i),
  phone: byLabel(/^phone$/i),
  password: byLabel(/^password$/i),
  confirm: byLabel(/^confirm password$/i),
});

// the show/hide buttons, found by their accessible names
const passwordToggle = () =>
  screen.getByRole("button", { name: "Show password" });
const confirmToggle = () =>
  screen.getByRole("button", { name: "Show confirm password" });

const submitButton = () => screen.getByRole("button", { name: /^regist/i });

const submit = (user: User) => user.click(submitButton());

// fills every field; pass overrides to change one, or "" to skip it
const fillForm = async (
  user: User,
  overrides: Partial<typeof validUser & { confirm: string }> = {},
) => {
  const values = { ...validUser, confirm: validUser.password, ...overrides };
  const f = inputs();
  if (values.first_name) await user.type(f.firstName, values.first_name);
  if (values.last_name) await user.type(f.lastName, values.last_name);
  if (values.email) await user.type(f.email, values.email);
  if (values.phone) await user.type(f.phone, values.phone);
  if (values.password) await user.type(f.password, values.password);
  if (values.confirm) await user.type(f.confirm, values.confirm);
};

const expectNotSubmitted = () => {
  expect(mockRegisterUser).not.toHaveBeenCalled();
  expect(mockedSignIn).not.toHaveBeenCalled();
  expect(mockPush).not.toHaveBeenCalled();
};

// a signIn result with no error
const signInOk = {
  error: undefined,
  status: 200,
  ok: true,
  url: null,
  code: undefined,
};

describe("RegisterForm", () => {
  beforeEach(() => {
    // reset, not just clear: also drops any leftover mockResolvedValueOnce /
    // mockImplementation from an earlier test
    jest.resetAllMocks();

    isEmailMock.mockReturnValue(true);
    isPassword8to20Mock.mockReturnValue(true);
    phoneMock.mockReturnValue({ isValid: true });
    sanitizeNameMock.mockImplementation((v: unknown) =>
      typeof v === "string" ? v : "",
    );

    mockRegisterUser.mockResolvedValue({ id: "usr_new" } as never);
    mockedAxios.isAxiosError.mockImplementation(
      (error: unknown): error is Error =>
        typeof error === "object" && error !== null && "isAxiosError" in error,
    );
    mockedSignIn.mockResolvedValue(signInOk);
  });

  describe("render", () => {
    it("renders fields + submit + sign-in link", () => {
      render(<RegisterForm />);

      Object.values(inputs()).forEach((input) =>
        expect(input).toBeInTheDocument(),
      );
      expect(submitButton()).toHaveTextContent("Register");
      expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
        "href",
        "/login",
      );
    });

    it("starts with all fields blank and no errors", () => {
      render(<RegisterForm />);

      Object.values(inputs()).forEach((input) => {
        expect(input).toHaveValue("");
        expect(input).not.toHaveClass("is-invalid");
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("limits input lengths with maxLength", () => {
      render(<RegisterForm />);
      const f = inputs();

      expect(f.firstName).toHaveAttribute("maxlength", String(maxFirstNameLength));
      expect(f.lastName).toHaveAttribute("maxlength", String(maxLastNameLength));
      expect(f.email).toHaveAttribute("maxlength", String(maxEmailLength));
      expect(f.phone).toHaveAttribute("maxlength", String(maxPhoneLength));
    });

    it("hides both passwords by default", () => {
      render(<RegisterForm />);

      expect(inputs().password).toHaveAttribute("type", "password");
      expect(inputs().confirm).toHaveAttribute("type", "password");
    });

    it("starts with the Register button enabled", () => {
      render(<RegisterForm />);

      expect(submitButton()).toBeEnabled();
    });
  });

  describe("show / hide password", () => {
    it("toggles password visibility", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      expect(passwordToggle()).toHaveAttribute("aria-pressed", "false");

      await user.click(passwordToggle());
      expect(inputs().password).toHaveAttribute("type", "text");
      expect(passwordToggle()).toHaveAttribute("aria-pressed", "true");

      await user.click(passwordToggle());
      expect(inputs().password).toHaveAttribute("type", "password");
      expect(passwordToggle()).toHaveAttribute("aria-pressed", "false");
    });

    it("toggles confirm visibility", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(confirmToggle());
      expect(inputs().confirm).toHaveAttribute("type", "text");
      expect(confirmToggle()).toHaveAttribute("aria-pressed", "true");

      await user.click(confirmToggle());
      expect(inputs().confirm).toHaveAttribute("type", "password");
      expect(confirmToggle()).toHaveAttribute("aria-pressed", "false");
    });

    it("toggles password and confirm independently", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(passwordToggle());

      expect(inputs().password).toHaveAttribute("type", "text");
      expect(inputs().confirm).toHaveAttribute("type", "password");
      expect(confirmToggle()).toHaveAttribute("aria-pressed", "false");
    });

    it("keeps the typed password when toggling", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(inputs().password, validUser.password);
      await user.click(passwordToggle());

      expect(inputs().password).toHaveValue(validUser.password);
    });

    it("does not submit the form when a toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(passwordToggle());
      await user.click(confirmToggle());

      expect(
        screen.queryByText("First Name is required"),
      ).not.toBeInTheDocument();
      expectNotSubmitted();
    });
  });

  describe("validation", () => {
    it("shows required errors for blank submit and does not submit", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await submit(user);

      expect(
        await screen.findByText("First Name is required"),
      ).toBeInTheDocument();
      expect(screen.getByText("Last Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(
        screen.getByText("Confirm password is required"),
      ).toBeInTheDocument();
      // phone is optional, so no phone error
      expect(screen.queryByText("Phone not valid")).not.toBeInTheDocument();
      expect(inputs().phone).not.toHaveClass("is-invalid");
      expectNotSubmitted();
    });

    it("marks every required field as invalid on a blank submit", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await submit(user);
      await screen.findByText("First Name is required");

      const f = inputs();
      [f.firstName, f.lastName, f.email, f.password, f.confirm].forEach(
        (input) => expect(input).toHaveClass("is-invalid"),
      );
    });

    it("treats a name that sanitizes to blank as missing", async () => {
      const user = userEvent.setup();
      sanitizeNameMock.mockImplementation((v: unknown) =>
        typeof v === "string" ? v.replace(/[^a-z]/gi, "") : "",
      );
      render(<RegisterForm />);

      await fillForm(user, { first_name: "!!!", last_name: "***" });
      await submit(user);

      expect(
        await screen.findByText("First Name is required"),
      ).toBeInTheDocument();
      expect(screen.getByText("Last Name is required")).toBeInTheDocument();
      expectNotSubmitted();
    });

    it("shows email invalid error when isEmail returns false", async () => {
      const user = userEvent.setup();
      isEmailMock.mockReturnValue(false);
      render(<RegisterForm />);

      await fillForm(user, { email: "not-an-email" });
      await submit(user);

      expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
      expect(isEmailMock).toHaveBeenCalledWith("not-an-email");
      expect(inputs().email).toHaveClass("is-invalid");
      expectNotSubmitted();
    });

    it("phone is optional: blank phone does not block submit", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillForm(user, { phone: "" });
      await submit(user);

      await waitFor(() => expect(mockRegisterUser).toHaveBeenCalledTimes(1));
      expect(phoneMock).not.toHaveBeenCalled();
    });

    it("shows phone invalid error when phone() says invalid", async () => {
      const user = userEvent.setup();
      phoneMock.mockReturnValue({ isValid: false });
      render(<RegisterForm />);

      await fillForm(user, { phone: "123" });
      await submit(user);

      expect(await screen.findByText("Phone not valid")).toBeInTheDocument();
      expect(phoneMock).toHaveBeenCalledWith("123");
      expect(inputs().phone).toHaveClass("is-invalid");
      expectNotSubmitted();
    });

    it("shows password format errors when isPassword8to20 returns false", async () => {
      const user = userEvent.setup();
      isPassword8to20Mock.mockReturnValue(false);
      render(<RegisterForm />);

      await fillForm(user, { password: "bad", confirm: "bad" });
      await submit(user);

      expect(await screen.findAllByText(passwordFormatError)).toHaveLength(2);
      expect(inputs().password).toHaveClass("is-invalid");
      expect(inputs().confirm).toHaveClass("is-invalid");
      expectNotSubmitted();
    });

    it("shows a format error only on the field that is invalid", async () => {
      const user = userEvent.setup();
      isPassword8to20Mock.mockImplementation(
        (v: string) => v === validUser.password,
      );
      render(<RegisterForm />);

      await fillForm(user, { confirm: "bad" });
      await submit(user);

      expect(await screen.findAllByText(passwordFormatError)).toHaveLength(1);
      expect(inputs().confirm).toHaveClass("is-invalid");
      expect(inputs().password).not.toHaveClass("is-invalid");
      // match is only checked when both formats are valid
      expect(
        screen.queryByText("Passwords do not match"),
      ).not.toBeInTheDocument();
      expectNotSubmitted();
    });

    it("shows 'Passwords do not match' when both formats valid but differ", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillForm(user, { confirm: "Aa1!aaab" });
      await submit(user);

      expect(
        await screen.findByText("Passwords do not match"),
      ).toBeInTheDocument();
      expect(inputs().confirm).toHaveClass("is-invalid");
      expect(inputs().password).not.toHaveClass("is-invalid");
      expectNotSubmitted();
    });

    it("shows all errors at once, not just the first", async () => {
      const user = userEvent.setup();
      isEmailMock.mockReturnValue(false);
      phoneMock.mockReturnValue({ isValid: false });
      render(<RegisterForm />);

      await fillForm(user, { first_name: "", email: "bad", phone: "123" });
      await submit(user);

      expect(
        await screen.findByText("First Name is required"),
      ).toBeInTheDocument();
      expect(screen.getByText("Email is not valid")).toBeInTheDocument();
      expect(screen.getByText("Phone not valid")).toBeInTheDocument();
      expectNotSubmitted();
    });

    it("sanitizes first/last name and writes sanitized values back into inputs", async () => {
      const user = userEvent.setup();
      sanitizeNameMock.mockImplementation((v: unknown) =>
        typeof v === "string" ? v.replace(/[^a-z ]/gi, "").trim() : "",
      );
      render(<RegisterForm />);

      await fillForm(user, {
        first_name: "  E!r@i#c  ",
        last_name: "  A$d%o^l&p*h*s(o)n  ",
      });
      await submit(user);

      await waitFor(() => expect(inputs().firstName).toHaveValue("Eric"));
      expect(inputs().lastName).toHaveValue("Adolphson");
      await waitFor(() =>
        expect(mockRegisterUser).toHaveBeenCalledWith(
          expect.objectContaining({
            first_name: "Eric",
            last_name: "Adolphson",
          }),
        ),
      );
    });

    it("clears a field error when typing into that field", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await submit(user);
      expect(
        await screen.findByText("First Name is required"),
      ).toBeInTheDocument();

      await user.type(inputs().firstName, "E");

      expect(
        screen.queryByText("First Name is required"),
      ).not.toBeInTheDocument();
      expect(inputs().firstName).not.toHaveClass("is-invalid");
      // other errors stay until their field changes
      expect(screen.getByText("Last Name is required")).toBeInTheDocument();
      expect(inputs().lastName).toHaveClass("is-invalid");
    });

    it("clears old errors when the next submit is valid", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await submit(user);
      await screen.findByText("First Name is required");

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(mockRegisterUser).toHaveBeenCalledTimes(1));
      Object.values(inputs()).forEach((input) =>
        expect(input).not.toHaveClass("is-invalid"),
      );
    });
  });

  describe("submit", () => {
    it("registers, signs in, then goes to /user/tmnts", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/tmnts"));

      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(mockRegisterUser).toHaveBeenCalledWith(
        expect.objectContaining(validUser),
      );

      expect(mockedSignIn).toHaveBeenCalledTimes(1);
      expect(mockedSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: validUser.email,
        password: validUser.password,
        callbackUrl: "/user/tmnts",
      });
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("signs in only after the user is registered", async () => {
      const user = userEvent.setup();
      const order: string[] = [];
      mockRegisterUser.mockImplementation(async () => {
        order.push("register");
        return { id: "usr_new" } as never;
      });
      mockedSignIn.mockImplementation(async () => {
        order.push("signIn");
        return signInOk;
      });
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(order).toEqual(["register", "signIn"]));
    });

    // the confirm field is only for the form; it must not be sent to the API
    it("does not send the confirm password to the API", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(mockRegisterUser).toHaveBeenCalledTimes(1));
      expect(mockRegisterUser.mock.calls[0][0]).not.toHaveProperty("confirm");
    });

    it("if signIn returns an error, routes to /login", async () => {
      const user = userEvent.setup();
      mockedSignIn.mockResolvedValue({
        error: "nope",
        status: 401,
        ok: false,
        url: null,
        code: "CredentialsSignin",
      });
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
      expect(mockPush).not.toHaveBeenCalledWith("/user/tmnts");
    });

    it("if signIn returns undefined, goes to /user/tmnts", async () => {
      // the form only checks response?.error
      const user = userEvent.setup();
      mockedSignIn.mockResolvedValue(undefined as never);
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/tmnts"));
    });

    it("does not sign in when registerUser returns nothing", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockResolvedValue(null as never);
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(mockRegisterUser).toHaveBeenCalledTimes(1));
      expect(mockedSignIn).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("submitting state", () => {
    // makes registerUser wait until the test resolves or rejects it
    const deferRegister = () => {
      const handle: {
        resolve: (v: unknown) => void;
        reject: (e: unknown) => void;
      } = { resolve: () => {}, reject: () => {} };
      mockRegisterUser.mockImplementation(
        () =>
          new Promise((res, rej) => {
            handle.resolve = res;
            handle.reject = rej;
          }) as never,
      );
      return handle;
    };

    it("disables the button and shows 'Registering...' while submitting", async () => {
      const user = userEvent.setup();
      const pending = deferRegister();
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(submitButton()).toBeDisabled());
      expect(submitButton()).toHaveTextContent("Registering...");
      expect(submitButton()).toHaveAttribute("aria-busy", "true");

      pending.resolve({ id: "usr_new" });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/tmnts"));
    });

    it("registers only once when Register is clicked twice", async () => {
      const user = userEvent.setup();
      const pending = deferRegister();
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);
      await submit(user);

      pending.resolve({ id: "usr_new" });
      await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(mockedSignIn).toHaveBeenCalledTimes(1);
    });

    it("re-enables the button after a server error", async () => {
      const user = userEvent.setup();
      const pending = deferRegister();
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);
      await waitFor(() => expect(submitButton()).toBeDisabled());

      pending.reject(axiosError(409, { error: "Email already in use" }));

      await waitFor(() => expect(submitButton()).toBeEnabled());
      expect(submitButton()).toHaveTextContent(/^Register$/);
    });

    it("re-enables the button when registerUser returns nothing", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockResolvedValue(null as never);
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(mockRegisterUser).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(submitButton()).toBeEnabled());
    });

    it("keeps the button disabled after success, while navigating", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/tmnts"));
      expect(submitButton()).toBeDisabled();
    });

    it("does not disable the button when validation fails", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await submit(user);

      expect(
        await screen.findByText("First Name is required"),
      ).toBeInTheDocument();
      expect(submitButton()).toBeEnabled();
    });
  });

  describe("email case", () => {
    it("lower cases the email before registering and signing in", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillForm(user, { email: "Eric@Example.COM" });
      await submit(user);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/tmnts"));
      expect(isEmailMock).toHaveBeenCalledWith("eric@example.com");
      expect(mockRegisterUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: "eric@example.com" }),
      );
      expect(mockedSignIn).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({ email: "eric@example.com" }),
      );
    });

    it("shows the lower case email in the input after submit", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillForm(user, { email: "Eric@Example.COM" });
      await submit(user);

      await waitFor(() =>
        expect(inputs().email).toHaveValue("eric@example.com"),
      );
    });

    it("leaves the typed email as is when validation fails", async () => {
      const user = userEvent.setup();
      isEmailMock.mockReturnValue(false);
      render(<RegisterForm />);

      await fillForm(user, { email: "Not-An-Email" });
      await submit(user);

      await screen.findByText("Email is not valid");
      expect(inputs().email).toHaveValue("Not-An-Email");
    });
  });

  describe("errors after a failed submit", () => {
    // the catch block must not copy errors from before this submit, or an
    // old "Passwords do not match" comes back on a server error
    it("does not bring back old field errors on a server error", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      // 1st submit: passwords differ
      await fillForm(user, { confirm: "Aa1!aaab" });
      await submit(user);
      expect(
        await screen.findByText("Passwords do not match"),
      ).toBeInTheDocument();

      // fix it by changing the PASSWORD field; the confirm error stays on screen
      await user.clear(inputs().password);
      await user.type(inputs().password, "Aa1!aaab");
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

      // 2nd submit passes validation, then the server fails
      mockRegisterUser.mockRejectedValueOnce(axiosError(500));
      await submit(user);

      expect(
        await screen.findByText("Other error registering"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Passwords do not match"),
      ).not.toBeInTheDocument();
    });
  });

  describe("submit errors", () => {
    it("shows the server message in an alert on 409", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(
        axiosError(409, { error: "Email already in use" }),
      );
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Email already in use",
      );
      expect(mockedSignIn).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows 'Other error registering' in the alert on 409 with no message", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(axiosError(409));
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Other error registering",
      );
    });

    it("clears the 409 alert when the email input changes", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(
        axiosError(409, { error: "Email already in use" }),
      );
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      await user.type(inputs().email, "x");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("keeps the 409 alert when another field changes", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(
        axiosError(409, { error: "Email already in use" }),
      );
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      await user.type(inputs().firstName, "x");

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("clears the 409 alert when the form is submitted again", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(
        axiosError(409, { error: "Email already in use" }),
      );
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      // 2nd submit succeeds (default mock)
      await submit(user);

      await waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/tmnts"));
    });

    it("shows the server message in an alert on 403 and disables Register", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(
        axiosError(403, { error: "Registration is closed." }),
      );
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Registration is closed.",
      );
      // not submitting any more, but registration is closed, so stay disabled
      await waitFor(() => expect(submitButton()).toBeDisabled());
      expect(submitButton()).toHaveTextContent(/^Register$/);
      expect(mockedSignIn).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows 'Registration is closed.' in the alert on 403 with no message", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(axiosError(403));
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Registration is closed.",
      );
    });

    it("does not show a 403 as an email error", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(
        axiosError(403, { error: "Registration is closed." }),
      );
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      await screen.findByRole("alert");
      expect(
        screen.queryByText("Other error registering"),
      ).not.toBeInTheDocument();
      expect(inputs().email).not.toHaveClass("is-invalid");
    });

    it("keeps the closed alert and disabled button when a field changes", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(
        axiosError(403, { error: "Registration is closed." }),
      );
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);
      await screen.findByRole("alert");

      // unlike the 409 alert, editing the email does not clear it
      await user.type(inputs().email, "x");

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Registration is closed.",
      );
      expect(submitButton()).toBeDisabled();
    });

    it.each([400, 422, 500])(
      "shows 'Other error registering' under email for a %i response",
      async (status) => {
        const user = userEvent.setup();
        mockRegisterUser.mockRejectedValueOnce(
          axiosError(status, { error: "invalid data" }),
        );
        render(<RegisterForm />);

        await fillForm(user);
        await submit(user);

        expect(
          await screen.findByText("Other error registering"),
        ).toBeInTheDocument();
        expect(inputs().email).toHaveClass("is-invalid");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(mockedSignIn).not.toHaveBeenCalled();
      },
    );

    it("shows 'Unexpected error registering' for a non-axios error", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(new Error("boom"));
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      expect(
        await screen.findByText("Unexpected error registering"),
      ).toBeInTheDocument();
      expect(mockedSignIn).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows 'Unexpected error registering' when signIn throws", async () => {
      const user = userEvent.setup();
      mockedSignIn.mockRejectedValueOnce(new Error("sign in failed"));
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);

      expect(
        await screen.findByText("Unexpected error registering"),
      ).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
      // not navigating, so the user can try again
      expect(submitButton()).toBeEnabled();
    });

    it("keeps what the user typed after a failed submit", async () => {
      const user = userEvent.setup();
      mockRegisterUser.mockRejectedValueOnce(new Error("boom"));
      render(<RegisterForm />);

      await fillForm(user);
      await submit(user);
      await screen.findByText("Unexpected error registering");

      const f = inputs();
      expect(f.firstName).toHaveValue(validUser.first_name);
      expect(f.lastName).toHaveValue(validUser.last_name);
      expect(f.email).toHaveValue(validUser.email);
      expect(f.phone).toHaveValue(validUser.phone);
      expect(f.password).toHaveValue(validUser.password);
      expect(f.confirm).toHaveValue(validUser.password);
    });
  });
});
