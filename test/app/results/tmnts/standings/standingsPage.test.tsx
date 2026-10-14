// test/app/results/tmnts/standings/standingsPage.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useParams } from "next/navigation";
import TmntResultsPage from "@/app/results/tmnt/[tmntId]/standings/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import TmntStandingsForm from "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm";
import TmntDivHeader from "@/app/results/tmnt/[tmntId]/standings/tmntDivHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { fetchOneTmntGameResults } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { fetchDivPfs } from "@/redux/features/divPfs/divPfsSlice";
import type { ioStatusType } from "@/redux/statusTypes";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import type { divDataType, divPfType, tmntFullType } from "@/lib/types/types";
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

jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
  fetchDivPfs: jest.fn((id: string) => ({
    type: "divPfs/fetch",
    payload: id,
  })),
  getDivPfRequestedTmntId: (s: MockState) => s.prizes.requestedTmntId,
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
            onClick={() => onSelectDiv(d.id)}
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

const mockedUseParams = useParams as jest.Mock;
const mockedUseTmntFullData = useTmntFullData as jest.Mock;
const mockedFetchResults = fetchOneTmntGameResults as unknown as jest.Mock;
const mockedFetchDivPfs = fetchDivPfs as unknown as jest.Mock;
const mockedHeader = TmntHomeHeader as unknown as jest.Mock;
const mockedDivHeader = TmntDivHeader as unknown as jest.Mock;
const mockedForm = TmntStandingsForm as unknown as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players } = mockTmntFullData;
const [scratchDiv, hdcpDiv]: divDataType[] = mockTmntFullData.divs;

const makeResult = (
  playerId: string,
  div: divDataType,
  overrides: Record<string, unknown> = {}
) =>
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

/***********/
/* helpers */
/***********/
const retryMock = jest.fn();

// the page reads tmntFullData.tmnt unconditionally, so the hook must always return an object
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

type FormProps = {
  tmntId: string;
  div: divDataType;
  tmntResults: tmntGameResult[];
  divPfs: divPfType[];
};

const lastFormProps = () =>
  mockedForm.mock.calls[mockedForm.mock.calls.length - 1][0] as FormProps;

const renderPage = () => render(<TmntResultsPage />);

describe("TmntResultsPage (standings)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    setHook();
    setResultsState();
    setPrizesState();
  });

  describe("fixture sanity check", () => {
    it("mock tournament has two divisions with sort orders 1 and 2", () => {
      expect(mockTmntFullData.divs).toHaveLength(2);
      expect(scratchDiv.sort_order).toBe(1);
      expect(hdcpDiv.sort_order).toBe(2);
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
        setResultsState({
          loadedTmntId: "tmt_differentid00000000000000000000",
          results: [],
        });
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
          requestedTmntId: "tmt_differentid00000000000000000000",
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
        setPrizesState({
          loadedTmntId: "tmt_differentid00000000000000000000",
          divPfs: [],
        });
        renderPage();

        expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
      });

      it("does not fetch the prizes while a request is already loading", () => {
        setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
        renderPage();

        expect(mockedFetchDivPfs).not.toHaveBeenCalled();
      });

      it("does not fetch the prizes again when the request for this tournament failed", () => {
        setPrizesState({
          loadedTmntId: "",
          loadStatus: "failed",
          requestedTmntId: tmntId,
          divPfs: [],
        });
        renderPage();

        expect(mockedFetchDivPfs).not.toHaveBeenCalled();
      });

      it("fetches the prizes when a previous failure was for a different tournament", () => {
        setPrizesState({
          loadedTmntId: "",
          loadStatus: "failed",
          requestedTmntId: "tmt_differentid00000000000000000000",
          divPfs: [],
        });
        renderPage();

        expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
      });
    });

    it("requests results and prizes even while the tournament is still loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      setResultsState({ loadedTmntId: "", loadStatus: "idle", results: [] });
      setPrizesState({ loadedTmntId: "", loadStatus: "idle", divPfs: [] });
      renderPage();

      expect(mockedFetchResults).toHaveBeenCalledWith(tmntId);
      expect(mockedFetchDivPfs).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("tournament loading and error", () => {
    it("shows the wait modal while the tournament is loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
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

    it("renders the page instead of the error when data exists even if failed is true", () => {
      setHook({ hasData: true, failed: true, error: "stale error" });
      renderPage();

      expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
      expect(screen.getByTestId("standings-form")).toBeInTheDocument();
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
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it("shows the results error from the slice when loading the results failed", () => {
      setResultsFailed("Games service down");
      renderPage();

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(screen.getByText("Games service down")).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
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
        requestedTmntId: "tmt_differentid00000000000000000000",
        error: "some other error",
        results: [],
      });
      renderPage();

      expect(screen.queryByText("some other error")).not.toBeInTheDocument();
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
    });
  });

  describe("prizes loading and error", () => {
    const setPrizesFailed = (error: string | undefined) =>
      setPrizesState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: tmntId,
        error,
        divPfs: [],
      });

    it("shows the wait modal while the prizes are loading", () => {
      setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
      renderPage();

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
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
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "divPfs/fetch",
        payload: tmntId,
      });
    });

    it("shows the results error before the prizes error when both failed", () => {
      setResultsState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: tmntId,
        error: "Games service down",
        results: [],
      });
      setPrizesFailed("Prize service down");
      renderPage();

      expect(screen.getByText("Games service down")).toBeInTheDocument();
      expect(screen.queryByText("Prize service down")).not.toBeInTheDocument();
    });
  });

  describe("no results", () => {
    it("shows the header and a no results message when the tournament has no results", () => {
      setResultsState({ results: [] });
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Standings");
      expect(
        screen.getByText("No results are available for this tournament yet.")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("div-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("standings-form")).not.toBeInTheDocument();
    });

    it("shows the no results message even while the prizes are still loading", () => {
      setResultsState({ results: [] });
      setPrizesState({ loadedTmntId: "", loadStatus: "loading", divPfs: [] });
      renderPage();

      expect(
        screen.getByText("No results are available for this tournament yet.")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("shows the prizes error before the no results message", () => {
      setResultsState({ results: [] });
      setPrizesState({
        loadedTmntId: "",
        loadStatus: "failed",
        requestedTmntId: tmntId,
        error: "Prize service down",
        divPfs: [],
      });
      renderPage();

      expect(screen.getByText("Prize service down")).toBeInTheDocument();
      expect(
        screen.queryByText("No results are available for this tournament yet.")
      ).not.toBeInTheDocument();
    });

    it("shows the no results message when the loaded tournament id does not match the route", () => {
      setHook({
        data: {
          ...mockTmntFullData,
          tmnt: { ...mockTmntFullData.tmnt, id: "tmt_differentid00000000000000000000" },
        },
      });
      renderPage();

      expect(
        screen.getByText("No results are available for this tournament yet.")
      ).toBeInTheDocument();
    });

    it("shows the no results message when no result matches a tournament division", () => {
      setResultsState({
        results: [
          makeResult(players[0].id, scratchDiv, {
            div_id: "div_unknown000000000000000000000000",
          }),
        ],
      });
      renderPage();

      expect(
        screen.getByText("No results are available for this tournament yet.")
      ).toBeInTheDocument();
    });
  });

  describe("standings content", () => {
    it("renders the header with the tournament data and Standings selected", () => {
      renderPage();

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Standings");
      const props = mockedHeader.mock.calls[0][0] as {
        tmntFullData: tmntFullType;
        selectedTmntPageBtn: string;
      };
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedTmntPageBtn).toBe("Standings");
    });

    it("does not render a wait modal or an error when everything is loaded", () => {
      renderPage();

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
    });

    it("renders one division button per division in the results", () => {
      renderPage();

      const header = screen.getByTestId("div-header");
      expect(header).toBeInTheDocument();
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

    it("selects the first division by default", () => {
      renderPage();

      expect(screen.getByTestId("standings-form")).toHaveTextContent(
        scratchDiv.div_name
      );
      expect(lastFormProps().div.id).toBe(scratchDiv.id);
      expect(
        screen.getByRole("button", { name: scratchDiv.div_name })
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByRole("button", { name: hdcpDiv.div_name })
      ).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("building the divisions", () => {
    const divHeaderProps = () => {
      const calls = mockedDivHeader.mock.calls;
      return calls[calls.length - 1][0] as {
        divs: divDataType[];
        selectedDivId: string;
      };
    };

    it("builds each division from the tournament's divisions", () => {
      renderPage();

      expect(lastFormProps().div).toMatchObject({
        id: scratchDiv.id,
        tmnt_id: tmntId,
        div_name: scratchDiv.div_name,
        hdcp_per: scratchDiv.hdcp_per,
        hdcp_from: scratchDiv.hdcp_from,
        int_hdcp: scratchDiv.int_hdcp,
        hdcp_for: scratchDiv.hdcp_for,
        sort_order: scratchDiv.sort_order,
      });
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

    it("takes the division name and sort order from the results", () => {
      setResultsState({
        results: [
          makeResult(players[0].id, scratchDiv, {
            div_name: "Renamed Scratch",
            sort_order: 5,
          }),
        ],
      });
      renderPage();

      expect(lastFormProps().div).toMatchObject({
        id: scratchDiv.id,
        div_name: "Renamed Scratch",
        sort_order: 5,
      });
    });

    it("creates one division per division id, however many results it has", () => {
      renderPage();

      expect(divHeaderProps().divs).toHaveLength(2);
      expect(divHeaderProps().divs.map((d) => d.id)).toEqual([
        scratchDiv.id,
        hdcpDiv.id,
      ]);
    });

    it("sorts the divisions by sort order, not by the order of the results", () => {
      setResultsState({ results: [...hdcpResults, ...scratchResults] });
      renderPage();

      const names = screen.getAllByRole("button").map((b) => b.textContent);
      expect(names).toEqual([scratchDiv.div_name, hdcpDiv.div_name]);
      expect(lastFormProps().div.id).toBe(scratchDiv.id);
    });

    it("skips a division that is in the results but not in the tournament's divisions", () => {
      setResultsState({
        results: [
          ...allResults,
          makeResult(players[0].id, scratchDiv, {
            div_id: "div_unknown000000000000000000000000",
            div_name: "Unknown",
            sort_order: 3,
          }),
        ],
      });
      renderPage();

      expect(screen.getAllByRole("button")).toHaveLength(2);
      expect(
        screen.queryByRole("button", { name: "Unknown" })
      ).not.toBeInTheDocument();
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

    it("switches back when the first division is clicked again", () => {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));
      fireEvent.click(screen.getByRole("button", { name: scratchDiv.div_name }));

      expect(lastFormProps().div.id).toBe(scratchDiv.id);
    });

    it("falls back to the first division when the selected division is no longer in the results", () => {
      const { rerender } = renderPage();

      fireEvent.click(screen.getByRole("button", { name: hdcpDiv.div_name }));
      expect(lastFormProps().div.id).toBe(hdcpDiv.id);

      setResultsState({ results: scratchResults });
      rerender(<TmntResultsPage />);

      expect(lastFormProps().div.id).toBe(scratchDiv.id);
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });
});

// import React from "react";
// import "@testing-library/jest-dom";
// import { cloneDeep } from "lodash";
// import {
//   fireEvent,
//   render,
//   screen,
//   within,
// } from "@testing-library/react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "next/navigation";
// import TmntResultsPage from "@/app/results/tmnt/[tmntId]/standings/page";
// import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
// import TmntStandingsForm from "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm";
// import { useTmntFullData } from "@/hooks/useTmntFullData";
// import type { tmntGameResult } from "@/lib/types/resultsTypes";
// import type {
//   divDataType,
//   divPfType,
//   tmntFullType,
// } from "@/lib/types/types";
// import {
//   fetchOneTmntGameResults,
//   getOneTmntGameResultsError,
//   getOneTmntGameResultsLoadStatus,
//   getOneTmntGameResultsRequestedTmntId,
//   getOneTmntGameResultsTmntId,
//   selectOneTmntGameResults,
// } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
// import {
//   fetchDivPfs,
//   getDivPfRequestedTmntId,
//   getDivPfsError,
//   getDivPfsLoadStatus,
//   getDivPfsTmntId,
//   selectDivPfs,
// } from "@/redux/features/divPfs/divPfsSlice";
// import {
//   divId1,
//   divId2,
//   mockDivPfs,
//   mockGames,
//   mockTmntFullData,
//   playerId1,
//   playerId2,
//   tmntId,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// jest.mock("next/navigation", () => ({
//   useParams: jest.fn(),
// }));

// jest.mock("react-redux", () => ({
//   useDispatch: jest.fn(),
//   useSelector: jest.fn(),
// }));

// jest.mock("@/hooks/useTmntFullData", () => ({
//   useTmntFullData: jest.fn(),
// }));

// jest.mock(
//   "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice",
//   () => ({
//     fetchOneTmntGameResults: jest.fn((id: string) => ({
//       type: "test/fetchOneTmntGameResults",
//       payload: id,
//     })),
//     getOneTmntGameResultsError: jest.fn(),
//     getOneTmntGameResultsLoadStatus: jest.fn(),
//     getOneTmntGameResultsRequestedTmntId: jest.fn(),
//     getOneTmntGameResultsTmntId: jest.fn(),
//     selectOneTmntGameResults: jest.fn(),
//   }),
// );

// jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
//   fetchDivPfs: jest.fn((id: string) => ({
//     type: "test/fetchDivPfs",
//     payload: id,
//   })),
//   getDivPfRequestedTmntId: jest.fn(),
//   getDivPfsError: jest.fn(),
//   getDivPfsLoadStatus: jest.fn(),
//   getDivPfsTmntId: jest.fn(),
//   selectDivPfs: jest.fn(),
// }));

// jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => ({
//   __esModule: true,
//   default: jest.fn(function MockTmntHomeHeader() {
//     return <div data-testid="tmnt-home-header">Tournament Header</div>;
//   }),
// }));

// jest.mock(
//   "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm",
//   () => ({
//     __esModule: true,
//     default: jest.fn(function MockTmntStandingsForm({
//       div,
//     }: {
//       tmntId: string;
//       div: divDataType;
//       tmntResults: tmntGameResult[];
//       divPfs: divPfType[];
//     }) {
//       return (
//         <div data-testid={`standings-form-${div.id}`}>
//           Standings for {div.div_name}
//         </div>
//       );
//     }),
//   }),
// );

// jest.mock("@/components/modal/waitModal", () => ({
//   __esModule: true,
//   default: function MockWaitModal({
//     show,
//     message,
//   }: {
//     show: boolean;
//     message: string;
//   }) {
//     return show ? <div role="status">{message}</div> : null;
//   },
// }));

// const mockedUseParams = jest.mocked(useParams);
// const mockedUseDispatch = jest.mocked(useDispatch);
// const mockedUseSelector = jest.mocked(useSelector);
// const mockedUseTmntFullData = jest.mocked(useTmntFullData);
// const mockedHeader = jest.mocked(TmntHomeHeader);
// const mockedStandingsForm = jest.mocked(TmntStandingsForm);

// type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

// type PageHookResult = Pick<
//   ReturnType<typeof useTmntFullData>,
//   "data" | "hasData" | "failed" | "error" | "retry"
// >;

// interface SelectorState {
//   requestedResultsTmntId: string;
//   resultsLoadStatus: LoadStatus;
//   resultsTmntId: string;
//   tmntResults: tmntGameResult[];
//   resultsError: string | null;

//   requestedPrizesTmntId: string;
//   prizesTmntId: string;
//   prizesLoadStatus: LoadStatus;
//   prizesError: string | null;
//   divPfs: divPfType[];
// }

// const otherTmntId = "tmt_0123388a8fc4641a2e37233f1d6bebd2";

// const createTmntResult = (
//   playerId: string,
//   divId: string,
//   divName: string,
//   sortOrder: number,
// ): tmntGameResult => {
//   const player = mockTmntFullData.players.find(
//     (item) => item.id === playerId,
//   );

//   if (!player) {
//     throw new Error(`Player not found: ${playerId}`);
//   }

//   const total = mockGames
//     .filter((game) => game.player_id === playerId)
//     .reduce((sum, game) => sum + game.score, 0);

//   return {
//     player_id: player.id,
//     div_id: divId,
//     div_name: divName,
//     sort_order: sortOrder,
//     tmnt_name: mockTmntFullData.tmnt.tmnt_name,
//     start_date: mockTmntFullData.tmnt.start_date_str,
//     full_name: `${player.first_name} ${player.last_name}`,
//     average: player.average,
//     hdcp: 0,
//     total,
//     total_hdcp: 0,
//     "total + Hdcp": total,
//   };
// };

// // Put HDCP first to verify that sort_order determines tab order.
// const mockTmntResults: tmntGameResult[] = [
//   createTmntResult(playerId2, divId2, "HDCP", 2),
//   createTmntResult(playerId1, divId1, "Scratch", 1),
// ];

// describe("Tournament standings page", () => {
//   let tournamentData: tmntFullType;
//   let hookResult: PageHookResult;
//   let selectorState: SelectorState;

//   const dispatch = jest.fn();
//   const retryTmnt = jest.fn();

//   const setHookResult = (
//     overrides: Partial<PageHookResult> = {},
//   ) => {
//     hookResult = { ...hookResult, ...overrides };

//     // Supply the hook fields consumed by this page.
//     mockedUseTmntFullData.mockReturnValue(
//       hookResult as ReturnType<typeof useTmntFullData>,
//     );
//   };

//   const setSelectorState = (
//     overrides: Partial<SelectorState> = {},
//   ) => {
//     selectorState = { ...selectorState, ...overrides };

//     const values = new Map<unknown, unknown>([
//       [
//         getOneTmntGameResultsRequestedTmntId,
//         selectorState.requestedResultsTmntId,
//       ],
//       [
//         getOneTmntGameResultsLoadStatus,
//         selectorState.resultsLoadStatus,
//       ],
//       [getOneTmntGameResultsTmntId, selectorState.resultsTmntId],
//       [selectOneTmntGameResults, selectorState.tmntResults],
//       [getOneTmntGameResultsError, selectorState.resultsError],
//       [getDivPfRequestedTmntId, selectorState.requestedPrizesTmntId],
//       [getDivPfsTmntId, selectorState.prizesTmntId],
//       [getDivPfsLoadStatus, selectorState.prizesLoadStatus],
//       [getDivPfsError, selectorState.prizesError],
//       [selectDivPfs, selectorState.divPfs],
//     ]);

//     mockedUseSelector.mockImplementation((selector) => {
//       if (!values.has(selector)) {
//         throw new Error("Unexpected Redux selector");
//       }

//       return values.get(selector);
//     });
//   };

//   const expectResultsFetch = () => {
//     expect(fetchOneTmntGameResults).toHaveBeenCalledTimes(1);
//     expect(fetchOneTmntGameResults).toHaveBeenCalledWith(tmntId);

//     expect(dispatch).toHaveBeenCalledWith({
//       type: "test/fetchOneTmntGameResults",
//       payload: tmntId,
//     });
//   };

//   const expectPrizesFetch = () => {
//     expect(fetchDivPfs).toHaveBeenCalledTimes(1);
//     expect(fetchDivPfs).toHaveBeenCalledWith(tmntId);

//     expect(dispatch).toHaveBeenCalledWith({
//       type: "test/fetchDivPfs",
//       payload: tmntId,
//     });
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();

//     tournamentData = cloneDeep(mockTmntFullData);

//     dispatch.mockReset();
//     retryTmnt.mockReset();
//     retryTmnt.mockResolvedValue(undefined);

//     mockedUseParams.mockReturnValue({ tmntId });
//     mockedUseDispatch.mockReturnValue(dispatch);

//     hookResult = {
//       data: tournamentData,
//       hasData: true,
//       failed: false,
//       error: "",
//       retry: retryTmnt,
//     };

//     selectorState = {
//       requestedResultsTmntId: tmntId,
//       resultsLoadStatus: "succeeded",
//       resultsTmntId: tmntId,
//       tmntResults: cloneDeep(mockTmntResults),
//       resultsError: null,

//       requestedPrizesTmntId: tmntId,
//       prizesTmntId: tmntId,
//       prizesLoadStatus: "succeeded",
//       prizesError: null,
//       divPfs: cloneDeep(mockDivPfs),
//     };

//     setHookResult();
//     setSelectorState();
//   });

//   describe("data loading", () => {
//     it("passes the route tournament ID to useTmntFullData", () => {
//       render(<TmntResultsPage />);

//       expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
//     });

//     it("does not fetch results or prizes when both belong to this tournament", () => {
//       render(<TmntResultsPage />);

//       expect(fetchOneTmntGameResults).not.toHaveBeenCalled();
//       expect(fetchDivPfs).not.toHaveBeenCalled();
//       expect(dispatch).not.toHaveBeenCalled();
//     });

//     it.each(["", otherTmntId])(
//       "fetches results when the cached tournament ID is %j",
//       (resultsTmntId) => {
//         setSelectorState({
//           resultsTmntId,
//           resultsLoadStatus: "idle",
//           requestedResultsTmntId: "",
//         });

//         render(<TmntResultsPage />);

//         expectResultsFetch();
//         expect(fetchDivPfs).not.toHaveBeenCalled();
//       },
//     );

//     it.each(["", otherTmntId])(
//       "fetches prizes when the cached tournament ID is %j",
//       (prizesTmntId) => {
//         setSelectorState({
//           prizesTmntId,
//           prizesLoadStatus: "idle",
//           requestedPrizesTmntId: "",
//         });

//         render(<TmntResultsPage />);

//         expectPrizesFetch();
//         expect(fetchOneTmntGameResults).not.toHaveBeenCalled();
//       },
//     );

//     it("does not fetch results while a results request is loading", () => {
//       setSelectorState({
//         resultsTmntId: "",
//         resultsLoadStatus: "loading",
//       });

//       render(<TmntResultsPage />);

//       expect(fetchOneTmntGameResults).not.toHaveBeenCalled();
//     });

//     it("does not fetch prizes while a prize request is loading", () => {
//       setSelectorState({
//         prizesTmntId: "",
//         prizesLoadStatus: "loading",
//       });

//       render(<TmntResultsPage />);

//       expect(fetchDivPfs).not.toHaveBeenCalled();
//     });

//     it("does not automatically retry results that failed for this tournament", () => {
//       setSelectorState({
//         resultsTmntId: "",
//         resultsLoadStatus: "failed",
//         requestedResultsTmntId: tmntId,
//       });

//       render(<TmntResultsPage />);

//       expect(fetchOneTmntGameResults).not.toHaveBeenCalled();
//     });

//     it("does not automatically retry prizes that failed for this tournament", () => {
//       setSelectorState({
//         prizesTmntId: "",
//         prizesLoadStatus: "failed",
//         requestedPrizesTmntId: tmntId,
//       });

//       render(<TmntResultsPage />);

//       expect(fetchDivPfs).not.toHaveBeenCalled();
//     });

//     it("fetches results when the failed request belonged to another tournament", () => {
//       setSelectorState({
//         resultsTmntId: "",
//         resultsLoadStatus: "failed",
//         requestedResultsTmntId: otherTmntId,
//       });

//       render(<TmntResultsPage />);

//       expectResultsFetch();

//       expect(
//         screen.queryByRole("heading", {
//           name: "Unable to load tournament",
//         }),
//       ).not.toBeInTheDocument();
//     });

//     it("fetches prizes when the failed request belonged to another tournament", () => {
//       setSelectorState({
//         prizesTmntId: "",
//         prizesLoadStatus: "failed",
//         requestedPrizesTmntId: otherTmntId,
//       });

//       render(<TmntResultsPage />);

//       expectPrizesFetch();

//       expect(
//         screen.queryByRole("heading", {
//           name: "Unable to load tournament prizes",
//         }),
//       ).not.toBeInTheDocument();
//     });
//   });

//   describe("loading display", () => {
//     it("shows the loading modal while tournament data is unavailable", () => {
//       tournamentData.tmnt.id = "";
//       setHookResult({ hasData: false });

//       render(<TmntResultsPage />);

//       expect(screen.getByRole("status")).toHaveTextContent("Loading...");
//       expect(mockedHeader).not.toHaveBeenCalled();
//       expect(screen.queryByRole("tab")).not.toBeInTheDocument();
//     });

//     it("shows the loading modal while this tournament's results are unavailable", () => {
//       setSelectorState({
//         resultsTmntId: "",
//         resultsLoadStatus: "loading",
//       });

//       render(<TmntResultsPage />);

//       expect(screen.getByRole("status")).toHaveTextContent("Loading...");
//       expect(mockedHeader).not.toHaveBeenCalled();
//       expect(screen.queryByRole("tab")).not.toBeInTheDocument();
//     });

//     it("shows the loading modal while prizes are unavailable", () => {
//       setSelectorState({
//         prizesTmntId: "",
//         prizesLoadStatus: "loading",
//       });

//       render(<TmntResultsPage />);

//       expect(screen.getByRole("status")).toHaveTextContent("Loading...");
//       expect(mockedHeader).not.toHaveBeenCalled();
//       expect(screen.queryByRole("tab")).not.toBeInTheDocument();
//       expect(mockedStandingsForm).not.toHaveBeenCalled();
//     });

//     it("shows cached data for this tournament even when request statuses are loading", () => {
//       setSelectorState({
//         resultsLoadStatus: "loading",
//         prizesLoadStatus: "loading",
//       });

//       render(<TmntResultsPage />);

//       expect(screen.queryByRole("status")).not.toBeInTheDocument();

//       expect(
//         screen.getByRole("tab", { name: "Scratch" }),
//       ).toBeInTheDocument();

//       expect(dispatch).not.toHaveBeenCalled();
//     });

//     it("replaces the loading display when results become available", () => {
//       setSelectorState({
//         resultsTmntId: "",
//         resultsLoadStatus: "loading",
//       });

//       const { rerender } = render(<TmntResultsPage />);

//       expect(screen.getByRole("status")).toBeInTheDocument();

//       setSelectorState({
//         resultsTmntId: tmntId,
//         resultsLoadStatus: "succeeded",
//       });

//       rerender(<TmntResultsPage />);

//       expect(screen.queryByRole("status")).not.toBeInTheDocument();

//       expect(
//         screen.getByRole("tab", { name: "Scratch" }),
//       ).toHaveAttribute("aria-selected", "true");
//     });
//   });

//   describe("successful render", () => {
//     it("passes tournament data to the header", () => {
//       render(<TmntResultsPage />);

//       expect(screen.getByTestId("tmnt-home-header")).toBeInTheDocument();

//       expect(mockedHeader.mock.calls[0][0]).toEqual({
//         tmntFullData: tournamentData,
//       });
//     });

//     it("creates one tab per division and sorts tabs by sort_order", () => {
//       setSelectorState({
//         tmntResults: [
//           ...selectorState.tmntResults,
//           { ...selectorState.tmntResults[1] },
//         ],
//       });

//       render(<TmntResultsPage />);

//       const tabs = screen.getAllByRole("tab");

//       expect(tabs).toHaveLength(2);
//       expect(tabs[0]).toHaveTextContent("Scratch");
//       expect(tabs[1]).toHaveTextContent("HDCP");
//     });

//     it("selects the first sorted division by default", () => {
//       render(<TmntResultsPage />);

//       expect(
//         screen.getByRole("tab", { name: "Scratch" }),
//       ).toHaveAttribute("aria-selected", "true");

//       expect(
//         screen.getByRole("tab", { name: "HDCP" }),
//       ).toHaveAttribute("aria-selected", "false");
//     });

//     it("passes tournament results, prizes, and division metadata to the form", () => {
//       render(<TmntResultsPage />);

//       const scratchDiv = tournamentData.divs.find(
//         (div) => div.id === divId1,
//       )!;

//       const formCall = mockedStandingsForm.mock.calls.find(
//         ([props]) => props.div.id === divId1,
//       );

//       expect(formCall).toBeDefined();

//       expect(formCall![0]).toEqual({
//         tmntId,
//         div: expect.objectContaining({
//           id: divId1,
//           tmnt_id: tmntId,
//           div_name: "Scratch",
//           sort_order: 1,
//           hdcp_per: scratchDiv.hdcp_per,
//           hdcp_from: scratchDiv.hdcp_from,
//           int_hdcp: scratchDiv.int_hdcp,
//           hdcp_for: scratchDiv.hdcp_for,
//         }),
//         tmntResults: selectorState.tmntResults,
//         divPfs: selectorState.divPfs,
//       });
//     });

//     it("uses division names and sort orders from results", () => {
//       setSelectorState({
//         tmntResults: [
//           {
//             ...selectorState.tmntResults[0],
//             div_name: "Handicap Results",
//             sort_order: 1,
//           },
//           {
//             ...selectorState.tmntResults[1],
//             div_name: "Scratch Results",
//             sort_order: 2,
//           },
//         ],
//       });

//       render(<TmntResultsPage />);

//       const tabs = screen.getAllByRole("tab");

//       expect(tabs[0]).toHaveTextContent("Handicap Results");
//       expect(tabs[1]).toHaveTextContent("Scratch Results");
//       expect(tabs[0]).toHaveAttribute("aria-selected", "true");
//     });

//     it("changes the active division when another tab is clicked", () => {
//       render(<TmntResultsPage />);

//       const hdcpTab = screen.getByRole("tab", { name: "HDCP" });

//       fireEvent.click(hdcpTab);

//       expect(hdcpTab).toHaveAttribute("aria-selected", "true");

//       expect(
//         screen.getByRole("tab", { name: "Scratch" }),
//       ).toHaveAttribute("aria-selected", "false");

//       const hdcpPanel = screen.getByRole("tabpanel", {
//         name: "HDCP",
//       });

//       expect(hdcpPanel).toHaveClass("active");

//       expect(
//         within(hdcpPanel).getByTestId(`standings-form-${divId2}`),
//       ).toBeInTheDocument();
//     });

//     it("does not create tabs when loaded results are empty", () => {
//       setSelectorState({ tmntResults: [] });

//       render(<TmntResultsPage />);

//       expect(screen.getByTestId("tmnt-home-header")).toBeInTheDocument();
//       expect(screen.queryByRole("tab")).not.toBeInTheDocument();
//       expect(mockedStandingsForm).not.toHaveBeenCalled();
//       expect(fetchOneTmntGameResults).not.toHaveBeenCalled();
//     });

//     it("ignores result divisions absent from the tournament definition", () => {
//       setSelectorState({
//         tmntResults: [
//           ...selectorState.tmntResults,
//           {
//             ...selectorState.tmntResults[0],
//             div_id: "div_0123cae28786485bb7a036935f0f6a0f",
//             div_name: "Unknown Division",
//           },
//         ],
//       });

//       render(<TmntResultsPage />);

//       expect(screen.getAllByRole("tab")).toHaveLength(2);

//       expect(
//         screen.queryByRole("tab", { name: "Unknown Division" }),
//       ).not.toBeInTheDocument();
//     });

//     it("does not create a tab for a tournament division with no results", () => {
//       setSelectorState({
//         tmntResults: [selectorState.tmntResults[1]],
//       });

//       render(<TmntResultsPage />);

//       expect(screen.getAllByRole("tab")).toHaveLength(1);

//       expect(
//         screen.getByRole("tab", { name: "Scratch" }),
//       ).toBeInTheDocument();

//       expect(
//         screen.queryByRole("tab", { name: "HDCP" }),
//       ).not.toBeInTheDocument();
//     });

//     it("renders loaded standings when the prize fund is empty", () => {
//       setSelectorState({ divPfs: [] });

//       render(<TmntResultsPage />);

//       expect(
//         screen.getByRole("tab", { name: "Scratch" }),
//       ).toBeInTheDocument();

//       const formCall = mockedStandingsForm.mock.calls.find(
//         ([props]) => props.div.id === divId1,
//       );

//       expect(formCall![0].divPfs).toEqual([]);
//       expect(fetchDivPfs).not.toHaveBeenCalled();
//     });
//   });

//   describe("tournament errors", () => {
//     it.each([
//       [
//         "missing required child division",
//         `Tournament with id: ${tmntId} is missing data.`,
//       ],
//       [
//         "Network error",
//         `An error occurred while loading the tournament with id: ${tmntId}.`,
//       ],
//       [
//         "",
//         `An error occurred while loading the tournament with id: ${tmntId}.`,
//       ],
//     ])(
//       "shows the tournament error for %j",
//       (error, message) => {
//         tournamentData.tmnt.id = "";

//         setHookResult({
//           hasData: false,
//           failed: true,
//           error,
//         });

//         render(<TmntResultsPage />);

//         expect(
//           screen.getByRole("heading", {
//             name: "Unable to load tournament",
//           }),
//         ).toBeInTheDocument();

//         expect(screen.getByText(message)).toBeInTheDocument();
//         expect(screen.queryByRole("status")).not.toBeInTheDocument();
//         expect(mockedHeader).not.toHaveBeenCalled();
//       },
//     );

//     it("calls the hook retry function when Retry is clicked", () => {
//       tournamentData.tmnt.id = "";

//       setHookResult({
//         hasData: false,
//         failed: true,
//         error: "Network error",
//       });

//       render(<TmntResultsPage />);

//       expect(retryTmnt).not.toHaveBeenCalled();

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//       expect(retryTmnt).toHaveBeenCalledTimes(1);
//       expect(dispatch).not.toHaveBeenCalled();
//     });
//   });

//   describe("results errors", () => {
//     it.each([
//       ["Unable to retrieve scores.", "Unable to retrieve scores."],
//       [
//         null,
//         `An error occurred while loading games for tournament with id: ${tmntId}.`,
//       ],
//       [
//         "",
//         `An error occurred while loading games for tournament with id: ${tmntId}.`,
//       ],
//     ])(
//       "shows the results error for %j",
//       (resultsError, message) => {
//         setSelectorState({
//           resultsTmntId: "",
//           resultsLoadStatus: "failed",
//           requestedResultsTmntId: tmntId,
//           resultsError,
//         });

//         render(<TmntResultsPage />);

//         expect(
//           screen.getByRole("heading", {
//             name: "Unable to load tournament",
//           }),
//         ).toBeInTheDocument();

//         expect(screen.getByText(message)).toBeInTheDocument();
//         expect(mockedHeader).not.toHaveBeenCalled();
//       },
//     );

//     it("dispatches a results request when Retry is clicked", () => {
//       setSelectorState({
//         resultsTmntId: "",
//         resultsLoadStatus: "failed",
//         requestedResultsTmntId: tmntId,
//       });

//       render(<TmntResultsPage />);

//       expect(fetchOneTmntGameResults).not.toHaveBeenCalled();

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//       expectResultsFetch();
//       expect(fetchDivPfs).not.toHaveBeenCalled();
//       expect(retryTmnt).not.toHaveBeenCalled();
//     });
//   });

//   describe("prize errors", () => {
//     it.each([
//       [
//         "Unable to retrieve division prizes.",
//         "Unable to retrieve division prizes.",
//       ],
//       [
//         null,
//         `An error occurred while loading prizes for tournament with id: ${tmntId}.`,
//       ],
//       [
//         "",
//         `An error occurred while loading prizes for tournament with id: ${tmntId}.`,
//       ],
//     ])(
//       "shows the prize error for %j",
//       (prizesError, message) => {
//         setSelectorState({
//           prizesTmntId: "",
//           prizesLoadStatus: "failed",
//           requestedPrizesTmntId: tmntId,
//           prizesError,
//         });

//         render(<TmntResultsPage />);

//         expect(
//           screen.getByRole("heading", {
//             name: "Unable to load tournament prizes",
//           }),
//         ).toBeInTheDocument();

//         expect(screen.getByText(message)).toBeInTheDocument();
//         expect(mockedHeader).not.toHaveBeenCalled();
//       },
//     );

//     it("dispatches a prize request when Retry is clicked", () => {
//       setSelectorState({
//         prizesTmntId: "",
//         prizesLoadStatus: "failed",
//         requestedPrizesTmntId: tmntId,
//       });

//       render(<TmntResultsPage />);

//       expect(fetchDivPfs).not.toHaveBeenCalled();

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//       expectPrizesFetch();
//       expect(fetchOneTmntGameResults).not.toHaveBeenCalled();
//       expect(retryTmnt).not.toHaveBeenCalled();
//     });

//     it("shows cached standings when results and prizes remain available despite failed statuses", () => {
//       setSelectorState({
//         resultsLoadStatus: "failed",
//         prizesLoadStatus: "failed",
//       });

//       render(<TmntResultsPage />);

//       expect(
//         screen.getByRole("tab", { name: "Scratch" }),
//       ).toBeInTheDocument();

//       expect(screen.queryByRole("heading")).not.toBeInTheDocument();
//       expect(dispatch).not.toHaveBeenCalled();
//     });
//   });
// });
