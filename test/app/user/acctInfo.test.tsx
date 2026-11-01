import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AcctInfo from "@/app/user/acctInfo/acctInfo";
import { useSession } from "next-auth/react";
import { isEmailInUse, patchUser } from "@/lib/db/users/dbUsers";
import { phone as phoneChecking } from "phone";
import {
  maxFirstNameLength,
  maxLastNameLength,
  maxEmailLength,
  maxPhoneLength,
} from "@/lib/validation/constants";
import type { acctUserType, userDataType } from "@/lib/types/types";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/lib/db/users/dbUsers", () => ({
  __esModule: true,
  isEmailInUse: jest.fn(),
  patchUser: jest.fn(),
}));

// phone() library: keep it deterministic for tests
jest.mock("phone", () => ({
  phone: jest.fn(),
}));

// ---------- helpers ----------
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockIsEmailInUse = isEmailInUse as jest.MockedFunction<typeof isEmailInUse>;
const mockPatchUser = patchUser as jest.MockedFunction<typeof patchUser>;
const mockPhone = phoneChecking as jest.MockedFunction<typeof phoneChecking>;
const mockUpdate = jest.fn();

// only directors and admins can edit, so the default test user is a director
const testRole: userDataType["role"] = "DIRECTOR";

// a user like getAcctUserById returns: public fields + has_password
const makeUser = (overrides: Partial<acctUserType> = {}): acctUserType => ({
  id: "usr_1",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "+18005551234",
  role: testRole,
  has_password: true, // => Change Password enabled
  ...overrides,
});

const successMessage = "Successfully updated account information.";
const cannotSaveMessage = "Cannot save Account Info.";

describe("AcctInfo Component", () => {
  const setInfoType = jest.fn();
  const setUser = jest.fn();

  const renderAcctInfo = (
    user: acctUserType = makeUser(),
    origUserData: acctUserType = makeUser()
  ) =>
    render(
      <AcctInfo
        user={user}
        setUser={setUser}
        origUserData={origUserData}
        setInfoType={setInfoType}
      />
    );

  const clickSave = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole("button", { name: /^save$/i }));
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdate.mockResolvedValue(null);
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: { id: "fake-user-id", role: "User", name: "Test User" },
        expires: "2099-01-01T00:00:00.000Z",
      },
      update: mockUpdate,
    } as unknown as ReturnType<typeof useSession>);

    // default: phone is valid
    mockPhone.mockReturnValue({ isValid: true } as ReturnType<typeof phoneChecking>);
    // default: email not already in use
    mockIsEmailInUse.mockResolvedValue(false);
    // default: patch succeeds and returns what was saved
    mockPatchUser.mockImplementation(async (sent) => ({ ...sent }));
  });

  describe("render", () => {
    it("populates the form with user data", () => {
      renderAcctInfo();
      expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
      expect(screen.getByLabelText(/last name/i)).toHaveValue("Doe");
      expect(screen.getByLabelText(/email/i)).toHaveValue("john.doe@example.com");
      expect(screen.getByLabelText(/phone/i)).toHaveValue("+18005551234");
    });

    it("renders the Change Password, Save and Cancel buttons", () => {
      renderAcctInfo();
      expect(screen.getByRole("button", { name: /change password/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("sets maxLength on the inputs", () => {
      renderAcctInfo();
      expect(screen.getByLabelText(/first name/i)).toHaveAttribute("maxLength", String(maxFirstNameLength));
      expect(screen.getByLabelText(/last name/i)).toHaveAttribute("maxLength", String(maxLastNameLength));
      expect(screen.getByLabelText(/email/i)).toHaveAttribute("maxLength", String(maxEmailLength));
      expect(screen.getByLabelText(/phone/i)).toHaveAttribute("maxLength", String(maxPhoneLength));
    });

    it("does not show the modal initially", () => {
      renderAcctInfo();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not show the read-only note for a director", () => {
      renderAcctInfo();
      expect(screen.queryByTestId("readOnlyMsg")).not.toBeInTheDocument();
    });
  });

  describe("who can edit", () => {
    it.each(["DIRECTOR", "ADMIN"] as const)(
      "a %s can edit: inputs are editable and Save is shown",
      (role) => {
        const u = makeUser({ role });
        renderAcctInfo(u, u);

        for (const label of [/first name/i, /last name/i, /email/i, /phone/i]) {
          expect(screen.getByLabelText(label)).not.toHaveAttribute("readonly");
        }
        expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
        expect(screen.queryByTestId("readOnlyMsg")).not.toBeInTheDocument();
      }
    );

    it("uses the saved role, not the role on the edited copy", () => {
      // even if the edited user object says DIRECTOR, a USER stays read-only
      renderAcctInfo(makeUser({ role: "DIRECTOR" }), makeUser({ role: "USER" }));

      expect(screen.getByTestId("readOnlyMsg")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^save$/i })).not.toBeInTheDocument();
    });
  });

  describe("read-only view for a USER", () => {
    const viewer = makeUser({ role: "USER" });
    const renderReadOnly = (u: acctUserType = viewer) => renderAcctInfo(u, u);

    it("shows the user's data", () => {
      renderReadOnly();
      expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
      expect(screen.getByLabelText(/last name/i)).toHaveValue("Doe");
      expect(screen.getByLabelText(/email/i)).toHaveValue("john.doe@example.com");
      expect(screen.getByLabelText(/phone/i)).toHaveValue("+18005551234");
    });

    it("shows a note explaining why the form is read-only", () => {
      renderReadOnly();
      expect(screen.getByTestId("readOnlyMsg")).toHaveTextContent(
        /only directors and admins can change account information/i
      );
    });

    it("makes every input read-only", () => {
      renderReadOnly();
      for (const label of [/first name/i, /last name/i, /email/i, /phone/i]) {
        expect(screen.getByLabelText(label)).toHaveAttribute("readonly");
      }
    });

    it("does not show the Save button", () => {
      renderReadOnly();
      expect(screen.queryByRole("button", { name: /^save$/i })).not.toBeInTheDocument();
    });

    it("shows Back instead of Cancel, and Back goes home", async () => {
      const user = userEvent.setup();
      renderReadOnly();
      expect(screen.queryByRole("button", { name: /^cancel$/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /^back$/i }));

      expect(pushMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith("/");
    });

    it("does not change the user when typing", async () => {
      const user = userEvent.setup();
      renderReadOnly();

      await user.type(screen.getByLabelText(/first name/i), "X");
      await user.type(screen.getByLabelText(/email/i), "X");

      expect(setUser).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
    });

    it("never calls patchUser, isEmailInUse or the session update", async () => {
      const user = userEvent.setup();
      renderReadOnly();

      await user.type(screen.getByLabelText(/first name/i), "X");

      expect(mockPatchUser).not.toHaveBeenCalled();
      expect(mockIsEmailInUse).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("still lets a USER with a password open Change Password", async () => {
      const user = userEvent.setup();
      renderReadOnly();

      const btn = screen.getByRole("button", { name: /change password/i });
      expect(btn).toBeEnabled();
      await user.click(btn);

      expect(setInfoType).toHaveBeenCalledWith("Password");
    });

    it("disables Change Password for a USER with no password", () => {
      renderReadOnly(makeUser({ role: "USER", has_password: false }));
      expect(screen.getByRole("button", { name: /change password/i })).toBeDisabled();
    });
  });

  describe("Change Password button", () => {
    it("is enabled and calls setInfoType('Password') when the user has a password", async () => {
      const user = userEvent.setup();
      renderAcctInfo();
      const btn = screen.getByRole("button", { name: /change password/i });
      expect(btn).toBeEnabled();
      await user.click(btn);
      expect(setInfoType).toHaveBeenCalledTimes(1);
      expect(setInfoType).toHaveBeenCalledWith("Password");
    });

    it("is disabled when has_password is false (e.g. Google sign-in)", () => {
      const u = makeUser({ has_password: false });
      renderAcctInfo(u, u);
      expect(screen.getByRole("button", { name: /change password/i })).toBeDisabled();
    });

    it("is disabled when has_password is missing", () => {
      const noFlag: Partial<acctUserType> = makeUser();
      delete noFlag.has_password;
      const u = noFlag as acctUserType;
      renderAcctInfo(u, u);
      expect(screen.getByRole("button", { name: /change password/i })).toBeDisabled();
    });

    it("does not use password_hash, which the API never sends", () => {
      // an old-style user object: a hash, but has_password false
      const u = { ...makeUser({ has_password: false }), password_hash: "hash" };
      renderAcctInfo(u, u);
      expect(screen.getByRole("button", { name: /change password/i })).toBeDisabled();
    });

    it("does not call setInfoType when disabled and clicked", async () => {
      const user = userEvent.setup();
      const u = makeUser({ has_password: false });
      renderAcctInfo(u, u);
      await user.click(screen.getByRole("button", { name: /change password/i }));
      expect(setInfoType).not.toHaveBeenCalled();
    });
  });

  describe("Cancel button", () => {
    it("navigates back to home", async () => {
      const user = userEvent.setup();
      renderAcctInfo();
      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(pushMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith("/");
      expect(mockPatchUser).not.toHaveBeenCalled();
    });
  });

  describe("input changes", () => {
    it("calls setUser with the changed field", async () => {
      const user = userEvent.setup();
      const u = makeUser();
      renderAcctInfo(u, u);
      // input is controlled by the mocked setUser, so only one char shows up per call
      await user.type(screen.getByLabelText(/first name/i), "X");
      expect(setUser).toHaveBeenCalledWith({ ...u, first_name: "JohnX" });
    });

    it("keeps has_password when a field is edited", async () => {
      const user = userEvent.setup();
      const u = makeUser({ has_password: false });
      renderAcctInfo(u, u);
      await user.type(screen.getByLabelText(/last name/i), "X");
      expect(setUser).toHaveBeenCalledWith(
        expect.objectContaining({ has_password: false, last_name: "DoeX" })
      );
    });

    it("clears the field's error when that field is edited", async () => {
      const user = userEvent.setup();
      renderAcctInfo(makeUser({ first_name: "" }), makeUser());
      await clickSave(user);
      expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toHaveClass("is-invalid");

      await user.type(screen.getByLabelText(/first name/i), "J");
      expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).not.toHaveClass("is-invalid");
    });
  });

  describe("Save validation", () => {
    it.each([
      ["first_name", "", /first name is required/i, /first name/i],
      ["first_name", "   ", /first name is required/i, /first name/i],
      ["last_name", "", /last name is required/i, /last name/i],
      ["last_name", "   ", /last name is required/i, /last name/i],
      ["email", "", /email is required/i, /email/i],
      ["email", "noDotCom", /email is not valid/i, /email/i],
    ])(
      "blocks save when %s is %p",
      async (field, value, errorText, label) => {
        const user = userEvent.setup();
        renderAcctInfo(makeUser({ [field]: value }), makeUser());
        await clickSave(user);

        expect(await screen.findByText(errorText)).toBeInTheDocument();
        expect(screen.getByLabelText(label)).toHaveClass("is-invalid");
        expect(mockUpdate).not.toHaveBeenCalled();
        expect(mockPatchUser).not.toHaveBeenCalled();
      }
    );

    it("shows every error at once", async () => {
      const user = userEvent.setup();
      renderAcctInfo(
        makeUser({ first_name: "", last_name: "", email: "", phone: "" }),
        makeUser()
      );
      await clickSave(user);

      expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
    });

    it("blocks save when phone is invalid", async () => {
      const user = userEvent.setup();
      mockPhone.mockReturnValue({ isValid: false } as ReturnType<typeof phoneChecking>);
      renderAcctInfo(makeUser({ phone: "abc" }), makeUser());
      await clickSave(user);

      expect(await screen.findByText(/phone is not valid/i)).toBeInTheDocument();
      expect(mockPhone).toHaveBeenCalledWith("abc");
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockPatchUser).not.toHaveBeenCalled();
    });

    it("requires phone when the original user had a phone", async () => {
      const user = userEvent.setup();
      renderAcctInfo(makeUser({ phone: "" }), makeUser());
      await clickSave(user);

      expect(await screen.findByText(/phone is required/i)).toBeInTheDocument();
      expect(mockPatchUser).not.toHaveBeenCalled();
    });

    it("allows a blank phone when the original user had no phone (e.g. Google sign-in)", async () => {
      const user = userEvent.setup();
      const u = makeUser({ phone: "" });
      renderAcctInfo(u, u);
      await clickSave(user);

      expect(await screen.findByText(successMessage)).toBeInTheDocument();
      expect(screen.queryByText(/phone is required/i)).not.toBeInTheDocument();
      expect(mockPhone).not.toHaveBeenCalled();
    });

    it("does not check for a used email when another field is invalid", async () => {
      const user = userEvent.setup();
      renderAcctInfo(
        makeUser({ first_name: "", email: "new@example.com" }),
        makeUser()
      );
      await clickSave(user);

      await screen.findByText(/first name is required/i);
      expect(mockIsEmailInUse).not.toHaveBeenCalled();
    });
  });

  describe("email in use check", () => {
    it("blocks save when a changed email is already in use", async () => {
      const user = userEvent.setup();
      mockIsEmailInUse.mockResolvedValue(true);
      renderAcctInfo(makeUser({ email: "taken@example.com" }), makeUser());
      await clickSave(user);

      expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toHaveClass("is-invalid");
      expect(mockIsEmailInUse).toHaveBeenCalledWith("taken@example.com");
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockPatchUser).not.toHaveBeenCalled();
    });

    it("does not check for a used email when the email is unchanged", async () => {
      const user = userEvent.setup();
      renderAcctInfo();
      await clickSave(user);

      expect(await screen.findByText(successMessage)).toBeInTheDocument();
      expect(mockIsEmailInUse).not.toHaveBeenCalled();
    });

    it.each([
      ["only the case changed", "John.Doe@Example.COM"],
      ["only spaces were added", "  john.doe@example.com  "],
    ])("does not check for a used email when %s", async (_label, email) => {
      // isEmailInUse would find the user's own account and block the save
      const user = userEvent.setup();
      mockIsEmailInUse.mockResolvedValue(true);
      renderAcctInfo(makeUser({ email }), makeUser());
      await clickSave(user);

      expect(mockIsEmailInUse).not.toHaveBeenCalled();
      expect(screen.queryByText(/email already in use/i)).not.toBeInTheDocument();
    });

    it("saves when a changed email is not in use", async () => {
      const user = userEvent.setup();
      renderAcctInfo(makeUser({ email: "new@example.com" }), makeUser());
      await clickSave(user);

      expect(await screen.findByText(successMessage)).toBeInTheDocument();
      expect(mockIsEmailInUse).toHaveBeenCalledWith("new@example.com");
      expect(mockPatchUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@example.com" })
      );
    });

    it("shows the Cannot Save modal when the email check throws", async () => {
      const user = userEvent.setup();
      mockIsEmailInUse.mockRejectedValue(new Error("isEmailInUse failed: Network Error"));
      renderAcctInfo(makeUser({ email: "new@example.com" }), makeUser());
      await clickSave(user);

      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).getByText(cannotSaveMessage)).toBeInTheDocument();
      expect(mockPatchUser).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Save success", () => {
    it("patches the user, updates the session and shows the success modal", async () => {
      const user = userEvent.setup();
      const orig = makeUser();
      const edited = makeUser({ first_name: "Jane", last_name: "Smith", phone: "+18005559999" });
      renderAcctInfo(edited, orig);
      await clickSave(user);

      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).getByText("Saved Account Info")).toBeInTheDocument();
      expect(within(dialog).getByText(successMessage)).toBeInTheDocument();

      expect(mockPatchUser).toHaveBeenCalledTimes(1);
      expect(mockPatchUser).toHaveBeenCalledWith({
        id: orig.id,
        email: orig.email,
        first_name: "Jane",
        last_name: "Smith",
        phone: "+18005559999",
        role: testRole,
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: "Jane",
        last_name: "Smith",
        email: orig.email,
      });

      // database is saved before the session is updated
      expect(mockPatchUser.mock.invocationCallOrder[0]).toBeLessThan(
        mockUpdate.mock.invocationCallOrder[0]
      );
    });

    it("never sends has_password or password_hash in the patch", async () => {
      const user = userEvent.setup();
      const u = { ...makeUser(), password_hash: "hash" };
      renderAcctInfo(u, u);
      await clickSave(user);

      await screen.findByText(successMessage);
      const sent = mockPatchUser.mock.calls[0][0];
      expect(sent).not.toHaveProperty("has_password");
      expect(sent).not.toHaveProperty("password_hash");
    });

    it("updates the session with the values the database saved", async () => {
      // e.g. the route sanitized the names
      const user = userEvent.setup();
      mockPatchUser.mockImplementation(async (sent) => ({
        ...sent,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
      }));
      renderAcctInfo(
        makeUser({ first_name: " Jane ", last_name: "Smith***", email: "Jane@Example.com" }),
        makeUser()
      );
      await clickSave(user);

      await screen.findByText(successMessage);
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
      });
    });

    it("saves a phone number entered by a user who had no phone (e.g. Google sign-in)", async () => {
      const user = userEvent.setup();
      const orig = makeUser({ phone: "" });
      const edited = makeUser({ phone: "+18005559999" });
      renderAcctInfo(edited, orig);
      await clickSave(user);

      expect(await screen.findByText(successMessage)).toBeInTheDocument();
      expect(mockPhone).toHaveBeenCalledWith("+18005559999");
      expect(mockPatchUser).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "+18005559999" })
      );
    });

    it("saves a blank phone for a user who had no phone", async () => {
      const user = userEvent.setup();
      const u = makeUser({ phone: "" });
      renderAcctInfo(u, u);
      await clickSave(user);

      expect(await screen.findByText(successMessage)).toBeInTheDocument();
      expect(mockPatchUser).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "" })
      );
    });

    it("navigates home when the success modal is closed", async () => {
      const user = userEvent.setup();
      renderAcctInfo();
      await clickSave(user);

      await screen.findByText(successMessage);
      expect(pushMock).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: /^ok$/i }));
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  describe("Save failure", () => {
    it("shows the Cannot Save modal when patchUser throws", async () => {
      const user = userEvent.setup();
      mockPatchUser.mockRejectedValue(new Error("db down"));
      renderAcctInfo();
      await clickSave(user);

      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).getByText("Cannot Save")).toBeInTheDocument();
      expect(within(dialog).getByText(cannotSaveMessage)).toBeInTheDocument();
      // the thrown error's own text is not shown
      expect(within(dialog).queryByText(/db down/i)).not.toBeInTheDocument();
    });

    it("shows the Cannot Save modal when patchUser returns no user", async () => {
      const user = userEvent.setup();
      mockPatchUser.mockResolvedValue(null);
      renderAcctInfo();
      await clickSave(user);

      expect(await screen.findByText(cannotSaveMessage)).toBeInTheDocument();
      expect(screen.queryByText(successMessage)).not.toBeInTheDocument();
    });

    it("does not update the session when patchUser fails", async () => {
      const user = userEvent.setup();
      mockPatchUser.mockRejectedValue(new Error("db down"));
      renderAcctInfo();
      await clickSave(user);

      await screen.findByText(cannotSaveMessage);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("does not update the session when patchUser returns no user", async () => {
      const user = userEvent.setup();
      mockPatchUser.mockResolvedValue(null);
      renderAcctInfo();
      await clickSave(user);

      await screen.findByText(cannotSaveMessage);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("still shows success when the db saved but the session update throws", async () => {
      const user = userEvent.setup();
      mockUpdate.mockRejectedValue(new Error("session error"));
      renderAcctInfo();
      await clickSave(user);

      expect(await screen.findByText(successMessage)).toBeInTheDocument();
      expect(mockPatchUser).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(cannotSaveMessage)).not.toBeInTheDocument();
    });

    it("does not navigate when the error modal is closed", async () => {
      const user = userEvent.setup();
      mockPatchUser.mockRejectedValue(new Error("db down"));
      renderAcctInfo();
      await clickSave(user);

      await screen.findByText(cannotSaveMessage);
      await user.click(screen.getByRole("button", { name: /^ok$/i }));

      expect(pushMock).not.toHaveBeenCalled();
      // modal fades out, so wait for it to leave the DOM
      await waitFor(() =>
        expect(screen.queryByText(cannotSaveMessage)).not.toBeInTheDocument()
      );
    });
  });
});
