import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AcctInfo from "@/app/user/acctInfo/acctInfo";
import { useSession } from "next-auth/react";
import { findUserByEmail } from "@/lib/db/users/users";
import { patchUser } from "@/lib/db/users/dbUsers";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/lib/db/users/users", () => ({
  __esModule: true,
  findUserByEmail: jest.fn(),
}));

jest.mock("@/lib/db/users/dbUsers", () => ({
  __esModule: true,
  patchUser: jest.fn(),
}));

// phone() library: keep it deterministic for tests
jest.mock("phone", () => ({
  phone: jest.fn(),
}));

import { phone as phoneChecking } from "phone";

// ---------- helpers ----------
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockFindUserByEmail = findUserByEmail as jest.MockedFunction<typeof findUserByEmail>;
const mockPatchUser = patchUser as jest.MockedFunction<typeof patchUser>;
const mockPhone = phoneChecking as jest.MockedFunction<typeof phoneChecking>;

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password_hash: string;
};

const makeUser = (overrides?: Partial<User>): User => ({
  id: "usr_1",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "1234567890",
  password_hash: "hash", // non-empty => Change Password enabled
  ...overrides,
});

describe("AcctInfoForm Component", () => {
  const setInfoType = jest.fn();
  const setUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();

    mockUseSession.mockReturnValue({
      status: "authenticated",      
      data: {
        user: {
          id: "fake-user-id",
          role: "User", 
          name: "Test User",          
        },
        expires: "2099-01-01T00:00:00.000Z", 
      },
      update: jest.fn(),
    });

    // default: phone is valid
    mockPhone.mockReturnValue({ isValid: true } as any);

    // default: email not already in use
    mockFindUserByEmail.mockResolvedValue(null as any);

    // default: patch succeeds
    mockPatchUser.mockResolvedValue({ id: "usr_1" } as any);
  });

  it("should render and populate the form with user data", async () => {
    const userData = makeUser();
    render(
      <AcctInfo
        user={userData as any}
        setUser={setUser}
        origUserData={userData as any}
        setInfoType={setInfoType}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/First Name/i)).toHaveValue("John");
    });

    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Doe");
    expect(screen.getByLabelText(/Email/i)).toHaveValue("john.doe@example.com");
    expect(screen.getByLabelText(/Phone/i)).toHaveValue("1234567890");

    expect(
      screen.getByRole("button", { name: /change password/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it("clicking Change Password calls setInfoType('Password')", async () => {
    const user = userEvent.setup();
    const userData = makeUser();
    render(
      <AcctInfo
        user={userData as any}
        setUser={setUser}
        origUserData={userData as any}
        setInfoType={setInfoType}
      />
    );

    const btn = screen.getByRole("button", { name: /change password/i });
    expect(btn).toBeEnabled();

    await user.click(btn);

    expect(setInfoType).toHaveBeenCalledTimes(1);
    expect(setInfoType).toHaveBeenCalledWith("Password");
  });

  it("clicking Save validates fields and blocks when no first name", async () => {
    const user = userEvent.setup();

    const orig = makeUser();
    const invalidUser = makeUser({ first_name: "" });

    render(
      <AcctInfo
        user={invalidUser as any}
        setUser={setUser}
        origUserData={orig as any}
        setInfoType={setInfoType}
      />
    );

    const updateMock = (mockUseSession.mock.results.at(-1)?.value as any)
      ?.update as jest.Mock | undefined;

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(
      await screen.findByText(/first name is required/i)
    ).toBeInTheDocument();

    expect(updateMock).not.toHaveBeenCalled();
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it("clicking Save validates fields and blocks when no last name", async () => {
    const user = userEvent.setup();

    const orig = makeUser();
    const invalidUser = makeUser({ last_name: "" });

    render(
      <AcctInfo
        user={invalidUser as any}
        setUser={setUser}
        origUserData={orig as any}
        setInfoType={setInfoType}
      />
    );

    const updateMock = (mockUseSession.mock.results.at(-1)?.value as any)
      ?.update as jest.Mock | undefined;

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(
      await screen.findByText(/last name is required/i)
    ).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it("clicking Save validates fields and blocks when no email", async () => {
    const user = userEvent.setup();

    const orig = makeUser();
    const invalidUser = makeUser({ email: "" });

    render(
      <AcctInfo
        user={invalidUser as any}
        setUser={setUser}
        origUserData={orig as any}
        setInfoType={setInfoType}
      />
    );

    const updateMock = (mockUseSession.mock.results.at(-1)?.value as any)
      ?.update as jest.Mock | undefined;

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it("clicking Save validates fields and blocks when invalid email", async () => {
    const user = userEvent.setup();

    const orig = makeUser();
    const invalidUser = makeUser({ email: "noDotCom" });

    render(
      <AcctInfo
        user={invalidUser as any}
        setUser={setUser}
        origUserData={orig as any}
        setInfoType={setInfoType}
      />
    );

    const updateMock = (mockUseSession.mock.results.at(-1)?.value as any)
      ?.update as jest.Mock | undefined;

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText(/email is not valid/i)).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it("clicking Save validates fields and blocks when invalid phone", async () => {
    const user = userEvent.setup();

    const orig = makeUser();
    const invalidUser = makeUser({ phone: "abc" });

    mockPhone.mockReturnValueOnce({ isValid: false } as any);

    render(
      <AcctInfo
        user={invalidUser as any}
        setUser={setUser}
        origUserData={orig as any}
        setInfoType={setInfoType}
      />
    );

    const updateMock = (mockUseSession.mock.results.at(-1)?.value as any)
      ?.update as jest.Mock | undefined;

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText(/phone is not valid/i)).toBeInTheDocument();

    expect(updateMock).not.toHaveBeenCalled();
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it("clicking Cancel navigates back to home", async () => {
    const user = userEvent.setup();

    const orig = makeUser();
    const curr = makeUser();

    render(
      <AcctInfo
        user={curr as any}
        setUser={setUser}
        origUserData={orig as any}
        setInfoType={setInfoType}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
