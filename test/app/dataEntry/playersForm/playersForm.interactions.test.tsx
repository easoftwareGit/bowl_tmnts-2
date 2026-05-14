import React, { act } from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import * as reactRedux from "react-redux";
import tmntFullDataReducer from "@/redux/features/tmntFullData/tmntFullDataSlice";
import bowlsReducer from "@/redux/features/bowls/bowlsSlice";
import {
  mockBowl,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { ioStatusType } from "@/redux/statusTypes";
import type { bowlType, tmntFullType } from "@/lib/types/types";
import { ioDataError } from "@/lib/enums/enums";
import PlayersEntryForm from "@/app/dataEntry/playersForm/playersForm";
import {
  playerEntryRow,
  populateRows,
} from "@/app/dataEntry/playersForm/populateRows";
import { SquadStage } from "@prisma/client";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: mockPush,
    prefetch: jest.fn(),
  }),
}));

jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  delConfTitle: "Confirm Delete",
  cancelConfTitle: "Cancel All",
  default: ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    show ? (
      <div data-testid="ModalConfirmMock" role="dialog" aria-label="confirm">
        <div data-testid="confirm-title">{title}</div>
        <div data-testid="confirm-message">{message}</div>
        <button type="button" onClick={onConfirm}>
          Yes
        </button>
        <button type="button" onClick={onCancel}>
          No
        </button>
      </div>
    ) : (
      <div data-testid="ModalConfirmMock" data-show="false" />
    ),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? (
      <div data-testid="WaitModalMock" role="dialog" aria-label="wait-modal">
        {message}
      </div>
    ) : (
      <div data-testid="WaitModalMock" data-show="false" />
    ),
}));

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: ({
    show,
    title,
    message,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onCancel: () => void;
  }) =>
    show ? (
      <div data-testid="ModalErrorMsgMock" role="dialog" aria-label="error-modal">
        <div data-testid="error-title">{title}</div>
        <div data-testid="error-message">{message}</div>

        <button type="button" onClick={onCancel}>
          Close
        </button>
      </div>
    ) : (
      <div data-testid="ModalErrorMsgMock" data-show="false" />
    ),
}));

jest.mock("@/lib/uuid", () => ({
  __esModule: true,
  btDbUuid: () => "ply_new_123",
}));

const mockExtractDataFromRows = jest.fn();
const mockExtractFullBrktsData = jest.fn();

jest.mock("@/app/dataEntry/playersForm/extractData", () => ({
  __esModule: true,
  extractDataFromRows: (...args: unknown[]) => mockExtractDataFromRows(...args),
  extractFullBrktsData: (...args: unknown[]) =>
    mockExtractFullBrktsData(...args),
}));

let bracketListShouldRandomizeOk = true;
let nextOneByeCount = 0;

jest.mock("@/components/brackets/bracketListClass", () => ({
  __esModule: true,
  BracketList: class BracketListMock {
    static noError = 0;

    id: string;
    errorCode = 0;
    errorMessage = "";
    oneByeCount = 0;
    byePlayer: { id: string };

    constructor(id: string, _ppm?: number, _games?: number, byePlayer?: { id: string }) {
      this.id = id;
      this.byePlayer = byePlayer ?? { id: "bye_mock" };
    }

    calcTotalBrkts() {
      this.oneByeCount = nextOneByeCount;
    }

    canRandomize() {
      if (!bracketListShouldRandomizeOk) {
        this.errorCode = 123;
        this.errorMessage = "Mock bracket randomize error";
        return false;
      }
      return true;
    }

    randomize() {
      if (!bracketListShouldRandomizeOk) {
        this.errorCode = 123;
        this.errorMessage = "Mock bracket randomize error";
      }
    }
  },
}));

const mockValidateFinalizeRows = jest.fn();

jest.mock("@/app/dataEntry/playersForm/finalizeValidation", () => ({
  __esModule: true,
  validateFinalizeRows: (...args: unknown[]) =>
    mockValidateFinalizeRows(...args),
}));

let mockSaveStatus: ioStatusType = "idle";
const mockSaveTmntEntriesData = jest.fn();
let unwrapImpl: () => Promise<unknown> = () => Promise.resolve();

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => {
  const actual = jest.requireActual(
    "@/redux/features/tmntFullData/tmntFullDataSlice",
  );

  return {
    __esModule: true,
    ...actual,
    getTmntDataSaveStatus: () => mockSaveStatus,
    saveTmntEntriesData: (...args: unknown[]) => {
      mockSaveTmntEntriesData(...args);
      return { type: "SAVE_ENTRIES" };
    },
  };
});

jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return {
    __esModule: true,
    ...actual,
    useDispatch: jest.fn(),
  };
});

type GridMock = {
  element: HTMLDivElement;
  dataSource: playerEntryRow[];
  isEdit: boolean;

  getColumns: jest.Mock;
  getCurrentViewRecords: jest.Mock;
  getSelectedRecords: jest.Mock;
  getColumnByIndex: jest.Mock;

  enableToolbarItems: jest.Mock;

  selectRow: jest.Mock;
  selectCell: jest.Mock;
  startEdit: jest.Mock;

  refresh: jest.Mock;
  endEdit: jest.Mock;

  toolbarModule: {
    enableItems: jest.Mock;
  };

  aggregateModule: {
    refresh: jest.Mock;
  };
};

let lastGridProps: Record<string, any> | null = null;
let gridMock: GridMock;

const makeGridMock = (dataSource: playerEntryRow[]): GridMock => {
  const element = document.createElement("div");
  element.id = "playersGrid";

  const commitButton = document.createElement("button");
  commitButton.id = "playersGrid_commit_row";

  const saveButton = document.createElement("button");
  saveButton.id = "playersGrid_save";

  const validateButton = document.createElement("button");
  validateButton.id = "playersGrid_validate";
  
  const cancelAllButton = document.createElement("button");
  cancelAllButton.id = "playersGrid_cancel_all";

  element.appendChild(commitButton);
  element.appendChild(saveButton);
  element.appendChild(validateButton);
  element.appendChild(cancelAllButton);

  return {
    element,
    dataSource,
    isEdit: false,

    getColumns: jest.fn(() => []),
    getCurrentViewRecords: jest.fn(() => dataSource),
    getSelectedRecords: jest.fn(() => []),
    getColumnByIndex: jest.fn(() => ({ field: "first_name" })),

    enableToolbarItems: jest.fn(),

    selectRow: jest.fn(),
    selectCell: jest.fn(),
    startEdit: jest.fn(),

    refresh: jest.fn(),
    endEdit: jest.fn(),

    toolbarModule: {
      enableItems: jest.fn(),
    },

    aggregateModule: {
      refresh: jest.fn(),
    },
  };
};

jest.mock("@syncfusion/ej2-react-grids", () => ({
  __esModule: true,

  GridComponent: React.forwardRef<GridMock, Record<string, any>>(
    function GridComponentMock(props, ref) {
      lastGridProps = props;
      gridMock = makeGridMock(props.dataSource ?? []);

      React.useImperativeHandle(ref, () => gridMock);

      return <div data-testid="GridComponentMock">{props.children}</div>;
    },
  ),

  ColumnsDirective: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ColumnDirective: () => <div data-testid="ColumnDirectiveMock" />,
  AggregatesDirective: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AggregateDirective: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AggregateColumnsDirective: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AggregateColumnDirective: () => (
    <div data-testid="AggregateColumnDirectiveMock" />
  ),
  Inject: () => <div data-testid="InjectMock" />,

  Aggregate: jest.fn(),
  Edit: jest.fn(),
  Resize: jest.fn(),
  Sort: jest.fn(),
  Toolbar: jest.fn(),
}));

const makeStore = (bowls: bowlType[] = []) =>
  configureStore({
    reducer: {
      tmntFullData: tmntFullDataReducer,
      bowls: bowlsReducer,
    },
    preloadedState: {
      bowls: {
        bowls,
        loadStatus: "idle" as ioStatusType,
        saveStatus: "idle" as ioStatusType,
        error: "",
      },
      tmntFullData: {
        tmntFullData: mockTmntFullData,
        loadStatus: "idle" as ioStatusType,
        saveStatus: "idle" as ioStatusType,
        error: "",
        ioError: ioDataError.NONE,
      },
    },
  });

const renderForm = (opts?: { rows?: playerEntryRow[]; bowls?: bowlType[] }) => {
  const store = makeStore(opts?.bowls ?? [mockBowl]);

  let rowsState = opts?.rows ?? populateRows(mockTmntFullData);

  const setRows = jest.fn((updater: React.SetStateAction<playerEntryRow[]>) => {
    rowsState = typeof updater === "function" ? updater(rowsState) : updater;
    return rowsState;
  });

  render(
    <Provider store={store}>
      <PlayersEntryForm rows={rowsState} setRows={setRows} />
    </Provider>,
  );

  return {
    store,
    setRows,
    getRowsState: () => rowsState,
  };
};

const seedHappyPathExtracts = () => {
  mockExtractDataFromRows.mockReturnValue({
    players: [...mockTmntFullData.players],
    divEntries: [...mockTmntFullData.divEntries],
    elimEntries: [...mockTmntFullData.elimEntries],
    brktEntries: [...mockTmntFullData.brktEntries],
    potEntries: [...mockTmntFullData.potEntries],
  });

  mockExtractFullBrktsData.mockReturnValue({
    oneBrkts: [...mockTmntFullData.oneBrkts],
    brktSeeds: [...mockTmntFullData.brktSeeds],
  });
};

const callActionBegin = (args: Record<string, any>) => {
  if (!lastGridProps?.actionBegin) {
    throw new Error("actionBegin was not captured");
  }

  act(() => {
    lastGridProps?.actionBegin(args);
  });
};

const callActionComplete = async (args: Record<string, any>) => {
  if (!lastGridProps?.actionComplete) {
    throw new Error("actionComplete was not captured");
  }

  await act(async () => {
    await lastGridProps?.actionComplete(args);
  });
};

const callToolbarClick = async (id: string) => {
  if (!lastGridProps?.toolbarClick) {
    throw new Error("toolbarClick was not captured");
  }

  await act(async () => {
    await lastGridProps?.toolbarClick({
      item: { id },
    });
  });
};

describe("PlayersEntryForm2a - interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockValidateFinalizeRows.mockReturnValue(null);

    mockPush.mockClear();
    lastGridProps = null;
    mockSaveStatus = "idle";
    unwrapImpl = () => Promise.resolve();
    bracketListShouldRandomizeOk = true;
    nextOneByeCount = 0;

    seedHappyPathExtracts();

    (reactRedux.useDispatch as unknown as jest.Mock).mockReturnValue(
      jest.fn(() => ({
        unwrap: () => unwrapImpl(),
      })),
    );
  });

  describe("Syncfusion add", () => {
    it("sets the new row id and player_id when Syncfusion starts add", () => {
      renderForm();

      const newRow = {
        first_name: "",
        last_name: "",
        feeTotal: 0,
      } as playerEntryRow;

      callActionBegin({
        requestType: "add",
        data: newRow,
      });

      expect(newRow.id).toBe("ply_new_123");
      expect(newRow.player_id).toBe("ply_new_123");
    });

    it("enables Commit Row when add completes", async () => {
      renderForm();

      await callActionComplete({
        requestType: "add",
        form: document.createElement("form"),
      });

      expect(gridMock.enableToolbarItems).toHaveBeenCalledWith(
        ["playersGrid_commit_row"],
        true,
      );
    });
  });

  describe("Syncfusion delete", () => {
    it("cancels Syncfusion delete and opens confirm modal", () => {
      const { getRowsState } = renderForm();
      const rowToDelete = getRowsState()[0];

      const args = {
        requestType: "delete",
        data: [rowToDelete],
        cancel: false,
      };

      callActionBegin(args);

      expect(args.cancel).toBe(true);

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      expect(within(dlg).getByTestId("confirm-title")).toHaveTextContent(
        "Confirm Delete",
      );
      expect(within(dlg).getByTestId("confirm-message")).toHaveTextContent(
        `Do you want to delete: ${rowToDelete.first_name} ${rowToDelete.last_name}`,
      );
    });

    it("removes the row when confirm Yes is clicked", async () => {
      const user = userEvent.setup();
      const { getRowsState } = renderForm();
      const startLen = getRowsState().length;
      const rowToDelete = getRowsState()[0];

      callActionBegin({
        requestType: "delete",
        data: [rowToDelete],
        cancel: false,
      });

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      await user.click(within(dlg).getByRole("button", { name: /yes/i }));

      expect(getRowsState()).toHaveLength(startLen - 1);
      expect(getRowsState().some((row) => row.id === rowToDelete.id)).toBe(
        false,
      );
    });

    it("does not remove the row when confirm No is clicked", async () => {
      const user = userEvent.setup();
      const { getRowsState } = renderForm();
      const startLen = getRowsState().length;
      const rowToDelete = getRowsState()[0];

      callActionBegin({
        requestType: "delete",
        data: [rowToDelete],
        cancel: false,
      });

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      await user.click(within(dlg).getByRole("button", { name: /no/i }));

      expect(getRowsState()).toHaveLength(startLen);
      expect(getRowsState().some((row) => row.id === rowToDelete.id)).toBe(
        true,
      );
    });
  });

  describe("Syncfusion save row", () => {
    it("normalizes the row during actionBegin save", () => {
      const { getRowsState } = renderForm();
      const row = {
        ...getRowsState()[0],
        first_name: "  john!!  ",
        last_name: "  doe!!  ",
        average: "201.9",
        lane: "12.8",
        position: "ab",
      } as unknown as playerEntryRow;

      gridMock.dataSource = [row];

      callActionBegin({
        requestType: "save",
        data: row,
      });

      expect(row.first_name).toBe("john");
      expect(row.last_name).toBe("doe");
      expect(row.average).toBe(201);
      expect(row.lane).toBe(12);
      expect(row.position).toBe("A");
    });

    it("syncs normalized rows to parent when save completes", async () => {
      const { getRowsState, setRows } = renderForm();
      const rows = getRowsState();

      gridMock.getCurrentViewRecords.mockReturnValue(rows);

      await callActionComplete({
        requestType: "save",
      });

      expect(setRows).toHaveBeenCalledTimes(1);
      expect(setRows.mock.calls[0][0]).toHaveLength(rows.length);
    });

    it("marks Save All enabled after save completes", async () => {
      renderForm();

      await callActionComplete({
        requestType: "save",
      });

      expect(gridMock.enableToolbarItems).toHaveBeenCalledWith(
        ["playersGrid_save"],
        true,
      );
    });
  });

  describe("Syncfusion cancel", () => {
    it("disables Commit Row when cancel completes", async () => {
      renderForm();

      await callActionComplete({
        requestType: "cancel",
      });

      expect(gridMock.enableToolbarItems).toHaveBeenCalledWith(
        ["playersGrid_commit_row"],
        false,
      );
    });
  });

  describe("Syncfusion beginEdit", () => {
    it("enables Commit Row when beginEdit completes", async () => {
      renderForm();

      await callActionComplete({
        requestType: "beginEdit",
        form: document.createElement("form"),
      });

      expect(gridMock.enableToolbarItems).toHaveBeenCalledWith(
        ["playersGrid_commit_row"],
        true,
      );
    });
  });

  describe("toolbar Commit Row", () => {
    it("calls endEdit when Commit Row is clicked while editing", async () => {
      renderForm();

      gridMock.isEdit = true;

      await callToolbarClick("playersGrid_commit_row");

      expect(gridMock.endEdit).toHaveBeenCalledTimes(1);
    });

    it("does not call endEdit when Commit Row is clicked while not editing", async () => {
      renderForm();

      gridMock.isEdit = false;

      await callToolbarClick("playersGrid_commit_row");

      expect(gridMock.endEdit).not.toHaveBeenCalled();
    });
  });

  describe("toolbar Save", () => {
    it("calls endEdit and delays save when Save is clicked while editing", async () => {
      renderForm();

      gridMock.isEdit = true;

      await callToolbarClick("playersGrid_save");

      expect(gridMock.endEdit).toHaveBeenCalledTimes(1);
      expect(mockSaveTmntEntriesData).not.toHaveBeenCalled();
    });

    it("saves after pending Save when row save completes", async () => {
      renderForm();

      gridMock.isEdit = true;

      await callToolbarClick("playersGrid_save");

      await callActionComplete({
        requestType: "save",
      });

      await waitFor(() => {
        expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1);
      });

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`,
      );
    });

    it("saves immediately when Save is clicked while not editing", async () => {
      renderForm();

      gridMock.isEdit = false;

      await callToolbarClick("playersGrid_save");

      await waitFor(() => {
        expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1);
      });

      const tmntToSave = mockSaveTmntEntriesData.mock.calls[0][0] as tmntFullType;

      expect(tmntToSave.stage.stage).toBe(SquadStage.ENTRIES);
      expect(mockExtractFullBrktsData).toHaveBeenCalledWith([]);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows WaitModal when save status is saving", () => {
      mockSaveStatus = "saving";

      renderForm();

      expect(screen.getByRole("dialog", { name: "wait-modal" })).toHaveTextContent(
        "Saving...",
      );
    });

    it("calls onNavigateAfterSave before saving", async () => {
      const onNavigateAfterSave = jest.fn();

      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <PlayersEntryForm
            rows={populateRows(mockTmntFullData)}
            setRows={jest.fn()}
            onNavigateAfterSave={onNavigateAfterSave}
          />
        </Provider>,
      );

      await callToolbarClick("playersGrid_save");

      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
    });
    
    it("calls onNavigateAfterSave before saving", async () => {
      const onNavigateAfterSave = jest.fn();
      const rows = populateRows(mockTmntFullData);

      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <PlayersEntryForm
            rows={rows}
            setRows={jest.fn()}
            onNavigateAfterSave={onNavigateAfterSave}
          />
        </Provider>,
      );

      await act(async () => {
        await lastGridProps?.toolbarClick?.({
          item: {
            id: "save",
          },
        });
      });

      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
    });
  });

  describe("toolbar Validate & Save", () => {
    it("shows ModalErrorMsg when Validate is clicked with no rows", async () => {
      renderForm({ rows: [] });

      await callToolbarClick("playersGrid_validate");

      const dlg = screen.getByRole("dialog", {
        name: "error-modal",
      });

      expect(
        within(dlg).getByTestId("error-title"),
      ).toHaveTextContent("No rows to validate");

      expect(
        within(dlg).getByTestId("error-message"),
      ).toHaveTextContent(
        "Enter player data before validating.",
      );
    });

    it("opens validate confirmation modal", async () => {
      renderForm();

      await callToolbarClick("playersGrid_validate");

      const dlg = screen.getByRole("dialog", {
        name: "confirm",
      });

      expect(
        within(dlg).getByTestId("confirm-title"),
      ).toHaveTextContent("Validate Bowlers");

      expect(
        within(dlg).getByTestId("confirm-message"),
      ).toHaveTextContent(
        /validate all bowler entries/i,
      );
    });

    it("shows ModalErrorMsg when finalize validation fails", async () => {
      const user = userEvent.setup();

      const { getRowsState } = renderForm();
      const row = getRowsState()[0];

      mockValidateFinalizeRows.mockReturnValue({
        id: row.id,
        column: "last_name",
        msg: "Last Name required",
      });

      await callToolbarClick("playersGrid_validate");

      const confirmDlg = screen.getByRole("dialog", {
        name: "confirm",
      });

      await user.click(
        within(confirmDlg).getByRole("button", {
          name: /yes/i,
        }),
      );

      const errDlg = screen.getByRole("dialog", {
        name: "error-modal",
      });

      expect(
        within(errDlg).getByTestId("error-title"),
      ).toHaveTextContent("Validate Error");

      expect(
        within(errDlg).getByTestId("error-message"),
      ).toHaveTextContent("Last Name required");

      expect(mockValidateFinalizeRows).toHaveBeenCalledWith({
        rows: getRowsState(),
        tmntData: mockTmntFullData,
      });

      expect(mockSaveTmntEntriesData).not.toHaveBeenCalled();
    });

    it("shows ModalErrorMsg when bracket randomization fails", async () => {
      const user = userEvent.setup();

      bracketListShouldRandomizeOk = false;

      renderForm();

      await callToolbarClick("playersGrid_validate");

      const confirmDlg = screen.getByRole("dialog", {
        name: "confirm",
      });

      await user.click(
        within(confirmDlg).getByRole("button", {
          name: /yes/i,
        }),
      );

      const errDlg = screen.getByRole("dialog", {
        name: "error-modal",
      });

      expect(
        within(errDlg).getByTestId("error-title"),
      ).toHaveTextContent("Brackets Error");

      expect(
        within(errDlg).getByTestId("error-message"),
      ).toHaveTextContent("Mock bracket randomize error");

      expect(mockSaveTmntEntriesData).not.toHaveBeenCalled();
    });

    it("finalizes and saves successfully", async () => {
      const user = userEvent.setup();

      renderForm();

      await callToolbarClick("playersGrid_validate");

      const confirmDlg = screen.getByRole("dialog", {
        name: "confirm",
      });

      await user.click(
        within(confirmDlg).getByRole("button", {
          name: /yes/i,
        }),
      );

      await waitFor(() => {
        expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1);
      });

      const tmntToSave =
        mockSaveTmntEntriesData.mock.calls[0][0] as tmntFullType;

      expect(tmntToSave.stage.stage).toBe(
        SquadStage.SCORES,
      );

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`,
      );
    });

    it("closes ModalErrorMsg when Close is clicked", async () => {
      const user = userEvent.setup();

      renderForm({ rows: [] });

      await callToolbarClick("playersGrid_validate");

      const dlg = screen.getByRole("dialog", {
        name: "error-modal",
      });

      await user.click(
        within(dlg).getByRole("button", {
          name: /close/i,
        }),
      );

      expect(
        screen.queryByRole("dialog", {
          name: "error-modal",
        }),
      ).not.toBeInTheDocument();
    });
  });  

  describe("toolbar Cancel All", () => {
    it("navigates immediately when Cancel All is clicked with no rows", async () => {
      renderForm({ rows: [] });

      await callToolbarClick("playersGrid_cancel_all");

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`,
      );
    });

    it("opens cancel confirmation modal", async () => {
      renderForm();

      await callToolbarClick("playersGrid_cancel_all");

      const dlg = screen.getByRole("dialog", {
        name: "confirm",
      });

      expect(
        within(dlg).getByTestId("confirm-title"),
      ).toHaveTextContent("Cancel All");
    });

    it("navigates when Cancel All confirm Yes is clicked", async () => {
      const user = userEvent.setup();

      renderForm();

      await callToolbarClick("playersGrid_cancel_all");

      const dlg = screen.getByRole("dialog", {
        name: "confirm",
      });

      await user.click(
        within(dlg).getByRole("button", {
          name: /yes/i,
        }),
      );

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`,
      );
    });

    it("does not navigate when Cancel All confirm No is clicked", async () => {
      const user = userEvent.setup();

      renderForm();

      await callToolbarClick("playersGrid_cancel_all");

      const dlg = screen.getByRole("dialog", {
        name: "confirm",
      });

      await user.click(
        within(dlg).getByRole("button", {
          name: /no/i,
        }),
      );

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("record click focus tracking", () => {
    it("calls getColumnByIndex when a record cell is clicked", () => {
      renderForm();

      act(() => {
        lastGridProps?.recordClick({
          cellIndex: 2,
        });
      });

      expect(gridMock.getColumnByIndex).toHaveBeenCalledWith(2);
    });

    it("calls getColumnByIndex when a record cell is double-clicked", () => {
      renderForm();

      const cell = document.createElement("td");
      Object.defineProperty(cell, "cellIndex", {
        value: 3,
      });

      act(() => {
        lastGridProps?.recordDoubleClick({
          cell,
        });
      });

      expect(gridMock.getColumnByIndex).toHaveBeenCalledWith(3);
    });
  });

  describe("required name validation", () => {
    it("cancels save when first_name is blank", () => {
      renderForm();

      const row = {
        first_name: "",
        last_name: "Smith",
      } as playerEntryRow;

      const args = {
        requestType: "save",
        data: row,
        cancel: false,
      };

      callActionBegin(args);

      expect(args.cancel).toBe(true);
    });

    it("cancels save when last_name is blank", () => {
      renderForm();

      const row = {
        first_name: "John",
        last_name: "",
      } as playerEntryRow;

      const args = {
        requestType: "save",
        data: row,
        cancel: false,
      };

      callActionBegin(args);

      expect(args.cancel).toBe(true);
    });
  });

  describe("save error", () => {    
    // it("does not navigate when dispatch unwrap rejects", async () => {
    //   unwrapImpl = () => Promise.reject(new Error("DB down"));

    //   renderForm();

    //   await expect(callToolbarClick("playersGrid_save")).rejects.toThrow(
    //     "DB down",
    //   );

    //   expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1);
    //   expect(mockPush).not.toHaveBeenCalled();
    // });    
  
    it("does not navigate when dispatch unwrap rejects", async () => {
      unwrapImpl = () => Promise.reject(new Error("DB down"));

      renderForm();

      await callToolbarClick("playersGrid_save");

      expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("readonly mode", () => {
    it("shows readonly warning when enableEditing is false", () => {
      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <PlayersEntryForm
            rows={populateRows(mockTmntFullData)}
            setRows={jest.fn()}
            enableEditing={false}
          />
        </Provider>,
      );

      expect(
        screen.getByText(
          "This tournament has been validated. Bowler editing is disabled.",
        ),
      ).toBeInTheDocument();
    });

    it("navigates immediately when Cancel All is clicked in readonly mode", async () => {
      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <PlayersEntryForm
            rows={populateRows(mockTmntFullData)}
            setRows={jest.fn()}
            enableEditing={false}
          />
        </Provider>,
      );

      await callToolbarClick("playersGrid_cancel_all");

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`,
      );
    });
  });

});