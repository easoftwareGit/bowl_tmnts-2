import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditScoresPage from "@/app/dataEntry/scores/[squadId]/page";

// ----- Mocks -----
jest.mock("next/navigation", () => ({
  __esModule: true,
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/gamesForSquad/gamesForSquadSlice", () => ({
  __esModule: true,
  fetchGamesForSquad: jest.fn(),
  getGamesForSquadLoadStatus: jest.fn(),
}));

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  getTmntFullDataLoadStatus: jest.fn(),
}));

jest.mock("@/app/dataEntry/scoresForm/scoreRows", () => ({
  __esModule: true,
  populateScoreRows: jest.fn(),
}));

jest.mock("@/hooks/useUnsavedChangesGuard", () => ({
  __esModule: true,
  useUnsavedChangesGuard: jest.fn(),
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

jest.mock("@/app/dataEntry/scoresForm/scoresForm", () => ({
  __esModule: true,
  default: ({
    rows,
    setRows,
    enableEditing,
    dataWasChanged,
    onDataChanged,
    onDataReset,
    onNavigateAfterSave,
    onSaveComplete,
  }: any) => (
    <div data-testid="ScoresEntryFormMock">
      <div data-testid="rowsLen">{rows?.length ?? -1}</div>
      <div data-testid="enableEditing">{String(enableEditing)}</div>
      <div data-testid="dataWasChanged">{String(dataWasChanged)}</div>

      <button
        type="button"
        data-testid="dataChangedButton"
        onClick={onDataChanged}
      >
        Data Changed
      </button>

      <button
        type="button"
        data-testid="dataResetButton"
        onClick={onDataReset}
      >
        Data Reset
      </button>

      <button
        type="button"
        data-testid="navigateAfterSaveButton"
        onClick={onNavigateAfterSave}
      >
        Navigate After Save
      </button>

      <button
        type="button"
        data-testid="saveCompleteButton"
        onClick={() =>
          onSaveComplete([
            { id: "saved_1", game_1: 200 },
            { id: "saved_2", game_1: 210 },
          ])
        }
      >
        Save Complete
      </button>

      <button
        type="button"
        data-testid="setRowsButton"
        onClick={() => setRows([{ id: "manual_row" }])}
      >
        Set Rows
      </button>
    </div>
  ),
}));

// Imports after mocks
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGamesForSquad,
  getGamesForSquadLoadStatus,
} from "@/redux/features/gamesForSquad/gamesForSquadSlice";
import { getTmntFullDataLoadStatus } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { populateScoreRows } from "@/app/dataEntry/scoresForm/scoreRows";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

const useParamsMock = useParams as jest.Mock;
const useRouterMock = useRouter as jest.Mock;
const useDispatchMock = useDispatch as unknown as jest.Mock;
const useSelectorMock = useSelector as unknown as jest.Mock;

const fetchGamesForSquadMock = fetchGamesForSquad as unknown as jest.Mock;
const getGamesForSquadLoadStatusMock =
  getGamesForSquadLoadStatus as unknown as jest.Mock;
const getTmntFullDataLoadStatusMock =
  getTmntFullDataLoadStatus as unknown as jest.Mock;
const populateScoreRowsMock = populateScoreRows as unknown as jest.Mock;
const useUnsavedChangesGuardMock =
  useUnsavedChangesGuard as unknown as jest.Mock;

describe("EditScoresPage", () => {
  const dispatchMock = jest.fn();
  const pushMock = jest.fn();

  const tmntFullData = {
    tmnt: { id: "tmt_1" },
    squads: [{ id: "sqd_1" }],
  };

  const games = [
    { id: "gam_1", player_id: "ply_1", game_num: 1, score: 200 },
  ];

  const setupSelectors = ({
    tmntStatus,
    gamesStatus,
    stateTmntFullData = tmntFullData,
    stateGames = games,
  }: {
    tmntStatus: string;
    gamesStatus: string;
    stateTmntFullData?: any;
    stateGames?: any[];
  }) => {
    getTmntFullDataLoadStatusMock.mockImplementation(() => tmntStatus);
    getGamesForSquadLoadStatusMock.mockImplementation(() => gamesStatus);

    useSelectorMock.mockImplementation((selector: any) =>
      selector({
        tmntFullData: {
          tmntFullData: stateTmntFullData,
        },
        gamesForSquad: {
          games: stateGames,
        },
      }),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useDispatchMock.mockReturnValue(dispatchMock);
    useParamsMock.mockReturnValue({ squadId: "sqd_1" });
    useRouterMock.mockReturnValue({ push: pushMock });

    fetchGamesForSquadMock.mockImplementation((squadId: string) => ({
      type: "gamesForSquad/fetchGamesForSquad",
      payload: squadId,
    }));

    populateScoreRowsMock.mockReturnValue([
      { id: "row_1", game_1: 200 },
      { id: "row_2", game_1: 210 },
    ]);

    useUnsavedChangesGuardMock.mockImplementation(() => undefined);
  });

  it("dispatches fetchGamesForSquad with squadId on mount", () => {
    setupSelectors({
      tmntStatus: "loading",
      gamesStatus: "loading",
    });

    render(<EditScoresPage />);

    expect(fetchGamesForSquadMock).toHaveBeenCalledTimes(1);
    expect(fetchGamesForSquadMock).toHaveBeenCalledWith("sqd_1");

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "gamesForSquad/fetchGamesForSquad",
      payload: "sqd_1",
    });
  });

  it("does not dispatch fetchGamesForSquad when squadId is missing", () => {
    useParamsMock.mockReturnValue({ squadId: undefined });

    setupSelectors({
      tmntStatus: "loading",
      gamesStatus: "loading",
    });

    render(<EditScoresPage />);

    expect(fetchGamesForSquadMock).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("shows WaitModal while loading and does not render ScoresEntryForm", () => {
    setupSelectors({
      tmntStatus: "loading",
      gamesStatus: "loading",
    });

    render(<EditScoresPage />);

    expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
      "data-show",
      "true",
    );
    expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
      "data-message",
      "Loading Scores...",
    );

    expect(screen.queryByText("Scores")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ScoresEntryFormMock")).not.toBeInTheDocument();
  });

  it("renders ScoresEntryForm after tournament data and games are loaded", async () => {
    setupSelectors({
      tmntStatus: "succeeded",
      gamesStatus: "succeeded",
    });

    render(<EditScoresPage />);

    expect(screen.getByRole("heading", { name: "Scores" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("ScoresEntryFormMock")).toBeInTheDocument();
    });

    expect(populateScoreRowsMock).toHaveBeenCalledTimes(1);
    expect(populateScoreRowsMock).toHaveBeenCalledWith(tmntFullData, games);

    expect(screen.getByTestId("rowsLen")).toHaveTextContent("2");
    expect(screen.getByTestId("enableEditing")).toHaveTextContent("true");
  });

  it("calls useUnsavedChangesGuard with false initially", async () => {
    setupSelectors({
      tmntStatus: "succeeded",
      gamesStatus: "succeeded",
    });

    render(<EditScoresPage />);

    await screen.findByTestId("ScoresEntryFormMock");

    await waitFor(() => {
      expect(useUnsavedChangesGuardMock).toHaveBeenLastCalledWith(false);
    });
  });

  it("updates useUnsavedChangesGuard to true when data changes", async () => {
    setupSelectors({
      tmntStatus: "succeeded",
      gamesStatus: "succeeded",
    });

    render(<EditScoresPage />);

    await screen.findByTestId("ScoresEntryFormMock");

    fireEvent.click(screen.getByTestId("dataChangedButton"));

    await waitFor(() => {
      expect(screen.getByTestId("dataWasChanged")).toHaveTextContent("true");
    });

    await waitFor(() => {
      expect(useUnsavedChangesGuardMock).toHaveBeenLastCalledWith(true);
    });
  });

  it("updates useUnsavedChangesGuard back to false when data is reset", async () => {
    setupSelectors({
      tmntStatus: "succeeded",
      gamesStatus: "succeeded",
    });

    render(<EditScoresPage />);

    await screen.findByTestId("ScoresEntryFormMock");

    fireEvent.click(screen.getByTestId("dataChangedButton"));

    await waitFor(() => {
      expect(useUnsavedChangesGuardMock).toHaveBeenLastCalledWith(true);
    });

    fireEvent.click(screen.getByTestId("dataResetButton"));

    await waitFor(() => {
      expect(screen.getByTestId("dataWasChanged")).toHaveTextContent("false");
    });

    await waitFor(() => {
      expect(useUnsavedChangesGuardMock).toHaveBeenLastCalledWith(false);
    });
  });

  it("does not warn for unsaved changes after navigating after save", async () => {
    setupSelectors({
      tmntStatus: "succeeded",
      gamesStatus: "succeeded",
    });

    render(<EditScoresPage />);

    await screen.findByTestId("ScoresEntryFormMock");

    fireEvent.click(screen.getByTestId("dataChangedButton"));

    await waitFor(() => {
      expect(useUnsavedChangesGuardMock).toHaveBeenLastCalledWith(true);
    });

    fireEvent.click(screen.getByTestId("navigateAfterSaveButton"));

    await waitFor(() => {
      expect(useUnsavedChangesGuardMock).toHaveBeenLastCalledWith(false);
    });
  });

  it("onSaveComplete updates rows and clears dataWasChanged", async () => {
    setupSelectors({
      tmntStatus: "succeeded",
      gamesStatus: "succeeded",
    });

    render(<EditScoresPage />);

    await screen.findByTestId("ScoresEntryFormMock");

    fireEvent.click(screen.getByTestId("dataChangedButton"));

    await waitFor(() => {
      expect(screen.getByTestId("dataWasChanged")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByTestId("saveCompleteButton"));

    await waitFor(() => {
      expect(screen.getByTestId("rowsLen")).toHaveTextContent("2");
    });

    await waitFor(() => {
      expect(screen.getByTestId("dataWasChanged")).toHaveTextContent("false");
    });

    await waitFor(() => {
      expect(useUnsavedChangesGuardMock).toHaveBeenLastCalledWith(false);
    });
  });

  it("navigates back to run tournament page after save when no data changes remain", async () => {
    setupSelectors({
      tmntStatus: "succeeded",
      gamesStatus: "succeeded",
    });

    render(<EditScoresPage />);

    await screen.findByTestId("ScoresEntryFormMock");

    fireEvent.click(screen.getByTestId("navigateAfterSaveButton"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dataEntry/runTmnt/tmt_1");
    });
  });

  it("does not navigate after save if tournament id is missing", async () => {
    setupSelectors({
      tmntStatus: "succeeded",
      gamesStatus: "succeeded",
      stateTmntFullData: {
        tmnt: { id: undefined },
      },
    });

    render(<EditScoresPage />);

    await screen.findByTestId("ScoresEntryFormMock");

    fireEvent.click(screen.getByTestId("navigateAfterSaveButton"));

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});