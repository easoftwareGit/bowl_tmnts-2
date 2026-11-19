// test/app/(private)/user/acctInfoForm.test.tsx
// tests for src/app/(private)/user/acctInfo/acctInfoForm.tsx
import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AcctInfoForm from "@/app/(private)/user/acctInfo/acctInfoForm";
import { getAcctUserById } from "@/lib/db/users/dbUsers";
import { useSession } from "next-auth/react";
import type { acctUserType } from "@/lib/types/types";

// ---- mocks ----

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/lib/db/users/dbUsers", () => ({
  __esModule: true,
  getAcctUserById: jest.fn(),
}));

type AcctInfoProps = {
  user: acctUserType;
  setUser: (user: acctUserType) => void;
  origUserData: acctUserType;
  setInfoType: (infoType: string) => void;
};

type ChangePasswordProps = {
  user: acctUserType;
  setInfoType: (infoType: string) => void;
};

// Mock AcctInfo and ChangePassword so we can:
// - check the props they get
// - call setInfoType / setUser like the real children do
// (names start with "mock" so jest.mock factories may use them)
const mockAcctInfoSpy = jest.fn();
jest.mock("@/app/(private)/user/acctInfo/acctInfo", () => ({
  __esModule: true,
  default: function MockAcctInfo(props: AcctInfoProps) {
    mockAcctInfoSpy(props);
    return (
      <div data-testid="AcctInfoMock">
        <div>First: {props.user.first_name}</div>
        <button type="button" onClick={() => props.setInfoType("Password")}>
          Change Password
        </button>
        <button
          type="button"
          onClick={() =>
            props.setUser({
              ...props.user,
              first_name: "Edited",
              has_password: false,
            })
          }
        >
          Edit Name
        </button>
      </div>
    );
  },
}));

const mockChangePwdSpy = jest.fn();
jest.mock("@/app/(private)/user/acctInfo/chgPwd", () => ({
  __esModule: true,
  default: function MockChangePassword(props: ChangePasswordProps) {
    mockChangePwdSpy(props);
    return (
      <div data-testid="ChangePasswordMock">
        <div>Has password: {String(props.user.has_password)}</div>
        <button type="button" onClick={() => props.setInfoType("AcctInfo")}>
          Account Info
        </button>
      </div>
    );
  },
}));

// Mock WaitModal so the tests don't depend on react-bootstrap's Modal
// (portals and fade transitions). It renders only while show is true.
type WaitModalProps = {
  show: boolean;
  message: string;
};

const mockWaitModalSpy = jest.fn();
jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: function MockWaitModal(props: WaitModalProps) {
    mockWaitModalSpy(props);
    return props.show ? (
      <div role="dialog" data-testid="WaitModalMock">
        {props.message}
      </div>
    ) : null;
  },
}));

// ---- helpers ----

const mockUseSession = jest.mocked(useSession);
const mockGetAcctUserById = jest.mocked(getAcctUserById);

const setSession = (
  status: "loading" | "authenticated" | "unauthenticated",
  userId?: string
) => {
  mockUseSession.mockReturnValue({
    status,
    data: userId
      ? { user: { id: userId }, expires: "2099-01-01T00:00:00.000Z" }
      : null,
    update: jest.fn(),
  } as unknown as ReturnType<typeof useSession>);
};

const ericUser: acctUserType = {
  id: "usr_123",
  first_name: "Eric",
  last_name: "A",
  email: "eric@example.com",
  phone: "9255551212",
  role: "USER",
  has_password: true,
};

const lastAcctInfoProps = (): AcctInfoProps =>
  mockAcctInfoSpy.mock.calls.at(-1)?.[0];
const lastChangePwdProps = (): ChangePasswordProps =>
  mockChangePwdSpy.mock.calls.at(-1)?.[0];
const lastWaitModalProps = (): WaitModalProps =>
  mockWaitModalSpy.mock.calls.at(-1)?.[0];

describe("AcctInfoForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSession("authenticated", ericUser.id);
    mockGetAcctUserById.mockResolvedValue(ericUser);
  });

  describe("loading the user", () => {
    it("shows the heading and Loading... first, then AcctInfo", async () => {
      render(<AcctInfoForm />);

      expect(
        screen.getByRole("heading", { name: /account information/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("WaitModalMock")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();

      expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
      expect(screen.queryByTestId("WaitModalMock")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();
    });

    it("shows the wait modal with Loading... while loading", () => {
      render(<AcctInfoForm />);

      expect(screen.getByRole("dialog")).toHaveTextContent("Loading...");
      expect(lastWaitModalProps()).toEqual({
        show: true,
        message: "Loading...",
      });
    });

    it("hides the wait modal (show false) after loading", async () => {
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(lastWaitModalProps().show).toBe(false);
    });

    it("no longer shows a plain Loading... status message", async () => {
      render(<AcctInfoForm />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      await screen.findByTestId("AcctInfoMock");
    });

    it("never shows the blank user to AcctInfo", async () => {
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      // every render of AcctInfo got the loaded user
      for (const [props] of mockAcctInfoSpy.mock.calls) {
        expect((props as AcctInfoProps).user.id).toBe(ericUser.id);
      }
    });

    it("fetches the logged-in user's account once, by session id", async () => {
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      expect(mockGetAcctUserById).toHaveBeenCalledTimes(1);
      expect(mockGetAcctUserById).toHaveBeenCalledWith("usr_123");
    });

    it("passes the loaded user, with has_password, to AcctInfo", async () => {
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      const props = lastAcctInfoProps();
      expect(props.user).toEqual(ericUser);
      expect(props.origUserData).toEqual(ericUser);
      expect(typeof props.setUser).toBe("function");
      expect(typeof props.setInfoType).toBe("function");
    });

    it("passes has_password false for a user with no password", async () => {
      mockGetAcctUserById.mockResolvedValue({
        ...ericUser,
        has_password: false,
      });

      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      expect(lastAcctInfoProps().user.has_password).toBe(false);
      expect(lastAcctInfoProps().origUserData.has_password).toBe(false);
    });

    it("never passes password_hash to the children", async () => {
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      expect(lastAcctInfoProps().user).not.toHaveProperty("password_hash");
      expect(lastAcctInfoProps().origUserData).not.toHaveProperty(
        "password_hash"
      );
    });

    it.each([
      ["undefined", undefined],
      ["null", null],
    ])("uses a blank phone when the phone is %s", async (_label, noPhone) => {
      mockGetAcctUserById.mockResolvedValue({
        ...ericUser,
        phone: noPhone as unknown as string,
      });

      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      expect(lastAcctInfoProps().user.phone).toBe("");
      expect(lastAcctInfoProps().origUserData.phone).toBe("");
    });
  });

  describe("session", () => {
    it("waits while the session is loading and does not fetch", () => {
      setSession("loading");

      render(<AcctInfoForm />);

      expect(screen.getByTestId("WaitModalMock")).toHaveTextContent("Loading...");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(mockGetAcctUserById).not.toHaveBeenCalled();
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
      expect(lastWaitModalProps().show).toBe(true);
    });

    it("fetches once the session finishes loading, with no error", async () => {
      setSession("loading");
      const { rerender } = render(<AcctInfoForm />);
      expect(mockGetAcctUserById).not.toHaveBeenCalled();

      setSession("authenticated", ericUser.id);
      rerender(<AcctInfoForm />);

      expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
      expect(mockGetAcctUserById).toHaveBeenCalledTimes(1);
      expect(mockGetAcctUserById).toHaveBeenCalledWith("usr_123");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows Not logged in and does not fetch when unauthenticated", async () => {
      setSession("unauthenticated");

      render(<AcctInfoForm />);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Error: Not logged in"
      );
      expect(screen.queryByTestId("WaitModalMock")).not.toBeInTheDocument();
      expect(mockGetAcctUserById).not.toHaveBeenCalled();
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
    });

    it("shows Not logged in when the session has no user id", async () => {
      mockUseSession.mockReturnValue({
        status: "authenticated",
        data: { user: {}, expires: "2099-01-01T00:00:00.000Z" },
        update: jest.fn(),
      } as unknown as ReturnType<typeof useSession>);

      render(<AcctInfoForm />);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Error: Not logged in"
      );
      expect(mockGetAcctUserById).not.toHaveBeenCalled();
    });

    it("hides the form when the user signs out", async () => {
      const { rerender } = render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      setSession("unauthenticated");
      rerender(<AcctInfoForm />);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Error: Not logged in"
      );
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
    });

    it("shows Loading... again while fetching a new user id", async () => {
      let resolveNew!: (user: acctUserType) => void;
      mockGetAcctUserById
        .mockResolvedValueOnce(ericUser)
        .mockReturnValueOnce(
          new Promise<acctUserType>((resolve) => {
            resolveNew = resolve;
          })
        );

      const { rerender } = render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      setSession("authenticated", "usr_456");
      rerender(<AcctInfoForm />);

      expect(await screen.findByTestId("WaitModalMock")).toHaveTextContent(
        "Loading..."
      );
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();

      await act(async () => {
        resolveNew({ ...ericUser, id: "usr_456", first_name: "New" });
      });
      expect(screen.getByText("First: New")).toBeInTheDocument();
      expect(mockGetAcctUserById).toHaveBeenLastCalledWith("usr_456");
    });

    it("ignores a slow fetch for an old user id", async () => {
      let resolveOld!: (user: acctUserType) => void;
      mockGetAcctUserById
        .mockReturnValueOnce(
          new Promise<acctUserType>((resolve) => {
            resolveOld = resolve;
          })
        )
        .mockResolvedValueOnce({
          ...ericUser,
          id: "usr_456",
          first_name: "New",
        });

      const { rerender } = render(<AcctInfoForm />);
      setSession("authenticated", "usr_456");
      rerender(<AcctInfoForm />);

      expect(await screen.findByText("First: New")).toBeInTheDocument();

      // the old fetch finishes last; its user must not replace the new one
      await act(async () => {
        resolveOld({ ...ericUser, first_name: "Old" });
      });
      expect(screen.getByText("First: New")).toBeInTheDocument();
      expect(screen.queryByText("First: Old")).not.toBeInTheDocument();
    });

    it("ignores a slow failed fetch for an old user id", async () => {
      let rejectOld!: (err: Error) => void;
      mockGetAcctUserById
        .mockReturnValueOnce(
          new Promise<acctUserType>((_resolve, reject) => {
            rejectOld = reject;
          })
        )
        .mockResolvedValueOnce({
          ...ericUser,
          id: "usr_456",
          first_name: "New",
        });

      const { rerender } = render(<AcctInfoForm />);
      setSession("authenticated", "usr_456");
      rerender(<AcctInfoForm />);
      expect(await screen.findByText("First: New")).toBeInTheDocument();

      await act(async () => {
        rejectOld(new Error("db down"));
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText("First: New")).toBeInTheDocument();
    });

    it("does not update state after unmounting mid-fetch", async () => {
      const consoleErrSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      let resolveFetch!: (user: acctUserType) => void;
      mockGetAcctUserById.mockReturnValueOnce(
        new Promise<acctUserType>((resolve) => {
          resolveFetch = resolve;
        })
      );

      const { unmount } = render(<AcctInfoForm />);
      unmount();
      await act(async () => {
        resolveFetch(ericUser);
      });

      expect(consoleErrSpy).not.toHaveBeenCalled();
      consoleErrSpy.mockRestore();
    });
  });

  describe("fetch errors", () => {
    it("shows an error and no children when getAcctUserById throws", async () => {
      mockGetAcctUserById.mockRejectedValue(
        new Error("getAcctUserById failed: db down")
      );

      render(<AcctInfoForm />);
      expect(screen.getByTestId("WaitModalMock")).toHaveTextContent("Loading...");

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Error: Failed to fetch user"
      );
      expect(screen.queryByTestId("WaitModalMock")).not.toBeInTheDocument();
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();
      // the thrown error's own text is not shown
      expect(screen.queryByText(/db down/i)).not.toBeInTheDocument();
    });

    it.each([
      ["null", null],
      ["undefined", undefined],
    ])(
      "shows User not found when getAcctUserById returns %s",
      async (_label, noUser) => {
        mockGetAcctUserById.mockResolvedValue(noUser as unknown as acctUserType);

        render(<AcctInfoForm />);

        expect(await screen.findByRole("alert")).toHaveTextContent(
          "Error: User not found"
        );
        expect(screen.queryByTestId("WaitModalMock")).not.toBeInTheDocument();
        expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
      }
    );

    it("clears the error when a later fetch succeeds", async () => {
      mockGetAcctUserById
        .mockRejectedValueOnce(new Error("db down"))
        .mockResolvedValueOnce({ ...ericUser, id: "usr_456" });

      const { rerender } = render(<AcctInfoForm />);
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Error: Failed to fetch user"
      );

      setSession("authenticated", "usr_456");
      rerender(<AcctInfoForm />);

      expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("switching views", () => {
    it("switches between AcctInfo and ChangePassword via setInfoType", async () => {
      const user = userEvent.setup();
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      await user.click(screen.getByRole("button", { name: /change password/i }));

      expect(
        screen.getByRole("heading", { name: /change password/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /account information/i })
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("ChangePasswordMock")).toBeInTheDocument();
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /account info/i }));

      expect(
        screen.getByRole("heading", { name: /account information/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("AcctInfoMock")).toBeInTheDocument();
      expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();
    });

    it("passes the account user, with has_password, to ChangePassword", async () => {
      const user = userEvent.setup();
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      await user.click(screen.getByRole("button", { name: /change password/i }));

      const props = lastChangePwdProps();
      expect(props.user).toEqual(ericUser);
      expect(typeof props.setInfoType).toBe("function");
    });

    it("does not fetch again when switching views", async () => {
      const user = userEvent.setup();
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      await user.click(screen.getByRole("button", { name: /change password/i }));
      await user.click(screen.getByRole("button", { name: /account info/i }));

      expect(mockGetAcctUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe("editing", () => {
    it("updates the user but keeps the loaded has_password", async () => {
      const user = userEvent.setup();
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      // the mock child tries to set has_password false; it must be ignored
      await user.click(screen.getByRole("button", { name: /edit name/i }));

      await waitFor(() =>
        expect(lastAcctInfoProps().user.first_name).toBe("Edited")
      );
      expect(lastAcctInfoProps().user.has_password).toBe(true);
    });

    it("does not change origUserData when the user is edited", async () => {
      const user = userEvent.setup();
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      await user.click(screen.getByRole("button", { name: /edit name/i }));

      await waitFor(() =>
        expect(lastAcctInfoProps().user.first_name).toBe("Edited")
      );
      expect(lastAcctInfoProps().origUserData).toEqual(ericUser);
    });

    it("keeps edits when switching to ChangePassword and back", async () => {
      const user = userEvent.setup();
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      await user.click(screen.getByRole("button", { name: /edit name/i }));
      await user.click(screen.getByRole("button", { name: /change password/i }));
      expect(screen.getByText("Has password: true")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /account info/i }));

      expect(screen.getByText("First: Edited")).toBeInTheDocument();
    });
  });
});
