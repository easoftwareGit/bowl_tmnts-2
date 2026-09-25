"use client";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import TmntPlayerScoresPage from "@/app/results/tmnt/[tmntId]/standings/div/[divId]/player/[playerId]/page";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { tmntGameResult } from "@/lib/types/resultsTypes";
import {
  divId1,
  divId2,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  tmntId,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock(
  "@/redux/features/tmntFullData/tmntFullDataSlice",
  () => {
    const actual = jest.requireActual(
      "@/redux/features/tmntFullData/tmntFullDataSlice",
    );

    return {
      ...actual,
      fetchTmntFullData: jest.fn((id: string) => ({
        type: "tmntFullData/fetchTmntFullData",
        payload: id,
      })),
    };
  },
);

jest.mock(
  "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice",
  () => {
    const actual = jest.requireActual(
      "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice",
    );

    return {
      ...actual,
      fetchOneTmntGameResults: jest.fn((id: string) => ({
        type: "oneTmntGameResults/fetchOneTmntGameResults",
        payload: id,
      })),
    };
  },
);

/*
 * The tournament header is not what this test file is testing.
 * Keeping it simple also prevents its Redux/router dependencies
 * from affecting these tests.
 */
jest.mock(
  "@/app/results/tmntHeader/tmntHomeHeader",
  () =>
    function MockTmntHomeHeader() {
      return <div data-testid="tmnt-home-header">Tournament Header</div>;
    },
);

/*
 * Make WaitModal easy to test without depending on its implementation.
 */
jest.mock(
  "@/components/modal/waitModal",
  () =>
    function MockWaitModal({
      show,
      message,
    }: {
      show: boolean;
      message: string;
    }) {
      return show ? <div data-testid="wait-modal">{message}</div> : null;
    },
);

const mockedUseDispatch = useDispatch as jest.MockedFunction<
  typeof useDispatch
>;

const mockedUseSelector = useSelector as jest.MockedFunction<
  typeof useSelector
>;

const mockedUseParams = useParams as jest.MockedFunction<typeof useParams>;

const mockedFetchTmntFullData = fetchTmntFullData as unknown as jest.Mock;

const mockedFetchOneTmntGameResults = 
  fetchOneTmntGameResults as unknown as jest.Mock;

const mockDispatch = jest.fn();

/**
 * Creates a TmntGameResult for one player using the player and game
 * data from mockTmntFullData.ts.
 *
 * @param playerId - player to create the result for
 * @param divId - division for the result
 * @returns tournament game result
 */
const createTmntGameResult = (
  playerId: string,
  divId: string,
): tmntGameResult => {
  const player = mockTmntFullData.players.find(
    (player) => player.id === playerId,
  );

  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }

  const div = mockTmntFullData.divs.find((div) => div.id === divId);

  if (!div) {
    throw new Error(`Division not found: ${divId}`);
  }

  const playerGames = mockGames
    .filter((game) => game.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num);

  const hdcp =
    div.hdcp_per > 0
      ? Math.floor(
          (div.hdcp_from - player.average) * div.hdcp_per,
        )
      : 0;

  const total = playerGames.reduce((sum, game) => sum + game.score, 0);

  const result = {
    player_id: playerId,
    div_id: divId,
    div_name: div.div_name,
    sort_order: div.sort_order,
    tmnt_name: mockTmntFullData.tmnt.tmnt_name,
    start_date: mockTmntFullData.tmnt.start_date_str,
    full_name: `${player.first_name} ${player.last_name}`,
    average: player.average,
    hdcp,
    total,
    "total + Hdcp": total + hdcp * playerGames.length,
  } as tmntGameResult;

  playerGames.forEach((game) => {
    result[`Game ${game.game_num}`] = game.score;
    result[`Game ${game.game_num} + Hdcp`] =
      game.score + hdcp;
  });

  return result;
};

/**
 * Creates enough tournament results to verify that the page selects
 * the player identified by the route playerId.
 */
const createTmntResults = (
  divId: string,
): tmntGameResult[] => [
  createTmntGameResult(playerId1, divId),
  createTmntGameResult(playerId2, divId),
];

type SetupOptions = {
  divId?: string;
  playerId?: string;
  tmntData?: typeof mockTmntFullData;
  tmntLoadStatus?: string;
  requestedTmntId?: string;
  tmntError?: string;
  results?: tmntGameResult[];
  resultsLoadStatus?: string;
  requestedResultsTmntId?: string;
  resultsTmntId?: string;
};

/**
 * Configures the mocked router and Redux selectors and renders the page.
 */
const setup = ({
  divId = divId1,
  playerId = playerId1,
  tmntData = mockTmntFullData,
  tmntLoadStatus = "succeeded",
  requestedTmntId = tmntId,
  tmntError = "",
  results = createTmntResults(divId),
  resultsLoadStatus = "succeeded",
  requestedResultsTmntId = tmntId,
  resultsTmntId = tmntId,
}: SetupOptions = {}) => {
  mockedUseParams.mockReturnValue({
    tmntId,
    divId,
    playerId,
  });

  mockedUseSelector.mockImplementation((selector) => {
    if (selector === getTmntFullDataRequestedTmntId) {
      return requestedTmntId;
    }

    if (selector === getTmntFullDataLoadStatus) {
      return tmntLoadStatus;
    }

    if (selector === getTmntFullDataError) {
      return tmntError;
    }

    if (selector === selectTmntFullData) {
      return tmntData;
    }

    if (selector === getOneTmntGameResultsRequestedTmntId) {
      return requestedResultsTmntId;
    }

    if (selector === getOneTmntGameResultsLoadStatus) {
      return resultsLoadStatus;
    }

    if (selector === getOneTmntGameResultsTmntId) {
      return resultsTmntId;
    }

    if (selector === selectOneTmntGameResults) {
      return results;
    }

    if (selector === getOneTmntGameResultsError) {
      return "";
    }

    return undefined;
  });

  return render(<TmntPlayerScoresPage />);
};

describe("TmntPlayerScoresPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseDispatch.mockReturnValue(mockDispatch);
  });

  describe("scratch division", () => {
    it("renders the player's scratch scores", () => {
      const result = createTmntGameResult(
        playerId1,
        divId1,
      );

      setup({
        divId: divId1,
        playerId: playerId1,
      });

      const table = screen.getByRole("table");
      const rows = within(table).getAllByRole("row");

      /*
       * Scratch division has one header row and one player row.
       */
      expect(rows).toHaveLength(2);

      expect(
        screen.getByText(result.full_name),
      ).toBeInTheDocument();

      for (let gameNum = 1; gameNum <= 6; gameNum++) {
        expect(
          screen.getByText(
            String(result[`Game ${gameNum}`]),
          ),
        ).toBeInTheDocument();
      }

      expect(
        screen.getByText(
          String(result["total + Hdcp"]),
        ),
      ).toBeInTheDocument();
    });

    it("does not render handicap columns for divId1", () => {
      setup({
        divId: divId1,
        playerId: playerId1,
      });

      expect(
        screen.queryByRole("columnheader", {
          name: "Ave",
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("columnheader", {
          name: "Hdcp",
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("columnheader", {
          name: "Scratch",
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText("per game hdcp"),
      ).not.toBeInTheDocument();
    });

    it("renders the Name, game, and Total column headers", () => {
      setup({
        divId: divId1,
        playerId: playerId1,
      });

      expect(
        screen.getByRole("columnheader", {
          name: "Name",
        }),
      ).toBeInTheDocument();

      for (let gameNum = 1; gameNum <= 6; gameNum++) {
        expect(
          screen.getByRole("columnheader", {
            name: String(gameNum),
          }),
        ).toBeInTheDocument();
      }

      expect(
        screen.getByRole("columnheader", {
          name: "Total",
        }),
      ).toBeInTheDocument();
    });

    it("selects the player identified by playerId", () => {
      const player1Result = createTmntGameResult(
        playerId1,
        divId1,
      );

      const player2Result = createTmntGameResult(
        playerId2,
        divId1,
      );

      setup({
        divId: divId1,
        playerId: playerId2,
        results: [player1Result, player2Result],
      });

      expect(
        screen.getByText(player2Result.full_name),
      ).toBeInTheDocument();

      expect(
        screen.queryByText(player1Result.full_name),
      ).not.toBeInTheDocument();
    });
  });

  describe("handicap division", () => {
    it("renders the handicap-specific column headers for divId2", () => {
      setup({
        divId: divId2,
        playerId: playerId1,
      });

      expect(
        screen.getByRole("columnheader", {
          name: "Ave",
        }),
      ).toBeInTheDocument();

      /*
       * There are two Hdcp column headers:
       *
       *   Ave | Hdcp | Name | games | Scratch | Hdcp | Total
       */
      expect(
        screen.getAllByRole("columnheader", {
          name: "Hdcp",
        }),
      ).toHaveLength(2);

      expect(
        screen.getByRole("columnheader", {
          name: "Scratch",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("columnheader", {
          name: "Total",
        }),
      ).toBeInTheDocument();
    });

    it("renders the player's average and handicap", () => {
      const result = createTmntGameResult(
        playerId1,
        divId2,
      );

      setup({
        divId: divId2,
        playerId: playerId1,
      });

      const table = screen.getByRole("table");
      const rows = within(table).getAllByRole("row");

      /*
       * rows[0] = header
       * rows[1] = player scores
       * rows[2] = per-game handicap
       * rows[3] = scores plus handicap
       */
      expect(rows).toHaveLength(4);

      const playerRow = rows[1];

      expect(
        within(playerRow).getByText(
          String(result.average),
        ),
      ).toBeInTheDocument();

      expect(
        within(playerRow).getByText(
          String(result.hdcp),
        ),
      ).toBeInTheDocument();

      expect(
        within(playerRow).getByText(result.full_name),
      ).toBeInTheDocument();
    });

    it("renders scratch game scores and scratch total", () => {
      const result = createTmntGameResult(
        playerId1,
        divId2,
      );

      setup({
        divId: divId2,
        playerId: playerId1,
      });

      const rows = within(
        screen.getByRole("table"),
      ).getAllByRole("row");

      const playerRow = rows[1];

      for (let gameNum = 1; gameNum <= 6; gameNum++) {
        expect(
          within(playerRow).getByText(
            String(result[`Game ${gameNum}`]),
          ),
        ).toBeInTheDocument();
      }

      expect(
        within(playerRow).getByText(
          String(result.total),
        ),
      ).toBeInTheDocument();
    });

    it("renders the per-game handicap row", () => {
      const result = createTmntGameResult(
        playerId1,
        divId2,
      );

      setup({
        divId: divId2,
        playerId: playerId1,
      });

      const rows = within(
        screen.getByRole("table"),
      ).getAllByRole("row");

      const hdcpRow = rows[2];

      expect(
        within(hdcpRow).getByText("per game hdcp"),
      ).toBeInTheDocument();

      /*
       * Six game handicap values plus the total handicap.
       */
      expect(
        within(hdcpRow).getAllByText(
          String(result.hdcp),
        ),
      ).toHaveLength(6);

      expect(
        within(hdcpRow).getByText(
          String(result.hdcp * 6),
        ),
      ).toBeInTheDocument();
    });

    it("renders each game score plus handicap", () => {
      const result = createTmntGameResult(
        playerId1,
        divId2,
      );

      setup({
        divId: divId2,
        playerId: playerId1,
      });

      const rows = within(
        screen.getByRole("table"),
      ).getAllByRole("row");

      const totalRow = rows[3];

      expect(
        within(totalRow).getByText("Total"),
      ).toBeInTheDocument();

      for (let gameNum = 1; gameNum <= 6; gameNum++) {
        expect(
          within(totalRow).getByText(
            String(
              result[`Game ${gameNum} + Hdcp`],
            ),
          ),
        ).toBeInTheDocument();
      }

      expect(
        within(totalRow).getByText(
          String(result["total + Hdcp"]),
        ),
      ).toBeInTheDocument();
    });

    it("calculates player 1 handicap from the mock division data", () => {
      /*
       * player 1 average = 220
       * divId2 handicap = 90% of 230
       *
       * (230 - 220) * 0.90 = 9
       */
      const result = createTmntGameResult(
        playerId1,
        divId2,
      );

      expect(result.average).toBe(220);
      expect(result.hdcp).toBe(9);
    });
  });

  describe("loading data", () => {
    it("dispatches fetchTmntFullData when tournament data is for another tournament", () => {
      const tmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        tmntData,
        tmntLoadStatus: "idle",
        requestedTmntId: "",
      });

      expect(
        mockedFetchTmntFullData,
      ).toHaveBeenCalledWith(tmntId);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it("dispatches fetchOneTmntGameResults when results are for another tournament", () => {
      setup({
        resultsTmntId: "",
        resultsLoadStatus: "idle",
        requestedResultsTmntId: "",
      });

      expect(
        mockedFetchOneTmntGameResults,
      ).toHaveBeenCalledWith(tmntId);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it("shows the wait modal while tournament data is loading", () => {
      setup({
        tmntLoadStatus: "loading",
      });

      expect(
        screen.getByTestId("wait-modal"),
      ).toHaveTextContent("Loading...");
    });

    it("shows the wait modal while results are loading", () => {
      setup({
        resultsLoadStatus: "loading",
      });

      expect(
        screen.getByTestId("wait-modal"),
      ).toHaveTextContent("Loading...");
    });
  });

  describe("tournament load errors", () => {
    it("shows the tournament error message", () => {
      const tmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        tmntData,
        tmntLoadStatus: "failed",
        requestedTmntId: tmntId,
        tmntError: "Unable to get tournament",
      });

      expect(
        screen.getByRole("heading", {
          name: "Unable to load tournament",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`,
        ),
      ).toBeInTheDocument();
    });

    it("shows the missing tournament data message", () => {
      const tmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        tmntData,
        tmntLoadStatus: "failed",
        requestedTmntId: tmntId,
        tmntError: "missing required child data",
      });

      expect(
        screen.getByText(
          `Tournament with id: ${tmntId} is missing data.`,
        ),
      ).toBeInTheDocument();
    });

    it("retries loading the tournament when Retry is clicked", () => {
      const tmntData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      setup({
        tmntData,
        tmntLoadStatus: "failed",
        requestedTmntId: tmntId,
        tmntError: "Unable to get tournament",
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "Retry",
        }),
      );

      expect(
        mockedFetchTmntFullData,
      ).toHaveBeenCalledWith(tmntId);
    });
  });

  describe("game results load errors", () => {
    it("shows the game results error message", () => {
      setup({
        resultsTmntId: "",
        resultsLoadStatus: "failed",
        requestedResultsTmntId: tmntId,
      });

      expect(
        screen.getByRole("heading", {
          name: "Unable to load tournament",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          `An error occurred while loading games for tournament with id: ${tmntId}.`,
        ),
      ).toBeInTheDocument();
    });

    it("retries loading game results when Retry is clicked", () => {
      setup({
        resultsTmntId: "",
        resultsLoadStatus: "failed",
        requestedResultsTmntId: tmntId,
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "Retry",
        }),
      );

      expect(
        mockedFetchOneTmntGameResults,
      ).toHaveBeenCalledWith(tmntId);
    });
  });
});