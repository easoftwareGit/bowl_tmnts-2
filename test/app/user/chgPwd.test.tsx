import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ChangePassword from "@/app/user/acctInfo/chgPwd";
import { changePassword } from "@/lib/db/users/dbUsers";

// ---- mocks ----

// next/image -> plain img so RTL can handle it
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  },
}));

jest.mock("@/lib/db/users/dbUsers", () => ({
  changePassword: jest.fn(),
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
  const mockChangePassword = changePassword as jest.Mock;

  const setInfoType = jest.fn();

  const mockUser = {
    id: "usr_1",
    email: "john@example.com",
    first_name: "John",
    last_name: "Doe",
    phone: "",
    role: "USER",
  } as const;

  const goodCurrent = "Aa1!aaaa";
  const goodNew = "Bb2!bbbb";
  const goodConfirm = "Bb2!bbbb";

  beforeEach(() => {
    jest.clearAllMocks();
    mockChangePassword.mockResolvedValue({ success: true });
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

  it("clicking Update with blank fields shows required errors and does not call changePassword", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await u.click(screen.getByRole("button", { name: /update/i }));

    expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();

    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("shows invalid format errors and does not call changePassword", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await u.type(screen.getByTestId("inputCurrent"), "test");
    await u.type(screen.getByTestId("inputNew"), "test");
    await u.type(screen.getByTestId("inputConfirm"), "test");
    await u.click(screen.getByRole("button", { name: /update/i }));

    const invalidMsgs = await screen.findAllByText(
      /password not in a valid format/i
    );
    expect(invalidMsgs).toHaveLength(3);
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("shows mismatch error when New and Confirm do not match; does not call changePassword", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await u.type(screen.getByTestId("inputCurrent"), goodCurrent);
    await u.type(screen.getByTestId("inputNew"), goodNew);
    await u.type(screen.getByTestId("inputConfirm"), "Cc3!cccc");

    await u.click(screen.getByRole("button", { name: /update/i }));

    expect(await screen.findByText(/new and confirm passwords do not match/i)).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("shows error when New Password is the same as Current Password; does not call changePassword", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await u.type(screen.getByTestId("inputCurrent"), goodCurrent);
    await u.type(screen.getByTestId("inputNew"), goodCurrent);
    await u.type(screen.getByTestId("inputConfirm"), goodCurrent);

    await u.click(screen.getByRole("button", { name: /update/i }));

    expect(
      await screen.findByText(/new password cannot be the same as current password/i)
    ).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("when changePassword returns 'Current Password is incorrect', shows inline error and no modal", async () => {
    mockChangePassword.mockResolvedValueOnce({
      success: false,
      error: "Current Password is incorrect",
    });

    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await fillAll(u);
    await u.click(screen.getByRole("button", { name: /update/i }));

    expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
    expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(
        mockUser.id,
        goodCurrent,
        goodNew
      );
    });
  });

  it("successful update calls changePassword and shows success modal; closing modal navigates to AcctInfo", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await fillAll(u);
    await u.click(screen.getByRole("button", { name: /update/i }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(
        mockUser.id,
        goodCurrent,
        goodNew
      );
    });

    const modal = await screen.findByTestId("modalError");
    expect(within(modal).getByText(/update password success/i)).toBeInTheDocument();
    expect(within(modal).getByText(/successfully updated password/i)).toBeInTheDocument();

    await u.click(within(modal).getByRole("button", { name: /ok/i }));
    expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
  });

  it("changePassword failure shows failure modal and does NOT navigate to AcctInfo when modal closes", async () => {
    mockChangePassword.mockResolvedValueOnce({
      success: false,
      error: "User has no password",
    });

    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await fillAll(u);
    await u.click(screen.getByRole("button", { name: /update/i }));

    const modal = await screen.findByTestId("modalError");
    expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
    expect(within(modal).getByText(/user has no password/i)).toBeInTheDocument();

    await u.click(within(modal).getByRole("button", { name: /ok/i }));
    expect(setInfoType).not.toHaveBeenCalledWith("AcctInfo");
  });

  it("changePassword failure with no error message shows default failure modal message", async () => {
    mockChangePassword.mockResolvedValueOnce({
      success: false,
    });

    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await fillAll(u);
    await u.click(screen.getByRole("button", { name: /update/i }));

    const modal = await screen.findByTestId("modalError");
    expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
    expect(within(modal).getByText(/cannot update new password\./i)).toBeInTheDocument();
  });

  it("clears field error when user edits that field", async () => {
    const u = userEvent.setup();
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

    await u.click(screen.getByRole("button", { name: /update/i }));
    expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();

    await u.type(screen.getByTestId("inputCurrent"), "A");

    expect(screen.queryByText(/current password is required/i)).not.toBeInTheDocument();
  });
});

// import React from "react";
// import { render, screen, within, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import "@testing-library/jest-dom";
// import ChangePassword from "@/app/user/acctInfo/chgPwd";
// import { getUserById, patchUser } from "@/lib/db/users/dbUsers";
// import { doCompare } from "@/lib/server/hashServer";

// // ---- mocks ----

// // next/image -> plain img so RTL can handle it
// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: (props: any) => {
//     // eslint-disable-next-line @next/next/no-img-element
//     return <img {...props} alt={props.alt ?? ""} />;
//   },
// }));

// jest.mock("@/lib/server/hashServer", () => ({
//   doCompare: jest.fn(),
//   doHash: jest.fn(),
// }));

// jest.mock("@/lib/db/users/dbUsers", () => ({
//   getUserById: jest.fn(),
//   patchUser: jest.fn(),
// }));

// /**
//  * Mock ModalErrorMsg to something simple and testable.
//  * Your real component uses react-bootstrap Modal; just need:
//  *  - show/title/message render
//  *  - an onCancel button that calls props.onCancel
//  */
// jest.mock("@/components/modal/errorModal", () => ({
//   __esModule: true,
//   default: (props: any) => {
//     if (!props.show) return null;
//     return (
//       <div data-testid="modalError">
//         <div>{props.title}</div>
//         <div>{props.message}</div>
//         <button type="button" onClick={props.onCancel}>
//           OK
//         </button>
//       </div>
//     );
//   },
// }));

// describe("ChangePassword", () => {
//   const mockGetUserById = getUserById as jest.Mock;
//   const mockDoCompare = doCompare as jest.Mock;
//   const mockPatchUser = patchUser as jest.Mock;

//   const setInfoType = jest.fn();

//   const mockUser = {
//     id: "usr_1",
//     email: "john@example.com",
//     first_name: "John",
//     last_name: "Doe",
//     phone: "",
//     role: "USER",
//     password_hash: "hashed_pw",
//   } as const; // keep as any since your real userType has more fields

//   const goodCurrent = "Aa1!aaaa"; // 8 chars, meets typical complexity
//   const goodNew = "Bb2!bbbb";
//   const goodConfirm = "Bb2!bbbb";

//   beforeEach(() => {
//     jest.clearAllMocks();

//     // validUserData() calls getUserById first if everything else passes
//     mockGetUserById.mockResolvedValue({ id: mockUser.id });

//     // current password compare
//     mockDoCompare.mockResolvedValue(true);

//     // patch ok
//     mockPatchUser.mockResolvedValue({ id: mockUser.id });
//   });

//   const fillAll = async (user: ReturnType<typeof userEvent.setup>) => {
//     await user.type(screen.getByTestId("inputCurrent"), goodCurrent);
//     await user.type(screen.getByTestId("inputNew"), goodNew);
//     await user.type(screen.getByTestId("inputConfirm"), goodConfirm);
//   };

//   it("renders the user's full name", () => {
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);
//     expect(screen.getByText("John Doe")).toBeInTheDocument();
//   });

//   it("Acct Info and Cancel buttons call setInfoType('AcctInfo')", async () => {
//     const u = userEvent.setup();
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

//     await u.click(screen.getByRole("button", { name: /acct info/i }));
//     expect(setInfoType).toHaveBeenCalledWith("AcctInfo");

//     await u.click(screen.getByRole("button", { name: /cancel/i }));
//     expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
//   });

//   it("toggles password visibility for Current/New/Confirm inputs", async () => {
//     const user = userEvent.setup();
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

//     const currentInput = screen.getByTestId("inputCurrent");
//     const newInput = screen.getByTestId("inputNew");
//     const confirmInput = screen.getByTestId("inputConfirm");

//     expect(currentInput).toHaveAttribute("type", "password");
//     expect(newInput).toHaveAttribute("type", "password");
//     expect(confirmInput).toHaveAttribute("type", "password");

//     // each input-group has a button; use structural queries within the nearest container
//     const currentToggle = screen.getByRole("button", {
//       name: /toggle current password visibility/i,
//     });    
//     await user.click(currentToggle);
//     expect(currentInput).toHaveAttribute("type", "text");
//     await user.click(currentToggle);
//     expect(currentInput).toHaveAttribute("type", "password");

//     const newToggle = screen.getByRole("button", {
//       name: /toggle new password visibility/i,
//     });    
//     await user.click(newToggle);
//     expect(newInput).toHaveAttribute("type", "text");
//     await user.click(newToggle);
//     expect(newInput).toHaveAttribute("type", "password");

//     const confirmToggle = screen.getByRole("button", {
//       name: /toggle confirm password visibility/i,
//     });    
//     await user.click(confirmToggle);
//     expect(confirmInput).toHaveAttribute("type", "text");
//     await user.click(confirmToggle);
//     expect(confirmInput).toHaveAttribute("type", "password");
//   });

//   it("clicking Update with blank fields shows required errors and does not call db/compare/patch", async () => {
//     const u = userEvent.setup();
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

//     await u.click(screen.getByRole("button", { name: /update/i }));

//     expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
//     expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
//     expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();

//     expect(mockGetUserById).not.toHaveBeenCalled();
//     expect(mockDoCompare).not.toHaveBeenCalled();
//     expect(mockPatchUser).not.toHaveBeenCalled();
//   });

//   it("shows mismatch error when New and Confirm do not match; does not patch", async () => {
//     const u = userEvent.setup();
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

//     await u.type(screen.getByTestId("inputCurrent"), goodCurrent);
//     await u.type(screen.getByTestId("inputNew"), goodNew);
//     await u.type(screen.getByTestId("inputConfirm"), "Cc3!cccc"); // different

//     await u.click(screen.getByRole("button", { name: /update/i }));

//     expect(await screen.findByText(/new and confirm passwords do not match/i)).toBeInTheDocument();
//     expect(mockPatchUser).not.toHaveBeenCalled();
//   });

//   it("when current password compare fails, shows 'Current Password is incorrect' and does not patch", async () => {
//     mockDoCompare.mockResolvedValueOnce(false);

//     const u = userEvent.setup();
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

//     await fillAll(u);
//     await u.click(screen.getByRole("button", { name: /update/i }));

//     expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
//     expect(mockPatchUser).not.toHaveBeenCalled();
//   });

//   it("successful update calls patchUser and shows success modal; closing modal navigates to AcctInfo", async () => {
//     const u = userEvent.setup();
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

//     await fillAll(u);
//     await u.click(screen.getByRole("button", { name: /update/i }));

//     await waitFor(() => {
//       // expect(mockPatchUser).toHaveBeenCalledWith({ id: mockUser.id, password: goodNew });
//       expect(mockPatchUser).toHaveBeenCalledWith({
//         id: mockUser.id,
//         email: mockUser.email,
//         password: goodNew,
//         first_name: mockUser.first_name,
//         last_name: mockUser.last_name,
//         phone: mockUser.phone,
//         role: mockUser.role,
//       });
//     });

//     const modal = await screen.findByTestId("modalError");
//     expect(within(modal).getByText(/update password success/i)).toBeInTheDocument();
//     expect(within(modal).getByText(/successfully updated password/i)).toBeInTheDocument();

//     await u.click(within(modal).getByRole("button", { name: /ok/i }));
//     expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
//   });

//   it("patchUser failure shows failure modal and does NOT navigate to AcctInfo when modal closes", async () => {
//     mockPatchUser.mockResolvedValueOnce(null);

//     const u = userEvent.setup();
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

//     await fillAll(u);
//     await u.click(screen.getByRole("button", { name: /update/i }));

//     const modal = await screen.findByTestId("modalError");
//     expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();

//     await u.click(within(modal).getByRole("button", { name: /ok/i }));

//     // should NOT auto-navigate on failure (your code only navigates when errModalObj.id === 'success')
//     expect(setInfoType).not.toHaveBeenCalledWith("AcctInfo");
//   });
// });
