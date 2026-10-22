/*
 * Integration test: the user clicks [Cancel] in the grandchild PrizeFundGrid.
 *
 *   page.tsx -> ElimPrizeFundGrid -> PrizeFundGrid -> (Syncfusion GridComponent)
 *
 * Unlike the other elimPfPage.*.test.tsx files, this file does NOT import
 * elimPfPage.testSetup.tsx, because that file mocks ElimPrizeFundGrid.
 * Here the real ElimPrizeFundGrid and PrizeFundGrid render; only the
 * Syncfusion GridComponent (and other leaf dependencies) are mocked.
 */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import type {
  elimPfType,
  prizeFundEntryRow,
  tmntFullType,
} from "@/lib/types/types";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { populatePfRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows";
import ElimPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/elim/[elimId]/page";
import {
  tmntId as mockRouteTmntId,
  elimId1,
  mockElimPfs,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

/*******************************************
 * Shared state for the jest.mock factories *
 * (names start with "mock" for babel-jest) *
 *******************************************/

/** Title PrizeFundGrid gives its Cancel confirmation (mocked export). */
const mockCancelConfTitle = "Confirm Cancel";

const mockBatchCancel = jest.fn();
const mockClearSelection = jest.fn();
let mockGridMounts = 0;

type MockRootState = {
  elimPfs: {
    elimPfs: elimPfType[];
    requestedTmntId: string;
    loadStatus: string;
    saveStatus: string;
    error: string | null;
  };
  tmntFullData: {
    tmntFullData: tmntFullType | null;
    loadStatus: string;
    error: string | null;
  };
};

/****************
 * Module mocks *
 ****************/

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  __esModule: true,
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/redux/features/elimPfs/elimPfsSlice", () => ({
  __esModule: true,
  fetchElimPfs: jest.fn((tmntId: string) => ({
    type: "elimPfs/fetchElimPfs",
    payload: tmntId,
  })),
  saveElimPfs: jest.fn(),
  selectElimPfs: (s: MockRootState) => s.elimPfs.elimPfs,
  getElimPfsRequestedTmntId: (s: MockRootState) => s.elimPfs.requestedTmntId,
  getElimPfsLoadStatus: (s: MockRootState) => s.elimPfs.loadStatus,
  getElimPfsSaveStatus: (s: MockRootState) => s.elimPfs.saveStatus,
  getElimPfsError: (s: MockRootState) => s.elimPfs.error,
}));

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  fetchTmntFullData: jest.fn((tmntId: string) => ({
    type: "tmntFullData/fetchTmntFullData",
    payload: tmntId,
  })),
  selectTmntFullData: (s: MockRootState) => s.tmntFullData.tmntFullData,
  getTmntFullDataLoadStatus: (s: MockRootState) => s.tmntFullData.loadStatus,
  getTmntFullDataError: (s: MockRootState) => s.tmntFullData.error,
}));

jest.mock("@/hooks/useUnsavedChangesGuard", () => ({
  __esModule: true,
  useUnsavedChangesGuard: jest.fn(),
}));

jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows", () => ({
  __esModule: true,
  populatePfRows: jest.fn(),
}));

/*
 * Save is not exercised here; these keep ElimPrizeFundGrid's imports
 * away from the database layer.
 */
jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes", () => ({
  __esModule: true,
  elimPfsToPrizeFunds: jest.fn(() => []),
  pfEntryRowsToElimPfEntryRows: jest.fn(() => []),
}));

jest.mock("@/lib/db/elimPfs/dbElimPfs", () => ({
  __esModule: true,
  extractElimPfs: jest.fn(() => []),
}));

jest.mock("@/lib/uuid", () => {
  let counter = 0;
  return {
    __esModule: true,
    btDbUuid: jest.fn(
      (prefix: string) =>
        `${prefix}_${String(++counter).padStart(32, "0")}`,
    ),
  };
});

/* PrizeFundGrid leaf dependencies that touch Syncfusion. */
jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("@/lib/syncfusionTools", () => ({
  __esModule: true,
  sfRowHeight: 30,
}));

jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns", () => ({
  __esModule: true,
  createPfColumns: () => [],
  pfEntryAmountColName: "amount",
  pfEntryIdColName: "id",
  pfEntryPercentColName: "percentage",
}));

jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/sfPfAggregates", () => ({
  __esModule: true,
  createPfTotalAggregates: () => [],
  createPfDiffAggregates: () => [],
}));

/**
 * Mock Syncfusion GridComponent.
 *
 * - Renders each toolbar item as a button with id "<gridId>_<itemId>",
 *   so the Cancel button matches page.tsx's '#elimPfGrid [id$="undo_all"]'.
 * - toolbarModule.enableItems() drives aria-disabled; a disabled item
 *   does not fire toolbarClick (as in Syncfusion).
 * - Exposes the instance methods PrizeFundGrid calls through gridRef.
 * - "Simulate Cell Edit" fires cellSaved like a completed batch cell edit.
 */
jest.mock("@syncfusion/ej2-react-grids", () => {
  const React = require("react");

  type ToolbarItem = { id: string; text: string };

  const GridComponent = React.forwardRef(
    (
      props: {
        id: string;
        dataSource: prizeFundEntryRow[];
        toolbar: ToolbarItem[];
        toolbarClick: (args: { item: ToolbarItem }) => void;
        cellSaved: (args: {
          rowData: prizeFundEntryRow;
          columnName: string;
          value: unknown;
        }) => void;
      },
      ref: React.Ref<unknown>,
    ) => {
      const [enabled, setEnabled] = React.useState({});

      React.useEffect(() => {
        mockGridMounts++;
      }, []);

      React.useImperativeHandle(
        ref,
        () => ({
          editModule: {
            batchCancel: mockBatchCancel,
            saveCell: jest.fn(),
            batchSave: jest.fn(),
          },
          clearSelection: mockClearSelection,
          toolbarModule: {
            enableItems: (ids: string[], on: boolean) =>
              setEnabled((prev: Record<string, boolean>) => ({
                ...prev,
                ...Object.fromEntries(ids.map((id) => [id, on])),
              })),
          },
          getCurrentViewRecords: () => props.dataSource,
          getBatchChanges: () => ({
            changedRecords: [],
            addedRecords: [],
            deletedRecords: [],
          }),
          refresh: jest.fn(),
          getVisibleColumns: () => [],
          selectCell: jest.fn(),
          editCell: jest.fn(),
          setCellValue: jest.fn(),
        }),
        [props.dataSource],
      );

      return (
        <div id={props.id} data-testid="sf-grid">
          <div data-testid="sf-grid-row-count">{props.dataSource.length}</div>

          {props.toolbar.map((item) => {
            const isEnabled =
              (enabled as Record<string, boolean>)[item.id] !== false;
            return (
              <button
                key={item.id}
                type="button"
                id={`${props.id}_${item.id}`}
                aria-disabled={isEnabled ? "false" : "true"}
                onClick={() => {
                  if (isEnabled) props.toolbarClick({ item });
                }}
              >
                {item.text}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const row = props.dataSource[0];
              props.cellSaved({
                rowData: row,
                columnName: "amount",
                value: (row?.amount ?? 0) + 1,
              });
            }}
          >
            Simulate Cell Edit
          </button>
        </div>
      );
    },
  );
  GridComponent.displayName = "MockGridComponent";

  const Nothing = () => null;

  return {
    __esModule: true,
    GridComponent,
    ColumnsDirective: Nothing,
    ColumnDirective: Nothing,
    AggregatesDirective: Nothing,
    AggregateDirective: Nothing,
    AggregateColumnsDirective: Nothing,
    AggregateColumnDirective: Nothing,
    Inject: Nothing,
    Aggregate: {},
    Edit: {},
    Toolbar: {},
  };
});

/* Modals: both the page and PrizeFundGrid render ModalConfirm. */
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  /*
   * A literal, not mockCancelConfTitle: this factory runs while the
   * hoisted imports load, before that const is initialized.
   */
  cancelConfTitle: "Confirm Cancel",
  default: (props: {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
  }) =>
    props.show ? (
      <div role="dialog" aria-label={props.title}>
        <div>{props.message}</div>
        <button type="button" onClick={() => void props.onConfirm()}>
          Yes
        </button>
        <button type="button" onClick={props.onCancel}>
          No
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? <div role="status">{message}</div> : null,
}));

jest.mock("@/components/currency/eaCurrencyInput", () => ({
  __esModule: true,
  default: ({
    id,
    name,
    value,
    disabled,
    onChange,
    onBlur,
  }: {
    id: string;
    name: string;
    value: string | number;
    disabled?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }) => (
    <input
      type="text"
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      onBlur={onBlur}
      readOnly={!onChange}
    />
  ),
}));

/***********
 * Helpers *
 ***********/

const mockPush = jest.fn();
const mockConfirm = jest.fn();

const getInputs = () => ({
  players: screen.getByLabelText("Players") as HTMLInputElement,
  cashers: screen.getByLabelText("Cashers") as HTMLInputElement,
  expenses: screen.getByLabelText("Expenses") as HTMLInputElement,
  prizeFund: screen.getByLabelText("Prize Fund") as HTMLInputElement,
});

const toolbarButton = (name: string) =>
  screen.getByRole("button", { name });

const gridCancelButton = () => toolbarButton("Cancel");

const rowCount = () =>
  Number(screen.getByTestId("sf-grid-row-count").textContent);

const findGridCancelDialog = () =>
  screen.findByRole("dialog", { name: mockCancelConfTitle });

const queryGridCancelDialog = () =>
  screen.queryByRole("dialog", { name: mockCancelConfTitle });

const queryRemoveCashersDialog = () =>
  screen.queryByRole("dialog", { name: "Remove Cashers" });

const lastGuardValue = (): boolean => {
  const calls = jest.mocked(useUnsavedChangesGuard).mock.calls;
  return calls[calls.length - 1][0] as boolean;
};

/**
 * Renders the page with the real ElimPrizeFundGrid and PrizeFundGrid.
 * Returns the values shown on load so tests can check Cancel restores them.
 */
const renderPage = () => {
  const user = userEvent.setup();

  const elimPfs = cloneDeep(mockElimPfs);
  const tmntData = cloneDeep(mockTmntFullData);
  const currentElimPfs = elimPfs.filter((pf) => pf.elim_id === elimId1);

  const loadedRows: prizeFundEntryRow[] = currentElimPfs.map((pf) => ({
    id: pf.id,
    parent_id: pf.elim_id,
    position: pf.position ?? 0,
    amount: pf.amount ?? 0,
    percentage: 0,
  }));

  const state: MockRootState = {
    elimPfs: {
      elimPfs,
      requestedTmntId: mockRouteTmntId,
      loadStatus: "succeeded",
      saveStatus: "idle",
      error: null,
    },
    tmntFullData: {
      tmntFullData: tmntData,
      loadStatus: "succeeded",
      error: null,
    },
  };

  jest
    .mocked(useParams)
    .mockReturnValue({ tmntId: mockRouteTmntId, elimId: elimId1 });
  jest.mocked(useRouter).mockReturnValue({
    push: mockPush,
  } as unknown as ReturnType<typeof useRouter>);
  jest.mocked(useDispatch).mockReturnValue(jest.fn() as never);
  jest
    .mocked(useSelector)
    .mockImplementation((selector) =>
      (selector as unknown as (s: MockRootState) => unknown)(state),
    );
  jest.mocked(populatePfRows).mockReturnValue(loadedRows);

  render(<ElimPrizeFundEntry />);

  const { players, cashers, expenses, prizeFund } = getInputs();

  return {
    user,
    loadedRows,
    numPlayers: Number(players.value),
    loadedCashers: Number(cashers.value),
    loadedExpenses: expenses.value,
    loadedPrizeFund: prizeFund.value,
  };
};

/** An Expenses value that differs from the loaded one. */
const otherExpenses = (loaded: string): string =>
  loaded === "1.00" ? "2.00" : "1.00";

/** Replaces Expenses and applies it with Tab (focus moves to grid "Edit"). */
const enterExpenses = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string,
) => {
  const { expenses } = getInputs();
  await user.clear(expenses);
  await user.type(expenses, value);
  await user.tab();
};

/** Clicks the grid's Cancel toolbar item, then Yes or No in its dialog. */
const cancelGridEdits = async (
  user: ReturnType<typeof userEvent.setup>,
  answer: "Yes" | "No",
) => {
  await user.click(gridCancelButton());
  const dialog = await findGridCancelDialog();
  await user.click(within(dialog).getByRole("button", { name: answer }));
};

/*********
 * Tests *
 *********/

describe("Elim Prize Fund page: [Cancel] in the grandchild PrizeFundGrid", () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGridMounts = 0;
    confirmSpy = jest
      .spyOn(window, "confirm")
      .mockImplementation(mockConfirm);
    mockConfirm.mockReturnValue(true);
  });

  afterEach(() => {
    /*
     * Restore only the window.confirm spy. restoreAllMocks() could also
     * wipe the jest.fn() implementations in the jest.mock() factories.
     */
    confirmSpy.mockRestore();
  });

  it("renders the real grid with a disabled Cancel when nothing has changed", async () => {
    const { user } = renderPage();

    const cancel = gridCancelButton();
    expect(cancel).toHaveAttribute("id", "elimPfGrid_undo_all");
    expect(cancel).toHaveAttribute("aria-disabled", "true");

    await user.click(cancel);

    expect(queryGridCancelDialog()).not.toBeInTheDocument();
    expect(mockBatchCancel).not.toHaveBeenCalled();
  });

  it("enables Cancel once the page has unsaved edits", async () => {
    const { user, loadedExpenses } = renderPage();

    await enterExpenses(user, otherExpenses(loadedExpenses));

    expect(gridCancelButton()).toHaveAttribute("aria-disabled", "false");
  });

  it("asks for confirmation before cancelling", async () => {
    const { user, loadedExpenses } = renderPage();

    await enterExpenses(user, otherExpenses(loadedExpenses));
    await user.click(gridCancelButton());

    const dialog = await findGridCancelDialog();
    expect(
      within(dialog).getByText("Do you want to cancel edits?"),
    ).toBeInTheDocument();
    expect(mockBatchCancel).not.toHaveBeenCalled();
  });

  it("keeps the edits when the user answers No", async () => {
    const { user, loadedExpenses } = renderPage();
    const edited = otherExpenses(loadedExpenses);

    await enterExpenses(user, edited);
    await cancelGridEdits(user, "No");

    expect(queryGridCancelDialog()).not.toBeInTheDocument();
    expect(mockBatchCancel).not.toHaveBeenCalled();
    expect(getInputs().expenses).toHaveValue(edited);
    expect(lastGuardValue()).toBe(true);
    expect(mockGridMounts).toBe(1);
  });

  it("restores Expenses and Prize Fund when the user answers Yes", async () => {
    const { user, loadedExpenses, loadedPrizeFund } = renderPage();

    await enterExpenses(user, otherExpenses(loadedExpenses));
    expect(getInputs().prizeFund).not.toHaveValue(loadedPrizeFund);

    await cancelGridEdits(user, "Yes");

    expect(mockBatchCancel).toHaveBeenCalledTimes(1);
    expect(mockClearSelection).toHaveBeenCalledTimes(1);
    expect(getInputs().expenses).toHaveValue(loadedExpenses);
    expect(getInputs().prizeFund).toHaveValue(loadedPrizeFund);
  });

  it("removes rows added by Cashers and remounts the grid", async () => {
    const { user, loadedCashers, numPlayers } = renderPage();

    // Precondition: room to add a casher.
    expect(numPlayers).toBeGreaterThan(loadedCashers);

    const { cashers } = getInputs();
    await user.clear(cashers);
    await user.type(cashers, String(loadedCashers + 1));
    await user.tab();
    expect(rowCount()).toBe(loadedCashers + 1);

    await cancelGridEdits(user, "Yes");

    expect(rowCount()).toBe(loadedCashers);
    expect(getInputs().cashers).toHaveValue(loadedCashers);
    // page.tsx changes gridKey, so a new grid instance is mounted.
    expect(mockGridMounts).toBe(2);
  });

  it("discards a typed but unapplied Cashers value instead of asking to remove cashers", async () => {
    const { user, loadedCashers } = renderPage();

    // Precondition: a decrease is possible, which would open Remove Cashers.
    expect(loadedCashers).toBeGreaterThan(1);

    const { cashers } = getInputs();
    await user.clear(cashers);
    await user.type(cashers, "1");

    // mousedown on Cancel -> Cashers blur is skipped -> toolbar click.
    await user.click(gridCancelButton());

    expect(queryRemoveCashersDialog()).not.toBeInTheDocument();
    expect(await findGridCancelDialog()).toBeInTheDocument();

    await user.click(
      within(await findGridCancelDialog()).getByRole("button", {
        name: "Yes",
      }),
    );

    expect(getInputs().cashers).toHaveValue(loadedCashers);
    expect(rowCount()).toBe(loadedCashers);
  });

  it("clears grid-only edits through onGridDataReset", async () => {
    const { user } = renderPage();

    await user.click(screen.getByRole("button", { name: "Simulate Cell Edit" }));
    expect(lastGuardValue()).toBe(true);
    expect(gridCancelButton()).toHaveAttribute("aria-disabled", "false");

    await cancelGridEdits(user, "Yes");

    expect(mockBatchCancel).toHaveBeenCalledTimes(1);
    expect(lastGuardValue()).toBe(false);
  });

  it("leaves no unsaved changes: guard off, Cancel disabled, Back does not prompt", async () => {
    const { user, loadedExpenses } = renderPage();

    await enterExpenses(user, otherExpenses(loadedExpenses));
    await cancelGridEdits(user, "Yes");

    expect(lastGuardValue()).toBe(false);
    expect(gridCancelButton()).toHaveAttribute("aria-disabled", "true");

    await user.click(toolbarButton("Back"));

    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      `/dataEntry/runTmnt/${mockRouteTmntId}`,
    );
  });
});