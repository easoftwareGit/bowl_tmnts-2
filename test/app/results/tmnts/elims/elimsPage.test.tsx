// test/app/results/tmnts/elims/elimsPage.test.tsx
// tests for src/app/results/tmnt/[tmntId]/elims/page.tsx
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import { useParams } from "next/navigation";
import ElimsPage from "@/app/results/tmnt/[tmntId]/elims/page";
import ElimGame from "@/app/results/tmnt/[tmntId]/elims/elimGame";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import {
  buildElimResultsRows,
  elimResults,
  erAliveKey,
  getElimAdvancingScores,
} from "@/lib/results/elims/elimResults";
import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { fetchElimPfs } from "@/redux/features/elimPfs/elimPfsSlice";
import { getBrktOrElimName } from "@/lib/getName";
import { tgrGameKey, tgrHdcpKey, tmntGameResult } from "@/lib/types/resultsTypes";
import { divType, elimPfType, elimType, playerType, tmntFullType } from "@/lib/types/types";
import {
  mockElimPfs,
  mockTmntFullData,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// ---------------------------------------------------------------------------
// redux state used by the mocked selectors
// ---------------------------------------------------------------------------

type loadStatusType = "idle" | "loading" | "succeeded" | "failed";

type MockState = {
  results: {
    requestedTmntId: string;
    tmntId: string;
    loadStatus: loadStatusType;
    error: string | null;
    games: tmntGameResult[];
  };
  elimPfs: {
    requestedTmntId: string;
    tmntId: string;
    loadStatus: loadStatusType;
    error: string | null;
    elimPfs: elimPfType[];
  };
};

let mockState: MockState;
const mockDispatch = jest.fn();

// ---------------------------------------------------------------------------
// mocks
// ---------------------------------------------------------------------------

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("next/link", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: (props: { href: string; className?: string; children: React.ReactNode }) =>
      createElement("a", { href: props.href, className: props.className }, props.children),
  };
});

// render next/image as a plain img (used by the real ElimGame status icons)
jest.mock("next/image", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: (props: { src: string; alt: string; title?: string; className?: string }) =>
      createElement("img", {
        src: props.src,
        alt: props.alt,
        title: props.title,
        className: props.className,
      }),
  };
});

// render the tooltip inline so its text can be checked without hover timers
jest.mock("react-bootstrap", () => {
  const { createElement, Fragment } = jest.requireActual<typeof import("react")>("react");
  return {
    OverlayTrigger: (props: { children: React.ReactNode; overlay: React.ReactNode }) =>
      createElement(Fragment, null, props.children, props.overlay),
    Tooltip: (props: { id: string; children: React.ReactNode }) =>
      createElement("div", { role: "tooltip", id: props.id }, props.children),
  };
});

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: MockState) => unknown) => selector(mockState),
}));

jest.mock("@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice", () => ({
  fetchOneTmntGameResults: jest.fn((id: string) => ({
    type: "oneTmntGameResults/fetch",
    payload: id,
  })),
  getOneTmntGameResultsRequestedTmntId: (s: MockState) => s.results.requestedTmntId,
  getOneTmntGameResultsTmntId: (s: MockState) => s.results.tmntId,
  getOneTmntGameResultsLoadStatus: (s: MockState) => s.results.loadStatus,
  getOneTmntGameResultsError: (s: MockState) => s.results.error,
  selectOneTmntGameResults: (s: MockState) => s.results.games,
}));

jest.mock("@/redux/features/elimPfs/elimPfsSlice", () => ({
  fetchElimPfs: jest.fn((id: string) => ({
    type: "elimPfs/fetch",
    payload: id,
  })),
  getElimPfsRequestedTmntId: (s: MockState) => s.elimPfs.requestedTmntId,
  getElimPfsTmntId: (s: MockState) => s.elimPfs.tmntId,
  getElimPfsLoadStatus: (s: MockState) => s.elimPfs.loadStatus,
  getElimPfsError: (s: MockState) => s.elimPfs.error,
  selectElimPfs: (s: MockState) => s.elimPfs.elimPfs,
}));

jest.mock("@/hooks/useTmntFullData", () => ({
  useTmntFullData: jest.fn(),
}));

// keep the real key helpers; mock the row builders
jest.mock("@/lib/results/elims/elimResults", () => ({
  ...jest.requireActual<typeof import("@/lib/results/elims/elimResults")>(
    "@/lib/results/elims/elimResults"
  ),
  buildElimResultsRows: jest.fn(),
  getElimAdvancingScores: jest.fn(),
}));

// the real ElimGame, wrapped in a jest.fn so its props can be checked
jest.mock("@/app/results/tmnt/[tmntId]/elims/elimGame", () => {
  const actual = jest.requireActual<
    typeof import("@/app/results/tmnt/[tmntId]/elims/elimGame")
  >("@/app/results/tmnt/[tmntId]/elims/elimGame");
  return {
    __esModule: true,
    default: jest.fn(actual.default),
  };
});

jest.mock("@/components/modal/waitModal", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: jest.fn((props: { show: boolean; message: string }) =>
      createElement(
        "div",
        { "data-testid": "wait-modal", "data-show": String(props.show) },
        props.message
      )
    ),
  };
});

jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: jest.fn((props: { selectedTmntPageBtn: string }) =>
      createElement("div", { "data-testid": "tmnt-home-header" }, props.selectedTmntPageBtn)
    ),
  };
});

const mockUseParams = jest.mocked(useParams);
const mockUseTmntFullData = jest.mocked(useTmntFullData);
const mockBuildElimResultsRows = jest.mocked(buildElimResultsRows);
const mockGetElimAdvancingScores = jest.mocked(getElimAdvancingScores);
const mockFetchOneTmntGameResults = jest.mocked(fetchOneTmntGameResults);
const mockFetchElimPfs = jest.mocked(fetchElimPfs);
const mockTmntHomeHeader = jest.mocked(TmntHomeHeader);
const mockElimGame = jest.mocked(ElimGame);

type tmntHookType = ReturnType<typeof useTmntFullData>;
type retryType = tmntHookType["retry"];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

// noUncheckedIndexedAccess: fail loudly instead of returning undefined
const at = <T,>(items: T[], index: number): T => {
  const item = items[index];
  if (item === undefined) throw new Error(`no item at index ${index}`);
  return item;
};

const findDiv = (hasHdcp: boolean): divType => {
  const div = mockTmntFullData.divs.find((d) => d.hdcp_per > 0 === hasHdcp);
  if (!div) throw new Error(`mock data has no ${hasHdcp ? "handicap" : "scratch"} div`);
  return div;
};

// ---------------------------------------------------------------------------
// test data
// ---------------------------------------------------------------------------

const otherTmntId = "tmt_00000000000000000000000000000000";

const resultsAction = { type: "oneTmntGameResults/fetch", payload: tmntId };
const elimPfsAction = { type: "elimPfs/fetch", payload: tmntId };

const scratchDiv = findDiv(false);
const hdcpDiv = findDiv(true);

// mock elims[0]: games 1-3, pays $25 and $10; mock elims[1]: games 4-6
const mockElim1 = at(mockTmntFullData.elims, 0);
const mockElim2 = at(mockTmntFullData.elims, 1);
const elim1Pfs = mockElimPfs.filter((pf) => pf.elim_id === mockElim1.id);
const elim2Pfs = mockElimPfs.filter((pf) => pf.elim_id === mockElim2.id);

// 8 players from the mock data
const players: playerType[] = mockTmntFullData.players.slice(0, 8);
const fullName = (p: playerType) => `${p.first_name} ${p.last_name}`;

// a tmntGameResult for a player; the page only passes these to buildElimResultsRows
const makeGameResult = (player: playerType): tmntGameResult => ({
  player_id: player.id,
  div_id: scratchDiv.id,
  div_name: scratchDiv.div_name,
  sort_order: scratchDiv.sort_order,
  tmnt_name: mockTmntFullData.tmnt.tmnt_name,
  start_date: mockTmntFullData.tmnt.start_date_str,
  full_name: fullName(player),
  average: player.average,
  hdcp: 0,
  total: 0,
  total_hdcp: 0,
});

/*
 * Rows follow the rules of buildElimResultsRows:
 *  - [Game N Alive] stays null until [Game N] is set for every player still in
 *  - once [Game N Alive] is false, game, hdcp and alive are null for every later game
 *  - a player who was never eliminated has alive true for every game,
 *    including the last game once it is bowled
 *  - hdcp is null in a scratch event
 */
type rowValues = {
  player: playerType;
  startGame: number;
  games: (number | null)[];
  alive: (boolean | null)[];
  position: number | null;
  prize: number | null;
  hdcp?: number | null;
};

const makeRow = ({
  player,
  startGame,
  games,
  alive,
  position,
  prize,
  hdcp = null,
}: rowValues): elimResults => {
  if (games.length !== alive.length) {
    throw new Error("games and alive must have the same length");
  }
  const row: Record<string, unknown> = {
    position,
    player_id: player.id,
    full_name: fullName(player),
    hdcp,
    prize,
  };
  games.forEach((game, i) => {
    const gameNum = startGame + i;
    row[tgrGameKey(gameNum)] = game;
    row[tgrHdcpKey(gameNum)] = game == null ? null : game + (hdcp ?? 0);
    row[erAliveKey(gameNum)] = at(alive, i);
  });
  return row as unknown as elimResults;
};

/*
 * 8 players, 3 game elim (games 1-3), pays 2 places ($25, $10). Final results:
 *
 *            Game 1   Game 2   Game 3   Prize
 *  Player 1   245 ✓    255 ✓    244 ✓   $25.00
 *  Player 2   235 ✓    225 ✓    222 ✓   $10.00
 *  Player 3   215 ✓    220 ✗
 *  Player 4   205 ✓    200 ✗
 *  Player 5   195 ✗
 *  Player 6   185 ✗
 *  Player 7   175 ✗
 *  Player 8   165 ✗
 */
type exampleRow = {
  games: (number | null)[];
  alive: (boolean | null)[];
  prize: number | null;
};

const finalExample: exampleRow[] = [
  { games: [245, 255, 244], alive: [true, true, true], prize: 25 },
  { games: [235, 225, 222], alive: [true, true, true], prize: 10 },
  { games: [215, 220, null], alive: [true, false, null], prize: null },
  { games: [205, 200, null], alive: [true, false, null], prize: null },
  { games: [195, null, null], alive: [false, null, null], prize: null },
  { games: [185, null, null], alive: [false, null, null], prize: null },
  { games: [175, null, null], alive: [false, null, null], prize: null },
  { games: [165, null, null], alive: [false, null, null], prize: null },
];

// same tournament after game 2, before game 3 is bowled
const inProgressExample: exampleRow[] = finalExample.map((row) => ({
  games: [at(row.games, 0), at(row.games, 1), null],
  alive: [at(row.alive, 0), at(row.alive, 1), null],
  prize: null,
}));

const buildRows = (
  example: exampleRow[],
  final: boolean,
  hdcp: number | null = null
): elimResults[] =>
  example.map((row, i) =>
    makeRow({
      player: at(players, i),
      startGame: mockElim1.start,
      games: row.games,
      alive: row.alive,
      position: final ? i + 1 : null,
      prize: row.prize,
      hdcp,
    })
  );

// what each game cell shows: its text and status icon, or null for a blank cell
type cellView = { text: string; status: "Advanced" | "Eliminated" | null } | null;

const toCellViews = (example: exampleRow[]): cellView[][] =>
  example.map((row) =>
    row.games.map((game, i) => {
      if (game == null) return null;
      const alive = at(row.alive, i);
      return {
        text: String(game),
        status: alive == null ? null : alive ? "Advanced" : "Eliminated",
      };
    })
  );

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// checks one game cell against what it should show (no conditional expects)
const expectGameCell = (cell: HTMLElement, view: cellView) => {
  expect(cell).toHaveTextContent(new RegExp(`^${escapeRegExp(view?.text ?? "")}$`));
  const advanced = view?.status === "Advanced" ? 1 : 0;
  const eliminated = view?.status === "Eliminated" ? 1 : 0;
  expect(within(cell).queryAllByRole("img")).toHaveLength(advanced + eliminated);
  expect(within(cell).queryAllByRole("img", { name: "Advanced" })).toHaveLength(advanced);
  expect(within(cell).queryAllByRole("img", { name: "Eliminated" })).toHaveLength(eliminated);
};

describe("ElimsPage", () => {
  let tmntFullData: tmntFullType;
  let elim1: elimType;
  let elim2: elimType;
  let tmntResults: tmntGameResult[];
  let elim1Rows: elimResults[];
  let elim2Rows: elimResults[];
  let retryTmnt: jest.Mock<ReturnType<retryType>, Parameters<retryType>>;

  const setTmntHook = (overrides: Partial<tmntHookType> = {}) => {
    mockUseTmntFullData.mockReturnValue({
      data: tmntFullData,
      hasData: true,
      failed: false,
      error: undefined,
      retry: retryTmnt,
      ...overrides,
    });
  };

  const setLoadedState = () => {
    mockState = {
      results: {
        requestedTmntId: tmntId,
        tmntId,
        loadStatus: "succeeded",
        error: null,
        games: tmntResults,
      },
      elimPfs: {
        requestedTmntId: tmntId,
        tmntId,
        loadStatus: "succeeded",
        error: null,
        elimPfs: cloneDeep(mockElimPfs),
      },
    };
  };

  // points every elim at another division of the mock data
  const setElimsDiv = (div: divType) => {
    tmntFullData.elims = tmntFullData.elims.map((e) => ({ ...e, div_id: div.id }));
    elim1 = at(tmntFullData.elims, 0);
    elim2 = at(tmntFullData.elims, 1);
    setTmntHook();
  };

  const getElimButtons = () =>
    within(screen.getByRole("group", { name: "Select elim" })).getAllByRole("button");

  // all rows except the header row
  const getBodyRows = () => screen.getAllByRole("row").slice(1);

  const getCells = (rowIndex: number) =>
    within(at(getBodyRows(), rowIndex)).getAllByRole("cell");

  const getCell = (rowIndex: number, cellIndex: number) =>
    at(getCells(rowIndex), cellIndex);

  const getHeader = (index: number) => at(screen.getAllByRole("columnheader"), index);

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ tmntId });
    retryTmnt = jest.fn<ReturnType<retryType>, Parameters<retryType>>();

    tmntFullData = cloneDeep(mockTmntFullData);
    elim1 = at(tmntFullData.elims, 0);
    elim2 = at(tmntFullData.elims, 1);

    // only passed through to the mocked buildElimResultsRows
    tmntResults = players.map(makeGameResult);

    elim1Rows = buildRows(finalExample, true);
    // elim 2 (games 4-6): game 4 bowled by 2 players, statuses not set yet
    elim2Rows = [0, 1].map((i) =>
      makeRow({
        player: at(players, i),
        startGame: mockElim2.start,
        games: [200 + i, null, null],
        alive: [null, null, null],
        position: null,
        prize: null,
      })
    );

    mockBuildElimResultsRows.mockImplementation((elimId) =>
      elimId === elim1.id ? elim1Rows : elim2Rows
    );
    // game 1: 205 advances (Player 4), game 2: 225 advances (Player 2)
    mockGetElimAdvancingScores.mockReturnValue(
      new Map<number, number>([
        [1, 205],
        [2, 225],
      ])
    );

    setTmntHook();
    setLoadedState();
  });

  // -------------------------------------------------------------------------
  describe("mock data the tests rely on", () => {
    it("has 2 elims in the scratch division, games 1-3 and 4-6", () => {
      expect(elim1.id).not.toBe(elim2.id);
      expect([elim1.div_id, elim2.div_id]).toEqual([scratchDiv.id, scratchDiv.id]);
      expect([elim1.start, elim1.games]).toEqual([1, 3]);
      expect([elim2.start, elim2.games]).toEqual([4, 3]);
      expect(hdcpDiv.hdcp_per).toBeGreaterThan(0);
    });

    it("has 2 prize funds per elim, $25 and $10, in position order", () => {
      expect(elim1Pfs.map((pf) => [pf.position, pf.amount])).toEqual([
        [1, 25],
        [2, 10],
      ]);
      expect(elim2Pfs.map((pf) => [pf.position, pf.amount])).toEqual([
        [1, 25],
        [2, 10],
      ]);
    });

    it("has at least 8 players", () => {
      expect(players).toHaveLength(8);
    });
  });

  // -------------------------------------------------------------------------
  describe("fetching data", () => {
    it("gets the tournament data for the tmntId param", () => {
      render(<ElimsPage />);
      expect(mockUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("does not fetch results or prizes when both are loaded", () => {
      render(<ElimsPage />);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("fetches both results and prizes when neither is loaded", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "idle";
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "idle";
      render(<ElimsPage />);
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
      expect(mockDispatch).toHaveBeenCalledWith(elimPfsAction);
    });

    it("does not fetch results or prizes before the tournament data loads", () => {
      setTmntHook({ hasData: false });
      mockState.results.tmntId = "";
      mockState.elimPfs.tmntId = "";
      render(<ElimsPage />);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch results or prizes when there are no elims", () => {
      tmntFullData.elims = [];
      setTmntHook();
      mockState.results.tmntId = "";
      mockState.elimPfs.tmntId = "";
      render(<ElimsPage />);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("fetches results when they are for a different tournament", () => {
      mockState.results.tmntId = otherTmntId;
      mockState.results.requestedTmntId = otherTmntId;
      render(<ElimsPage />);
      expect(mockFetchOneTmntGameResults).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
    });

    it("does not fetch results while they are loading", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      render(<ElimsPage />);
      expect(mockFetchOneTmntGameResults).not.toHaveBeenCalled();
    });

    it("does not fetch results again after they failed for this tournament", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      render(<ElimsPage />);
      expect(mockFetchOneTmntGameResults).not.toHaveBeenCalled();
    });

    it("fetches results when the failure was for another tournament", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.results.requestedTmntId = otherTmntId;
      render(<ElimsPage />);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
    });

    it("fetches prizes when they are for a different tournament", () => {
      mockState.elimPfs.tmntId = otherTmntId;
      mockState.elimPfs.requestedTmntId = otherTmntId;
      render(<ElimsPage />);
      expect(mockFetchElimPfs).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(elimPfsAction);
    });

    it("does not fetch prizes while they are loading", () => {
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "loading";
      render(<ElimsPage />);
      expect(mockFetchElimPfs).not.toHaveBeenCalled();
    });

    it("does not fetch prizes again after they failed for this tournament", () => {
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "failed";
      render(<ElimsPage />);
      expect(mockFetchElimPfs).not.toHaveBeenCalled();
    });

    it("fetches prizes when the failure was for another tournament", () => {
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "failed";
      mockState.elimPfs.requestedTmntId = otherTmntId;
      render(<ElimsPage />);
      expect(mockDispatch).toHaveBeenCalledWith(elimPfsAction);
    });
  });

  // -------------------------------------------------------------------------
  describe("tournament data loading and errors", () => {
    it("shows the wait modal while the tournament data loads", () => {
      setTmntHook({ hasData: false });
      render(<ElimsPage />);
      const modal = screen.getByTestId("wait-modal");
      expect(modal).toHaveTextContent("Loading...");
      expect(modal).toHaveAttribute("data-show", "true");
      expect(screen.queryByTestId("tmnt-home-header")).not.toBeInTheDocument();
    });

    it("shows a general error when the tournament fails to load", () => {
      setTmntHook({ hasData: false, failed: true, error: "Network Error" });
      render(<ElimsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`)
      ).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("shows a general error when the failure has no message", () => {
      setTmntHook({ hasData: false, failed: true, error: undefined });
      render(<ElimsPage />);
      expect(
        screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`)
      ).toBeInTheDocument();
    });

    it("shows a missing data error when the tournament is missing a required child", () => {
      setTmntHook({
        hasData: false,
        failed: true,
        error: "tmnt is missing required child: divs",
      });
      render(<ElimsPage />);
      expect(
        screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
      ).toBeInTheDocument();
    });

    it("calls retry when Retry is clicked after a tournament error", async () => {
      const user = userEvent.setup();
      setTmntHook({ hasData: false, failed: true, error: "Network Error" });
      render(<ElimsPage />);
      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(retryTmnt).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("tournament with no elims", () => {
    beforeEach(() => {
      tmntFullData.elims = [];
      setTmntHook();
    });

    it("shows the header and a no elims missing data error", () => {
      render(<ElimsPage />);
      expect(screen.getByTestId("tmnt-home-header")).toHaveTextContent("Elims");
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(/^No Elims for this squad$/);
      expect(alert).toHaveClass("alert", "alert-danger");
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "Select elim" })).not.toBeInTheDocument();
    });

    it("shows the message even while results and prizes are not loaded", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "idle";
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "idle";
      render(<ElimsPage />);
      expect(screen.getByRole("alert")).toHaveTextContent("No Elims for this squad");
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("results loading and errors", () => {
    it("shows the wait modal while the results load", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      render(<ElimsPage />);
      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows the results error message when the results fail", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.results.error = "Results server error";
      render(<ElimsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament results" })
      ).toBeInTheDocument();
      expect(screen.getByText("Results server error")).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows a default error when the results fail with no message", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      render(<ElimsPage />);
      expect(
        screen.getByText(
          `An error occurred while loading games for tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("fetches the results again when Retry is clicked", async () => {
      const user = userEvent.setup();
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      render(<ElimsPage />);
      expect(mockDispatch).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
    });
  });

  // -------------------------------------------------------------------------
  describe("prizes loading and errors", () => {
    it("shows the wait modal while the prizes load", () => {
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "loading";
      render(<ElimsPage />);
      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows the prizes error message when the prizes fail", () => {
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "failed";
      mockState.elimPfs.error = "Prizes server error";
      render(<ElimsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament prizes" })
      ).toBeInTheDocument();
      expect(screen.getByText("Prizes server error")).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows a default error when the prizes fail with no message", () => {
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "failed";
      render(<ElimsPage />);
      expect(
        screen.getByText(
          `An error occurred while loading prizes for tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("fetches the prizes again when Retry is clicked", async () => {
      const user = userEvent.setup();
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "failed";
      render(<ElimsPage />);
      expect(mockDispatch).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(elimPfsAction);
    });

    it("shows the results error before the prizes error", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "failed";
      render(<ElimsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament results" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Unable to load tournament prizes" })
      ).not.toBeInTheDocument();
    });

    it("shows the wait modal for loading results before the prizes error", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "failed";
      render(<ElimsPage />);
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Unable to load tournament prizes" })
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("missing division", () => {
    it("shows an error when the active elim's division is not found", () => {
      tmntFullData.elims = [{ ...elim1, div_id: "div_00000000000000000000000000000000" }];
      setTmntHook();
      render(<ElimsPage />);
      expect(screen.getByTestId("tmnt-home-header")).toHaveTextContent("Elims");
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(/^Division data for active eliminator not found$/);
      expect(alert).toHaveClass("alert", "alert-danger");
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "Select elim" })).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("loaded page", () => {
    it("renders the tournament header with the Elims button selected", () => {
      render(<ElimsPage />);
      const props = mockTmntHomeHeader.mock.lastCall?.[0];
      expect(props?.tmntFullData).toBe(tmntFullData);
      expect(props?.selectedTmntPageBtn).toBe("Elims");
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("builds the rows with only the active elim's prize funds", () => {
      render(<ElimsPage />);
      expect(mockBuildElimResultsRows).toHaveBeenCalledWith(
        elim1.id,
        tmntFullData,
        tmntResults,
        elim1Pfs
      );
      expect(mockGetElimAdvancingScores).toHaveBeenCalledWith(elim1Rows, elim1);
    });

    it("does not build rows before the results and prizes are loaded", () => {
      mockState.elimPfs.tmntId = "";
      mockState.elimPfs.loadStatus = "loading";
      render(<ElimsPage />);
      expect(mockBuildElimResultsRows).not.toHaveBeenCalled();
    });

    it("renders a button for each elim using its name", () => {
      render(<ElimsPage />);
      const buttons = getElimButtons();
      expect(buttons).toHaveLength(2);
      tmntFullData.elims.forEach((elim, i) => {
        expect(at(buttons, i)).toHaveTextContent(getBrktOrElimName(elim, tmntFullData.divs));
        expect(at(buttons, i)).toHaveClass("btn", "btn-outline-primary");
        expect(at(buttons, i)).toHaveAttribute("type", "button");
      });
    });

    it("shows no missing data error", () => {
      render(<ElimsPage />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("selects the first elim by default", () => {
      render(<ElimsPage />);
      expect(at(getElimButtons(), 0)).toHaveClass("active");
      expect(at(getElimButtons(), 1)).not.toHaveClass("active");
    });

    it("shows the table with no body rows when no one entered the elim", () => {
      elim1Rows = [];
      render(<ElimsPage />);
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(getBodyRows()).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  describe("table headers", () => {
    it("renders position, name, one column per elim game, and prize", () => {
      render(<ElimsPage />);
      const headers = screen.getAllByRole("columnheader");
      // blank position + name + 3 games + prize
      expect(headers).toHaveLength(6);
      expect(getHeader(1)).toHaveTextContent(/^Name$/);
      expect(getHeader(1)).toHaveStyle({ width: "140px" });
      expect(getHeader(5)).toHaveTextContent(/^Prize$/);
      expect(getHeader(5)).toHaveStyle({ width: "85px" });
    });

    it("uses a 40px position column for 100 or fewer rows", () => {
      render(<ElimsPage />);
      expect(getHeader(0)).toHaveStyle({ width: "40px" });
    });

    it("uses a 55px position column for more than 100 rows", () => {
      elim1Rows = Array.from({ length: 101 }, (_, i) =>
        makeRow({
          player: { ...at(players, 0), id: `ply_test_many_${i}` },
          startGame: 1,
          games: [200, null, null],
          alive: [null, null, null],
          position: null,
          prize: null,
        })
      );
      render(<ElimsPage />);
      expect(getHeader(0)).toHaveStyle({ width: "55px" });
    });

    it("uses 135px game columns when the division has a handicap", () => {
      setElimsDiv(hdcpDiv);
      render(<ElimsPage />);
      [2, 3, 4].forEach((i) => {
        expect(getHeader(i)).toHaveStyle({ width: "135px" });
      });
    });

    it("uses 60px game columns when the division is scratch", () => {
      render(<ElimsPage />);
      [2, 3, 4].forEach((i) => {
        expect(getHeader(i)).toHaveStyle({ width: "60px" });
      });
    });

    it("numbers the game columns from the elim's start game", () => {
      render(<ElimsPage />);
      expect(getHeader(2)).toHaveTextContent(/^1/);
      expect(getHeader(3)).toHaveTextContent(/^2/);
      expect(getHeader(4)).toHaveTextContent(/^3$/);
    });

    it.each([
      [1, 205],
      [2, 225],
    ])("marks game %i with its advancing score of %i", (gameNum, advScore) => {
      render(<ElimsPage />);
      const header = getHeader(1 + gameNum);
      const marker = within(header).getByLabelText(`Advancing score ${advScore} or more`);
      expect(marker).toHaveClass("text-primary");
      expect(marker).toHaveAttribute("tabindex", "0");

      const tooltip = within(header).getByRole("tooltip");
      expect(tooltip).toHaveAttribute("id", `elim-game-${gameNum}-tooltip`);
      expect(tooltip).toHaveTextContent(`Advancing score >= ${advScore}`);
    });

    it("does not mark the last game, which has no advancing score", () => {
      render(<ElimsPage />);
      const game3Header = getHeader(4);
      expect(within(game3Header).queryByRole("tooltip")).not.toBeInTheDocument();
      expect(within(game3Header).queryByLabelText(/Advancing score/)).not.toBeInTheDocument();
    });

    it("marks no games when there are no advancing scores", () => {
      mockGetElimAdvancingScores.mockReturnValue(new Map<number, number>());
      render(<ElimsPage />);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("table rows", () => {
    it("renders one row per player", () => {
      render(<ElimsPage />);
      expect(getBodyRows()).toHaveLength(elim1Rows.length);
    });

    it("links each player's name to their standings page", () => {
      render(<ElimsPage />);
      elim1Rows.forEach((row) => {
        const link = screen.getByRole("link", { name: row.full_name });
        expect(link).toHaveAttribute(
          "href",
          `/results/tmnt/${tmntId}/standings/div/${elim1.div_id}/player/${row.player_id}`
        );
        expect(link).toHaveClass("p-0");
      });
    });

    it("renders a position, name, game and prize cell for every player", () => {
      render(<ElimsPage />);
      getBodyRows().forEach((tr) => {
        // position + name + 3 games + prize
        expect(within(tr).getAllByRole("cell")).toHaveLength(6);
      });
    });

    it("passes the row, the elim's division and the game number to ElimGame", () => {
      render(<ElimsPage />);
      const props = mockElimGame.mock.calls[0]?.[0];
      expect(props?.row).toBe(elim1Rows[0]);
      expect(props?.elimDiv).toEqual(scratchDiv);
      expect(props?.gameNum).toBe(1);
      // one ElimGame per player per game (the page renders twice: mounted effect)
      expect(mockElimGame.mock.calls.slice(0, 3).map((call) => call[0].gameNum)).toEqual([
        1, 2, 3,
      ]);
      expect(mockElimGame.mock.lastCall?.[0].row).toBe(elim1Rows[7]);
      expect(mockElimGame.mock.lastCall?.[0].gameNum).toBe(3);
    });

    it("marks the last paying row as the cut row", () => {
      render(<ElimsPage />);
      const rows = getBodyRows();
      // elim 1 pays 2 places, so index 1 is the cut row
      expect(at(rows, 1)).toHaveClass("cut-row");
      rows
        .filter((_, i) => i !== 1)
        .forEach((tr) => {
          expect(tr).not.toHaveClass("cut-row");
        });
    });

    it("does not mark a cut row when the elim has no prize funds", () => {
      mockState.elimPfs.elimPfs = elim2Pfs;
      render(<ElimsPage />);
      getBodyRows().forEach((tr) => {
        expect(tr).not.toHaveClass("cut-row");
      });
    });
  });

  // -------------------------------------------------------------------------
  describe("game cells", () => {
    describe("results final", () => {
      const expected = toCellViews(finalExample);

      it.each(finalExample.map((_, i) => [i + 1, i]))(
        "Player %i shows the right scores and status icons",
        (_playerNum, rowIndex) => {
          render(<ElimsPage />);
          at(expected, rowIndex).forEach((view, i) => {
            expectGameCell(getCell(rowIndex, 2 + i), view);
          });
        }
      );

      it("shows Advanced in the last game for the players never eliminated", () => {
        render(<ElimsPage />);
        [0, 1].forEach((rowIndex) => {
          expect(
            within(getCell(rowIndex, 4)).getByRole("img", { name: "Advanced" })
          ).toBeInTheDocument();
        });
      });

      it("shows no score and no icon after the game a player was eliminated", () => {
        render(<ElimsPage />);
        // Players 3-4 out in game 2: game 3 blank
        [2, 3].forEach((rowIndex) => {
          expectGameCell(getCell(rowIndex, 4), null);
        });
        // Players 5-8 out in game 1: games 2 and 3 blank
        [4, 5, 6, 7].forEach((rowIndex) => {
          expectGameCell(getCell(rowIndex, 3), null);
          expectGameCell(getCell(rowIndex, 4), null);
        });
      });

      it("shows 8 Advanced and 6 Eliminated icons in all", () => {
        render(<ElimsPage />);
        // game 1: 4 advanced, 4 out; game 2: 2 advanced, 2 out; game 3: 2 advanced
        expect(screen.getAllByRole("img", { name: "Advanced" })).toHaveLength(8);
        expect(screen.getAllByRole("img", { name: "Eliminated" })).toHaveLength(6);
      });
    });

    describe("results in progress (game 3 not bowled)", () => {
      beforeEach(() => {
        elim1Rows = buildRows(inProgressExample, false);
      });

      it.each(inProgressExample.map((_, i) => [i + 1, i]))(
        "Player %i shows the right scores and status icons",
        (_playerNum, rowIndex) => {
          render(<ElimsPage />);
          at(toCellViews(inProgressExample), rowIndex).forEach((view, i) => {
            expectGameCell(getCell(rowIndex, 2 + i), view);
          });
        }
      );

      it("shows game 3 blank for every player", () => {
        render(<ElimsPage />);
        getBodyRows().forEach((_, rowIndex) => {
          expectGameCell(getCell(rowIndex, 4), null);
        });
      });
    });

    it("shows scores but no status icons until every game 2 score is entered", () => {
      // Players 1-2 bowled game 2, Players 3-4 have not; game 2 statuses not set yet
      elim1Rows = buildRows(
        inProgressExample.map((row, i) => ({
          games: [at(row.games, 0), i < 2 ? at(row.games, 1) : null, null],
          alive: [at(row.alive, 0), null, null],
          prize: null,
        })),
        false
      );
      render(<ElimsPage />);
      expectGameCell(getCell(0, 3), { text: "255", status: null });
      expectGameCell(getCell(1, 3), { text: "225", status: null });
      expectGameCell(getCell(2, 3), null);
    });

    it("shows the score with its handicap breakdown in a handicap division", () => {
      setElimsDiv(hdcpDiv);
      elim1Rows = buildRows(finalExample, true, 15);
      render(<ElimsPage />);
      // Player 1 game 1: 245 + 15
      const cell = getCell(0, 2);
      expect(cell).toHaveTextContent(/^260 \(245 \+ 15\)$/);
      expect(within(cell).getByRole("img", { name: "Advanced" })).toBeInTheDocument();
      expect(mockElimGame.mock.lastCall?.[0].elimDiv).toEqual(hdcpDiv);
    });

    it("shows only the score in a scratch division", () => {
      render(<ElimsPage />);
      expect(getCell(0, 2)).toHaveTextContent(/^245$/);
      expect(within(getCell(0, 2)).queryByText(/\+/)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("positions and prizes", () => {
    describe("results in progress", () => {
      beforeEach(() => {
        elim1Rows = buildRows(inProgressExample, false);
      });

      it("leaves the position blank", () => {
        render(<ElimsPage />);
        getBodyRows().forEach((_, i) => {
          expect(getCell(i, 0)).toBeEmptyDOMElement();
        });
      });

      it("shows the prize fund for each paying place", () => {
        render(<ElimsPage />);
        expect(getCell(0, 5)).toHaveTextContent(/^\$25\.00$/);
        expect(getCell(1, 5)).toHaveTextContent(/^\$10\.00$/);
        elim1Rows.slice(2).forEach((_, i) => {
          expect(getCell(i + 2, 5)).toHaveTextContent(/^$/);
        });
      });

      it("shows no prizes when the elim has no prize funds", () => {
        mockState.elimPfs.elimPfs = elim2Pfs;
        render(<ElimsPage />);
        elim1Rows.forEach((_, i) => {
          expect(getCell(i, 5)).toHaveTextContent(/^$/);
        });
      });
    });

    describe("results final", () => {
      it("shows each player's position", () => {
        render(<ElimsPage />);
        elim1Rows.forEach((_, i) => {
          expect(getCell(i, 0)).toHaveTextContent(new RegExp(`^${i + 1}$`));
        });
      });

      it("shows each player's prize", () => {
        render(<ElimsPage />);
        expect(getCell(0, 5)).toHaveTextContent(/^\$25\.00$/);
        expect(getCell(1, 5)).toHaveTextContent(/^\$10\.00$/);
        elim1Rows.slice(2).forEach((_, i) => {
          expect(getCell(i + 2, 5)).toHaveTextContent(/^$/);
        });
      });

      it("uses the row's prize, not the prize fund amounts", () => {
        // a tie for first splits $25 + $10 = $35, so each gets $17.50
        elim1Rows = buildRows(
          finalExample.map((row, i) => ({ ...row, prize: i < 2 ? 17.5 : null })),
          true
        );
        render(<ElimsPage />);
        expect(getCell(0, 5)).toHaveTextContent(/^\$17\.50$/);
        expect(getCell(1, 5)).toHaveTextContent(/^\$17\.50$/);
        expect(screen.queryByText("$25.00")).not.toBeInTheDocument();
        expect(screen.queryByText("$10.00")).not.toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  describe("selecting an elim", () => {
    it("shows the selected elim's games, rows and prizes", async () => {
      const user = userEvent.setup();
      render(<ElimsPage />);
      await user.click(at(getElimButtons(), 1));

      expect(at(getElimButtons(), 1)).toHaveClass("active");
      expect(at(getElimButtons(), 0)).not.toHaveClass("active");

      expect(mockBuildElimResultsRows).toHaveBeenLastCalledWith(
        elim2.id,
        tmntFullData,
        tmntResults,
        elim2Pfs
      );
      expect(mockGetElimAdvancingScores).toHaveBeenLastCalledWith(elim2Rows, elim2);

      // elim 2 covers games 4-6
      expect(screen.getAllByRole("columnheader")).toHaveLength(6);
      expect(getHeader(2)).toHaveTextContent(/^4$/);
      expect(getHeader(3)).toHaveTextContent(/^5$/);
      expect(getHeader(4)).toHaveTextContent(/^6$/);

      expect(getBodyRows()).toHaveLength(elim2Rows.length);
      expectGameCell(getCell(0, 2), { text: "200", status: null });
      expectGameCell(getCell(0, 3), null);
      expectGameCell(getCell(1, 2), { text: "201", status: null });
      expect(getCell(0, 5)).toHaveTextContent(/^\$25\.00$/);
      expect(getCell(1, 5)).toHaveTextContent(/^\$10\.00$/);
      // elim 2 pays 2 places
      expect(at(getBodyRows(), 1)).toHaveClass("cut-row");
    });

    it("switches back to the first elim", async () => {
      const user = userEvent.setup();
      render(<ElimsPage />);
      await user.click(at(getElimButtons(), 1));
      await user.click(at(getElimButtons(), 0));

      expect(at(getElimButtons(), 0)).toHaveClass("active");
      expect(getBodyRows()).toHaveLength(elim1Rows.length);
      expect(getHeader(2)).toHaveTextContent(/^1/);
    });

    it("falls back to the first elim when the selected elim no longer exists", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ElimsPage />);
      await user.click(at(getElimButtons(), 1));

      tmntFullData = { ...tmntFullData, elims: [elim1] };
      setTmntHook();
      rerender(<ElimsPage />);

      expect(getElimButtons()).toHaveLength(1);
      expect(at(getElimButtons(), 0)).toHaveClass("active");
      expect(getBodyRows()).toHaveLength(elim1Rows.length);
    });
  });
});


// // test/app/results/tmnts/elims/elimsPage.test.tsx
// // tests for src/app/results/tmnt/[tmntId]/elims/page.tsx
// import React from "react";
// import { render, screen, within } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import "@testing-library/jest-dom";
// import { cloneDeep } from "lodash";
// import { useParams } from "next/navigation";
// import ElimsPage from "@/app/results/tmnt/[tmntId]/elims/page";
// import ElimGame from "@/app/results/tmnt/[tmntId]/elims/elimGame";
// import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
// import { useTmntFullData } from "@/hooks/useTmntFullData";
// import {
//   buildElimResultsRows,
//   elimResults,
//   erAliveKey,
//   getElimAdvancingScores,
// } from "@/lib/results/elims/elimResults";
// import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
// import { fetchElimPfs } from "@/redux/features/elimPfs/elimPfsSlice";
// import { getBrktOrElimName } from "@/lib/getName";
// import { tgrGameKey, tgrHdcpKey, tmntGameResult } from "@/lib/types/resultsTypes";
// import { elimPfType, elimType, tmntFullType } from "@/lib/types/types";
// import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// // ---------------------------------------------------------------------------
// // redux state used by the mocked selectors
// // ---------------------------------------------------------------------------

// type loadStatusType = "idle" | "loading" | "succeeded" | "failed";

// type MockState = {
//   results: {
//     requestedTmntId: string;
//     tmntId: string;
//     loadStatus: loadStatusType;
//     error: string | null;
//     games: tmntGameResult[];
//   };
//   elimPfs: {
//     requestedTmntId: string;
//     tmntId: string;
//     loadStatus: loadStatusType;
//     error: string | null;
//     elimPfs: elimPfType[];
//   };
// };

// let mockState: MockState;
// const mockDispatch = jest.fn();

// // ---------------------------------------------------------------------------
// // mocks
// // ---------------------------------------------------------------------------

// jest.mock("next/navigation", () => ({
//   useParams: jest.fn(),
// }));

// jest.mock("next/link", () => {
//   const { createElement } = jest.requireActual<typeof import("react")>("react");
//   return {
//     __esModule: true,
//     default: (props: { href: string; className?: string; children: React.ReactNode }) =>
//       createElement("a", { href: props.href, className: props.className }, props.children),
//   };
// });

// // render next/image as a plain img (used by the real ElimGame status icons)
// jest.mock("next/image", () => {
//   const { createElement } = jest.requireActual<typeof import("react")>("react");
//   return {
//     __esModule: true,
//     default: (props: { src: string; alt: string; title?: string; className?: string }) =>
//       createElement("img", {
//         src: props.src,
//         alt: props.alt,
//         title: props.title,
//         className: props.className,
//       }),
//   };
// });

// // render the tooltip inline so its text can be checked without hover timers
// jest.mock("react-bootstrap", () => {
//   const { createElement, Fragment } = jest.requireActual<typeof import("react")>("react");
//   return {
//     OverlayTrigger: (props: { children: React.ReactNode; overlay: React.ReactNode }) =>
//       createElement(Fragment, null, props.children, props.overlay),
//     Tooltip: (props: { id: string; children: React.ReactNode }) =>
//       createElement("div", { role: "tooltip", id: props.id }, props.children),
//   };
// });

// jest.mock("react-redux", () => ({
//   useDispatch: () => mockDispatch,
//   useSelector: (selector: (state: MockState) => unknown) => selector(mockState),
// }));

// jest.mock("@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice", () => ({
//   fetchOneTmntGameResults: jest.fn((tmntId: string) => ({
//     type: "oneTmntGameResults/fetch",
//     payload: tmntId,
//   })),
//   getOneTmntGameResultsRequestedTmntId: (s: MockState) => s.results.requestedTmntId,
//   getOneTmntGameResultsTmntId: (s: MockState) => s.results.tmntId,
//   getOneTmntGameResultsLoadStatus: (s: MockState) => s.results.loadStatus,
//   getOneTmntGameResultsError: (s: MockState) => s.results.error,
//   selectOneTmntGameResults: (s: MockState) => s.results.games,
// }));

// jest.mock("@/redux/features/elimPfs/elimPfsSlice", () => ({
//   fetchElimPfs: jest.fn((tmntId: string) => ({
//     type: "elimPfs/fetch",
//     payload: tmntId,
//   })),
//   getElimPfsRequestedTmntId: (s: MockState) => s.elimPfs.requestedTmntId,
//   getElimPfsTmntId: (s: MockState) => s.elimPfs.tmntId,
//   getElimPfsLoadStatus: (s: MockState) => s.elimPfs.loadStatus,
//   getElimPfsError: (s: MockState) => s.elimPfs.error,
//   selectElimPfs: (s: MockState) => s.elimPfs.elimPfs,
// }));

// jest.mock("@/hooks/useTmntFullData", () => ({
//   useTmntFullData: jest.fn(),
// }));

// // keep the real key helpers; mock the row builders
// jest.mock("@/lib/results/elims/elimResults", () => ({
//   ...jest.requireActual("@/lib/results/elims/elimResults"),
//   buildElimResultsRows: jest.fn(),
//   getElimAdvancingScores: jest.fn(),
// }));

// // the real ElimGame, wrapped in a jest.fn so its props can be checked
// jest.mock("@/app/results/tmnt/[tmntId]/elims/elimGame", () => {
//   const { createElement } = jest.requireActual<typeof import("react")>("react");
//   const actual = jest.requireActual("@/app/results/tmnt/[tmntId]/elims/elimGame");
//   return {
//     __esModule: true,
//     default: jest.fn((props: Record<string, unknown>) => createElement(actual.default, props)),
//   };
// });

// jest.mock("@/components/modal/waitModal", () => {
//   const { createElement } = jest.requireActual<typeof import("react")>("react");
//   return {
//     __esModule: true,
//     default: jest.fn((props: { show: boolean; message: string }) =>
//       createElement(
//         "div",
//         { "data-testid": "wait-modal", "data-show": String(props.show) },
//         props.message
//       )
//     ),
//   };
// });

// jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => {
//   const { createElement } = jest.requireActual<typeof import("react")>("react");
//   return {
//     __esModule: true,
//     default: jest.fn((props: { selectedTmntPageBtn: string }) =>
//       createElement("div", { "data-testid": "tmnt-home-header" }, props.selectedTmntPageBtn)
//     ),
//   };
// });

// const mockUseParams = useParams as jest.Mock;
// const mockUseTmntFullData = useTmntFullData as jest.MockedFunction<typeof useTmntFullData>;
// const mockBuildElimResultsRows = buildElimResultsRows as jest.MockedFunction<
//   typeof buildElimResultsRows
// >;
// const mockGetElimAdvancingScores = getElimAdvancingScores as jest.MockedFunction<
//   typeof getElimAdvancingScores
// >;
// const mockFetchOneTmntGameResults = fetchOneTmntGameResults as unknown as jest.Mock;
// const mockFetchElimPfs = fetchElimPfs as unknown as jest.Mock;
// const mockTmntHomeHeader = TmntHomeHeader as unknown as jest.Mock;
// const mockElimGame = ElimGame as unknown as jest.Mock;

// // ---------------------------------------------------------------------------
// // test data
// // ---------------------------------------------------------------------------

// const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
// const otherTmntId = "tmt_00000000000000000000000000000000";

// const resultsAction = { type: "oneTmntGameResults/fetch", payload: tmntId };
// const elimPfsAction = { type: "elimPfs/fetch", payload: tmntId };

// /*
//  * Rows follow the rules of buildElimResultsRows:
//  *  - [Game N Alive] stays null until [Game N] is set for ALL players
//  *  - once [Game N Alive] is false, every later game is null and so is its status
//  *  - the last game of the elim has no status
//  */
// type rowValues = {
//   player_id: string;
//   full_name: string;
//   startGame: number;
//   games: (number | null)[];
//   alive: (boolean | null)[];
//   position: number | null;
//   prize: number | null;
//   hdcp?: number;
// };

// const makeRow = ({
//   player_id,
//   full_name,
//   startGame,
//   games,
//   alive,
//   position,
//   prize,
//   hdcp = 0,
// }: rowValues): elimResults => {
//   const row: Record<string, unknown> = { position, player_id, full_name, hdcp, prize };
//   games.forEach((game, i) => {
//     const gameNum = startGame + i;
//     row[tgrGameKey(gameNum)] = game;
//     row[tgrHdcpKey(gameNum)] = game == null ? null : game + hdcp;
//     row[erAliveKey(gameNum)] = alive[i];
//   });
//   return row as unknown as elimResults;
// };

// /*
//  * 8 players, 3 game elim, pays 2 places ($20, $10). Final results:
//  *
//  *            Game 1   Game 2   Game 3   Prize
//  *  Player 1   245 ✓    255 ✓    244     $20.00
//  *  Player 2   235 ✓    225 ✓    222     $10.00
//  *  Player 3   215 ✓    220 ✗
//  *  Player 4   205 ✓    200 ✗
//  *  Player 5   195 ✗
//  *  Player 6   185 ✗
//  *  Player 7   175 ✗
//  *  Player 8   165 ✗
//  */
// type exampleRow = {
//   games: (number | null)[];
//   alive: (boolean | null)[];
//   prize: number | null;
// };

// const finalExample: exampleRow[] = [
//   { games: [245, 255, 244], alive: [true, true, null], prize: 20 },
//   { games: [235, 225, 222], alive: [true, true, null], prize: 10 },
//   { games: [215, 220, null], alive: [true, false, null], prize: null },
//   { games: [205, 200, null], alive: [true, false, null], prize: null },
//   { games: [195, null, null], alive: [false, null, null], prize: null },
//   { games: [185, null, null], alive: [false, null, null], prize: null },
//   { games: [175, null, null], alive: [false, null, null], prize: null },
//   { games: [165, null, null], alive: [false, null, null], prize: null },
// ];

// // same tournament after game 2, before game 3 is bowled
// const inProgressExample: exampleRow[] = finalExample.map((row) => ({
//   games: [row.games[0], row.games[1], null],
//   alive: [row.alive[0], row.alive[1], null],
//   prize: null,
// }));

// const playerIds = finalExample.map((_, i) => `ply_test_${i + 1}`);

// const buildRows = (example: exampleRow[], final: boolean): elimResults[] =>
//   example.map((row, i) =>
//     makeRow({
//       player_id: playerIds[i],
//       full_name: `Player ${i + 1}`,
//       startGame: 1,
//       games: row.games,
//       alive: row.alive,
//       position: final ? i + 1 : null,
//       prize: row.prize,
//     })
//   );

// // what each game cell shows: [score, status] or null for a blank cell
// type cellView = [number, "Advanced" | "Eliminated" | null] | null;

// const toCellViews = (example: exampleRow[]): cellView[][] =>
//   example.map((row) =>
//     row.games.map((game, i) => {
//       if (game == null) return null;
//       const alive = row.alive[i];
//       return [game, alive == null ? null : alive ? "Advanced" : "Eliminated"];
//     })
//   );

// describe("ElimsPage", () => {
//   let tmntFullData: tmntFullType;
//   let elim1: elimType;
//   let elim2: elimType;
//   let elimPfs: elimPfType[];
//   let tmntResults: tmntGameResult[];
//   let elim1Rows: elimResults[];
//   let elim2Rows: elimResults[];
//   let retryTmnt: jest.Mock;

//   const setTmntHook = (overrides: Partial<ReturnType<typeof useTmntFullData>> = {}) => {
//     mockUseTmntFullData.mockReturnValue({
//       data: tmntFullData,
//       hasData: true,
//       failed: false,
//       error: undefined,
//       retry: retryTmnt,
//       ...overrides,
//     } as unknown as ReturnType<typeof useTmntFullData>);
//   };

//   const setLoadedState = () => {
//     mockState = {
//       results: {
//         requestedTmntId: tmntId,
//         tmntId,
//         loadStatus: "succeeded",
//         error: null,
//         games: tmntResults,
//       },
//       elimPfs: {
//         requestedTmntId: tmntId,
//         tmntId,
//         loadStatus: "succeeded",
//         error: null,
//         elimPfs,
//       },
//     };
//   };

//   const setDivHdcp = (div_id: string, hdcp_per: number) => {
//     tmntFullData.divs = tmntFullData.divs.map((d) =>
//       d.id === div_id ? { ...d, hdcp_per } : d
//     );
//     setTmntHook();
//   };

//   const getElimButtons = () =>
//     within(screen.getByRole("group", { name: "Select elim" })).getAllByRole("button");

//   // all rows except the header row
//   const getBodyRows = () => screen.getAllByRole("row").slice(1);

//   const getCells = (rowIndex: number) =>
//     within(getBodyRows()[rowIndex]).getAllByRole("cell");

//   // checks one game cell against what it should show
//   const expectGameCell = (cell: HTMLElement, view: cellView) => {
//     if (view == null) {
//       // blank: no score and no status icon
//       expect(cell).toHaveTextContent(/^$/);
//       expect(within(cell).queryByRole("img")).not.toBeInTheDocument();
//       return;
//     }
//     const [score, status] = view;
//     expect(cell).toHaveTextContent(new RegExp(`^${score}$`));
//     if (status == null) {
//       expect(within(cell).queryByRole("img")).not.toBeInTheDocument();
//     } else {
//       expect(within(cell).getAllByRole("img")).toHaveLength(1);
//       expect(within(cell).getByRole("img", { name: status })).toBeInTheDocument();
//     }
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();

//     mockUseParams.mockReturnValue({ tmntId });
//     retryTmnt = jest.fn();

//     tmntFullData = cloneDeep(mockTmntFullData);
//     const divId = tmntFullData.divs[0].id;

//     // elim 1: games 1-3; elim 2: games 2-3
//     elim1 = { ...tmntFullData.elims[0], div_id: divId, start: 1, games: 3 } as elimType;
//     elim2 = { ...tmntFullData.elims[1], div_id: divId, start: 2, games: 2 } as elimType;
//     tmntFullData.elims = [elim1, elim2];

//     // elim 1 pays 2 places, elim 2 pays 1 place
//     elimPfs = [
//       { id: "epf_test_1", elim_id: elim1.id, amount: 20 },
//       { id: "epf_test_2", elim_id: elim1.id, amount: 10 },
//       { id: "epf_test_3", elim_id: elim2.id, amount: 75 },
//     ] as elimPfType[];

//     tmntResults = [{ player_id: playerIds[0] }] as unknown as tmntGameResult[];

//     elim1Rows = buildRows(finalExample, true);
//     elim2Rows = [
//       makeRow({
//         player_id: playerIds[0],
//         full_name: "Player 1",
//         startGame: 2,
//         games: [255, null],
//         alive: [null, null],
//         position: null,
//         prize: null,
//       }),
//     ];

//     mockBuildElimResultsRows.mockImplementation((elimId) =>
//       elimId === elim1.id ? elim1Rows : elim2Rows
//     );
//     // game 1: 205 advances (Player 4), game 2: 225 advances (Player 2)
//     mockGetElimAdvancingScores.mockReturnValue(
//       new Map<number, number>([
//         [1, 205],
//         [2, 225],
//       ])
//     );

//     // scratch division, so scores show without a handicap breakdown
//     setDivHdcp(divId, 0);
//     setLoadedState();
//   });

//   // -------------------------------------------------------------------------
//   it("has test data the tests rely on", () => {
//     expect(elim1.id).not.toBe(elim2.id);
//     expect(tmntFullData.divs.find((d) => d.id === elim1.div_id)).toBeDefined();
//   });

//   // -------------------------------------------------------------------------
//   describe("fetching data", () => {
//     it("gets the tournament data for the tmntId param", () => {
//       render(<ElimsPage />);
//       expect(mockUseTmntFullData).toHaveBeenCalledWith(tmntId);
//     });

//     it("does not fetch results or prizes when both are loaded", () => {
//       render(<ElimsPage />);
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("does not fetch results or prizes before the tournament data loads", () => {
//       setTmntHook({ hasData: false });
//       mockState.results.tmntId = "";
//       mockState.elimPfs.tmntId = "";
//       render(<ElimsPage />);
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("does not fetch results or prizes when there are no elims", () => {
//       tmntFullData.elims = [];
//       setTmntHook();
//       mockState.results.tmntId = "";
//       mockState.elimPfs.tmntId = "";
//       render(<ElimsPage />);
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("fetches results when they are for a different tournament", () => {
//       mockState.results.tmntId = otherTmntId;
//       mockState.results.requestedTmntId = otherTmntId;
//       render(<ElimsPage />);
//       expect(mockFetchOneTmntGameResults).toHaveBeenCalledWith(tmntId);
//       expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
//     });

//     it("does not fetch results while they are loading", () => {
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "loading";
//       render(<ElimsPage />);
//       expect(mockFetchOneTmntGameResults).not.toHaveBeenCalled();
//     });

//     it("does not fetch results again after they failed for this tournament", () => {
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "failed";
//       render(<ElimsPage />);
//       expect(mockFetchOneTmntGameResults).not.toHaveBeenCalled();
//     });

//     it("fetches results when the failure was for another tournament", () => {
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "failed";
//       mockState.results.requestedTmntId = otherTmntId;
//       render(<ElimsPage />);
//       expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
//     });

//     it("fetches prizes when they are for a different tournament", () => {
//       mockState.elimPfs.tmntId = otherTmntId;
//       mockState.elimPfs.requestedTmntId = otherTmntId;
//       render(<ElimsPage />);
//       expect(mockFetchElimPfs).toHaveBeenCalledWith(tmntId);
//       expect(mockDispatch).toHaveBeenCalledWith(elimPfsAction);
//     });

//     it("does not fetch prizes while they are loading", () => {
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "loading";
//       render(<ElimsPage />);
//       expect(mockFetchElimPfs).not.toHaveBeenCalled();
//     });

//     it("does not fetch prizes again after they failed for this tournament", () => {
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "failed";
//       render(<ElimsPage />);
//       expect(mockFetchElimPfs).not.toHaveBeenCalled();
//     });

//     it("fetches prizes when the failure was for another tournament", () => {
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "failed";
//       mockState.elimPfs.requestedTmntId = otherTmntId;
//       render(<ElimsPage />);
//       expect(mockDispatch).toHaveBeenCalledWith(elimPfsAction);
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("tournament data loading and errors", () => {
//     it("shows the wait modal while the tournament data loads", () => {
//       setTmntHook({ hasData: false });
//       render(<ElimsPage />);
//       const modal = screen.getByTestId("wait-modal");
//       expect(modal).toHaveTextContent("Loading...");
//       expect(modal).toHaveAttribute("data-show", "true");
//       expect(screen.queryByTestId("tmnt-home-header")).not.toBeInTheDocument();
//     });

//     it("shows a general error when the tournament fails to load", () => {
//       setTmntHook({ hasData: false, failed: true, error: "Network Error" });
//       render(<ElimsPage />);
//       expect(
//         screen.getByRole("heading", { name: "Unable to load tournament" })
//       ).toBeInTheDocument();
//       expect(
//         screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`)
//       ).toBeInTheDocument();
//     });

//     it("shows a general error when the failure has no message", () => {
//       setTmntHook({ hasData: false, failed: true, error: undefined });
//       render(<ElimsPage />);
//       expect(
//         screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`)
//       ).toBeInTheDocument();
//     });

//     it("shows a missing data error when the tournament is missing a required child", () => {
//       setTmntHook({
//         hasData: false,
//         failed: true,
//         error: "tmnt is missing required child: divs",
//       });
//       render(<ElimsPage />);
//       expect(
//         screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
//       ).toBeInTheDocument();
//     });

//     it("calls retry when Retry is clicked after a tournament error", async () => {
//       const user = userEvent.setup();
//       setTmntHook({ hasData: false, failed: true, error: "Network Error" });
//       render(<ElimsPage />);
//       await user.click(screen.getByRole("button", { name: "Retry" }));
//       expect(retryTmnt).toHaveBeenCalledTimes(1);
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("tournament with no elims", () => {
//     beforeEach(() => {
//       tmntFullData.elims = [];
//       setTmntHook();
//     });

//     it("shows the header and a no eliminators message", () => {
//       render(<ElimsPage />);
//       expect(screen.getByTestId("tmnt-home-header")).toHaveTextContent("Elims");
//       expect(
//         screen.getByText("No eliminators are available for this tournament.")
//       ).toBeInTheDocument();
//       expect(screen.queryByRole("table")).not.toBeInTheDocument();
//     });

//     it("shows the message even while results and prizes are not loaded", () => {
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "idle";
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "idle";
//       render(<ElimsPage />);
//       expect(
//         screen.getByText("No eliminators are available for this tournament.")
//       ).toBeInTheDocument();
//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("results loading and errors", () => {
//     it("shows the wait modal while the results load", () => {
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "loading";
//       render(<ElimsPage />);
//       expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
//       expect(screen.queryByRole("table")).not.toBeInTheDocument();
//     });

//     it("shows the results error message when the results fail", () => {
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "failed";
//       mockState.results.error = "Results server error";
//       render(<ElimsPage />);
//       expect(
//         screen.getByRole("heading", { name: "Unable to load tournament results" })
//       ).toBeInTheDocument();
//       expect(screen.getByText("Results server error")).toBeInTheDocument();
//     });

//     it("shows a default error when the results fail with no message", () => {
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "failed";
//       render(<ElimsPage />);
//       expect(
//         screen.getByText(
//           `An error occurred while loading games for tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//     });

//     it("fetches the results again when Retry is clicked", async () => {
//       const user = userEvent.setup();
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "failed";
//       render(<ElimsPage />);
//       expect(mockDispatch).not.toHaveBeenCalled();

//       await user.click(screen.getByRole("button", { name: "Retry" }));
//       expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("prizes loading and errors", () => {
//     it("shows the wait modal while the prizes load", () => {
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "loading";
//       render(<ElimsPage />);
//       expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
//       expect(screen.queryByRole("table")).not.toBeInTheDocument();
//     });

//     it("shows the prizes error message when the prizes fail", () => {
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "failed";
//       mockState.elimPfs.error = "Prizes server error";
//       render(<ElimsPage />);
//       expect(
//         screen.getByRole("heading", { name: "Unable to load tournament prizes" })
//       ).toBeInTheDocument();
//       expect(screen.getByText("Prizes server error")).toBeInTheDocument();
//     });

//     it("shows a default error when the prizes fail with no message", () => {
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "failed";
//       render(<ElimsPage />);
//       expect(
//         screen.getByText(
//           `An error occurred while loading prizes for tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//     });

//     it("fetches the prizes again when Retry is clicked", async () => {
//       const user = userEvent.setup();
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "failed";
//       render(<ElimsPage />);
//       expect(mockDispatch).not.toHaveBeenCalled();

//       await user.click(screen.getByRole("button", { name: "Retry" }));
//       expect(mockDispatch).toHaveBeenCalledWith(elimPfsAction);
//     });

//     it("shows the results error before the prizes error", () => {
//       mockState.results.tmntId = "";
//       mockState.results.loadStatus = "failed";
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "failed";
//       render(<ElimsPage />);
//       expect(
//         screen.getByRole("heading", { name: "Unable to load tournament results" })
//       ).toBeInTheDocument();
//       expect(
//         screen.queryByRole("heading", { name: "Unable to load tournament prizes" })
//       ).not.toBeInTheDocument();
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("missing division", () => {
//     it("shows an error when the active elim's division is not found", () => {
//       tmntFullData.elims = [{ ...elim1, div_id: "div_00000000000000000000000000000000" }];
//       setTmntHook();
//       render(<ElimsPage />);
//       expect(screen.getByTestId("tmnt-home-header")).toHaveTextContent("Elims");
//       expect(
//         screen.getByText("Division data for active eliminator not found")
//       ).toBeInTheDocument();
//       expect(screen.queryByRole("table")).not.toBeInTheDocument();
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("loaded page", () => {
//     it("renders the tournament header with the Elims button selected", () => {
//       render(<ElimsPage />);
//       const props = mockTmntHomeHeader.mock.calls[mockTmntHomeHeader.mock.calls.length - 1][0];
//       expect(props.tmntFullData).toBe(tmntFullData);
//       expect(props.selectedTmntPageBtn).toBe("Elims");
//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//     });

//     it("builds the rows with only the active elim's prize funds", () => {
//       render(<ElimsPage />);
//       expect(mockBuildElimResultsRows).toHaveBeenCalledWith(
//         elim1.id,
//         tmntFullData,
//         tmntResults,
//         [elimPfs[0], elimPfs[1]]
//       );
//       expect(mockGetElimAdvancingScores).toHaveBeenCalledWith(elim1Rows, elim1);
//     });

//     it("does not build rows before the results and prizes are loaded", () => {
//       mockState.elimPfs.tmntId = "";
//       mockState.elimPfs.loadStatus = "loading";
//       render(<ElimsPage />);
//       expect(mockBuildElimResultsRows).not.toHaveBeenCalled();
//     });

//     it("renders a button for each elim using its name", () => {
//       render(<ElimsPage />);
//       const buttons = getElimButtons();
//       expect(buttons).toHaveLength(2);
//       tmntFullData.elims.forEach((elim, i) => {
//         expect(buttons[i]).toHaveTextContent(getBrktOrElimName(elim, tmntFullData.divs));
//         expect(buttons[i]).toHaveClass("btn", "btn-outline-primary");
//       });
//     });

//     it("selects the first elim by default", () => {
//       render(<ElimsPage />);
//       expect(getElimButtons()[0]).toHaveClass("active");
//       expect(getElimButtons()[1]).not.toHaveClass("active");
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("table headers", () => {
//     it("renders position, name, one column per elim game, and prize", () => {
//       render(<ElimsPage />);
//       const headers = screen.getAllByRole("columnheader");
//       // blank position + name + 3 games + prize
//       expect(headers).toHaveLength(6);
//       expect(headers[1]).toHaveTextContent(/^Name$/);
//       expect(headers[1]).toHaveStyle({ width: "140px" });
//       expect(headers[5]).toHaveTextContent(/^Prize$/);
//       expect(headers[5]).toHaveStyle({ width: "85px" });
//     });

//     it("uses a 40px position column for 100 or fewer rows", () => {
//       render(<ElimsPage />);
//       expect(screen.getAllByRole("columnheader")[0]).toHaveStyle({ width: "40px" });
//     });

//     it("uses a 55px position column for more than 100 rows", () => {
//       elim1Rows = Array.from({ length: 101 }, (_, i) =>
//         makeRow({
//           player_id: `ply_test_many_${i}`,
//           full_name: `Player ${i}`,
//           startGame: 1,
//           games: [200, null, null],
//           alive: [null, null, null],
//           position: null,
//           prize: null,
//         })
//       );
//       render(<ElimsPage />);
//       expect(screen.getAllByRole("columnheader")[0]).toHaveStyle({ width: "55px" });
//     });

//     it("uses 135px game columns when the division has a handicap", () => {
//       setDivHdcp(elim1.div_id, 0.9);
//       render(<ElimsPage />);
//       screen
//         .getAllByRole("columnheader")
//         .slice(2, 5)
//         .forEach((header) => {
//           expect(header).toHaveStyle({ width: "135px" });
//         });
//     });

//     it("uses 60px game columns when the division is scratch", () => {
//       render(<ElimsPage />);
//       screen
//         .getAllByRole("columnheader")
//         .slice(2, 5)
//         .forEach((header) => {
//           expect(header).toHaveStyle({ width: "60px" });
//         });
//     });

//     it("numbers the game columns from the elim's start game", () => {
//       render(<ElimsPage />);
//       const headers = screen.getAllByRole("columnheader");
//       expect(headers[2]).toHaveTextContent(/^1/);
//       expect(headers[3]).toHaveTextContent(/^2/);
//       expect(headers[4]).toHaveTextContent(/^3$/);
//     });

//     it.each([
//       [1, 205],
//       [2, 225],
//     ])("marks game %i with its advancing score of %i", (gameNum, advScore) => {
//       render(<ElimsPage />);
//       const header = screen.getAllByRole("columnheader")[1 + gameNum];
//       const marker = within(header).getByLabelText(`Advancing score ${advScore} or more`);
//       expect(marker).toHaveClass("text-primary");
//       expect(marker).toHaveAttribute("tabindex", "0");

//       const tooltip = within(header).getByRole("tooltip");
//       expect(tooltip).toHaveAttribute("id", `elim-game-${gameNum}-tooltip`);
//       expect(tooltip).toHaveTextContent(`Advancing score >= ${advScore}`);
//     });

//     it("does not mark the last game, which has no advancing score", () => {
//       render(<ElimsPage />);
//       const game3Header = screen.getAllByRole("columnheader")[4];
//       expect(within(game3Header).queryByRole("tooltip")).not.toBeInTheDocument();
//       expect(within(game3Header).queryByLabelText(/Advancing score/)).not.toBeInTheDocument();
//     });

//     it("marks no games when there are no advancing scores", () => {
//       mockGetElimAdvancingScores.mockReturnValue(new Map<number, number>());
//       render(<ElimsPage />);
//       expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("table rows", () => {
//     it("renders one row per player", () => {
//       render(<ElimsPage />);
//       expect(getBodyRows()).toHaveLength(elim1Rows.length);
//     });

//     it("links each player's name to their standings page", () => {
//       render(<ElimsPage />);
//       elim1Rows.forEach((row) => {
//         const link = screen.getByRole("link", { name: row.full_name });
//         expect(link).toHaveAttribute(
//           "href",
//           `/results/tmnt/${tmntId}/standings/div/${elim1.div_id}/player/${row.player_id}`
//         );
//         expect(link).toHaveClass("p-0");
//       });
//     });

//     it("renders a position, name, game and prize cell for every player", () => {
//       render(<ElimsPage />);
//       getBodyRows().forEach((tr) => {
//         // position + name + 3 games + prize
//         expect(within(tr).getAllByRole("cell")).toHaveLength(6);
//       });
//     });

//     it("passes the row, the elim's division and the game number to ElimGame", () => {
//       render(<ElimsPage />);
//       const props = mockElimGame.mock.calls[0][0];
//       expect(props.row).toBe(elim1Rows[0]);
//       expect(props.elimDiv.id).toBe(elim1.div_id);
//       expect(props.gameNum).toBe(1);
//     });

//     it("marks the last paying row as the cut row", () => {
//       render(<ElimsPage />);
//       const rows = getBodyRows();
//       // elim 1 pays 2 places, so index 1 is the cut row
//       rows.forEach((tr, i) => {
//         if (i === 1) {
//           expect(tr).toHaveClass("cut-row");
//         } else {
//           expect(tr).not.toHaveClass("cut-row");
//         }
//       });
//     });

//     it("does not mark a cut row when the elim has no prize funds", () => {
//       mockState.elimPfs.elimPfs = elimPfs.filter((pf) => pf.elim_id !== elim1.id);
//       render(<ElimsPage />);
//       getBodyRows().forEach((tr) => {
//         expect(tr).not.toHaveClass("cut-row");
//       });
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("game cells", () => {
//     describe("results final", () => {
//       const expected = toCellViews(finalExample);

//       it.each(finalExample.map((_, i) => [i + 1, i]))(
//         "Player %i shows the right scores and status icons",
//         (_playerNum, rowIndex) => {
//           render(<ElimsPage />);
//           const cells = getCells(rowIndex);
//           expected[rowIndex].forEach((view, i) => {
//             expectGameCell(cells[2 + i], view);
//           });
//         }
//       );

//       it("shows no status icon in the last game", () => {
//         render(<ElimsPage />);
//         getBodyRows().forEach((_, rowIndex) => {
//           expect(within(getCells(rowIndex)[4]).queryByRole("img")).not.toBeInTheDocument();
//         });
//       });

//       it("shows nothing after the game a player was eliminated", () => {
//         render(<ElimsPage />);
//         // Players 3-4 out in game 2: game 3 blank
//         [2, 3].forEach((rowIndex) => {
//           expectGameCell(getCells(rowIndex)[4], null);
//         });
//         // Players 5-8 out in game 1: games 2 and 3 blank
//         [4, 5, 6, 7].forEach((rowIndex) => {
//           expectGameCell(getCells(rowIndex)[3], null);
//           expectGameCell(getCells(rowIndex)[4], null);
//         });
//       });

//       it("shows 6 Advanced and 6 Eliminated icons in all", () => {
//         render(<ElimsPage />);
//         // game 1: 4 advanced, 4 out; game 2: 2 advanced, 2 out
//         expect(screen.getAllByRole("img", { name: "Advanced" })).toHaveLength(6);
//         expect(screen.getAllByRole("img", { name: "Eliminated" })).toHaveLength(6);
//       });
//     });

//     describe("results in progress (game 3 not bowled)", () => {
//       beforeEach(() => {
//         elim1Rows = buildRows(inProgressExample, false);
//       });

//       it.each(inProgressExample.map((_, i) => [i + 1, i]))(
//         "Player %i shows the right scores and status icons",
//         (_playerNum, rowIndex) => {
//           render(<ElimsPage />);
//           const cells = getCells(rowIndex);
//           toCellViews(inProgressExample)[rowIndex].forEach((view, i) => {
//             expectGameCell(cells[2 + i], view);
//           });
//         }
//       );

//       it("shows game 3 blank for every player", () => {
//         render(<ElimsPage />);
//         getBodyRows().forEach((_, rowIndex) => {
//           expectGameCell(getCells(rowIndex)[4], null);
//         });
//       });
//     });

//     it("shows scores but no status icons until every game 2 score is entered", () => {
//       // Players 1-2 bowled game 2, the rest have not; game 2 statuses not set yet
//       elim1Rows = buildRows(
//         inProgressExample.map((row, i) => ({
//           games: [row.games[0], i < 2 ? row.games[1] : null, null],
//           alive: [row.alive[0], null, null],
//           prize: null,
//         })),
//         false
//       );
//       render(<ElimsPage />);
//       expectGameCell(getCells(0)[3], [255, null]);
//       expectGameCell(getCells(1)[3], [225, null]);
//       expectGameCell(getCells(2)[3], null);
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("positions and prizes", () => {
//     describe("results in progress", () => {
//       beforeEach(() => {
//         elim1Rows = buildRows(inProgressExample, false);
//       });

//       it("leaves the position blank", () => {
//         render(<ElimsPage />);
//         getBodyRows().forEach((_, i) => {
//           expect(getCells(i)[0]).toBeEmptyDOMElement();
//         });
//       });

//       it("shows the prize fund for each paying place", () => {
//         render(<ElimsPage />);
//         expect(getCells(0)[5]).toHaveTextContent(/^\$20\.00$/);
//         expect(getCells(1)[5]).toHaveTextContent(/^\$10\.00$/);
//         for (let i = 2; i < elim1Rows.length; i++) {
//           expect(getCells(i)[5]).toHaveTextContent(/^$/);
//         }
//       });
//     });

//     describe("results final", () => {
//       it("shows each player's position", () => {
//         render(<ElimsPage />);
//         elim1Rows.forEach((_, i) => {
//           expect(getCells(i)[0]).toHaveTextContent(new RegExp(`^${i + 1}$`));
//         });
//       });

//       it("shows each player's prize", () => {
//         render(<ElimsPage />);
//         expect(getCells(0)[5]).toHaveTextContent(/^\$20\.00$/);
//         expect(getCells(1)[5]).toHaveTextContent(/^\$10\.00$/);
//         for (let i = 2; i < elim1Rows.length; i++) {
//           expect(getCells(i)[5]).toHaveTextContent(/^$/);
//         }
//       });

//       it("uses the row's prize, not the prize fund amounts", () => {
//         // a split prize differs from the prize fund amounts
//         elim1Rows = buildRows(
//           finalExample.map((row, i) => ({ ...row, prize: i < 2 ? 15 : null })),
//           true
//         );
//         render(<ElimsPage />);
//         expect(getCells(0)[5]).toHaveTextContent(/^\$15\.00$/);
//         expect(getCells(1)[5]).toHaveTextContent(/^\$15\.00$/);
//         expect(screen.queryByText("$20.00")).not.toBeInTheDocument();
//       });
//     });
//   });

//   // -------------------------------------------------------------------------
//   describe("selecting an elim", () => {
//     it("shows the selected elim's games, rows and prizes", async () => {
//       const user = userEvent.setup();
//       render(<ElimsPage />);
//       await user.click(getElimButtons()[1]);

//       expect(getElimButtons()[1]).toHaveClass("active");
//       expect(getElimButtons()[0]).not.toHaveClass("active");

//       expect(mockBuildElimResultsRows).toHaveBeenLastCalledWith(
//         elim2.id,
//         tmntFullData,
//         tmntResults,
//         [elimPfs[2]]
//       );

//       // elim 2 covers games 2-3
//       const headers = screen.getAllByRole("columnheader");
//       expect(headers).toHaveLength(5);
//       expect(headers[2]).toHaveTextContent(/^2/);
//       expect(headers[3]).toHaveTextContent(/^3$/);

//       expect(getBodyRows()).toHaveLength(elim2Rows.length);
//       const cells = getCells(0);
//       expectGameCell(cells[2], [255, null]);
//       expectGameCell(cells[3], null);
//       expect(cells[4]).toHaveTextContent(/^\$75\.00$/);
//     });

//     it("switches back to the first elim", async () => {
//       const user = userEvent.setup();
//       render(<ElimsPage />);
//       await user.click(getElimButtons()[1]);
//       await user.click(getElimButtons()[0]);

//       expect(getElimButtons()[0]).toHaveClass("active");
//       expect(getBodyRows()).toHaveLength(elim1Rows.length);
//     });

//     it("falls back to the first elim when the selected elim no longer exists", async () => {
//       const user = userEvent.setup();
//       const { rerender } = render(<ElimsPage />);
//       await user.click(getElimButtons()[1]);

//       tmntFullData = { ...tmntFullData, elims: [elim1] };
//       setTmntHook();
//       rerender(<ElimsPage />);

//       expect(getElimButtons()).toHaveLength(1);
//       expect(getElimButtons()[0]).toHaveClass("active");
//       expect(getBodyRows()).toHaveLength(elim1Rows.length);
//     });
//   });
// });

