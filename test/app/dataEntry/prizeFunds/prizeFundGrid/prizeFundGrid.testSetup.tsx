import React, { useImperativeHandle } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { prizeFundEntryRow } from "@/lib/types/types";
import PrizeFundGrid, {
  type PrizeFundGridHandle,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";

/**
* Props captured from the mocked Syncfusion GridComponent.
*
* These callbacks let the tests trigger Syncfusion events without rendering
* the real Syncfusion grid.
*/
export type MockGridProps = {
  id?: string;
  dataSource?: prizeFundEntryRow[];

  allowSelection?: boolean;
  allowSorting?: boolean;
  editSettings?: {
    allowEditing?: boolean;
    allowAdding?: boolean;
    allowDeleting?: boolean;
    mode?: string;
    showConfirmDialog?: boolean;
    showDeleteConfirmDialog?: boolean;
  };
  enableStickyHeader?: boolean;
  gridLines?: string;
  width?: string | number;
  height?: string | number;
  selectionSettings?: {
    mode?: string;
  };
  toolbar?: Array<
    | string
    | {
        id?: string;
        text?: string;
        tooltipText?: string;
        prefixIcon?: string;
      }
  >;

  toolbarClick?: (args: {
    item: {
      id: string;
    };
  }) => void;
  actionComplete?: (
    args: {
      requestType?: string;
    },
  ) => void | Promise<void>;
  cellSaved?: (args: {
    rowData?: prizeFundEntryRow;
    columnName?: string;
    value?: unknown;
  }) => void;
  recordClick?: (args: {
    rowIndex?: number;
  }) => void;
  recordDoubleClick?: (args: {
    rowIndex?: number;
  }) => void;

  children?: React.ReactNode;
};
// export type MockGridProps = {
//   id?: string;
//   dataSource?: prizeFundEntryRow[];
//   toolbarClick?: (args: {
//     item: {
//       id: string;
//     };
//   }) => void;
//   actionComplete?: (args: { requestType?: string }) => void | Promise<void>;
//   cellSaved?: (args: {
//     rowData?: prizeFundEntryRow;
//     columnName?: string;
//     value?: unknown;
//   }) => void;
//   recordClick?: (args: { rowIndex?: number }) => void;
//   recordDoubleClick?: (args: { rowIndex?: number }) => void;
//   children?: React.ReactNode;
// };

export type MockConfirmModalProps = {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export type MockErrorModalProps = {
  show: boolean;
  title: string;
  message: string;
  onCancel: () => void;
};

export type SetupOptions = {
  prizeFundType?: "div" | "pot" | "elm";
  rows?: prizeFundEntryRow[];
  totalPrizeFund?: number;
  enableEditing?: boolean;
  gridHeight?: number | string;
  gridDataWasChanged?: boolean;
  saveStatus?: string;
  currentRows?: prizeFundEntryRow[];
  changedRecords?: prizeFundEntryRow[];
  addedRecords?: prizeFundEntryRow[];
  deletedRecords?: prizeFundEntryRow[];
  visibleColumns?: Array<{
    field: string;
  }>;
};

export const mockBatchCancel = jest.fn();
export const mockBatchSave = jest.fn();
export const mockSaveCell = jest.fn();

export const mockClearSelection = jest.fn();
export const mockGetCurrentViewRecords = jest.fn();
export const mockGetBatchChanges = jest.fn();
export const mockGetVisibleColumns = jest.fn();
export const mockSelectCell = jest.fn();
export const mockEditCell = jest.fn();
export const mockSetCellValue = jest.fn();
export const mockEnableItems = jest.fn();
export const mockRefresh = jest.fn();

let latestGridProps: MockGridProps | null = null;
let latestConfirmModalProps: MockConfirmModalProps | null = null;
let latestErrorModalProps: MockErrorModalProps | null = null;

export const getLatestGridProps = (): MockGridProps | null =>
  latestGridProps;

export const getLatestConfirmModalProps =
  (): MockConfirmModalProps | null =>
    latestConfirmModalProps;

export const getLatestErrorModalProps =
  (): MockErrorModalProps | null =>
    latestErrorModalProps;

jest.mock("@/lib/syncfusion-license", () => ({}));

// Syncfusion mock

jest.mock("@syncfusion/ej2-react-grids", () => {
  const ReactModule =
    jest.requireActual<typeof import("react")>("react");

  const GridComponent = ReactModule.forwardRef<
    Record<string, unknown>,
    MockGridProps
  >((props, ref) => {
    latestGridProps = props;

    useImperativeHandle(ref, () => ({
      editModule: {
        batchCancel: mockBatchCancel,
        batchSave: mockBatchSave,
        saveCell: mockSaveCell,
      },
      toolbarModule: {
        enableItems: mockEnableItems,
      },
      clearSelection: mockClearSelection,
      getCurrentViewRecords: mockGetCurrentViewRecords,
      getBatchChanges: mockGetBatchChanges,
      getVisibleColumns: mockGetVisibleColumns,
      selectCell: mockSelectCell,
      editCell: mockEditCell,
      setCellValue: mockSetCellValue,
      refresh: mockRefresh,
    }));

    return (
      <div data-testid="mock-prize-fund-grid">
        <button
          type="button"
          onClick={() => {
            props.toolbarClick?.({
              item: {
                id: "edit",
              },
            });
          }}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => {
            props.toolbarClick?.({
              item: {
                id: "save",
              },
            });
          }}
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => {
            props.toolbarClick?.({
              item: {
                id: "done",
              },
            });
          }}
        >
          Save and Close
        </button>

        <button
          type="button"
          onClick={() => {
            props.toolbarClick?.({
              item: {
                id: "undo_all",
              },
            });
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => {
            props.toolbarClick?.({
              item: {
                id: "back",
              },
            });
          }}
        >
          Back
        </button>

        {props.children}
      </div>
    );
  });

  GridComponent.displayName = "MockGridComponent";

  const PassThrough = ({
    children,
  }: {
    children?: React.ReactNode;
  }) => <>{children}</>;

  const EmptyComponent = () => null;

  return {
    __esModule: true,

    GridComponent,
    ColumnsDirective: PassThrough,
    ColumnDirective: EmptyComponent,
    AggregatesDirective: PassThrough,
    AggregateDirective: PassThrough,
    AggregateColumnsDirective: PassThrough,
    AggregateColumnDirective: EmptyComponent,
    Inject: EmptyComponent,

    Aggregate: "Aggregate",
    Edit: "Edit",
    Toolbar: "Toolbar",
  };
});

// column and aggregate mocks

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns",
  () => ({
    __esModule: true,

    pfEntryIdColName: "id",
    pfEntryAmountColName: "amount",
    pfEntryPercentColName: "percentage",

    createPfColumns: jest.fn(() => [
      {
        field: "id",
        headerText: "ID",
        isPrimaryKey: true,
        allowEditing: false,
        visible: false,
      },
      {
        field: "position",
        headerText: "Position",
        allowEditing: false,
        visible: true,
      },
      {
        field: "amount",
        headerText: "Amount",
        allowEditing: true,
        visible: true,
      },
      {
        field: "percentage",
        headerText: "Percentage",
        allowEditing: false,
        visible: true,
      },
    ]),
  }),
);

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/sfPfAggregates",
  () => ({
    __esModule: true,

    createPfTotalAggregates: jest.fn(() => []),
    createPfDiffAggregates: jest.fn(() => []),
  }),
);

// modal mocks

jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,

  cancelConfTitle: "Confirm Cancel",

  default: (props: MockConfirmModalProps) => {
    latestConfirmModalProps = props;

    if (!props.show) {
      return null;
    }

    return (
      <div role="dialog" aria-label="confirm-modal">
        <div>{props.title}</div>
        <div>{props.message}</div>

        <button
          type="button"
          onClick={() => {
            void props.onConfirm();
          }}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={props.onCancel}
        >
          No
        </button>
      </div>
    );
  },
}));

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,

  default: (props: MockErrorModalProps) => {
    latestErrorModalProps = props;

    if (!props.show) {
      return null;
    }

    return (
      <div role="alert">
        <div>{props.title}</div>
        <div>{props.message}</div>

        <button
          type="button"
          onClick={props.onCancel}
        >
          Close Error
        </button>
      </div>
    );
  },
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,

  default: ({
    show,
    message,
  }: {
    show: boolean;
    message: string;
  }) => {
    if (!show) {
      return null;
    }

    return <div role="status">{message}</div>;
  },
}));

// makeRows() and setup()
const tpf = 100 + 60 + 40 // total prize fund

export const makeRows = (): prizeFundEntryRow[] => [
  {
    id: "dpf_00000000000000000000000000000001",
    parent_id: "div_00000000000000000000000000000001",
    position: 1,
    amount: 100,
    percentage: 0.5,
  },
  {
    id: "dpf_00000000000000000000000000000002",
    parent_id: "div_00000000000000000000000000000001",
    position: 2,
    amount: 60,
    percentage: 0.3,
  },
  {
    id: "dpf_00000000000000000000000000000003",
    parent_id: "div_00000000000000000000000000000001",
    position: 3,
    amount: 40,
    percentage: 0.2,
  },
];

export const savedRowsCopy = (
  rows: prizeFundEntryRow[],
): prizeFundEntryRow[] =>
  rows.map((row) => ({ ...row }));

export const setup = ({
  prizeFundType = "div",
  rows = makeRows(),
  totalPrizeFund = tpf,
  enableEditing = true,
  gridHeight = "350",
  gridDataWasChanged = false,
  saveStatus = "idle",
  currentRows = rows,
  changedRecords = [],
  addedRecords = [],
  deletedRecords = [],
  visibleColumns = [
    { field: "id" },
    { field: "position" },
    { field: "amount" },
    { field: "percentage" },
  ],
}: SetupOptions = {}) => {
  const user = userEvent.setup();

  const gridHandleRef = React.createRef<PrizeFundGridHandle>();
  const setRows = jest.fn();
  const onGridDataChanged = jest.fn();
  const onGridDataReset = jest.fn();
  const onSave = jest.fn().mockResolvedValue(undefined);
  const onNavigateAfterSave = jest.fn();
  const onBack = jest.fn();
  const onSaveComplete = jest.fn();

  mockGetCurrentViewRecords.mockReturnValue(currentRows);
  mockGetBatchChanges.mockReturnValue({
    changedRecords,
    addedRecords,
    deletedRecords,
  });
  mockGetVisibleColumns.mockReturnValue(visibleColumns);

  const view = render(
    <PrizeFundGrid
      ref={gridHandleRef}
      gridId="test-prize-fund-grid"
      prizeFundType={prizeFundType}
      rows={rows}
      setRows={setRows}
      totalPrizeFund={totalPrizeFund}
      enableEditing={enableEditing}
      gridHeight={gridHeight}
      gridDataWasChanged={gridDataWasChanged}
      saveStatus={saveStatus}
      onGridDataChanged={onGridDataChanged}
      onGridDataReset={onGridDataReset}
      onSave={onSave}
      onNavigateAfterSave={onNavigateAfterSave}
      onBack={onBack}
      onSaveComplete={onSaveComplete}
    />,
  );

  const rerenderWithTotalPrizeFund = (
    newTotalPrizeFund: number,
  ): void => {
    view.rerender(
      <PrizeFundGrid
        ref={gridHandleRef}
        gridId="test-prize-fund-grid"
        prizeFundType={prizeFundType}
        rows={rows}
        setRows={setRows}
        totalPrizeFund={newTotalPrizeFund}
        enableEditing={enableEditing}
        gridHeight={gridHeight}
        gridDataWasChanged={gridDataWasChanged}
        saveStatus={saveStatus}
        onGridDataChanged={onGridDataChanged}
        onGridDataReset={onGridDataReset}
        onSave={onSave}
        onNavigateAfterSave={onNavigateAfterSave}
        onBack={onBack}
        onSaveComplete={onSaveComplete}
      />,
    );
  };  

  const triggerActionComplete = async (
    requestType: string,
  ): Promise<void> => {
    await act(async () => {
      await latestGridProps?.actionComplete?.({
        requestType,
      });
    });
  };

  const triggerCellSaved = (
    rowData: prizeFundEntryRow,
    columnName: string,
    value: unknown,
  ): void => {
    act(() => {
      latestGridProps?.cellSaved?.({
        rowData,
        columnName,
        value,
      });
    });
  };

  const triggerRecordClick = (
    rowIndex: number,
  ): void => {
    act(() => {
      latestGridProps?.recordClick?.({
        rowIndex,
      });
    });
  };

  const triggerRecordDoubleClick = (
    rowIndex: number,
  ): void => {
    act(() => {
      latestGridProps?.recordDoubleClick?.({
        rowIndex,
      });
    });
  };

  return {
    user,
    view,

    gridHandleRef,

    rows,
    setRows,
    onGridDataChanged,
    onGridDataReset,
    onSave,
    onNavigateAfterSave,
    onBack,
    onSaveComplete,

    rerenderWithTotalPrizeFund,

    triggerActionComplete,
    triggerCellSaved,
    triggerRecordClick,
    triggerRecordDoubleClick,
  };
};

export const standardBeforeEach = () => {
  jest.clearAllMocks();

  latestGridProps = null;
  latestConfirmModalProps = null;
  latestErrorModalProps = null;

  mockGetCurrentViewRecords.mockReturnValue([]);
  mockGetBatchChanges.mockReturnValue({
    changedRecords: [],
    addedRecords: [],
    deletedRecords: [],
  });
  mockGetVisibleColumns.mockReturnValue([
    { field: "id" },
    { field: "position" },
    { field: "amount" },
    { field: "percentage" },
  ]);  
};

export const clickToolbarButton = async (
  user: ReturnType<typeof userEvent.setup>,
  name: "Edit" | "Save" | "Save and Close" | "Cancel" | "Back",
): Promise<void> => {
  await user.click(
    screen.getByRole("button", { name }),
  );
};

export const openCancelConfirmation = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", {
      name: "Cancel",
    }),
  );
};

export const clickSave = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", {
      name: "Save",
    }),
  );
};

export const clickSaveAndClose = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", {
      name: "Save and Close",
    }),
  );
};

export const performSave = async (
  user: ReturnType<typeof userEvent.setup>,
  triggerActionComplete: (requestType: string) => Promise<void>,
): Promise<void> => {
  await clickSave(user);
  expect(mockBatchSave).toHaveBeenCalledTimes(1);
  await triggerActionComplete("batchsave");
};

export const clickEdit = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", {
      name: "Edit",
    }),
  );
};

export const clickBack = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", {
      name: "Back",
    }),
  );
};

export const getCurrentRowsFromHandle = (
  gridHandleRef: React.RefObject<PrizeFundGridHandle | null>,
): prizeFundEntryRow[] => {
  return gridHandleRef.current?.getCurrentRows() ?? [];
};

export const setCurrentRows = (
  rows: prizeFundEntryRow[],
): prizeFundEntryRow[] => {
  mockGetCurrentViewRecords.mockReturnValue(rows);
  return rows;
};

export const setBatchChanges = ({
  changedRecords = [],
  addedRecords = [],
  deletedRecords = [],
}: {
  changedRecords?: prizeFundEntryRow[];
  addedRecords?: prizeFundEntryRow[];
  deletedRecords?: prizeFundEntryRow[];
}) => {
  mockGetBatchChanges.mockReturnValue({
    changedRecords,
    addedRecords,
    deletedRecords,
  });
};