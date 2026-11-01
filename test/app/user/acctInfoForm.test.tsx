import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AcctInfoForm from "@/app/user/acctInfo/acctInfoForm";
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
const acctInfoSpy = jest.fn();
jest.mock("@/app/user/acctInfo/acctInfo", () => ({
  __esModule: true,
  default: function MockAcctInfo(props: AcctInfoProps) {
    acctInfoSpy(props);
    return (
      <div data-testid="AcctInfoMock">
        <div>First: {props.user.first_name}</div>
        <button type="button" onClick={() => props.setInfoType("Password")}>
          Change Password
        </button>
        <button
          type="button"
          onClick={() =>
            props.setUser({ ...props.user, first_name: "Edited", has_password: false })
          }
        >
          Edit Name
        </button>
      </div>
    );
  },
}));

const changePwdSpy = jest.fn();
jest.mock("@/app/user/acctInfo/chgPwd", () => ({
  __esModule: true,
  default: function MockChangePassword(props: ChangePasswordProps) {
    changePwdSpy(props);
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

// ---- helpers ----

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockGetAcctUserById = getAcctUserById as jest.MockedFunction<typeof getAcctUserById>;

const setSession = (
  status: "loading" | "authenticated" | "unauthenticated",
  userId?: string
) => {
  mockUseSession.mockReturnValue({
    status,
    data: userId ? { user: { id: userId }, expires: "2099-01-01T00:00:00.000Z" } : null,
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

const lastAcctInfoProps = (): AcctInfoProps => acctInfoSpy.mock.calls.at(-1)?.[0];
const lastChangePwdProps = (): ChangePasswordProps => changePwdSpy.mock.calls.at(-1)?.[0];

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
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();
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
      mockGetAcctUserById.mockResolvedValue({ ...ericUser, has_password: false });

      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      expect(lastAcctInfoProps().user.has_password).toBe(false);
      expect(lastAcctInfoProps().origUserData.has_password).toBe(false);
    });

    it("never passes password_hash to the children", async () => {
      render(<AcctInfoForm />);
      await screen.findByTestId("AcctInfoMock");

      expect(lastAcctInfoProps().user).not.toHaveProperty("password_hash");
      expect(lastAcctInfoProps().origUserData).not.toHaveProperty("password_hash");
    });

    it("uses a blank phone when the user has none", async () => {
      mockGetAcctUserById.mockResolvedValue({
        ...ericUser,
        phone: undefined as unknown as string,
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

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
      expect(mockGetAcctUserById).not.toHaveBeenCalled();
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
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
      expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
    });

    it("shows Not logged in and does not fetch when unauthenticated", async () => {
      setSession("unauthenticated");

      render(<AcctInfoForm />);

      expect(await screen.findByText(/error:\s*not logged in/i)).toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
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

      expect(await screen.findByText(/error:\s*not logged in/i)).toBeInTheDocument();
      expect(mockGetAcctUserById).not.toHaveBeenCalled();
    });

    it("ignores a slow fetch for an old user id", async () => {
      let resolveOld!: (user: acctUserType) => void;
      mockGetAcctUserById
        .mockReturnValueOnce(
          new Promise<acctUserType>((resolve) => {
            resolveOld = resolve;
          })
        )
        .mockResolvedValueOnce({ ...ericUser, id: "usr_456", first_name: "New" });

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
  });

  describe("fetch errors", () => {
    it("shows an error and no children when getAcctUserById throws", async () => {
      mockGetAcctUserById.mockRejectedValue(new Error("getAcctUserById failed: db down"));

      render(<AcctInfoForm />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      expect(await screen.findByText(/error:\s*failed to fetch user/i)).toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();
      // the thrown error's own text is not shown
      expect(screen.queryByText(/db down/i)).not.toBeInTheDocument();
    });

    it("clears the error when a later fetch succeeds", async () => {
      mockGetAcctUserById
        .mockRejectedValueOnce(new Error("db down"))
        .mockResolvedValueOnce({ ...ericUser, id: "usr_456" });

      const { rerender } = render(<AcctInfoForm />);
      await screen.findByText(/error:\s*failed to fetch user/i);

      setSession("authenticated", "usr_456");
      rerender(<AcctInfoForm />);

      expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
      expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
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

// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import "@testing-library/jest-dom";

// import AcctInfoForm from "@/app/user/acctInfo/acctInfoForm";

// // --- mocks ---
// const mockUseSession = jest.fn();
// jest.mock("next-auth/react", () => ({
//   useSession: () => mockUseSession(),
// }));

// const mockGetUserById = jest.fn();
// jest.mock("@/lib/db/users/dbUsers", () => ({
//   getUserById: (...args: any[]) => mockGetUserById(...args),
// }));

// jest.mock("@/lib/db/initVals", () => ({
//   blankUserData: {
//     id: "",
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone: "",
//     role: undefined,
//   },
// }));

// import { blankUserData } from "@/lib/db/initVals";

// // Mock AcctInfo and ChangePassword so we can:
// // - assert they render
// // - trigger setInfoType to flip between views
// const acctInfoSpy = jest.fn();
// jest.mock("@/app/user/acctInfo/acctInfo", () => {
//   return function MockAcctInfo(props: any) {
//     acctInfoSpy(props);
//     return (
//       <div data-testid="AcctInfoMock">
//         <div>AcctInfo Child</div>
//         <button onClick={() => props.setInfoType("Password")}>
//           Change Password
//         </button>
//       </div>
//     );
//   };
// });

// const changePwdSpy = jest.fn();
// jest.mock("@/app/user/acctInfo/chgPwd", () => {
//   return function MockChangePassword(props: any) {
//     changePwdSpy(props);
//     return (
//       <div data-testid="ChangePasswordMock">
//         <div>ChangePassword Child</div>
//         <button onClick={() => props.setInfoType("AcctInfo")}>
//           Account Info
//         </button>
//       </div>
//     );
//   };
// });

// function setSessionAuthed(userId: string) {
//   mockUseSession.mockReturnValue({
//     status: "authenticated",
//     data: { user: { id: userId } },
//     update: jest.fn(),
//   });
// }

// describe("AcctInfoForm", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("shows Account Information heading and Loading... initially, then renders AcctInfo after fetch", async () => {
//     setSessionAuthed("usr_123");

//     mockGetUserById.mockResolvedValue({
//       id: "usr_123",
//       first_name: "Eric",
//       last_name: "A",
//       email: "eric@example.com",
//       password_hash: "hash",
//       phone: "9255551212",
//     });

//     render(<AcctInfoForm />);

//     expect(
//       screen.getByRole("heading", { name: /account information/i })
//     ).toBeInTheDocument();
//     expect(screen.getByText(/loading/i)).toBeInTheDocument();

//     await waitFor(() =>
//       expect(mockGetUserById).toHaveBeenCalledWith("usr_123")
//     );

//     expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
//     expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
//     expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();

//     expect(acctInfoSpy).toHaveBeenCalled();
//     const lastProps = acctInfoSpy.mock.calls.at(-1)?.[0];

//     expect(lastProps.user).toMatchObject({
//       id: "usr_123",
//       first_name: "Eric",
//       last_name: "A",
//       email: "eric@example.com",
//       password_hash: "hash",
//       phone: "9255551212",
//       role: undefined,
//     });

//     expect(lastProps.origUserData).toEqual({
//       id: "usr_123",
//       first_name: "Eric",
//       last_name: "A",
//       email: "eric@example.com",
//       phone: "9255551212",
//       role: undefined,
//     });

//     expect(typeof lastProps.setUser).toBe("function");
//     expect(typeof lastProps.setInfoType).toBe("function");
//   });

//   it("switches between AcctInfo and ChangePassword (heading + rendered child) via setInfoType", async () => {
//     const user = userEvent.setup();
//     setSessionAuthed("usr_999");

//     mockGetUserById.mockResolvedValue({
//       id: "usr_999",
//       first_name: "Sam",
//       last_name: "B",
//       email: "sam@example.com",
//       password_hash: "hash2",
//       // no phone
//     });

//     render(<AcctInfoForm />);

//     // wait for acct info view
//     expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();
//     expect(
//       screen.getByRole("heading", { name: /account information/i })
//     ).toBeInTheDocument();

//     // switch to change password
//     await user.click(
//       screen.getByRole("button", { name: /change password/i })
//     );

//     expect(
//       screen.getByRole("heading", { name: /change password/i })
//     ).toBeInTheDocument();
//     expect(await screen.findByTestId("ChangePasswordMock")).toBeInTheDocument();
//     expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();

//     // switch back
//     await user.click(
//       screen.getByRole("button", { name: /account info/i })
//     );

//     expect(
//       screen.getByRole("heading", { name: /account information/i })
//     ).toBeInTheDocument();
//     expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();

//     // verify ChangePassword got expected props
//     expect(changePwdSpy).toHaveBeenCalled();
//     const lastProps = changePwdSpy.mock.calls.at(-1)?.[0];
//     expect(lastProps.user).toMatchObject({
//       id: "usr_999",
//       first_name: "Sam",
//       last_name: "B",
//       email: "sam@example.com",
//       password_hash: "hash2",
//       phone: "", // from blankUser
//     });
//     expect(typeof lastProps.setInfoType).toBe("function");
//   });

//   it("shows error and does not render children when getUserById throws", async () => {
//     setSessionAuthed("usr_err");
//     mockGetUserById.mockRejectedValue(new Error("db down"));

//     render(<AcctInfoForm />);

//     expect(screen.getByText(/loading/i)).toBeInTheDocument();

//     expect(await screen.findByText(/error:\s*failed to fetch user/i)).toBeInTheDocument();
//     expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();

//     expect(screen.queryByTestId("AcctInfoMock")).not.toBeInTheDocument();
//     expect(screen.queryByTestId("ChangePasswordMock")).not.toBeInTheDocument();
//   });

//   it("when getUserById returns null/undefined, it stops without error and still renders AcctInfo with blank values", async () => {
//     setSessionAuthed("usr_none");
//     mockGetUserById.mockResolvedValue(null);

//     render(<AcctInfoForm />);

//     await waitFor(() =>
//       expect(mockGetUserById).toHaveBeenCalledWith("usr_none")
//     );

//     expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
//     expect(await screen.findByTestId("AcctInfoMock")).toBeInTheDocument();

//     const lastProps = acctInfoSpy.mock.calls.at(-1)?.[0];

//     expect(lastProps.user).toEqual({
//       ...blankUserData,
//       password_hash: "",
//     });

//     expect(lastProps.origUserData).toEqual(blankUserData);
//   });

// });

