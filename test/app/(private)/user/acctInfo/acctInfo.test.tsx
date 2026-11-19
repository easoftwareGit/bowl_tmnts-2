// test/app/(private)/user/acctInfo.test.tsx
// tests for src/app/(private)/user/acctInfo/acctInfo.tsx
import React, { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AcctInfo, {
  savedAcctInfoTitle,
  readOnlyMsg,
} from "@/app/(private)/user/acctInfo/acctInfo";
import { isEmailInUse, patchUser } from "@/lib/db/users/dbUsers";
import { phone } from "phone";
import { cannotSaveTitle } from "@/components/modal/errorModal";
import {
  maxFirstNameLength,
  maxLastNameLength,
  maxEmailLength,
  maxPhoneLength,
} from "@/lib/validation/constants";
import type { acctUserType, userDataType } from "@/lib/types/types";

// ---------------------------------------------------------------------------
// mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUpdate = jest.fn();
jest.mock("next-auth/react", () => ({
  useSession: () => ({ update: mockUpdate }),
}));

jest.mock("@/lib/db/users/dbUsers", () => ({
  isEmailInUse: jest.fn(),
  patchUser: jest.fn(),
}));

// phone() is mocked so these tests check AcctInfo's logic, not the phone
// library's rules. Each test says whether the number is valid.
jest.mock("phone", () => ({
  phone: jest.fn(),
}));

// simple stand-in for the modal: keeps the real exports (cannotSaveTitle),
// replaces only the component
jest.mock("@/components/modal/errorModal", () => {
  const actual = jest.requireActual("@/components/modal/errorModal");
  const ReactActual = jest.requireActual<typeof import("react")>("react");
  const MockErrorModalMsg = ({
    show,
    title,
    message,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onCancel: () => void;
  }) =>
    show
      ? ReactActual.createElement(
          "div",
          { role: "dialog", "aria-label": title },
          ReactActual.createElement("h2", null, title),
          ReactActual.createElement("p", null, message),
          ReactActual.createElement(
            "button",
            { type: "button", onClick: onCancel },
            "Close modal"
          )
        )
      : null;
  return { __esModule: true, ...actual, default: MockErrorModalMsg };
});

const mockIsEmailInUse = jest.mocked(isEmailInUse);
const mockPatchUser = jest.mocked(patchUser);
const mockPhone = jest.mocked(phone);

// valid numbers come back in E.164 format, like the real library
const setPhoneValid = (isValid: boolean, phoneNumber = "+17025551234") => {
  mockPhone.mockReturnValue({
    isValid,
    phoneNumber: isValid ? phoneNumber : null,
  } as unknown as ReturnType<typeof phone>);
};

const phoneOptions = { validateMobilePrefix: false };

// ---------------------------------------------------------------------------
// test data and helpers
// ---------------------------------------------------------------------------

// a role that is not DIRECTOR or ADMIN; change if your role enum differs
const viewOnlyRole = "USER" as userDataType["role"];

const baseUser: acctUserType = {
  id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  phone: "+17025551234",
  role: "DIRECTOR",
  has_password: true,
};

type RenderOptions = {
  orig?: Partial<acctUserType>; // origUserData overrides
  user?: Partial<acctUserType>; // edited user overrides (on top of orig)
};

/**
 * Renders AcctInfo inside a small parent that keeps `user` in state, the
 * same way the real parent page does, so typing into the inputs works.
 */
const renderAcctInfo = ({ orig = {}, user = {} }: RenderOptions = {}) => {
  const origUserData: acctUserType = { ...baseUser, ...orig };
  const startUser: acctUserType = { ...origUserData, ...user };
  const setUserSpy = jest.fn();
  const setInfoType = jest.fn();

  const Parent = () => {
    const [acctUser, setAcctUser] = useState<acctUserType>(startUser);
    return (
      <AcctInfo
        user={acctUser}
        setUser={(newUser) => {
          setUserSpy(newUser);
          setAcctUser(newUser);
        }}
        origUserData={origUserData}
        setInfoType={setInfoType}
      />
    );
  };

  const userEv = userEvent.setup();
  render(<Parent />);
  return { userEv, setUserSpy, setInfoType, origUserData, startUser };
};

const firstNameInput = () => screen.getByLabelText("First Name");
const lastNameInput = () => screen.getByLabelText("Last Name");
const emailInput = () => screen.getByLabelText("Email");
const phoneInput = () => screen.getByLabelText("Phone");
const saveButton = () => screen.getByRole("button", { name: "Save" });

beforeEach(() => {
  jest.clearAllMocks();
  setPhoneValid(true);
  mockIsEmailInUse.mockResolvedValue(false);
  // by default the db saves exactly what was sent
  mockPatchUser.mockImplementation(async (data) => data as never);
  mockUpdate.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

describe("AcctInfo", () => {
  describe("render", () => {
    it("shows the user's values in the inputs", () => {
      renderAcctInfo();
      expect(firstNameInput()).toHaveValue("John");
      expect(lastNameInput()).toHaveValue("Doe");
      expect(emailInput()).toHaveValue("john.doe@example.com");
      expect(phoneInput()).toHaveValue("+17025551234");
    });

    it("sets the max lengths on the inputs", () => {
      renderAcctInfo();
      expect(firstNameInput()).toHaveAttribute(
        "maxLength",
        String(maxFirstNameLength)
      );
      expect(lastNameInput()).toHaveAttribute(
        "maxLength",
        String(maxLastNameLength)
      );
      expect(emailInput()).toHaveAttribute("maxLength", String(maxEmailLength));
      expect(phoneInput()).toHaveAttribute("maxLength", String(maxPhoneLength));
    });

    it("uses an email input for the email", () => {
      renderAcctInfo();
      expect(emailInput()).toHaveAttribute("type", "email");
    });

    it("shows no errors at first", () => {
      renderAcctInfo();
      expect(firstNameInput()).not.toHaveClass("is-invalid");
      expect(lastNameInput()).not.toHaveClass("is-invalid");
      expect(emailInput()).not.toHaveClass("is-invalid");
      expect(phoneInput()).not.toHaveClass("is-invalid");
    });

    it("does not show the success or error modal at first", () => {
      renderAcctInfo();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("roles that can edit", () => {
    it.each(["DIRECTOR", "ADMIN"] as userDataType["role"][])(
      "%s can edit: no read-only message, editable inputs, Save and Cancel",
      (role) => {
        renderAcctInfo({ orig: { role } });
        expect(screen.queryByText(readOnlyMsg)).not.toBeInTheDocument();
        expect(screen.queryByTestId("readOnlyMsg")).not.toBeInTheDocument();
        expect(firstNameInput()).not.toHaveAttribute("readonly");
        expect(lastNameInput()).not.toHaveAttribute("readonly");
        expect(emailInput()).not.toHaveAttribute("readonly");
        expect(phoneInput()).not.toHaveAttribute("readonly");
        expect(saveButton()).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Back" })
        ).not.toBeInTheDocument();
      }
    );
  });

  describe("roles that cannot edit", () => {
    it("shows the read-only message", () => {
      renderAcctInfo({ orig: { role: viewOnlyRole } });
      const note = screen.getByRole("note");
      expect(note).toHaveTextContent(readOnlyMsg);
      expect(screen.getByTestId("readOnlyMsg")).toBeInTheDocument();
    });

    it("makes all inputs read-only", () => {
      renderAcctInfo({ orig: { role: viewOnlyRole } });
      expect(firstNameInput()).toHaveAttribute("readonly");
      expect(lastNameInput()).toHaveAttribute("readonly");
      expect(emailInput()).toHaveAttribute("readonly");
      expect(phoneInput()).toHaveAttribute("readonly");
    });

    it("hides Save and shows Back instead of Cancel", () => {
      renderAcctInfo({ orig: { role: viewOnlyRole } });
      expect(
        screen.queryByRole("button", { name: "Save" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument();
    });

    it("does not change the user when typing", async () => {
      const { userEv, setUserSpy } = renderAcctInfo({
        orig: { role: viewOnlyRole },
      });
      await userEv.type(firstNameInput(), "xyz");
      expect(setUserSpy).not.toHaveBeenCalled();
      expect(firstNameInput()).toHaveValue("John");
    });

    it("Back goes to home", async () => {
      const { userEv } = renderAcctInfo({ orig: { role: viewOnlyRole } });
      await userEv.click(screen.getByRole("button", { name: "Back" }));
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("still allows Change Password when the user has a password", () => {
      renderAcctInfo({ orig: { role: viewOnlyRole, has_password: true } });
      expect(
        screen.getByRole("button", { name: "Change Password" })
      ).toBeEnabled();
    });

    it("uses the role from origUserData, not the edited user", () => {
      // edited copy claims ADMIN, but the db role is view only
      renderAcctInfo({
        orig: { role: viewOnlyRole },
        user: { role: "ADMIN" },
      });
      expect(screen.getByRole("note")).toHaveTextContent(readOnlyMsg);
      expect(
        screen.queryByRole("button", { name: "Save" })
      ).not.toBeInTheDocument();
    });

    it("can edit when origUserData is DIRECTOR even if the edited copy is not", () => {
      renderAcctInfo({
        orig: { role: "DIRECTOR" },
        user: { role: viewOnlyRole },
      });
      expect(screen.queryByRole("note")).not.toBeInTheDocument();
      expect(saveButton()).toBeInTheDocument();
    });
  });

  describe("Change Password button", () => {
    it("is enabled when the user has a password", () => {
      renderAcctInfo({ orig: { has_password: true } });
      expect(
        screen.getByRole("button", { name: "Change Password" })
      ).toBeEnabled();
    });

    it("is disabled when the user has no password (e.g. Google sign-in)", () => {
      renderAcctInfo({ orig: { has_password: false } });
      expect(
        screen.getByRole("button", { name: "Change Password" })
      ).toBeDisabled();
    });

    it("is disabled when has_password is missing", () => {
      renderAcctInfo({ orig: { has_password: undefined } });
      expect(
        screen.getByRole("button", { name: "Change Password" })
      ).toBeDisabled();
    });

    it("calls setInfoType('Password') when clicked", async () => {
      const { userEv, setInfoType } = renderAcctInfo();
      await userEv.click(
        screen.getByRole("button", { name: "Change Password" })
      );
      expect(setInfoType).toHaveBeenCalledTimes(1);
      expect(setInfoType).toHaveBeenCalledWith("Password");
    });

    it("does not call setInfoType when disabled", async () => {
      const { userEv, setInfoType } = renderAcctInfo({
        orig: { has_password: false },
      });
      await userEv.click(
        screen.getByRole("button", { name: "Change Password" })
      );
      expect(setInfoType).not.toHaveBeenCalled();
    });
  });

  describe("Cancel button", () => {
    it("goes to home", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.click(screen.getByRole("button", { name: "Cancel" }));
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("does not save", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.click(screen.getByRole("button", { name: "Cancel" }));
      expect(mockPatchUser).not.toHaveBeenCalled();
    });
  });

  describe("input changes", () => {
    it("updates the first name", async () => {
      const { userEv, setUserSpy, startUser } = renderAcctInfo();
      await userEv.clear(firstNameInput());
      await userEv.type(firstNameInput(), "Jane");
      expect(firstNameInput()).toHaveValue("Jane");
      expect(setUserSpy).toHaveBeenLastCalledWith({
        ...startUser,
        first_name: "Jane",
      });
    });

    it("updates the last name", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.clear(lastNameInput());
      await userEv.type(lastNameInput(), "Smith");
      expect(lastNameInput()).toHaveValue("Smith");
    });

    it("updates the email", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.clear(emailInput());
      await userEv.type(emailInput(), "jane@example.com");
      expect(emailInput()).toHaveValue("jane@example.com");
    });

    it("updates the phone", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.clear(phoneInput());
      await userEv.type(phoneInput(), "+17025559999");
      expect(phoneInput()).toHaveValue("+17025559999");
    });

    it("changes only the edited field", async () => {
      const { userEv, setUserSpy, startUser } = renderAcctInfo();
      await userEv.type(lastNameInput(), "s");
      expect(setUserSpy).toHaveBeenLastCalledWith({
        ...startUser,
        last_name: "Does",
      });
    });

    it("clears the error for the field being edited", async () => {
      const { userEv } = renderAcctInfo({ user: { first_name: "" } });
      await userEv.click(saveButton());
      expect(
        await screen.findByText("First Name is required")
      ).toBeInTheDocument();
      expect(firstNameInput()).toHaveClass("is-invalid");

      await userEv.type(firstNameInput(), "J");
      expect(
        screen.queryByText("First Name is required")
      ).not.toBeInTheDocument();
      expect(firstNameInput()).not.toHaveClass("is-invalid");
    });

    it("keeps the errors for the other fields", async () => {
      const { userEv } = renderAcctInfo({
        user: { first_name: "", last_name: "" },
      });
      await userEv.click(saveButton());
      expect(
        await screen.findByText("Last Name is required")
      ).toBeInTheDocument();

      await userEv.type(firstNameInput(), "J");
      expect(screen.getByText("Last Name is required")).toBeInTheDocument();
      expect(lastNameInput()).toHaveClass("is-invalid");
    });
  });

  describe("validation", () => {
    describe("first name", () => {
      it("is required", async () => {
        const { userEv } = renderAcctInfo({ user: { first_name: "" } });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("First Name is required")
        ).toBeInTheDocument();
        expect(firstNameInput()).toHaveClass("is-invalid");
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("cannot be only spaces", async () => {
        const { userEv } = renderAcctInfo({ user: { first_name: "   " } });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("First Name is required")
        ).toBeInTheDocument();
        expect(mockPatchUser).not.toHaveBeenCalled();
      });
    });

    describe("last name", () => {
      it("is required", async () => {
        const { userEv } = renderAcctInfo({ user: { last_name: "" } });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("Last Name is required")
        ).toBeInTheDocument();
        expect(lastNameInput()).toHaveClass("is-invalid");
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("cannot be only spaces", async () => {
        const { userEv } = renderAcctInfo({ user: { last_name: "  " } });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("Last Name is required")
        ).toBeInTheDocument();
        expect(mockPatchUser).not.toHaveBeenCalled();
      });
    });

    describe("email", () => {
      it("is required", async () => {
        const { userEv } = renderAcctInfo({ user: { email: "" } });
        await userEv.click(saveButton());
        expect(await screen.findByText("Email is required")).toBeInTheDocument();
        expect(emailInput()).toHaveClass("is-invalid");
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("cannot be only spaces", async () => {
        const { userEv } = renderAcctInfo({ user: { email: "   " } });
        await userEv.click(saveButton());
        expect(await screen.findByText("Email is required")).toBeInTheDocument();
      });

      it("must be a valid email", async () => {
        const { userEv } = renderAcctInfo({ user: { email: "not-an-email" } });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("Email is not valid")
        ).toBeInTheDocument();
        expect(emailInput()).toHaveClass("is-invalid");
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("does not check if in use when the email did not change", async () => {
        const { userEv } = renderAcctInfo();
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockIsEmailInUse).not.toHaveBeenCalled();
      });

      it("does not check if in use when only the case changed", async () => {
        const { userEv } = renderAcctInfo({
          user: { email: "John.Doe@Example.COM" },
        });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockIsEmailInUse).not.toHaveBeenCalled();
      });

      it("checks if in use when the email changed", async () => {
        const { userEv } = renderAcctInfo({
          user: { email: "jane@example.com" },
        });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockIsEmailInUse).toHaveBeenCalledTimes(1);
        expect(mockIsEmailInUse).toHaveBeenCalledWith("jane@example.com");
      });

      it("accepts an email with spaces around it", async () => {
        const { userEv } = renderAcctInfo({
          user: { email: "  jane@example.com  " },
        });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(screen.queryByText("Email is not valid")).not.toBeInTheDocument();
      });

      it("checks if in use with the trimmed, lower case email", async () => {
        const { userEv } = renderAcctInfo({
          user: { email: "  Jane@Example.com " },
        });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockIsEmailInUse).toHaveBeenCalledWith("jane@example.com");
      });

      it("does not check if in use when only spaces were added", async () => {
        const { userEv } = renderAcctInfo({
          user: { email: " john.doe@example.com " },
        });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockIsEmailInUse).not.toHaveBeenCalled();
      });

      it("shows an error when the new email is already in use", async () => {
        mockIsEmailInUse.mockResolvedValue(true);
        const { userEv } = renderAcctInfo({
          user: { email: "taken@example.com" },
        });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("Email already in use")
        ).toBeInTheDocument();
        expect(emailInput()).toHaveClass("is-invalid");
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("does not check if in use when other fields are not valid", async () => {
        const { userEv } = renderAcctInfo({
          user: { first_name: "", email: "jane@example.com" },
        });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("First Name is required")
        ).toBeInTheDocument();
        expect(mockIsEmailInUse).not.toHaveBeenCalled();
      });
    });

    describe("phone", () => {
      it("is required when the saved user has a phone", async () => {
        const { userEv } = renderAcctInfo({ user: { phone: "" } });
        await userEv.click(saveButton());
        expect(await screen.findByText("Phone is required")).toBeInTheDocument();
        expect(phoneInput()).toHaveClass("is-invalid");
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("cannot be only spaces when required", async () => {
        const { userEv } = renderAcctInfo({ user: { phone: "   " } });
        await userEv.click(saveButton());
        expect(await screen.findByText("Phone is required")).toBeInTheDocument();
      });

      it("must be valid when required", async () => {
        setPhoneValid(false);
        const { userEv } = renderAcctInfo({ user: { phone: "123" } });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("Phone is not valid")
        ).toBeInTheDocument();
        expect(phoneInput()).toHaveClass("is-invalid");
        expect(mockPhone).toHaveBeenCalledWith("123", phoneOptions);
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("can be blank when the saved user has no phone (Google sign-in)", async () => {
        const { userEv } = renderAcctInfo({ orig: { phone: "" } });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockPatchUser).toHaveBeenCalledWith(
          expect.objectContaining({ phone: "" })
        );
        expect(mockPhone).not.toHaveBeenCalled();
        expect(screen.queryByText("Phone is required")).not.toBeInTheDocument();
      });

      it("must be valid when not required but entered", async () => {
        setPhoneValid(false);
        const { userEv } = renderAcctInfo({
          orig: { phone: "" },
          user: { phone: "555" },
        });
        await userEv.click(saveButton());
        expect(
          await screen.findByText("Phone is not valid")
        ).toBeInTheDocument();
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("saves a valid phone entered when not required", async () => {
        setPhoneValid(true, "+17025559999");
        const { userEv } = renderAcctInfo({
          orig: { phone: "" },
          user: { phone: "+17025559999" },
        });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockPatchUser).toHaveBeenCalledWith(
          expect.objectContaining({ phone: "+17025559999" })
        );
      });

      it("checks the trimmed phone, allowing landlines", async () => {
        const { userEv } = renderAcctInfo({ user: { phone: " 702 555 1234 " } });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockPhone).toHaveBeenCalledWith("702 555 1234", phoneOptions);
      });

      it("saves the phone in E.164 format", async () => {
        setPhoneValid(true, "+17025551234");
        const { userEv } = renderAcctInfo({ user: { phone: "(702) 555-1234" } });
        await userEv.click(saveButton());
        await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
        expect(mockPatchUser).toHaveBeenCalledWith(
          expect.objectContaining({ phone: "+17025551234" })
        );
      });
    });

    it("shows all the errors at once", async () => {
      const { userEv } = renderAcctInfo({
        user: { first_name: "", last_name: "", email: "", phone: "" },
      });
      await userEv.click(saveButton());
      expect(
        await screen.findByText("First Name is required")
      ).toBeInTheDocument();
      expect(screen.getByText("Last Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Phone is required")).toBeInTheDocument();
      expect(mockPatchUser).not.toHaveBeenCalled();
    });

    it("clears old errors after the data is fixed and saved", async () => {
      const { userEv } = renderAcctInfo({ user: { email: "bad" } });
      await userEv.click(saveButton());
      expect(await screen.findByText("Email is not valid")).toBeInTheDocument();

      await userEv.clear(emailInput());
      await userEv.type(emailInput(), "john.doe@example.com");
      await userEv.click(saveButton());
      await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
      expect(screen.queryByText("Email is not valid")).not.toBeInTheDocument();
    });
  });

  describe("save", () => {
    it("sends the edited data to patchUser, without has_password", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.clear(firstNameInput());
      await userEv.type(firstNameInput(), "Jane");
      await userEv.click(saveButton());

      await waitFor(() => expect(mockPatchUser).toHaveBeenCalledTimes(1));
      const sent = mockPatchUser.mock.calls[0][0];
      expect(sent).toEqual({
        id: baseUser.id,
        email: baseUser.email,
        first_name: "Jane",
        last_name: baseUser.last_name,
        phone: baseUser.phone,
        role: baseUser.role,
      });
      expect(sent).not.toHaveProperty("has_password");
    });

    it("saves the email trimmed and in lower case", async () => {
      const { userEv } = renderAcctInfo({
        user: { email: " Jane@Example.com " },
      });
      await userEv.click(saveButton());
      await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
      expect(mockPatchUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: "jane@example.com" })
      );
    });

    it("sends the role from origUserData, not the edited user", async () => {
      const { userEv } = renderAcctInfo({
        orig: { role: "DIRECTOR" },
        user: { role: "ADMIN" },
      });
      await userEv.click(saveButton());
      await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
      expect(mockPatchUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: "DIRECTOR" })
      );
    });

    it("disables Save while saving, then enables it again", async () => {
      let finishPatch: (value: unknown) => void = () => {};
      mockPatchUser.mockImplementation(
        () =>
          new Promise((resolve) => {
            finishPatch = resolve;
          }) as never
      );
      const { userEv, startUser } = renderAcctInfo();
      await userEv.click(saveButton());
      await waitFor(() => expect(saveButton()).toBeDisabled());
      expect(saveButton()).toHaveAttribute("aria-busy", "true");

      finishPatch(startUser);
      await screen.findByRole("dialog");
      expect(saveButton()).toBeEnabled();
    });

    it("sends only one PATCH on a double click", async () => {
      let finishPatch: (value: unknown) => void = () => {};
      mockPatchUser.mockImplementation(
        () =>
          new Promise((resolve) => {
            finishPatch = resolve;
          }) as never
      );
      const { userEv, startUser } = renderAcctInfo();
      await userEv.dblClick(saveButton());
      await waitFor(() => expect(mockPatchUser).toHaveBeenCalled());
      finishPatch(startUser);
      await screen.findByRole("dialog");
      expect(mockPatchUser).toHaveBeenCalledTimes(1);
    });

    it("enables Save again after a validation error", async () => {
      const { userEv } = renderAcctInfo({ user: { first_name: "" } });
      await userEv.click(saveButton());
      await screen.findByText("First Name is required");
      expect(saveButton()).toBeEnabled();
    });

    it("updates the session with the values the db saved", async () => {
      // the route cleaned up the values
      mockPatchUser.mockImplementation(
        async (data) =>
          ({
            ...data,
            first_name: "Jane",
            last_name: "Smith",
            email: "jane@example.com",
          }) as never
      );
      const { userEv } = renderAcctInfo({
        user: { first_name: " Jane ", email: "Jane@Example.com" },
      });
      await userEv.click(saveButton());

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
      });
    });

    it("saves to the db before updating the session", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.click(saveButton());
      await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
      expect(mockPatchUser.mock.invocationCallOrder[0]).toBeLessThan(
        mockUpdate.mock.invocationCallOrder[0]
      );
    });

    it("shows the success modal", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.click(saveButton());
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveTextContent(savedAcctInfoTitle);
      expect(dialog).toHaveTextContent(
        "Successfully updated account information."
      );
    });

    it("goes to home when the success modal is closed", async () => {
      const { userEv } = renderAcctInfo();
      await userEv.click(saveButton());
      await screen.findByRole("dialog");
      await userEv.click(screen.getByRole("button", { name: "Close modal" }));
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("still reports success when the session update fails", async () => {
      mockUpdate.mockRejectedValue(new Error("session update failed"));
      const { userEv } = renderAcctInfo();
      await userEv.click(saveButton());
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveTextContent(savedAcctInfoTitle);
      expect(dialog).not.toHaveTextContent("Cannot save Account Info.");
    });

    it("does not update the session when the data is not valid", async () => {
      const { userEv } = renderAcctInfo({ user: { last_name: "" } });
      await userEv.click(saveButton());
      await screen.findByText("Last Name is required");
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    describe("errors", () => {
      it("shows the error modal when patchUser returns no user", async () => {
        mockPatchUser.mockResolvedValue(null as never);
        const { userEv } = renderAcctInfo();
        await userEv.click(saveButton());
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent(cannotSaveTitle);
        expect(dialog).toHaveTextContent("Cannot save Account Info.");
        expect(mockUpdate).not.toHaveBeenCalled();
      });

      it("shows the error modal when patchUser throws", async () => {
        mockPatchUser.mockRejectedValue(new Error("db error"));
        const { userEv } = renderAcctInfo();
        await userEv.click(saveButton());
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent(cannotSaveTitle);
        expect(dialog).toHaveTextContent("Cannot save Account Info.");
        expect(mockUpdate).not.toHaveBeenCalled();
      });

      it("shows the error modal when isEmailInUse throws", async () => {
        mockIsEmailInUse.mockRejectedValue(new Error("network error"));
        const { userEv } = renderAcctInfo({
          user: { email: "jane@example.com" },
        });
        await userEv.click(saveButton());
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent(cannotSaveTitle);
        expect(mockPatchUser).not.toHaveBeenCalled();
      });

      it("stays on the page when the error modal is closed", async () => {
        mockPatchUser.mockRejectedValue(new Error("db error"));
        const { userEv } = renderAcctInfo();
        await userEv.click(saveButton());
        await screen.findByRole("dialog");
        await userEv.click(screen.getByRole("button", { name: "Close modal" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
        expect(firstNameInput()).toHaveValue("John");
      });

      it("can save again after an error", async () => {
        mockPatchUser.mockRejectedValueOnce(new Error("db error"));
        const { userEv } = renderAcctInfo();
        await userEv.click(saveButton());
        await screen.findByRole("dialog");
        await userEv.click(screen.getByRole("button", { name: "Close modal" }));

        await userEv.click(saveButton());
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent(savedAcctInfoTitle);
        expect(mockPatchUser).toHaveBeenCalledTimes(2);
      });
    });
  });
});
