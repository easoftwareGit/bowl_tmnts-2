import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePassword from "@/app/user/acctInfo/chgPwd";
import { changePassword } from "@/lib/db/users/dbUsers";
import type { acctUserType } from "@/lib/types/types";

// ---- mocks ----

// next/image -> plain img so RTL can handle it
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} {...props} />
  ),
}));

jest.mock("@/lib/db/users/dbUsers", () => ({
  __esModule: true,
  changePassword: jest.fn(),
}));

// Simple stand-in for the react-bootstrap modal (the real one has its own tests)
jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: (props: {
    show: boolean;
    title: string;
    message: string;
    onCancel?: () => void;
  }) => {
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

// ---- helpers ----

const mockChangePassword = changePassword as jest.MockedFunction<typeof changePassword>;
type ChangePwdResult = Awaited<ReturnType<typeof changePassword>>;

const mockUser: acctUserType = {
  id: "usr_1",
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  phone: "",
  role: "USER",
  has_password: true,
};

// e.g. a Google login: no password saved
const noPwdUser: acctUserType = { ...mockUser, has_password: false };

const goodCurrent = "Aa1!aaaa";
const goodNew = "Bb2!bbbb";

// error text the route / changePassword() can send back
const incorrectMsg = "Current Password is incorrect";
const lockedMsg = "Too many attempts, try again in 15 minutes";

// exact label text, so the toggle buttons' aria-labels don't also match
const currentInput = () => screen.getByLabelText("Current Password");
const newInput = () => screen.getByLabelText("New Password");
const confirmInput = () => screen.getByLabelText("Confirm Password");
const updateBtn = () => screen.getByRole("button", { name: /^update$/i });

describe("ChangePassword", () => {
  const setInfoType = jest.fn();

  const renderChgPwd = () =>
    render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

  const fillAll = async (
    u: ReturnType<typeof userEvent.setup>,
    current = goodCurrent,
    newPwd = goodNew,
    confirm = newPwd
  ) => {
    if (current) await u.type(currentInput(), current);
    if (newPwd) await u.type(newInput(), newPwd);
    if (confirm) await u.type(confirmInput(), confirm);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockChangePassword.mockResolvedValue({ success: true } as ChangePwdResult);
  });

  describe("render", () => {
    it("renders the user's full name", () => {
      renderChgPwd();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("renders blank password inputs, hidden by default", () => {
      renderChgPwd();
      for (const input of [currentInput(), newInput(), confirmInput()]) {
        expect(input).toHaveValue("");
        expect(input).toHaveAttribute("type", "password");
      }
    });

    it("renders the Acct Info, Update and Cancel buttons", () => {
      renderChgPwd();
      expect(screen.getByRole("button", { name: /acct info/i })).toBeInTheDocument();
      expect(updateBtn()).toBeEnabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("does not show the modal initially", () => {
      renderChgPwd();
      expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
    });

    it("does not show the no-password message for a user with a password", () => {
      renderChgPwd();
      expect(screen.queryByTestId("noPasswordMsg")).not.toBeInTheDocument();
    });
  });

  describe("user with no password", () => {
    const renderNoPwd = () =>
      render(<ChangePassword user={noPwdUser} setInfoType={setInfoType} />);

    it("shows the user's name and the no-password message", () => {
      renderNoPwd();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByTestId("noPasswordMsg")).toHaveTextContent(
        /no password to change/i
      );
    });

    it("does not show the password form", () => {
      renderNoPwd();
      expect(screen.queryByLabelText("Current Password")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("New Password")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Confirm Password")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^update$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    });

    it("Acct Info calls setInfoType('AcctInfo')", async () => {
      const u = userEvent.setup();
      renderNoPwd();
      await u.click(screen.getByRole("button", { name: /acct info/i }));
      expect(setInfoType).toHaveBeenCalledTimes(1);
      expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
    });

    it("never calls changePassword", () => {
      renderNoPwd();
      expect(mockChangePassword).not.toHaveBeenCalled();
    });
  });

  describe("navigation buttons", () => {
    it.each([/acct info/i, /cancel/i])(
      "%s calls setInfoType('AcctInfo')",
      async (name) => {
        const u = userEvent.setup();
        renderChgPwd();
        await u.click(screen.getByRole("button", { name }));
        expect(setInfoType).toHaveBeenCalledTimes(1);
        expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
        expect(mockChangePassword).not.toHaveBeenCalled();
      }
    );
  });

  describe("password visibility", () => {
    it.each([
      ["Current Password", /toggle current password visibility/i],
      ["New Password", /toggle new password visibility/i],
      ["Confirm Password", /toggle confirm password visibility/i],
    ])("toggles %s between hidden and shown", async (label, toggleName) => {
      const u = userEvent.setup();
      renderChgPwd();
      const input = screen.getByLabelText(label);
      const toggle = screen.getByRole("button", { name: toggleName });

      expect(input).toHaveAttribute("type", "password");
      expect(within(toggle).getByAltText("show")).toBeInTheDocument();

      await u.click(toggle);
      expect(input).toHaveAttribute("type", "text");
      expect(within(toggle).getByAltText("hide")).toBeInTheDocument();

      await u.click(toggle);
      expect(input).toHaveAttribute("type", "password");
      expect(within(toggle).getByAltText("show")).toBeInTheDocument();
    });

    it("toggling one input does not affect the others", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await u.click(
        screen.getByRole("button", { name: /toggle current password visibility/i })
      );
      expect(currentInput()).toHaveAttribute("type", "text");
      expect(newInput()).toHaveAttribute("type", "password");
      expect(confirmInput()).toHaveAttribute("type", "password");
    });
  });

  describe("validation", () => {
    it("shows required errors for blank fields and does not call changePassword", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await u.click(updateBtn());

      expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
      expect(currentInput()).toHaveClass("is-invalid");
      expect(newInput()).toHaveClass("is-invalid");
      expect(confirmInput()).toHaveClass("is-invalid");
      expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("treats whitespace-only values as blank", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u, "   ", "   ", "   ");
      await u.click(updateBtn());

      expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
      expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("shows invalid format errors and does not call changePassword", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u, "test", "test", "test");
      await u.click(updateBtn());

      const invalidMsgs = await screen.findAllByText(/password not in a valid format/i);
      expect(invalidMsgs).toHaveLength(3);
      expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("only flags the field that is invalid", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u, goodCurrent, "short", "short");
      await u.click(updateBtn());

      // new and confirm have bad format, current is fine
      expect(await screen.findAllByText(/password not in a valid format/i)).toHaveLength(2);
      expect(currentInput()).not.toHaveClass("is-invalid");
      expect(newInput()).toHaveClass("is-invalid");
      expect(confirmInput()).toHaveClass("is-invalid");
    });

    it("shows mismatch error when New and Confirm do not match", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u, goodCurrent, goodNew, "Cc3!cccc");
      await u.click(updateBtn());

      expect(
        await screen.findByText(/new and confirm passwords do not match/i)
      ).toBeInTheDocument();
      expect(confirmInput()).toHaveClass("is-invalid");
      expect(newInput()).not.toHaveClass("is-invalid");
      expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("shows error when New Password is the same as Current Password", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u, goodCurrent, goodCurrent, goodCurrent);
      await u.click(updateBtn());

      expect(
        await screen.findByText(/new password cannot be the same as current password/i)
      ).toBeInTheDocument();
      expect(newInput()).toHaveClass("is-invalid");
      expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("clears a field's error when that field is edited", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await u.click(updateBtn());
      expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();

      await u.type(currentInput(), "A");

      expect(screen.queryByText(/current password is required/i)).not.toBeInTheDocument();
      expect(currentInput()).not.toHaveClass("is-invalid");
      // other fields keep their errors
      expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });
  });

  describe("update success", () => {
    it("calls changePassword once with the user id, current and new passwords", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      await screen.findByTestId("modalError");
      expect(mockChangePassword).toHaveBeenCalledTimes(1);
      // the confirm value is only checked on the page, never sent
      expect(mockChangePassword).toHaveBeenCalledWith(mockUser.id, goodCurrent, goodNew);
    });

    it("shows the success modal; closing it navigates to AcctInfo", async () => {
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      const modal = await screen.findByTestId("modalError");
      expect(within(modal).getByText(/update password success/i)).toBeInTheDocument();
      expect(within(modal).getByText(/successfully updated password/i)).toBeInTheDocument();
      expect(setInfoType).not.toHaveBeenCalled();

      await u.click(within(modal).getByRole("button", { name: /ok/i }));
      expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
      expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
    });

    it("disables Update while saving and ignores extra clicks", async () => {
      let resolveSave!: (value: ChangePwdResult) => void;
      mockChangePassword.mockReturnValue(
        new Promise<ChangePwdResult>((resolve) => {
          resolveSave = resolve;
        })
      );
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);

      await u.click(updateBtn());
      await waitFor(() => expect(updateBtn()).toBeDisabled());
      await u.click(updateBtn());
      expect(mockChangePassword).toHaveBeenCalledTimes(1);

      resolveSave({ success: true } as ChangePwdResult);
      await screen.findByTestId("modalError");
      expect(updateBtn()).toBeEnabled();
    });
  });

  describe("update failure", () => {
    it("'Current Password is incorrect' shows an inline error and no modal", async () => {
      mockChangePassword.mockResolvedValue({
        success: false,
        error: incorrectMsg,
      } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
      expect(currentInput()).toHaveClass("is-invalid");
      expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
      expect(updateBtn()).toBeEnabled();
    });

    it("clears the 'incorrect' error when the current password is edited", async () => {
      mockChangePassword.mockResolvedValue({
        success: false,
        error: incorrectMsg,
      } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());
      await screen.findByText(/current password is incorrect/i);

      await u.type(currentInput(), "x");

      expect(screen.queryByText(/current password is incorrect/i)).not.toBeInTheDocument();
      expect(currentInput()).not.toHaveClass("is-invalid");
    });

    it("lets the user retry after a wrong current password", async () => {
      mockChangePassword
        .mockResolvedValueOnce({ success: false, error: incorrectMsg } as ChangePwdResult)
        .mockResolvedValueOnce({ success: true } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());
      await screen.findByText(/current password is incorrect/i);

      await u.clear(currentInput());
      await u.type(currentInput(), "Cc3!cccc");
      await u.click(updateBtn());

      const modal = await screen.findByTestId("modalError");
      expect(within(modal).getByText(/update password success/i)).toBeInTheDocument();
      expect(mockChangePassword).toHaveBeenCalledTimes(2);
      expect(mockChangePassword).toHaveBeenLastCalledWith(mockUser.id, "Cc3!cccc", goodNew);
    });

    // the route answers 429 on the attempt that locks the account and while locked
    it("shows the locked message as an inline error on Current Password, no modal", async () => {
      mockChangePassword.mockResolvedValue({
        success: false,
        error: lockedMsg,
      } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      expect(await screen.findByText(lockedMsg)).toBeInTheDocument();
      expect(currentInput()).toHaveClass("is-invalid");
      expect(newInput()).not.toHaveClass("is-invalid");
      expect(confirmInput()).not.toHaveClass("is-invalid");
      expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
      expect(setInfoType).not.toHaveBeenCalled();
      expect(updateBtn()).toBeEnabled();
    });

    it("shows any minutes in the locked message, not just 15", async () => {
      const otherLockMsg = "Too many attempts, try again in 3 minutes";
      mockChangePassword.mockResolvedValue({
        success: false,
        error: otherLockMsg,
      } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      expect(await screen.findByText(otherLockMsg)).toBeInTheDocument();
      expect(currentInput()).toHaveClass("is-invalid");
      expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
    });

    it("clears the locked message when the current password is edited", async () => {
      mockChangePassword.mockResolvedValue({
        success: false,
        error: lockedMsg,
      } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());
      await screen.findByText(lockedMsg);

      await u.type(currentInput(), "x");

      expect(screen.queryByText(lockedMsg)).not.toBeInTheDocument();
      expect(currentInput()).not.toHaveClass("is-invalid");
    });

    it.each([
      ["not logged in", "not logged in"],
      ["not the same user", "not authorized"],
    ])("shows the route's text in the failure modal when %s", async (_label, error) => {
      mockChangePassword.mockResolvedValue({ success: false, error } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      const modal = await screen.findByTestId("modalError");
      expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
      expect(within(modal).getByText(error)).toBeInTheDocument();
    });

    it("shows the failure modal with the returned error; closing it does not navigate", async () => {
      mockChangePassword.mockResolvedValue({
        success: false,
        error: "User has no password",
      } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      const modal = await screen.findByTestId("modalError");
      expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
      expect(within(modal).getByText(/user has no password/i)).toBeInTheDocument();

      await u.click(within(modal).getByRole("button", { name: /ok/i }));
      expect(setInfoType).not.toHaveBeenCalled();
      expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
    });

    it("shows the default message when no error is returned", async () => {
      mockChangePassword.mockResolvedValue({ success: false } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      const modal = await screen.findByTestId("modalError");
      expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
      expect(within(modal).getByText(/cannot update new password\./i)).toBeInTheDocument();
    });

    it("shows the default failure modal when changePassword throws", async () => {
      mockChangePassword.mockRejectedValue(new Error("network down"));
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      const modal = await screen.findByTestId("modalError");
      expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
      expect(within(modal).getByText(/cannot update new password\./i)).toBeInTheDocument();
      // the thrown error's own text is not shown
      expect(within(modal).queryByText(/network down/i)).not.toBeInTheDocument();
      expect(updateBtn()).toBeEnabled();
    });

    it("keeps the entered passwords so the user can retry", async () => {
      mockChangePassword.mockResolvedValue({
        success: false,
        error: incorrectMsg,
      } as ChangePwdResult);
      const u = userEvent.setup();
      renderChgPwd();
      await fillAll(u);
      await u.click(updateBtn());

      await screen.findByText(/current password is incorrect/i);
      expect(currentInput()).toHaveValue(goodCurrent);
      expect(newInput()).toHaveValue(goodNew);
      expect(confirmInput()).toHaveValue(goodNew);
    });
  });
});

// import React from "react";
// import { render, screen, within, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import ChangePassword from "@/app/user/acctInfo/chgPwd";
// import { changePassword } from "@/lib/db/users/dbUsers";
// import type { acctUserType } from "@/lib/types/types";

// // ---- mocks ----

// // next/image -> plain img so RTL can handle it
// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
//     // eslint-disable-next-line @next/next/no-img-element
//     <img alt={alt ?? ""} {...props} />
//   ),
// }));

// jest.mock("@/lib/db/users/dbUsers", () => ({
//   __esModule: true,
//   changePassword: jest.fn(),
// }));

// // Simple stand-in for the react-bootstrap modal (the real one has its own tests)
// jest.mock("@/components/modal/errorModal", () => ({
//   __esModule: true,
//   default: (props: {
//     show: boolean;
//     title: string;
//     message: string;
//     onCancel?: () => void;
//   }) => {
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

// // ---- helpers ----

// const mockChangePassword = changePassword as jest.MockedFunction<typeof changePassword>;
// type ChangePwdResult = Awaited<ReturnType<typeof changePassword>>;

// const mockUser: acctUserType = {
//   id: "usr_1",
//   email: "john@example.com",
//   first_name: "John",
//   last_name: "Doe",
//   phone: "",
//   role: "USER",
//   has_password: true,
// };

// // e.g. a Google login: no password saved
// const noPwdUser: acctUserType = { ...mockUser, has_password: false };

// const goodCurrent = "Aa1!aaaa";
// const goodNew = "Bb2!bbbb";

// // error text the route / changePassword() can send back
// const incorrectMsg = "Current Password is incorrect";
// const lockedMsg = "Too many attempts, try again in 15 minutes";

// // exact label text, so the toggle buttons' aria-labels don't also match
// const currentInput = () => screen.getByLabelText("Current Password");
// const newInput = () => screen.getByLabelText("New Password");
// const confirmInput = () => screen.getByLabelText("Confirm Password");
// const updateBtn = () => screen.getByRole("button", { name: /^update$/i });

// describe("ChangePassword", () => {
//   const setInfoType = jest.fn();

//   const renderChgPwd = () =>
//     render(<ChangePassword user={mockUser} setInfoType={setInfoType} />);

//   const fillAll = async (
//     u: ReturnType<typeof userEvent.setup>,
//     current = goodCurrent,
//     newPwd = goodNew,
//     confirm = newPwd
//   ) => {
//     if (current) await u.type(currentInput(), current);
//     if (newPwd) await u.type(newInput(), newPwd);
//     if (confirm) await u.type(confirmInput(), confirm);
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockChangePassword.mockResolvedValue({ success: true } as ChangePwdResult);
//   });

//   describe("render", () => {
//     it("renders the user's full name", () => {
//       renderChgPwd();
//       expect(screen.getByText("John Doe")).toBeInTheDocument();
//     });

//     it("renders blank password inputs, hidden by default", () => {
//       renderChgPwd();
//       for (const input of [currentInput(), newInput(), confirmInput()]) {
//         expect(input).toHaveValue("");
//         expect(input).toHaveAttribute("type", "password");
//       }
//     });

//     it("renders the Acct Info, Update and Cancel buttons", () => {
//       renderChgPwd();
//       expect(screen.getByRole("button", { name: /acct info/i })).toBeInTheDocument();
//       expect(updateBtn()).toBeEnabled();
//       expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
//     });

//     it("does not show the modal initially", () => {
//       renderChgPwd();
//       expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
//     });

//     it("does not show the no-password message for a user with a password", () => {
//       renderChgPwd();
//       expect(screen.queryByTestId("noPasswordMsg")).not.toBeInTheDocument();
//     });
//   });

//   describe("user with no password", () => {
//     const renderNoPwd = () =>
//       render(<ChangePassword user={noPwdUser} setInfoType={setInfoType} />);

//     it("shows the user's name and the no-password message", () => {
//       renderNoPwd();
//       expect(screen.getByText("John Doe")).toBeInTheDocument();
//       expect(screen.getByTestId("noPasswordMsg")).toHaveTextContent(
//         /no password to change/i
//       );
//     });

//     it("does not show the password form", () => {
//       renderNoPwd();
//       expect(screen.queryByLabelText("Current Password")).not.toBeInTheDocument();
//       expect(screen.queryByLabelText("New Password")).not.toBeInTheDocument();
//       expect(screen.queryByLabelText("Confirm Password")).not.toBeInTheDocument();
//       expect(screen.queryByRole("button", { name: /^update$/i })).not.toBeInTheDocument();
//       expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
//     });

//     it("Acct Info calls setInfoType('AcctInfo')", async () => {
//       const u = userEvent.setup();
//       renderNoPwd();
//       await u.click(screen.getByRole("button", { name: /acct info/i }));
//       expect(setInfoType).toHaveBeenCalledTimes(1);
//       expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
//     });

//     it("never calls changePassword", () => {
//       renderNoPwd();
//       expect(mockChangePassword).not.toHaveBeenCalled();
//     });
//   });

//   describe("navigation buttons", () => {
//     it.each([/acct info/i, /cancel/i])(
//       "%s calls setInfoType('AcctInfo')",
//       async (name) => {
//         const u = userEvent.setup();
//         renderChgPwd();
//         await u.click(screen.getByRole("button", { name }));
//         expect(setInfoType).toHaveBeenCalledTimes(1);
//         expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
//         expect(mockChangePassword).not.toHaveBeenCalled();
//       }
//     );
//   });

//   describe("password visibility", () => {
//     it.each([
//       ["Current Password", /toggle current password visibility/i],
//       ["New Password", /toggle new password visibility/i],
//       ["Confirm Password", /toggle confirm password visibility/i],
//     ])("toggles %s between hidden and shown", async (label, toggleName) => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       const input = screen.getByLabelText(label);
//       const toggle = screen.getByRole("button", { name: toggleName });

//       expect(input).toHaveAttribute("type", "password");
//       expect(within(toggle).getByAltText("show")).toBeInTheDocument();

//       await u.click(toggle);
//       expect(input).toHaveAttribute("type", "text");
//       expect(within(toggle).getByAltText("hide")).toBeInTheDocument();

//       await u.click(toggle);
//       expect(input).toHaveAttribute("type", "password");
//       expect(within(toggle).getByAltText("show")).toBeInTheDocument();
//     });

//     it("toggling one input does not affect the others", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await u.click(
//         screen.getByRole("button", { name: /toggle current password visibility/i })
//       );
//       expect(currentInput()).toHaveAttribute("type", "text");
//       expect(newInput()).toHaveAttribute("type", "password");
//       expect(confirmInput()).toHaveAttribute("type", "password");
//     });
//   });

//   describe("validation", () => {
//     it("shows required errors for blank fields and does not call changePassword", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await u.click(updateBtn());

//       expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
//       expect(currentInput()).toHaveClass("is-invalid");
//       expect(newInput()).toHaveClass("is-invalid");
//       expect(confirmInput()).toHaveClass("is-invalid");
//       expect(mockChangePassword).not.toHaveBeenCalled();
//     });

//     it("treats whitespace-only values as blank", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u, "   ", "   ", "   ");
//       await u.click(updateBtn());

//       expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
//       expect(mockChangePassword).not.toHaveBeenCalled();
//     });

//     it("shows invalid format errors and does not call changePassword", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u, "test", "test", "test");
//       await u.click(updateBtn());

//       const invalidMsgs = await screen.findAllByText(/password not in a valid format/i);
//       expect(invalidMsgs).toHaveLength(3);
//       expect(mockChangePassword).not.toHaveBeenCalled();
//     });

//     it("only flags the field that is invalid", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u, goodCurrent, "short", "short");
//       await u.click(updateBtn());

//       // new and confirm have bad format, current is fine
//       expect(await screen.findAllByText(/password not in a valid format/i)).toHaveLength(2);
//       expect(currentInput()).not.toHaveClass("is-invalid");
//       expect(newInput()).toHaveClass("is-invalid");
//       expect(confirmInput()).toHaveClass("is-invalid");
//     });

//     it("shows mismatch error when New and Confirm do not match", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u, goodCurrent, goodNew, "Cc3!cccc");
//       await u.click(updateBtn());

//       expect(
//         await screen.findByText(/new and confirm passwords do not match/i)
//       ).toBeInTheDocument();
//       expect(confirmInput()).toHaveClass("is-invalid");
//       expect(newInput()).not.toHaveClass("is-invalid");
//       expect(mockChangePassword).not.toHaveBeenCalled();
//     });

//     it("shows error when New Password is the same as Current Password", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u, goodCurrent, goodCurrent, goodCurrent);
//       await u.click(updateBtn());

//       expect(
//         await screen.findByText(/new password cannot be the same as current password/i)
//       ).toBeInTheDocument();
//       expect(newInput()).toHaveClass("is-invalid");
//       expect(mockChangePassword).not.toHaveBeenCalled();
//     });

//     it("clears a field's error when that field is edited", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await u.click(updateBtn());
//       expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();

//       await u.type(currentInput(), "A");

//       expect(screen.queryByText(/current password is required/i)).not.toBeInTheDocument();
//       expect(currentInput()).not.toHaveClass("is-invalid");
//       // other fields keep their errors
//       expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
//     });
//   });

//   describe("update success", () => {
//     it("calls changePassword once with the user id, current and new passwords", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       await screen.findByTestId("modalError");
//       expect(mockChangePassword).toHaveBeenCalledTimes(1);
//       // the confirm value is only checked on the page, never sent
//       expect(mockChangePassword).toHaveBeenCalledWith(mockUser.id, goodCurrent, goodNew);
//     });

//     it("shows the success modal; closing it navigates to AcctInfo", async () => {
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       const modal = await screen.findByTestId("modalError");
//       expect(within(modal).getByText(/update password success/i)).toBeInTheDocument();
//       expect(within(modal).getByText(/successfully updated password/i)).toBeInTheDocument();
//       expect(setInfoType).not.toHaveBeenCalled();

//       await u.click(within(modal).getByRole("button", { name: /ok/i }));
//       expect(setInfoType).toHaveBeenCalledWith("AcctInfo");
//       expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
//     });

//     it("disables Update while saving and ignores extra clicks", async () => {
//       let resolveSave!: (value: ChangePwdResult) => void;
//       mockChangePassword.mockReturnValue(
//         new Promise<ChangePwdResult>((resolve) => {
//           resolveSave = resolve;
//         })
//       );
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);

//       await u.click(updateBtn());
//       await waitFor(() => expect(updateBtn()).toBeDisabled());
//       await u.click(updateBtn());
//       expect(mockChangePassword).toHaveBeenCalledTimes(1);

//       resolveSave({ success: true } as ChangePwdResult);
//       await screen.findByTestId("modalError");
//       expect(updateBtn()).toBeEnabled();
//     });
//   });

//   describe("update failure", () => {
//     it("'Current Password is incorrect' shows an inline error and no modal", async () => {
//       mockChangePassword.mockResolvedValue({
//         success: false,
//         error: incorrectMsg,
//       } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
//       expect(currentInput()).toHaveClass("is-invalid");
//       expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
//       expect(updateBtn()).toBeEnabled();
//     });

//     it("clears the 'incorrect' error when the current password is edited", async () => {
//       mockChangePassword.mockResolvedValue({
//         success: false,
//         error: incorrectMsg,
//       } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());
//       await screen.findByText(/current password is incorrect/i);

//       await u.type(currentInput(), "x");

//       expect(screen.queryByText(/current password is incorrect/i)).not.toBeInTheDocument();
//       expect(currentInput()).not.toHaveClass("is-invalid");
//     });

//     it("lets the user retry after a wrong current password", async () => {
//       mockChangePassword
//         .mockResolvedValueOnce({ success: false, error: incorrectMsg } as ChangePwdResult)
//         .mockResolvedValueOnce({ success: true } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());
//       await screen.findByText(/current password is incorrect/i);

//       await u.clear(currentInput());
//       await u.type(currentInput(), "Cc3!cccc");
//       await u.click(updateBtn());

//       const modal = await screen.findByTestId("modalError");
//       expect(within(modal).getByText(/update password success/i)).toBeInTheDocument();
//       expect(mockChangePassword).toHaveBeenCalledTimes(2);
//       expect(mockChangePassword).toHaveBeenLastCalledWith(mockUser.id, "Cc3!cccc", goodNew);
//     });

//     // the route answers 429 on the attempt that locks the account and while locked
//     it("shows the locked message as an inline error on Current Password, no modal", async () => {
//       mockChangePassword.mockResolvedValue({
//         success: false,
//         error: lockedMsg,
//       } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       expect(await screen.findByText(lockedMsg)).toBeInTheDocument();
//       expect(currentInput()).toHaveClass("is-invalid");
//       expect(newInput()).not.toHaveClass("is-invalid");
//       expect(confirmInput()).not.toHaveClass("is-invalid");
//       expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
//       expect(setInfoType).not.toHaveBeenCalled();
//       expect(updateBtn()).toBeEnabled();
//     });

//     it("shows any minutes in the locked message, not just 15", async () => {
//       const otherLockMsg = "Too many attempts, try again in 3 minutes";
//       mockChangePassword.mockResolvedValue({
//         success: false,
//         error: otherLockMsg,
//       } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       expect(await screen.findByText(otherLockMsg)).toBeInTheDocument();
//       expect(currentInput()).toHaveClass("is-invalid");
//       expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
//     });

//     it("clears the locked message when the current password is edited", async () => {
//       mockChangePassword.mockResolvedValue({
//         success: false,
//         error: lockedMsg,
//       } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());
//       await screen.findByText(lockedMsg);

//       await u.type(currentInput(), "x");

//       expect(screen.queryByText(lockedMsg)).not.toBeInTheDocument();
//       expect(currentInput()).not.toHaveClass("is-invalid");
//     });

//     it.each([
//       ["not logged in", "not logged in"],
//       ["not the same user", "not authorized"],
//     ])("shows the route's text in the failure modal when %s", async (_label, error) => {
//       mockChangePassword.mockResolvedValue({ success: false, error } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       const modal = await screen.findByTestId("modalError");
//       expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
//       expect(within(modal).getByText(error)).toBeInTheDocument();
//     });

//     it("shows the failure modal with the returned error; closing it does not navigate", async () => {
//       mockChangePassword.mockResolvedValue({
//         success: false,
//         error: "User has no password",
//       } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       const modal = await screen.findByTestId("modalError");
//       expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
//       expect(within(modal).getByText(/user has no password/i)).toBeInTheDocument();

//       await u.click(within(modal).getByRole("button", { name: /ok/i }));
//       expect(setInfoType).not.toHaveBeenCalled();
//       expect(screen.queryByTestId("modalError")).not.toBeInTheDocument();
//     });

//     it("shows the default message when no error is returned", async () => {
//       mockChangePassword.mockResolvedValue({ success: false } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       const modal = await screen.findByTestId("modalError");
//       expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
//       expect(within(modal).getByText(/cannot update new password\./i)).toBeInTheDocument();
//     });

//     it("shows the default failure modal when changePassword throws", async () => {
//       mockChangePassword.mockRejectedValue(new Error("network down"));
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       const modal = await screen.findByTestId("modalError");
//       expect(within(modal).getByText(/update password failed/i)).toBeInTheDocument();
//       expect(within(modal).getByText(/cannot update new password\./i)).toBeInTheDocument();
//       // the thrown error's own text is not shown
//       expect(within(modal).queryByText(/network down/i)).not.toBeInTheDocument();
//       expect(updateBtn()).toBeEnabled();
//     });

//     it("keeps the entered passwords so the user can retry", async () => {
//       mockChangePassword.mockResolvedValue({
//         success: false,
//         error: incorrectMsg,
//       } as ChangePwdResult);
//       const u = userEvent.setup();
//       renderChgPwd();
//       await fillAll(u);
//       await u.click(updateBtn());

//       await screen.findByText(/current password is incorrect/i);
//       expect(currentInput()).toHaveValue(goodCurrent);
//       expect(newInput()).toHaveValue(goodNew);
//       expect(confirmInput()).toHaveValue(goodNew);
//     });
//   });
// });

