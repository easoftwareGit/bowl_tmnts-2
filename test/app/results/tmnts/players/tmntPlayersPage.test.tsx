// test/app/results/tmnts/players/tmntPlayersPage.test.tsx
// tests src/app/results/tmnt/[tmntId]/players/page.tsx
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useParams } from "next/navigation";
import TmntPlayersPage from "@/app/results/tmnt/[tmntId]/players/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import type { playerType, tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  mockByePlayer,
  tmntId,
  squadId1,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/**************************/
/* mocks for dependencies */
/**************************/
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/hooks/useTmntFullData", () => ({
  useTmntFullData: jest.fn(),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? <div data-testid="wait-modal">{message}</div> : null,
}));

jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => ({
  __esModule: true,
  default: jest.fn(
    ({ selectedTmntPageBtn }: { selectedTmntPageBtn: string }) => (
      <div data-testid="tmnt-header">{selectedTmntPageBtn}</div>
    )
  ),
}));

const mockedUseParams = jest.mocked(useParams);
const mockedUseTmntFullData = jest.mocked(useTmntFullData);
const mockedHeader = jest.mocked(TmntHomeHeader);

/***********/
/* helpers */
/***********/
type HookResult = ReturnType<typeof useTmntFullData>;
type RetryFn = HookResult["retry"];

const retryMock = jest.fn<ReturnType<RetryFn>, Parameters<RetryFn>>();

// the hook always returns a tmntFullType (never null); before the tmnt is
// loaded it is a blank tmnt with no players.
const blankTmntData = (): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "" },
  players: [],
});

type HookState = {
  data?: tmntFullType;
  hasData?: boolean;
  failed?: boolean;
  error?: string;
};

const setHook = ({
  data = mockTmntFullData,
  hasData = true,
  failed = false,
  error,
}: HookState = {}) => {
  mockedUseTmntFullData.mockReturnValue({
    data,
    hasData,
    failed,
    error,
    retry: retryMock,
  });
};

const setLoading = () => {
  setHook({ data: blankTmntData(), hasData: false, failed: false });
};

const setFailed = (error?: string) => {
  setHook({ data: blankTmntData(), hasData: false, failed: true, error });
};

const withPlayers = (players: playerType[]): tmntFullType => ({
  ...mockTmntFullData,
  players,
});

const getPlayer = (index: number): playerType => {
  const player = mockTmntFullData.players[index];
  if (!player) {
    throw new Error(`mockTmntFullData has no player at index ${String(index)}`);
  }
  return player;
};

/**
 * Builds an extra (non bye) player for sort tests.
 */
const makePlayer = (
  idSuffix: string,
  first_name: string,
  last_name: string,
  average: number,
  lane: number,
  position: string
): playerType => ({
  ...getPlayer(0),
  id: `ply_extra${idSuffix}`,
  squad_id: squadId1,
  first_name,
  last_name,
  average,
  lane,
  position,
});

const renderPage = () => render(<TmntPlayersPage />);

const getTable = () => screen.getByRole("table");

/**
 * Returns the displayed player rows (header row excluded), each in the
 * format "Last Name|First Name|Average|Lane".
 */
const getDisplayedPlayerRows = (): string[] => {
  const rows = within(getTable()).getAllByRole("row").slice(1);
  return rows.map((row) =>
    within(row)
      .getAllByRole("cell")
      .map((cell) => cell.textContent)
      .join("|")
  );
};

const clickSort = (name: "Last Name" | "First Name" | "Ave" | "Lane") => {
  fireEvent.click(screen.getByRole("button", { name }));
};

const genericErrMsg = `An error occurred while loading the tournament with id: ${tmntId}.`;
const missingDataMsg = `Tournament with id: ${tmntId} is missing data.`;

/*
 * Expected rows for the mock players. Note that Tony Smith and Terri Smith
 * are BOTH on lane 31-B in the mock data, which exercises the lane tie-break.
 */
const byLastName = [
  "Doe|Jane|210|29-B",
  "Doe|Jill|190|30-B",
  "Doe|Joe|200|30-A",
  "Doe|John|220|29-A",
  "Smith|Terri|191|31-B",
  "Smith|Tina|201|32-A",
  "Smith|Tom|221|31-A",
  "Smith|Tony|211|31-B",
];

const byAverage = [
  "Smith|Tom|221|31-A",
  "Doe|John|220|29-A",
  "Smith|Tony|211|31-B",
  "Doe|Jane|210|29-B",
  "Smith|Tina|201|32-A",
  "Doe|Joe|200|30-A",
  "Smith|Terri|191|31-B",
  "Doe|Jill|190|30-B",
];

const byLane = [
  "Doe|John|220|29-A",
  "Doe|Jane|210|29-B",
  "Doe|Joe|200|30-A",
  "Doe|Jill|190|30-B",
  "Smith|Tom|221|31-A",
  "Smith|Terri|191|31-B",
  "Smith|Tony|211|31-B",
  "Smith|Tina|201|32-A",
];

describe("TmntPlayersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    setHook();
  });

  describe("fixture sanity check", () => {
    it("mock data has eight real players and no bye players", () => {
      expect(mockTmntFullData.players).toHaveLength(8);
      expect(
        mockTmntFullData.players.every((p) => p.id.startsWith("ply"))
      ).toBe(true);
    });

    it("bye player id does not start with 'ply'", () => {
      expect(mockByePlayer.id.startsWith("ply")).toBe(false);
      expect(mockByePlayer.first_name).toBe("Bye");
    });
  });

  describe("data loading", () => {
    it("requests the tournament data using the tmntId from the route params", () => {
      renderPage();
      expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("shows the wait modal while loading, with no header, table or Retry", () => {
      setLoading();
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    });

    it("does not call retry while loading", () => {
      setLoading();
      renderPage();
      expect(retryMock).not.toHaveBeenCalled();
    });
  });

  describe("load errors", () => {
    it("shows the missing data message when the error mentions a missing required child", () => {
      setFailed("Tmnt is missing required child: events");
      renderPage();

      expect(
        screen.getByRole("heading", { name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(screen.getByText(missingDataMsg)).toBeInTheDocument();
      expect(screen.queryByText(genericErrMsg)).not.toBeInTheDocument();
    });

    it("shows the generic message for any other error", () => {
      setFailed("database error");
      renderPage();

      expect(
        screen.getByRole("heading", { name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(screen.getByText(genericErrMsg)).toBeInTheDocument();
      expect(screen.queryByText(missingDataMsg)).not.toBeInTheDocument();
    });

    it("shows the generic message when failed and there is no error text", () => {
      setFailed(undefined);
      renderPage();
      expect(screen.getByText(genericErrMsg)).toBeInTheDocument();
    });

    it("shows the generic message when failed and the error text is empty", () => {
      setFailed("");
      renderPage();
      expect(screen.getByText(genericErrMsg)).toBeInTheDocument();
    });

    it("uses the route tmntId in the error message", () => {
      const routeId = "tmt_routeid00000000000000000000000";
      mockedUseParams.mockReturnValue({ tmntId: routeId });
      setFailed("database error");
      renderPage();

      expect(mockedUseTmntFullData).toHaveBeenCalledWith(routeId);
      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${routeId}.`
        )
      ).toBeInTheDocument();
    });

    it("does not show the header, table or wait modal on error", () => {
      setFailed("database error");
      renderPage();

      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("does not call retry until the Retry button is clicked", () => {
      setFailed("database error");
      renderPage();
      expect(retryMock).not.toHaveBeenCalled();
    });

    it("calls retry with no arguments each time the Retry button is clicked", () => {
      setFailed("database error");
      renderPage();

      const retryBtn = screen.getByRole("button", { name: "Retry" });
      fireEvent.click(retryBtn);
      expect(retryMock).toHaveBeenCalledTimes(1);
      expect(retryMock).toHaveBeenCalledWith();

      fireEvent.click(retryBtn);
      expect(retryMock).toHaveBeenCalledTimes(2);
    });

    it("renders the players table instead of the error when data exists even if failed is true", () => {
      setHook({ hasData: true, failed: true, error: "stale error" });
      renderPage();

      expect(getTable()).toBeInTheDocument();
      expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    });
  });

  describe("page layout", () => {
    it("renders the tournament header with the Players button selected", () => {
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Players");
      expect(mockedHeader).toHaveBeenCalled();
      const props = mockedHeader.mock.lastCall?.[0];
      expect(props?.tmntFullData).toBe(mockTmntFullData);
      expect(props?.selectedTmntPageBtn).toBe("Players");
    });

    it("does not show the wait modal or Retry once data is loaded", () => {
      renderPage();

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    });

    it("renders the four sortable column header buttons in order", () => {
      renderPage();

      const headerRow = within(getTable()).getAllByRole("row")[0];
      if (!headerRow) {
        throw new Error("table has no header row");
      }
      const headers = within(headerRow).getAllByRole("columnheader");
      expect(headers).toHaveLength(4);
      expect(headers.map((h) => h.textContent)).toEqual([
        "Last Name",
        "First Name",
        "Ave",
        "Lane",
      ]);
      for (const name of ["Last Name", "First Name", "Ave", "Lane"]) {
        expect(within(headerRow).getByRole("button", { name })).toHaveAttribute(
          "type",
          "button"
        );
      }
    });

    it("renders one row per player plus the header row", () => {
      renderPage();
      expect(within(getTable()).getAllByRole("row")).toHaveLength(9);
    });

    it("shows last name, first name, average and lane-position for each player", () => {
      renderPage();

      const firstPlayer = getPlayer(0); // John Doe, 220, lane 29 A
      const row = screen.getByRole("row", { name: /John/ });
      const cells = within(row).getAllByRole("cell");
      expect(cells.map((c) => c.textContent)).toEqual([
        firstPlayer.last_name,
        firstPlayer.first_name,
        String(firstPlayer.average),
        `${String(firstPlayer.lane)}-${firstPlayer.position}`,
      ]);
    });

    it("does not render bye players", () => {
      setHook({
        data: withPlayers([...mockTmntFullData.players, mockByePlayer]),
      });
      renderPage();

      expect(screen.queryByText("Bye")).not.toBeInTheDocument();
      expect(within(getTable()).getAllByRole("row")).toHaveLength(9);
      expect(getDisplayedPlayerRows()).toEqual(byLastName);
    });

    it("renders only the header row when the tournament has no players", () => {
      setHook({ data: withPlayers([]) });
      renderPage();

      expect(within(getTable()).getAllByRole("row")).toHaveLength(1);
    });

    it("does not change the order of the players in the tournament data", () => {
      const playerIds = mockTmntFullData.players.map((p) => p.id);
      renderPage();
      clickSort("Ave");
      clickSort("Lane");

      expect(mockTmntFullData.players.map((p) => p.id)).toEqual(playerIds);
    });
  });

  describe("sorting", () => {
    it("initially sorts players by last name, then first name", () => {
      renderPage();
      expect(getDisplayedPlayerRows()).toEqual(byLastName);
    });

    it("sorts players by first name, then last name, when First Name is clicked", () => {
      // with the mock players alone, the first name order equals the last
      // name order, so add players whose first and last names flip the order
      setHook({
        data: withPlayers([
          ...mockTmntFullData.players,
          makePlayer("1", "Al", "Zed", 180, 32, "B"),
          makePlayer("2", "Zack", "Abel", 170, 33, "A"),
          makePlayer("3", "Al", "Baker", 160, 33, "B"),
        ]),
      });
      renderPage();

      expect(getDisplayedPlayerRows()).toEqual([
        "Abel|Zack|170|33-A",
        "Baker|Al|160|33-B",
        ...byLastName,
        "Zed|Al|180|32-B",
      ]);

      clickSort("First Name");

      expect(getDisplayedPlayerRows()).toEqual([
        "Baker|Al|160|33-B",
        "Zed|Al|180|32-B",
        "Doe|Jane|210|29-B",
        "Doe|Jill|190|30-B",
        "Doe|Joe|200|30-A",
        "Doe|John|220|29-A",
        "Smith|Terri|191|31-B",
        "Smith|Tina|201|32-A",
        "Smith|Tom|221|31-A",
        "Smith|Tony|211|31-B",
        "Abel|Zack|170|33-A",
      ]);
    });

    it("sorts players by average high to low when Ave is clicked", () => {
      renderPage();
      clickSort("Ave");
      expect(getDisplayedPlayerRows()).toEqual(byAverage);
    });

    it("sorts players by lane position, then last name, then first name, when Lane is clicked", () => {
      renderPage();
      clickSort("Lane");
      // Terri and Tony Smith share 31-B; Terri sorts first by first name
      expect(getDisplayedPlayerRows()).toEqual(byLane);
    });

    it("sorts lanes numerically, not alphabetically (9 before 10)", () => {
      setHook({
        data: withPlayers([
          makePlayer("1", "Al", "Ames", 200, 10, "A"),
          makePlayer("2", "Bo", "Bell", 200, 9, "A"),
          makePlayer("3", "Cy", "Cole", 200, 100, "A"),
          makePlayer("4", "Di", "Dunn", 200, 1, "B"),
        ]),
      });
      renderPage();
      clickSort("Lane");

      expect(getDisplayedPlayerRows()).toEqual([
        "Dunn|Di|200|1-B",
        "Bell|Bo|200|9-A",
        "Ames|Al|200|10-A",
        "Cole|Cy|200|100-A",
      ]);
    });

    it("uses numeric lane order to break a full name tie", () => {
      setHook({
        data: withPlayers([
          makePlayer("1", "Pat", "Lee", 200, 10, "A"),
          makePlayer("2", "Pat", "Lee", 200, 9, "A"),
        ]),
      });
      renderPage();

      expect(getDisplayedPlayerRows()).toEqual([
        "Lee|Pat|200|9-A",
        "Lee|Pat|200|10-A",
      ]);

      clickSort("First Name");
      expect(getDisplayedPlayerRows()).toEqual([
        "Lee|Pat|200|9-A",
        "Lee|Pat|200|10-A",
      ]);

      clickSort("Ave");
      expect(getDisplayedPlayerRows()).toEqual([
        "Lee|Pat|200|9-A",
        "Lee|Pat|200|10-A",
      ]);
    });

    it("can change from one sort to another and back", () => {
      renderPage();

      clickSort("Ave");
      expect(getDisplayedPlayerRows()).toEqual(byAverage);

      clickSort("Lane");
      expect(getDisplayedPlayerRows()).toEqual(byLane);

      clickSort("Last Name");
      expect(getDisplayedPlayerRows()).toEqual(byLastName);
    });

    it("keeps the same order when the same column is clicked again (no reverse toggle)", () => {
      renderPage();

      clickSort("Ave");
      clickSort("Ave");
      expect(getDisplayedPlayerRows()).toEqual(byAverage);
    });

    it("ignores case when comparing names", () => {
      setHook({
        data: withPlayers([
          makePlayer("1", "bob", "adams", 200, 1, "A"),
          makePlayer("2", "Amy", "Adams", 200, 1, "B"),
          makePlayer("3", "Carl", "ADAMS", 200, 2, "A"),
        ]),
      });
      renderPage();

      // last names tie (case ignored), so first name decides
      expect(getDisplayedPlayerRows()).toEqual([
        "Adams|Amy|200|1-B",
        "adams|bob|200|1-A",
        "ADAMS|Carl|200|2-A",
      ]);
    });

    it("breaks a full name tie by lane position in the last name sort", () => {
      setHook({
        data: withPlayers([
          makePlayer("1", "Pat", "Lee", 200, 2, "A"),
          makePlayer("2", "Pat", "Lee", 190, 1, "B"),
          makePlayer("3", "Pat", "Lee", 210, 1, "A"),
        ]),
      });
      renderPage();

      expect(getDisplayedPlayerRows()).toEqual([
        "Lee|Pat|210|1-A",
        "Lee|Pat|190|1-B",
        "Lee|Pat|200|2-A",
      ]);
    });

    it("breaks a full name tie by lane position in the first name sort", () => {
      setHook({
        data: withPlayers([
          makePlayer("1", "Pat", "Lee", 200, 2, "A"),
          makePlayer("2", "Pat", "Lee", 210, 1, "A"),
        ]),
      });
      renderPage();
      clickSort("First Name");

      expect(getDisplayedPlayerRows()).toEqual([
        "Lee|Pat|210|1-A",
        "Lee|Pat|200|2-A",
      ]);
    });

    it("breaks a name and lane tie by average high to low", () => {
      setHook({
        data: withPlayers([
          makePlayer("1", "Pat", "Lee", 190, 1, "A"),
          makePlayer("2", "Pat", "Lee", 210, 1, "A"),
        ]),
      });
      renderPage();

      expect(getDisplayedPlayerRows()).toEqual([
        "Lee|Pat|210|1-A",
        "Lee|Pat|190|1-A",
      ]);
    });

    it("breaks an average tie by last name, then first name", () => {
      setHook({
        data: withPlayers([
          makePlayer("1", "Zoe", "Abel", 200, 1, "A"),
          makePlayer("2", "Amy", "Zed", 200, 1, "B"),
          makePlayer("3", "Amy", "Baker", 200, 2, "A"),
        ]),
      });
      renderPage();
      clickSort("Ave");

      expect(getDisplayedPlayerRows()).toEqual([
        "Abel|Zoe|200|1-A",
        "Baker|Amy|200|2-A",
        "Zed|Amy|200|1-B",
      ]);
    });

    it("breaks an average and name tie by lane position", () => {
      setHook({
        data: withPlayers([
          makePlayer("1", "Pat", "Lee", 200, 2, "A"),
          makePlayer("2", "Pat", "Lee", 200, 1, "B"),
        ]),
      });
      renderPage();
      clickSort("Ave");

      expect(getDisplayedPlayerRows()).toEqual([
        "Lee|Pat|200|1-B",
        "Lee|Pat|200|2-A",
      ]);
    });
  });
});


// // test/app/results/tmnts/players/tmntPlayersPage.test.tsx
// // tests src/app/results/tmnt/[tmntId]/players/page.tsx
// import React from "react";
// import { fireEvent, render, screen, within } from "@testing-library/react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "next/navigation";
// import TmntPlayersPage from "@/app/results/tmnt/[tmntId]/players/page";
// import {
//   fetchTmntFullData,
//   getTmntFullDataError,
//   getTmntFullDataLoadStatus,
//   getTmntFullDataRequestedTmntId,
//   selectTmntFullData,
// } from "@/redux/features/tmntFullData/tmntFullDataSlice";
// import {
//   mockTmntFullData,
//   tmntId,
//   mockByePlayer,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// jest.mock("react-redux", () => ({
//   useDispatch: jest.fn(),
//   useSelector: jest.fn(),
// }));

// jest.mock("next/navigation", () => ({
//   useParams: jest.fn(),
// }));

// jest.mock(
//   "@/redux/features/tmntFullData/tmntFullDataSlice",
//   () => ({
//     fetchTmntFullData: jest.fn(),
//     getTmntFullDataError: jest.fn(),
//     getTmntFullDataLoadStatus: jest.fn(),
//     getTmntFullDataRequestedTmntId: jest.fn(),
//     selectTmntFullData: jest.fn(),
//   }),
// );

// jest.mock("@/components/modal/waitModal", () => {
//   return function MockWaitModal({
//     show,
//     message,
//   }: {
//     show: boolean;
//     message: string;
//   }) {
//     return show ? <div>{message}</div> : null;
//   };
// });

// jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => {
//   return function MockTmntHomeHeader() {
//     return <div data-testid="tmnt-home-header" />;
//   };
// });

// const mockUseDispatch = useDispatch as jest.MockedFunction<
//   typeof useDispatch
// >;

// const mockUseSelector = useSelector as jest.MockedFunction<
//   typeof useSelector
// >;

// const mockUseParams = useParams as jest.MockedFunction<
//   typeof useParams
// >;

// const mockFetchTmntFullData =
//   fetchTmntFullData as jest.MockedFunction<
//     typeof fetchTmntFullData
//   >;

// const mockDispatch = jest.fn();

// type SetupOptions = {
//   requestedTmntId?: string;
//   loadStatus?: string;
//   error?: string | null;
//   tmntFullData?: typeof mockTmntFullData;
// };

// const setup = ({
//   requestedTmntId = tmntId,
//   loadStatus = "succeeded",
//   error = null,
//   tmntFullData = mockTmntFullData,
// }: SetupOptions = {}) => {
//   mockUseSelector.mockImplementation((selector) => {
//     if (selector === getTmntFullDataRequestedTmntId) {
//       return requestedTmntId;
//     }

//     if (selector === getTmntFullDataLoadStatus) {
//       return loadStatus;
//     }

//     if (selector === getTmntFullDataError) {
//       return error;
//     }

//     if (selector === selectTmntFullData) {
//       return tmntFullData;
//     }

//     return undefined;
//   });

//   return render(<TmntPlayersPage />);
// };

// /**
//  * Returns the displayed player rows.
//  *
//  * Each returned string has the format:
//  *
//  * "Last Name|First Name|Average|Lane"
//  */
// const getDisplayedPlayerRows = (): string[] => {
//   const table = screen.getByRole("table");
//   const rows = within(table).getAllByRole("row").slice(1);

//   return rows.map((row) => {
//     const cells = within(row).getAllByRole("cell");

//     return cells
//       .map((cell) => cell.textContent ?? "")
//       .join("|");
//   });
// };

// describe("TmntPlayersPage", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();

//     mockUseDispatch.mockReturnValue(mockDispatch);

//     mockUseParams.mockReturnValue({
//       tmntId,
//     });
//   });  

//   describe("page infrastructure", () => {
//     it("renders the tournament header", () => {
//       setup();

//       expect(screen.getByTestId("tmnt-home-header")).toBeInTheDocument();
//     });

//     it("renders the player table", () => {
//       setup();

//       expect(screen.getByRole("table")).toBeInTheDocument();
//     });

//     it("renders the sortable column headers", () => {
//       setup();

//       expect(
//         screen.getByRole("button", {
//           name: "Last Name",
//         }),
//       ).toBeInTheDocument();

//       expect(
//         screen.getByRole("button", {
//           name: "First Name",
//         }),
//       ).toBeInTheDocument();

//       expect(
//         screen.getByRole("button", {
//           name: "Ave",
//         }),
//       ).toBeInTheDocument();

//       expect(
//         screen.getByRole("button", {
//           name: "Lane",
//         }),
//       ).toBeInTheDocument();
//     });

//     it("renders all eight players", () => {
//       setup();

//       const table = screen.getByRole("table");

//       /*
//        * One header row plus eight player rows.
//        */
//       expect(
//         within(table).getAllByRole("row"),
//       ).toHaveLength(9);
//     });

//     it("does not render bye players", () => {
//       const tmntFullDataWithBye = {
//         ...mockTmntFullData,
//         ...mockByePlayer,
//       };

//       setup({tmntFullData: tmntFullDataWithBye});

//       expect(screen.queryByText("Bye")).not.toBeInTheDocument();

//       /*
//       * One header row plus eight real player rows.
//       */
//       expect(
//         within(screen.getByRole("table")).getAllByRole("row"),
//       ).toHaveLength(9);
//     });    
//   });

//   describe("sorting", () => {
//     it("initially sorts players by last name", () => {
//       setup();

//       expect(getDisplayedPlayerRows()).toEqual([
//         "Doe|Jane|210|29-B",
//         "Doe|Jill|190|30-B",
//         "Doe|Joe|200|30-A",
//         "Doe|John|220|29-A",
//         "Smith|Terri|191|31-B",
//         "Smith|Tina|201|32-A",
//         "Smith|Tom|221|31-A",
//         "Smith|Tony|211|31-B",
//       ]);
//     });

//     it("sorts players by first name when First Name is clicked", () => {
//       setup();

//       fireEvent.click(
//         screen.getByRole("button", {
//           name: "First Name",
//         }),
//       );

//       expect(getDisplayedPlayerRows()).toEqual([
//         "Doe|Jane|210|29-B",
//         "Doe|Jill|190|30-B",
//         "Doe|Joe|200|30-A",
//         "Doe|John|220|29-A",
//         "Smith|Terri|191|31-B",
//         "Smith|Tina|201|32-A",
//         "Smith|Tom|221|31-A",
//         "Smith|Tony|211|31-B",
//       ]);
//     });

//     it("sorts players by average high to low when Ave is clicked", () => {
//       setup();

//       fireEvent.click(
//         screen.getByRole("button", {
//           name: "Ave",
//         }),
//       );

//       expect(getDisplayedPlayerRows()).toEqual([
//         "Smith|Tom|221|31-A",
//         "Doe|John|220|29-A",
//         "Smith|Tony|211|31-B",
//         "Doe|Jane|210|29-B",
//         "Smith|Tina|201|32-A",
//         "Doe|Joe|200|30-A",
//         "Smith|Terri|191|31-B",
//         "Doe|Jill|190|30-B",
//       ]);
//     });

//     it("sorts players by lane position when Lane is clicked", () => {
//       setup();

//       fireEvent.click(
//         screen.getByRole("button", {
//           name: "Lane",
//         }),
//       );

//       expect(getDisplayedPlayerRows()).toEqual([
//         "Doe|John|220|29-A",
//         "Doe|Jane|210|29-B",
//         "Doe|Joe|200|30-A",
//         "Doe|Jill|190|30-B",
//         "Smith|Tom|221|31-A",
//         "Smith|Terri|191|31-B",
//         "Smith|Tony|211|31-B",
//         "Smith|Tina|201|32-A",
//       ]);
//     });

//     it("can change from one sort to another", () => {
//       setup();

//       fireEvent.click(
//         screen.getByRole("button", {
//           name: "Ave",
//         }),
//       );

//       expect(getDisplayedPlayerRows()[0]).toBe("Smith|Tom|221|31-A");

//       fireEvent.click(
//         screen.getByRole("button", {
//           name: "Last Name",
//         }),
//       );

//       expect(getDisplayedPlayerRows()).toEqual([
//         "Doe|Jane|210|29-B",
//         "Doe|Jill|190|30-B",
//         "Doe|Joe|200|30-A",
//         "Doe|John|220|29-A",
//         "Smith|Terri|191|31-B",
//         "Smith|Tina|201|32-A",
//         "Smith|Tom|221|31-A",
//         "Smith|Tony|211|31-B",
//       ]);
//     });
//   });

//   describe("loading tournament data", () => {
//     it("does not fetch tournament data when the correct tournament is loaded", () => {
//       setup();

//       expect(mockFetchTmntFullData).not.toHaveBeenCalled();
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("fetches tournament data when the loaded tournament is different", () => {
//       const differentTmntData = {
//         ...mockTmntFullData,
//         tmnt: {
//           ...mockTmntFullData.tmnt,
//           id: "tmt_different",
//         },
//       };

//       setup({
//         requestedTmntId: "",
//         loadStatus: "idle",
//         tmntFullData: differentTmntData,
//       });

//       expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//     });

//     it("does not fetch again while tournament data is loading", () => {
//       const differentTmntData = {
//         ...mockTmntFullData,
//         tmnt: {
//           ...mockTmntFullData.tmnt,
//           id: "",
//         },
//       };

//       setup({
//         requestedTmntId: tmntId,
//         loadStatus: "loading",
//         tmntFullData: differentTmntData,
//       });

//       expect(mockFetchTmntFullData).not.toHaveBeenCalled();
//       expect(mockDispatch).not.toHaveBeenCalled();
//       expect(screen.getByText("Loading...")).toBeInTheDocument();
//       expect(screen.queryByRole("table")).not.toBeInTheDocument();
//     });
//   });

//   describe("load errors", () => {
//     it("displays the missing data error", () => {
//       const emptyTmntData = {
//         ...mockTmntFullData,
//         tmnt: {
//           ...mockTmntFullData.tmnt,
//           id: "",
//         },
//       };

//       setup({
//         requestedTmntId: tmntId,
//         loadStatus: "failed",
//         error: "missing required child",
//         tmntFullData: emptyTmntData,
//       });

//       expect(
//         screen.getByText("Unable to load tournament"),
//       ).toBeInTheDocument();

//       expect(
//         screen.getByText(
//           `Tournament with id: ${tmntId} is missing data.`,
//         ),
//       ).toBeInTheDocument();
//     });

//     it("displays the general tournament load error", () => {
//       const emptyTmntData = {
//         ...mockTmntFullData,
//         tmnt: {
//           ...mockTmntFullData.tmnt,
//           id: "",
//         },
//       };

//       setup({
//         requestedTmntId: tmntId,
//         loadStatus: "failed",
//         error: "database error",
//         tmntFullData: emptyTmntData,
//       });

//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`,
//         ),
//       ).toBeInTheDocument();
//     });

//     it("fetches the tournament again when Retry is clicked", () => {
//       const emptyTmntData = {
//         ...mockTmntFullData,
//         tmnt: {
//           ...mockTmntFullData.tmnt,
//           id: "",
//         },
//       };

//       setup({
//         requestedTmntId: tmntId,
//         loadStatus: "failed",
//         error: "database error",
//         tmntFullData: emptyTmntData,
//       });

//       /*
//        * The useEffect must not automatically retry a failed
//        * request for this tournament.
//        */
//       expect(mockFetchTmntFullData).not.toHaveBeenCalled();

//       fireEvent.click(
//         screen.getByRole("button", {
//           name: "Retry",
//         }),
//       );

//       expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//     });

//     it("displays the general tournament load error when error is null", () => {
//       const emptyTmntData = {
//         ...mockTmntFullData,
//         tmnt: {
//           ...mockTmntFullData.tmnt,
//           id: "",
//         },
//       };

//       setup({
//         requestedTmntId: tmntId,
//         loadStatus: "failed",
//         error: null,
//         tmntFullData: emptyTmntData,
//       });

//       expect(
//         screen.getByText("Unable to load tournament"),
//       ).toBeInTheDocument();

//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`,
//         ),
//       ).toBeInTheDocument();
//     });    
//   });
// });

