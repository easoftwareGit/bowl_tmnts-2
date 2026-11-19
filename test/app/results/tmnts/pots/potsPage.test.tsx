// test/app/results/tmnts/pots/potsPage.test.tsx
// tests for src/app/results/tmnt/[tmntId]/pots/page.tsx
// (expects aria-pressed on the pot buttons and the "Unable to load tournament results" heading)
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import { useParams } from "next/navigation";
import PotsPage from "@/app/results/tmnt/[tmntId]/pots/page";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { calcNumGames } from "@/components/tmnts/games";
import { buildPotResultsRows, potResultsRowType } from "@/lib/results/pots/potResults";
import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { fetchPotPfs } from "@/redux/features/potPfs/potPfsSlice";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import PotGames from "@/app/results/tmnt/[tmntId]/pots/potGames";
import PotLastGame from "@/app/results/tmnt/[tmntId]/pots/potLastGame";
import PotSeries from "@/app/results/tmnt/[tmntId]/pots/potsSeries";
import { getPotShortName } from "@/lib/getName";
import { initPot } from "@/lib/db/initVals";
import { ptGame, ptLastGame } from "@/lib/validation/constants";
import { tmntGameResult } from "@/lib/types/resultsTypes";
import { potPfType, potType, tmntFullType } from "@/lib/types/types";
import {
  divId1,
  mockPotPfs,
  mockTmntFullData,
  playerId1,
  playerId2,
  potId1,
  potId2,
  squadId1,
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
  potPfs: {
    requestedTmntId: string;
    tmntId: string;
    loadStatus: loadStatusType;
    error: string | null;
    potPfs: potPfType[];
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

jest.mock("@/redux/features/potPfs/potPfsSlice", () => ({
  fetchPotPfs: jest.fn((id: string) => ({
    type: "potPfs/fetch",
    payload: id,
  })),
  getPotPfsRequestedTmntId: (s: MockState) => s.potPfs.requestedTmntId,
  getPotPfsTmntId: (s: MockState) => s.potPfs.tmntId,
  getPotPfsLoadStatus: (s: MockState) => s.potPfs.loadStatus,
  getPotPfsError: (s: MockState) => s.potPfs.error,
  selectPotPfs: (s: MockState) => s.potPfs.potPfs,
}));

jest.mock("@/hooks/useTmntFullData", () => ({
  useTmntFullData: jest.fn(),
}));

jest.mock("@/components/tmnts/games", () => ({
  calcNumGames: jest.fn(),
}));

jest.mock("@/lib/results/pots/potResults", () => ({
  buildPotResultsRows: jest.fn(),
}));

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

jest.mock("@/app/results/tmnt/[tmntId]/pots/potGames", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: jest.fn((props: { pot_id: string }) =>
      createElement("div", { "data-testid": "pot-games" }, props.pot_id)
    ),
  };
});

jest.mock("@/app/results/tmnt/[tmntId]/pots/potLastGame", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: jest.fn((props: { pot_id: string }) =>
      createElement("div", { "data-testid": "pot-last-game" }, props.pot_id)
    ),
  };
});

jest.mock("@/app/results/tmnt/[tmntId]/pots/potsSeries", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: jest.fn((props: { pot_id: string }) =>
      createElement("div", { "data-testid": "pot-series" }, props.pot_id)
    ),
  };
});

const mockUseParams = jest.mocked(useParams);
const mockUseTmntFullData = jest.mocked(useTmntFullData);
const mockCalcNumGames = jest.mocked(calcNumGames);
const mockBuildPotResultsRows = jest.mocked(buildPotResultsRows);
const mockFetchOneTmntGameResults = jest.mocked(fetchOneTmntGameResults);
const mockFetchPotPfs = jest.mocked(fetchPotPfs);
const mockTmntHomeHeader = jest.mocked(TmntHomeHeader);
const mockPotGames = jest.mocked(PotGames);
const mockPotLastGame = jest.mocked(PotLastGame);
const mockPotSeries = jest.mocked(PotSeries);

type tmntHookType = ReturnType<typeof useTmntFullData>;
type retryType = tmntHookType["retry"];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

// noUncheckedIndexedAccess: fail loudly instead of returning undefined
const at = <T,>(items: T[], index: number): T => {
  const item = items[index];
  if (item === undefined) throw new Error(`no item at index ${String(index)}`);
  return item;
};

// props of the last render of a mocked component
// (React 19 calls function components with one argument)
const lastProps = <P,>(lastCall: [P] | undefined): P => {
  if (!lastCall) throw new Error("component was not rendered");
  return lastCall[0];
};

// ---------------------------------------------------------------------------
// test data
// ---------------------------------------------------------------------------

const otherTmntId = "tmt_00000000000000000000000000000000";
const seriesPotId = "pot_99999999999999999999999999999999";
const numGames = 6; // mock squad has 6 games

const resultsAction = { type: "oneTmntGameResults/fetch", payload: tmntId };
const potPfsAction = { type: "potPfs/fetch", payload: tmntId };

describe("PotsPage", () => {
  let tmntFullData: tmntFullType;
  let gamePot: potType; // mock pots[0]
  let lastGamePot: potType; // mock pots[1]
  let seriesPot: potType; // added, same div and squad as the mock pots
  let tmntResults: tmntGameResult[];
  let potPfs: potPfType[];
  let potResultsRows: potResultsRowType[];
  let retryTmnt: jest.Mock<ReturnType<retryType>, Parameters<retryType>>;

  // tmnt data hook result
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

  // everything loaded for tmntId
  const setLoadedState = () => {
    mockState = {
      results: {
        requestedTmntId: tmntId,
        tmntId,
        loadStatus: "succeeded",
        error: null,
        games: tmntResults,
      },
      potPfs: {
        requestedTmntId: tmntId,
        tmntId,
        loadStatus: "succeeded",
        error: null,
        potPfs,
      },
    };
  };

  // nothing loaded yet for any tournament
  const setIdleState = () => {
    mockState.results = { ...mockState.results, requestedTmntId: "", tmntId: "", loadStatus: "idle" };
    mockState.potPfs = { ...mockState.potPfs, requestedTmntId: "", tmntId: "", loadStatus: "idle" };
  };

  const getPotButtons = () =>
    within(screen.getByRole("group", { name: "Select pot" })).getAllByRole("button");

  const makeRow = (player_id: string, gameNum: number, score: number): potResultsRowType => ({
    player_id,
    div_id: divId1,
    gameNum,
    score,
    hdcp: 0,
    scoreWithHdcp: score,
    prizeMoney: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ tmntId });
    retryTmnt = jest.fn<ReturnType<retryType>, Parameters<retryType>>();

    tmntFullData = cloneDeep(mockTmntFullData);
    gamePot = at(tmntFullData.pots, 0);
    lastGamePot = at(tmntFullData.pots, 1);
    seriesPot = {
      ...initPot,
      id: seriesPotId,
      squad_id: squadId1,
      div_id: divId1,
      sort_order: 3,
      fee: "20",
      pot_type: "Series",
    };
    tmntFullData.pots = [gamePot, lastGamePot, seriesPot];

    // only passed through: calcNumGames and buildPotResultsRows are mocked
    tmntResults = [
      { player_id: playerId1, div_id: divId1 },
      { player_id: playerId2, div_id: divId1 },
    ] as unknown as tmntGameResult[];
    potPfs = cloneDeep(mockPotPfs);
    potResultsRows = [makeRow(playerId1, 1, 200), makeRow(playerId2, 1, 190)];

    mockCalcNumGames.mockReturnValue(numGames);
    mockBuildPotResultsRows.mockReturnValue(potResultsRows);

    setTmntHook();
    setLoadedState();
  });

  // -------------------------------------------------------------------------
  describe("mock data", () => {
    it("has a game pot then a last game pot in the same division", () => {
      expect(gamePot.id).toBe(potId1);
      expect(gamePot.pot_type).toBe(ptGame);
      expect(lastGamePot.id).toBe(potId2);
      expect(lastGamePot.pot_type).toBe(ptLastGame);
      expect(lastGamePot.div_id).toBe(gamePot.div_id);
    });

    it("has prize funds for both pots", () => {
      expect(potPfs.filter((pf) => pf.pot_id === potId1)).toHaveLength(2);
      expect(potPfs.filter((pf) => pf.pot_id === potId2)).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  describe("fetching data", () => {
    it("gets the tournament data for the tmntId param", () => {
      render(<PotsPage />);
      expect(mockUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("does not fetch results or prizes when both are loaded", () => {
      render(<PotsPage />);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("fetches both results and prizes when neither is loaded", () => {
      setIdleState();
      render(<PotsPage />);
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
      expect(mockDispatch).toHaveBeenCalledWith(potPfsAction);
    });

    it("fetches results and prizes while the tournament data is still loading", () => {
      setTmntHook({ hasData: false });
      setIdleState();
      render(<PotsPage />);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
      expect(mockDispatch).toHaveBeenCalledWith(potPfsAction);
    });

    it("fetches results when they are for a different tournament", () => {
      mockState.results.tmntId = otherTmntId;
      mockState.results.requestedTmntId = otherTmntId;
      render(<PotsPage />);
      expect(mockFetchOneTmntGameResults).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
    });

    it("does not fetch results while they are loading", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      render(<PotsPage />);
      expect(mockFetchOneTmntGameResults).not.toHaveBeenCalled();
    });

    it("does not fetch results again after they failed for this tournament", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      render(<PotsPage />);
      expect(mockFetchOneTmntGameResults).not.toHaveBeenCalled();
    });

    it("fetches results when the failure was for another tournament", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.results.requestedTmntId = otherTmntId;
      render(<PotsPage />);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
    });

    it("fetches prizes when they are for a different tournament", () => {
      mockState.potPfs.tmntId = otherTmntId;
      mockState.potPfs.requestedTmntId = otherTmntId;
      render(<PotsPage />);
      expect(mockFetchPotPfs).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(potPfsAction);
    });

    it("does not fetch prizes while they are loading", () => {
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "loading";
      render(<PotsPage />);
      expect(mockFetchPotPfs).not.toHaveBeenCalled();
    });

    it("does not fetch prizes again after they failed for this tournament", () => {
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      render(<PotsPage />);
      expect(mockFetchPotPfs).not.toHaveBeenCalled();
    });

    it("fetches prizes when the failure was for another tournament", () => {
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      mockState.potPfs.requestedTmntId = otherTmntId;
      render(<PotsPage />);
      expect(mockDispatch).toHaveBeenCalledWith(potPfsAction);
    });

    it("does not fetch anything when a different pot is selected", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(at(getPotButtons(), 1));
      await user.click(at(getPotButtons(), 2));
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("tournament data loading and errors", () => {
    it("shows the wait modal while the tournament data loads", () => {
      setTmntHook({ hasData: false });
      render(<PotsPage />);
      const modal = screen.getByTestId("wait-modal");
      expect(modal).toHaveTextContent("Loading...");
      expect(modal).toHaveAttribute("data-show", "true");
      expect(screen.queryByTestId("tmnt-home-header")).not.toBeInTheDocument();
    });

    it("shows a general error when the tournament fails to load", () => {
      setTmntHook({ hasData: false, failed: true, error: "Network Error" });
      render(<PotsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`)
      ).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-home-header")).not.toBeInTheDocument();
    });

    it("shows a general error when the failure has no message", () => {
      setTmntHook({ hasData: false, failed: true, error: undefined });
      render(<PotsPage />);
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
      render(<PotsPage />);
      expect(
        screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
      ).toBeInTheDocument();
    });

    it("shows the tournament error before a results error", () => {
      setTmntHook({ hasData: false, failed: true, error: "Network Error" });
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.results.error = "Results server error";
      render(<PotsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(`An error occurred while loading the tournament with id: ${tmntId}.`)
      ).toBeInTheDocument();
      expect(screen.queryByText("Results server error")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Unable to load tournament results" })
      ).not.toBeInTheDocument();
    });

    it("calls retry, and dispatches nothing, when Retry is clicked after a tournament error", async () => {
      const user = userEvent.setup();
      setTmntHook({ hasData: false, failed: true, error: "Network Error" });
      render(<PotsPage />);
      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(retryTmnt).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not build pot rows before the tournament data is loaded", () => {
      setTmntHook({ hasData: false });
      render(<PotsPage />);
      expect(mockCalcNumGames).not.toHaveBeenCalled();
      expect(mockBuildPotResultsRows).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("tournament with no pots", () => {
    beforeEach(() => {
      tmntFullData.pots = [];
      setTmntHook();
    });

    it("shows the header and a no pots message", () => {
      render(<PotsPage />);
      expect(screen.getByTestId("tmnt-home-header")).toHaveTextContent("Pots");
      expect(
        screen.getByText("No pots are available for this tournament.")
      ).toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "Select pot" })).not.toBeInTheDocument();
      expect(mockPotGames).not.toHaveBeenCalled();
      expect(mockPotLastGame).not.toHaveBeenCalled();
      expect(mockPotSeries).not.toHaveBeenCalled();
    });

    it("shows the no pots message even while results and prizes are not loaded", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "loading";
      render(<PotsPage />);
      expect(
        screen.getByText("No pots are available for this tournament.")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("shows the no pots message instead of a results or prizes error", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      render(<PotsPage />);
      expect(
        screen.getByText("No pots are available for this tournament.")
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("results loading and errors", () => {
    it("shows the wait modal while the results load", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      render(<PotsPage />);
      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-home-header")).not.toBeInTheDocument();
    });

    it("shows the wait modal while results for another tournament are loaded", () => {
      mockState.results.tmntId = otherTmntId;
      mockState.results.requestedTmntId = tmntId;
      mockState.results.loadStatus = "loading";
      render(<PotsPage />);
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(mockBuildPotResultsRows).not.toHaveBeenCalled();
    });

    it("shows the results error message when the results fail", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.results.error = "Results server error";
      render(<PotsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament results" })
      ).toBeInTheDocument();
      expect(screen.getByText("Results server error")).toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-home-header")).not.toBeInTheDocument();
    });

    it("shows a default error when the results fail with no message", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.results.error = null;
      render(<PotsPage />);
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
      render(<PotsPage />);
      expect(mockDispatch).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(mockFetchOneTmntGameResults).toHaveBeenCalledWith(tmntId);
      expect(mockFetchPotPfs).not.toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
    });

    it("does not build pot rows before the results are loaded", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      render(<PotsPage />);
      expect(mockCalcNumGames).not.toHaveBeenCalled();
      expect(mockBuildPotResultsRows).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("prizes loading and errors", () => {
    it("shows the wait modal while the prizes load", () => {
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "loading";
      render(<PotsPage />);
      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-home-header")).not.toBeInTheDocument();
    });

    it("shows the prizes error message when the prizes fail", () => {
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      mockState.potPfs.error = "Prizes server error";
      render(<PotsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament prizes" })
      ).toBeInTheDocument();
      expect(screen.getByText("Prizes server error")).toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-home-header")).not.toBeInTheDocument();
    });

    it("shows a default error when the prizes fail with no message", () => {
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      mockState.potPfs.error = null;
      render(<PotsPage />);
      expect(
        screen.getByText(
          `An error occurred while loading prizes for tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("fetches the prizes again when Retry is clicked", async () => {
      const user = userEvent.setup();
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      render(<PotsPage />);
      expect(mockDispatch).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(mockFetchPotPfs).toHaveBeenCalledWith(tmntId);
      expect(mockFetchOneTmntGameResults).not.toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(potPfsAction);
    });

    it("shows the results error before the prizes error", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      render(<PotsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament results" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Unable to load tournament prizes" })
      ).not.toBeInTheDocument();
    });

    it("shows the wait modal for loading results before a prizes error", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      render(<PotsPage />);
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Unable to load tournament prizes" })
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("loaded page", () => {
    it("renders the tournament header with the Pots button selected", () => {
      render(<PotsPage />);
      expect(screen.getByTestId("tmnt-home-header")).toHaveTextContent("Pots");
      const props = lastProps(mockTmntHomeHeader.mock.lastCall);
      expect(props.tmntFullData).toBe(tmntFullData);
      expect(props.selectedTmntPageBtn).toBe("Pots");
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("calculates the number of games and builds the pot rows", () => {
      render(<PotsPage />);
      expect(mockCalcNumGames).toHaveBeenCalledWith(tmntResults);
      expect(mockBuildPotResultsRows).toHaveBeenCalledWith(tmntResults, numGames);
    });

    it("renders a button for each pot using the pot short name", () => {
      render(<PotsPage />);
      const buttons = getPotButtons();
      expect(buttons).toHaveLength(3);
      tmntFullData.pots.forEach((pot, i) => {
        const button = at(buttons, i);
        expect(button).toHaveTextContent(getPotShortName(pot, tmntFullData.divs));
        expect(button).toHaveClass("btn", "btn-outline-primary");
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("selects the first pot by default", () => {
      render(<PotsPage />);
      const buttons = getPotButtons();
      expect(at(buttons, 0)).toHaveClass("active");
      expect(at(buttons, 1)).not.toHaveClass("active");
      expect(at(buttons, 2)).not.toHaveClass("active");
    });

    it("marks only the selected pot button as pressed", () => {
      render(<PotsPage />);
      const buttons = getPotButtons();
      expect(at(buttons, 0)).toHaveAttribute("aria-pressed", "true");
      expect(at(buttons, 1)).toHaveAttribute("aria-pressed", "false");
      expect(at(buttons, 2)).toHaveAttribute("aria-pressed", "false");
      expect(screen.getByRole("button", { name: getPotShortName(gamePot, tmntFullData.divs), pressed: true })).toBeInTheDocument();
    });

    it("moves aria-pressed to the pot button that is clicked", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(at(getPotButtons(), 2));
      const buttons = getPotButtons();
      expect(at(buttons, 0)).toHaveAttribute("aria-pressed", "false");
      expect(at(buttons, 1)).toHaveAttribute("aria-pressed", "false");
      expect(at(buttons, 2)).toHaveAttribute("aria-pressed", "true");
      expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(1);
    });

    it("renders PotGames for a game pot with the right props", () => {
      render(<PotsPage />);
      expect(screen.getByTestId("pot-games")).toHaveTextContent(gamePot.id);
      expect(screen.queryByTestId("pot-last-game")).not.toBeInTheDocument();
      expect(screen.queryByTestId("pot-series")).not.toBeInTheDocument();

      const props = lastProps(mockPotGames.mock.lastCall);
      expect(props.pot_id).toBe(gamePot.id);
      expect(props.tmntFullData).toBe(tmntFullData);
      expect(props.potResultsRows).toBe(potResultsRows);
      expect(props.potPfs).toBe(potPfs);
      expect(props.numGames).toBe(numGames);
    });

    it("renders PotLastGame when a last game pot is selected", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(at(getPotButtons(), 1));

      expect(at(getPotButtons(), 1)).toHaveClass("active");
      expect(at(getPotButtons(), 0)).not.toHaveClass("active");
      expect(screen.getByTestId("pot-last-game")).toHaveTextContent(lastGamePot.id);
      expect(screen.queryByTestId("pot-games")).not.toBeInTheDocument();
      expect(screen.queryByTestId("pot-series")).not.toBeInTheDocument();

      const props = lastProps(mockPotLastGame.mock.lastCall);
      expect(props.pot_id).toBe(lastGamePot.id);
      expect(props.tmntFullData).toBe(tmntFullData);
      expect(props.potResultsRows).toBe(potResultsRows);
      expect(props.potPfs).toBe(potPfs);
      expect(props.numGames).toBe(numGames);
    });

    it("renders PotSeries when a series pot is selected", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(at(getPotButtons(), 2));

      expect(at(getPotButtons(), 2)).toHaveClass("active");
      expect(screen.getByTestId("pot-series")).toHaveTextContent(seriesPot.id);
      expect(screen.queryByTestId("pot-games")).not.toBeInTheDocument();
      expect(screen.queryByTestId("pot-last-game")).not.toBeInTheDocument();

      // the series pot gets the raw results, not the pot rows
      const props = lastProps(mockPotSeries.mock.lastCall);
      expect(props.pot_id).toBe(seriesPot.id);
      expect(props.tmntFullData).toBe(tmntFullData);
      expect(props.tmntResults).toBe(tmntResults);
      expect(props.potPfs).toBe(potPfs);
      expect(props.numGames).toBe(numGames);
    });

    it("keeps the pot selected when its button is clicked again", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(at(getPotButtons(), 1));
      await user.click(at(getPotButtons(), 1));

      expect(at(getPotButtons(), 1)).toHaveClass("active");
      expect(screen.getByTestId("pot-last-game")).toHaveTextContent(lastGamePot.id);
    });

    it("switches back to the first pot when it is clicked again", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(at(getPotButtons(), 2));
      await user.click(at(getPotButtons(), 0));

      expect(at(getPotButtons(), 0)).toHaveClass("active");
      expect(screen.getByTestId("pot-games")).toHaveTextContent(gamePot.id);
      expect(screen.queryByTestId("pot-series")).not.toBeInTheDocument();
    });

    it("does not rebuild the pot rows when a different pot is selected", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      const builds = mockBuildPotResultsRows.mock.calls.length;
      await user.click(at(getPotButtons(), 1));
      await user.click(at(getPotButtons(), 2));
      expect(mockBuildPotResultsRows).toHaveBeenCalledTimes(builds);
    });

    it("falls back to the first pot when the selected pot no longer exists", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PotsPage />);
      await user.click(at(getPotButtons(), 2));
      expect(screen.getByTestId("pot-series")).toBeInTheDocument();

      // series pot removed from the tournament data
      tmntFullData = { ...tmntFullData, pots: [gamePot, lastGamePot] };
      setTmntHook();
      rerender(<PotsPage />);

      expect(getPotButtons()).toHaveLength(2);
      expect(at(getPotButtons(), 0)).toHaveClass("active");
      expect(screen.getByTestId("pot-games")).toHaveTextContent(gamePot.id);
      expect(screen.queryByTestId("pot-series")).not.toBeInTheDocument();
    });

    it("renders PotSeries first when the first pot is a series pot", () => {
      tmntFullData.pots = [seriesPot, gamePot];
      setTmntHook();
      render(<PotsPage />);
      expect(at(getPotButtons(), 0)).toHaveClass("active");
      expect(screen.getByTestId("pot-series")).toHaveTextContent(seriesPot.id);
      expect(screen.queryByTestId("pot-games")).not.toBeInTheDocument();
    });

    it("renders PotLastGame first when the first pot is a last game pot", () => {
      tmntFullData.pots = [lastGamePot, gamePot];
      setTmntHook();
      render(<PotsPage />);
      expect(screen.getByTestId("pot-last-game")).toHaveTextContent(lastGamePot.id);
      expect(screen.queryByTestId("pot-games")).not.toBeInTheDocument();
    });

    it("shows one button and its pot when the tournament has one pot", () => {
      tmntFullData.pots = [lastGamePot];
      setTmntHook();
      render(<PotsPage />);
      expect(getPotButtons()).toHaveLength(1);
      expect(at(getPotButtons(), 0)).toHaveClass("active");
      expect(screen.getByTestId("pot-last-game")).toHaveTextContent(lastGamePot.id);
    });
  });
});
