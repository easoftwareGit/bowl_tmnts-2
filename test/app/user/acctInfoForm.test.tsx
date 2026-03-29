import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import AcctInfoForm from "@/app/user/acctInfo/form";

// --- mocks ---
const mockUseSession = jest.fn();
jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

const mockGetUserById = jest.fn();
jest.mock("@/lib/db/users/dbUsers", () => ({
  getUserById: (...args: any[]) => mockGetUserById(...args),
}));

jest.mock("@/lib/db/initVals", () => ({
  blankUserData: {
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: undefined,
  },
}));

import { blankUserData } from "@/lib/db/initVals";

// Mock AcctInfo and ChangePassword so we can:
// - assert they render
// - trigger setInfoType to flip between views
const acctInfoSpy = jest.fn();
jest.mock("@/app/user/acctInfo/acctInfo", () => {
  return function MockAcctInfo(props: any) {
    acctInfoSpy(props);
    return (
      <div data-testid="AcctInfoMock">
        <div>AcctInfo Child</div>
        <button onClick={() => props.setInfoType("Password")}>
          Change Password
        </button>
      </div>
    );
  };
});

const changePwdSpy = jest.fn();
jest.mock("@/app/user/acctInfo/chgPwd", () => {
  return function MockChangePassword(props: any) {
    changePwdSpy(props);
    return (
      <div data-testid="ChangePasswordMock">
        <div>ChangePassword Child</div>
        <button onClick={() => props.setInfoType("AcctInfo")}>
          Account Info
        </button>
      </div>
    );
  };
});

function setSessionAuthed(userId: string) {
  mockUseSession.mockReturnValue({
    status: "authenticated",
    data: { user: { id: userId } },
    update: jest.fn(),
  });
}

describe("AcctInfoForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows Account Information heading and Loading... initially, then renders AcctInfo after fetch", async () => {
    setSessionAuthed("usr_123");

    mockGetUserById.mockResolvedValue({
      id: "usr_123",
      first_name: "Eric",
      last_name: "A",
      email: "eric@example.com",
      password_hash: "hash",
      phone: "9255551212",
    });

    render(<AcctInfoForm />);

    expect(
      screen.getByRole("heading", { name: /account information/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(mockGetUserById).toHaveBeenCalledWith("usr_123")
    );

    expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();

    expect(acctInfoSpy).toHaveBeenCalled();
    const lastProps = acctInfoSpy.mock.calls.at(-1)?.[0];

    expect(lastProps.user).toMatchObject({
      id: "usr_123",
      first_name: "Eric",
      last_name: "A",
      email: "eric@example.com",
      password_hash: "hash",
      phone: "9255551212",
      role: undefined,
    });

    expect(lastProps.origUserData).toEqual({
      id: "usr_123",
      first_name: "Eric",
      last_name: "A",
      email: "eric@example.com",
      phone: "9255551212",
      role: undefined,
    });

    expect(typeof lastProps.setUser).toBe("function");
    expect(typeof lastProps.setInfoType).toBe("function");
  });

  it("switches between AcctInfo and ChangePassword (heading + rendered child) via setInfoType", async () => {
    const user = userEvent.setup();
    setSessionAuthed("usr_999");

    mockGetUserById.mockResolvedValue({
      id: "usr_999",
      first_name: "Sam",
      last_name: "B",
      email: "sam@example.com",
      password_hash: "hash2",
      // no phone
    });

    render(<AcctInfoForm />);

    // wait for acct info view
    expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /account information/i })
    ).toBeInTheDocument();

    // switch to change password
    await user.click(
      screen.getByRole("button", { name: /change password/i })
    );

    expect(
      screen.getByRole("heading", { name: /change password/i })
    ).toBeInTheDocument();
    expect(await screen.findByTestId("ChangePasswordMock")).toBeInTheDocument();
    expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();

    // switch back
    await user.click(
      screen.getByRole("button", { name: /account info/i })
    );

    expect(
      screen.getByRole("heading", { name: /account information/i })
    ).toBeInTheDocument();
    expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();

    // verify ChangePassword got expected props
    expect(changePwdSpy).toHaveBeenCalled();
    const lastProps = changePwdSpy.mock.calls.at(-1)?.[0];
    expect(lastProps.user).toMatchObject({
      id: "usr_999",
      first_name: "Sam",
      last_name: "B",
      email: "sam@example.com",
      password_hash: "hash2",
      phone: "", // from blankUser
    });
    expect(typeof lastProps.setInfoType).toBe("function");
  });

  it("shows error and does not render children when getUserById throws", async () => {
    setSessionAuthed("usr_err");
    mockGetUserById.mockRejectedValue(new Error("db down"));

    render(<AcctInfoForm />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    expect(await screen.findByText(/error:\s*failed to fetch user/i)).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();

    expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();
  });

  it("when getUserById returns null/undefined, it stops without error and still renders AcctInfo with blank values", async () => {
    setSessionAuthed("usr_none");
    mockGetUserById.mockResolvedValue(null);

    render(<AcctInfoForm />);

    await waitFor(() =>
      expect(mockGetUserById).toHaveBeenCalledWith("usr_none")
    );

    expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
    expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();

    const lastProps = acctInfoSpy.mock.calls.at(-1)?.[0];

    expect(lastProps.user).toEqual({
      ...blankUserData,
      password_hash: "",
    });

    expect(lastProps.origUserData).toEqual(blankUserData);
  });

});
