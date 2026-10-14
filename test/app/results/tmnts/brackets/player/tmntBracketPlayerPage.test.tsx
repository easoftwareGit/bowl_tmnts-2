// test/app/results/tmnts/brackets/player/tmntBracketPlayerPage.test.tsx
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { useParams } from "next/navigation";
import PlayerBrktProgressPage from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import PlayerDivBrkts from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerDivBrackets";
import AllBrktsSummary from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/allBrktsSummary";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { fullName } from "@/lib/getName";
import type { ioStatusType } from "@/redux/statusTypes";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import type { BracketList } from "@/components/brackets/bracketListClass";
import type { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  brktId1,
  brktId2,
  tmntId,
  playerId1,
  playerId8,
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

// the page imports the Syncfusion licence for its side effect only
jest.mock("@/lib/syncfusion-license", () => ({}));

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
  })
);

jest.mock(
  "@/redux/features/tmntFullData/brktListRecordsSelector",
  () => ({
    getBrktListRecordsWithResults: (s: MockState) => s.brktListRecords,
  })
);

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

jest.mock(
  "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerDivBrackets",
  () => ({
    __esModule: true,
    default: jest.fn(({ playerId }: { playerId: string }) => (
      <div data-testid="player-div-brkts">{playerId}</div>
    )),
  })
);

// has its own tests; here it only shows that it was rendered, and its props are read from mock.calls
jest.mock(
  "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/allBrktsSummary",
  () => ({
    __esModule: true,
    default: jest.fn(({ playerName }: { playerName: string }) => (
      <div data-testid="all-brkts-summary">{playerName}</div>
    )),
  })
);

const mockedUseParams = useParams as jest.Mock;
const mockedUseTmntFullData = useTmntFullData as jest.Mock;
const mockedFetchResults = fetchOneTmntGameResults as unknown as jest.Mock;
const mockedHeader = TmntHomeHeader as unknown as jest.Mock;
const mockedPlayerDivBrkts = PlayerDivBrkts as unknown as jest.Mock;
const mockedSummary = AllBrktsSummary as unknown as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players, brkts } = mockTmntFullData;
const OTHER_TMNT_ID = "tmt_differentid00000000000000000000";
const UNKNOWN_PLAYER = "ply_unknown000000000000000000000000";

const viewer = players[7]; // player 8, Terri Smith: in both brackets
const viewerName = fullName(viewer.first_name, viewer.last_name);
const refundPlayer = players[0]; // player 1
const refundPlayerName = fullName(
  refundPlayer.first_name,
  refundPlayer.last_name
);

/***********************/
/* bracket list fakes  */
/***********************/
// the page only passes the lists on, so a list needs nothing but an id
const fakeList = (brktId: string) => ({ brktId }) as unknown as BracketList;

const makeRecords = (): brktListRecord => ({
  [brktId1]: fakeList(brktId1),
  [brktId2]: fakeList(brktId2),
});

let brktListRecords: brktListRecord;

const setRecords = (records: brktListRecord = makeRecords()) => {
  brktListRecords = records;
  mockState.brktListRecords = brktListRecords;
};

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
    ...overrides,
  };
};

const setParams = (playerId: string = playerId8) =>
  mockedUseParams.mockReturnValue({ tmntId, playerId });

const renderPage = () => render(<PlayerBrktProgressPage />);

// the tournament with only the bracket entries the filter keeps
const withEntries = (
  keep: (entry: tmntFullType["brktEntries"][number]) => boolean
): tmntFullType => ({
  ...mockTmntFullData,
  brktEntries: mockTmntFullData.brktEntries.filter(keep),
});

// the tournament with one bracket's settings changed
const withBrkt = (
  brktId: string,
  overrides: Record<string, unknown>,
  base: tmntFullType = mockTmntFullData
): tmntFullType =>
  ({
    ...base,
    brkts: base.brkts.map((b) =>
      b.id === brktId ? { ...b, ...overrides } : b
    ),
  }) as unknown as tmntFullType;

type PlayerDivProps = {
  playerId: string;
  tmntFullData: tmntFullType;
  brktList: BracketList;
};

type SummaryProps = {
  tmntFullData: tmntFullType;
  brktListRecords: brktListRecord;
  playerId: string;
  playerName: string;
  brktIds: string[];
};

// const playerDivCalls = () =>
//   mockedPlayerDivBrkts.mock.calls.map((c) => c[0] as PlayerDivProps);

// the props of the last render's PlayerDivBrkts calls, one per bracket shown
const playerDivCalls = () => {
  const all = mockedPlayerDivBrkts.mock.calls.map((c) => c[0] as PlayerDivProps);
  const shown = screen.queryAllByTestId("player-div-brkts").length;
  return all.slice(all.length - shown);
};

const lastSummaryProps = () =>
  mockedSummary.mock.calls[mockedSummary.mock.calls.length - 1][0] as SummaryProps;

describe("PlayerBrktProgressPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {} as MockState;
    setParams();
    setRecords();
    setHook();
    setResultsState();
  });

  describe("fixture sanity check", () => {
    it("the mock tournament has two brackets, in sort order 1 and 2", () => {
      expect(brkts).toHaveLength(2);
      expect(brkts[0].id).toBe(brktId1);
      expect(brkts[0].sort_order).toBe(1);
      expect(brkts[1].id).toBe(brktId2);
      expect(brkts[1].sort_order).toBe(2);
    });

    it("player 8 and player 1 are each entered in both brackets", () => {
      [playerId8, playerId1].forEach((pId) => {
        [brktId1, brktId2].forEach((bId) => {
          expect(
            mockTmntFullData.brktEntries.some(
              (e) => e.player_id === pId && e.brkt_id === bId
            )
          ).toBe(true);
        });
      });
    });

    it("player 8 is Terri Smith", () => {
      expect(viewerName.trim()).toBe("Terri Smith");
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
      setResultsState({ loadedTmntId: "", loadStatus: "idle" });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "results/fetch",
        payload: tmntId,
      });
    });

    it("fetches the results when a different tournament's results are loaded", () => {
      setResultsState({ loadedTmntId: OTHER_TMNT_ID });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
    });

    it("does not fetch the results while a request is already loading", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading" });
      renderPage();

      expect(mockedFetchResults).not.toHaveBeenCalled();
    });

    it("does not fetch the results again when the request for this tournament failed", () => {
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: tmntId,
      });
      renderPage();

      expect(mockedFetchResults).not.toHaveBeenCalled();
    });

    it("fetches the results when a previous failure was for a different tournament", () => {
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: OTHER_TMNT_ID,
      });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
    });

    it("requests the results even while the tournament is still loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      setResultsState({ loadedTmntId: "", loadStatus: "idle" });
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
      expect(screen.queryByTestId("player-div-brkts")).not.toBeInTheDocument();
      expect(screen.queryByTestId("all-brkts-summary")).not.toBeInTheDocument();
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
      expect(screen.queryByTestId("player-div-brkts")).not.toBeInTheDocument();
      expect(screen.queryByTestId("all-brkts-summary")).not.toBeInTheDocument();
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
      });

    it("shows the wait modal while the results are loading", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading" });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("player-div-brkts")).not.toBeInTheDocument();
      expect(screen.queryByTestId("all-brkts-summary")).not.toBeInTheDocument();
    });

    it("shows the wait modal when only a different tournament's results are loaded", () => {
      setResultsState({ loadedTmntId: OTHER_TMNT_ID });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("player-div-brkts")).not.toBeInTheDocument();
    });

    it("shows the results error from the slice when loading the results failed", () => {
      setResultsFailed("Games service down");
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(screen.getByText("Games service down")).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("player-div-brkts")).not.toBeInTheDocument();
      expect(screen.queryByTestId("all-brkts-summary")).not.toBeInTheDocument();
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

  describe("player not found", () => {
    beforeEach(() => {
      setParams(UNKNOWN_PLAYER);
    });

    it("shows a player not found message with the player's id", () => {
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Player not found" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `No player with ID ${UNKNOWN_PLAYER} was found in this tournament.`
        )
      ).toBeInTheDocument();
    });

    it("keeps the tournament header, with Brackets selected", () => {
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Brackets");
    });

    it("does not render any bracket or summary", () => {
      renderPage();

      expect(mockedPlayerDivBrkts).not.toHaveBeenCalled();
      expect(mockedSummary).not.toHaveBeenCalled();
      expect(screen.queryByText(/Bracket Progress for/)).not.toBeInTheDocument();
    });

    it("shows the wait modal, not the message, while the results are loading", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading" });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByText("Player not found")).not.toBeInTheDocument();
    });

    it("shows the message when the tournament has no players", () => {
      setHook({ data: { ...mockTmntFullData, players: [] } });
      setParams(playerId8);
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Player not found" })
      ).toBeInTheDocument();
    });

    it("shows player not found before any bracket data problem", () => {
      setHook({ data: withBrkt(brktId1, { fee: "abc" }) });
      renderPage();

      expect(screen.getByText("Player not found")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("bracket data problems", () => {
    const problems: [string, Record<string, unknown>, string][] = [
      ["the fee is not a number", { fee: "abc" }, "Bracket fee not found."],
      [
        "the first amount is not a number",
        { first: "abc" },
        "Bracket first amount not found.",
      ],
      [
        "the second amount is not a number",
        { second: "abc" },
        "Bracket second amount not found.",
      ],
    ];

    it.each(problems)(
      "shows the problem, in a danger alert, when %s",
      (_label, overrides, message) => {
        setHook({ data: withBrkt(brktId1, overrides) });
        renderPage();

        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent(message);
        expect(alert).toHaveClass("alert", "alert-danger");
      }
    );

    it.each(problems)(
      "shows the header and nothing else when %s",
      (_label, overrides) => {
        setHook({ data: withBrkt(brktId1, overrides) });
        renderPage();

        expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Brackets");
        expect(screen.getAllByRole("alert")).toHaveLength(1);
        expect(screen.queryByText(/Bracket Progress for/)).not.toBeInTheDocument();
        expect(mockedPlayerDivBrkts).not.toHaveBeenCalled();
        expect(mockedSummary).not.toHaveBeenCalled();
      }
    );

    it("shows only the first problem in a bracket: the fee before the first and second amounts", () => {
      setHook({
        data: withBrkt(brktId1, { fee: "abc", first: "abc", second: "abc" }),
      });
      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent("Bracket fee not found.");
    });

    it("shows the problem of the first bracket in sort order when both brackets have one", () => {
      const data = withBrkt(
        brktId2,
        { first: "abc" },
        withBrkt(brktId1, { fee: "abc" })
      );
      setHook({ data });
      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent("Bracket fee not found.");
    });

    it("follows the sort order, not the order the brackets are stored in", () => {
      const swapped = withBrkt(brktId2, { sort_order: 1, first: "abc" });
      const data = withBrkt(brktId1, { sort_order: 2, fee: "abc" }, swapped);
      setHook({ data });
      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Bracket first amount not found."
      );
    });

    it("ignores a problem in a bracket the player has no entry in", () => {
      const data = withBrkt(
        brktId2,
        { fee: "abc" },
        withEntries((e) => !(e.player_id === playerId8 && e.brkt_id === brktId2))
      );
      setHook({ data });
      renderPage();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getAllByTestId("player-div-brkts")).toHaveLength(1);
    });

    it("shows the wait modal, not the problem, while the results are loading", () => {
      setHook({ data: withBrkt(brktId1, { fee: "abc" }) });
      setResultsState({ loadedTmntId: "", loadStatus: "loading" });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows no problem for the mock data", () => {
      renderPage();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("header and title", () => {
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

    it("renders the title with the player's name", () => {
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: /Bracket Progress for/ })
      ).toHaveTextContent(`Bracket Progress for ${viewerName}`);
    });

    it("renders the title for a different player", () => {
      setParams(playerId1);
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: /Bracket Progress for/ })
      ).toHaveTextContent(`Bracket Progress for ${refundPlayerName}`);
    });

    it("does not render a wait modal or an error when everything is loaded", () => {
      renderPage();

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
      expect(screen.queryByText("Player not found")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("renders the outer and inner wrappers, with the brackets inside the inner one", () => {
      renderPage();

      const outer = screen.getByTestId("BrktProgressOuterWrapper");
      const inner = screen.getByTestId("BrktProgressInnerWrapper");
      expect(outer).toHaveClass("player-brkt-progress-outer");
      expect(inner).toHaveClass("player-brkt-progress-inner");
      expect(within(outer).getByTestId("BrktProgressInnerWrapper")).toBe(inner);
      expect(within(inner).getAllByTestId("player-div-brkts")).toHaveLength(2);
    });
  });

  describe("the brackets", () => {
    it("renders one PlayerDivBrkts for each bracket the player is entered in", () => {
      renderPage();

      expect(screen.getAllByTestId("player-div-brkts")).toHaveLength(brkts.length);
    });

    it("passes the player's id, the tournament and the bracket's own list to each", () => {
      renderPage();

      const calls = playerDivCalls();
      expect(calls).toHaveLength(2);
      calls.forEach((props) => {
        expect(props.playerId).toBe(playerId8);
        expect(props.tmntFullData).toBe(mockTmntFullData);
      });
      expect(calls[0].brktList).toBe(brktListRecords[brktId1]);
      expect(calls[1].brktList).toBe(brktListRecords[brktId2]);
    });

    it("gives each bracket a different list", () => {
      renderPage();

      const calls = playerDivCalls();
      expect(calls[0].brktList).not.toBe(calls[1].brktList);
    });

    it("renders the brackets in sort order, not in the order they are stored", () => {
      setHook({
        data: {
          ...mockTmntFullData,
          brkts: [...mockTmntFullData.brkts].reverse(),
        },
      });
      renderPage();

      const calls = playerDivCalls();
      expect(calls[0].brktList).toBe(brktListRecords[brktId1]);
      expect(calls[1].brktList).toBe(brktListRecords[brktId2]);
    });

    it("follows a changed sort order", () => {
      setHook({
        data: {
          ...mockTmntFullData,
          brkts: mockTmntFullData.brkts.map((b) => ({
            ...b,
            sort_order: b.id === brktId1 ? 2 : 1,
          })),
        },
      });
      renderPage();

      const calls = playerDivCalls();
      expect(calls[0].brktList).toBe(brktListRecords[brktId2]);
      expect(calls[1].brktList).toBe(brktListRecords[brktId1]);
    });

    it("does not reorder the tournament's own brackets", () => {
      const reversed = [...mockTmntFullData.brkts].reverse();
      const ids = reversed.map((b) => b.id);
      setHook({ data: { ...mockTmntFullData, brkts: reversed } });

      renderPage();

      expect(reversed.map((b) => b.id)).toEqual(ids);
    });

    it("skips a bracket that has no list", () => {
      setRecords({ [brktId1]: fakeList(brktId1) } as brktListRecord);
      renderPage();

      const calls = playerDivCalls();
      expect(calls).toHaveLength(1);
      expect(calls[0].brktList).toBe(brktListRecords[brktId1]);
    });

    it("renders only the brackets the player has an entry in", () => {
      setHook({
        data: withEntries(
          (e) => !(e.player_id === playerId8 && e.brkt_id === brktId2)
        ),
      });
      renderPage();

      const calls = playerDivCalls();
      expect(calls).toHaveLength(1);
      expect(calls[0].brktList).toBe(brktListRecords[brktId1]);
    });

    it("ignores other players' entries", () => {
      setHook({
        data: withEntries(
          (e) => e.player_id !== playerId8 || e.brkt_id === brktId1
        ),
      });
      renderPage();

      expect(playerDivCalls()).toHaveLength(1);
    });

    it("renders no brackets, but shows the title and a message, when the tournament has none", () => {
      setHook({ data: { ...mockTmntFullData, brkts: [] } });
      renderPage();

      expect(screen.queryByTestId("player-div-brkts")).not.toBeInTheDocument();
      expect(screen.queryByTestId("BrktProgressOuterWrapper")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 4, name: /Bracket Progress for/ })
      ).toBeInTheDocument();
      expect(
        screen.getByText("No brackets are available for this tournament.")
      ).toBeInTheDocument();
    });

    it("shows a message, not an empty box, when the player is in no brackets", () => {
      setHook({ data: withEntries((e) => e.player_id !== playerId8) });
      renderPage();

      expect(screen.queryByTestId("player-div-brkts")).not.toBeInTheDocument();
      expect(screen.queryByTestId("BrktProgressOuterWrapper")).not.toBeInTheDocument();
      expect(
        screen.getByText(`${viewerName.trim()} is not entered in any brackets.`)
      ).toBeInTheDocument();
      expect(
        screen.queryByText("No brackets are available for this tournament.")
      ).not.toBeInTheDocument();
    });

    it("keeps the title and the header when the player is in no brackets", () => {
      setHook({ data: withEntries((e) => e.player_id !== playerId8) });
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Brackets");
      expect(
        screen.getByRole("heading", { level: 4, name: /Bracket Progress for/ })
      ).toBeInTheDocument();
    });

    it("does not show a no brackets message when the player has brackets", () => {
      renderPage();

      expect(screen.queryByText(/is not entered in any brackets/)).not.toBeInTheDocument();
      expect(screen.queryByText(/No brackets are available/)).not.toBeInTheDocument();
    });
  });

  describe("the summary of all the player's brackets", () => {
    it("renders the summary once", () => {
      renderPage();

      expect(screen.getAllByTestId("all-brkts-summary")).toHaveLength(1);
    });

    it("renders it below the brackets, inside the outer wrapper but not the inner one", () => {
      renderPage();

      const outer = screen.getByTestId("BrktProgressOuterWrapper");
      const inner = screen.getByTestId("BrktProgressInnerWrapper");
      expect(within(outer).getByTestId("all-brkts-summary")).toBeInTheDocument();
      expect(within(inner).queryByTestId("all-brkts-summary")).not.toBeInTheDocument();
    });

    it("passes the tournament, the bracket lists, the player and the player's name", () => {
      renderPage();

      const props = lastSummaryProps();
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.brktListRecords).toBe(brktListRecords);
      expect(props.playerId).toBe(playerId8);
      expect(props.playerName).toBe(viewerName);
    });

    it("passes the ids of the brackets the player is in, in sort order", () => {
      renderPage();

      expect(lastSummaryProps().brktIds).toEqual([brktId1, brktId2]);
    });

    it("passes the ids in sort order, not in the order the brackets are stored", () => {
      setHook({
        data: {
          ...mockTmntFullData,
          brkts: [...mockTmntFullData.brkts].reverse(),
        },
      });
      renderPage();

      expect(lastSummaryProps().brktIds).toEqual([brktId1, brktId2]);
    });

    it("follows a changed sort order", () => {
      setHook({
        data: {
          ...mockTmntFullData,
          brkts: mockTmntFullData.brkts.map((b) => ({
            ...b,
            sort_order: b.id === brktId1 ? 2 : 1,
          })),
        },
      });
      renderPage();

      expect(lastSummaryProps().brktIds).toEqual([brktId2, brktId1]);
    });

    it("passes only the brackets the player has an entry in", () => {
      setHook({
        data: withEntries(
          (e) => !(e.player_id === playerId8 && e.brkt_id === brktId2)
        ),
      });
      renderPage();

      expect(lastSummaryProps().brktIds).toEqual([brktId1]);
    });

    it("still passes a bracket that has no list, and lets the summary skip it", () => {
      setRecords({ [brktId1]: fakeList(brktId1) } as brktListRecord);
      renderPage();

      expect(lastSummaryProps().brktIds).toEqual([brktId1, brktId2]);
      expect(playerDivCalls()).toHaveLength(1);
    });

    it("passes the details of a different player", () => {
      setParams(playerId1);
      renderPage();

      const props = lastSummaryProps();
      expect(props.playerId).toBe(playerId1);
      expect(props.playerName).toBe(refundPlayerName);
      expect(screen.getByTestId("all-brkts-summary")).toHaveTextContent(
        refundPlayerName.trim()
      );
    });

    it("does not render it for a tournament with no brackets", () => {
      setHook({ data: { ...mockTmntFullData, brkts: [] } });
      renderPage();

      expect(mockedSummary).not.toHaveBeenCalled();
      expect(screen.queryByTestId("all-brkts-summary")).not.toBeInTheDocument();
    });

    it("does not render it when the player is in no brackets", () => {
      setHook({ data: withEntries((e) => e.player_id !== playerId8) });
      renderPage();

      expect(mockedSummary).not.toHaveBeenCalled();
      expect(screen.queryByTestId("all-brkts-summary")).not.toBeInTheDocument();
    });

    it("does not render it while the results are loading", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading" });
      renderPage();

      expect(mockedSummary).not.toHaveBeenCalled();
    });
  });

  describe("re-rendering", () => {
    it("shows the page once the results have loaded", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading" });
      const { rerender } = renderPage();
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("all-brkts-summary")).not.toBeInTheDocument();

      setResultsState();
      rerender(<PlayerBrktProgressPage />);

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.getAllByTestId("player-div-brkts")).toHaveLength(2);
      expect(screen.getByTestId("all-brkts-summary")).toBeInTheDocument();
    });

    it("passes the new bracket lists to the summary when they change", () => {
      const { rerender } = renderPage();
      const first = lastSummaryProps().brktListRecords;

      const next = makeRecords();
      setRecords(next);
      rerender(<PlayerBrktProgressPage />);

      expect(first).not.toBe(next);
      expect(lastSummaryProps().brktListRecords).toBe(next);
    });
  });
});