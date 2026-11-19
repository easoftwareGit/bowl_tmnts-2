// test/app/results/tmnts/standings/standingsPage.test.tsx
// tests src/app/results/tmnt/[tmntId]/standings/page.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useParams } from "next/navigation";
import TmntStandingsPage from "@/app/results/tmnt/[tmntId]/standings/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import TmntStandingsForm from "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm";
import TmntDivHeader from "@/app/results/tmnt/[tmntId]/standings/tmntDivHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { fetchDivPfs } from "@/redux/features/divPfs/divPfsSlice";
import type { ioStatusType } from "@/redux/statusTypes";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import type {
  divDataType,
  divPfType,
  playerType,
  tmntFullType,
} from "@/lib/types/types";
import {
  mockTmntFullData,
  mockDivPfs,
  tmntId,
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
  prizes: {
    loadedTmntId: string;
    requestedTmntId: string;
    loadStatus: ioStatusType;
    error: string | undefined;
    divPfs: divPfType[];
  };
};

const mockState = {} as MockState;
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

jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
  fetchDivPfs: jest.fn((id: string) => ({
    type: "divPfs/fetch",
    payload: id,
  })),
  getDivPfsRequestedTmntId: (s: MockState) => s.prizes.requestedTmntId,
  getDivPfsTmntId: (s: MockState) => s.prizes.loadedTmntId,
  getDivPfsError: (s: MockState) => s.prizes.error,
  getDivPfsLoadStatus: (s: MockState) => s.prizes.loadStatus,
  selectDivPfs: (s: MockState) => s.prizes.divPfs,
}));

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

jest.mock("@/app/results/tmnt/[tmntId]/standings/tmntDivHeader", () => ({
  __esModule: true,
  default: jest.fn(
    ({
      divs,
      selectedDivId,
      onSelectDiv,
    }: {
      divs: { id: string; div_name: string }[];
      selectedDivId: string;
      onSelectDiv: (divId: string) => void;
    }) => (
      <div data-testid="div-header">
        {divs.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={d.id === selectedDivId}
            onClick={() => {
              onSelectDiv(d.id);
            }}
          >
            {d.div_name}
          </button>
        ))}
      </div>
    )
  ),
}));

jest.mock("@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm", () => ({
  __esModule: true,
  default: jest.fn(({ div }: { div: { div_name: string } }) => (
    <div data-testid="standings-form">{div.div_name}</div>
  )),
}));

const mockedUseParams = jest.mocked(useParams);
const mockedUseTmntFullData = jest.mocked(useTmntFullData);
const mockedFetchResults = jest.mocked(fetchOneTmntGameResults);
const mockedFetchDivPfs = jest.mocked(fetchDivPfs);
const mockedHeader = jest.mocked(TmntHomeHeader);
const mockedDivHeader = jest.mocked(TmntDivHeader);
const mockedForm = jest.mocked(TmntStandingsForm);

type tmntHookType = ReturnType<typeof useTmntFullData>;
type retryType = tmntHookType["retry"];

/***********/
/* helpers */
/***********/

// noUncheckedIndexedAccess: fail loudly instead of returning undefined
const at = <T,>(items: readonly T[], index: number): T => {
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

const lastFormProps = () => lastProps(mockedForm.mock.lastCall);
const lastDivHeaderProps = () => lastProps(mockedDivHeader.mock.lastCall);
const lastHeaderProps = () => lastProps(mockedHeader.mock.lastCall);

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const scratchDiv: divDataType = at(mockTmntFullData.divs, 0);
const hdcpDiv: divDataType = at(mockTmntFullData.divs, 1);
const player1: playerType = at(mockTmntFullData.players, 0);
const { players } = mockTmntFullData;

const OTHER_TMNT_ID = "tmt_differentid00000000000000000000";
const UNKNOWN_DIV_ID = "div_unknown000000000000000000000000";

// the standings form is mocked, so a result only needs the fields the page reads
const makeResult = (
  playerId: string,
  div: divDataType,
  overrides: Partial<tmntGameResult> = {}
): tmntGameResult =>
  ({
    player_id: playerId,
    div_id: div.id,
    div_name: div.div_name,
    sort_order: div.sort_order,
    ...overrides,
  }) as unknown as tmntGameResult;

const scratchResults = players.map((p) => makeResult(p.id, scratchDiv));
const hdcpResults = players.map((p) => makeResult(p.id, hdcpDiv));
const allResults = [...scratchResults, ...hdcpResults];

const retryMock = jest.fn<ReturnType<retryType>, Parameters<retryType>>();

// the hook always returns a tmntFullType; before loading it is a blank tmnt
const blankTmntData = (): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "" },
});

const setHook = (overrides: Partial<tmntHookType> = {}) => {
  mockedUseTmntFullData.mockReturnValue({
    data: mockTmntFullData,
    hasData: true,
    failed: false,
    error: undefined,
    retry: retryMock,
    ...overrides,
  });
};

const setTmntLoading = () => {
  setHook({ data: blankTmntData(), hasData: false });
};

const setTmntFailed = (error: string | undefined) => {
  setHook({ data: blankTmntData(), hasData: false, failed: true, error });
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

const setPrizesState = (overrides: Partial<MockState["prizes"]> = {}) => {
  mockState.prizes = {
    loadedTmntId: tmntId,
    requestedTmntId: tmntId,
    loadStatus: "succeeded",
    error: "",
    divPfs: mockDivPfs,
    ...overrides,
  };
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

const setPrizesFailed = (error: string | undefined) => {
  setPrizesState({
    loadedTmntId: "",
    loadStatus: "failed",
    requestedTmntId: tmntId,
    error,
    divPfs: [],
  });
};

const renderPage = () => render(<TmntStandingsPage />);

const NO_RESULTS_MSG = "No results are available for this tournament yet.";

describe("TmntStandingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    setHook();
    setResultsState();
    setPrizesState();
  });

  describe("fixture sanity check", () => {
    it("mock tournament has a scratch and a handicap division with sort orders 1 and 2", () => {
      expect(mockTmntFullData.divs).toHaveLength(2);
      expect(scratchDiv.sort_order).toBe(1);
      expect(hdcpDiv.sort_order).toBe(2);
      expect(scratchDiv.hdcp_per).toBe(0);
      expect(hdcpDiv.hdcp_per).toBeGreaterThan(0);
    });

    it("mock tournament id is the route tmntId", () => {
      expect(mockTmntFullData.tmnt.id).toBe(tmntId);
    });

    it("mock has prize funds", () => {
      expect(mockDivPfs.length).toBeGreaterThan(0);
    });
  });

  describe("data requests", () => {
    it("requests the tournament data using the tmntId from the route params", () => {
      renderPage();
      expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("does not request anything when results and prizes are already loaded for this tournament", () => {
      renderPage();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    describe("results", () => {
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
    });

    describe("prizes", () => {
      it("fetches the prizes when none are loaded", () => {
        setPrizesState({ loadedTmntId: "", loadStatus: "idle", divPfs: [] });
        renderPage();

        expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({
          type: "divPfs/fetch",
          payload: tmntId,
        });
      });

      it("fetches the prizes when a different tournament's prizes are loaded", () => {
        setPrizesState({ loadedTmntId: OTHER_TMNT_ID, divPfs: [] });
        renderPage();

        expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
      });

      it("does not fetch the prizes while a request is already loading", () => {
        setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
        renderPage();

        expect(mockedFetchDivPfs).not.toHaveBeenCalled();
      });

      it("does not fetch the prizes again when the request for this tournament failed", () => {
        setPrizesFailed("Prize service down");
        renderPage();

        expect(mockedFetchDivPfs).not.toHaveBeenCalled();
      });

      it("fetches the prizes when a previous failure was for a different tournament", () => {
        setPrizesState({
          loadedTmntId: "",
          loadStatus: "failed",
          requestedTmntId: OTHER_TMNT_ID,
          divPfs: [],
        });
        renderPage();

        expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
      });
    });

    it("requests results and prizes even while the tournament is still loading", () => {
      setTmntLoading();
      setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
      setPrizesState({ loadedTmntId: "", loadStatus: "idle", divPfs: [] });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
      expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    it("requests results and prizes even when the tournament failed to load", () => {
      setTmntFailed("Network error");
      setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
      setPrizesState({ loadedTmntId: "", loadStatus: "idle", divPfs: [] });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
      expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
    });

    it("fetches the new tournament's results and prizes when the route tmntId changes", () => {
      const { rerender } = renderPage();
      expect(mockDispatch).not.toHaveBeenCalled();

      mockedUseParams.mockReturnValue({ tmntId: OTHER_TMNT_ID });
      rerender(<TmntStandingsPage />);

      expect(mockedFetchResults).toHaveBeenCalledWith(OTHER_TMNT_ID);
      expect(mockedFetchDivPfs).toHaveBeenCalledWith(OTHER_TMNT_ID);
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("tournament loading and error", () => {
    it("shows the wait modal while the tournament is loading", () => {
      setTmntLoading();
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it("shows a generic error message when the tournament failed to load", () => {
      setTmntFailed("Network error");
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
      expect(screen.queryByText("Network error")).not.toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
    });

    it("shows the generic error message when failed with no error text", () => {
      setTmntFailed(undefined);
      renderPage();

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("shows the missing data message when the error mentions a missing required child", () => {
      setTmntFailed("Tournament has a missing required child: events");
      renderPage();

      expect(
        screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
      ).toBeInTheDocument();
    });

    it("calls the hook's retry (and does not dispatch) when Retry is clicked", () => {
      setTmntFailed("boom");
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));

      expect(retryMock).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("shows the tournament error before the results and prizes errors", () => {
      setTmntFailed("boom");
      setResultsFailed("Games service down");
      setPrizesFailed("Prize service down");
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(screen.queryByText("Games service down")).not.toBeInTheDocument();
      expect(screen.queryByText("Prize service down")).not.toBeInTheDocument();
    });

    it("renders the page instead of the error when data exists even if failed is true", () => {
      setHook({ failed: true, error: "stale error" });
      renderPage();

      expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
      expect(screen.getByTestId("standings-form")).toBeInTheDocument();
    });
  });

  describe("results loading and error", () => {
    it("shows the wait modal while the results are loading", () => {
      setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it("shows the wait modal, not another tournament's results, while this tournament's results load", () => {
      setResultsState({ loadedTmntId: OTHER_TMNT_ID, loadStatus: "loading" });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
      expect(screen.queryByText(NO_RESULTS_MSG)).not.toBeInTheDocument();
    });

    it("shows the results error from the slice when loading the results failed", () => {
      setResultsFailed("Games service down");
      renderPage();

      expect(
        screen.getByRole("heading", {
          level: 4,
          name: "Unable to load tournament results",
        })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Unable to load tournament" })
      ).not.toBeInTheDocument();
      expect(screen.getByText("Games service down")).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
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
      expect(mockedFetchDivPfs).not.toHaveBeenCalled();
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
  });

  describe("prizes loading and error", () => {
    it("shows the wait modal while the prizes are loading", () => {
      setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it("shows the prizes error from the slice when loading the prizes failed", () => {
      setPrizesFailed("Prize service down");
      renderPage();

      expect(
        screen.getByRole("heading", {
          level: 4,
          name: "Unable to load tournament prizes",
        })
      ).toBeInTheDocument();
      expect(screen.getByText("Prize service down")).toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it.each([
      ["undefined", undefined],
      ["an empty string", ""],
    ])("shows a default message when the prizes error is %s", (_label, error) => {
      setPrizesFailed(error);
      renderPage();

      expect(
        screen.getByText(
          `An error occurred while loading prizes for tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("dispatches fetchDivPfs when Retry is clicked", () => {
      setPrizesFailed("Prize service down");
      renderPage();
      expect(mockDispatch).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));

      expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
      expect(mockedFetchResults).not.toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "divPfs/fetch",
        payload: tmntId,
      });
      expect(retryMock).not.toHaveBeenCalled();
    });

    it("shows the results error before the prizes error when both failed", () => {
      setResultsFailed("Games service down");
      setPrizesFailed("Prize service down");
      renderPage();

      expect(screen.getByText("Games service down")).toBeInTheDocument();
      expect(screen.queryByText("Prize service down")).not.toBeInTheDocument();
    });

    it("shows the wait modal, not the error, when the prizes failure was for a different tournament", () => {
      setPrizesState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: OTHER_TMNT_ID,
        error: "some other error",
        divPfs: [],
      });
      renderPage();

      expect(screen.queryByText("some other error")).not.toBeInTheDocument();
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
    });
  });

  describe("no results", () => {
    it("shows the header and a no results message when the tournament has no results", () => {
      setResultsState({ results: [] });
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Standings");
      expect(lastHeaderProps().tmntFullData).toBe(mockTmntFullData);
      expect(screen.getByText(NO_RESULTS_MSG)).toBeInTheDocument();
      expect(screen.queryByTestId("div-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it("shows the no results message even while the prizes are still loading", () => {
      setResultsState({ results: [] });
      setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
      renderPage();

      expect(screen.getByText(NO_RESULTS_MSG)).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("shows the prizes error before the no results message", () => {
      setResultsState({ results: [] });
      setPrizesFailed("Prize service down");
      renderPage();

      expect(screen.getByText("Prize service down")).toBeInTheDocument();
      expect(screen.queryByText(NO_RESULTS_MSG)).not.toBeInTheDocument();
    });

    it("shows the no results message when the loaded tournament id does not match the route", () => {
      setHook({
        data: {
          ...mockTmntFullData,
          tmnt: { ...mockTmntFullData.tmnt, id: OTHER_TMNT_ID },
        },
      });
      renderPage();

      expect(screen.getByText(NO_RESULTS_MSG)).toBeInTheDocument();
    });
  });

  describe("result division not in the tournament", () => {
    const unknownResult = makeResult(player1.id, scratchDiv, {
      div_id: UNKNOWN_DIV_ID,
      div_name: "Unknown",
      sort_order: 3,
    });
    const missingDivMsg = `Division not found in tournament. Id: ${UNKNOWN_DIV_ID}`;

    it("shows the header and a missing data error when the only division is not in the tournament", () => {
      setResultsState({ results: [unknownResult] });
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Standings");
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(missingDivMsg);
      expect(alert).toHaveClass("alert", "alert-danger");
      expect(screen.queryByText(NO_RESULTS_MSG)).not.toBeInTheDocument();
      expect(screen.queryByTestId("div-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it("shows the error, not the standings, when one of several divisions is not in the tournament", () => {
      setResultsState({ results: [...allResults, unknownResult] });
      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent(missingDivMsg);
      expect(screen.queryByTestId("div-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it("lists every division id that is not in the tournament", () => {
      const otherUnknownId = "div_unknown000000000000000000000001";
      setResultsState({
        results: [
          ...allResults,
          unknownResult,
          makeResult(player1.id, scratchDiv, { div_id: otherUnknownId }),
        ],
      });
      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent(
        `Division not found in tournament. Id: ${UNKNOWN_DIV_ID}, ${otherUnknownId}`
      );
    });

    it("shows the error even while the prizes are still loading", () => {
      setResultsState({ results: [unknownResult] });
      setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent(missingDivMsg);
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("shows the prizes error before the missing division error", () => {
      setResultsState({ results: [unknownResult] });
      setPrizesFailed("Prize service down");
      renderPage();

      expect(screen.getByText("Prize service down")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does not show the error when every result division is in the tournament", () => {
      renderPage();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("standings content", () => {
    it("renders the header with the tournament data and Standings selected", () => {
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Standings");
      const props = lastHeaderProps();
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedTmntPageBtn).toBe("Standings");
    });

    it("does not render a wait modal or an error when everything is loaded", () => {
      renderPage();

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
      expect(screen.queryByText(NO_RESULTS_MSG)).not.toBeInTheDocument();
    });

    it("renders one division button per division in the results", () => {
      renderPage();

      expect(screen.getByTestId("div-header")).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(2);
      expect(
        screen.getByRole("button", { name: scratchDiv.div_name })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: hdcpDiv.div_name })
      ).toBeInTheDocument();
    });

    it("passes all of the results and all of the prize funds to the standings form", () => {
      renderPage();

      const props = lastFormProps();
      expect(props.tmntId).toBe(tmntId);
      expect(props.tmntResults).toBe(allResults);
      expect(props.divPfs).toBe(mockDivPfs);
    });

    it("renders the standings form with no prize funds when the tournament has none", () => {
      setPrizesState({ divPfs: [] });
      renderPage();

      expect(screen.getByTestId("standings-form")).toBeInTheDocument();
      expect(lastFormProps().divPfs).toEqual([]);
    });

    it("selects the first division by default", () => {
      renderPage();

      expect(screen.getByTestId("standings-form")).toHaveTextContent(
        scratchDiv.div_name
      );
      expect(lastFormProps().div.id).toBe(scratchDiv.id);
      expect(lastDivHeaderProps().selectedDivId).toBe(scratchDiv.id);
      expect(
        screen.getByRole("button", { name: scratchDiv.div_name })
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByRole("button", { name: hdcpDiv.div_name })
      ).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("building the divisions", () => {
    it("builds each division from the tournament's divisions", () => {
      renderPage();

      expect(lastFormProps().div).toEqual(scratchDiv);
      expect(lastFormProps().div.tmnt_id).toBe(tmntId);
    });

    it("takes the handicap settings from the tournament's divisions", () => {
      renderPage();
      fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));

      expect(lastFormProps().div).toMatchObject({
        id: hdcpDiv.id,
        hdcp_per: hdcpDiv.hdcp_per,
        hdcp_from: hdcpDiv.hdcp_from,
        int_hdcp: hdcpDiv.int_hdcp,
        hdcp_for: hdcpDiv.hdcp_for,
      });
      expect(lastFormProps().div.hdcp_per).toBeGreaterThan(0);
    });

    it("takes the division name and sort order from the tournament, not the results", () => {
      setResultsState({
        results: [
          makeResult(player1.id, scratchDiv, {
            div_name: "Renamed Scratch",
            sort_order: 5,
          }),
        ],
      });
      renderPage();

      expect(lastFormProps().div).toMatchObject({
        id: scratchDiv.id,
        div_name: scratchDiv.div_name,
        sort_order: scratchDiv.sort_order,
      });
      expect(
        screen.queryByRole("button", { name: "Renamed Scratch" })
      ).not.toBeInTheDocument();
    });

    it("sorts the divisions by the tournament's sort order, ignoring the results' sort order", () => {
      setResultsState({
        results: [
          makeResult(player1.id, scratchDiv, { sort_order: 9 }),
          makeResult(player1.id, hdcpDiv, { sort_order: 1 }),
        ],
      });
      renderPage();

      const names = screen.getAllByRole("button").map((b) => b.textContent);
      expect(names).toEqual([scratchDiv.div_name, hdcpDiv.div_name]);
      expect(lastFormProps().div.id).toBe(scratchDiv.id);
    });

    it("creates one division per division id, however many results it has", () => {
      renderPage();

      const { divs } = lastDivHeaderProps();
      expect(divs).toHaveLength(2);
      expect(divs.map((d) => d.id)).toEqual([scratchDiv.id, hdcpDiv.id]);
    });

    it("sorts the divisions by sort order, not by the order of the results", () => {
      setResultsState({ results: [...hdcpResults, ...scratchResults] });
      renderPage();

      const names = screen.getAllByRole("button").map((b) => b.textContent);
      expect(names).toEqual([scratchDiv.div_name, hdcpDiv.div_name]);
      expect(lastFormProps().div.id).toBe(scratchDiv.id);
    });

    it("selects the division with the lowest sort order when the results come first for another division", () => {
      setResultsState({ results: [...hdcpResults, ...scratchResults] });
      renderPage();

      expect(
        screen.getByRole("button", { name: scratchDiv.div_name })
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("shows only the divisions that have results", () => {
      setResultsState({ results: hdcpResults });
      renderPage();

      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(
        screen.getByRole("button", { name: hdcpDiv.div_name })
      ).toBeInTheDocument();
      expect(lastFormProps().div.id).toBe(hdcpDiv.id);
    });
  });

  describe("division selection", () => {
    it("shows the division the user clicks", () => {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));

      expect(lastFormProps().div.id).toBe(hdcpDiv.id);
      expect(lastDivHeaderProps().selectedDivId).toBe(hdcpDiv.id);
      expect(screen.getByTestId("standings-form")).toHaveTextContent(
        hdcpDiv.div_name
      );
      expect(
        screen.getByRole("button", { name: hdcpDiv.div_name })
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByRole("button", { name: scratchDiv.div_name })
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("keeps passing all of the results and prize funds after a division is picked", () => {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));

      expect(lastFormProps().tmntResults).toBe(allResults);
      expect(lastFormProps().divPfs).toBe(mockDivPfs);
    });

    it("switches back when the first division is clicked again", () => {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));
      fireEvent.click(screen.getByRole("button", { name: scratchDiv.div_name }));

      expect(lastFormProps().div.id).toBe(scratchDiv.id);
    });

    it("does not fetch anything when a division is picked", () => {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("falls back to the first division when the selected division is no longer in the results", () => {
      const { rerender } = renderPage();

      fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));
      expect(lastFormProps().div.id).toBe(hdcpDiv.id);

      setResultsState({ results: scratchResults });
      rerender(<TmntStandingsPage />);

      expect(lastFormProps().div.id).toBe(scratchDiv.id);
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });
});


// // test/app/results/tmnts/standings/standingsPage.test.tsx
// // tests src/app/results/tmnt/[tmntId]/standings/page.tsx
// import React from "react";
// import { render, screen, fireEvent } from "@testing-library/react";
// import { useParams } from "next/navigation";
// import TmntStandingsPage from "@/app/results/tmnt/[tmntId]/standings/page";
// import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
// import TmntStandingsForm from "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm";
// import TmntDivHeader from "@/app/results/tmnt/[tmntId]/standings/tmntDivHeader";
// import { useTmntFullData } from "@/hooks/useTmntFullData";
// import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
// import { fetchDivPfs } from "@/redux/features/divPfs/divPfsSlice";
// import type { ioStatusType } from "@/redux/statusTypes";
// import type { tmntGameResult } from "@/lib/types/resultsTypes";
// import type { divDataType, divPfType, tmntFullType } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   mockDivPfs,
//   tmntId,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// /*************************/
// /* mocks for dependencies */
// /*************************/
// type MockState = {
//   results: {
//     loadedTmntId: string;
//     requestedTmntId: string;
//     loadStatus: ioStatusType;
//     error: string | undefined;
//     results: tmntGameResult[];
//   };
//   prizes: {
//     loadedTmntId: string;
//     requestedTmntId: string;
//     loadStatus: ioStatusType;
//     error: string | undefined;
//     divPfs: divPfType[];
//   };
// };

// let mockState = {} as MockState;
// const mockDispatch = jest.fn();

// jest.mock("react-redux", () => ({
//   useDispatch: () => mockDispatch,
//   useSelector: (selector: (state: MockState) => unknown) =>
//     selector(mockState),
// }));

// // the page only uses the store module for a type
// jest.mock("@/redux/store", () => ({}));

// jest.mock(
//   "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice",
//   () => ({
//     fetchOneTmntGameResults: jest.fn((id: string) => ({
//       type: "results/fetch",
//       payload: id,
//     })),
//     getOneTmntGameResultsError: (s: MockState) => s.results.error,
//     getOneTmntGameResultsLoadStatus: (s: MockState) => s.results.loadStatus,
//     getOneTmntGameResultsRequestedTmntId: (s: MockState) =>
//       s.results.requestedTmntId,
//     getOneTmntGameResultsTmntId: (s: MockState) => s.results.loadedTmntId,
//     selectOneTmntGameResults: (s: MockState) => s.results.results,
//   })
// );

// jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
//   fetchDivPfs: jest.fn((id: string) => ({
//     type: "divPfs/fetch",
//     payload: id,
//   })),
//   getDivPfsRequestedTmntId: (s: MockState) => s.prizes.requestedTmntId,
//   getDivPfsTmntId: (s: MockState) => s.prizes.loadedTmntId,
//   getDivPfsError: (s: MockState) => s.prizes.error,
//   getDivPfsLoadStatus: (s: MockState) => s.prizes.loadStatus,
//   selectDivPfs: (s: MockState) => s.prizes.divPfs,
// }));

// jest.mock("next/navigation", () => ({
//   useParams: jest.fn(),
// }));

// jest.mock("@/hooks/useTmntFullData", () => ({
//   useTmntFullData: jest.fn(),
// }));

// jest.mock("@/components/modal/waitModal", () => ({
//   __esModule: true,
//   default: ({ show, message }: { show: boolean; message: string }) =>
//     show ? <div data-testid="wait-modal">{message}</div> : null,
// }));

// jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => ({
//   __esModule: true,
//   default: jest.fn(
//     ({ selectedTmntPageBtn }: { selectedTmntPageBtn: string }) => (
//       <div data-testid="tmnt-header">{selectedTmntPageBtn}</div>
//     )
//   ),
// }));

// jest.mock("@/app/results/tmnt/[tmntId]/standings/tmntDivHeader", () => ({
//   __esModule: true,
//   default: jest.fn(
//     ({
//       divs,
//       selectedDivId,
//       onSelectDiv,
//     }: {
//       divs: { id: string; div_name: string }[];
//       selectedDivId: string;
//       onSelectDiv: (divId: string) => void;
//     }) => (
//       <div data-testid="div-header">
//         {divs.map((d) => (
//           <button
//             key={d.id}
//             type="button"
//             aria-pressed={d.id === selectedDivId}
//             onClick={() => onSelectDiv(d.id)}
//           >
//             {d.div_name}
//           </button>
//         ))}
//       </div>
//     )
//   ),
// }));

// jest.mock("@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm", () => ({
//   __esModule: true,
//   default: jest.fn(({ div }: { div: { div_name: string } }) => (
//     <div data-testid="standings-form">{div.div_name}</div>
//   )),
// }));

// const mockedUseParams = useParams as jest.Mock;
// const mockedUseTmntFullData = useTmntFullData as jest.Mock;
// const mockedFetchResults = fetchOneTmntGameResults as unknown as jest.Mock;
// const mockedFetchDivPfs = fetchDivPfs as unknown as jest.Mock;
// const mockedHeader = TmntHomeHeader as unknown as jest.Mock;
// const mockedDivHeader = TmntDivHeader as unknown as jest.Mock;
// const mockedForm = TmntStandingsForm as unknown as jest.Mock;

// /********************************************/
// /* fixtures built from mockTmntFullData     */
// /********************************************/
// const { players } = mockTmntFullData;
// const [scratchDiv, hdcpDiv]: divDataType[] = mockTmntFullData.divs;

// const makeResult = (
//   playerId: string,
//   div: divDataType,
//   overrides: Record<string, unknown> = {}
// ) =>
//   ({
//     player_id: playerId,
//     div_id: div.id,
//     div_name: div.div_name,
//     sort_order: div.sort_order,
//     ...overrides,
//   }) as unknown as tmntGameResult;

// const scratchResults = players.map((p) => makeResult(p.id, scratchDiv));
// const hdcpResults = players.map((p) => makeResult(p.id, hdcpDiv));
// const allResults = [...scratchResults, ...hdcpResults];

// /***********/
// /* helpers */
// /***********/
// const retryMock = jest.fn();

// // the page reads tmntFullData.tmnt unconditionally, so the hook must always return an object
// const blankTmntData = (): tmntFullType => ({
//   ...mockTmntFullData,
//   tmnt: { ...mockTmntFullData.tmnt, id: "" },
// });

// type HookState = {
//   data?: tmntFullType;
//   hasData?: boolean;
//   failed?: boolean;
//   error?: string | null;
// };

// const setHook = ({
//   data = mockTmntFullData,
//   hasData = true,
//   failed = false,
//   error = null,
// }: HookState = {}) => {
//   mockedUseTmntFullData.mockReturnValue({
//     data,
//     hasData,
//     failed,
//     error,
//     retry: retryMock,
//   });
// };

// const setResultsState = (overrides: Partial<MockState["results"]> = {}) => {
//   mockState.results = {
//     loadedTmntId: tmntId,
//     requestedTmntId: tmntId,
//     loadStatus: "succeeded",
//     error: "",
//     results: allResults,
//     ...overrides,
//   };
// };

// const setPrizesState = (overrides: Partial<MockState["prizes"]> = {}) => {
//   mockState.prizes = {
//     loadedTmntId: tmntId,
//     requestedTmntId: tmntId,
//     loadStatus: "succeeded",
//     error: "",
//     divPfs: mockDivPfs,
//     ...overrides,
//   };
// };

// type FormProps = {
//   tmntId: string;
//   div: divDataType;
//   tmntResults: tmntGameResult[];
//   divPfs: divPfType[];
// };

// const lastFormProps = () =>
//   mockedForm.mock.calls[mockedForm.mock.calls.length - 1][0] as FormProps;

// const renderPage = () => render(<TmntStandingsPage />);

// describe("TmntResultsPage (standings)", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockedUseParams.mockReturnValue({ tmntId });
//     setHook();
//     setResultsState();
//     setPrizesState();
//   });

//   describe("fixture sanity check", () => {
//     it("mock tournament has two divisions with sort orders 1 and 2", () => {
//       expect(mockTmntFullData.divs).toHaveLength(2);
//       expect(scratchDiv.sort_order).toBe(1);
//       expect(hdcpDiv.sort_order).toBe(2);
//     });

//     it("mock has prize funds", () => {
//       expect(mockDivPfs.length).toBeGreaterThan(0);
//     });
//   });

//   describe("data requests", () => {
//     it("requests the tournament data using the tmntId from the route params", () => {
//       renderPage();
//       expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
//     });

//     it("does not request anything when results and prizes are already loaded for this tournament", () => {
//       renderPage();
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     describe("results", () => {
//       it("fetches the results when none are loaded", () => {
//         setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
//         renderPage();

//         expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
//         expect(mockDispatch).toHaveBeenCalledTimes(1);
//         expect(mockDispatch).toHaveBeenCalledWith({
//           type: "results/fetch",
//           payload: tmntId,
//         });
//       });

//       it("fetches the results when a different tournament's results are loaded", () => {
//         setResultsState({
//           loadedTmntId: "tmt_differentid00000000000000000000",
//           results: [],
//         });
//         renderPage();

//         expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
//       });

//       it("does not fetch the results while a request is already loading", () => {
//         setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
//         renderPage();

//         expect(mockedFetchResults).not.toHaveBeenCalled();
//       });

//       it("does not fetch the results again when the request for this tournament failed", () => {
//         setResultsState({
//           loadedTmntId: "",
//           loadStatus: "failed",
//           requestedTmntId: tmntId,
//           results: [],
//         });
//         renderPage();

//         expect(mockedFetchResults).not.toHaveBeenCalled();
//       });

//       it("fetches the results when a previous failure was for a different tournament", () => {
//         setResultsState({
//           loadedTmntId: "",
//           loadStatus: "failed",
//           requestedTmntId: "tmt_differentid00000000000000000000",
//           results: [],
//         });
//         renderPage();

//         expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
//       });
//     });

//     describe("prizes", () => {
//       it("fetches the prizes when none are loaded", () => {
//         setPrizesState({ loadedTmntId: "", loadStatus: "idle", divPfs: [] });
//         renderPage();

//         expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
//         expect(mockDispatch).toHaveBeenCalledTimes(1);
//         expect(mockDispatch).toHaveBeenCalledWith({
//           type: "divPfs/fetch",
//           payload: tmntId,
//         });
//       });

//       it("fetches the prizes when a different tournament's prizes are loaded", () => {
//         setPrizesState({
//           loadedTmntId: "tmt_differentid00000000000000000000",
//           divPfs: [],
//         });
//         renderPage();

//         expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
//       });

//       it("does not fetch the prizes while a request is already loading", () => {
//         setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
//         renderPage();

//         expect(mockedFetchDivPfs).not.toHaveBeenCalled();
//       });

//       it("does not fetch the prizes again when the request for this tournament failed", () => {
//         setPrizesState({
//           loadedTmntId: "",
//           loadStatus: "failed",
//           requestedTmntId: tmntId,
//           divPfs: [],
//         });
//         renderPage();

//         expect(mockedFetchDivPfs).not.toHaveBeenCalled();
//       });

//       it("fetches the prizes when a previous failure was for a different tournament", () => {
//         setPrizesState({
//           loadedTmntId: "",
//           loadStatus: "failed",
//           requestedTmntId: "tmt_differentid00000000000000000000",
//           divPfs: [],
//         });
//         renderPage();

//         expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
//       });
//     });

//     it("requests results and prizes even while the tournament is still loading", () => {
//       setHook({ data: blankTmntData(), hasData: false });
//       setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
//       setPrizesState({ loadedTmntId: "", loadStatus: "idle", divPfs: [] });
//       renderPage();

//       expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
//       expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
//       expect(mockDispatch).toHaveBeenCalledTimes(2);
//     });
//   });

//   describe("tournament loading and error", () => {
//     it("shows the wait modal while the tournament is loading", () => {
//       setHook({ data: blankTmntData(), hasData: false });
//       renderPage();

//       expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
//       expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
//       expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
//     });

//     it("shows a generic error message when the tournament failed to load", () => {
//       setHook({
//         data: blankTmntData(),
//         hasData: false,
//         failed: true,
//         error: "Network error",
//       });
//       renderPage();

//       expect(
//         screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
//       ).toBeInTheDocument();
//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//     });

//     it("shows the generic error message when failed but the error is null", () => {
//       setHook({ data: blankTmntData(), hasData: false, failed: true, error: null });
//       renderPage();

//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//     });

//     it("shows the missing data message when the error mentions a missing required child", () => {
//       setHook({
//         data: blankTmntData(),
//         hasData: false,
//         failed: true,
//         error: "Tournament has a missing required child: events",
//       });
//       renderPage();

//       expect(
//         screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
//       ).toBeInTheDocument();
//     });

//     it("calls the hook's retry (and does not dispatch) when Retry is clicked", () => {
//       setHook({ data: blankTmntData(), hasData: false, failed: true, error: "boom" });
//       renderPage();

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//       expect(retryMock).toHaveBeenCalledTimes(1);
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("renders the page instead of the error when data exists even if failed is true", () => {
//       setHook({ hasData: true, failed: true, error: "stale error" });
//       renderPage();

//       expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
//       expect(screen.getByTestId("standings-form")).toBeInTheDocument();
//     });
//   });

//   describe("results loading and error", () => {
//     const setResultsFailed = (error: string | undefined) =>
//       setResultsState({
//         loadedTmntId: "",
//         loadStatus: "failed",
//         requestedTmntId: tmntId,
//         error,
//         results: [],
//       });

//     it("shows the wait modal while the results are loading", () => {
//       setResultsState({ loadedTmntId: "", loadStatus: "loading", results: [] });
//       renderPage();

//       expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
//       expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
//       expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
//     });

//     it("shows the results error from the slice when loading the results failed", () => {
//       setResultsFailed("Games service down");
//       renderPage();

//       expect(
//         screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
//       ).toBeInTheDocument();
//       expect(screen.getByText("Games service down")).toBeInTheDocument();
//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//     });

//     it.each([
//       ["undefined", undefined],
//       ["an empty string", ""],
//     ])("shows a default message when the results error is %s", (_label, error) => {
//       setResultsFailed(error);
//       renderPage();

//       expect(
//         screen.getByText(
//           `An error occurred while loading games for tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//     });

//     it("dispatches fetchOneTmntGameResults when Retry is clicked", () => {
//       setResultsFailed("Games service down");
//       renderPage();
//       expect(mockDispatch).not.toHaveBeenCalled();

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//       expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//       expect(mockDispatch).toHaveBeenCalledWith({
//         type: "results/fetch",
//         payload: tmntId,
//       });
//       expect(retryMock).not.toHaveBeenCalled();
//     });

//     it("shows the wait modal, not the error, when the failure was for a different tournament", () => {
//       setResultsState({
//         loadedTmntId: "",
//         loadStatus: "failed",
//         requestedTmntId: "tmt_differentid00000000000000000000",
//         error: "some other error",
//         results: [],
//       });
//       renderPage();

//       expect(screen.queryByText("some other error")).not.toBeInTheDocument();
//       expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
//     });
//   });

//   describe("prizes loading and error", () => {
//     const setPrizesFailed = (error: string | undefined) =>
//       setPrizesState({
//         loadedTmntId: "",
//         loadStatus: "failed",
//         requestedTmntId: tmntId,
//         error,
//         divPfs: [],
//       });

//     it("shows the wait modal while the prizes are loading", () => {
//       setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
//       renderPage();

//       expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
//       expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
//     });

//     it("shows the prizes error from the slice when loading the prizes failed", () => {
//       setPrizesFailed("Prize service down");
//       renderPage();

//       expect(
//         screen.getByRole("heading", {
//           level: 4,
//           name: "Unable to load tournament prizes",
//         })
//       ).toBeInTheDocument();
//       expect(screen.getByText("Prize service down")).toBeInTheDocument();
//       expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
//     });

//     it.each([
//       ["undefined", undefined],
//       ["an empty string", ""],
//     ])("shows a default message when the prizes error is %s", (_label, error) => {
//       setPrizesFailed(error);
//       renderPage();

//       expect(
//         screen.getByText(
//           `An error occurred while loading prizes for tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//     });

//     it("dispatches fetchDivPfs when Retry is clicked", () => {
//       setPrizesFailed("Prize service down");
//       renderPage();
//       expect(mockDispatch).not.toHaveBeenCalled();

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//       expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//       expect(mockDispatch).toHaveBeenCalledWith({
//         type: "divPfs/fetch",
//         payload: tmntId,
//       });
//     });

//     it("shows the results error before the prizes error when both failed", () => {
//       setResultsState({
//         loadedTmntId: "",
//         loadStatus: "failed",
//         requestedTmntId: tmntId,
//         error: "Games service down",
//         results: [],
//       });
//       setPrizesFailed("Prize service down");
//       renderPage();

//       expect(screen.getByText("Games service down")).toBeInTheDocument();
//       expect(screen.queryByText("Prize service down")).not.toBeInTheDocument();
//     });
//   });

//   describe("no results", () => {
//     it("shows the header and a no results message when the tournament has no results", () => {
//       setResultsState({ results: [] });
//       renderPage();

//       expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Standings");
//       expect(
//         screen.getByText("No results are available for this tournament yet.")
//       ).toBeInTheDocument();
//       expect(screen.queryByTestId("div-header")).not.toBeInTheDocument();
//       expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
//     });

//     it("shows the no results message even while the prizes are still loading", () => {
//       setResultsState({ results: [] });
//       setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
//       renderPage();

//       expect(
//         screen.getByText("No results are available for this tournament yet.")
//       ).toBeInTheDocument();
//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//     });

//     it("shows the prizes error before the no results message", () => {
//       setResultsState({ results: [] });
//       setPrizesState({
//         loadedTmntId: "",
//         loadStatus: "failed",
//         requestedTmntId: tmntId,
//         error: "Prize service down",
//         divPfs: [],
//       });
//       renderPage();

//       expect(screen.getByText("Prize service down")).toBeInTheDocument();
//       expect(
//         screen.queryByText("No results are available for this tournament yet.")
//       ).not.toBeInTheDocument();
//     });

//     it("shows the no results message when the loaded tournament id does not match the route", () => {
//       setHook({
//         data: {
//           ...mockTmntFullData,
//           tmnt: { ...mockTmntFullData.tmnt, id: "tmt_differentid00000000000000000000" },
//         },
//       });
//       renderPage();

//       expect(
//         screen.getByText("No results are available for this tournament yet.")
//       ).toBeInTheDocument();
//     });

//     it("shows the no results message when no result matches a tournament division", () => {
//       setResultsState({
//         results: [
//           makeResult(players[0].id, scratchDiv, {
//             div_id: "div_unknown000000000000000000000000",
//           }),
//         ],
//       });
//       renderPage();

//       expect(
//         screen.getByText("No results are available for this tournament yet.")
//       ).toBeInTheDocument();
//     });
//   });

//   describe("standings content", () => {
//     it("renders the header with the tournament data and Standings selected", () => {
//       renderPage();

//       expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Standings");
//       const props = mockedHeader.mock.calls[0][0] as {
//         tmntFullData: tmntFullType;
//         selectedTmntPageBtn: string;
//       };
//       expect(props.tmntFullData).toBe(mockTmntFullData);
//       expect(props.selectedTmntPageBtn).toBe("Standings");
//     });

//     it("does not render a wait modal or an error when everything is loaded", () => {
//       renderPage();

//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//       expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
//     });

//     it("renders one division button per division in the results", () => {
//       renderPage();

//       const header = screen.getByTestId("div-header");
//       expect(header).toBeInTheDocument();
//       expect(screen.getAllByRole("button")).toHaveLength(2);
//       expect(
//         screen.getByRole("button", { name: scratchDiv.div_name })
//       ).toBeInTheDocument();
//       expect(
//         screen.getByRole("button", { name: hdcpDiv.div_name })
//       ).toBeInTheDocument();
//     });

//     it("passes all of the results and all of the prize funds to the standings form", () => {
//       renderPage();

//       const props = lastFormProps();
//       expect(props.tmntId).toBe(tmntId);
//       expect(props.tmntResults).toBe(allResults);
//       expect(props.divPfs).toBe(mockDivPfs);
//     });

//     it("selects the first division by default", () => {
//       renderPage();

//       expect(screen.getByTestId("standings-form")).toHaveTextContent(
//         scratchDiv.div_name
//       );
//       expect(lastFormProps().div.id).toBe(scratchDiv.id);
//       expect(
//         screen.getByRole("button", { name: scratchDiv.div_name })
//       ).toHaveAttribute("aria-pressed", "true");
//       expect(
//         screen.getByRole("button", { name: hdcpDiv.div_name })
//       ).toHaveAttribute("aria-pressed", "false");
//     });
//   });

//   describe("building the divisions", () => {
//     const divHeaderProps = () => {
//       const calls = mockedDivHeader.mock.calls;
//       return calls[calls.length - 1][0] as {
//         divs: divDataType[];
//         selectedDivId: string;
//       };
//     };

//     it("builds each division from the tournament's divisions", () => {
//       renderPage();

//       expect(lastFormProps().div).toMatchObject({
//         id: scratchDiv.id,
//         tmnt_id: tmntId,
//         div_name: scratchDiv.div_name,
//         hdcp_per: scratchDiv.hdcp_per,
//         hdcp_from: scratchDiv.hdcp_from,
//         int_hdcp: scratchDiv.int_hdcp,
//         hdcp_for: scratchDiv.hdcp_for,
//         sort_order: scratchDiv.sort_order,
//       });
//     });

//     it("takes the handicap settings from the tournament's divisions", () => {
//       renderPage();
//       fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));

//       expect(lastFormProps().div).toMatchObject({
//         id: hdcpDiv.id,
//         hdcp_per: hdcpDiv.hdcp_per,
//         hdcp_from: hdcpDiv.hdcp_from,
//         int_hdcp: hdcpDiv.int_hdcp,
//         hdcp_for: hdcpDiv.hdcp_for,
//       });
//       expect(lastFormProps().div.hdcp_per).toBeGreaterThan(0);
//     });

//     it("takes the division name and sort order from the results", () => {
//       setResultsState({
//         results: [
//           makeResult(players[0].id, scratchDiv, {
//             div_name: "Renamed Scratch",
//             sort_order: 5,
//           }),
//         ],
//       });
//       renderPage();

//       expect(lastFormProps().div).toMatchObject({
//         id: scratchDiv.id,
//         div_name: "Renamed Scratch",
//         sort_order: 5,
//       });
//     });

//     it("creates one division per division id, however many results it has", () => {
//       renderPage();

//       expect(divHeaderProps().divs).toHaveLength(2);
//       expect(divHeaderProps().divs.map((d) => d.id)).toEqual([
//         scratchDiv.id,
//         hdcpDiv.id,
//       ]);
//     });

//     it("sorts the divisions by sort order, not by the order of the results", () => {
//       setResultsState({ results: [...hdcpResults, ...scratchResults] });
//       renderPage();

//       const names = screen.getAllByRole("button").map((b) => b.textContent);
//       expect(names).toEqual([scratchDiv.div_name, hdcpDiv.div_name]);
//       expect(lastFormProps().div.id).toBe(scratchDiv.id);
//     });

//     it("skips a division that is in the results but not in the tournament's divisions", () => {
//       setResultsState({
//         results: [
//           ...allResults,
//           makeResult(players[0].id, scratchDiv, {
//             div_id: "div_unknown000000000000000000000000",
//             div_name: "Unknown",
//             sort_order: 3,
//           }),
//         ],
//       });
//       renderPage();

//       expect(screen.getAllByRole("button")).toHaveLength(2);
//       expect(
//         screen.queryByRole("button", { name: "Unknown" })
//       ).not.toBeInTheDocument();
//     });

//     it("shows only the divisions that have results", () => {
//       setResultsState({ results: hdcpResults });
//       renderPage();

//       expect(screen.getAllByRole("button")).toHaveLength(1);
//       expect(
//         screen.getByRole("button", { name: hdcpDiv.div_name })
//       ).toBeInTheDocument();
//       expect(lastFormProps().div.id).toBe(hdcpDiv.id);
//     });
//   });

//   describe("division selection", () => {
//     it("shows the division the user clicks", () => {
//       renderPage();

//       fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));

//       expect(lastFormProps().div.id).toBe(hdcpDiv.id);
//       expect(screen.getByTestId("standings-form")).toHaveTextContent(
//         hdcpDiv.div_name
//       );
//       expect(
//         screen.getByRole("button", { name: hdcpDiv.div_name })
//       ).toHaveAttribute("aria-pressed", "true");
//       expect(
//         screen.getByRole("button", { name: scratchDiv.div_name })
//       ).toHaveAttribute("aria-pressed", "false");
//     });

//     it("switches back when the first division is clicked again", () => {
//       renderPage();

//       fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));
//       fireEvent.click(screen.getByRole("button", { name: scratchDiv.div_name }));

//       expect(lastFormProps().div.id).toBe(scratchDiv.id);
//     });

//     it("falls back to the first division when the selected division is no longer in the results", () => {
//       const { rerender } = renderPage();

//       fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));
//       expect(lastFormProps().div.id).toBe(hdcpDiv.id);

//       setResultsState({ results: scratchResults });
//       rerender(<TmntStandingsPage />);

//       expect(lastFormProps().div.id).toBe(scratchDiv.id);
//       expect(screen.getAllByRole("button")).toHaveLength(1);
//     });
//   });
// });

