import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import TmntPlayersPage from "@/app/results/tmnt/[tmntId]/players/page";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import {
  mockTmntFullData,
  tmntId,
  mockByePlayer,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock(
  "@/redux/features/tmntFullData/tmntFullDataSlice",
  () => ({
    fetchTmntFullData: jest.fn(),
    getTmntFullDataError: jest.fn(),
    getTmntFullDataLoadStatus: jest.fn(),
    getTmntFullDataRequestedTmntId: jest.fn(),
    selectTmntFullData: jest.fn(),
  }),
);

jest.mock("@/components/modal/waitModal", () => {
  return function MockWaitModal({
    show,
    message,
  }: {
    show: boolean;
    message: string;
  }) {
    return show ? <div>{message}</div> : null;
  };
});

jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => {
  return function MockTmntHomeHeader() {
    return <div data-testid="tmnt-home-header" />;
  };
});

const mockUseDispatch = useDispatch as jest.MockedFunction<
  typeof useDispatch
>;

const mockUseSelector = useSelector as jest.MockedFunction<
  typeof useSelector
>;

const mockUseParams = useParams as jest.MockedFunction<
  typeof useParams
>;

const mockFetchTmntFullData =
  fetchTmntFullData as jest.MockedFunction<
    typeof fetchTmntFullData
  >;

const mockDispatch = jest.fn();

type SetupOptions = {
  requestedTmntId?: string;
  loadStatus?: string;
  error?: string | null;
  tmntFullData?: typeof mockTmntFullData;
};

const setup = ({
  requestedTmntId = tmntId,
  loadStatus = "succeeded",
  error = null,
  tmntFullData = mockTmntFullData,
}: SetupOptions = {}) => {
  mockUseSelector.mockImplementation((selector) => {
    if (selector === getTmntFullDataRequestedTmntId) {
      return requestedTmntId;
    }

    if (selector === getTmntFullDataLoadStatus) {
      return loadStatus;
    }

    if (selector === getTmntFullDataError) {
      return error;
    }

    if (selector === selectTmntFullData) {
      return tmntFullData;
    }

    return undefined;
  });

  return render(<TmntPlayersPage />);
};

/**
 * Returns the displayed player rows.
 *
 * Each returned string has the format:
 *
 * "Last Name|First Name|Average|Lane"
 */
const getDisplayedPlayerRows = (): string[] => {
  const table = screen.getByRole("table");
  const rows = within(table).getAllByRole("row").slice(1);

  return rows.map((row) => {
    const cells = within(row).getAllByRole("cell");

    return cells
      .map((cell) => cell.textContent ?? "")
      .join("|");
  });
};

describe("TmntPlayersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDispatch.mockReturnValue(mockDispatch);

    mockUseParams.mockReturnValue({
      tmntId,
    });
  });  

  describe("page infrastructure", () => {
    it("renders the tournament header", () => {
      setup();

      expect(screen.getByTestId("tmnt-home-header")).toBeInTheDocument();
    });

    it("renders the player table", () => {
      setup();

      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("renders the sortable column headers", () => {
      setup();

      expect(
        screen.getByRole("button", {
          name: "Last Name",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "First Name",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Ave",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Lane",
        }),
      ).toBeInTheDocument();
    });

    it("renders all eight players", () => {
      setup();

      const table = screen.getByRole("table");

      /*
       * One header row plus eight player rows.
       */
      expect(
        within(table).getAllByRole("row"),
      ).toHaveLength(9);
    });

    it("does not render bye players", () => {
      const tmntFullDataWithBye = {
        ...mockTmntFullData,
        ...mockByePlayer,
      };

      setup({tmntFullData: tmntFullDataWithBye});

      expect(screen.queryByText("Bye")).not.toBeInTheDocument();

      /*
      * One header row plus eight real player rows.
      */
      expect(
        within(screen.getByRole("table")).getAllByRole("row"),
      ).toHaveLength(9);
    });    
  });

  describe("sorting", () => {
    it("initially sorts players by last name", () => {
      setup();

      expect(getDisplayedPlayerRows()).toEqual([
        "Doe|Jane|210|29-B",
        "Doe|Jill|190|30-B",
        "Doe|Joe|200|30-A",
        "Doe|John|220|29-A",
        "Smith|Terri|191|31-B",
        "Smith|Tina|201|32-A",
        "Smith|Tom|221|31-A",
        "Smith|Tony|211|31-B",
      ]);
    });

    it("sorts players by first name when First Name is clicked", () => {
      setup();

      fireEvent.click(
        screen.getByRole("button", {
          name: "First Name",
        }),
      );

      expect(getDisplayedPlayerRows()).toEqual([
        "Doe|Jane|210|29-B",
        "Doe|Jill|190|30-B",
        "Doe|Joe|200|30-A",
        "Doe|John|220|29-A",
        "Smith|Terri|191|31-B",
        "Smith|Tina|201|32-A",
        "Smith|Tom|221|31-A",
        "Smith|Tony|211|31-B",
      ]);
    });

    it("sorts players by average high to low when Ave is clicked", () => {
      setup();

      fireEvent.click(
        screen.getByRole("button", {
          name: "Ave",
        }),
      );

      expect(getDisplayedPlayerRows()).toEqual([
        "Smith|Tom|221|31-A",
        "Doe|John|220|29-A",
        "Smith|Tony|211|31-B",
        "Doe|Jane|210|29-B",
        "Smith|Tina|201|32-A",
        "Doe|Joe|200|30-A",
        "Smith|Terri|191|31-B",
        "Doe|Jill|190|30-B",
      ]);
    });

    it("sorts players by lane position when Lane is clicked", () => {
      setup();

      fireEvent.click(
        screen.getByRole("button", {
          name: "Lane",
        }),
      );

      expect(getDisplayedPlayerRows()).toEqual([
        "Doe|John|220|29-A",
        "Doe|Jane|210|29-B",
        "Doe|Joe|200|30-A",
        "Doe|Jill|190|30-B",
        "Smith|Tom|221|31-A",
        "Smith|Terri|191|31-B",
        "Smith|Tony|211|31-B",
        "Smith|Tina|201|32-A",
      ]);
    });

    it("can change from one sort to another", () => {
      setup();

      fireEvent.click(
        screen.getByRole("button", {
          name: "Ave",
        }),
      );

      expect(getDisplayedPlayerRows()[0]).toBe("Smith|Tom|221|31-A");

      fireEvent.click(
        screen.getByRole("button", {
          name: "Last Name",
        }),
      );

      expect(getDisplayedPlayerRows()).toEqual([
        "Doe|Jane|210|29-B",
        "Doe|Jill|190|30-B",
        "Doe|Joe|200|30-A",
        "Doe|John|220|29-A",
        "Smith|Terri|191|31-B",
        "Smith|Tina|201|32-A",
        "Smith|Tom|221|31-A",
        "Smith|Tony|211|31-B",
      ]);
    });
  });

  describe("loading tournament data", () => {
    it("does not fetch tournament data when the correct tournament is loaded", () => {
      setup();

      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("fetches tournament data when the loaded tournament is different", () => {
      const differentTmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "tmt_different",
        },
      };

      setup({
        requestedTmntId: "",
        loadStatus: "idle",
        tmntFullData: differentTmntData,
      });

      expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("does not fetch again while tournament data is loading", () => {
      const differentTmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        requestedTmntId: tmntId,
        loadStatus: "loading",
        tmntFullData: differentTmntData,
      });

      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  describe("load errors", () => {
    it("displays the missing data error", () => {
      const emptyTmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        requestedTmntId: tmntId,
        loadStatus: "failed",
        error: "missing required child",
        tmntFullData: emptyTmntData,
      });

      expect(
        screen.getByText("Unable to load tournament"),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          `Tournament with id: ${tmntId} is missing data.`,
        ),
      ).toBeInTheDocument();
    });

    it("displays the general tournament load error", () => {
      const emptyTmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        requestedTmntId: tmntId,
        loadStatus: "failed",
        error: "database error",
        tmntFullData: emptyTmntData,
      });

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`,
        ),
      ).toBeInTheDocument();
    });

    it("fetches the tournament again when Retry is clicked", () => {
      const emptyTmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        requestedTmntId: tmntId,
        loadStatus: "failed",
        error: "database error",
        tmntFullData: emptyTmntData,
      });

      /*
       * The useEffect must not automatically retry a failed
       * request for this tournament.
       */
      expect(mockFetchTmntFullData).not.toHaveBeenCalled();

      fireEvent.click(
        screen.getByRole("button", {
          name: "Retry",
        }),
      );

      expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("displays the general tournament load error when error is null", () => {
      const emptyTmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        requestedTmntId: tmntId,
        loadStatus: "failed",
        error: null,
        tmntFullData: emptyTmntData,
      });

      expect(
        screen.getByText("Unable to load tournament"),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`,
        ),
      ).toBeInTheDocument();
    });    
  });
});