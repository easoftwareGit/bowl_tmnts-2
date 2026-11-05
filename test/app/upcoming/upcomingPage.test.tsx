import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TmntUpcomingPage from "@/app/upcoming/page";
import { clearTmnts, fetchTmnts } from "@/redux/features/tmnts/tmntsSlice";

// ---- mocks ----------------------------------------------------------------

type MockTmntsState = {
  tmnts: unknown[];
  requestedYear: string | null;
  year: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | undefined;
};

// Redux hooks: dispatch is a spy, useSelector runs against mockState
const mockDispatch = jest.fn();
let mockState: { tmnts: MockTmntsState };

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
}));

// The store is only used for types; mock it so the real store isn't built
jest.mock("@/redux/store", () => ({}));

// Mock the slice so the real thunk (and the database) is never touched.
// Action creators return plain, recognizable actions; selectors mirror the
// real ones in tmntsSlice.
jest.mock("@/redux/features/tmnts/tmntsSlice", () => ({
  clearTmnts: jest.fn(() => ({ type: "tmnts/clearTmnts" })),
  fetchTmnts: jest.fn((year: string) => ({
    type: "tmnts/fetchTmnts",
    payload: year,
  })),
  selectTmnts: (state: { tmnts: MockTmntsState }) => state.tmnts.tmnts,
  getTmntsYear: (state: { tmnts: MockTmntsState }) => state.tmnts.year,
  getTmntsRequestedYear: (state: { tmnts: MockTmntsState }) =>
    state.tmnts.requestedYear,
  getTmntsStatus: (state: { tmnts: MockTmntsState }) => state.tmnts.status,
  getTmntsError: (state: { tmnts: MockTmntsState }) => state.tmnts.error,
}));

// TmntsList is tested on its own; here we only check the props it receives
const mockTmntsList = jest.fn();
jest.mock("@/components/tmnts/tmntsList", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockTmntsList(props);
    return null;
  },
}));

// WaitModal is tested on its own; here we only check show / message
const mockWaitModal = jest.fn();
jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockWaitModal(props);
    return null;
  },
}));

const mockTmnts = [
  { id: "tmt_1", tmnt_name: "Tournament One" },
  { id: "tmt_2", tmnt_name: "Tournament Two" },
];

// state after upcoming tmnts loaded successfully
const loadedState = (): MockTmntsState => ({
  tmnts: mockTmnts,
  requestedYear: "",
  year: "",
  status: "succeeded",
  error: "",
});

// state after the upcoming fetch failed
const failedState = (error = "Network Error"): MockTmntsState => ({
  tmnts: [],
  requestedYear: "",
  year: null,
  status: "failed",
  error,
});

const idleState = (): MockTmntsState => ({
  tmnts: [],
  requestedYear: null,
  year: null,
  status: "idle",
  error: "",
});

const friendlyMessage = /We couldn't load the upcoming tournaments/;

const lastTmntsListProps = () =>
  mockTmntsList.mock.lastCall?.[0] as Record<string, unknown>;
const lastWaitModalProps = () =>
  mockWaitModal.mock.lastCall?.[0] as Record<string, unknown>;

// process.env.NODE_ENV is typed read-only; this lets tests switch it
const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = env.NODE_ENV;

// ---- tests ----------------------------------------------------------------

describe("TmntUpcomingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { tmnts: loadedState() };
  });

  afterEach(() => {
    env.NODE_ENV = originalNodeEnv;
  });

  describe("render the page", () => {
    it("renders the heading", () => {
      render(<TmntUpcomingPage />);
      const heading = screen.getByRole("heading", {
        level: 1,
        name: "Upcoming Tournaments",
      });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("d-flex", "justify-content-center");
    });

    it("renders the heading while loading", () => {
      mockState = { tmnts: { ...loadedState(), status: "loading" } };
      render(<TmntUpcomingPage />);
      expect(
        screen.getByRole("heading", { name: "Upcoming Tournaments" })
      ).toBeInTheDocument();
    });

    it("renders the heading on error", () => {
      mockState = { tmnts: failedState() };
      render(<TmntUpcomingPage />);
      expect(
        screen.getByRole("heading", { name: "Upcoming Tournaments" })
      ).toBeInTheDocument();
    });
  });

  describe("dispatching on mount", () => {
    it("dispatches clearTmnts", () => {
      render(<TmntUpcomingPage />);
      expect(clearTmnts).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({ type: "tmnts/clearTmnts" });
    });

    it("dispatches fetchTmnts with an empty year", () => {
      render(<TmntUpcomingPage />);
      expect(fetchTmnts).toHaveBeenCalledTimes(1);
      expect(fetchTmnts).toHaveBeenCalledWith("");
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "tmnts/fetchTmnts",
        payload: "",
      });
    });

    it("dispatches clearTmnts before fetchTmnts", () => {
      render(<TmntUpcomingPage />);
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(mockDispatch.mock.calls[0][0]).toEqual({
        type: "tmnts/clearTmnts",
      });
      expect(mockDispatch.mock.calls[1][0]).toEqual({
        type: "tmnts/fetchTmnts",
        payload: "",
      });
    });

    it("does not dispatch again on re-render", () => {
      const { rerender } = render(<TmntUpcomingPage />);
      rerender(<TmntUpcomingPage />);
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("loading state", () => {
    it("shows the WaitModal while loading", () => {
      mockState = {
        tmnts: { ...loadedState(), tmnts: [], year: null, status: "loading" },
      };
      render(<TmntUpcomingPage />);
      expect(lastWaitModalProps()).toEqual({
        show: true,
        message: "Loading...",
      });
      expect(mockTmntsList).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows the WaitModal when idle (before the fetch starts)", () => {
      mockState = { tmnts: idleState() };
      render(<TmntUpcomingPage />);
      expect(lastWaitModalProps().show).toBe(true);
      expect(mockTmntsList).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("hides the WaitModal once loaded", () => {
      render(<TmntUpcomingPage />);
      expect(lastWaitModalProps().show).toBe(false);
    });

    it("hides the WaitModal on error", () => {
      mockState = { tmnts: failedState() };
      render(<TmntUpcomingPage />);
      expect(lastWaitModalProps().show).toBe(false);
    });
  });

  describe("error state", () => {
    it("shows a friendly error message in an alert", () => {
      mockState = { tmnts: failedState("Network Error") };
      render(<TmntUpcomingPage />);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("alert", "alert-danger");
      expect(alert).toHaveTextContent(friendlyMessage);
      expect(mockTmntsList).not.toHaveBeenCalled();
    });

    it("does not show the load status", () => {
      mockState = { tmnts: failedState("Network Error") };
      render(<TmntUpcomingPage />);
      expect(screen.queryByText(/Load Status/)).not.toBeInTheDocument();
    });

    it("hides the error details outside development", () => {
      mockState = { tmnts: failedState("Network Error") };
      render(<TmntUpcomingPage />);
      expect(screen.queryByText(/Details:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Network Error/)).not.toBeInTheDocument();
    });

    it("shows the error details in development", () => {
      env.NODE_ENV = "development";
      mockState = { tmnts: failedState("Network Error") };
      render(<TmntUpcomingPage />);
      expect(
        screen.getByText("Details: Network Error")
      ).toBeInTheDocument();
    });

    it("omits the details line in development when the error is empty", () => {
      env.NODE_ENV = "development";
      mockState = { tmnts: failedState("") };
      render(<TmntUpcomingPage />);
      expect(screen.getByRole("alert")).toHaveTextContent(friendlyMessage);
      expect(screen.queryByText(/Details:/)).not.toBeInTheDocument();
    });

    it("still shows the error when the error message is empty", () => {
      mockState = { tmnts: failedState("") };
      render(<TmntUpcomingPage />);
      expect(screen.getByRole("alert")).toHaveTextContent(friendlyMessage);
    });

    it("refetches upcoming tmnts when Try again is clicked", () => {
      mockState = { tmnts: failedState() };
      render(<TmntUpcomingPage />);
      // clearTmnts + fetchTmnts on mount
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type: "tmnts/fetchTmnts",
        payload: "",
      });
      expect(fetchTmnts).toHaveBeenLastCalledWith("");
    });
  });

  describe("ignores another page's leftover data", () => {
    it("shows the WaitModal, not another year's tmnts", () => {
      // leftover results for 2025 from the results page
      mockState = {
        tmnts: { ...loadedState(), requestedYear: "2025", year: "2025" },
      };
      render(<TmntUpcomingPage />);
      expect(mockTmntsList).not.toHaveBeenCalled();
      expect(lastWaitModalProps().show).toBe(true);
    });

    it("shows the WaitModal, not another year's error", () => {
      // leftover failure for 2025 from the results page
      mockState = {
        tmnts: { ...failedState("old error"), requestedYear: "2025" },
      };
      render(<TmntUpcomingPage />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(lastWaitModalProps().show).toBe(true);
    });
  });

  describe("loaded state - props passed to TmntsList", () => {
    it("renders TmntsList and no error", () => {
      render(<TmntUpcomingPage />);
      expect(mockTmntsList).toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("passes the tournaments from the redux state", () => {
      render(<TmntUpcomingPage />);
      expect(lastTmntsListProps().tmnts).toEqual(mockTmnts);
    });

    it("passes an empty tmnts array when there are no tournaments", () => {
      mockState = { tmnts: { ...loadedState(), tmnts: [] } };
      render(<TmntUpcomingPage />);
      expect(lastTmntsListProps().tmnts).toEqual([]);
    });

    it("passes an empty years array", () => {
      render(<TmntUpcomingPage />);
      expect(lastTmntsListProps().years).toEqual([]);
    });

    it("passes showResults as false", () => {
      render(<TmntUpcomingPage />);
      expect(lastTmntsListProps().showResults).toBe(false);
    });

    it("passes an empty tmntYear", () => {
      render(<TmntUpcomingPage />);
      expect(lastTmntsListProps().tmntYear).toBe("");
    });

    it("passes an onYearChange function that does nothing", () => {
      render(<TmntUpcomingPage />);
      const onYearChange = lastTmntsListProps().onYearChange as () => void;
      expect(typeof onYearChange).toBe("function");
      expect(() => onYearChange()).not.toThrow();
      // changing the year must not trigger another fetch
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
  });
});