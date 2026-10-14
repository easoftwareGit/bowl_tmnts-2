import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { useParams } from "next/navigation";
import TmntPlayerScoresPage from "@/app/results/tmnt/[tmntId]/standings/div/[divId]/player/[playerId]/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { getGameNums } from "@/components/tmnts/games";
import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import type { ioStatusType } from "@/redux/statusTypes";
import {
  tgrGameKey,
  tgrHdcpKey,
  type tmntGameResult,
} from "@/lib/types/resultsTypes";
import type { divDataType, playerType, tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  mockGames,
  tmntId,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

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

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/hooks/useTmntFullData", () => ({
  useTmntFullData: jest.fn(),
}));

jest.mock("@/components/tmnts/games", () => ({
  getGameNums: jest.fn(),
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

const mockedUseParams = useParams as jest.Mock;
const mockedUseTmntFullData = useTmntFullData as jest.Mock;
const mockedGetGameNums = getGameNums as jest.Mock;
const mockedFetchResults = fetchOneTmntGameResults as unknown as jest.Mock;
const mockedHeader = TmntHomeHeader as unknown as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players } = mockTmntFullData;
const [scratchDiv, hdcpDiv]: divDataType[] = mockTmntFullData.divs;
const [player1, player2] = players;

const GAME_NUMS = [1, 2, 3, 4, 5, 6];
const OTHER_TMNT_ID = "tmt_differentid00000000000000000000";
const UNKNOWN_DIV_ID = "div_unknown000000000000000000000000";
const UNKNOWN_PLAYER_ID = "ply_unknown000000000000000000000000";

const scoresFor = (playerId: string): number[] =>
  mockGames
    .filter((g) => g.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num)
    .map((g) => g.score);

/**
 * Builds one game result from a mock player, a division and that player's
 * mock scores (or the scores passed in). Handicap is only used in a
 * handicap division; in a scratch division "total + Hdcp" equals total.
 */
const buildResult = (
  p: playerType,
  div: divDataType,
  scores: (number | null)[] = scoresFor(p.id)
): tmntGameResult => {
  const hdcp =
    div.hdcp_per > 0
      ? Math.floor(div.hdcp_per * (div.hdcp_from - p.average))
      : 0;
  const played = scores.filter((s) => s != null).length;
  const total = scores.reduce<number>((sum, s) => sum + (s ?? 0), 0);
  const totalHdcp = hdcp * played;

  const result: Record<string, unknown> = {
    player_id: p.id,
    div_id: div.id,
    div_name: div.div_name,
    sort_order: div.sort_order,
    full_name: `${p.first_name} ${p.last_name}`,
    average: p.average,
    hdcp,
    total,
    total_hdcp: totalHdcp,
    "total + Hdcp": total + totalHdcp,
  };
  scores.forEach((score, i) => {
    result[tgrGameKey(i + 1)] = score;
    result[tgrHdcpKey(i + 1)] = score == null ? null : score + hdcp;
  });
  return result as unknown as tmntGameResult;
};

// two players, each in both divisions
const allResults = [
  buildResult(player1, scratchDiv),
  buildResult(player2, scratchDiv),
  buildResult(player1, hdcpDiv),
  buildResult(player2, hdcpDiv),
];

/***********/
/* helpers */
/***********/
const retryMock = jest.fn();

// the real hook returns a blank tournament object while nothing is loaded
const blankTmntData = (): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "" },
  divs: [],
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
    results: allResults,
    ...overrides,
  };
};

const setParams = ({
  divId = hdcpDiv.id,
  playerId = player1.id,
}: { divId?: string; playerId?: string } = {}) => {
  mockedUseParams.mockReturnValue({ tmntId, divId, playerId });
};

const renderPage = () => render(<TmntPlayerScoresPage />);

const getRows = () => screen.getAllByRole("row");

const headerTexts = () =>
  within(getRows()[0])
    .getAllByRole("columnheader")
    .map((header) => header.textContent);

// text of each cell in a body row; the &nbsp; spacer cells become ""
const cellTexts = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => (cell.textContent ?? "").replace(/\u00a0/g, ""));

describe("TmntPlayerScoresPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetGameNums.mockReturnValue(GAME_NUMS);
    setParams();
    setHook();
    setResultsState();
  });

  describe("fixture sanity check", () => {
    it("mock divisions are one scratch (hdcp_per 0) and one handicap (hdcp_per > 0)", () => {
      expect(scratchDiv.hdcp_per).toBe(0);
      expect(hdcpDiv.hdcp_per).toBeGreaterThan(0);
    });

    it("builds the expected numbers for player 1 from the mock games", () => {
      const result = buildResult(player1, hdcpDiv) as unknown as Record<
        string,
        unknown
      >;

      // 201 + 202 + 203 + 252 + 182 + 185; handicap 9 per game (average 220)
      expect(result.total).toBe(1225);
      expect(result.hdcp).toBe(9);
      expect(result.total_hdcp).toBe(54);
      expect(result["total + Hdcp"]).toBe(1279);
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

  describe("header", () => {
    it("renders the header with the tournament data and no selected button", () => {
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("None");
      const props = mockedHeader.mock.calls[0][0] as {
        tmntFullData: tmntFullType;
        selectedTmntPageBtn: string;
      };
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedTmntPageBtn).toBe("None");
    });

    it("does not render a wait modal or an error when everything is loaded", () => {
      renderPage();

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
    });
  });

  describe("handicap division", () => {
    beforeEach(() => {
      setParams({ divId: hdcpDiv.id, playerId: player1.id });
    });

    it("renders the handicap columns", () => {
      renderPage();

      expect(headerTexts()).toEqual([
        "Ave",
        "Hdcp",
        "Name",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "Scratch",
        "Hdcp",
        "Total",
      ]);
    });

    it("renders two Hdcp headers, the player's handicap and the total handicap", () => {
      renderPage();

      expect(screen.getAllByRole("columnheader", { name: "Hdcp" })).toHaveLength(2);
    });

    it("renders a header row and three body rows", () => {
      renderPage();

      expect(getRows()).toHaveLength(4);
    });

    it("renders the player's average, handicap, name, scores and totals in the first row", () => {
      renderPage();

      expect(cellTexts(getRows()[1])).toEqual([
        "220", // average
        "9", // handicap per game
        "John Doe",
        "201",
        "202",
        "203",
        "252",
        "182",
        "185",
        "1225", // scratch total
        "54", // total handicap
        "1279", // total + handicap
      ]);
    });

    it("renders the per game handicap and the total handicap in the second row", () => {
      renderPage();

      expect(cellTexts(getRows()[2])).toEqual([
        "",
        "per game hdcp",
        "9",
        "9",
        "9",
        "9",
        "9",
        "9",
        "54",
      ]);
    });

    it("renders each game score plus handicap and the grand total in the third row", () => {
      renderPage();

      expect(cellTexts(getRows()[3])).toEqual([
        "",
        "Total",
        "210",
        "211",
        "212",
        "261",
        "191",
        "194",
        "1279",
      ]);
    });

    it("leaves games with no score blank and totals only the games bowled", () => {
      // games 5 and 6 not bowled yet: total 858, handicap 4 * 9 = 36, total + hdcp 894
      setResultsState({
        results: [
          buildResult(player1, hdcpDiv, [201, 202, 203, 252, null, null]),
        ],
      });
      renderPage();

      const rows = getRows();
      expect(cellTexts(rows[1])).toEqual([
        "220",
        "9",
        "John Doe",
        "201",
        "202",
        "203",
        "252",
        "",
        "",
        "858",
        "36",
        "894",
      ]);
      expect(cellTexts(rows[2])).toEqual([
        "",
        "per game hdcp",
        "9",
        "9",
        "9",
        "9",
        "",
        "",
        "36",
      ]);
      expect(cellTexts(rows[3])).toEqual([
        "",
        "Total",
        "210",
        "211",
        "212",
        "261",
        "",
        "",
        "894",
      ]);
    });
  });

  describe("scratch division", () => {
    beforeEach(() => {
      setParams({ divId: scratchDiv.id, playerId: player1.id });
    });

    it("renders only the name, game and total columns", () => {
      renderPage();

      expect(headerTexts()).toEqual([
        "Name",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "Total",
      ]);
      expect(screen.queryByRole("columnheader", { name: "Ave" })).not.toBeInTheDocument();
      expect(screen.queryByRole("columnheader", { name: "Hdcp" })).not.toBeInTheDocument();
      expect(screen.queryByRole("columnheader", { name: "Scratch" })).not.toBeInTheDocument();
    });

    it("renders a header row and a single body row", () => {
      renderPage();

      expect(getRows()).toHaveLength(2);
      expect(screen.queryByText("per game hdcp")).not.toBeInTheDocument();
    });

    it("renders the player's name, scores and total", () => {
      renderPage();

      expect(cellTexts(getRows()[1])).toEqual([
        "John Doe",
        "201",
        "202",
        "203",
        "252",
        "182",
        "185",
        "1225",
      ]);
    });
  });

  describe("choosing the player's result", () => {
    it("uses the result for the division in the route", () => {
      // player 1 is in both divisions: 1225 scratch, 1279 with handicap
      setParams({ divId: scratchDiv.id, playerId: player1.id });
      const { unmount } = renderPage();
      const scratchRow = cellTexts(getRows()[1]);
      expect(scratchRow[scratchRow.length - 1]).toBe("1225");
      unmount();

      setParams({ divId: hdcpDiv.id, playerId: player1.id });
      renderPage();
      const hdcpRow = cellTexts(getRows()[1]);
      expect(hdcpRow[hdcpRow.length - 1]).toBe("1279");
    });

    it("uses the result for the player in the route", () => {
      setParams({ divId: scratchDiv.id, playerId: player2.id });
      renderPage();

      // Jane Doe: 210 + 211 + 212 + 265 + 202 + 186
      expect(cellTexts(getRows()[1])).toEqual([
        "Jane Doe",
        "210",
        "211",
        "212",
        "265",
        "202",
        "186",
        "1286",
      ]);
    });

  });

  describe("game columns", () => {
    it("asks getGameNums for the game numbers of the results", () => {
      renderPage();

      expect(mockedGetGameNums).toHaveBeenCalledWith(allResults);
    });

    it("renders only the game columns returned by getGameNums", () => {
      mockedGetGameNums.mockReturnValue([1, 2, 3]);
      setParams({ divId: scratchDiv.id, playerId: player1.id });
      renderPage();

      expect(headerTexts()).toEqual(["Name", "1", "2", "3", "Total"]);
      expect(cellTexts(getRows()[1])).toEqual([
        "John Doe",
        "201",
        "202",
        "203",
        "1225",
      ]);
    });

    it("renders no game columns when getGameNums returns none", () => {
      mockedGetGameNums.mockReturnValue([]);
      setParams({ divId: scratchDiv.id, playerId: player1.id });
      renderPage();

      expect(headerTexts()).toEqual(["Name", "Total"]);
    });
  });

  describe("bad links", () => {
    const expectBackLink = () => {
      expect(
        screen.getByRole("link", { name: "Back to standings" })
      ).toHaveAttribute("href", `/results/tmnt/${tmntId}/standings`);
    };

    describe("division not found", () => {
      it("shows a division not found message when the division is not in the tournament", () => {
        setParams({ divId: UNKNOWN_DIV_ID, playerId: player1.id });
        renderPage();

        expect(
          screen.getByRole("heading", { level: 4, name: "Division not found" })
        ).toBeInTheDocument();
        expect(
          screen.getByText(`This tournament has no division with id: ${UNKNOWN_DIV_ID}.`)
        ).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
      });

      it("keeps the header, with no selected button, and links back to the standings", () => {
        setParams({ divId: UNKNOWN_DIV_ID, playerId: player1.id });
        renderPage();

        expect(screen.getByTestId("tmnt-header")).toHaveTextContent("None");
        expectBackLink();
      });

      it("shows division not found when the tournament has no divisions", () => {
        setHook({ data: { ...mockTmntFullData, divs: [] } });
        setParams({ divId: hdcpDiv.id, playerId: player1.id });
        renderPage();

        expect(
          screen.getByRole("heading", { level: 4, name: "Division not found" })
        ).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
      });

      it("reports the division, not the player, when both ids are wrong", () => {
        setParams({ divId: UNKNOWN_DIV_ID, playerId: UNKNOWN_PLAYER_ID });
        renderPage();

        expect(
          screen.getByRole("heading", { level: 4, name: "Division not found" })
        ).toBeInTheDocument();
        expect(
          screen.queryByText("Player results not found")
        ).not.toBeInTheDocument();
      });
    });

    describe("player results not found", () => {
      it("shows a player not found message when the player has no results", () => {
        setParams({ divId: scratchDiv.id, playerId: UNKNOWN_PLAYER_ID });
        renderPage();

        expect(
          screen.getByRole("heading", { level: 4, name: "Player results not found" })
        ).toBeInTheDocument();
        expect(
          screen.getByText("No results were found for this player in this division.")
        ).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
      });

      it("keeps the header, with no selected button, and links back to the standings", () => {
        setParams({ divId: scratchDiv.id, playerId: UNKNOWN_PLAYER_ID });
        renderPage();

        expect(screen.getByTestId("tmnt-header")).toHaveTextContent("None");
        expectBackLink();
      });

      it("shows player not found when the tournament has no results", () => {
        setResultsState({ results: [] });
        setParams({ divId: scratchDiv.id, playerId: player1.id });
        renderPage();

        expect(
          screen.getByRole("heading", { level: 4, name: "Player results not found" })
        ).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
      });

      it("shows player not found when the player only has results in a different division", () => {
        setResultsState({ results: [buildResult(player1, scratchDiv)] });
        setParams({ divId: hdcpDiv.id, playerId: player1.id });
        renderPage();

        expect(
          screen.getByRole("heading", { level: 4, name: "Player results not found" })
        ).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
      });
    });

    describe("not shown before the data has loaded", () => {
      it("shows the wait modal, not a bad link message, while the results are loading", () => {
        setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
        setParams({ divId: UNKNOWN_DIV_ID, playerId: UNKNOWN_PLAYER_ID });
        renderPage();

        expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
        expect(screen.queryByText("Division not found")).not.toBeInTheDocument();
        expect(screen.queryByText("Player results not found")).not.toBeInTheDocument();
      });

      it("shows the wait modal, not a bad link message, while the tournament is loading", () => {
        setHook({ data: blankTmntData(), hasData: false });
        setParams({ divId: UNKNOWN_DIV_ID, playerId: UNKNOWN_PLAYER_ID });
        renderPage();

        expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
        expect(screen.queryByText("Division not found")).not.toBeInTheDocument();
      });
    });

    it("renders the table, with no message, when the division and player are both found", () => {
      setParams({ divId: scratchDiv.id, playerId: player1.id });
      renderPage();

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.queryByText("Division not found")).not.toBeInTheDocument();
      expect(screen.queryByText("Player results not found")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Back to standings" })
      ).not.toBeInTheDocument();
    });
  });  
});
