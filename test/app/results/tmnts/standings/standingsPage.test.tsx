"use client";

import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import TmntResultsPage from "@/app/results/tmnt/[tmntId]/standings/page";
import type { TmntGameResult } from "@/lib/types/resultsTypes";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import {
  fetchDivPfs,
  getDivPfRequestedTmntId,
  getDivPfsError,
  getDivPfsLoadStatus,
  getDivPfsTmntId,
  selectDivPfs,
} from "@/redux/features/divPfs/divPfsSlice";
import {
  divId1,
  divId2,
  mockDivPfs,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*
 * Mock Next.js.
 */
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

/*
 * Mock Redux.
 *
 * The selector functions are left as their real imports. useSelector is
 * mocked below so each selector can return exactly the state needed for
 * a particular test.
 */
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

/*
 * Mock the Redux thunks.
 *
 * The page only needs to dispatch these functions. The actual thunk/API
 * behavior is tested by the Redux slice tests.
 */
jest.mock(
  "@/redux/features/tmntFullData/tmntFullDataSlice",
  () => {
    const actual = jest.requireActual(
      "@/redux/features/tmntFullData/tmntFullDataSlice",
    );

    return {
      ...actual,
      fetchTmntFullData: jest.fn((id: string) => ({
        type: "test/fetchTmntFullData",
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
        type: "test/fetchOneTmntGameResults",
        payload: id,
      })),
    };
  },
);

jest.mock(
  "@/redux/features/divPfs/divPfsSlice",
  () => {
    const actual = jest.requireActual(
      "@/redux/features/divPfs/divPfsSlice",
    );

    return {
      ...actual,
      fetchDivPfs: jest.fn((id: string) => ({
        type: "test/fetchDivPfs",
        payload: id,
      })),
    };
  },
);

/*
 * The page only needs to prove that the header receives tournament data.
 * Header details should be tested by TmntHomeHeader's own tests.
 */
jest.mock(
  "@/app/results/tmntHeader/tmntHomeHeader",
  () => {
    return function MockTmntHomeHeader() {
      return <div data-testid="tmnt-home-header">Tournament Header</div>;
    };
  },
);

/*
 * Replace the standings form with a small test component.
 *
 * This lets us verify which division is displayed without testing the
 * standings table implementation again.
 */
jest.mock(
  "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm",
  () => {
    return function MockTmntStandingsForm({
      tmntId,
      div,
      tmntResults,
      divPfs,
    }: {
      tmntId: string;
      div: {
        id: string;
        div_name: string;
        hdcp_per: number;
        hdcp_from: number;
        int_hdcp: boolean;
        hdcp_for: string;
        sort_order: number;
      };
      tmntResults: TmntGameResult[];
      divPfs: unknown[];
    }) {
      return (
        <div data-testid={`standings-form-${div.id}`}>
          <div>tmntId: {tmntId}</div>
          <div>division: {div.div_name}</div>
          <div>hdcp_per: {div.hdcp_per}</div>
          <div>hdcp_from: {div.hdcp_from}</div>
          <div>sort_order: {div.sort_order}</div>
          <div>results: {tmntResults.length}</div>
          <div>prizes: {divPfs.length}</div>
        </div>
      );
    };
  },
);

/*
 * Make WaitModal easy to test without depending on its Bootstrap modal
 * implementation.
 */
jest.mock("@/components/modal/waitModal", () => {
  return function MockWaitModal({
    show,
    message,
  }: {
    show: boolean;
    message: string;
  }) {
    return show ? (
      <div data-testid="wait-modal">{message}</div>
    ) : null;
  };
});

const mockedUseDispatch =
  useDispatch as jest.MockedFunction<typeof useDispatch>;

const mockedUseSelector =
  useSelector as jest.MockedFunction<typeof useSelector>;

const mockedUseParams =
  useParams as jest.MockedFunction<typeof useParams>;

const mockedFetchTmntFullData =
  fetchTmntFullData as unknown as jest.Mock;

const mockedFetchOneTmntGameResults =
  fetchOneTmntGameResults as unknown as jest.Mock;

const mockedFetchDivPfs =
  fetchDivPfs as unknown as jest.Mock;

const mockDispatch = jest.fn();

/**
 * Creates a TmntGameResult row using the player and game data from
 * mockTmntFullData.ts.
 *
 * @param playerId player to create the result for
 * @param divId division for the result
 * @param divName division name
 * @param sortOrder division sort order
 */
const createTmntResult = (
  playerId: string,
  divId: string,
  divName: string,
  sortOrder: number,
): TmntGameResult => {
  const player = mockTmntFullData.players.find(
    (player) => player.id === playerId,
  );

  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }

  const playerGames = mockGames
    .filter((game) => game.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num);

  const total = playerGames.reduce(
    (sum, game) => sum + game.score,
    0,
  );

  return {
    player_id: player.id,
    div_id: divId,
    div_name: divName,
    sort_order: sortOrder,
    tmnt_name: mockTmntFullData.tmnt.tmnt_name,
    start_date: mockTmntFullData.tmnt.start_date_str,
    full_name: `${player.first_name} ${player.last_name}`,
    average: player.average,
    hdcp: 0,
    total,
    "total + Hdcp": total,
  };
};

/*
 * Two divisions are useful here because the page is responsible for
 * creating and sorting the division tabs.
 *
 * Deliberately put HDCP first in the results array. The page should still
 * display Scratch first because sort_order controls the division order.
 */
const mockTmntResults: TmntGameResult[] = [
  createTmntResult(
    playerId2,
    divId2,
    "HDCP",
    2,
  ),
  createTmntResult(
    playerId1,
    divId1,
    "Scratch",
    1,
  ),
];

type SelectorState = {
  requestedTmntId: string;  
  tmntLoadStatus: string;
  tmntError: string | null;

  requestedResultsTmntId: string;
  resultsLoadStatus: string;
  resultsTmntId: string;
  tmntResults: TmntGameResult[];

  requestedPrizesTmntId: string;
  prizesTmntId: string;
  prizesLoadStatus: string;
  prizesError: string | null;
};

const defaultSelectorState: SelectorState = {
  requestedTmntId: tmntId,  
  tmntLoadStatus: "succeeded",
  tmntError: null,

  requestedResultsTmntId: tmntId,
  resultsLoadStatus: "succeeded",
  resultsTmntId: tmntId,
  tmntResults: mockTmntResults,

  requestedPrizesTmntId: tmntId,
  prizesTmntId: tmntId,
  prizesLoadStatus: "succeeded",
  prizesError: null,
};

/**
 * Sets the values returned by each Redux selector used by the page.
 */
const setSelectorState = (
  overrides: Partial<SelectorState> = {},
) => {
  const state = {
    ...defaultSelectorState,
    ...overrides,
  };

  mockedUseSelector.mockImplementation((selector) => {
    if (selector === getTmntFullDataRequestedTmntId) {
      return state.requestedTmntId;
    }

    if (selector === getTmntFullDataLoadStatus) {
      return state.tmntLoadStatus;
    }

    if (selector === getTmntFullDataError) {
      return state.tmntError;
    }

    if (selector === selectTmntFullData) {
      return mockTmntFullData;
    }

    if (selector === getOneTmntGameResultsRequestedTmntId) {
      return state.requestedResultsTmntId;
    }

    if (selector === getOneTmntGameResultsLoadStatus) {
      return state.resultsLoadStatus;
    }

    if (selector === getOneTmntGameResultsTmntId) {
      return state.resultsTmntId;
    }

    if (selector === selectOneTmntGameResults) {
      return state.tmntResults;
    }

    if (selector === getDivPfRequestedTmntId) {
      return state.requestedPrizesTmntId;
    }

    if (selector === getDivPfsTmntId) {
      return state.prizesTmntId;
    }    

    if (selector === getDivPfsLoadStatus) {
      return state.prizesLoadStatus;
    }

    if (selector === getDivPfsError) {
      return state.prizesError;
    }

    if (selector === selectDivPfs) {
      return mockDivPfs;
    }

    throw new Error(
      `Unexpected selector: ${selector?.name ?? "unknown"}`,
    );
  });
};

describe("Tournament standings page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseParams.mockReturnValue({
      tmntId,
    });

    mockedUseDispatch.mockReturnValue(mockDispatch);

    setSelectorState();
  });

  describe("data loading", () => {
    it("does not fetch data when all tournament data is already loaded", () => {
      render(<TmntResultsPage />);

      expect(mockedFetchTmntFullData).not.toHaveBeenCalled();
      expect(
        mockedFetchOneTmntGameResults,
      ).not.toHaveBeenCalled();
      expect(mockedFetchDivPfs).not.toHaveBeenCalled();
    });

    it("fetches tournament data when the tournament is not loaded", () => {
      const differentTmntFullData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      mockedUseSelector.mockImplementation((selector) => {
        if (selector === getTmntFullDataRequestedTmntId) {
          return "";
        }

        if (selector === getTmntFullDataLoadStatus) {
          return "idle";
        }

        if (selector === getTmntFullDataError) {
          return null;
        }

        if (selector === selectTmntFullData) {
          return differentTmntFullData;
        }

        if (selector === getOneTmntGameResultsRequestedTmntId) {
          return tmntId;
        }

        if (selector === getOneTmntGameResultsLoadStatus) {
          return "succeeded";
        }

        if (selector === getOneTmntGameResultsTmntId) {
          return tmntId;
        }

        if (selector === selectOneTmntGameResults) {
          return mockTmntResults;
        }

        if (selector === getDivPfRequestedTmntId) {
          return tmntId;
        }

        if (selector === getDivPfsTmntId) {
          return tmntId;
        }

        if (selector === getDivPfsLoadStatus) {
          return "succeeded";
        }

        if (selector === getDivPfsError) {
          return null;
        }

        if (selector === selectDivPfs) {
          return mockDivPfs;
        }

        throw new Error("Unexpected selector");
      });

      render(<TmntResultsPage />);

      expect(mockedFetchTmntFullData).toHaveBeenCalledWith(
        tmntId,
      );
    });

    it("fetches tournament results when the results are not loaded", () => {
      setSelectorState({
        requestedResultsTmntId: "",
        resultsTmntId: "",
        resultsLoadStatus: "idle",
      });

      render(<TmntResultsPage />);

      expect(
        mockedFetchOneTmntGameResults,
      ).toHaveBeenCalledWith(tmntId);
    });

    it("fetches division prizes when the prizes are not loaded", () => {
      setSelectorState({
        requestedPrizesTmntId: "",
        prizesTmntId: "",
        prizesLoadStatus: "idle",
      });

      render(<TmntResultsPage />);

      expect(mockedFetchDivPfs).toHaveBeenCalledWith(
        tmntId,
      );
    });

    it("does not fetch tournament results while they are already loading", () => {
      setSelectorState({
        requestedResultsTmntId: tmntId,        
        resultsTmntId: "",
        resultsLoadStatus: "loading",
      });

      render(<TmntResultsPage />);

      expect(
        mockedFetchOneTmntGameResults,
      ).not.toHaveBeenCalled();
    });

    it("does not automatically retry results that failed for this tournament", () => {
      setSelectorState({
        requestedResultsTmntId: tmntId,
        resultsTmntId: "",
        resultsLoadStatus: "failed",
      });

      render(<TmntResultsPage />);

      expect(
        mockedFetchOneTmntGameResults,
      ).not.toHaveBeenCalled();
    });
  });

  describe("loading indicator", () => {
    it.each([
      ["tournament", { tmntLoadStatus: "loading" }],
      ["results", { resultsLoadStatus: "loading" }],
      ["prizes", { prizesLoadStatus: "loading" }],
    ])(
      "shows the wait modal while %s data is loading",
      (_description, overrides) => {
        setSelectorState(overrides);

        render(<TmntResultsPage />);

        expect(
          screen.getByTestId("wait-modal"),
        ).toHaveTextContent("Loading...");
      },
    );

    it("does not show the wait modal when all data has loaded", () => {
      render(<TmntResultsPage />);

      expect(
        screen.queryByTestId("wait-modal"),
      ).not.toBeInTheDocument();
    });
  });

  describe("successful render", () => {
    it("renders the tournament header", () => {
      render(<TmntResultsPage />);

      expect(
        screen.getByTestId("tmnt-home-header"),
      ).toBeInTheDocument();
    });

    it("creates division tabs from the tournament results", async () => {
      render(<TmntResultsPage />);

      expect(
        screen.getByRole("tab", { name: "Scratch" }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("tab", { name: "HDCP" }),
      ).toBeInTheDocument();
    });

    it("sorts the division tabs by sort_order", () => {
      render(<TmntResultsPage />);

      const tabs = screen.getAllByRole("tab");

      expect(tabs[0]).toHaveTextContent("Scratch");
      expect(tabs[1]).toHaveTextContent("HDCP");
    });

    it("selects the first sorted division by default", async () => {
      render(<TmntResultsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: "Scratch" }),
        ).toHaveAttribute("aria-selected", "true");
      });

      expect(
        screen.getByRole("tab", { name: "HDCP" }),
      ).toHaveAttribute("aria-selected", "false");
    });

    it("passes the division handicap data to the standings form", async () => {
      render(<TmntResultsPage />);

      const form = await screen.findByTestId(
        `standings-form-${divId1}`,
      );

      expect(form).toHaveTextContent("division: Scratch");
      expect(form).toHaveTextContent("hdcp_per: 0");
      expect(form).toHaveTextContent("hdcp_from: 230");
      expect(form).toHaveTextContent("sort_order: 1");
    });

    it("passes tournament results and prize funds to the standings form", async () => {
      render(<TmntResultsPage />);

      const form = await screen.findByTestId(
        `standings-form-${divId1}`,
      );

      expect(form).toHaveTextContent(
        `tmntId: ${tmntId}`,
      );

      expect(form).toHaveTextContent(
        `results: ${mockTmntResults.length}`,
      );

      expect(form).toHaveTextContent(
        `prizes: ${mockDivPfs.length}`,
      );
    });

    it("changes the active division when another tab is clicked", async () => {
      render(<TmntResultsPage />);

      const hdcpTab = screen.getByRole("tab", {
        name: "HDCP",
      });

      fireEvent.click(hdcpTab);

      await waitFor(() => {
        expect(hdcpTab).toHaveAttribute(
          "aria-selected",
          "true",
        );
      });

      expect(
        screen.getByRole("tab", { name: "Scratch" }),
      ).toHaveAttribute("aria-selected", "false");
    });

    it("does not render division tabs when there are no tournament results", () => {
      setSelectorState({
        tmntResults: [],
      });

      render(<TmntResultsPage />);

      expect(
        screen.queryByRole("tab"),
      ).not.toBeInTheDocument();
    });
  });

  describe("tournament load errors", () => {
    it("shows the missing tournament data message", () => {
      const differentTmntFullData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      mockedUseSelector.mockImplementation((selector) => {
        if (selector === getTmntFullDataRequestedTmntId) {
          return tmntId;
        }

        if (selector === getTmntFullDataLoadStatus) {
          return "failed";
        }

        if (selector === getTmntFullDataError) {
          return "missing required child division";
        }

        if (selector === selectTmntFullData) {
          return differentTmntFullData;
        }

        if (selector === getOneTmntGameResultsRequestedTmntId) {
          return tmntId;
        }

        if (selector === getOneTmntGameResultsLoadStatus) {
          return "succeeded";
        }

        if (selector === getOneTmntGameResultsTmntId) {
          return tmntId;
        }

        if (selector === selectOneTmntGameResults) {
          return mockTmntResults;
        }

        if (selector === getDivPfRequestedTmntId) {
          return tmntId;
        }

        if (selector === getDivPfsTmntId) {
          return tmntId;
        }

        if (selector === getDivPfsLoadStatus) {
          return "succeeded";
        }

        if (selector === getDivPfsError) {
          return null;
        }

        if (selector === selectDivPfs) {
          return mockDivPfs;
        }

        throw new Error("Unexpected selector");
      });

      render(<TmntResultsPage />);

      expect(
        screen.getByRole("heading", {
          name: "Unable to load tournament",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          `Tournament with id: ${tmntId} is missing data.`,
        ),
      ).toBeInTheDocument();
    });

    it("retries loading the tournament when Retry is clicked", () => {
      const differentTmntFullData = {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          id: "",
        },
      };

      mockedUseSelector.mockImplementation((selector) => {
        if (selector === getTmntFullDataRequestedTmntId) {
          return tmntId;
        }

        if (selector === getTmntFullDataLoadStatus) {
          return "failed";
        }

        if (selector === getTmntFullDataError) {
          return "network error";
        }

        if (selector === selectTmntFullData) {
          return differentTmntFullData;
        }

        if (selector === getOneTmntGameResultsRequestedTmntId) {
          return tmntId;
        }

        if (selector === getOneTmntGameResultsLoadStatus) {
          return "succeeded";
        }

        if (selector === getOneTmntGameResultsTmntId) {
          return tmntId;
        }

        if (selector === selectOneTmntGameResults) {
          return mockTmntResults;
        }

        if (selector === getDivPfRequestedTmntId) {
          return tmntId;
        }

        if (selector === getDivPfsTmntId) {
          return tmntId;
        }

        if (selector === getDivPfsLoadStatus) {
          return "succeeded";
        }

        if (selector === getDivPfsError) {
          return null;
        }

        if (selector === selectDivPfs) {
          return mockDivPfs;
        }

        throw new Error("Unexpected selector");
      });

      render(<TmntResultsPage />);

      fireEvent.click(
        screen.getByRole("button", { name: "Retry" }),
      );

      expect(mockedFetchTmntFullData).toHaveBeenCalledWith(
        tmntId,
      );
    });
  });

  describe("results load errors", () => {
    it("shows an error when tournament results fail to load", () => {
      setSelectorState({
        requestedResultsTmntId: tmntId,        
        resultsTmntId: "",
        resultsLoadStatus: "failed",
      });

      render(<TmntResultsPage />);

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

    it("retries loading tournament results when Retry is clicked", () => {
      setSelectorState({
        requestedResultsTmntId: tmntId,
        resultsTmntId: "",
        resultsLoadStatus: "failed",
      });

      render(<TmntResultsPage />);

      fireEvent.click(
        screen.getByRole("button", { name: "Retry" }),
      );

      expect(
        mockedFetchOneTmntGameResults,
      ).toHaveBeenCalledWith(tmntId);
    });
  });

  describe("prize fund load errors", () => {
    it("shows the prize error returned by Redux", () => {
      setSelectorState({
        requestedPrizesTmntId: tmntId,
        prizesTmntId: "",
        prizesLoadStatus: "failed",
        prizesError: "Unable to retrieve division prizes.",
      });

      render(<TmntResultsPage />);

      expect(
        screen.getByRole("heading", {
          name: "Unable to load tournament prizes",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Unable to retrieve division prizes.",
        ),
      ).toBeInTheDocument();
    });

    it("shows the default prize error when Redux has no error message", () => {
      setSelectorState({
        requestedPrizesTmntId: tmntId,
        prizesTmntId: "",
        prizesLoadStatus: "failed",
        prizesError: null,
      });

      render(<TmntResultsPage />);

      expect(
        screen.getByText(
          `An error occurred while loading prizes for tournament with id: ${tmntId}.`,
        ),
      ).toBeInTheDocument();
    });

    it("retries loading division prizes when Retry is clicked", () => {
      setSelectorState({
        requestedPrizesTmntId: tmntId,
        prizesTmntId: "",
        prizesLoadStatus: "failed",
        prizesError: "Unable to retrieve division prizes.",
      });

      render(<TmntResultsPage />);

      fireEvent.click(
        screen.getByRole("button", { name: "Retry" }),
      );

      expect(mockedFetchDivPfs).toHaveBeenCalledWith(
        tmntId,
      );
    });
  });
});
