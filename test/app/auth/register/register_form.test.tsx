import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { signIn } from "next-auth/react";
import { RegisterForm } from "@/app/(auth)/register/form";
import type { userFormType } from "@/lib/types/types";

// ---- mocks ----
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

jest.mock("@/lib/api/baseApi", () => ({
  __esModule: true,
  baseApi: "http://example.test/api",
}));

const phoneMock = jest.fn();
jest.mock("phone", () => ({
  __esModule: true,
  phone: (v: string) => phoneMock(v),
}));

jest.mock("@/lib/validation/constants", () => ({
  __esModule: true,
  maxFirstNameLength: 50,
  maxLastNameLength: 50,
  maxEmailLength: 254,
  maxPhoneLength: 25,
}));

const isEmailMock = jest.fn();
const isPassword8to20Mock = jest.fn();
jest.mock("@/lib/validation/validation", () => ({
  __esModule: true,
  isEmail: (v: string) => isEmailMock(v),
  isPassword8to20: (v: string) => isPassword8to20Mock(v),
}));

const sanitizeNameMock = jest.fn((v: unknown) => v);
jest.mock("@/lib/validation/sanitize", () => ({
  __esModule: true,
  sanitizeName: (v: unknown) => sanitizeNameMock(v),
}));

const sanitizeUserMock = jest.fn((u: userFormType) => u);
jest.mock("@/lib/validation/users/validation", () => ({
  __esModule: true,
  sanitizeUser: (u: userFormType) => sanitizeUserMock(u),
}));

jest.mock("@/lib/db/initVals", () => ({
  __esModule: true,
  initUserForm: {
    id: "usr_test",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  },
}));

jest.mock("./form.css", () => ({}));

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    isEmailMock.mockReturnValue(true);
    isPassword8to20Mock.mockReturnValue(true);
    phoneMock.mockReturnValue({ isValid: true });

    mockedAxios.post.mockResolvedValue({ status: 201 });
    mockedAxios.isAxiosError.mockImplementation(
      (error: unknown): error is Error => typeof error === "object" && error !== null && "response" in error
    );
    
    mockedSignIn.mockResolvedValue({ error: undefined, status: 200, ok: true, url: null, code: undefined });

    sanitizeNameMock.mockImplementation((v: unknown) =>
      typeof v === "string" ? v : ""
    );
    sanitizeUserMock.mockImplementation((u: userFormType) => u);
  });

  const fillValidForm = async (user = userEvent.setup()) => {
    await user.type(screen.getByLabelText(/first name/i), "Eric");
    await user.type(screen.getByLabelText(/last name/i), "Adolphson");
    await user.type(screen.getByLabelText(/email/i), "eric@example.com");
    await user.type(screen.getByLabelText(/phone/i), "925-555-1212");
    await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
    await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");
  };

  it("renders fields + submit + sign-in link", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("toggles password visibility (password input type changes)", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const pwd = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    expect(pwd.type).toBe("password");

    const toggleButtons = screen.getAllByRole("button");
    const pwdToggle = toggleButtons.find(
      (button) => button.getAttribute("type") === "button"
    );
    expect(pwdToggle).toBeDefined();

    await user.click(pwdToggle!);
    expect((screen.getByLabelText(/^password$/i) as HTMLInputElement).type).toBe(
      "text"
    );

    await user.click(pwdToggle!);
    expect((screen.getByLabelText(/^password$/i) as HTMLInputElement).type).toBe(
      "password"
    );
  });

  it("toggles confirm visibility (confirm input type changes)", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const confirm = screen.getByLabelText(
      /confirm password/i
    ) as HTMLInputElement;
    expect(confirm.type).toBe("password");

    const buttons = screen.getAllByRole("button");
    const typeButtons = buttons.filter(
      (button) => button.getAttribute("type") === "button"
    );
    const confirmToggle = typeButtons[1];
    expect(confirmToggle).toBeDefined();

    await user.click(confirmToggle);
    expect(
      (screen.getByLabelText(/confirm password/i) as HTMLInputElement).type
    ).toBe("text");

    await user.click(confirmToggle);
    expect(
      (screen.getByLabelText(/confirm password/i) as HTMLInputElement).type
    ).toBe("password");
  });

  it("shows required errors for blank submit, does not call axios/signIn/router", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("First Name is required")
    ).toBeInTheDocument();
    expect(screen.getByText("Last Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(
      screen.getByText("Confirm password is required")
    ).toBeInTheDocument();

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(mockedSignIn).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows email invalid error when isEmail returns false", async () => {
    const user = userEvent.setup();
    isEmailMock.mockReturnValue(false);

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
    await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("phone is optional: blank phone does not block submit", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/first name/i), "Eric");
    await user.type(screen.getByLabelText(/last name/i), "Adolphson");
    await user.type(screen.getByLabelText(/email/i), "eric@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
    await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");

    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));
    expect(phoneMock).not.toHaveBeenCalled();
  });

  it("shows phone invalid error when phone() says invalid", async () => {
    const user = userEvent.setup();
    phoneMock.mockReturnValue({ isValid: false });

    render(<RegisterForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText("Phone not valid")).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("shows password format errors when isPassword8to20 returns false", async () => {
    const user = userEvent.setup();
    isPassword8to20Mock.mockImplementation((v: string) => v === "Aa1!aaaa");

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/first name/i), "Eric");
    await user.type(screen.getByLabelText(/last name/i), "Adolphson");
    await user.type(screen.getByLabelText(/email/i), "eric@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "bad");
    await user.type(screen.getByLabelText(/confirm password/i), "bad");

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findAllByText(/Password not in a valid format/i)
    ).toHaveLength(2);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("shows 'Passwords do not match' when both formats valid but differ", async () => {
    const user = userEvent.setup();
    isPassword8to20Mock.mockReturnValue(true);

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/first name/i), "Eric");
    await user.type(screen.getByLabelText(/last name/i), "Adolphson");
    await user.type(screen.getByLabelText(/email/i), "eric@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
    await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaab");

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("successful submit: posts to /auth/register, then signIn, then router.push(/user/tmnts)", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));

    const [url, body, config] = mockedAxios.post.mock.calls[0];

    expect(url).toBe("http://example.test/api/auth/register");
    expect(config).toEqual(
      expect.objectContaining({ withCredentials: true })
    );

    const parsed = JSON.parse(body as string);
    expect(parsed).toEqual(
      expect.objectContaining({
        id: "usr_test",
        first_name: "Eric",
        last_name: "Adolphson",
        email: "eric@example.com",
        phone: "925-555-1212",
        password: "Aa1!aaaa",
      })
    );

    await waitFor(() => expect(mockedSignIn).toHaveBeenCalledTimes(1));
    expect(mockedSignIn).toHaveBeenCalledWith("credentials", {
      redirect: false,
      email: "eric@example.com",
      password: "Aa1!aaaa",
      callbackUrl: "/user/tmnts",
    });

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/tmnts"));
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

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockedSignIn).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
  });

  it("if axios throws 409, shows 'Email already in use' alert", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 409 } });

    render(<RegisterForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Email already in use");

    expect(mockedSignIn).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears 'Email already in use' when email input changes", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 409 } });

    render(<RegisterForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email already in use"
    );

    const emailInput = screen.getByLabelText(/email/i);
    await user.clear(emailInput);
    await user.type(emailInput, "new@example.com");

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("sanitizes first/last name and writes sanitized values back into inputs", async () => {
    const user = userEvent.setup();
    sanitizeNameMock.mockImplementation((v: unknown) => {
      if (typeof v !== "string") return "";
      return v.replace(/[^a-z ]/gi, "").trim();
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/first name/i), "  E!r@i#c  ");
    await user.type(screen.getByLabelText(/last name/i), "  A$d%o^l&p*h*s(o)n  ");
    await user.type(screen.getByLabelText(/email/i), "eric@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
    await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect((screen.getByLabelText(/first name/i) as HTMLInputElement).value).toBe(
      "Eric"
    );
    expect((screen.getByLabelText(/last name/i) as HTMLInputElement).value).toBe(
      "Adolphson"
    );
  });

  it("clears a field error when typing into that field (e.g., first name)", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: /register/i }));
    expect(
      await screen.findByText("First Name is required")
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/first name/i), "E");

    await waitFor(() => {
      expect(screen.queryByText("First Name is required")).not.toBeInTheDocument();
    });
  });

  it("adds bootstrap is-invalid class when a field has an error (email)", async () => {
    const user = userEvent.setup();
    isEmailMock.mockReturnValue(false);

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "bad");
    await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
    await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");

    await user.click(screen.getByRole("button", { name: /register/i }));

    const email = screen.getByLabelText(/email/i);
    expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
    expect(email.className).toMatch(/is-invalid/);
  });
});

// import React from "react";
// import { render, screen, within, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import axios from "axios";
// import { signIn } from "next-auth/react";
// import { RegisterForm } from "@/app/(auth)/register/form";

// // ---- mocks ----
// jest.mock("axios");
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// const mockPush = jest.fn();
// jest.mock("next/navigation", () => ({
//   useRouter: () => ({ push: mockPush }),
// }));

// jest.mock("next-auth/react", () => ({
//   signIn: jest.fn(),
// }));
// const mockedSignIn = signIn as jest.MockedFunction<typeof signIn>;

// // next/image commonly needs a mock in Jest
// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: (props: any) => {
//     // eslint-disable-next-line @next/next/no-img-element
//     return <img alt="" {...props} />;
//   },
// }));

// // next/link: render anchor so RTL can see it
// jest.mock("next/link", () => ({
//   __esModule: true,
//   default: ({ href, children, ...rest }: any) => (
//     <a href={href} {...rest}>
//       {children}
//     </a>
//   ),
// }));

// // keep this as a simple wrapper so assertions are easy
// jest.mock("@/components/ui/index", () => ({
//   __esModule: true,
//   Alert: ({ children }: any) => <div role="alert">{children}</div>,
// }));

// // baseApi used to build url
// jest.mock("@/lib/api/baseApi", () => ({
//   __esModule: true,
//   baseApi: "http://example.test/api",
// }));

// // phone() validation lib
// const phoneMock = jest.fn();
// jest.mock("phone", () => ({
//   __esModule: true,
//   phone: (v: string) => phoneMock(v),
// }));

// // constants used by inputs
// jest.mock("@/lib/validation/constants", () => ({
//   __esModule: true,
//   maxFirstNameLength: 50,
//   maxLastNameLength: 50,
//   maxEmailLength: 254,
//   maxPhoneLength: 25,
// }));

// // validation helpers
// const isEmailMock = jest.fn();
// const isPassword8to20Mock = jest.fn();
// jest.mock("@/lib/validation/validation", () => ({
//   __esModule: true,
//   isEmail: (v: string) => isEmailMock(v),
//   isPassword8to20: (v: string) => isPassword8to20Mock(v),
// }));

// // sanitizers
// const sanitizeNameMock = jest.fn((v) => v);
// jest.mock("@/lib/validation/sanitize", () => ({
//   __esModule: true,
//   sanitizeName: (v: unknown) => sanitizeNameMock(v),
// }));

// const sanitizeUserMock = jest.fn((u) => u);
// jest.mock("@/lib/validation/users/validation", () => ({
//   __esModule: true,
//   sanitizeUser: (u: any) => sanitizeUserMock(u),
// }));

// // init vals
// jest.mock("@/lib/db/initVals", () => ({
//   __esModule: true,
//   initUser: {
//     id: "usr_test",
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone: "",
//     password: "",
//     role: "USER",
//   },
// }));

// // css import
// jest.mock("./form.css", () => ({}));

// describe("RegisterForm", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();

//     // defaults: everything valid unless a test overrides
//     isEmailMock.mockReturnValue(true);
//     isPassword8to20Mock.mockReturnValue(true);
//     phoneMock.mockReturnValue({ isValid: true });

//     mockedAxios.post.mockResolvedValue({ status: 201 } as any);
//     mockedSignIn.mockResolvedValue({ error: null } as any);

//     // sanitizeName leaves values alone unless test overrides
//     sanitizeNameMock.mockImplementation((v: any) => (typeof v === "string" ? v : ""));
//     sanitizeUserMock.mockImplementation((u: any) => u);
//   });

//   const fillValidForm = async (user = userEvent.setup()) => {
//     await user.type(screen.getByLabelText(/first name/i), "Eric");
//     await user.type(screen.getByLabelText(/last name/i), "Adolphson");
//     await user.type(screen.getByLabelText(/email/i), "eric@example.com");
//     await user.type(screen.getByLabelText(/phone/i), "925-555-1212");
//     await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
//     await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");
//   };

//   it("renders fields + submit + sign-in link", () => {
//     render(<RegisterForm />);

//     expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

//     expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();

//     const link = screen.getByRole("link", { name: /sign in/i });
//     expect(link).toHaveAttribute("href", "/login");
//   });

//   it("toggles password visibility (password input type changes)", async () => {
//     const user = userEvent.setup();
//     render(<RegisterForm />);

//     const pwd = screen.getByLabelText(/^password$/i) as HTMLInputElement;
//     expect(pwd.type).toBe("password");

//     // first toggle button is for password (first input-group)
//     const toggleButtons = screen.getAllByRole("button");
//     const pwdToggle = toggleButtons.find((b) => b.getAttribute("type") === "button")!;
//     await user.click(pwdToggle);

//     expect((screen.getByLabelText(/^password$/i) as HTMLInputElement).type).toBe("text");
//     await user.click(pwdToggle);
//     expect((screen.getByLabelText(/^password$/i) as HTMLInputElement).type).toBe("password");
//   });

//   it("toggles confirm visibility (confirm input type changes)", async () => {
//     const user = userEvent.setup();
//     render(<RegisterForm />);

//     const confirm = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
//     expect(confirm.type).toBe("password");

//     // second type=button is for confirm
//     const buttons = screen.getAllByRole("button");
//     const typeButtons = buttons.filter((b) => b.getAttribute("type") === "button");
//     const confirmToggle = typeButtons[1];

//     await user.click(confirmToggle);
//     expect((screen.getByLabelText(/confirm password/i) as HTMLInputElement).type).toBe("text");
//     await user.click(confirmToggle);
//     expect((screen.getByLabelText(/confirm password/i) as HTMLInputElement).type).toBe("password");
//   });

//   it("shows required errors for blank submit, does not call axios/signIn/router", async () => {
//     const user = userEvent.setup();
//     render(<RegisterForm />);

//     await user.click(screen.getByRole("button", { name: /register/i }));

//     expect(await screen.findByText("First Name is required")).toBeInTheDocument();
//     expect(screen.getByText("Last Name is required")).toBeInTheDocument();
//     expect(screen.getByText("Email is required")).toBeInTheDocument();
//     expect(screen.getByText("Password is required")).toBeInTheDocument();
//     expect(screen.getByText("Confirm password is required")).toBeInTheDocument();

//     expect(mockedAxios.post).not.toHaveBeenCalled();
//     expect(mockedSignIn).not.toHaveBeenCalled();
//     expect(mockPush).not.toHaveBeenCalled();
//   });

//   it("shows email invalid error when isEmail returns false", async () => {
//     const user = userEvent.setup();
//     isEmailMock.mockReturnValue(false);

//     render(<RegisterForm />);

//     await user.type(screen.getByLabelText(/first name/i), "John");
//     await user.type(screen.getByLabelText(/last name/i), "Doe");

//     // IMPORTANT: valid for native type="email" input, 
//     // not testing isEmail here, because isEmailMock will return false
//     await user.type(screen.getByLabelText(/email/i), "not-an-email");

//     await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
//     await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");

//     await user.click(screen.getByRole("button", { name: /register/i }));
   
//     expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
    
//     expect(mockedAxios.post).not.toHaveBeenCalled();
//   });

//   it("phone is optional: blank phone does not block submit", async () => {
//     const user = userEvent.setup();
//     render(<RegisterForm />);

//     await user.type(screen.getByLabelText(/first name/i), "Eric");
//     await user.type(screen.getByLabelText(/last name/i), "Adolphson");
//     await user.type(screen.getByLabelText(/email/i), "eric@example.com");
//     // phone left blank
//     await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
//     await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");

//     await user.click(screen.getByRole("button", { name: /register/i }));

//     await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));
//     expect(phoneMock).not.toHaveBeenCalled(); // code only calls phone() when phone has text
//   });

//   it("shows phone invalid error when phone() says invalid", async () => {
//     const user = userEvent.setup();
//     phoneMock.mockReturnValue({ isValid: false });

//     render(<RegisterForm />);

//     await fillValidForm(user);

//     await user.click(screen.getByRole("button", { name: /register/i }));

//     expect(await screen.findByText("Phone not valid")).toBeInTheDocument();
//     expect(mockedAxios.post).not.toHaveBeenCalled();
//   });

//   it("shows password format errors when isPassword8to20 returns false", async () => {
//     const user = userEvent.setup();
//     isPassword8to20Mock.mockImplementation((v: string) => v === "Aa1!aaaa"); // only one passes

//     render(<RegisterForm />);

//     await user.type(screen.getByLabelText(/first name/i), "Eric");
//     await user.type(screen.getByLabelText(/last name/i), "Adolphson");
//     await user.type(screen.getByLabelText(/email/i), "eric@example.com");
//     await user.type(screen.getByLabelText(/^password$/i), "bad");
//     await user.type(screen.getByLabelText(/confirm password/i), "bad");

//     await user.click(screen.getByRole("button", { name: /register/i }));

//     expect(
//       await screen.findAllByText(/Password not in a valid format/i)
//     ).toHaveLength(2);
//     expect(mockedAxios.post).not.toHaveBeenCalled();
//   });

//   it("shows 'Passwords do not match' when both formats valid but differ", async () => {
//     const user = userEvent.setup();
//     isPassword8to20Mock.mockReturnValue(true);

//     render(<RegisterForm />);

//     await user.type(screen.getByLabelText(/first name/i), "Eric");
//     await user.type(screen.getByLabelText(/last name/i), "Adolphson");
//     await user.type(screen.getByLabelText(/email/i), "eric@example.com");
//     await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
//     await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaab");

//     await user.click(screen.getByRole("button", { name: /register/i }));

//     expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
//     expect(mockedAxios.post).not.toHaveBeenCalled();
//   });

//   it("successful submit: posts to /auth/register, then signIn, then router.push(/user/tmnts)", async () => {
//     const user = userEvent.setup();
//     render(<RegisterForm />);

//     await fillValidForm(user);
//     await user.click(screen.getByRole("button", { name: /register/i }));

//     await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));

//     const [url, body, config] = mockedAxios.post.mock.calls[0];

//     expect(url).toBe("http://example.test/api/auth/register");
//     expect(config).toEqual(expect.objectContaining({ withCredentials: true }));

//     // body is JSON.stringify(...)
//     const parsed = JSON.parse(body as string);
//     expect(parsed).toEqual(
//       expect.objectContaining({
//         id: "usr_test",
//         first_name: "Eric",
//         last_name: "Adolphson",
//         email: "eric@example.com",
//         phone: "925-555-1212",
//         password: "Aa1!aaaa",
//       })
//     );

//     await waitFor(() => expect(mockedSignIn).toHaveBeenCalledTimes(1));
//     expect(mockedSignIn).toHaveBeenCalledWith("credentials", {
//       redirect: false,
//       email: "eric@example.com",
//       password: "Aa1!aaaa",
//       callbackUrl: "/user/tmnts",
//     });

//     await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/tmnts"));
//   });

//   it("if signIn returns an error, routes to /login", async () => {
//     const user = userEvent.setup();
//     mockedSignIn.mockResolvedValue({ error: "nope" } as any);

//     render(<RegisterForm />);

//     await fillValidForm(user);
//     await user.click(screen.getByRole("button", { name: /register/i }));

//     await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));
//     await waitFor(() => expect(mockedSignIn).toHaveBeenCalledTimes(1));

//     await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
//   });

//   it("if axios throws 409, shows 'Email already in use' alert", async () => {
//     const user = userEvent.setup();
//     mockedAxios.post.mockRejectedValueOnce({ response: { status: 409 } });

//     render(<RegisterForm />);

//     await fillValidForm(user);
//     await user.click(screen.getByRole("button", { name: /register/i }));

//     const alert = await screen.findByRole("alert");
//     expect(alert).toHaveTextContent("Email already in use");

//     expect(mockedSignIn).not.toHaveBeenCalled();
//     expect(mockPush).not.toHaveBeenCalled();
//   });

//   it("clears 'Email already in use' when email input changes", async () => {
//     const user = userEvent.setup();
//     mockedAxios.post.mockRejectedValueOnce({ response: { status: 409 } });

//     render(<RegisterForm />);

//     await fillValidForm(user);
//     await user.click(screen.getByRole("button", { name: /register/i }));

//     expect(await screen.findByRole("alert")).toHaveTextContent("Email already in use");

//     const emailInput = screen.getByLabelText(/email/i);
//     await user.clear(emailInput);
//     await user.type(emailInput, "new@example.com");

//     await waitFor(() => {
//       expect(screen.queryByRole("alert")).not.toBeInTheDocument();
//     });
//   });

//   it("sanitizes first/last name and writes sanitized values back into inputs", async () => {
//     const user = userEvent.setup();
//     sanitizeNameMock.mockImplementation((v: any) => {
//       if (typeof v !== "string") return "";
//       // simulate stripping punctuation and trimming
//       return v.replace(/[^a-z ]/gi, "").trim();
//     });

//     render(<RegisterForm />);

//     await user.type(screen.getByLabelText(/first name/i), "  E!r@i#c  ");
//     await user.type(screen.getByLabelText(/last name/i), "  A$d%o^l&p*h*s(o)n  ");
//     await user.type(screen.getByLabelText(/email/i), "eric@example.com");
//     await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
//     await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");

//     await user.click(screen.getByRole("button", { name: /register/i }));

//     // validateForm sets state with sanitized user, so inputs should update
//     expect((screen.getByLabelText(/first name/i) as HTMLInputElement).value).toBe("Eric");
//     expect((screen.getByLabelText(/last name/i) as HTMLInputElement).value).toBe("Adolphson");
//   });

//   it("clears a field error when typing into that field (e.g., first name)", async () => {
//     const user = userEvent.setup();
//     render(<RegisterForm />);

//     // submit empty to generate error
//     await user.click(screen.getByRole("button", { name: /register/i }));
//     expect(await screen.findByText("First Name is required")).toBeInTheDocument();

//     // typing in first name should clear its error text (handleInputChange)
//     await user.type(screen.getByLabelText(/first name/i), "E");

//     // error div is still there but should be empty; simplest is: the text should disappear
//     await waitFor(() => {
//       expect(screen.queryByText("First Name is required")).not.toBeInTheDocument();
//     });
//   });

//   it("adds bootstrap is-invalid class when a field has an error (email)", async () => {
//     const user = userEvent.setup();
//     isEmailMock.mockReturnValue(false);

//     render(<RegisterForm />);

//     await user.type(screen.getByLabelText(/first name/i), "John");
//     await user.type(screen.getByLabelText(/last name/i), "Doe");

//     // IMPORTANT: valid for native type="email" input, 
//     // not testing isEmail here, because isEmailMock will return false
//     await user.type(screen.getByLabelText(/email/i), "bad");

//     await user.type(screen.getByLabelText(/^password$/i), "Aa1!aaaa");
//     await user.type(screen.getByLabelText(/confirm password/i), "Aa1!aaaa");

//     await user.click(screen.getByRole("button", { name: /register/i }));

//     const email = screen.getByLabelText(/email/i);
//     expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
//     expect(email.className).toMatch(/is-invalid/);
//   });
// });