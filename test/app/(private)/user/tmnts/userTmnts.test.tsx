// test/app/(private)/user/tmnts/userTmnts.test.tsx
// tests for src/app/(private)/user/tmnts/page.tsx
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserTmntsPage from "@/app/(private)/user/tmnts/page";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchUserTmnts,
  deleteUserTmnt,
} from "@/redux/features/userTmnts/userTmntsSlice";

import { fetchBowls } from "@/redux/features/bowls/bowlsSlice";

import { yyyyMMdd_To_MMddyyyy } from "@/lib/dateTools";

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

// must mock the SAME function name the page imports
jest.mock("@/lib/dateTools", () => ({
  __esModule: true,
  yyyyMMdd_To_MMddyyyy: jest.fn(),
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
        <div data-testid="ConfirmModalTitle">{title}</div>
        <pre data-testid="ConfirmModalMessage">{message}</pre>
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
const fmtDateMock = yyyyMMdd_To_MMddyyyy as unknown as jest.Mock;

// ---------- Helpers ----------

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

type MockState = {
  userTmnts: {
    userTmnts: any[];
    status: LoadStatus;
    error: string | null;
  };
  bowls: {
    status: LoadStatus;
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

const makeTmnt = (
  id: string,
  tmnt_name: string,
  start_date_str: string,
  bowl_name: string,
  city: string,
  state: string
) => ({
  id,
  tmnt_name,
  start_date_str,
  bowl: { bowl_name, city, state },
});

const twoTmnts = [
  makeTmnt("tmt_1", "Sweeper 1", "2025-01-02", "Earl Anthony's", "Dublin", "CA"),
  makeTmnt("tmt_2", "Sweeper 2", "2025-02-03", "Harvest Park", "Pleasanton", "CA"),
];

/** state where both slices loaded successfully */
const loadedState = (userTmnts: any[] = twoTmnts): MockState =>
  makeState({
    userTmnts: { userTmnts, status: "succeeded", error: null },
    bowls: { status: "succeeded", error: null },
  });

describe("UserTmntsPage", () => {
  const mockDispatch = jest.fn();
  let mockState: MockState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockState = makeState();

    useDispatchMock.mockReturnValue(mockDispatch);
    useSelectorMock.mockImplementation((selector: any) => selector(mockState));

    fmtDateMock.mockImplementation((s: string) => `FMT(${s})`);

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

    it("does not dispatch fetchUserTmnts when session user has no id", () => {
      useSessionMock.mockReturnValue({
        status: "authenticated",
        data: { user: {} },
      } as any);

      render(<UserTmntsPage />);

      expect(fetchUserTmnts).not.toHaveBeenCalled();
    });

    it("dispatches fetchUserTmnts once the session resolves to a user id", () => {
      useSessionMock.mockReturnValue({
        status: "loading",
        data: null,
      } as any);

      const { rerender } = render(<UserTmntsPage />);
      expect(fetchUserTmnts).not.toHaveBeenCalled();

      useSessionMock.mockReturnValue({
        status: "authenticated",
        data: { user: { id: "usr_456" } },
      } as any);
      rerender(<UserTmntsPage />);

      expect(fetchUserTmnts).toHaveBeenCalledTimes(1);
      expect(fetchUserTmnts).toHaveBeenCalledWith("usr_456");
      // bowls are fetched only once, on mount
      expect(fetchBowls).toHaveBeenCalledTimes(1);
    });

    it("does not re-fetch user tournaments on re-render with the same user id", () => {
      const { rerender } = render(<UserTmntsPage />);
      rerender(<UserTmntsPage />);

      expect(fetchUserTmnts).toHaveBeenCalledTimes(1);
      expect(fetchBowls).toHaveBeenCalledTimes(1);
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
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
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

    it("does not render the table while one slice is still loading", () => {
      mockState = makeState({
        userTmnts: { userTmnts: twoTmnts, status: "succeeded", error: null },
        bowls: { status: "loading", error: null },
      });

      render(<UserTmntsPage />);

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
        "data-show",
        "true"
      );
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByText("Sweeper 1")).not.toBeInTheDocument();
    });

    it("hides WaitModal when both slices succeeded", () => {
      mockState = loadedState();

      render(<UserTmntsPage />);

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
        "data-show",
        "false"
      );
    });

    it("hides WaitModal and renders nothing else when both slices are idle", () => {
      // default state: both idle
      render(<UserTmntsPage />);

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
        "data-show",
        "false"
      );
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
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
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
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
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows both errors when both slices failed", () => {
      mockState = makeState({
        userTmnts: {
          userTmnts: [],
          status: "failed",
          error: "UserTmnts blew up",
        },
        bowls: { status: "failed", error: "Bowls blew up" },
      });

      render(<UserTmntsPage />);

      expect(
        screen.getByText(/Error:\s*UserTmnts blew up/i)
      ).toBeInTheDocument();
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

    it("does NOT show stale errors when both slices succeeded, and still renders the table", () => {
      mockState = makeState({
        userTmnts: {
          userTmnts: twoTmnts,
          status: "succeeded",
          error: "old userTmnts error",
        },
        bowls: { status: "succeeded", error: "old bowls error" },
      });

      render(<UserTmntsPage />);

      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("does NOT show an error when status is failed but error is empty", () => {
      mockState = makeState({
        userTmnts: { userTmnts: [], status: "failed", error: "" },
        bowls: { status: "failed", error: null },
      });

      render(<UserTmntsPage />);

      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
    });
  });

  describe("table rendering and content", () => {
    it("renders the table with tournament rows when both slices succeeded", () => {
      mockState = loadedState();

      render(<UserTmntsPage />);

      // "New Tournament" link
      const newLink = screen.getByRole("link", { name: /new tournament/i });
      expect(newLink).toHaveAttribute("href", "/dataEntry/newTmnt");

      // 1 header row + 2 body rows
      expect(screen.getAllByRole("row")).toHaveLength(3);

      // row contents
      expect(screen.getByText("Sweeper 1")).toBeInTheDocument();
      expect(screen.getByText("Earl Anthony's")).toBeInTheDocument();
      expect(screen.getByText("FMT(2025-01-02)")).toBeInTheDocument();

      expect(screen.getByText("Sweeper 2")).toBeInTheDocument();
      expect(screen.getByText("Harvest Park")).toBeInTheDocument();
      expect(screen.getByText("FMT(2025-02-03)")).toBeInTheDocument();
    });

    it("renders Edit, Run and Delete actions for every row with correct hrefs", () => {
      mockState = loadedState();

      render(<UserTmntsPage />);

      const editLinks = screen.getAllByRole("link", { name: /^edit$/i });
      const runLinks = screen.getAllByRole("link", { name: /^run$/i });
      const deleteBtns = screen.getAllByRole("button", { name: /^delete$/i });

      expect(editLinks).toHaveLength(2);
      expect(runLinks).toHaveLength(2);
      expect(deleteBtns).toHaveLength(2);

      expect(editLinks[0]).toHaveAttribute("href", "/dataEntry/editTmnt/tmt_1");
      expect(runLinks[0]).toHaveAttribute("href", "/dataEntry/runTmnt/tmt_1");
      expect(editLinks[1]).toHaveAttribute("href", "/dataEntry/editTmnt/tmt_2");
      expect(runLinks[1]).toHaveAttribute("href", "/dataEntry/runTmnt/tmt_2");
    });

    it("renders table structure with no rows when both slices succeeded but userTmnts is empty", () => {
      mockState = loadedState([]);

      render(<UserTmntsPage />);

      // still has "New Tournament" link
      expect(
        screen.getByRole("link", { name: /new tournament/i })
      ).toHaveAttribute("href", "/dataEntry/newTmnt");

      // table headers exist
      expect(
        screen.getByRole("columnheader", { name: "Tournament" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "Start Date" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "Center" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "Actions" })
      ).toBeInTheDocument();

      // only the header row, no body rows / actions
      expect(screen.getAllByRole("row")).toHaveLength(1);
      expect(
        screen.queryByRole("button", { name: /delete/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /^edit$/i })
      ).not.toBeInTheDocument();
    });

    it("puts the table in the scroll container and keeps New Tournament outside it", () => {
      mockState = loadedState();

      render(<UserTmntsPage />);

      const scrollBox = screen.getByTestId("tmntsScroll");
      const table = screen.getByRole("table");
      const newLink = screen.getByRole("link", { name: /new tournament/i });

      // table (and its sticky header) scroll inside the box
      expect(scrollBox).toContainElement(table);
      expect(within(table).getAllByRole("columnheader")).toHaveLength(4);
      // the New Tournament button is above the box, so it never scrolls
      expect(scrollBox).not.toContainElement(newLink);
    });

    it("formats start dates using yyyyMMdd_To_MMddyyyy", () => {
      mockState = loadedState();

      render(<UserTmntsPage />);

      expect(fmtDateMock).toHaveBeenCalledWith("2025-01-02");
      expect(fmtDateMock).toHaveBeenCalledWith("2025-02-03");
    });
  });

  describe("delete flow and confirm modal", () => {
    it("does not show confirm modal initially", () => {
      mockState = loadedState();

      render(<UserTmntsPage />);

      expect(screen.queryByTestId("ConfirmModalMock")).not.toBeInTheDocument();
    });

    it("clicking Delete opens confirm modal with tournament details", async () => {
      const user = userEvent.setup();

      mockState = loadedState([
        makeTmnt("tmt_9", "Big Money", "2025-11-30", "AMF", "San Jose", "CA"),
      ]);

      render(<UserTmntsPage />);

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(screen.getByTestId("ConfirmModalMock")).toBeInTheDocument();
      expect(screen.getByTestId("ConfirmModalTitle")).toHaveTextContent(
        "Delete Tournament"
      );

      const message = screen.getByTestId("ConfirmModalMessage");
      expect(message).toHaveTextContent(
        /Are you sure you want to delete the tournament\?/i
      );
      expect(message).toHaveTextContent(/Name:\s*Big Money/i);
      // start date is formatted (mm/dd/yyyy) via yyyyMMdd_To_MMddyyyy,
      // which is mocked to return FMT(<input>)
      expect(message).toHaveTextContent(/Start Date:\s*FMT\(2025-11-30\)/i);
      expect(message).not.toHaveTextContent(/Start Date:\s*2025-11-30/i);
      expect(message).toHaveTextContent(/Center:\s*AMF/i);
      expect(message).toHaveTextContent(/Location:\s*San Jose,\s*CA/i);

      // opening the modal must not delete anything yet
      expect(deleteUserTmnt).not.toHaveBeenCalled();
    });

    it("formats the confirm modal start date as mm/dd/yyyy", async () => {
      const user = userEvent.setup();

      // use a realistic formatter for this test
      fmtDateMock.mockImplementation((s: string) => {
        const [yyyy, mm, dd] = s.split("-");
        return `${mm}/${dd}/${yyyy}`;
      });

      mockState = loadedState([
        makeTmnt("tmt_nov", "Nov Sweeper", "2026-11-28", "AMF", "San Jose", "CA"),
      ]);

      render(<UserTmntsPage />);

      // table cell is formatted
      expect(screen.getByText("11/28/2026")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /delete/i }));

      // modal message uses the same formatted date
      expect(fmtDateMock).toHaveBeenLastCalledWith("2026-11-28");
      expect(screen.getByTestId("ConfirmModalMessage")).toHaveTextContent(
        /Start Date:\s*11\/28\/2026/
      );
      expect(screen.getByTestId("ConfirmModalMessage")).not.toHaveTextContent(
        "2026-11-28"
      );
    });

    it("clicking Delete on the second row shows that row's details", async () => {
      const user = userEvent.setup();
      mockState = loadedState();

      render(<UserTmntsPage />);

      await user.click(screen.getAllByRole("button", { name: /delete/i })[1]);

      const message = screen.getByTestId("ConfirmModalMessage");
      expect(message).toHaveTextContent(/Name:\s*Sweeper 2/i);
      expect(message).toHaveTextContent(/Center:\s*Harvest Park/i);
      expect(message).toHaveTextContent(/Location:\s*Pleasanton,\s*CA/i);
      expect(message).not.toHaveTextContent(/Sweeper 1/i);
    });

    it("confirming delete dispatches deleteUserTmnt with the selected id and closes modal", async () => {
      const user = userEvent.setup();

      mockState = loadedState([
        makeTmnt("tmt_del", "To Delete", "2025-10-10", "Bowl 1", "X", "Y"),
      ]);

      render(<UserTmntsPage />);

      await user.click(screen.getByRole("button", { name: /delete/i }));
      expect(screen.getByTestId("ConfirmModalMock")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /confirm/i }));

      expect(deleteUserTmnt).toHaveBeenCalledTimes(1);
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

    it("confirming delete on the second row deletes only that tournament", async () => {
      const user = userEvent.setup();
      mockState = loadedState();

      render(<UserTmntsPage />);

      await user.click(screen.getAllByRole("button", { name: /delete/i })[1]);
      await user.click(screen.getByRole("button", { name: /confirm/i }));

      expect(deleteUserTmnt).toHaveBeenCalledTimes(1);
      expect(deleteUserTmnt).toHaveBeenCalledWith("tmt_2");
      expect(deleteUserTmnt).not.toHaveBeenCalledWith("tmt_1");
    });

    it("canceling delete closes modal and does not dispatch deleteUserTmnt", async () => {
      const user = userEvent.setup();

      mockState = loadedState([
        makeTmnt("tmt_keep", "Keep Me", "2025-09-09", "Bowl 2", "A", "B"),
      ]);

      render(<UserTmntsPage />);

      await user.click(screen.getByRole("button", { name: /delete/i }));
      expect(screen.getByTestId("ConfirmModalMock")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(deleteUserTmnt).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "userTmnts/deleteUserTmnt" })
      );
      expect(
        screen.queryByTestId("ConfirmModalMock")
      ).not.toBeInTheDocument();
    });

    it("can cancel and then re-open and confirm the delete", async () => {
      const user = userEvent.setup();
      mockState = loadedState();

      render(<UserTmntsPage />);

      await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(deleteUserTmnt).not.toHaveBeenCalled();

      await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
      expect(screen.getByTestId("ConfirmModalMock")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /confirm/i }));

      expect(deleteUserTmnt).toHaveBeenCalledTimes(1);
      expect(deleteUserTmnt).toHaveBeenCalledWith("tmt_1");
    });
  });
});