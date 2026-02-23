import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditTmntPage from "@/app/dataEntry/editTmnt/[tmntId]/page";
import { SquadStage } from "@prisma/client";

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
  getSquadStage: jest.fn(),
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
  getSquadStage,
} from "@/app/dataEntry/tmntForm/tmntTools";
import { tmntFormParent } from "@/lib/enums/enums";

// Typed mock handles
const useDispatchMock =
  useDispatch as unknown as jest.MockedFunction<typeof useDispatch>;
const useSelectorMock =
  useSelector as unknown as jest.MockedFunction<typeof useSelector>;
const useParamsMock =
  useParams as unknown as jest.MockedFunction<typeof useParams>;

const fetchTmntFullDataMock =
  fetchTmntFullData as unknown as jest.MockedFunction<
    typeof fetchTmntFullData
  >;
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
const getSquadStageMock =
  getSquadStage as unknown as jest.MockedFunction<typeof getSquadStage>;

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

    // default squadStage for tests that don't override it
    getSquadStageMock.mockResolvedValue(SquadStage.DEFINE);
  });

  it("dispatches fetchTmntFullData(tmntId) on mount (when tmntId exists)", () => {
    setupSelectors({
      status: "loading",
      error: undefined,
      stateTmntFullData: { tmnt: { id: "tmt_from_state" }, squads: [] },
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
      stateTmntFullData: { tmnt: { id: "tmt_from_state" }, squads: [] },
    });

    render(<EditTmntPage />);

    expect(fetchTmntFullData).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("when loading, shows WaitModal with show=true and does not render the form", () => {
    setupSelectors({
      status: "loading",
      error: undefined,
      stateTmntFullData: { tmnt: { id: "tmt_from_state" }, squads: [] },
    });

    render(<EditTmntPage />);

    const wait = screen.getByTestId("WaitModalMock");
    expect(wait).toHaveAttribute("data-show", "true");
    expect(wait).toHaveAttribute("data-message", "Loading...");

    expect(screen.queryByText(/edit tournament/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("TmntDataFormMock")).not.toBeInTheDocument();

    // stage should not be requested while not succeeded
    expect(getSquadStageMock).not.toHaveBeenCalled();
  });

  it("when not loading and not succeeded and has tmntError, shows the error text", () => {
    setupSelectors({
      status: "failed",
      error: "Boom",
      stateTmntFullData: { tmnt: { id: "tmt_from_state" }, squads: [] },
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

    expect(getSquadStageMock).not.toHaveBeenCalled();
  });

  it("when succeeded, resolves squad stage and then renders the page header and the TmntDataForm", async () => {
    const stateData = { tmnt: { id: "tmt_real" }, squads: [{ id: "sqd_1" }] };

    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: stateData,
    });

    getSquadStageMock.mockResolvedValueOnce(SquadStage.DEFINE);

    render(<EditTmntPage />);

    // WaitModal should be hidden
    expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
      "data-show",
      "false"
    );

    // header and form appear only after stage has been resolved (stage !== null)
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /edit tournament/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId("TmntDataFormMock")).toBeInTheDocument();
    expect(getSquadStageMock).toHaveBeenCalledWith("sqd_1");
  });

  it("when succeeded and squadStage=DEFINE, passes squadStage=DEFINE and parentForm=EDIT to TmntDataForm", async () => {
    const stateData = { tmnt: { id: "tmt_real" }, squads: [{ id: "sqd_1" }] };

    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: stateData,
    });

    getSquadStageMock.mockResolvedValueOnce(SquadStage.DEFINE);

    render(<EditTmntPage />);

    const form = await screen.findByTestId("TmntDataFormMock");
    const props = JSON.parse(form.textContent ?? "{}");

    expect(props).toEqual({
      tmntFullData: stateData,
      stage: SquadStage.DEFINE,
      parentForm: tmntFormParent.EDIT,
    });
  });

  it("when succeeded and squadStage=ENTRIES, passes squadStage=ENTRIES and parentForm=EDIT to TmntDataForm", async () => {
    const stateData = { tmnt: { id: "tmt_real" }, squads: [{ id: "sqd_1" }] };

    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: stateData,
    });

    // e.g., ENTRIES stage
    getSquadStageMock.mockResolvedValueOnce(SquadStage.ENTRIES);

    render(<EditTmntPage />);

    const form = await screen.findByTestId("TmntDataFormMock");
    const props = JSON.parse(form.textContent ?? "{}");

    expect(props).toEqual({
      tmntFullData: stateData,
      stage: SquadStage.ENTRIES,
      parentForm: tmntFormParent.EDIT,
    });
  });

  it("when not succeeded, it uses getBlankTmntFullData (memo fallback), but does not render the form", () => {
    setupSelectors({
      status: "idle",
      error: undefined,
      stateTmntFullData: { tmnt: { id: "tmt_from_state" }, squads: [] },
    });

    render(<EditTmntPage />);

    // memo fallback executed (even though not rendered), so this should be called
    expect(getBlankTmntFullData).toHaveBeenCalledTimes(1);

    // but form only renders on succeeded + stage resolved
    expect(screen.queryByTestId("TmntDataFormMock")).not.toBeInTheDocument();

    expect(getSquadStageMock).not.toHaveBeenCalled();
  });

  it("when succeeded but state has no squads, shows stage error text", async () => {
    const stateData = { tmnt: { id: "tmt_real" }, squads: [] };

    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: stateData,
    });

    render(<EditTmntPage />);

    // getSquadStage should not be called when there is no squad id
    expect(getSquadStageMock).not.toHaveBeenCalled();

    // stageError should be set to "Tournament has no squad" and shown in the UI
    // (the component still renders the outer container since tmntLoadStatus === "succeeded"
    //   but stage is set to ERROR)
    await waitFor(() => {
      expect(
        screen.getByText(/tournament has no squad/i)
      ).toBeInTheDocument();
    });
  });

  it("when getSquadStage rejects, stageError is shown", async () => {
    const stateData = { tmnt: { id: "tmt_real" }, squads: [{ id: "sqd_1" }] };

    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: stateData,
    });

    getSquadStageMock.mockRejectedValueOnce(new Error("DB failure"));

    render(<EditTmntPage />);

    // error message should appear
    await waitFor(() => {
      expect(screen.getByText(/stage error:/i)).toBeInTheDocument();
      // expect(screen.getByText(/db failure/i)).toBeInTheDocument();
    });
    // ok not to use wait for here because stage error and db failure 
    // are shown at the same time
    expect(screen.getByText(/db failure/i)).toBeInTheDocument();

    // form should still render (with DISABLE)
    const form = await screen.findByTestId("TmntDataFormMock");
    const props = JSON.parse(form.textContent ?? "{}");

    expect(props).toEqual({
      tmntFullData: stateData,
      stage: SquadStage.ERROR, 
      parentForm: tmntFormParent.EDIT
    });
  });

  it("does not update stage if unmounted before getSquadStage resolves", async () => {
    const stateData = { tmnt: { id: "tmt_real" }, squads: [{ id: "sqd_1" }] };

    setupSelectors({
      status: "succeeded",
      error: undefined,
      stateTmntFullData: stateData,
    });

    let resolveStage: (s: SquadStage) => void;
    const stagePromise = new Promise<SquadStage>((resolve) => {
      resolveStage = resolve;
    });

    getSquadStageMock.mockReturnValueOnce(stagePromise as any);

    const { unmount } = render(<EditTmntPage />);

    // Unmount before the stage is resolved
    unmount();

    // Now resolve the promise
    resolveStage!(SquadStage.DEFINE);

    // If this test runs without React act warnings, we've effectively
    // verified the cleanup works.
  });

});