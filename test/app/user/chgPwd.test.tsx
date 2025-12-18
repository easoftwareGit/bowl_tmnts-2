import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ChangePassword from "@/app/user/acctInfo/chgPwd";
import { findUserById } from "@/lib/db/users/users";
import { doCompare } from "@/lib/hash";
import { patchUser } from "@/lib/db/users/dbUsers";

// ---- mocks ----

// next/image -> plain img so RTL can handle it
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  },
}));

jest.mock("@/lib/db/users/users", () => ({
  findUserById: jest.fn(),
}));

jest.mock("@/lib/hash", () => ({
  doCompare: jest.fn(),
  doHash: jest.fn(),
}));

jest.mock("@/lib/db/users/dbUsers", () => ({
  patchUser: jest.fn(),
}));

/**
 * Mock ModalErrorMsg to something simple and testable.
 * Your real component uses react-bootstrap Modal; just need:
 *  - show/title/message render
 *  - an onCancel button that calls props.onCancel
 */
jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: (props: any) => {
    if (!props.show) return null;
    return (
      <div data-testid="modalError">
        <div>{props.title}</div>
        <div>{props.message}</div>
        <button type="button" onClick={props.onCancel}>
          OK
        </button>
      </div>
    );
  },
}));

describe("ChangePassword", () => {
  const mockFindUserById = findUserById as jest.Mock;
  const mockDoCompare = doCompare as jest.Mock;
  const mockPatchUser = patchUser as jest.Mock;

  const setInfoType = jest.fn();

  const mockUser = {
    id: "usr_1",
    first_name: "John",
    last_name: "Doe",
    password_hash: "hashed_pw",
  } as any; // keep as any since your real userType has more fields

  const goodCurrent = "Aa1!aaaa"; // 8 chars, meets typical complexity
  const goodNew = "Bb2!bbbb";
  const goodConfirm = "Bb2!bbbb";

  beforeEach(() => {
    jest.clearAllMocks();

    // validUserData() calls findUserById first if everything else passes
    mockFindUserById.mockResolvedValue({ id: mockUser.id });

    // current password compare
    mockDoCompare.mockResolvedValue(true);

    // patch ok
    mockPatchUser.mockResolvedValue({ id: mockUser.id });
  });

  const fillAll = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByTestId("inputCurrent"), goodCurrent);
    await user.type(screen.getByTestId("inputNew"), goodNew);
    await user.type(screen.getByTestId("inputConfirm"), goodConfirm);
  };

  it("renders the user's full name", () => {
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("Acct Info and Cancel buttons call setInfoType('AcctInfo')", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await u.click(screen.getByRole("button", { name: /acct info/i }));
    expect(setInfoType).toHaveBeenCalledWith("AcctInfo");

    await u.click(screen.getByRole("button", { name: /cancel/i }));
    expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
  });

  it("toggles password visibility for Current/New/Confirm inputs", async () => {
    const user = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    const currentInput = screen.getByTestId("inputCurrent");
    const newInput = screen.getByTestId("inputNew");
    const confirmInput = screen.getByTestId("inputConfirm");

    expect(currentInput).toHaveAttribute("type", "password");
    expect(newInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");

    // each input-group has a button; use structural queries within the nearest container
    const currentToggle = screen.getByRole("button", {
      name: /toggle current password visibility/i,
    });    
    await user.click(currentToggle);
    expect(currentInput).toHaveAttribute("type", "text");
    await user.click(currentToggle);
    expect(currentInput).toHaveAttribute("type", "password");

    const newToggle = screen.getByRole("button", {
      name: /toggle new password visibility/i,
    });    
    await user.click(newToggle);
    expect(newInput).toHaveAttribute("type", "text");
    await user.click(newToggle);
    expect(newInput).toHaveAttribute("type", "password");

    const confirmToggle = screen.getByRole("button", {
      name: /toggle confirm password visibility/i,
    });    
    await user.click(confirmToggle);
    expect(confirmInput).toHaveAttribute("type", "text");
    await user.click(confirmToggle);
    expect(confirmInput).toHaveAttribute("type", "password");
  });

  it("clicking Update with blank fields shows required errors and does not call db/compare/patch", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await u.click(screen.getByRole("button", { name: /update/i }));

    expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();

    expect(mockFindUserById).not.toHaveBeenCalled();
    expect(mockDoCompare).not.toHaveBeenCalled();
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it("shows mismatch error when New and Confirm do not match; does not patch", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await u.type(screen.getByTestId("inputCurrent"), goodCurrent);
    await u.type(screen.getByTestId("inputNew"), goodNew);
    await u.type(screen.getByTestId("inputConfirm"), "Cc3!cccc"); // different

    await u.click(screen.getByRole("button", { name: /update/i }));

    expect(await screen.findByText(/new and confirm passwords do not match/i)).toBeInTheDocument();
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it("when current password compare fails, shows 'Current Password is incorrect' and does not patch", async () => {
    mockDoCompare.mockResolvedValueOnce(false);

    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await fillAll(u);
    await u.click(screen.getByRole("button", { name: /update/i }));

    expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it("successful update calls patchUser and shows success modal; closing modal navigates to AcctInfo", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await fillAll(u);
    await u.click(screen.getByRole("button", { name: /update/i }));

    await waitFor(() => {
      expect(mockPatchUser).toHaveBeenCalledWith({ id: mockUser.id, password: goodNew });
    });

    const modal = await screen.findByTestId("modalError");
    expect(within(modal).getByText(/update password success/i)).toBeInTheDocument();
    expect(within(modal).getByText(/successfully updated password/i)).toBeInTheDocument();

    await u.click(within(modal).getByRole("button", { name: /ok/i }));
    expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
  });

  it("patchUser failure shows failure modal and does NOT navigate to AcctInfo when modal closes", async () => {
    mockPatchUser.mockResolvedValueOnce(null);

    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await fillAll(u);
    await u.click(screen.getByRole("button", { name: /update/i }));

    const modal = await screen.findByTestId("modalError");
    expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();

    await u.click(within(modal).getByRole("button", { name: /ok/i }));

    // should NOT auto-navigate on failure (your code only navigates when errModalObj.id === 'success')
    expect(setInfoType).not.toHaveBeenCalledWith("AcctInfo");
  });
});
