import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserTmntsPage from "@/app/user/tmnts/page";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchUserTmnts,
  deleteUserTmnt,
} from "@/redux/features/userTmnts/userTmntsSlice";

import { fetchBowls } from "@/redux/features/bowls/bowlsSlice";

import { yyyyMMdd_To_ddMMyyyy } from "@/lib/dateTools";

// ---------- Mocks ----------

jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: jest.fn(),
}));

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock("@/lib/dateTools", () => ({
  __esModule: true,
  yyyyMMdd_To_ddMMyyyy: jest.fn(),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) => (
    <div data-testid="WaitModalMock" data-show={String(show)}>
      {message}
    </div>
  ),
}));

jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  default: ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    show ? (
      <div data-testid="ConfirmModalMock">
        <div>{title}</div>
        <pre>{message}</pre>
        <button type="button" onClick={onConfirm}>
          Confirm
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/modal/modalObjType", () => ({
  __esModule: true,
  initModalObj: { show: false, title: "", message: "", id: "" },
}));

jest.mock("@/redux/features/userTmnts/userTmntsSlice", () => {
  const actual = jest.requireActual(
    "@/redux/features/userTmnts/userTmntsSlice"
  );
  return {
    __esModule: true,
    ...actual,
    fetchUserTmnts: jest.fn(),
    deleteUserTmnt: jest.fn(),
    // selectors
    getUserTmntStatus: (state: any) => state.userTmnts.status,
    getUserTmntError: (state: any) => state.userTmnts.error,
  };
});

jest.mock("@/redux/features/bowls/bowlsSlice", () => {
  const actual = jest.requireActual("@/redux/features/bowls/bowlsSlice");
  return {
    __esModule: true,
    ...actual,
    fetchBowls: jest.fn(),
    // selectors
    getBowlsLoadStatus: (state: any) => state.bowls.status,
    getBowlsError: (state: any) => state.bowls.error,
  };
});

const useDispatchMock =
  useDispatch as unknown as jest.MockedFunction<typeof useDispatch>;
const useSelectorMock =
  useSelector as unknown as jest.MockedFunction<typeof useSelector>;
const useSessionMock =
  useSession as unknown as jest.MockedFunction<typeof useSession>;

const fetchUserTmntsMock = fetchUserTmnts as unknown as jest.Mock;
const deleteUserTmntMock = deleteUserTmnt as unknown as jest.Mock;
const fetchBowlsMock = fetchBowls as unknown as jest.Mock;

// ---------- Helpers ----------

type MockState = {
  userTmnts: {
    userTmnts: any[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  bowls: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
};

const makeState = (overrides?: Partial<MockState>): MockState => ({
  userTmnts: {
    userTmnts: [],
    status: "idle",
    error: null,
  },
  bowls: {
    status: "idle",
    error: null,
  },
  ...(overrides ?? {}),
});

describe("UserTmntsPage", () => {
  const mockDispatch = jest.fn();
  let mockState: MockState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockState = makeState();

    useDispatchMock.mockReturnValue(mockDispatch);
    useSelectorMock.mockImplementation((selector: any) => selector(mockState));

    (yyyyMMdd_To_ddMMyyyy as unknown as jest.Mock).mockImplementation(
      (s: string) => `FMT(${s})`
    );

    useSessionMock.mockReturnValue({
      status: "authenticated",
      data: { user: { id: "usr_123" } },
    } as any);

    fetchUserTmntsMock.mockImplementation((userId: string) => ({
      type: "userTmnts/fetchUserTmnts",
      payload: userId,
    }));

    deleteUserTmntMock.mockImplementation((tmntId: string) => ({
      type: "userTmnts/deleteUserTmnt",
      payload: tmntId,
    }));

    fetchBowlsMock.mockImplementation(() => ({
      type: "bowls/fetchBowls",
    }));
  });

  describe("session and data fetching", () => {
    it("dispatches fetchBowls on mount", () => {
      render(<UserTmntsPage />);

      expect(fetchBowls).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({ type: "bowls/fetchBowls" });
    });

    it("dispatches fetchUserTmnts when session has a user id", () => {
      render(<UserTmntsPage />);

      expect(fetchUserTmnts).toHaveBeenCalledTimes(1);
      expect(fetchUserTmnts).toHaveBeenCalledWith("usr_123");
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "userTmnts/fetchUserTmnts",
        payload: "usr_123",
      });
    });

    it("does not dispatch fetchUserTmnts while session is loading", () => {
      useSessionMock.mockReturnValue({
        status: "loading",
        data: null,
      } as any);

      render(<UserTmntsPage />);

      // still fetches bowls on mount
      expect(fetchBowls).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({ type: "bowls/fetchBowls" });

      // but should NOT fetch user tournaments yet
      expect(fetchUserTmnts).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "userTmnts/fetchUserTmnts" })
      );
    });

    it("does not dispatch fetchUserTmnts when session is unauthenticated", () => {
      useSessionMock.mockReturnValue({
        status: "unauthenticated",
        data: null,
      } as any);

      render(<UserTmntsPage />);

      // still fetches bowls on mount
      expect(fetchBowls).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({ type: "bowls/fetchBowls" });

      // but should NOT fetch user tournaments
      expect(fetchUserTmnts).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "userTmnts/fetchUserTmnts" })
      );
    });
  });

  describe("loading state and WaitModal", () => {
    it("shows WaitModal when userTmnts is loading", () => {
      mockState = makeState({
        userTmnts: { userTmnts: [], status: "loading", error: null },
        bowls: { status: "idle", error: null },
      });

      render(<UserTmntsPage />);

      const wait = screen.getByTestId("WaitModalMock");
      expect(wait).toHaveAttribute("data-show", "true");
      expect(wait).toHaveTextContent("Loading...");
    });

    it("shows WaitModal when bowls is loading (even if userTmnts is not)", () => {
      mockState = makeState({
        userTmnts: { userTmnts: [], status: "idle", error: null },
        bowls: { status: "loading", error: null },
      });

      render(<UserTmntsPage />);

      const wait = screen.getByTestId("WaitModalMock");
      expect(wait).toHaveAttribute("data-show", "true");
      expect(wait).toHaveTextContent("Loading...");
    });
  });

  describe("error rendering", () => {
    it("shows user tournaments error when userTmnts failed (not loading/succeeded)", () => {
      mockState = makeState({
        userTmnts: {
          userTmnts: [],
          status: "failed",
          error: "UserTmnts blew up",
        },
        bowls: { status: "succeeded", error: null },
      });

      render(<UserTmntsPage />);

      expect(
        screen.getByText(/Error:\s*UserTmnts blew up/i)
      ).toBeInTheDocument();
    });

    it("shows bowls error when bowls failed (not loading/succeeded)", () => {
      mockState = makeState({
        userTmnts: { userTmnts: [], status: "succeeded", error: null },
        bowls: { status: "failed", error: "Bowls blew up" },
      });

      render(<UserTmntsPage />);

      expect(
        screen.getByText(/Error:\s*Bowls blew up/i)
      ).toBeInTheDocument();
    });

    it("does NOT show user tournaments error while userTmnts is loading, even if error is present", () => {
      mockState = makeState({
        userTmnts: {
          userTmnts: [],
          status: "loading",
          error: "UserTmnts blew up",
        },
        bowls: { status: "succeeded", error: null },
      });

      render(<UserTmntsPage />);

      expect(
        screen.queryByText(/Error:\s*UserTmnts blew up/i)
      ).not.toBeInTheDocument();
    });

    it("does NOT show bowls error while bowls is loading, even if error is present", () => {
      mockState = makeState({
        userTmnts: { userTmnts: [], status: "succeeded", error: null },
        bowls: { status: "loading", error: "Bowls blew up" },
      });

      render(<UserTmntsPage />);

      expect(
        screen.queryByText(/Error:\s*Bowls blew up/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("table rendering and content", () => {
    it("renders the table with tournament rows when both slices succeeded", () => {
      mockState = makeState({
        userTmnts: {
          status: "succeeded",
          error: null,
          userTmnts: [
            {
              id: "tmt_1",
              tmnt_name: "Sweeper 1",
              start_date_str: "2025-01-02",
              bowls: {
                bowl_name: "Earl Anthony's",
                city: "Dublin",
                state: "CA",
              },
            },
            {
              id: "tmt_2",
              tmnt_name: "Sweeper 2",
              start_date_str: "2025-02-03",
              bowls: {
                bowl_name: "Harvest Park",
                city: "Pleasanton",
                state: "CA",
              },
            },
          ],
        },
        bowls: { status: "succeeded", error: null },
      });

      render(<UserTmntsPage />);

      // "New Tournament" link
      const newLink = screen.getByRole("link", { name: /new tournament/i });
      expect(newLink).toHaveAttribute("href", "/dataEntry/newTmnt");

      // row contents
      expect(screen.getByText("Sweeper 1")).toBeInTheDocument();
      expect(screen.getByText("Earl Anthony's")).toBeInTheDocument();
      expect(screen.getByText("FMT(2025-01-02)")).toBeInTheDocument();

      expect(screen.getByText("Sweeper 2")).toBeInTheDocument();
      expect(screen.getByText("Harvest Park")).toBeInTheDocument();
      expect(screen.getByText("FMT(2025-02-03)")).toBeInTheDocument();

      // Edit + Run links for first row
      const edit1 = screen.getAllByRole("link", { name: /edit/i })[0];
      const run1 = screen.getAllByRole("link", { name: /run/i })[0];
      expect(edit1).toHaveAttribute("href", "/dataEntry/editTmnt/tmt_1");
      expect(run1).toHaveAttribute("href", "/dataEntry/runTmnt/tmt_1");
    });

    it("renders table structure with no rows when both slices succeeded but userTmnts is empty", () => {
      mockState = makeState({
        userTmnts: {
          status: "succeeded",
          error: null,
          userTmnts: [],
        },
        bowls: { status: "succeeded", error: null },
      });

      render(<UserTmntsPage />);

      // still has "New Tournament" link
      expect(
        screen.getByRole("link", { name: /new tournament/i })
      ).toHaveAttribute("href", "/dataEntry/newTmnt");

      // table headers exist
      expect(screen.getByText("Tournament")).toBeInTheDocument();
      expect(screen.getByText("Start Date")).toBeInTheDocument();
      expect(screen.getByText("Center")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();

      // but no tournament names present
      expect(
        screen.queryByRole("button", { name: /delete/i })
      ).not.toBeInTheDocument();
    });

    it("formats start dates using yyyyMMdd_To_ddMMyyyy", () => {
      mockState = makeState({
        userTmnts: {
          status: "succeeded",
          error: null,
          userTmnts: [
            {
              id: "tmt_1",
              tmnt_name: "Sweeper 1",
              start_date_str: "2025-01-02",
              bowls: {
                bowl_name: "Earl Anthony's",
                city: "Dublin",
                state: "CA",
              },
            },
          ],
        },
        bowls: { status: "succeeded", error: null },
      });

      const fmtMock = yyyyMMdd_To_ddMMyyyy as unknown as jest.Mock;

      render(<UserTmntsPage />);

      expect(fmtMock).toHaveBeenCalledWith("2025-01-02");
    });
  });

  describe("delete flow and confirm modal", () => {
    it("clicking Delete opens confirm modal with tournament details", async () => {
      const user = userEvent.setup();

      mockState = makeState({
        userTmnts: {
          status: "succeeded",
          error: null,
          userTmnts: [
            {
              id: "tmt_9",
              tmnt_name: "Big Money",
              start_date_str: "2025-11-30",
              bowls: { bowl_name: "AMF", city: "San Jose", state: "CA" },
            },
          ],
        },
        bowls: { status: "succeeded", error: null },
      });

      render(<UserTmntsPage />);

      await user.click(screen.getByRole("button", { name: /delete/i }));

      const modal = screen.getByTestId("ConfirmModalMock");
      expect(modal).toBeInTheDocument();
      expect(screen.getByText(/delete tournament/i)).toBeInTheDocument();

      // message is rendered in <pre> in the mock, so we can assert key lines
      expect(
        screen.getByText(
          /Are you sure you want to delete the tournament\?/i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Name:\s*Big Money/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Start Date:\s*2025-11-30/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Center:\s*AMF/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Location:\s*San Jose,\s*CA/i)
      ).toBeInTheDocument();
    });

    it("confirming delete dispatches deleteUserTmnt with the selected id and closes modal", async () => {
      const user = userEvent.setup();

      mockState = makeState({
        userTmnts: {
          status: "succeeded",
          error: null,
          userTmnts: [
            {
              id: "tmt_del",
              tmnt_name: "To Delete",
              start_date_str: "2025-10-10",
              bowls: { bowl_name: "Bowl 1", city: "X", state: "Y" },
            },
          ],
        },
        bowls: { status: "succeeded", error: null },
      });

      render(<UserTmntsPage />);

      await user.click(screen.getByRole("button", { name: /delete/i }));
      expect(screen.getByTestId("ConfirmModalMock")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /confirm/i }));

      expect(deleteUserTmnt).toHaveBeenCalledWith("tmt_del");
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "userTmnts/deleteUserTmnt",
        payload: "tmt_del",
      });

      // modal should be closed after confirm
      expect(
        screen.queryByTestId("ConfirmModalMock")
      ).not.toBeInTheDocument();
    });

    it("canceling delete closes modal and does not dispatch deleteUserTmnt", async () => {
      const user = userEvent.setup();

      mockState = makeState({
        userTmnts: {
          status: "succeeded",
          error: null,
          userTmnts: [
            {
              id: "tmt_keep",
              tmnt_name: "Keep Me",
              start_date_str: "2025-09-09",
              bowls: { bowl_name: "Bowl 2", city: "A", state: "B" },
            },
          ],
        },
        bowls: { status: "succeeded", error: null },
      });

      render(<UserTmntsPage />);

      await user.click(screen.getByRole("button", { name: /delete/i }));
      expect(screen.getByTestId("ConfirmModalMock")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(deleteUserTmnt).not.toHaveBeenCalled();
      expect(
        screen.queryByTestId("ConfirmModalMock")
      ).not.toBeInTheDocument();
    });
  });
});
