import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { idTypes, prizeFundEntryRow } from "@/lib/types/types";
import PrizeFundGrid, {
  type PrizeFundGridHandle,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";

/*********
 * Types *
 *********/

export type MockToolbarItem =
  | string
  | {
      id?: string;
      text?: string;
      tooltipText?: string;
      prefixIcon?: string;
    };

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
  rowHeight?: number;
  selectionSettings?: {
    mode?: string;
  };
  toolbar?: MockToolbarItem[];

  toolbarClick?: (args: { item: { id: string } }) => void;
  actionComplete?: (args: { requestType?: string }) => void | Promise<void>;
  cellSaved?: (args: {
    rowData?: prizeFundEntryRow;
    columnName?: string;
    value?: unknown;
  }) => void;
  recordClick?: (args: { rowIndex?: number }) => void;
  recordDoubleClick?: (args: { rowIndex?: number }) => void;

  children?: React.ReactNode;
};

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

/** Props of the real PrizeFundGrid, minus the forwarded ref. */
export type PrizeFundGridTestProps = Omit<
  React.ComponentProps<typeof PrizeFundGrid>,
  "ref"
>;

export type SetupOptions = {
  prizeFundType?: idTypes;
  rows?: prizeFundEntryRow[];
  totalPrizeFund?: number;
  enableEditing?: boolean;
  gridHeight?: number | string;
  gridDataWasChanged?: boolean;
  saveStatus?: string;
  /**
   * When true, the optional callbacks (onNavigateAfterSave, onSaveComplete,
   * onCancel) are not passed, so tests can verify the component tolerates
   * them being undefined.
   */
  omitOptionalCallbacks?: boolean;

  /**
   * Custom onSave mock. Defaults to a mock that resolves.
   *
   * Use a rejecting mock to test the Save Error path, e.g.
   *   setup({ onSave: jest.fn().mockRejectedValue(new Error("DB down")) })
   *
   * Tests can also call onSave.mockRejectedValueOnce(...) on the returned
   * mock before saving.
   */
  onSave?: jest.Mock;

  // values returned by the mocked grid instance
  currentRows?: prizeFundEntryRow[];
  changedRecords?: prizeFundEntryRow[];
  addedRecords?: prizeFundEntryRow[];
  deletedRecords?: prizeFundEntryRow[];
  visibleColumns?: Array<{ field: string }>;
};

export type ToolbarButtonName =
  | "Edit"
  | "Save"
  | "Save and Close"
  | "Cancel"
  | "Back";

/****************************
 * Mocked grid instance fns *
 ****************************/

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

/*
 * Captured props from the mocked components.
 * Prefixed with "mock" so jest.mock factories are allowed to reference them
 * (babel-plugin-jest-hoist rejects other out-of-scope variables).
 */
let mockLatestGridProps: MockGridProps | null = null;
let mockLatestConfirmModalProps: MockConfirmModalProps | null = null;
let mockLatestErrorModalProps: MockErrorModalProps | null = null;

export const getLatestGridProps = (): MockGridProps | null =>
  mockLatestGridProps;

export const getLatestConfirmModalProps = (): MockConfirmModalProps | null =>
  mockLatestConfirmModalProps;

export const getLatestErrorModalProps = (): MockErrorModalProps | null =>
  mockLatestErrorModalProps;

/*********
 * Mocks *
 *********/

jest.mock("@/lib/syncfusion-license", () => ({}));

// Syncfusion mock

jest.mock("@syncfusion/ej2-react-grids", () => {
  const ReactModule = jest.requireActual<typeof import("react")>("react");

  const GridComponent = ReactModule.forwardRef<
    Record<string, unknown>,
    MockGridProps
  >((props, ref) => {
    mockLatestGridProps = props;

    ReactModule.useImperativeHandle(ref, () => ({
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

    // Toolbar buttons are built from the component's own toolbar config,
    // so a changed id or label in prizeFundGrid.tsx is caught by the tests.
    return (
      <div data-testid="mock-prize-fund-grid">
        {(props.toolbar ?? []).map((item, index) => {
          const id = typeof item === "string" ? item : (item.id ?? "");
          const text = typeof item === "string" ? item : (item.text ?? id);

          return (
            <button
              key={id || index}
              type="button"
              data-testid={`toolbar-${id}`}
              onClick={() => {
                props.toolbarClick?.({ item: { id } });
              }}
            >
              {text}
            </button>
          );
        })}

        {props.children}
      </div>
    );
  });

  GridComponent.displayName = "MockGridComponent";

  const PassThrough = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  );

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

jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns", () => ({
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
}));

jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/sfPfAggregates", () => ({
  __esModule: true,

  createPfTotalAggregates: jest.fn(() => []),
  createPfDiffAggregates: jest.fn(() => []),
}));

// modal mocks

jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,

  cancelConfTitle: "Confirm Cancel",

  default: (props: MockConfirmModalProps) => {
    mockLatestConfirmModalProps = props;

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

        <button type="button" onClick={props.onCancel}>
          No
        </button>
      </div>
    );
  },
}));

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,

  default: (props: MockErrorModalProps) => {
    mockLatestErrorModalProps = props;

    if (!props.show) {
      return null;
    }

    return (
      <div role="alert">
        <div>{props.title}</div>
        <div>{props.message}</div>

        <button type="button" onClick={props.onCancel}>
          Close Error
        </button>
      </div>
    );
  },
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,

  default: ({ show, message }: { show: boolean; message: string }) => {
    if (!show) {
      return null;
    }

    return <div role="status">{message}</div>;
  },
}));

/*************
 * Test data *
 *************/

export const defaultGridId = "test-prize-fund-grid";

/** Title of the error modal shown when onSave rejects. */
export const saveErrorTitle = "Save Error";

/** Message shown when onSave rejects with something that is not an Error. */
export const defaultSaveErrorMessage = "Unable to save prize funds.";

export const defaultVisibleColumns = (): Array<{ field: string }> => [
  { field: "id" },
  { field: "position" },
  { field: "amount" },
  { field: "percentage" },
];

/** Sum of the amounts returned by makeRows(). */
export const defaultTotalPrizeFund = 100 + 60 + 40;

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

export const savedRowsCopy = (rows: prizeFundEntryRow[]): prizeFundEntryRow[] =>
  rows.map((row) => ({ ...row }));

/*********
 * Setup *
 *********/

export const setup = ({
  prizeFundType = "div",
  rows = makeRows(),
  totalPrizeFund = defaultTotalPrizeFund,
  enableEditing = true,
  gridHeight = "350",
  gridDataWasChanged = false,
  saveStatus = "idle",
  omitOptionalCallbacks = false,
  onSave = jest.fn().mockResolvedValue(undefined),
  // Copies, like the real grid: handleCellSaved mutates rowData in place,
  // and that should not leak back into the rows prop.
  currentRows = savedRowsCopy(rows),
  changedRecords = [],
  addedRecords = [],
  deletedRecords = [],
  visibleColumns = defaultVisibleColumns(),
}: SetupOptions = {}) => {
  const user = userEvent.setup();

  const gridHandleRef = React.createRef<PrizeFundGridHandle>();

  /*
   * PrizeFundGrid no longer calls setRows after a save; the parent updates
   * its rows in onSaveComplete. It is still a required prop, so keep the
   * mock and let save tests assert it is not called.
   */
  const setRows = jest.fn();
  const onGridDataChanged = jest.fn();
  const onGridDataReset = jest.fn();
  const onNavigateAfterSave = jest.fn();
  const onBack = jest.fn();
  const onSaveComplete = jest.fn();
  const onCancel = jest.fn();

  mockGetCurrentViewRecords.mockReturnValue(currentRows);
  mockGetBatchChanges.mockReturnValue({
    changedRecords,
    addedRecords,
    deletedRecords,
  });
  mockGetVisibleColumns.mockReturnValue(visibleColumns);

  let currentProps: PrizeFundGridTestProps = {
    gridId: defaultGridId,
    prizeFundType,
    rows,
    setRows,
    totalPrizeFund,
    enableEditing,
    gridHeight,
    gridDataWasChanged,
    saveStatus,
    onGridDataChanged,
    onGridDataReset,
    onSave,
    onBack,
    ...(omitOptionalCallbacks
      ? {}
      : { onNavigateAfterSave, onSaveComplete, onCancel }),
  };

  const view = render(<PrizeFundGrid ref={gridHandleRef} {...currentProps} />);

  /**
   * Re-renders with the previous props merged with the overrides.
   */
  const rerender = (overrides: Partial<PrizeFundGridTestProps> = {}): void => {
    currentProps = { ...currentProps, ...overrides };
    view.rerender(<PrizeFundGrid ref={gridHandleRef} {...currentProps} />);
  };

  const rerenderWithTotalPrizeFund = (newTotalPrizeFund: number): void => {
    rerender({ totalPrizeFund: newTotalPrizeFund });
  };

  const triggerActionComplete = async (requestType: string): Promise<void> => {
    await act(async () => {
      await mockLatestGridProps?.actionComplete?.({ requestType });
    });
  };

  /**
   * Note: the component mutates rowData (like Syncfusion does), so pass a
   * copy if the test later compares against the original row.
   */
  const triggerCellSaved = (
    rowData: prizeFundEntryRow,
    columnName: string,
    value: unknown,
  ): void => {
    act(() => {
      mockLatestGridProps?.cellSaved?.({ rowData, columnName, value });
    });
  };

  const triggerRecordClick = (rowIndex: number): void => {
    act(() => {
      mockLatestGridProps?.recordClick?.({ rowIndex });
    });
  };

  const triggerRecordDoubleClick = (rowIndex: number): void => {
    act(() => {
      mockLatestGridProps?.recordDoubleClick?.({ rowIndex });
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
    onCancel,

    getProps: () => currentProps,
    rerender,
    rerenderWithTotalPrizeFund,

    triggerActionComplete,
    triggerCellSaved,
    triggerRecordClick,
    triggerRecordDoubleClick,
  };
};

export const standardBeforeEach = () => {
  jest.clearAllMocks();

  mockLatestGridProps = null;
  mockLatestConfirmModalProps = null;
  mockLatestErrorModalProps = null;

  mockGetCurrentViewRecords.mockReturnValue([]);
  mockGetBatchChanges.mockReturnValue({
    changedRecords: [],
    addedRecords: [],
    deletedRecords: [],
  });
  mockGetVisibleColumns.mockReturnValue(defaultVisibleColumns());
};

/***********
 * Helpers *
 ***********/

/**
 * Lets the component's setTimeout(..., 0) callbacks run inside act().
 * validateAndSave() and beginToolbarEdit() both defer work this way, so
 * batchSave / editCell / the error modal only happen after this resolves.
 */
export const flushTimeouts = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

export const clickToolbarButton = async (
  user: ReturnType<typeof userEvent.setup>,
  name: ToolbarButtonName,
): Promise<void> => {
  await user.click(screen.getByRole("button", { name }));
  await flushTimeouts();
};

export const clickEdit = (user: ReturnType<typeof userEvent.setup>) =>
  clickToolbarButton(user, "Edit");

export const clickSave = (user: ReturnType<typeof userEvent.setup>) =>
  clickToolbarButton(user, "Save");

export const clickSaveAndClose = (user: ReturnType<typeof userEvent.setup>) =>
  clickToolbarButton(user, "Save and Close");

export const openCancelConfirmation = (
  user: ReturnType<typeof userEvent.setup>,
) => clickToolbarButton(user, "Cancel");

export const clickBack = (user: ReturnType<typeof userEvent.setup>) =>
  clickToolbarButton(user, "Back");

export const clickConfirmYes = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(screen.getByRole("button", { name: "Yes" }));
};

export const clickConfirmNo = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(screen.getByRole("button", { name: "No" }));
};

/**
 * Returns the error modal (validation or save error) if it is showing.
 */
export const queryErrorModal = (): HTMLElement | null =>
  screen.queryByRole("alert");

export const closeErrorModal = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(screen.getByRole("button", { name: "Close Error" }));
};

/**
 * Clicks Save, confirms validation passed (batchSave was called),
 * then fires the batchsave actionComplete the real grid would raise.
 *
 * Also used for failed saves: when onSave rejects, the component catches
 * the error and shows the Save Error modal, so this still resolves.
 */
export const performSave = async (
  user: ReturnType<typeof userEvent.setup>,
  triggerActionComplete: (requestType: string) => Promise<void>,
): Promise<void> => {
  await clickSave(user);
  expect(mockBatchSave).toHaveBeenCalled();
  await triggerActionComplete("batchsave");
};

export const performSaveAndClose = async (
  user: ReturnType<typeof userEvent.setup>,
  triggerActionComplete: (requestType: string) => Promise<void>,
): Promise<void> => {
  await clickSaveAndClose(user);
  expect(mockBatchSave).toHaveBeenCalled();
  await triggerActionComplete("batchsave");
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


// import React from "react";
// import { act, render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import type { idTypes, prizeFundEntryRow } from "@/lib/types/types";
// import PrizeFundGrid, {
//   type PrizeFundGridHandle,
// } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";

// /*********
//  * Types *
//  *********/

// export type MockToolbarItem =
//   | string
//   | {
//       id?: string;
//       text?: string;
//       tooltipText?: string;
//       prefixIcon?: string;
//     };

// /**
//  * Props captured from the mocked Syncfusion GridComponent.
//  *
//  * These callbacks let the tests trigger Syncfusion events without rendering
//  * the real Syncfusion grid.
//  */
// export type MockGridProps = {
//   id?: string;
//   dataSource?: prizeFundEntryRow[];

//   allowSelection?: boolean;
//   allowSorting?: boolean;
//   editSettings?: {
//     allowEditing?: boolean;
//     allowAdding?: boolean;
//     allowDeleting?: boolean;
//     mode?: string;
//     showConfirmDialog?: boolean;
//     showDeleteConfirmDialog?: boolean;
//   };
//   enableStickyHeader?: boolean;
//   gridLines?: string;
//   width?: string | number;
//   height?: string | number;
//   rowHeight?: number;
//   selectionSettings?: {
//     mode?: string;
//   };
//   toolbar?: MockToolbarItem[];

//   toolbarClick?: (args: { item: { id: string } }) => void;
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

// export type MockConfirmModalProps = {
//   show: boolean;
//   title: string;
//   message: string;
//   onConfirm: () => void | Promise<void>;
//   onCancel: () => void;
// };

// export type MockErrorModalProps = {
//   show: boolean;
//   title: string;
//   message: string;
//   onCancel: () => void;
// };

// /** Props of the real PrizeFundGrid, minus the forwarded ref. */
// export type PrizeFundGridTestProps = Omit<
//   React.ComponentProps<typeof PrizeFundGrid>,
//   "ref"
// >;

// export type SetupOptions = {
//   prizeFundType?: idTypes;
//   rows?: prizeFundEntryRow[];
//   totalPrizeFund?: number;
//   enableEditing?: boolean;
//   gridHeight?: number | string;
//   gridDataWasChanged?: boolean;
//   saveStatus?: string;
//   /**
//    * When true, the optional callbacks (onNavigateAfterSave, onSaveComplete,
//    * onCancel) are not passed, so tests can verify the component tolerates
//    * them being undefined.
//    */
//   omitOptionalCallbacks?: boolean;

//   // values returned by the mocked grid instance
//   currentRows?: prizeFundEntryRow[];
//   changedRecords?: prizeFundEntryRow[];
//   addedRecords?: prizeFundEntryRow[];
//   deletedRecords?: prizeFundEntryRow[];
//   visibleColumns?: Array<{ field: string }>;
// };

// export type ToolbarButtonName =
//   | "Edit"
//   | "Save"
//   | "Save and Close"
//   | "Cancel"
//   | "Back";

// /**************************
//  * Mocked grid instance fns *
//  **************************/

// export const mockBatchCancel = jest.fn();
// export const mockBatchSave = jest.fn();
// export const mockSaveCell = jest.fn();

// export const mockClearSelection = jest.fn();
// export const mockGetCurrentViewRecords = jest.fn();
// export const mockGetBatchChanges = jest.fn();
// export const mockGetVisibleColumns = jest.fn();
// export const mockSelectCell = jest.fn();
// export const mockEditCell = jest.fn();
// export const mockSetCellValue = jest.fn();
// export const mockEnableItems = jest.fn();
// export const mockRefresh = jest.fn();

// /*
//  * Captured props from the mocked components.
//  * Prefixed with "mock" so jest.mock factories are allowed to reference them
//  * (babel-plugin-jest-hoist rejects other out-of-scope variables).
//  */
// let mockLatestGridProps: MockGridProps | null = null;
// let mockLatestConfirmModalProps: MockConfirmModalProps | null = null;
// let mockLatestErrorModalProps: MockErrorModalProps | null = null;

// export const getLatestGridProps = (): MockGridProps | null =>
//   mockLatestGridProps;

// export const getLatestConfirmModalProps = (): MockConfirmModalProps | null =>
//   mockLatestConfirmModalProps;

// export const getLatestErrorModalProps = (): MockErrorModalProps | null =>
//   mockLatestErrorModalProps;

// /*********
//  * Mocks *
//  *********/

// jest.mock("@/lib/syncfusion-license", () => ({}));

// // Syncfusion mock

// jest.mock("@syncfusion/ej2-react-grids", () => {
//   const ReactModule = jest.requireActual<typeof import("react")>("react");

//   const GridComponent = ReactModule.forwardRef<
//     Record<string, unknown>,
//     MockGridProps
//   >((props, ref) => {
//     mockLatestGridProps = props;

//     ReactModule.useImperativeHandle(ref, () => ({
//       editModule: {
//         batchCancel: mockBatchCancel,
//         batchSave: mockBatchSave,
//         saveCell: mockSaveCell,
//       },
//       toolbarModule: {
//         enableItems: mockEnableItems,
//       },
//       clearSelection: mockClearSelection,
//       getCurrentViewRecords: mockGetCurrentViewRecords,
//       getBatchChanges: mockGetBatchChanges,
//       getVisibleColumns: mockGetVisibleColumns,
//       selectCell: mockSelectCell,
//       editCell: mockEditCell,
//       setCellValue: mockSetCellValue,
//       refresh: mockRefresh,
//     }));

//     // Toolbar buttons are built from the component's own toolbar config,
//     // so a changed id or label in prizeFundGrid.tsx is caught by the tests.
//     return (
//       <div data-testid="mock-prize-fund-grid">
//         {(props.toolbar ?? []).map((item, index) => {
//           const id = typeof item === "string" ? item : (item.id ?? "");
//           const text = typeof item === "string" ? item : (item.text ?? id);

//           return (
//             <button
//               key={id || index}
//               type="button"
//               data-testid={`toolbar-${id}`}
//               onClick={() => {
//                 props.toolbarClick?.({ item: { id } });
//               }}
//             >
//               {text}
//             </button>
//           );
//         })}

//         {props.children}
//       </div>
//     );
//   });

//   GridComponent.displayName = "MockGridComponent";

//   const PassThrough = ({ children }: { children?: React.ReactNode }) => (
//     <>{children}</>
//   );

//   const EmptyComponent = () => null;

//   return {
//     __esModule: true,

//     GridComponent,
//     ColumnsDirective: PassThrough,
//     ColumnDirective: EmptyComponent,
//     AggregatesDirective: PassThrough,
//     AggregateDirective: PassThrough,
//     AggregateColumnsDirective: PassThrough,
//     AggregateColumnDirective: EmptyComponent,
//     Inject: EmptyComponent,

//     Aggregate: "Aggregate",
//     Edit: "Edit",
//     Toolbar: "Toolbar",
//   };
// });

// // column and aggregate mocks

// jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns", () => ({
//   __esModule: true,

//   pfEntryIdColName: "id",
//   pfEntryAmountColName: "amount",
//   pfEntryPercentColName: "percentage",

//   createPfColumns: jest.fn(() => [
//     {
//       field: "id",
//       headerText: "ID",
//       isPrimaryKey: true,
//       allowEditing: false,
//       visible: false,
//     },
//     {
//       field: "position",
//       headerText: "Position",
//       allowEditing: false,
//       visible: true,
//     },
//     {
//       field: "amount",
//       headerText: "Amount",
//       allowEditing: true,
//       visible: true,
//     },
//     {
//       field: "percentage",
//       headerText: "Percentage",
//       allowEditing: false,
//       visible: true,
//     },
//   ]),
// }));

// jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/sfPfAggregates", () => ({
//   __esModule: true,

//   createPfTotalAggregates: jest.fn(() => []),
//   createPfDiffAggregates: jest.fn(() => []),
// }));

// // modal mocks

// jest.mock("@/components/modal/confirmModal", () => ({
//   __esModule: true,

//   cancelConfTitle: "Confirm Cancel",

//   default: (props: MockConfirmModalProps) => {
//     mockLatestConfirmModalProps = props;

//     if (!props.show) {
//       return null;
//     }

//     return (
//       <div role="dialog" aria-label="confirm-modal">
//         <div>{props.title}</div>
//         <div>{props.message}</div>

//         <button
//           type="button"
//           onClick={() => {
//             void props.onConfirm();
//           }}
//         >
//           Yes
//         </button>

//         <button type="button" onClick={props.onCancel}>
//           No
//         </button>
//       </div>
//     );
//   },
// }));

// jest.mock("@/components/modal/errorModal", () => ({
//   __esModule: true,

//   default: (props: MockErrorModalProps) => {
//     mockLatestErrorModalProps = props;

//     if (!props.show) {
//       return null;
//     }

//     return (
//       <div role="alert">
//         <div>{props.title}</div>
//         <div>{props.message}</div>

//         <button type="button" onClick={props.onCancel}>
//           Close Error
//         </button>
//       </div>
//     );
//   },
// }));

// jest.mock("@/components/modal/waitModal", () => ({
//   __esModule: true,

//   default: ({ show, message }: { show: boolean; message: string }) => {
//     if (!show) {
//       return null;
//     }

//     return <div role="status">{message}</div>;
//   },
// }));

// /*************
//  * Test data *
//  *************/

// export const defaultGridId = "test-prize-fund-grid";

// export const defaultVisibleColumns = (): Array<{ field: string }> => [
//   { field: "id" },
//   { field: "position" },
//   { field: "amount" },
//   { field: "percentage" },
// ];

// /** Sum of the amounts returned by makeRows(). */
// export const defaultTotalPrizeFund = 100 + 60 + 40;

// export const makeRows = (): prizeFundEntryRow[] => [
//   {
//     id: "dpf_00000000000000000000000000000001",
//     parent_id: "div_00000000000000000000000000000001",
//     position: 1,
//     amount: 100,
//     percentage: 0.5,
//   },
//   {
//     id: "dpf_00000000000000000000000000000002",
//     parent_id: "div_00000000000000000000000000000001",
//     position: 2,
//     amount: 60,
//     percentage: 0.3,
//   },
//   {
//     id: "dpf_00000000000000000000000000000003",
//     parent_id: "div_00000000000000000000000000000001",
//     position: 3,
//     amount: 40,
//     percentage: 0.2,
//   },
// ];

// export const savedRowsCopy = (rows: prizeFundEntryRow[]): prizeFundEntryRow[] =>
//   rows.map((row) => ({ ...row }));

// /*********
//  * Setup *
//  *********/

// export const setup = ({
//   prizeFundType = "div",
//   rows = makeRows(),
//   totalPrizeFund = defaultTotalPrizeFund,
//   enableEditing = true,
//   gridHeight = "350",
//   gridDataWasChanged = false,
//   saveStatus = "idle",
//   omitOptionalCallbacks = false,
//   // Copies, like the real grid: handleCellSaved mutates rowData in place,
//   // and that should not leak back into the rows prop.
//   currentRows = savedRowsCopy(rows),
//   changedRecords = [],
//   addedRecords = [],
//   deletedRecords = [],
//   visibleColumns = defaultVisibleColumns(),
// }: SetupOptions = {}) => {
//   const user = userEvent.setup();

//   const gridHandleRef = React.createRef<PrizeFundGridHandle>();
//   const setRows = jest.fn();
//   const onGridDataChanged = jest.fn();
//   const onGridDataReset = jest.fn();
//   const onSave = jest.fn().mockResolvedValue(undefined);
//   const onNavigateAfterSave = jest.fn();
//   const onBack = jest.fn();
//   const onSaveComplete = jest.fn();
//   const onCancel = jest.fn();

//   mockGetCurrentViewRecords.mockReturnValue(currentRows);
//   mockGetBatchChanges.mockReturnValue({
//     changedRecords,
//     addedRecords,
//     deletedRecords,
//   });
//   mockGetVisibleColumns.mockReturnValue(visibleColumns);

//   let currentProps: PrizeFundGridTestProps = {
//     gridId: defaultGridId,
//     prizeFundType,
//     rows,
//     setRows,
//     totalPrizeFund,
//     enableEditing,
//     gridHeight,
//     gridDataWasChanged,
//     saveStatus,
//     onGridDataChanged,
//     onGridDataReset,
//     onSave,
//     onBack,
//     ...(omitOptionalCallbacks
//       ? {}
//       : { onNavigateAfterSave, onSaveComplete, onCancel }),
//   };

//   const view = render(<PrizeFundGrid ref={gridHandleRef} {...currentProps} />);

//   /**
//    * Re-renders with the previous props merged with the overrides.
//    */
//   const rerender = (overrides: Partial<PrizeFundGridTestProps> = {}): void => {
//     currentProps = { ...currentProps, ...overrides };
//     view.rerender(<PrizeFundGrid ref={gridHandleRef} {...currentProps} />);
//   };

//   const rerenderWithTotalPrizeFund = (newTotalPrizeFund: number): void => {
//     rerender({ totalPrizeFund: newTotalPrizeFund });
//   };

//   const triggerActionComplete = async (requestType: string): Promise<void> => {
//     await act(async () => {
//       await mockLatestGridProps?.actionComplete?.({ requestType });
//     });
//   };

//   /**
//    * Note: the component mutates rowData (like Syncfusion does), so pass a
//    * copy if the test later compares against the original row.
//    */
//   const triggerCellSaved = (
//     rowData: prizeFundEntryRow,
//     columnName: string,
//     value: unknown,
//   ): void => {
//     act(() => {
//       mockLatestGridProps?.cellSaved?.({ rowData, columnName, value });
//     });
//   };

//   const triggerRecordClick = (rowIndex: number): void => {
//     act(() => {
//       mockLatestGridProps?.recordClick?.({ rowIndex });
//     });
//   };

//   const triggerRecordDoubleClick = (rowIndex: number): void => {
//     act(() => {
//       mockLatestGridProps?.recordDoubleClick?.({ rowIndex });
//     });
//   };

//   return {
//     user,
//     view,

//     gridHandleRef,

//     rows,
//     setRows,
//     onGridDataChanged,
//     onGridDataReset,
//     onSave,
//     onNavigateAfterSave,
//     onBack,
//     onSaveComplete,
//     onCancel,

//     getProps: () => currentProps,
//     rerender,
//     rerenderWithTotalPrizeFund,

//     triggerActionComplete,
//     triggerCellSaved,
//     triggerRecordClick,
//     triggerRecordDoubleClick,
//   };
// };

// export const standardBeforeEach = () => {
//   jest.clearAllMocks();

//   mockLatestGridProps = null;
//   mockLatestConfirmModalProps = null;
//   mockLatestErrorModalProps = null;

//   mockGetCurrentViewRecords.mockReturnValue([]);
//   mockGetBatchChanges.mockReturnValue({
//     changedRecords: [],
//     addedRecords: [],
//     deletedRecords: [],
//   });
//   mockGetVisibleColumns.mockReturnValue(defaultVisibleColumns());
// };

// /***********
//  * Helpers *
//  ***********/

// /**
//  * Lets the component's setTimeout(..., 0) callbacks run inside act().
//  * validateAndSave() and beginToolbarEdit() both defer work this way, so
//  * batchSave / editCell / the error modal only happen after this resolves.
//  */
// export const flushTimeouts = async (): Promise<void> => {
//   await act(async () => {
//     await new Promise((resolve) => setTimeout(resolve, 0));
//   });
// };

// export const clickToolbarButton = async (
//   user: ReturnType<typeof userEvent.setup>,
//   name: ToolbarButtonName,
// ): Promise<void> => {
//   await user.click(screen.getByRole("button", { name }));
//   await flushTimeouts();
// };

// export const clickEdit = (user: ReturnType<typeof userEvent.setup>) =>
//   clickToolbarButton(user, "Edit");

// export const clickSave = (user: ReturnType<typeof userEvent.setup>) =>
//   clickToolbarButton(user, "Save");

// export const clickSaveAndClose = (user: ReturnType<typeof userEvent.setup>) =>
//   clickToolbarButton(user, "Save and Close");

// export const openCancelConfirmation = (
//   user: ReturnType<typeof userEvent.setup>,
// ) => clickToolbarButton(user, "Cancel");

// export const clickBack = (user: ReturnType<typeof userEvent.setup>) =>
//   clickToolbarButton(user, "Back");

// export const clickConfirmYes = async (
//   user: ReturnType<typeof userEvent.setup>,
// ): Promise<void> => {
//   await user.click(screen.getByRole("button", { name: "Yes" }));
// };

// export const clickConfirmNo = async (
//   user: ReturnType<typeof userEvent.setup>,
// ): Promise<void> => {
//   await user.click(screen.getByRole("button", { name: "No" }));
// };

// export const closeErrorModal = async (
//   user: ReturnType<typeof userEvent.setup>,
// ): Promise<void> => {
//   await user.click(screen.getByRole("button", { name: "Close Error" }));
// };

// /**
//  * Clicks Save, confirms validation passed (batchSave was called),
//  * then fires the batchsave actionComplete the real grid would raise.
//  */
// export const performSave = async (
//   user: ReturnType<typeof userEvent.setup>,
//   triggerActionComplete: (requestType: string) => Promise<void>,
// ): Promise<void> => {
//   await clickSave(user);
//   expect(mockBatchSave).toHaveBeenCalled();
//   await triggerActionComplete("batchsave");
// };

// export const performSaveAndClose = async (
//   user: ReturnType<typeof userEvent.setup>,
//   triggerActionComplete: (requestType: string) => Promise<void>,
// ): Promise<void> => {
//   await clickSaveAndClose(user);
//   expect(mockBatchSave).toHaveBeenCalled();
//   await triggerActionComplete("batchsave");
// };

// export const getCurrentRowsFromHandle = (
//   gridHandleRef: React.RefObject<PrizeFundGridHandle | null>,
// ): prizeFundEntryRow[] => {
//   return gridHandleRef.current?.getCurrentRows() ?? [];
// };

// export const setCurrentRows = (
//   rows: prizeFundEntryRow[],
// ): prizeFundEntryRow[] => {
//   mockGetCurrentViewRecords.mockReturnValue(rows);
//   return rows;
// };

// export const setBatchChanges = ({
//   changedRecords = [],
//   addedRecords = [],
//   deletedRecords = [],
// }: {
//   changedRecords?: prizeFundEntryRow[];
//   addedRecords?: prizeFundEntryRow[];
//   deletedRecords?: prizeFundEntryRow[];
// }) => {
//   mockGetBatchChanges.mockReturnValue({
//     changedRecords,
//     addedRecords,
//     deletedRecords,
//   });
// };
