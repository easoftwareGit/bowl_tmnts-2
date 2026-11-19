/**
 * test/app/results/tmnts/brackets/payouts/tmntBrktPayoutsPage.test.tsx
 * tests src/app/results/tmnt/[tmntId]/brackets/payouts/page.tsx
 *
 * Tournament data (players, brackets, divisions, bracket entries) comes from
 * mockTmntFullData. The bracket lists are fakes: each one only has
 * allBracketsCompleted and playerEarnings, which returns a set amount per
 * player, so the totals, filters and sorts can be checked with known numbers.
 *
 * Rules:
 *   - earnings are only read from a list once allBracketsCompleted() is true;
 *     an incomplete bracket is left out of the totals
 *   - amounts are rounded down to the cent, and the All total is the sum of
 *     the rounded amounts, so it matches the single bracket page
 *     ($10 + $11.66 + $3.33 = $24.99, not $25.00)
 *   - every bracket must have a bracket list; a missing one is an error
 *
 * Earnings used by most tests (player number: bracket 1 + bracket 2 = total):
 *   1 John Doe     0 + 10 = 10
 *   2 Jane Doe    25 + 25 = 50
 *   3 Joe Doe     10 +  0 = 10
 *   4 Jill Doe    35 +  0 = 35
 *   5 Tom Smith    0 + 25 = 25
 *   6 Tony Smith  10 +  0 = 10
 *   7 Tina Smith   0 +  0 =  0  (never shown)
 *   8 Terri Smith 60 + 35 = 95
 */
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useParams } from "next/navigation";
import BracketsPayoutsPage from "@/app/results/tmnt/[tmntId]/brackets/payouts/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import BracketHeader from "@/app/results/tmnt/[tmntId]/brackets/bracketHeader";
import { updateAllBracketMatches } from "@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { getBrktOrElimName, lastFirst } from "@/lib/getName";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import type { BracketList } from "@/components/brackets/bracketListClass";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import type { ioStatusType } from "@/redux/statusTypes";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import type { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  brktId1,
  brktId2,
  divId1,
  tmntId,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/**************************/
/* mocks for dependencies */
/**************************/
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

// filled in by beforeEach
const mockState = {} as MockState;
const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: MockState) => unknown) => selector(mockState),
}));

// the page only uses the store module for a type
jest.mock("@/redux/store", () => ({}));

jest.mock("@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice", () => ({
  fetchOneTmntGameResults: jest.fn((id: string) => ({
    type: "results/fetch",
    payload: id,
  })),
  getOneTmntGameResultsError: (s: MockState) => s.results.error,
  getOneTmntGameResultsLoadStatus: (s: MockState) => s.results.loadStatus,
  getOneTmntGameResultsRequestedTmntId: (s: MockState) => s.results.requestedTmntId,
  getOneTmntGameResultsTmntId: (s: MockState) => s.results.loadedTmntId,
  selectOneTmntGameResults: (s: MockState) => s.results.results,
}));

jest.mock("@/redux/features/tmntFullData/brktListRecordsSelector", () => ({
  getBrktListRecords: (s: MockState) => s.brktListRecords,
}));

jest.mock("@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches", () => ({
  updateAllBracketMatches: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
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
  default: jest.fn(({ selectedTmntPageBtn }: { selectedTmntPageBtn: string }) => (
    <div data-testid="tmnt-header">{selectedTmntPageBtn}</div>
  )),
}));

jest.mock("@/app/results/tmnt/[tmntId]/brackets/bracketHeader", () => ({
  __esModule: true,
  default: jest.fn(({ selectedBrktPageBtn }: { selectedBrktPageBtn: string }) => (
    <div data-testid="bracket-header">{selectedBrktPageBtn}</div>
  )),
}));

const mockedUseParams = jest.mocked(useParams);
const mockedUseTmntFullData = jest.mocked(useTmntFullData);
const mockedUpdateAll = jest.mocked(updateAllBracketMatches);
const mockedFetchResults = jest.mocked(fetchOneTmntGameResults);
const mockedHeader = jest.mocked(TmntHomeHeader);
const mockedBracketHeader = jest.mocked(BracketHeader);

/*********************************************/
/* helpers that keep "possibly undefined" out */
/*********************************************/

// an array item that must be there; throws instead of returning undefined
const getAt = <T,>(items: readonly T[], index: number): T => {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`No item at index ${String(index)}`);
  }
  return item;
};

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players, brkts, divs } = mockTmntFullData;
const brkt1 = getAt(brkts, 0);
const brkt2 = getAt(brkts, 1);

const OTHER_TMNT_ID = "tmt_differentid00000000000000000000";
const ERROR_HEADING = "Unable to load tournament";
const RESULTS_ERROR_HEADING = "Unable to load tournament game results";
const NO_PAYOUTS_MESSAGE = "No completed brackets";
const NOT_COMPLETE_MESSAGE = "Bracket not complete";
const NO_BRACKETS_MESSAGE = "No brackets are available for this tournament.";
const notIncludedText = (...brktIds: string[]) =>
  `Not complete, not included: ${brktIds.map((id) => brktName(id)).join(", ")}`;

// player number (1-8) -> player from the mock
const player = (n: number) => getAt(players, n - 1);
const pid = (n: number) => player(n).id;
const nameOf = (n: number) => {
  const p = player(n);
  return lastFirst(p.first_name, p.last_name);
};

// format money the same way the page does (it truncates: 35 / 3 -> $11.66)
const money = (n: number) => formatValueSymbSep2Dec(n.toString(), localConfig);

const brktName = (brktId: string) => {
  const brkt = brkts.find((b) => b.id === brktId);
  if (!brkt) throw new Error(`no bracket ${brktId}`);
  return getBrktOrElimName(brkt, divs);
};

// player number -> earnings in one bracket list
type Earnings = Record<number, number>;

const EARNINGS_1: Earnings = { 2: 25, 3: 10, 4: 35, 6: 10, 8: 60 };
const EARNINGS_2: Earnings = { 1: 10, 2: 25, 5: 25, 8: 35 };

/***********************/
/* bracket list fakes  */
/***********************/
type EarningsFn = BracketList["playerEarnings"];
type EarningsSpy = jest.Mock<ReturnType<EarningsFn>, Parameters<EarningsFn>>;

type CompletedFn = BracketList["allBracketsCompleted"];
type CompletedSpy = jest.Mock<ReturnType<CompletedFn>, Parameters<CompletedFn>>;

type FakeList = {
  list: BracketList;
  earnings: EarningsSpy;
  completed: CompletedSpy;
};

// a list with only the members the page uses. The spies are returned beside
// the list, so the tests never pull a method off the list
const fakeList = (earnings: Earnings, complete = true): FakeList => {
  const byId = new Map<string, number>();
  Object.entries(earnings).forEach(([n, amount]) => {
    byId.set(pid(Number(n)), amount);
  });
  const earningsSpy: EarningsSpy = jest.fn<ReturnType<EarningsFn>, Parameters<EarningsFn>>(
    (playerId) => byId.get(playerId) ?? 0,
  );
  const completedSpy: CompletedSpy = jest.fn<ReturnType<CompletedFn>, Parameters<CompletedFn>>(
    () => complete,
  );
  const list = {
    playerEarnings: earningsSpy,
    allBracketsCompleted: completedSpy,
  } as unknown as BracketList;
  return { list, earnings: earningsSpy, completed: completedSpy };
};

type Fakes = {
  fake1: FakeList;
  fake2: FakeList;
  records: brktListRecord;
};

type Completion = { complete1?: boolean; complete2?: boolean };

const makeFakes = (
  earnings1: Earnings = EARNINGS_1,
  earnings2: Earnings = EARNINGS_2,
  { complete1 = true, complete2 = true }: Completion = {},
): Fakes => {
  const fake1 = fakeList(earnings1, complete1);
  const fake2 = fakeList(earnings2, complete2);
  return {
    fake1,
    fake2,
    records: { [brktId1]: fake1.list, [brktId2]: fake2.list },
  };
};

// filled in by beforeEach
let fakes: Fakes;

// puts new fakes in the store and returns them
const setFakes = (earnings1?: Earnings, earnings2?: Earnings, completion?: Completion): Fakes => {
  fakes = makeFakes(earnings1, earnings2, completion);
  mockState.brktListRecords = fakes.records;
  return fakes;
};

// the page only passes the results along, so minimal results will do
const tmntResults = players.map((p) => ({
  player_id: p.id,
  div_id: divId1,
})) as unknown as tmntGameResult[];

/***********/
/* helpers */
/***********/
type HookResult = ReturnType<typeof useTmntFullData>;
type RetryFn = HookResult["retry"];

const retryMock = jest.fn<ReturnType<RetryFn>, Parameters<RetryFn>>();

// the real hook returns a blank tournament while nothing is loaded
const blankTmntData = (): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "" },
  brkts: [],
  brktEntries: [],
  divs: [],
  players: [],
  squads: [],
});

type HookState = Partial<Pick<HookResult, "data" | "hasData" | "failed" | "error">>;

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

const setHookLoading = () => {
  setHook({ data: blankTmntData(), hasData: false });
};

const setHookFailed = (error: string | undefined) => {
  setHook({ data: blankTmntData(), hasData: false, failed: true, error });
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

const setResultsLoading = () => {
  setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
};

const setResultsFailed = (error: string | undefined) => {
  setResultsState({
    loadedTmntId: "",
    loadStatus: "failed",
    requestedTmntId: tmntId,
    error,
    results: [],
  });
};

// the tournament with only the entries that pass keep
const withEntriesWhere = (
  keep: (entry: tmntFullType["brktEntries"][number]) => boolean,
): tmntFullType => ({
  ...mockTmntFullData,
  brktEntries: mockTmntFullData.brktEntries.filter(keep),
});

const renderPage = () => render(<BracketsPayoutsPage />);

/****************/
/* DOM helpers  */
/****************/
const getBrktGroup = () => screen.getByRole("group", { name: "Select bracket" });
const getBrktButtons = () => within(getBrktGroup()).getAllByRole("button");
const clickBrkt = (name: string) => {
  fireEvent.click(within(getBrktGroup()).getByRole("button", { name }));
};
const clickAll = () => {
  clickBrkt("All");
};

const sortBy = (name: "Name" | "Amount") => {
  fireEvent.click(screen.getByRole("button", { name }));
};

const getRows = () => screen.getAllByRole("row");
const getBodyRows = () => getRows().slice(1);
const getBodyRow = (index: number) => getAt(getBodyRows(), index);

const cellTexts = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

// [name, amount] for every body row, in display order
const tableRows = () => getBodyRows().map((row) => cellTexts(row));

// the expected [name, amount] rows for player numbers and amounts
const expected = (rows: [number, number][]) => rows.map(([n, amount]) => [nameOf(n), money(amount)]);

// expected rows for the default earnings
const ALL_BY_AMOUNT: [number, number][] = [
  [8, 95],
  [2, 50],
  [4, 35],
  [5, 25],
  [3, 10],
  [1, 10],
  [6, 10],
];
const ALL_BY_NAME: [number, number][] = [
  [2, 50],
  [4, 35],
  [3, 10],
  [1, 10],
  [8, 95],
  [5, 25],
  [6, 10],
];
const BRKT1_BY_AMOUNT: [number, number][] = [
  [8, 60],
  [4, 35],
  [2, 25],
  [3, 10],
  [6, 10],
];
const BRKT2_BY_AMOUNT: [number, number][] = [
  [8, 35],
  [2, 25],
  [5, 25],
  [1, 10],
];

describe("BracketsPayoutsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    setFakes();
    setHook();
    setResultsState();
  });

  describe("fixture sanity check", () => {
    it("mock tournament has two brackets, in the same division", () => {
      expect(brkts.map((b) => b.id)).toEqual([brktId1, brktId2]);
      expect(brkt1.div_id).toBe(brkt2.div_id);
    });

    it("the two brackets have different names", () => {
      expect(brktName(brktId1)).not.toBe(brktName(brktId2));
    });

    it("every mock player has an entry in both brackets", () => {
      players.forEach((p) => {
        const brktIds = mockTmntFullData.brktEntries
          .filter((e) => e.player_id === p.id)
          .map((e) => e.brkt_id);
        expect(brktIds).toEqual([brktId1, brktId2]);
      });
    });

    it("mock players have unique ids and names", () => {
      expect(new Set(players.map((p) => p.id)).size).toBe(8);
      expect(new Set(players.map((_p, i) => nameOf(i + 1))).size).toBe(8);
    });

    it("the fake lists return the earnings set for each player", () => {
      expect(fakes.fake1.list.playerEarnings(pid(8))).toBe(60);
      expect(fakes.fake2.list.playerEarnings(pid(8))).toBe(35);
      expect(fakes.fake1.list.playerEarnings(pid(7))).toBe(0);
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
      setResultsLoading();
      renderPage();

      expect(mockedFetchResults).not.toHaveBeenCalled();
    });

    it("does not fetch the results again when the request for this tournament failed", () => {
      setResultsFailed("Games service down");
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
      setHookLoading();
      setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("requests the new tournament's data and results when the route changes", () => {
      const { rerender } = renderPage();
      expect(mockDispatch).not.toHaveBeenCalled();

      mockedUseParams.mockReturnValue({ tmntId: OTHER_TMNT_ID });
      rerender(<BracketsPayoutsPage />);

      expect(mockedUseTmntFullData).toHaveBeenLastCalledWith(OTHER_TMNT_ID);
      expect(mockedFetchResults).toHaveBeenCalledTimes(1);
      expect(mockedFetchResults).toHaveBeenCalledWith(OTHER_TMNT_ID);
    });
  });

  describe("tournament loading and error", () => {
    it("shows the wait modal while the tournament is loading", () => {
      setHookLoading();
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "Select bracket" })).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows a generic error message when the tournament failed to load", () => {
      setHookFailed("Network error");
      renderPage();

      expect(screen.getByRole("heading", { level: 4, name: ERROR_HEADING })).toBeInTheDocument();
      expect(
        screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`),
      ).toBeInTheDocument();
      expect(screen.queryByText("Network error")).not.toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows the generic error message when failed but there is no error message", () => {
      setHookFailed(undefined);
      renderPage();

      expect(
        screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`),
      ).toBeInTheDocument();
    });

    it("shows the missing data message when the error mentions a missing required child", () => {
      setHookFailed("Tournament has a missing required child: events");
      renderPage();

      expect(screen.getByText(`Tournament with id: ${tmntId} is missing data.`)).toBeInTheDocument();
    });

    it("shows the page, not the error, when failed is set but the tournament has data", () => {
      setHook({ failed: true, error: "stale error" });
      renderPage();

      expect(screen.queryByText(ERROR_HEADING)).not.toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("calls the hook's retry (and does not dispatch) when Retry is clicked", () => {
      setHookFailed("boom");
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));

      expect(retryMock).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe("results loading and error", () => {
    it("shows the wait modal while the results are loading", () => {
      setResultsLoading();
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
        screen.getByRole("heading", { level: 4, name: RESULTS_ERROR_HEADING }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: ERROR_HEADING })).not.toBeInTheDocument();
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
        screen.getByText(`An error occurred while loading game results for tournament with id: ${tmntId}.`),
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

    it("keeps showing this tournament's payouts when a later request for them failed", () => {
      setResultsState({ loadStatus: "failed", error: "Games service down" });
      renderPage();

      expect(screen.queryByText("Games service down")).not.toBeInTheDocument();
      expect(getBodyRows()).toHaveLength(ALL_BY_AMOUNT.length);
    });

    it("shows the tournament error before the results error when both failed", () => {
      setHookFailed("Network error");
      setResultsFailed("Games service down");
      renderPage();

      expect(
        screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`),
      ).toBeInTheDocument();
      expect(screen.queryByText("Games service down")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: RESULTS_ERROR_HEADING }),
      ).not.toBeInTheDocument();
    });

    it("shows the wait modal, not the results error, while the tournament is still loading", () => {
      setHookLoading();
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
      const [props] = getAt(mockedHeader.mock.calls, 0);
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedTmntPageBtn).toBe("Brackets");
    });

    it("renders the bracket header with the tournament data and Payouts selected", () => {
      renderPage();

      expect(screen.getByTestId("bracket-header")).toHaveTextContent("Payouts");
      const [props] = getAt(mockedBracketHeader.mock.calls, 0);
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedBrktPageBtn).toBe("Payouts");
    });

    it("does not render a wait modal or an error when everything is loaded", () => {
      renderPage();

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByText(ERROR_HEADING)).not.toBeInTheDocument();
    });
  });

  describe("bracket buttons", () => {
    it("renders All, then one button per bracket named with getBrktOrElimName", () => {
      renderPage();

      expect(getBrktButtons().map((b) => b.textContent)).toEqual([
        "All",
        brktName(brktId1),
        brktName(brktId2),
      ]);
    });

    it("selects All when the page opens", () => {
      renderPage();

      const [all, first, second] = [0, 1, 2].map((i) => getAt(getBrktButtons(), i));
      expect(all).toHaveClass("active");
      expect(first).not.toHaveClass("active");
      expect(second).not.toHaveClass("active");
    });

    it("selects a bracket when its button is clicked", () => {
      renderPage();

      clickBrkt(brktName(brktId2));

      const [all, first, second] = [0, 1, 2].map((i) => getAt(getBrktButtons(), i));
      expect(all).not.toHaveClass("active");
      expect(first).not.toHaveClass("active");
      expect(second).toHaveClass("active");
    });

    it("selects All again when All is clicked", () => {
      renderPage();

      clickBrkt(brktName(brktId1));
      clickAll();

      expect(getAt(getBrktButtons(), 0)).toHaveClass("active");
      expect(getAt(getBrktButtons(), 1)).not.toHaveClass("active");
    });

    it("marks only All as pressed when the page opens", () => {
      renderPage();

      expect(within(getBrktGroup()).getByRole("button", { name: "All", pressed: true })).toBeInTheDocument();
      expect(within(getBrktGroup()).getAllByRole("button", { pressed: true })).toHaveLength(1);
      expect(within(getBrktGroup()).getAllByRole("button", { pressed: false })).toHaveLength(2);
    });

    it("moves the pressed state to the clicked bracket", () => {
      renderPage();

      clickBrkt(brktName(brktId2));

      expect(
        within(getBrktGroup()).getByRole("button", { name: brktName(brktId2), pressed: true }),
      ).toBeInTheDocument();
      expect(within(getBrktGroup()).getByRole("button", { name: "All", pressed: false })).toBeInTheDocument();
      expect(
        within(getBrktGroup()).getByRole("button", { name: brktName(brktId1), pressed: false }),
      ).toBeInTheDocument();
    });

    it("sets aria-pressed to true or false on every bracket button", () => {
      renderPage();

      clickBrkt(brktName(brktId1));

      const [all, first, second] = [0, 1, 2].map((i) => getAt(getBrktButtons(), i));
      expect(all).toHaveAttribute("aria-pressed", "false");
      expect(first).toHaveAttribute("aria-pressed", "true");
      expect(second).toHaveAttribute("aria-pressed", "false");
    });

    it("marks All as pressed again when All is clicked", () => {
      renderPage();

      clickBrkt(brktName(brktId1));
      clickAll();

      expect(within(getBrktGroup()).getByRole("button", { name: "All", pressed: true })).toBeInTheDocument();
      expect(within(getBrktGroup()).getAllByRole("button", { pressed: true })).toHaveLength(1);
    });

    it("the bracket buttons are plain buttons, so they do not submit a form", () => {
      renderPage();

      getBrktButtons().forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });
  });

  describe("payout table", () => {
    it("renders Name and Amount column headers as sort buttons", () => {
      renderPage();

      const headers = within(getAt(getRows(), 0)).getAllByRole("columnheader");
      expect(headers.map((h) => h.textContent)).toEqual(["Name", "Amount"]);
      expect(within(getAt(headers, 0)).getByRole("button", { name: "Name" })).toBeInTheDocument();
      expect(within(getAt(headers, 1)).getByRole("button", { name: "Amount" })).toBeInTheDocument();
    });

    it("shows each player's total across all brackets, highest first", () => {
      renderPage();

      expect(tableRows()).toEqual(expected(ALL_BY_AMOUNT));
    });

    it("does not show a player who won nothing", () => {
      renderPage();

      expect(screen.queryByText(nameOf(7))).not.toBeInTheDocument();
    });

    it("shows one row per player in the All view, even when they won in both brackets", () => {
      renderPage();

      expect(screen.getAllByText(nameOf(8))).toHaveLength(1);
      expect(screen.getAllByText(nameOf(2))).toHaveLength(1);
    });

    it("links each name to the player's brackets page", () => {
      renderPage();

      expect(screen.getByRole("link", { name: nameOf(8) })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/brackets/player/${pid(8)}`,
      );
    });

    it("renders one link per row, in display order", () => {
      renderPage();

      const links = screen.getAllByRole("link");
      expect(links.map((link) => link.textContent)).toEqual(ALL_BY_AMOUNT.map(([n]) => nameOf(n)));
      expect(links.map((link) => link.getAttribute("href"))).toEqual(
        ALL_BY_AMOUNT.map(([n]) => `/results/tmnt/${tmntId}/brackets/player/${pid(n)}`),
      );
    });

    it("formats the amount with the currency formatter", () => {
      renderPage();

      expect(cellTexts(getBodyRow(0))).toEqual([nameOf(8), money(95)]);
      expect(money(95)).toBe("$95.00");
    });

    it("formats an amount with thousands separators", () => {
      setFakes({ 8: 1200 }, { 8: 34.5 });
      renderPage();

      expect(tableRows()).toEqual([[nameOf(8), money(1234.5)]]);
      expect(money(1234.5)).toBe("$1,234.50");
    });

    it("formats a split prize the same way the formatter does (it truncates)", () => {
      // three players tied in a final share first + second
      setFakes({ 3: 35 / 3 }, {});
      renderPage();

      expect(tableRows()).toEqual([[nameOf(3), money(35 / 3)]]);
      expect(money(35 / 3)).toBe("$11.66");
    });

    it("adds the rounded down amounts, so the total matches each bracket", () => {
      setFakes({ 3: 35 / 3 }, { 3: 35 / 3 });
      renderPage();

      // $11.66 + $11.66, not 23.333... rounded down
      expect(tableRows()).toEqual([[nameOf(3), "$23.32"]]);
    });

    it("totals $10 + 35/3 and 10/3 as $24.99, the sum of the amounts on each bracket", () => {
      setFakes({ 3: 10 + 35 / 3 }, { 3: 10 / 3 });
      renderPage();

      expect(tableRows()).toEqual([[nameOf(3), "$24.99"]]);

      clickBrkt(brktName(brktId1));
      expect(tableRows()).toEqual([[nameOf(3), "$21.66"]]);

      clickBrkt(brktName(brktId2));
      expect(tableRows()).toEqual([[nameOf(3), "$3.33"]]);
    });

    it("does not lose a cent to floating point when rounding down", () => {
      // 0.29 is stored as 0.28999..., which must still show as $0.29
      setFakes({ 3: 0.29 }, { 3: 0.7 });
      renderPage();

      expect(tableRows()).toEqual([[nameOf(3), "$0.99"]]);
    });

    it("leaves out a player whose amount rounds down to $0.00", () => {
      setFakes({ 3: 0.004, 8: 25 }, {});
      renderPage();

      expect(tableRows()).toEqual(expected([[8, 25]]));
    });
  });

  describe("one bracket", () => {
    it("shows only that bracket's earnings, highest first", () => {
      renderPage();

      clickBrkt(brktName(brktId1));

      expect(tableRows()).toEqual(expected(BRKT1_BY_AMOUNT));
    });

    it("puts players with the same amount in name order", () => {
      renderPage();

      clickBrkt(brktName(brktId2));

      // Jane Doe and Tom Smith both have $25
      expect(tableRows()).toEqual(expected(BRKT2_BY_AMOUNT));
    });

    it("does not show players who won nothing in that bracket", () => {
      renderPage();

      clickBrkt(brktName(brktId1));

      expect(screen.queryByText(nameOf(1))).not.toBeInTheDocument();
      expect(screen.queryByText(nameOf(5))).not.toBeInTheDocument();
      expect(screen.queryByText(nameOf(7))).not.toBeInTheDocument();
    });

    it("shows the totals again when All is clicked", () => {
      renderPage();

      clickBrkt(brktName(brktId2));
      clickAll();

      expect(tableRows()).toEqual(expected(ALL_BY_AMOUNT));
    });

    it("does not change the totals or the bracket amounts when switching back and forth", () => {
      renderPage();

      clickBrkt(brktName(brktId1));
      clickAll();
      clickBrkt(brktName(brktId1));
      expect(tableRows()).toEqual(expected(BRKT1_BY_AMOUNT));

      clickAll();
      clickBrkt(brktName(brktId2));
      clickAll();
      expect(tableRows()).toEqual(expected(ALL_BY_AMOUNT));
    });

    it("shows the no completed brackets message when nobody won anything in that bracket", () => {
      setFakes(EARNINGS_1, {});
      renderPage();

      clickBrkt(brktName(brktId2));

      expect(screen.getByRole("heading", { level: 5, name: NO_PAYOUTS_MESSAGE })).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      // the buttons stay, so another bracket can be picked
      expect(getBrktButtons()).toHaveLength(3);
    });

    it("shows the table again when a bracket with payouts is picked", () => {
      setFakes(EARNINGS_1, {});
      renderPage();

      clickBrkt(brktName(brktId2));
      clickBrkt(brktName(brktId1));

      expect(tableRows()).toEqual(expected(BRKT1_BY_AMOUNT));
    });
  });

  describe("sorting", () => {
    it("sorts by amount, highest first, when the page opens", () => {
      renderPage();

      const amounts = tableRows().map((cells) => cells[1]);
      expect(amounts).toEqual(ALL_BY_AMOUNT.map(([, amount]) => money(amount)));
    });

    it("sorts by name when Name is clicked", () => {
      renderPage();

      sortBy("Name");

      expect(tableRows()).toEqual(expected(ALL_BY_NAME));
    });

    it("sorts by amount again when Amount is clicked", () => {
      renderPage();

      sortBy("Name");
      sortBy("Amount");

      expect(tableRows()).toEqual(expected(ALL_BY_AMOUNT));
    });

    it("puts players with the same amount in name order", () => {
      renderPage();

      // John, Joe and Tony all have $10: Joe Doe, John Doe, Tony Smith
      expect(tableRows().slice(4)).toEqual(
        expected([
          [3, 10],
          [1, 10],
          [6, 10],
        ]),
      );
    });

    it("keeps the sort when a bracket is picked", () => {
      renderPage();

      sortBy("Name");
      clickBrkt(brktName(brktId1));

      expect(tableRows()).toEqual(
        expected([
          [2, 25],
          [4, 35],
          [3, 10],
          [8, 60],
          [6, 10],
        ]),
      );
    });

    it("sorts names without regard to case", () => {
      const lowerCase = {
        ...mockTmntFullData,
        players: mockTmntFullData.players.map((p) =>
          p.id === pid(8) ? { ...p, last_name: "adams" } : p,
        ),
      };
      setHook({ data: lowerCase });
      renderPage();

      sortBy("Name");

      // "adams, Terri" goes before "Doe, ..."
      expect(getAt(tableRows(), 0)).toEqual([lastFirst("Terri", "adams"), money(95)]);
    });
  });

  describe("no completed brackets", () => {
    it("shows the message, and no table, when nobody has won anything yet", () => {
      setFakes({}, {});
      renderPage();

      expect(screen.getByRole("heading", { level: 5, name: NO_PAYOUTS_MESSAGE })).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Name" })).not.toBeInTheDocument();
    });

    it("still shows the headers and the bracket buttons", () => {
      setFakes({}, {});
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toBeInTheDocument();
      expect(screen.getByTestId("bracket-header")).toBeInTheDocument();
      expect(getBrktButtons()).toHaveLength(3);
    });

    it("shows the message when the tournament has no bracket entries", () => {
      setHook({ data: { ...mockTmntFullData, brktEntries: [] } });
      renderPage();

      expect(screen.getByText(NO_PAYOUTS_MESSAGE)).toBeInTheDocument();
    });

    it("does not show the message when someone has won something", () => {
      renderPage();

      expect(screen.queryByText(NO_PAYOUTS_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  describe("brackets not complete", () => {
    it("asks every list if it is complete", () => {
      renderPage();

      expect(fakes.fake1.completed).toHaveBeenCalled();
      expect(fakes.fake2.completed).toHaveBeenCalled();
    });

    it("checks a list is complete after its matches are brought up to date", () => {
      renderPage();

      const updateOrder = getAt(mockedUpdateAll.mock.invocationCallOrder, 0);
      const firstCompleted = getAt(fakes.fake1.completed.mock.invocationCallOrder, 0);
      expect(updateOrder).toBeLessThan(firstCompleted);
    });

    it("never asks an incomplete list for earnings", () => {
      setFakes(EARNINGS_1, EARNINGS_2, { complete2: false });
      renderPage();

      expect(fakes.fake2.earnings).not.toHaveBeenCalled();
      expect(fakes.fake1.earnings).toHaveBeenCalledTimes(players.length);
    });

    it("totals only the complete brackets", () => {
      setFakes(EARNINGS_1, EARNINGS_2, { complete2: false });
      renderPage();

      expect(tableRows()).toEqual(expected(BRKT1_BY_AMOUNT));
    });

    it("names the brackets left out of the totals", () => {
      setFakes(EARNINGS_1, EARNINGS_2, { complete2: false });
      renderPage();

      expect(screen.getByText(notIncludedText(brktId2))).toBeInTheDocument();
    });

    it("names every incomplete bracket, in bracket order", () => {
      setFakes(EARNINGS_1, EARNINGS_2, { complete1: false, complete2: false });
      renderPage();

      expect(screen.getByText(notIncludedText(brktId1, brktId2))).toBeInTheDocument();
    });

    it("does not show the not included note when every bracket is complete", () => {
      renderPage();

      expect(screen.queryByText(/Not complete, not included/)).not.toBeInTheDocument();
    });

    it("shows the not included note only in the All view", () => {
      setFakes(EARNINGS_1, EARNINGS_2, { complete2: false });
      renderPage();

      clickBrkt(brktName(brktId1));

      expect(screen.queryByText(/Not complete, not included/)).not.toBeInTheDocument();
      expect(tableRows()).toEqual(expected(BRKT1_BY_AMOUNT));
    });

    it("shows Bracket not complete, and no table, when an incomplete bracket is picked", () => {
      setFakes(EARNINGS_1, EARNINGS_2, { complete2: false });
      renderPage();

      clickBrkt(brktName(brktId2));

      expect(
        screen.getByRole("heading", { level: 5, name: NOT_COMPLETE_MESSAGE }),
      ).toBeInTheDocument();
      expect(screen.queryByText(NO_PAYOUTS_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(getBrktButtons()).toHaveLength(3);
    });

    it("shows No completed brackets in the All view when no bracket is complete", () => {
      setFakes(EARNINGS_1, EARNINGS_2, { complete1: false, complete2: false });
      renderPage();

      expect(
        screen.getByRole("heading", { level: 5, name: NO_PAYOUTS_MESSAGE }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(fakes.fake1.earnings).not.toHaveBeenCalled();
      expect(fakes.fake2.earnings).not.toHaveBeenCalled();
    });

    it("shows the payouts once the bracket is complete", () => {
      setFakes(EARNINGS_1, EARNINGS_2, { complete2: false });
      const { rerender } = renderPage();
      expect(tableRows()).toEqual(expected(BRKT1_BY_AMOUNT));

      setFakes(EARNINGS_1, EARNINGS_2);
      rerender(<BracketsPayoutsPage />);

      expect(tableRows()).toEqual(expected(ALL_BY_AMOUNT));
      expect(screen.queryByText(/Not complete, not included/)).not.toBeInTheDocument();
    });
  });

  describe("missing bracket list", () => {
    const missingListMsg = (brktId: string) =>
      `Bracket list with bracket definition id ${brktId} not found.`;

    it("shows an error when a bracket has no bracket list", () => {
      mockState.brktListRecords = { [brktId1]: fakes.fake1.list };
      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent(missingListMsg(brktId2));
      expect(screen.getByRole("alert")).toHaveClass("alert-danger");
    });

    it("shows the tournament header, but no bracket buttons or table, with the error", () => {
      mockState.brktListRecords = { [brktId1]: fakes.fake1.list };
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Brackets");
      expect(screen.queryByTestId("bracket-header")).not.toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "Select bracket" })).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("names the first bracket without a list when none have lists", () => {
      mockState.brktListRecords = {};
      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent(missingListMsg(brktId1));
    });

    it("does not show the error when every bracket has a list", () => {
      renderPage();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("waits for the results before showing the error", () => {
      mockState.brktListRecords = {};
      setResultsLoading();
      renderPage();

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
      expect(screen.queryByRole("group", { name: "Select bracket" })).not.toBeInTheDocument();
      expect(screen.queryByText(NO_PAYOUTS_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("does not fetch the results", () => {
      setHook({ data: noBracketsData() });
      setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
      renderPage();

      expect(mockedFetchResults).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("stops fetching the results once the tournament loads with no brackets", () => {
      setHookLoading();
      setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
      const { rerender } = renderPage();
      expect(mockedFetchResults).toHaveBeenCalledTimes(1);

      // the first request failed for another tournament id, which would
      // normally trigger a new request on the next render
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: OTHER_TMNT_ID,
        results: [],
      });
      setHook({ data: noBracketsData() });
      rerender(<BracketsPayoutsPage />);

      expect(mockedFetchResults).toHaveBeenCalledTimes(1);
      expect(screen.getByText(NO_BRACKETS_MESSAGE)).toBeInTheDocument();
    });

    it("shows the message without waiting for the results", () => {
      setHook({ data: noBracketsData() });
      setResultsLoading();
      renderPage();

      expect(screen.getByText(NO_BRACKETS_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("shows the message, not a results error, when loading the results failed", () => {
      setHook({ data: noBracketsData() });
      setResultsFailed("Games service down");
      renderPage();

      expect(screen.getByText(NO_BRACKETS_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByText("Games service down")).not.toBeInTheDocument();
    });

    it("does not show the message when the tournament has brackets", () => {
      renderPage();

      expect(screen.queryByText(NO_BRACKETS_MESSAGE)).not.toBeInTheDocument();
    });
  });

  describe("building the rows", () => {
    it("brings the matches up to date with the results before reading earnings", () => {
      renderPage();

      expect(mockedUpdateAll).toHaveBeenCalledTimes(1);
      expect(mockedUpdateAll).toHaveBeenCalledWith(fakes.records, tmntResults);

      const updateOrder = getAt(mockedUpdateAll.mock.invocationCallOrder, 0);
      const firstEarnings = getAt(fakes.fake1.earnings.mock.invocationCallOrder, 0);
      expect(updateOrder).toBeLessThan(firstEarnings);
    });

    it("asks each list for the earnings of every player entered in that bracket", () => {
      renderPage();

      const askedFor = (spy: EarningsSpy) => spy.mock.calls.map(([playerId]) => playerId);
      const allIds = players.map((p) => p.id);
      expect(askedFor(fakes.fake1.earnings).sort()).toEqual([...allIds].sort());
      expect(askedFor(fakes.fake2.earnings).sort()).toEqual([...allIds].sort());
    });

    it("only asks a list about players entered in its bracket", () => {
      // players 1 and 2 only in bracket 1, everyone else only in bracket 2
      const data = withEntriesWhere((e) =>
        [pid(1), pid(2)].includes(e.player_id) ? e.brkt_id === brktId1 : e.brkt_id === brktId2,
      );
      setHook({ data });
      renderPage();

      const askedFor = (spy: EarningsSpy) => spy.mock.calls.map(([playerId]) => playerId);
      expect(askedFor(fakes.fake1.earnings).sort()).toEqual([pid(1), pid(2)].sort());
      expect(askedFor(fakes.fake2.earnings)).not.toContain(pid(1));
      expect(askedFor(fakes.fake2.earnings)).not.toContain(pid(2));
    });

    it("counts only the earnings of brackets the player is entered in", () => {
      // player 8 only in bracket 1
      const data = withEntriesWhere((e) => !(e.player_id === pid(8) && e.brkt_id === brktId2));
      setHook({ data });
      renderPage();

      expect(within(getBodyRow(0)).getByRole("link")).toHaveTextContent(nameOf(8));
      expect(cellTexts(getBodyRow(0))).toEqual([nameOf(8), money(60)]);
    });

    it("does not read the lists while the tournament is loading", () => {
      setHookLoading();
      renderPage();

      expect(mockedUpdateAll).not.toHaveBeenCalled();
      expect(fakes.fake1.completed).not.toHaveBeenCalled();
      expect(fakes.fake1.earnings).not.toHaveBeenCalled();
    });

    it("does not read the lists while the results are loading", () => {
      setResultsLoading();
      renderPage();

      expect(mockedUpdateAll).not.toHaveBeenCalled();
      expect(fakes.fake1.earnings).not.toHaveBeenCalled();
      expect(fakes.fake2.earnings).not.toHaveBeenCalled();
    });

    it("does not read the lists using another tournament's results", () => {
      setResultsState({ loadedTmntId: OTHER_TMNT_ID });
      renderPage();

      expect(mockedUpdateAll).not.toHaveBeenCalled();
      expect(fakes.fake1.earnings).not.toHaveBeenCalled();
    });

    it("does not read the lists when loading the results failed", () => {
      setResultsFailed("Games service down");
      renderPage();

      expect(mockedUpdateAll).not.toHaveBeenCalled();
      expect(fakes.fake1.earnings).not.toHaveBeenCalled();
    });

    it("does not rebuild the rows when re-rendered with the same data", () => {
      const { rerender } = renderPage();

      rerender(<BracketsPayoutsPage />);
      rerender(<BracketsPayoutsPage />);

      expect(mockedUpdateAll).toHaveBeenCalledTimes(1);
      expect(fakes.fake1.earnings).toHaveBeenCalledTimes(players.length);
    });

    it("does not rebuild the rows when a bracket or a sort is picked", () => {
      renderPage();

      clickBrkt(brktName(brktId1));
      sortBy("Name");
      clickAll();
      sortBy("Amount");

      expect(mockedUpdateAll).toHaveBeenCalledTimes(1);
      expect(fakes.fake1.earnings).toHaveBeenCalledTimes(players.length);
      expect(fakes.fake2.earnings).toHaveBeenCalledTimes(players.length);
    });

    it("rebuilds the rows when the results change", () => {
      const { rerender } = renderPage();
      const newResults = [...tmntResults];

      setResultsState({ results: newResults });
      rerender(<BracketsPayoutsPage />);

      expect(mockedUpdateAll).toHaveBeenCalledTimes(2);
      expect(getAt(mockedUpdateAll.mock.calls, 1)[1]).toBe(newResults);
    });

    it("rebuilds the rows, and shows the new amounts, when the bracket lists change", () => {
      const { rerender } = renderPage();
      expect(tableRows()).toEqual(expected(ALL_BY_AMOUNT));

      const newFakes = setFakes({ 7: 25 }, { 7: 10 });
      rerender(<BracketsPayoutsPage />);

      expect(mockedUpdateAll).toHaveBeenCalledTimes(2);
      expect(getAt(mockedUpdateAll.mock.calls, 1)[0]).toBe(newFakes.records);
      expect(tableRows()).toEqual(expected([[7, 35]]));
    });

    it("builds the rows once the results have loaded", () => {
      setResultsLoading();
      const { rerender } = renderPage();
      expect(mockedUpdateAll).not.toHaveBeenCalled();

      setResultsState();
      rerender(<BracketsPayoutsPage />);

      expect(mockedUpdateAll).toHaveBeenCalledTimes(1);
      expect(tableRows()).toEqual(expected(ALL_BY_AMOUNT));
    });
  });
});
