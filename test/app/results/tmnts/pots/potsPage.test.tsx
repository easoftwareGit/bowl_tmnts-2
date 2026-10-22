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
import { ptGame, ptLastGame } from "@/lib/validation/constants";
import { tmntGameResult } from "@/lib/types/resultsTypes";
import { potPfType, potType, tmntFullType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

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
  fetchOneTmntGameResults: jest.fn((tmntId: string) => ({
    type: "oneTmntGameResults/fetch",
    payload: tmntId,
  })),
  getOneTmntGameResultsRequestedTmntId: (s: MockState) => s.results.requestedTmntId,
  getOneTmntGameResultsTmntId: (s: MockState) => s.results.tmntId,
  getOneTmntGameResultsLoadStatus: (s: MockState) => s.results.loadStatus,
  getOneTmntGameResultsError: (s: MockState) => s.results.error,
  selectOneTmntGameResults: (s: MockState) => s.results.games,
}));

jest.mock("@/redux/features/potPfs/potPfsSlice", () => ({
  fetchPotPfs: jest.fn((tmntId: string) => ({
    type: "potPfs/fetch",
    payload: tmntId,
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

const mockUseParams = useParams as jest.Mock;
const mockUseTmntFullData = useTmntFullData as jest.MockedFunction<typeof useTmntFullData>;
const mockCalcNumGames = calcNumGames as jest.MockedFunction<typeof calcNumGames>;
const mockBuildPotResultsRows = buildPotResultsRows as jest.MockedFunction<
  typeof buildPotResultsRows
>;
const mockFetchOneTmntGameResults = fetchOneTmntGameResults as unknown as jest.Mock;
const mockFetchPotPfs = fetchPotPfs as unknown as jest.Mock;
const mockTmntHomeHeader = TmntHomeHeader as unknown as jest.Mock;
const mockPotGames = PotGames as unknown as jest.Mock;
const mockPotLastGame = PotLastGame as unknown as jest.Mock;
const mockPotSeries = PotSeries as unknown as jest.Mock;

// ---------------------------------------------------------------------------
// test data
// ---------------------------------------------------------------------------

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const otherTmntId = "tmt_00000000000000000000000000000000";
const numGames = 3;

const resultsAction = { type: "oneTmntGameResults/fetch", payload: tmntId };
const potPfsAction = { type: "potPfs/fetch", payload: tmntId };

describe("PotsPage", () => {
  let tmntFullData: tmntFullType;
  let gamePot: potType;
  let lastGamePot: potType;
  let seriesPot: potType;
  let tmntResults: tmntGameResult[];
  let potPfs: potPfType[];
  let potResultsRows: potResultsRowType[];
  let retryTmnt: jest.Mock;

  // tmnt data hook result
  const setTmntHook = (overrides: Partial<ReturnType<typeof useTmntFullData>> = {}) => {
    mockUseTmntFullData.mockReturnValue({
      data: tmntFullData,
      hasData: true,
      failed: false,
      error: undefined,
      retry: retryTmnt,
      ...overrides,
    } as unknown as ReturnType<typeof useTmntFullData>);
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

  const getPotButtons = () =>
    within(screen.getByRole("group", { name: "Select pot" })).getAllByRole("button");

  const lastProps = (mockComp: jest.Mock) =>
    mockComp.mock.calls[mockComp.mock.calls.length - 1][0];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ tmntId });
    retryTmnt = jest.fn();

    tmntFullData = cloneDeep(mockTmntFullData);

    // one pot of each kind: game, last game, series (anything else)
    gamePot = { ...tmntFullData.pots[0], pot_type: ptGame } as potType;
    lastGamePot = { ...tmntFullData.pots[1], pot_type: ptLastGame } as potType;
    seriesPot = {
      ...tmntFullData.pots[0],
      id: "pot_99999999999999999999999999999999",
      pot_type: "Series",
    } as potType;
    tmntFullData.pots = [gamePot, lastGamePot, seriesPot];

    tmntResults = [
      { player_id: tmntFullData.players[0].id },
    ] as unknown as tmntGameResult[];
    potPfs = [{ id: "ppf_test_1", pot_id: gamePot.id, amount: 100 }] as potPfType[];
    potResultsRows = [
      { player_id: tmntFullData.players[0].id, score: 200, hdcp: 0, scoreWithHdcp: 200 },
    ] as potResultsRowType[];

    mockCalcNumGames.mockReturnValue(numGames);
    mockBuildPotResultsRows.mockReturnValue(potResultsRows);

    setTmntHook();
    setLoadedState();
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

    it("fetches results when they are for a different tournament", () => {
      mockState.results.tmntId = otherTmntId;
      mockState.results.requestedTmntId = otherTmntId;
      render(<PotsPage />);
      expect(mockFetchOneTmntGameResults).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
    });

    it("fetches results when none are loaded", () => {
      mockState.results.tmntId = "";
      mockState.results.requestedTmntId = "";
      mockState.results.loadStatus = "idle";
      render(<PotsPage />);
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
      mockState.results.requestedTmntId = tmntId;
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
      mockState.potPfs.requestedTmntId = tmntId;
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

    it("calls retry when Retry is clicked after a tournament error", async () => {
      const user = userEvent.setup();
      setTmntHook({ hasData: false, failed: true, error: "Network Error" });
      render(<PotsPage />);
      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(retryTmnt).toHaveBeenCalledTimes(1);
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

    it("shows the results error message when the results fail", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.results.error = "Results server error";
      render(<PotsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(screen.getByText("Results server error")).toBeInTheDocument();
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
      expect(mockDispatch).toHaveBeenCalledWith(resultsAction);
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
      expect(mockDispatch).toHaveBeenCalledWith(potPfsAction);
    });

    it("shows the results error before the prizes error", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "failed";
      mockState.potPfs.tmntId = "";
      mockState.potPfs.loadStatus = "failed";
      render(<PotsPage />);
      expect(
        screen.getByRole("heading", { name: "Unable to load tournament" })
      ).toBeInTheDocument();
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
      const props = lastProps(mockTmntHomeHeader);
      expect(props.tmntFullData).toBe(tmntFullData);
      expect(props.selectedTmntPageBtn).toBe("Pots");
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("calculates the number of games and builds the pot rows", () => {
      render(<PotsPage />);
      expect(mockCalcNumGames).toHaveBeenCalledWith(tmntResults);
      expect(mockBuildPotResultsRows).toHaveBeenCalledWith(tmntResults, numGames);
    });

    it("does not build pot rows before the results are loaded", () => {
      mockState.results.tmntId = "";
      mockState.results.loadStatus = "loading";
      render(<PotsPage />);
      expect(mockCalcNumGames).not.toHaveBeenCalled();
      expect(mockBuildPotResultsRows).not.toHaveBeenCalled();
    });

    it("renders a button for each pot using the pot short name", () => {
      render(<PotsPage />);
      const buttons = getPotButtons();
      expect(buttons).toHaveLength(3);
      tmntFullData.pots.forEach((pot, i) => {
        expect(buttons[i]).toHaveTextContent(getPotShortName(pot, tmntFullData.divs));
        expect(buttons[i]).toHaveClass("btn", "btn-outline-primary");
      });
    });

    it("selects the first pot by default", () => {
      render(<PotsPage />);
      const buttons = getPotButtons();
      expect(buttons[0]).toHaveClass("active");
      expect(buttons[1]).not.toHaveClass("active");
      expect(buttons[2]).not.toHaveClass("active");
    });

    it("renders PotGames for a game pot with the right props", () => {
      render(<PotsPage />);
      expect(screen.getByTestId("pot-games")).toHaveTextContent(gamePot.id);
      expect(screen.queryByTestId("pot-last-game")).not.toBeInTheDocument();
      expect(screen.queryByTestId("pot-series")).not.toBeInTheDocument();

      const props = lastProps(mockPotGames);
      expect(props.pot_id).toBe(gamePot.id);
      expect(props.tmntFullData).toBe(tmntFullData);
      expect(props.potResultsRows).toBe(potResultsRows);
      expect(props.potPfs).toBe(potPfs);
      expect(props.numGames).toBe(numGames);
    });

    it("renders PotLastGame when a last game pot is selected", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(getPotButtons()[1]);

      expect(getPotButtons()[1]).toHaveClass("active");
      expect(getPotButtons()[0]).not.toHaveClass("active");
      expect(screen.getByTestId("pot-last-game")).toHaveTextContent(lastGamePot.id);
      expect(screen.queryByTestId("pot-games")).not.toBeInTheDocument();

      const props = lastProps(mockPotLastGame);
      expect(props.pot_id).toBe(lastGamePot.id);
      expect(props.tmntFullData).toBe(tmntFullData);
      expect(props.potResultsRows).toBe(potResultsRows);
      expect(props.potPfs).toBe(potPfs);
      expect(props.numGames).toBe(numGames);
    });

    it("renders PotSeries when a series pot is selected", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(getPotButtons()[2]);

      expect(getPotButtons()[2]).toHaveClass("active");
      expect(screen.getByTestId("pot-series")).toHaveTextContent(seriesPot.id);
      expect(screen.queryByTestId("pot-games")).not.toBeInTheDocument();
      expect(screen.queryByTestId("pot-last-game")).not.toBeInTheDocument();

      const props = lastProps(mockPotSeries);
      expect(props.pot_id).toBe(seriesPot.id);
      expect(props.tmntFullData).toBe(tmntFullData);
      expect(props.tmntResults).toBe(tmntResults);
      expect(props.potPfs).toBe(potPfs);
      expect(props.numGames).toBe(numGames);
    });

    it("switches back to the first pot when it is clicked again", async () => {
      const user = userEvent.setup();
      render(<PotsPage />);
      await user.click(getPotButtons()[2]);
      await user.click(getPotButtons()[0]);

      expect(getPotButtons()[0]).toHaveClass("active");
      expect(screen.getByTestId("pot-games")).toHaveTextContent(gamePot.id);
      expect(screen.queryByTestId("pot-series")).not.toBeInTheDocument();
    });

    it("falls back to the first pot when the selected pot no longer exists", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PotsPage />);
      await user.click(getPotButtons()[2]);
      expect(screen.getByTestId("pot-series")).toBeInTheDocument();

      // series pot removed from the tournament data
      tmntFullData = { ...tmntFullData, pots: [gamePot, lastGamePot] };
      setTmntHook();
      rerender(<PotsPage />);

      expect(getPotButtons()).toHaveLength(2);
      expect(getPotButtons()[0]).toHaveClass("active");
      expect(screen.getByTestId("pot-games")).toHaveTextContent(gamePot.id);
    });

    it("renders PotSeries first when the first pot is a series pot", () => {
      tmntFullData.pots = [seriesPot, gamePot];
      setTmntHook();
      render(<PotsPage />);
      expect(screen.getByTestId("pot-series")).toHaveTextContent(seriesPot.id);
    });
  });
});