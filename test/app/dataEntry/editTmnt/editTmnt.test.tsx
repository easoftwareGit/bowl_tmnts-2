import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditTmntPage from "@/app/dataEntry/editTmnt/[tmntId]/page";
import { tmntActions } from "@/lib/types/types";

// ----- Mocks -----
jest.mock("next/navigation", () => ({
  __esModule: true,
  useParams: jest.fn(),
}));

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  fetchTmntFullData: jest.fn(),
  getTmntFullDataLoadStatus: jest.fn(),
  getTmntFullDataError: jest.fn(),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) => (
    <div
      data-testid="WaitModalMock"
      data-show={String(show)}
      data-message={message}
    >
      WaitModal
    </div>
  ),
}));

jest.mock("@/app/dataEntry/tmntForm/tmntForm", () => ({
  __esModule: true,
  default: ({ tmntProps }: any) => (
    <div data-testid="TmntDataFormMock">{JSON.stringify(tmntProps)}</div>
  ),
}));

jest.mock("@/app/dataEntry/tmntForm/tmntTools", () => ({
  __esModule: true,
  getBlankTmntFullData: jest.fn(),
  tmntHasEntries: jest.fn(),
}));

// Imports for typed access to mocks AFTER mocks, so imports use the mocks
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTmntFullData,
  getTmntFullDataLoadStatus,
  getTmntFullDataError,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import {
  getBlankTmntFullData,
  tmntHasEntries,
} from "@/app/dataEntry/tmntForm/tmntTools";

// Typed mock handles 
const useDispatchMock =
  useDispatch as unknown as jest.MockedFunction<typeof useDispatch>;
const useSelectorMock =
  useSelector as unknown as jest.MockedFunction<typeof useSelector>;
const useParamsMock =
  useParams as unknown as jest.MockedFunction<typeof useParams>;

const fetchTmntFullDataMock =
  fetchTmntFullData as unknown as jest.MockedFunction<typeof fetchTmntFullData>;
const getTmntFullDataLoadStatusMock =
  getTmntFullDataLoadStatus as unknown as jest.MockedFunction<
    typeof getTmntFullDataLoadStatus
  >;
const getTmntFullDataErrorMock =
  getTmntFullDataError as unknown as jest.MockedFunction<
    typeof getTmntFullDataError
  >;

const getBlankTmntFullDataMock =
  getBlankTmntFullData as unknown as jest.MockedFunction<
    typeof getBlankTmntFullData
  >;
const tmntHasEntriesMock =
  tmntHasEntries as unknown as jest.MockedFunction<typeof tmntHasEntries>;

type MockState = {
  tmntFullData: {
    tmntFullData: any;
  };
};

describe("EditTmntPage (src/app/dataEntry/editTmnt/[tmntId]/page.tsx)", () => {
  const dispatchMock = jest.fn();

  const makeState = (tmntFullData: any): MockState => ({
    tmntFullData: {
      tmntFullData,
    },
  });

  const setupSelectors = ({
    status,
    error,
    stateTmntFullData,
  }: {
    status: string;
    error: string | undefined; // selector expects undefined, not null
    stateTmntFullData: any;
  }) => {
    // selectors from slice: component calls useSelector(getTmntFullDataLoadStatus) etc
    getTmntFullDataLoadStatusMock.mockImplementation(() => status as any);
    getTmntFullDataErrorMock.mockImplementation(() => error);

    // react-redux useSelector: call selector with fake state
    useSelectorMock.mockImplementation((selector: any) => {
      const fakeState = makeState(stateTmntFullData);
      return selector(fakeState);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useDispatchMock.mockReturnValue(dispatchMock);

    // default: tmntId exists
    useParamsMock.mockReturnValue({ tmntId: "tmt_abc123" } as any);

    // thunk returns an action object (good enough for dispatch assertions)
    fetchTmntFullDataMock.mockImplementation((id: string) => ({
      type: "tmntFullData/fetchTmntFullData",
      payload: id,
    }) as any);

    getBlankTmntFullDataMock.mockReturnValue({
      tmnt: { id: "tmt_blank" },
    } as any);

    tmntHasEntriesMock.mockReturnValue(false);
  });

  it("dispatches fetchTmntFullData(tmntId) on mount (when tmntId exists)", () => {
    setupSelectors({
      status: "loading",
      error: undefined,
      stateTmntFullData: { tmnt: { id: "tmt_from_state" } },
    });

    render(<EditTmntPage />);

    expect(fetchTmntFullData).toHaveBeenCalledTimes(1);
    expect(fetchTmntFullData).toHaveBeenCalledWith("tmt_abc123");
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "tmntFullData/fetchTmntFullData",
      payload: "tmt_abc123",
    });
  });

  it("does not dispatch if tmntId is missing", () => {
    useParamsMock.mockReturnValue({ tmntId: undefined } as any);

    setupSelectors({
      status: "loading",
      error: undefined,
      stateTmntFullData: { tmnt: { id: "tmt_from_state" } },
    });

    render(<EditTmntPage />);

    expect(fetchTmntFullData).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("when loading, shows WaitModal with show=true and does not render the form", () => {
    setupSelectors({
      status: "loading",
      error: undefined,
      stateTmntFullData: { tmnt: { id: "tmt_from_state" } },
    });

    render(<EditTmntPage />);

    const wait = screen.getByTestId("WaitModalMock");
    expect(wait).toHaveAttribute("data-show", "true");
    expect(wait).toHaveAttribute("data-message", "Loading...");

    expect(screen.queryByText(/edit tournament/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("TmntDataFormMock")).not.toBeInTheDocument();
  });

  it("when not loading and not succeeded and has tmntError, shows the error text", () => {
    setupSelectors({
      status: "failed",
      error: "Boom",
      stateTmntFullData: { tmnt: { id: "tmt_from_state" } },
    });

    render(<EditTmntPage />);

    // WaitModal should be show=false in this scenario
    expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
      "data-show",
      "false"
    );

    expect(screen.getByText(/error:/i)).toHaveTextContent(
      "Error: Boom tmntLoadStatus: failed"
    );
    expect(screen.queryByTestId("TmntDataFormMock")).not.toBeInTheDocument();
  });

  it("when succeeded, renders the page header and the TmntDataForm", () => {
    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: { tmnt: { id: "tmt_real" } },
    });

    render(<EditTmntPage />);

    expect(screen.getByTestId("WaitModalMock")).toHaveAttribute("data-show", "false");
    expect(
      screen.getByRole("heading", { name: /edit tournament/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("TmntDataFormMock")).toBeInTheDocument();
  });

  it("when succeeded and tmntHasEntries=false, passes tmntAction=Edit to TmntDataForm", () => {
    tmntHasEntriesMock.mockReturnValue(false);

    const stateData = { tmnt: { id: "tmt_real" } };

    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: stateData,
    });

    render(<EditTmntPage />);

    const form = screen.getByTestId("TmntDataFormMock");
    const props = JSON.parse(form.textContent ?? "{}");

    expect(props).toEqual({
      tmntFullData: stateData,
      tmntAction: tmntActions.Edit,
    });
  });

  it("when succeeded and tmntHasEntries=true, passes tmntAction=Disable to TmntDataForm", () => {
    tmntHasEntriesMock.mockReturnValue(true);

    const stateData = { tmnt: { id: "tmt_real" } };

    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: stateData,
    });

    render(<EditTmntPage />);

    const form = screen.getByTestId("TmntDataFormMock");
    const props = JSON.parse(form.textContent ?? "{}");

    expect(props).toEqual({
      tmntFullData: stateData,
      tmntAction: tmntActions.Disable,
    });
  });

  it("when not succeeded, it uses getBlankTmntFullData (memo fallback), but does not render the form", () => {
    setupSelectors({
      status: "idle",
      error: undefined,
      stateTmntFullData: { tmnt: { id: "tmt_from_state" } },
    });

    render(<EditTmntPage />);

    // memo fallback executed (even though not rendered), so this should be called
    expect(getBlankTmntFullData).toHaveBeenCalledTimes(1);

    // but form only renders on succeeded
    expect(screen.queryByTestId("TmntDataFormMock")).not.toBeInTheDocument();
  });
});
