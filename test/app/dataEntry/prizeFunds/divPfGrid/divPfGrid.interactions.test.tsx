"use client";

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DivPrizeFundGrid from "@/app/dataEntry/prizeFunds/divPfGrid/divPfGrid";
import type { divPfEntryRow } from "@/lib/types/types";
import { useDispatch, useSelector } from "react-redux";
import { saveDivPfs } from "@/redux/features/divPfs/divPfsSlice";
import { extractDivPfs } from "@/lib/db/divPfs/dbDivPfs";

jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
  getDivPfsSaveStatus: jest.fn(),
  saveDivPfs: jest.fn(),
}));

jest.mock("@/lib/db/divPfs/dbDivPfs", () => ({
  extractDivPfs: jest.fn(),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? <div data-testid="wait-modal">{message}</div> : null,
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
      <div data-testid="error-modal">
        <div>{title}</div>
        <div>{message}</div>
        <button type="button" onClick={onCancel}>
          Error OK
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  cancelConfTitle: "Confirm Cancel",
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
      <div data-testid="confirm-modal">
        <div>{title}</div>
        <div>{message}</div>
        <button type="button" onClick={onConfirm}>
          Yes
        </button>
        <button type="button" onClick={onCancel}>
          No
        </button>
      </div>
    ) : null,
}));

let mockCurrentViewRecords: divPfEntryRow[] = [];
let mockChangedRecords: Partial<divPfEntryRow>[] = [];

// const gridApi = {
//   editModule: {
//     saveCell: jest.fn(),
//     batchSave: jest.fn(),
//     batchCancel: jest.fn(),
//   },
//   clearSelection: jest.fn(),
//   getCurrentViewRecords: jest.fn(),
//   getBatchChanges: jest.fn(),
//   getVisibleColumns: jest.fn(),
//   selectCell: jest.fn(),
//   editCell: jest.fn(),
//   setCellValue: jest.fn(),
//   toolbarModule: {
//     enableItems: jest.fn(),
//   },
// };

let latestGridProps: Record<string, any> = {};

const gridApi = {
  editModule: {
    saveCell: jest.fn(),
    batchSave: jest.fn(),
    batchCancel: jest.fn(),
  },
  clearSelection: jest.fn(),
  selectCell: jest.fn(),
  editCell: jest.fn(),
  setCellValue: jest.fn(),
  getVisibleColumns: jest.fn(() => [
    { field: "amount" },
  ]),
  getCurrentViewRecords: jest.fn(() => mockCurrentViewRecords),
  getBatchChanges: jest.fn(() => ({
    changedRecords: mockChangedRecords,
  })),
  toolbarModule: {
    enableItems: jest.fn(),
  },
};

jest.mock("@syncfusion/ej2-react-grids", () => {
  const React = require("react");

  function MockGridComponent(
    props: Record<string, any> & { children: React.ReactNode },
    ref: React.ForwardedRef<any>,
  ) {
    latestGridProps = props;

    React.useImperativeHandle(ref, () => gridApi);

    return (
      <div data-testid="div-pf-grid">
        <button
          type="button"
          onClick={() => props.toolbarClick?.({ item: { id: "edit" } })}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => props.toolbarClick?.({ item: { id: "save" } })}
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => props.toolbarClick?.({ item: { id: "done" } })}
        >
          Save and Close
        </button>

        <button
          type="button"
          onClick={() => props.toolbarClick?.({ item: { id: "undo_all" } })}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => props.toolbarClick?.({ item: { id: "back" } })}
        >
          Back
        </button>

        <button
          type="button"
          onClick={() =>
            props.cellSaved?.({
              rowData: {
                id: "dpf_00000000000000000000000000000001",
                div_id: "div_00000000000000000000000000000001",
                position: 1,
                amount: 100,
                percentage: 0.5,
              },
              columnName: "amount",
              value: 120,
            })
          }
        >
          Fire Cell Saved
        </button>

        <button
          type="button"
          onClick={() =>
            props.recordClick?.({
              rowIndex: 1,
            })
          }
        >
          Fire Record Click
        </button>

        <button
          type="button"
          onClick={() =>
            props.actionComplete?.({
              requestType: "batchsave",
            })
          }
        >
          Fire Batch Save Complete
        </button>

        {props.children}
      </div>
    );
  }

  const ForwardedMockGridComponent = React.forwardRef(MockGridComponent);
  ForwardedMockGridComponent.displayName = "MockGridComponent";

  return {
    GridComponent: ForwardedMockGridComponent,

    ColumnsDirective: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),

    ColumnDirective: () => null,

    AggregatesDirective: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),

    AggregateDirective: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),

    AggregateColumnsDirective: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <div>{children}</div>,

    AggregateColumnDirective: () => null,

    Inject: () => null,

    Aggregate: jest.fn(),
    Edit: jest.fn(),
    Toolbar: jest.fn(),
  };
});

const mockUseDispatch = jest.mocked(useDispatch);
const mockUseSelector = jest.mocked(useSelector);
const mockSaveDivPfs = jest.mocked(saveDivPfs);
const mockExtractDivPfs = jest.mocked(extractDivPfs);

const rows: divPfEntryRow[] = [
  {
    id: "dpf_00000000000000000000000000000001",
    div_id: "div_00000000000000000000000000000001",
    position: 1,
    amount: 100,
    percentage: 0.5,
  },
  {
    id: "dpf_00000000000000000000000000000002",
    div_id: "div_00000000000000000000000000000001",
    position: 2,
    amount: 100,
    percentage: 0.5,
  },
];

const setupComponent = (overrides?: Partial<React.ComponentProps<typeof DivPrizeFundGrid>>) => {
  const props: React.ComponentProps<typeof DivPrizeFundGrid> = {
    rows,
    setRows: jest.fn(),
    totalPrizeFund: 200,
    enableEditing: true,
    gridDataWasChanged: false,
    onGridDataChanged: jest.fn(),
    onGridDataReset: jest.fn(),
    onNavigateAfterSave: jest.fn(),
    onBack: jest.fn(),
    onSaveComplete: jest.fn(),
    ...overrides,
  };

  render(<DivPrizeFundGrid {...props} />);

  return props;
};

describe("DivPrizeFundGrid interactions", () => {
  const dispatch = jest.fn();

  // beforeEach(() => {
  //   jest.clearAllMocks();
  //   jest.useFakeTimers();

  //   latestGridProps = {};

  //   gridApi.getCurrentViewRecords.mockReturnValue(rows);
  //   gridApi.getBatchChanges.mockReturnValue({ changedRecords: [] });
  //   gridApi.getVisibleColumns.mockReturnValue([
  //     { field: "position" },
  //     { field: "amount" },
  //     { field: "percentage" },
  //   ]);

  //   dispatch.mockReturnValue({
  //     unwrap: jest.fn().mockResolvedValue([]),
  //   });

  //   mockUseDispatch.mockReturnValue(dispatch);
  //   mockUseSelector.mockReturnValue("idle");

  //   mockSaveDivPfs.mockReturnValue("saveDivPfsThunk" as never);
  //   mockExtractDivPfs.mockReturnValue([
  //     {
  //       id: "dpf_00000000000000000000000000000001",
  //       div_id: "div_00000000000000000000000000000001",
  //       position: 1,
  //       amount: 100,
  //     },
  //     {
  //       id: "dpf_00000000000000000000000000000002",
  //       div_id: "div_00000000000000000000000000000001",
  //       position: 2,
  //       amount: 100,
  //     },
  //   ]);
  // });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    latestGridProps = {};

    mockCurrentViewRecords = rows;
    mockChangedRecords = [];

    gridApi.getCurrentViewRecords.mockReturnValue(mockCurrentViewRecords);
    gridApi.getBatchChanges.mockReturnValue({
      changedRecords: mockChangedRecords,
    });

    gridApi.getVisibleColumns.mockReturnValue([
      { field: "position" },
      { field: "amount" },
      { field: "percentage" },
    ]);

    dispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue([]),
    });

    mockUseDispatch.mockReturnValue(dispatch);
    mockUseSelector.mockReturnValue("idle");

    mockSaveDivPfs.mockReturnValue("saveDivPfsThunk" as never);

    mockExtractDivPfs.mockReturnValue([
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: "div_00000000000000000000000000000001",
        position: 1,
        amount: 100,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        div_id: "div_00000000000000000000000000000001",
        position: 2,
        amount: 100,
      },
    ]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("updates toolbar save/cancel buttons based on gridDataWasChanged", () => {
    setupComponent({ gridDataWasChanged: true });

    expect(gridApi.toolbarModule.enableItems).toHaveBeenCalledWith(
      ["save", "done", "undo_all"],
      true,
    );
  });

  it("calls onBack when Back toolbar item is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const componentProps = setupComponent();    

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(componentProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("starts editing the amount cell when Edit toolbar item is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    setupComponent();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(gridApi.selectCell).toHaveBeenCalledWith({
      rowIndex: 0,
      cellIndex: 1,
    });

    jest.runOnlyPendingTimers();

    expect(gridApi.editCell).toHaveBeenCalledWith(0, "amount");
  });

  it("uses the last clicked row when Edit toolbar item is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    setupComponent();

    await user.click(screen.getByRole("button", { name: "Fire Record Click" }));
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(gridApi.selectCell).toHaveBeenCalledWith({
      rowIndex: 1,
      cellIndex: 1,
    });

    jest.runOnlyPendingTimers();

    expect(gridApi.editCell).toHaveBeenCalledWith(1, "amount");
  });

  it("updates percentage and marks grid changed when a cell is saved", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const props = setupComponent();

    await user.click(screen.getByRole("button", { name: "Fire Cell Saved" }));

    expect(gridApi.setCellValue).toHaveBeenCalledWith(
      "dpf_00000000000000000000000000000001",
      "percentage",
      0.6,
    );
    expect(props.onGridDataChanged).toHaveBeenCalledTimes(1);
  });

  it("shows validation error when saving and amount total does not match totalPrizeFund", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    gridApi.getCurrentViewRecords.mockReturnValue(rows);
    gridApi.getBatchChanges.mockReturnValue({
      changedRecords: [
        {
          ...rows[0],
          amount: 50,
        },
      ],
    });

    setupComponent({ totalPrizeFund: 200 });

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(gridApi.editModule.saveCell).toHaveBeenCalledTimes(1);

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(screen.getByTestId("error-modal")).toBeInTheDocument();
    });
    expect(screen.getByText("Validate Error")).toBeInTheDocument();
    expect(
      screen.getByText(
        'The sum of the "Amount" columns does not match the "Total Prize Fund" amount.',
      ),
    ).toBeInTheDocument();

    expect(gridApi.editModule.batchSave).not.toHaveBeenCalled();
  });

  it("shows an error when a lower finishing position receives more prize money", async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });

    gridApi.getCurrentViewRecords.mockReturnValue([
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: "div_00000000000000000000000000000001",
        position: 1,
        amount: 100,
        percentage: 0.4,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        div_id: "div_00000000000000000000000000000001",
        position: 2,
        amount: 150,
        percentage: 0.6,
      },
    ]);

    gridApi.getBatchChanges.mockReturnValue({
      changedRecords: [],
    });

    setupComponent({
      totalPrizeFund: 250,
      gridDataWasChanged: true,
    });

    await user.click(screen.getByRole("button", { name: "Save" }));
    
    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(
        screen.getByText(
          "A lower finishing position cannot receive more prize money than a higher finishing position.",
        ),
      ).toBeInTheDocument();
    });  

    expect(gridApi.editModule.batchSave).not.toHaveBeenCalled();
    expect(mockSaveDivPfs).not.toHaveBeenCalled();
  });  

  it("batch saves when amount total matches totalPrizeFund", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    setupComponent({ totalPrizeFund: 200 });

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(gridApi.editModule.saveCell).toHaveBeenCalledTimes(1);

    jest.runOnlyPendingTimers();

    expect(gridApi.editModule.batchSave).toHaveBeenCalledTimes(1);
  });

  it("dispatches saveDivPfs and updates rows after batch save completes", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const setRows = jest.fn();
    const onSaveComplete = jest.fn();

    setupComponent({
      setRows,
      onSaveComplete,
      totalPrizeFund: 200,
    });

    await user.click(screen.getByRole("button", { name: "Save" }));

    jest.runOnlyPendingTimers();

    await user.click(
      screen.getByRole("button", { name: "Fire Batch Save Complete" }),
    );

    await waitFor(() => {
      expect(mockExtractDivPfs).toHaveBeenCalledWith(rows);
    });

    expect(mockSaveDivPfs).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith("saveDivPfsThunk");

    await waitFor(() => {
      expect(setRows).toHaveBeenCalledWith(rows);
    });

    expect(onSaveComplete).toHaveBeenCalledWith(rows);
  });

  it("save and close dispatches saveDivPfs and calls onNavigateAfterSave", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const setRows = jest.fn();
    const onSaveComplete = jest.fn();
    const onNavigateAfterSave = jest.fn();

    setupComponent({
      setRows,
      onSaveComplete,
      onNavigateAfterSave,
      totalPrizeFund: 200,
    });

    await user.click(screen.getByRole("button", { name: "Save and Close" }));

    jest.runOnlyPendingTimers();

    await user.click(
      screen.getByRole("button", { name: "Fire Batch Save Complete" }),
    );

    await waitFor(() => {
      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
    });

    expect(setRows).not.toHaveBeenCalled();

    // Current component calls onSaveComplete twice for Save and Close.
    expect(onSaveComplete).toHaveBeenCalledTimes(2);
  });

  it("shows cancel confirmation when Cancel toolbar item is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    setupComponent();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    expect(screen.getByText("Confirm Cancel")).toBeInTheDocument();
    expect(screen.getByText("Do you want to cancel edits?")).toBeInTheDocument();
  });

  it("cancels edits and resets grid data when confirm Yes is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const props = setupComponent();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Yes" }));

    expect(gridApi.editModule.batchCancel).toHaveBeenCalledTimes(1);
    expect(gridApi.clearSelection).toHaveBeenCalledTimes(1);
    expect(props.onGridDataReset).toHaveBeenCalledTimes(1);
  });

  it("does not cancel edits when confirm No is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const props = setupComponent();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "No" }));

    expect(gridApi.editModule.batchCancel).not.toHaveBeenCalled();
    expect(gridApi.clearSelection).not.toHaveBeenCalled();
    expect(props.onGridDataReset).not.toHaveBeenCalled();
  });

  it("shows wait modal while saving", () => {
    mockUseSelector.mockReturnValue("saving");

    setupComponent();

    expect(screen.getByTestId("wait-modal")).toHaveTextContent("Saving...");
  });

  it("passes expected edit settings to the grid", () => {
    setupComponent({ enableEditing: false });

    expect(latestGridProps.editSettings).toEqual({
      allowEditing: false,
      allowAdding: false,
      allowDeleting: false,
      mode: "Batch",
      showConfirmDialog: false,
      showDeleteConfirmDialog: false,
    });
  });
});