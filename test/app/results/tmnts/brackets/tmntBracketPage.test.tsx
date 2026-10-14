import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { useParams } from "next/navigation";
import PlayerBrktsPage from "@/app/results/tmnt/[tmntId]/brackets/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import BracketHeader from "@/app/results/tmnt/[tmntId]/brackets/bracketHeader";
import { populatePlayerBrktRows } from "@/app/results/tmnt/[tmntId]/brackets/populatePlayerBrktRows";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { getGameNums } from "@/components/tmnts/games";
import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { lastFirst } from "@/lib/getName";
import type { ioStatusType } from "@/redux/statusTypes";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import type {
  brktGamesTableRow,
  tmntGameResult,
} from "@/lib/types/resultsTypes";
import type { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  mockGames,
  brktId1,
  brktId2,
  divId1,
  tmntId,
  playerId1,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*************************/
/* mocks for dependencies */
/*************************/
type MockState = {
  results: {
    loadedTmntId: string;
    requestedTmntId: string;
    loadStatus: ioStatusType;
    error: string | undefined;
    results: tmntGameResult[];
  };
  brktListRecords: brktListRecord;
};

let mockState = {} as MockState;
const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: MockState) => unknown) =>
    selector(mockState),
}));

// the page only uses the store module for a type
jest.mock("@/redux/store", () => ({}));

jest.mock(
  "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice",
  () => ({
    fetchOneTmntGameResults: jest.fn((id: string) => ({
      type: "results/fetch",
      payload: id,
    })),
    getOneTmntGameResultsError: (s: MockState) => s.results.error,
    getOneTmntGameResultsLoadStatus: (s: MockState) => s.results.loadStatus,
    getOneTmntGameResultsRequestedTmntId: (s: MockState) =>
      s.results.requestedTmntId,
    getOneTmntGameResultsTmntId: (s: MockState) => s.results.loadedTmntId,
    selectOneTmntGameResults: (s: MockState) => s.results.results,
  })
);

jest.mock(
  "@/redux/features/tmntFullData/brktListRecordsSelector",
  () => ({
    getBrktListRecords: (s: MockState) => s.brktListRecords,
  })
);

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/hooks/useTmntFullData", () => ({
  useTmntFullData: jest.fn(),
}));

jest.mock("@/components/tmnts/games", () => ({
  getGameNums: jest.fn(),
}));

jest.mock(
  "@/app/results/tmnt/[tmntId]/brackets/populatePlayerBrktRows",
  () => ({
    populatePlayerBrktRows: jest.fn(),
  })
);

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

jest.mock("@/app/results/tmnt/[tmntId]/brackets/bracketHeader", () => ({
  __esModule: true,
  default: jest.fn(
    ({ selectedBrktPageBtn }: { selectedBrktPageBtn: string }) => (
      <div data-testid="bracket-header">{selectedBrktPageBtn}</div>
    )
  ),
}));

const mockedUseParams = useParams as jest.Mock;
const mockedUseTmntFullData = useTmntFullData as jest.Mock;
const mockedGetGameNums = getGameNums as jest.Mock;
const mockedPopulate = populatePlayerBrktRows as jest.Mock;
const mockedFetchResults = fetchOneTmntGameResults as unknown as jest.Mock;
const mockedHeader = TmntHomeHeader as unknown as jest.Mock;
const mockedBracketHeader = BracketHeader as unknown as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players } = mockTmntFullData;
const GAME_NUMS = [1, 2, 3, 4, 5, 6];
const OTHER_TMNT_ID = "tmt_differentid00000000000000000000";
const NO_BRACKETS_MESSAGE = "No brackets are available for this tournament.";

const pid = (n: number) => players[n - 1].id;

const scoresFor = (playerId: string): number[] =>
  mockGames
    .filter((g) => g.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num)
    .map((g) => g.score);

type RowRecord = Record<string, unknown>;

// one table row for a mock player, as populatePlayerBrktRows would return it
const makeRow = (
  n: number,
  overrides: RowRecord = {}
): brktGamesTableRow => {
  const p = players[n - 1];
  const row: RowRecord = {
    id: p.id,
    player_id: p.id,
    last_first: lastFirst(p.first_name, p.last_name),
    lane: p.lane,
    in: n,
    cash: n === 2 || n === 8 ? "$" : "",
  };
  scoresFor(p.id).forEach((score, i) => {
    row[`Game ${i + 1}`] = score;
  });
  return { ...row, ...overrides } as unknown as brktGamesTableRow;
};

// rows in the order populatePlayerBrktRows returns them: sorted by name
const NAME_ORDER = [2, 4, 3, 1, 8, 7, 5, 6];
const allRows = NAME_ORDER.map((n) => makeRow(n));

const tmntResults = players.map((p) => ({
  player_id: p.id,
  div_id: divId1,
})) as unknown as tmntGameResult[];

const brktListRecords = {
  [brktId1]: {},
  [brktId2]: {},
} as unknown as brktListRecord;

/***********/
/* helpers */
/***********/
const retryMock = jest.fn();

// the real hook returns a blank tournament object while nothing is loaded
const blankTmntData = (): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "" },
});

type HookState = {
  data?: tmntFullType;
  hasData?: boolean;
  failed?: boolean;
  error?: string | null;
};

const setHook = ({
  data = mockTmntFullData,
  hasData = true,
  failed = false,
  error = null,
}: HookState = {}) => {
  mockedUseTmntFullData.mockReturnValue({
    data,
    hasData,
    failed,
    error,
    retry: retryMock,
  });
};

const setResultsState = (overrides: Partial<MockState["results"]> = {}) => {
  mockState.results = {
    loadedTmntId: tmntId,
    requestedTmntId: tmntId,
    loadStatus: "succeeded",
    error: "",
    results: tmntResults,
    ...overrides,
  };
};

const renderPage = () => render(<PlayerBrktsPage />);

const getRows = () => screen.getAllByRole("row");
const getBodyRows = () => getRows().slice(1);

const headerTexts = () =>
  within(getRows()[0])
    .getAllByRole("columnheader")
    .map((header) => header.textContent);

const cellTexts = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

describe("PlayerBrktsPage (brackets)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    mockedGetGameNums.mockReturnValue(GAME_NUMS);
    mockedPopulate.mockReturnValue(allRows);
    mockState.brktListRecords = brktListRecords;
    setHook();
    setResultsState();
  });

  describe("fixture sanity check", () => {
    it("builds a row for player 2 from the mock player and mock games", () => {
      const row = makeRow(2) as unknown as RowRecord;

      expect(row.id).toBe(pid(2));
      expect(row.last_first).toBe(
        lastFirst(players[1].first_name, players[1].last_name)
      );
      expect(row.lane).toBe(players[1].lane);
      expect(row["Game 1"]).toBe(210);
      expect(row["Game 4"]).toBe(265);
      expect(row["Game 6"]).toBe(186);
    });

    it("mock tournament has brackets", () => {
      expect(mockTmntFullData.brkts.length).toBeGreaterThan(0);
    });
  });

  describe("data requests", () => {
    it("requests the tournament data using the tmntId from the route params", () => {
      renderPage();
      expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("does not request anything when the results are already loaded for this tournament", () => {
      renderPage();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("fetches the results when none are loaded", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "results/fetch",
        payload: tmntId,
      });
    });

    it("fetches the results when a different tournament's results are loaded", () => {
      setResultsState({ loadedTmntId: OTHER_TMNT_ID, results: [] });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
    });

    it("does not fetch the results while a request is already loading", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
      renderPage();

      expect(mockedFetchResults).not.toHaveBeenCalled();
    });

    it("does not fetch the results again when the request for this tournament failed", () => {
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: tmntId,
        results: [],
      });
      renderPage();

      expect(mockedFetchResults).not.toHaveBeenCalled();
    });

    it("fetches the results when a previous failure was for a different tournament", () => {
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: OTHER_TMNT_ID,
        results: [],
      });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
    });

    it("requests the results even while the tournament is still loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe("tournament loading and error", () => {
    it("shows the wait modal while the tournament is loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("does not throw when the hook returns no data while loading", () => {
      mockedUseTmntFullData.mockReturnValue({
        data: undefined,
        hasData: false,
        failed: false,
        error: null,
        retry: retryMock,
      });

      expect(() => renderPage()).not.toThrow();
      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
    });

    it("shows the tournament error when the hook returns no data and failed", () => {
      mockedUseTmntFullData.mockReturnValue({
        data: undefined,
        hasData: false,
        failed: true,
        error: "boom",
        retry: retryMock,
      });
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
    });

    it("shows a generic error message when the tournament failed to load", () => {
      setHook({
        data: blankTmntData(),
        hasData: false,
        failed: true,
        error: "Network error",
      });
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows the generic error message when failed but the error is null", () => {
      setHook({ data: blankTmntData(), hasData: false, failed: true, error: null });
      renderPage();

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("shows the missing data message when the error mentions a missing required child", () => {
      setHook({
        data: blankTmntData(),
        hasData: false,
        failed: true,
        error: "Tournament has a missing required child: events",
      });
      renderPage();

      expect(
        screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
      ).toBeInTheDocument();
    });

    it("calls the hook's retry (and does not dispatch) when Retry is clicked", () => {
      setHook({ data: blankTmntData(), hasData: false, failed: true, error: "boom" });
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));

      expect(retryMock).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe("no brackets", () => {
    const noBracketsData = (): tmntFullType => ({
      ...mockTmntFullData,
      brkts: [],
    });

    it("shows the tournament header and a no brackets message", () => {
      setHook({ data: noBracketsData() });
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Brackets");
      expect(screen.getByText(NO_BRACKETS_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByTestId("bracket-header")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("does not calculate any rows", () => {
      setHook({ data: noBracketsData() });
      renderPage();

      expect(mockedPopulate).not.toHaveBeenCalled();
    });

    it("shows the message without waiting for the results", () => {
      setHook({ data: noBracketsData() });
      setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
      renderPage();

      expect(screen.getByText(NO_BRACKETS_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("shows the message, not a results error, when loading the results failed", () => {
      setHook({ data: noBracketsData() });
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: tmntId,
        error: "Games service down",
        results: [],
      });
      renderPage();

      expect(screen.getByText(NO_BRACKETS_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByText("Games service down")).not.toBeInTheDocument();
    });

    it("shows the wait modal, not the message, while the tournament is loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByText(NO_BRACKETS_MESSAGE)).not.toBeInTheDocument();
    });

    it("does not show the message when the tournament has brackets", () => {
      renderPage();

      expect(screen.queryByText(NO_BRACKETS_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("still shows the table, with only its header row, when there are brackets but no rows", () => {
      mockedPopulate.mockReturnValue([]);
      renderPage();

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(getRows()).toHaveLength(1);
    });
  });

  describe("results loading and error", () => {
    const setResultsFailed = (error: string | undefined) =>
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: tmntId,
        error,
        results: [],
      });

    it("shows the wait modal while the results are loading", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows the wait modal when only a different tournament's results are loaded", () => {
      setResultsState({ loadedTmntId: OTHER_TMNT_ID });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows the results error from the slice when loading the results failed", () => {
      setResultsFailed("Games service down");
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(screen.getByText("Games service down")).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it.each([
      ["undefined", undefined],
      ["an empty string", ""],
    ])("shows a default message when the results error is %s", (_label, error) => {
      setResultsFailed(error);
      renderPage();

      expect(
        screen.getByText(
          `An error occurred while loading games for tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("dispatches fetchOneTmntGameResults when Retry is clicked", () => {
      setResultsFailed("Games service down");
      renderPage();
      expect(mockDispatch).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "results/fetch",
        payload: tmntId,
      });
      expect(retryMock).not.toHaveBeenCalled();
    });

    it("shows the wait modal, not the error, when the failure was for a different tournament", () => {
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: OTHER_TMNT_ID,
        error: "some other error",
        results: [],
      });
      renderPage();

      expect(screen.queryByText("some other error")).not.toBeInTheDocument();
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
    });

    it("shows the tournament error before the results error when both failed", () => {
      setHook({
        data: blankTmntData(),
        hasData: false,
        failed: true,
        error: "Network error",
      });
      setResultsFailed("Games service down");
      renderPage();

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
      expect(screen.queryByText("Games service down")).not.toBeInTheDocument();
    });

    it("shows the wait modal, not the results error, while the tournament is still loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      setResultsFailed("Games service down");
      renderPage();

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByText("Games service down")).not.toBeInTheDocument();
    });
  });

  describe("headers", () => {
    it("renders the tournament header with the tournament data and Brackets selected", () => {
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Brackets");
      const props = mockedHeader.mock.calls[0][0] as {
        tmntFullData: tmntFullType;
        selectedTmntPageBtn: string;
      };
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedTmntPageBtn).toBe("Brackets");
    });

    it("renders the bracket header with the tournament data and Brackets selected", () => {
      renderPage();

      expect(screen.getByTestId("bracket-header")).toHaveTextContent("Brackets");
      const props = mockedBracketHeader.mock.calls[0][0] as {
        tmntFullData: tmntFullType;
        selectedBrktPageBtn: string;
      };
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedBrktPageBtn).toBe("Brackets");
    });

    it("does not render a wait modal or an error when everything is loaded", () => {
      renderPage();

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
    });
  });

  describe("table headers", () => {
    it("renders Lane, Name, $, the game numbers and In, in that order", () => {
      renderPage();

      expect(headerTexts()).toEqual([
        "Lane",
        "Name",
        "$",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "In",
      ]);
    });

    it("renders a header for each game number returned by getGameNums", () => {
      mockedGetGameNums.mockReturnValue([1, 2, 3]);
      renderPage();

      expect(headerTexts()).toEqual(["Lane", "Name", "$", "1", "2", "3", "In"]);
    });

    it("renders no game columns when getGameNums returns none", () => {
      mockedGetGameNums.mockReturnValue([]);
      renderPage();

      expect(headerTexts()).toEqual(["Lane", "Name", "$", "In"]);
    });

    it("asks getGameNums about the tournament's results", () => {
      renderPage();

      expect(mockedGetGameNums).toHaveBeenCalledWith(tmntResults);
    });
  });

  describe("table rows", () => {
    it("renders one body row per row returned by populatePlayerBrktRows", () => {
      renderPage();

      expect(getBodyRows()).toHaveLength(allRows.length);
    });

    it("renders lane, name, cash, the game scores and the in count in each row", () => {
      renderPage();

      // first row is player 2 (Jane Doe), who cashes
      expect(cellTexts(getBodyRows()[0])).toEqual([
        String(players[1].lane),
        lastFirst(players[1].first_name, players[1].last_name),
        "$",
        "210",
        "211",
        "212",
        "265",
        "202",
        "186",
        "2",
      ]);
    });

    it("renders a blank cash cell for a player who does not cash", () => {
      renderPage();

      // fourth row is player 1 (John Doe)
      expect(cellTexts(getBodyRows()[3])).toEqual([
        String(players[0].lane),
        lastFirst(players[0].first_name, players[0].last_name),
        "",
        "201",
        "202",
        "203",
        "252",
        "182",
        "185",
        "1",
      ]);
    });

    it("renders the rows in the order populatePlayerBrktRows returns them", () => {
      renderPage();

      const names = getBodyRows().map((row) => cellTexts(row)[1]);
      expect(names).toEqual(
        NAME_ORDER.map((n) =>
          lastFirst(players[n - 1].first_name, players[n - 1].last_name)
        )
      );
    });

    it("renders the cash cell in the success colour", () => {
      renderPage();

      const cashCell = within(getBodyRows()[0]).getAllByRole("cell")[2];
      expect(cashCell).toHaveClass("text-success");
    });

    it("renders an in count of 0", () => {
      mockedPopulate.mockReturnValue([makeRow(1, { in: 0 })]);
      renderPage();

      const cells = cellTexts(getBodyRows()[0]);
      expect(cells[cells.length - 1]).toBe("0");
    });

    it("renders blank cells for games a player has no score for", () => {
      mockedPopulate.mockReturnValue([
        makeRow(1, { "Game 5": undefined, "Game 6": undefined }),
      ]);
      renderPage();

      expect(cellTexts(getBodyRows()[0])).toEqual([
        String(players[0].lane),
        lastFirst(players[0].first_name, players[0].last_name),
        "",
        "201",
        "202",
        "203",
        "252",
        "",
        "",
        "1",
      ]);
    });

    it("renders only the game columns returned by getGameNums in each row", () => {
      mockedGetGameNums.mockReturnValue([1, 2, 3]);
      renderPage();

      expect(cellTexts(getBodyRows()[0])).toEqual([
        String(players[1].lane),
        lastFirst(players[1].first_name, players[1].last_name),
        "$",
        "210",
        "211",
        "212",
        "2",
      ]);
    });

    it("renders only the header row when there are no rows", () => {
      mockedPopulate.mockReturnValue([]);
      renderPage();

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(getRows()).toHaveLength(1);
      expect(headerTexts()).toContain("Name");
    });
  });

  describe("player links", () => {
    it("links each name to the player's brackets page", () => {
      renderPage();

      const name = lastFirst(players[1].first_name, players[1].last_name);
      expect(screen.getByRole("link", { name })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/brackets/player/${pid(2)}`
      );
    });

    it("renders one link per row, with the row's name as the link text", () => {
      renderPage();

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(allRows.length);
      expect(links.map((link) => link.textContent)).toEqual(
        allRows.map((row) => row.last_first)
      );
    });

    it("uses the player id, not the row id, in the link", () => {
      mockedPopulate.mockReturnValue([makeRow(1, { id: playerId1 })]);
      renderPage();

      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/brackets/player/${pid(1)}`
      );
    });
  });

  describe("building the rows", () => {
    it("passes the results and the bracket lists to populatePlayerBrktRows", () => {
      renderPage();

      expect(mockedPopulate).toHaveBeenCalledWith(tmntResults, brktListRecords);
      expect(mockedPopulate.mock.calls[0][0]).toBe(tmntResults);
      expect(mockedPopulate.mock.calls[0][1]).toBe(brktListRecords);
    });

    it("calculates the rows once on the first render", () => {
      renderPage();

      expect(mockedPopulate).toHaveBeenCalledTimes(1);
    });

    it("does not recalculate the rows when re-rendered with the same data", () => {
      const { rerender } = renderPage();

      rerender(<PlayerBrktsPage />);
      rerender(<PlayerBrktsPage />);

      expect(mockedPopulate).toHaveBeenCalledTimes(1);
    });

    it("recalculates the rows when the results change", () => {
      const { rerender } = renderPage();
      const newResults = [...tmntResults];

      setResultsState({ results: newResults });
      rerender(<PlayerBrktsPage />);

      expect(mockedPopulate).toHaveBeenCalledTimes(2);
      expect(mockedPopulate.mock.calls[1][0]).toBe(newResults);
    });

    it("recalculates the rows when the bracket lists change", () => {
      const { rerender } = renderPage();
      const newRecords = { [brktId1]: {} } as unknown as brktListRecord;

      mockState.brktListRecords = newRecords;
      rerender(<PlayerBrktsPage />);

      expect(mockedPopulate).toHaveBeenCalledTimes(2);
      expect(mockedPopulate.mock.calls[1][1]).toBe(newRecords);
    });

    it("shows the new rows after the rows are recalculated", () => {
      const { rerender } = renderPage();
      expect(getBodyRows()).toHaveLength(8);

      mockedPopulate.mockReturnValue([makeRow(8)]);
      setResultsState({ results: [...tmntResults] });
      rerender(<PlayerBrktsPage />);

      expect(getBodyRows()).toHaveLength(1);
      expect(cellTexts(getBodyRows()[0])[1]).toBe(
        lastFirst(players[7].first_name, players[7].last_name)
      );
    });

    it("does not calculate the rows while the tournament is loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      renderPage();

      expect(mockedPopulate).not.toHaveBeenCalled();
    });

    it("does not calculate the rows while the results are loading", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
      renderPage();

      expect(mockedPopulate).not.toHaveBeenCalled();
    });

    it("does not calculate the rows from another tournament's results", () => {
      setResultsState({ loadedTmntId: OTHER_TMNT_ID });
      renderPage();

      expect(mockedPopulate).not.toHaveBeenCalled();
    });

    it("does not calculate the rows when loading the results failed", () => {
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: tmntId,
        results: [],
      });
      renderPage();

      expect(mockedPopulate).not.toHaveBeenCalled();
    });

    it("calculates the rows once the results have loaded", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
      const { rerender } = renderPage();
      expect(mockedPopulate).not.toHaveBeenCalled();

      setResultsState();
      rerender(<PlayerBrktsPage />);

      expect(mockedPopulate).toHaveBeenCalledTimes(1);
      expect(mockedPopulate).toHaveBeenCalledWith(tmntResults, brktListRecords);
      expect(getBodyRows()).toHaveLength(allRows.length);
    });
  });
});