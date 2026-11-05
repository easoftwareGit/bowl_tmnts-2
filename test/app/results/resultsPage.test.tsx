// test/app/results/resultsPage.test.tsx
// tests for src/app/results/page.tsx
import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import TmntResultsPage from "@/app/results/page";
import { clearTmnts, fetchTmnts } from "@/redux/features/tmnts/tmntsSlice";
import { fetchTmntYears } from "@/redux/features/tmnts/yearsSlice";
import type TmntsList from "@/components/tmnts/tmntsList";
import type { RootState } from "@/redux/store";
import type { YearObj, tmntsListType } from "@/lib/types/types";
import {
  mockBowl,
  mockTmntFullData,
} from "../../mocks/tmnts/tmntFullData/mockTmntFullData";

type TmntsListProps = ComponentProps<typeof TmntsList>;
type LoadStatus = RootState["tmnts"]["status"];

/** the parts of the Redux state the page reads */
interface MockState {
  tmnts: Pick<RootState["tmnts"], "tmnts" | "status">;
  tmntYears: Pick<RootState["tmntYears"], "data" | "status">;
}

// jest.mock factories run before the consts below are set, so these
// values are literals. They must match currentYear and changedYear.
jest.mock("@/lib/dateTools", () => ({
  todayYearStr: "2025",
}));

const currentYear = "2025"; // todayYearStr, and the year of mockTmntFullData
const changedYear = "2024"; // the year the TmntsList mock picks

// --- redux ---

const mockDispatch = jest.fn();
let mockState: MockState;

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: MockState) => unknown) =>
    selector(mockState),
}));

jest.mock("@/redux/features/tmnts/tmntsSlice", () => ({
  clearTmnts: jest.fn(() => ({ type: "tmnts/clearTmnts" })),
  fetchTmnts: jest.fn((year: string) => ({
    type: "tmnts/fetchTmnts",
    payload: year,
  })),
}));

jest.mock("@/redux/features/tmnts/yearsSlice", () => ({
  fetchTmntYears: jest.fn(() => ({ type: "tmntYears/fetchTmntYears" })),
}));

const clearTmntsAction = { type: "tmnts/clearTmnts" };
const fetchTmntYearsAction = { type: "tmntYears/fetchTmntYears" };
const fetchTmntsAction = (year: string) => ({
  type: "tmnts/fetchTmnts",
  payload: year,
});

// --- child components ---

jest.mock("@/components/modal/waitModal", () => {
  return function MockWaitModal({
    show,
    message,
  }: {
    show: boolean;
    message: string;
  }) {
    return show ? <div data-testid="WaitModalMock">{message}</div> : null;
  };
});

const mockTmntsList = jest.fn<undefined, [TmntsListProps]>();

jest.mock("@/components/tmnts/tmntsList", () => {
  return function MockTmntsList(props: TmntsListProps) {
    mockTmntsList(props);
    return (
      <div data-testid="TmntsListMock">
        <button
          type="button"
          onClick={() => {
            props.onYearChange("2024");
          }}
        >
          Change Year
        </button>
      </div>
    );
  };
});

// --- mock data ---

/** the tournament from the full tournament mock data: Mock Bowl, CA */
const mockTmnt: tmntsListType = {
  ...mockTmntFullData.tmnt,
  bowl: {
    bowl_name: mockBowl.bowl_name,
    city: mockBowl.city,
    state: mockBowl.state,
    url: mockBowl.url,
  },
};

const nvTmnt: tmntsListType = {
  ...mockTmnt,
  id: `${mockTmnt.id.slice(0, -1)}2`,
  tmnt_name: "Silver State Classic",
  start_date_str: "2025-06-14",
  bowl: {
    bowl_name: "Reno Lanes",
    city: "Reno",
    state: "NV",
    url: "https://www.example.com/reno",
  },
};

const mockTmnts: tmntsListType[] = [mockTmnt, nvTmnt];

const mockYears: YearObj[] = [{ year: currentYear }, { year: changedYear }];

const loadErrorText = "Unable to load tournament results.";

// --- helpers ---

/** sets the status of the two loads the page waits for, and the years */
const setLoadStatus = (
  tmntsStatus: LoadStatus,
  yearsStatus: LoadStatus,
  years: YearObj[] = mockYears,
): void => {
  mockState = {
    tmnts: { tmnts: mockTmnts, status: tmntsStatus },
    tmntYears: { data: years, status: yearsStatus },
  };
};

const clickChangeYear = (): void => {
  fireEvent.click(screen.getByRole("button", { name: "Change Year" }));
};

describe("TmntResultsPage", () => {
  beforeEach(() => {
    // clears calls only; the mock action creators keep their return values
    jest.clearAllMocks();
    setLoadStatus("succeeded", "succeeded");
  });

  describe("loading", () => {
    const loadingCases: [LoadStatus, LoadStatus][] = [
      ["idle", "succeeded"],
      ["loading", "succeeded"],
      ["succeeded", "idle"],
      ["succeeded", "loading"],
      ["loading", "loading"],
      ["idle", "idle"],
    ];

    it.each(loadingCases)(
      "shows WaitModal when tmnts are %s and years are %s",
      (tmntsStatus, yearsStatus) => {
        setLoadStatus(tmntsStatus, yearsStatus);
        render(<TmntResultsPage />);

        expect(screen.getByTestId("WaitModalMock")).toHaveTextContent(
          "Loading...",
        );
      },
    );

    it.each(loadingCases)(
      "does not show the title, list or error when tmnts are %s and years are %s",
      (tmntsStatus, yearsStatus) => {
        setLoadStatus(tmntsStatus, yearsStatus);
        render(<TmntResultsPage />);

        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
        expect(screen.queryByTestId("TmntsListMock")).not.toBeInTheDocument();
        expect(screen.queryByText(loadErrorText)).not.toBeInTheDocument();
      },
    );

    it("shows the list once both loads succeed", () => {
      setLoadStatus("loading", "loading");
      const { rerender } = render(<TmntResultsPage />);
      expect(screen.queryByTestId("TmntsListMock")).not.toBeInTheDocument();

      setLoadStatus("succeeded", "loading");
      rerender(<TmntResultsPage />);
      expect(screen.getByTestId("WaitModalMock")).toBeInTheDocument();
      expect(screen.queryByTestId("TmntsListMock")).not.toBeInTheDocument();

      setLoadStatus("succeeded", "succeeded");
      rerender(<TmntResultsPage />);
      expect(screen.queryByTestId("WaitModalMock")).not.toBeInTheDocument();
      expect(screen.getByTestId("TmntsListMock")).toBeInTheDocument();
    });
  });

  describe("load failure", () => {
    const failedCases: [LoadStatus, LoadStatus][] = [
      ["failed", "succeeded"],
      ["succeeded", "failed"],
      ["failed", "failed"],
      // one load failed while the other is still running: the error wins
      ["failed", "loading"],
      ["loading", "failed"],
      ["failed", "idle"],
      ["idle", "failed"],
    ];

    it.each(failedCases)(
      "shows the error when tmnts are %s and years are %s",
      (tmntsStatus, yearsStatus) => {
        setLoadStatus(tmntsStatus, yearsStatus);
        render(<TmntResultsPage />);

        expect(screen.getByText(loadErrorText)).toBeInTheDocument();
      },
    );

    it.each(failedCases)(
      "does not show WaitModal, the title or the list when tmnts are %s and years are %s",
      (tmntsStatus, yearsStatus) => {
        setLoadStatus(tmntsStatus, yearsStatus);
        render(<TmntResultsPage />);

        expect(screen.queryByTestId("WaitModalMock")).not.toBeInTheDocument();
        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
        expect(screen.queryByTestId("TmntsListMock")).not.toBeInTheDocument();
      },
    );
  });

  describe("successful load", () => {
    it("renders the page title", () => {
      render(<TmntResultsPage />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Tournament Results" }),
      ).toBeInTheDocument();
    });

    it("renders TmntsList", () => {
      render(<TmntResultsPage />);

      expect(screen.getByTestId("TmntsListMock")).toBeInTheDocument();
    });

    it("does not show WaitModal or the load error", () => {
      render(<TmntResultsPage />);

      expect(screen.queryByTestId("WaitModalMock")).not.toBeInTheDocument();
      expect(screen.queryByText(loadErrorText)).not.toBeInTheDocument();
    });

    it("passes the years and tmnts from Redux, the current year and showResults to TmntsList", () => {
      render(<TmntResultsPage />);

      expect(mockTmntsList).toHaveBeenLastCalledWith({
        years: mockYears,
        tmnts: mockTmnts,
        tmntYear: currentYear,
        showResults: true,
        onYearChange: expect.any(Function) as unknown,
      });
    });

    it("passes an empty tmnts list when the year has no tournaments", () => {
      mockState = {
        ...mockState,
        tmnts: { tmnts: [], status: "succeeded" },
      };
      render(<TmntResultsPage />);

      expect(screen.getByTestId("TmntsListMock")).toBeInTheDocument();
      expect(mockTmntsList).toHaveBeenLastCalledWith(
        expect.objectContaining({ tmnts: [] }),
      );
    });
  });

  describe("dispatches on page load", () => {
    it("dispatches clearTmnts, then fetchTmntYears, then fetchTmnts for the current year", () => {
      render(<TmntResultsPage />);

      expect(mockDispatch.mock.calls).toEqual([
        [clearTmntsAction],
        [fetchTmntYearsAction],
        [fetchTmntsAction(currentYear)],
      ]);
    });

    it("calls each action creator once", () => {
      render(<TmntResultsPage />);

      expect(clearTmnts).toHaveBeenCalledTimes(1);
      expect(fetchTmntYears).toHaveBeenCalledTimes(1);
      expect(fetchTmnts).toHaveBeenCalledTimes(1);
      expect(fetchTmnts).toHaveBeenCalledWith(currentYear);
    });

    it("does not dispatch again when the tmnts finish loading", () => {
      setLoadStatus("loading", "succeeded");
      const { rerender } = render(<TmntResultsPage />);
      expect(mockDispatch).toHaveBeenCalledTimes(3);

      setLoadStatus("succeeded", "succeeded");
      rerender(<TmntResultsPage />);

      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });
  });

  describe("year to load", () => {
    it.each<LoadStatus>(["idle", "loading", "failed"])(
      "does not fetch tmnts while the years are %s",
      (yearsStatus) => {
        setLoadStatus("idle", yearsStatus);
        render(<TmntResultsPage />);

        expect(fetchTmnts).not.toHaveBeenCalled();
      },
    );

    it("fetches tmnts once the years load", () => {
      setLoadStatus("idle", "loading");
      const { rerender } = render(<TmntResultsPage />);
      expect(fetchTmnts).not.toHaveBeenCalled();

      setLoadStatus("idle", "succeeded");
      rerender(<TmntResultsPage />);

      expect(fetchTmnts).toHaveBeenCalledTimes(1);
      expect(fetchTmnts).toHaveBeenCalledWith(currentYear);
    });

    it("fetches and shows the newest year when the current year has no tournaments", () => {
      // not in order, so the test checks for the newest year, not the first
      const olderYears: YearObj[] = [
        { year: "2022" },
        { year: "2024" },
        { year: "2023" },
      ];
      setLoadStatus("succeeded", "succeeded", olderYears);
      render(<TmntResultsPage />);

      expect(fetchTmnts).toHaveBeenCalledTimes(1);
      expect(fetchTmnts).toHaveBeenCalledWith("2024");
      expect(mockTmntsList).toHaveBeenLastCalledWith(
        expect.objectContaining({ tmntYear: "2024" }),
      );
    });

    it("does not fetch the current year first when it has no tournaments", () => {
      const olderYears: YearObj[] = [{ year: "2024" }];
      setLoadStatus("idle", "loading", olderYears);
      const { rerender } = render(<TmntResultsPage />);

      setLoadStatus("idle", "succeeded", olderYears);
      rerender(<TmntResultsPage />);

      expect(fetchTmnts).toHaveBeenCalledTimes(1);
      expect(fetchTmnts).not.toHaveBeenCalledWith(currentYear);
    });

    it("fetches and shows the current year when there are no years", () => {
      setLoadStatus("succeeded", "succeeded", []);
      render(<TmntResultsPage />);

      expect(fetchTmnts).toHaveBeenCalledTimes(1);
      expect(fetchTmnts).toHaveBeenCalledWith(currentYear);
      expect(mockTmntsList).toHaveBeenLastCalledWith(
        expect.objectContaining({ tmntYear: currentYear, years: [] }),
      );
    });
  });

  describe("year change", () => {
    it("dispatches fetchTmnts for the new year", () => {
      render(<TmntResultsPage />);
      clickChangeYear();

      expect(fetchTmnts).toHaveBeenCalledTimes(2);
      expect(fetchTmnts).toHaveBeenLastCalledWith(changedYear);
      expect(mockDispatch).toHaveBeenLastCalledWith(
        fetchTmntsAction(changedYear),
      );
    });

    it("does not dispatch clearTmnts or fetchTmntYears again", () => {
      render(<TmntResultsPage />);
      clickChangeYear();

      expect(clearTmnts).toHaveBeenCalledTimes(1);
      expect(fetchTmntYears).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledTimes(4);
    });

    it("passes the new year to TmntsList", () => {
      render(<TmntResultsPage />);
      clickChangeYear();

      expect(mockTmntsList).toHaveBeenLastCalledWith(
        expect.objectContaining({ tmntYear: changedYear }),
      );
    });

    it("keeps the new year while the new year's tmnts load", () => {
      const { rerender } = render(<TmntResultsPage />);
      clickChangeYear();

      // the store marks tmnts as loading: the list is hidden
      setLoadStatus("loading", "succeeded");
      rerender(<TmntResultsPage />);
      expect(screen.getByTestId("WaitModalMock")).toBeInTheDocument();
      expect(screen.queryByTestId("TmntsListMock")).not.toBeInTheDocument();

      // the new tmnts arrive: the list comes back with the new year
      setLoadStatus("succeeded", "succeeded");
      rerender(<TmntResultsPage />);
      expect(screen.getByTestId("TmntsListMock")).toBeInTheDocument();
      expect(mockTmntsList).toHaveBeenLastCalledWith(
        expect.objectContaining({ tmntYear: changedYear }),
      );

      // and the year change was fetched only once
      expect(fetchTmnts).toHaveBeenCalledTimes(2);
    });
  });
});
