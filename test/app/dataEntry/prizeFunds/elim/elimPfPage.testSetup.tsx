import React from "react";
import { act, render, screen, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import type {
  elimPfType,
  prizeFundEntryRow,
  prizeFundType,
  tmntFullType,
} from "@/lib/types/types";
import type {
  PrizeFundGridHandle,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import type { AppDispatch, RootState } from "@/redux/store";
import { fetchElimPfs } from "@/redux/features/elimPfs/elimPfsSlice";
import { fetchTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { populatePfRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows";
import { elimPfsToPrizeFunds } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
import { btDbUuid } from "@/lib/uuid";
import ElimPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/elim/[elimId]/page";
import {
  tmntId as defaultTmntId,
  elimId1 as defaultElimId,
  mockElimPfs,
  mockElim1PrizeFund,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

/**
 * Minimal Redux state used by the mocked selectors.
 */
type MockRootState = {
  elimPfs: {
    elimPfs: elimPfType[];
    requestedTmntId: string;
    loadStatus: string;
    error: string | null;
  };

  tmntFullData: {
    tmntFullData: tmntFullType | null;
    loadStatus: string;
    error: string | null;
  };
};

/**
 * Props captured from the mocked ElimPrizeFundGrid.
 *
 * Page tests can invoke these callbacks without rendering the generic
 * PrizeFundGrid or Syncfusion grid.
 */
export type MockElimPrizeFundGridProps = {
  rows: prizeFundEntryRow[];

  setRows: React.Dispatch<
    React.SetStateAction<prizeFundEntryRow[]>
  >;

  elimId: string;
  totalPrizeFund: number;
  enableEditing?: boolean;
  gridDataWasChanged: boolean;

  onGridDataChanged: () => void;
  onGridDataReset: () => void;
  onNavigateAfterSave: () => void;
  onBack: () => void;

  /*
   * Called by the real PrizeFundGrid after the user confirms the
   * toolbar Cancel. The page restores the last saved state and
   * remounts the grid (gridKey).
   */
  onCancel: () => void;

  onSaveComplete: (
    savedRows: prizeFundEntryRow[],
  ) => void;
};

/**
 * Props captured from the mocked confirmation modal.
 */
export type MockConfirmModalProps = {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Options accepted by setup().
 *
 * Individual test files can override only the data or status needed
 * for the behavior being tested.
 */
export type SetupOptions = {
  tmntId?: string;
  elimId?: string;

  /*
   * Tournament-level eliminator prize funds. The page filters these
   * to the route elimId.
   *
   * Expenses are not saved; the page recovers them as
   * total fees - sum of this eliminator's prize amounts.
   * To test a specific expenses value, supply elimPfs whose amounts
   * sum to (total fees - expenses).
   */
  elimPfs?: elimPfType[];

  /*
   * Tournament id associated with the elimPfs Redux data.
   *
   * Defaults to the route tournament id. Tests can override
   * this to simulate stale prize-fund data from another tournament.
   */
  elimPfsRequestedTmntId?: string;

  /*
   * Pass null to simulate tournament data that has not been loaded yet.
   */
  tmntData?: tmntFullType | null;

  elimPfsLoadStatus?: string;
  tmntLoadStatus?: string;

  elimPfsError?: string | null;
  tmntError?: string | null;

  prizeFunds?: prizeFundType[];
  populatedRows?: prizeFundEntryRow[];

  confirmLeavePage?: boolean;

  /*
   * Renders the mocked grid's Cancel toolbar button with
   * aria-disabled="true". The page ignores mousedowns and focus moves
   * to a disabled Cancel button.
   */
  gridCancelDisabled?: boolean;

  /*
   * Overrides applied to the cloned tournament data before rendering.
   *
   * elimEntryFees sets the amount of the eliminator's existing
   * ENTRIES / IN money row (the page's total fees).
   *
   * numPlayers keeps only the first N entries for the eliminator.
   * It can reduce, but not increase, the number of players.
   */
  elimEntryFees?: number;
  numPlayers?: number;
};

/**
 * Values the page derives for the current eliminator.
 *
 * These mirror the calculations in page.tsx so tests can assert
 * against them instead of hard-coding mock-data numbers.
 */
export type ExpectedElimValues = {
  /** ENTRIES / IN money amount for the eliminator. */
  elimEntryFees: number;
  /** Total fees (currently the same as elimEntryFees). */
  totalFees: number;
  /** Sum of the saved prize amounts for the eliminator. */
  savedPrizesTotal: number;
  /** Expenses recovered on load: total fees - saved prizes (0 if none). */
  expectedExpenses: number;
  /** Prize fund on load: total fees - expected expenses. */
  expectedPrizeFund: number;
  /** Number of eliminator entries (Players field). */
  numPlayers: number;
  /** Cashers on load: number of saved prize funds for the eliminator. */
  expectedCashers: number;
  /** Largest casher count the page accepts (1 when players <= 1). */
  maxCashers: number;
};

/******************
 * Exported mocks *
 ******************/

// Redux
export const mockDispatch = jest.fn();

// Router
export const mockPush = jest.fn();

// Redux thunks
export const mockFetchElimPfs =
  jest.mocked(fetchElimPfs);

export const mockFetchTmntFullData =
  jest.mocked(fetchTmntFullData);

// Helper functions
export const mockElimPfsToPrizeFunds =
  jest.mocked(elimPfsToPrizeFunds);

export const mockPopulatePfRows =
  jest.mocked(populatePfRows);

// Hooks
export const mockUseUnsavedChangesGuard =
  jest.mocked(useUnsavedChangesGuard);

// Miscellaneous
export const mockBtDbUuid =
  jest.mocked(btDbUuid);

export const mockWindowConfirm =
  jest.fn();

/********************************************************
 * State shared with the jest.mock() factories.          *
 *                                                       *
 * Names start with "mock" so babel-jest's hoisting      *
 * check allows the factories to reference them.         *
 ********************************************************/

let mockLatestGridProps:
  | MockElimPrizeFundGridProps
  | null = null;

let mockLatestConfirmModalProps:
  | MockConfirmModalProps
  | null = null;

/**
 * Represents the rows currently inside the mocked Syncfusion grid.
 *
 * This simulates PrizeFundGrid.getCurrentRows(), which may contain
 * unsaved batch edits that have not been pushed into React state.
 */
let mockCurrentGridRows: prizeFundEntryRow[] = [];

/**
 * Number of times the mocked grid has mounted.
 *
 * The page remounts the grid by changing its key in handleGridCancel().
 */
let mockGridMountCount = 0;

/**
 * Whether the mocked grid's Cancel toolbar button is aria-disabled.
 */
let mockGridCancelDisabled = false;

/**
 * Id of the mocked grid's Cancel toolbar button.
 *
 * page.tsx detects the Cancel button with
 * '#elimPfGrid [id$="undo_all"]'.
 */
export const GRID_CANCEL_BUTTON_ID = "elimPfGrid_undo_all";

/**
 * Returns the most recent props passed to ElimPrizeFundGrid.
 */
export const getLatestGridProps =
  (): MockElimPrizeFundGridProps | null =>
    mockLatestGridProps;

/**
 * Returns the most recent rows passed from the page to the grid.
 */
export const getLatestRows =
  (): prizeFundEntryRow[] =>
    mockLatestGridProps?.rows ?? [];

/**
 * Replaces the rows stored inside the mocked Syncfusion grid.
 *
 * Use this helper to simulate unsaved grid edits.
 */
export const setCurrentGridRows = (
  rows: prizeFundEntryRow[],
): void => {
  mockCurrentGridRows = rows.map((row) => ({
    ...row,
  }));
};

/**
 * Returns a copy of the rows currently stored inside the mocked grid.
 */
export const getCurrentGridRows =
  (): prizeFundEntryRow[] =>
    mockCurrentGridRows.map((row) => ({
      ...row,
    }));

/**
 * Returns the most recent confirmation-modal props.
 */
export const getLatestConfirmModalProps =
  (): MockConfirmModalProps | null =>
    mockLatestConfirmModalProps;

/**
 * Returns how many times the mocked grid has mounted.
 */
export const getGridMountCount = (): number =>
  mockGridMountCount;

/**
 * Sets whether the mocked grid's Cancel button is aria-disabled.
 * Takes effect on the grid's next render (setup() applies it before
 * rendering).
 */
export const setGridCancelDisabled = (disabled: boolean): void => {
  mockGridCancelDisabled = disabled;
};

/**
 * Error message the page shows when the entered casher count is
 * outside the valid range or not a whole number.
 */
export const cashersRangeError = (maxCashers: number): string =>
  `Cashers must be a whole number between 1 and ${maxCashers}`;

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

jest.mock(
  "@/redux/features/elimPfs/elimPfsSlice",
  () => ({
    __esModule: true,

    fetchElimPfs: jest.fn(
      (tmntId: string) => ({
        type: "elimPfs/fetchElimPfs",
        payload: tmntId,
      }),
    ),

    selectElimPfs: (
      state: MockRootState,
    ): elimPfType[] =>
      state.elimPfs.elimPfs,

    /*
     * Must match the selector name imported by page.tsx.
     */
    getElimPfsRequestedTmntId: (
      state: MockRootState,
    ): string =>
      state.elimPfs.requestedTmntId,

    getElimPfsLoadStatus: (
      state: MockRootState,
    ): string =>
      state.elimPfs.loadStatus,

    getElimPfsError: (
      state: MockRootState,
    ): string | null =>
      state.elimPfs.error,
  }),
);

jest.mock(
  "@/redux/features/tmntFullData/tmntFullDataSlice",
  () => ({
    __esModule: true,

    fetchTmntFullData: jest.fn(
      (tmntId: string) => ({
        type: "tmntFullData/fetchTmntFullData",
        payload: tmntId,
      }),
    ),

    selectTmntFullData: (
      state: MockRootState,
    ): tmntFullType | null =>
      state.tmntFullData.tmntFullData,

    getTmntFullDataLoadStatus: (
      state: MockRootState,
    ): string =>
      state.tmntFullData.loadStatus,

    getTmntFullDataError: (
      state: MockRootState,
    ): string | null =>
      state.tmntFullData.error,
  }),
);

jest.mock(
  "@/hooks/useUnsavedChangesGuard",
  () => ({
    __esModule: true,
    useUnsavedChangesGuard: jest.fn(),
  }),
);

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows",
  () => ({
    __esModule: true,
    populatePfRows: jest.fn(),
  }),
);

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes",
  () => ({
    __esModule: true,
    elimPfsToPrizeFunds: jest.fn(),
  }),
);

jest.mock("@/lib/uuid", () => ({
  __esModule: true,
  btDbUuid: jest.fn(),
}));

/**
 * Mock ElimPrizeFundGrid.
 *
 * The real ElimPrizeFundGrid forwards its ref to PrizeFundGrid.
 * The page uses that ref to call getCurrentRows() before adding or
 * removing cashers.
 *
 * The outer element uses id="elimPfGrid" and the Cancel button uses
 * id="elimPfGrid_undo_all" so the page's Cancel detection
 * ('#elimPfGrid [id$="undo_all"]') works against the mock.
 *
 * Unlike the real grid, the mocked Cancel button calls onCancel
 * directly (no "discard changes?" confirmation, no batchCancel()).
 */
jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/elim/elimPrizeFundGrid",
  () => {
    const React = require("react");

    const MockElimPrizeFundGrid =
      React.forwardRef(
        (
          props: MockElimPrizeFundGridProps,
          ref: React.Ref<PrizeFundGridHandle>,
        ) => {
          mockLatestGridProps = props;

          /*
           * Counts mounts so tests can verify that Cancel remounts
           * the grid (page.tsx changes the grid key).
           */
          React.useEffect(() => {
            mockGridMountCount++;
          }, []);

          /*
           * Keep the mocked grid rows synchronized with rows received
           * from the page.
           *
           * Tests may later call setCurrentGridRows() to simulate
           * unsaved Syncfusion batch edits.
           */
          React.useEffect(() => {
            mockCurrentGridRows =
              props.rows.map((row) => ({
                ...row,
              }));
          }, [props.rows]);

          /*
           * Expose the same public method as the real PrizeFundGrid.
           */
          React.useImperativeHandle(
            ref,
            () => ({
              getCurrentRows: () =>
                mockCurrentGridRows.map((row) => ({
                  ...row,
                })),
            }),
          );

          return (
            <div
              id="elimPfGrid"
              data-testid="mock-elim-prize-fund-grid"
            >
              <div data-testid="mock-grid-row-count">
                {props.rows.length}
              </div>

              <div data-testid="mock-grid-elim-id">
                {props.elimId}
              </div>

              <div data-testid="mock-grid-total-prize-fund">
                {props.totalPrizeFund}
              </div>

              <div data-testid="mock-grid-data-was-changed">
                {String(props.gridDataWasChanged)}
              </div>

              <div data-testid="mock-grid-enable-editing">
                {String(props.enableEditing)}
              </div>

              <button
                type="button"
                onClick={props.onGridDataChanged}
              >
                Grid Changed
              </button>

              <button
                type="button"
                onClick={props.onGridDataReset}
              >
                Grid Reset
              </button>

              <button
                type="button"
                onClick={props.onBack}
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => {
                  props.onSaveComplete(
                    mockCurrentGridRows.map((row) => ({
                      ...row,
                    })),
                  );
                }}
              >
                Save Complete
              </button>

              <button
                type="button"
                onClick={props.onNavigateAfterSave}
              >
                Navigate After Save
              </button>

              {/*
                Keep Cancel LAST. enterExpenses() applies the value with
                Tab; the next tabbable element after Expenses (Prize Fund
                is disabled) is the first grid button. If that were
                Cancel, the blur's relatedTarget would be Cancel and the
                page would discard the typed value.
              */}
              <button
                type="button"
                id="elimPfGrid_undo_all"
                aria-disabled={
                  mockGridCancelDisabled ? "true" : "false"
                }
                onClick={() => {
                  if (mockGridCancelDisabled) return;
                  props.onCancel();
                }}
              >
                Grid Cancel
              </button>
            </div>
          );
        },
      );

    MockElimPrizeFundGrid.displayName =
      "MockElimPrizeFundGrid";

    return {
      __esModule: true,
      default: MockElimPrizeFundGrid,
    };
  },
);

/**
 * Mock WaitModal.
 */
jest.mock(
  "@/components/modal/waitModal",
  () => ({
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

      return (
        <div role="status">
          {message}
        </div>
      );
    },
  }),
);

/**
 * Mock ModalConfirm.
 *
 * The most recent props are captured so tests can inspect or invoke
 * the confirmation callbacks.
 */
jest.mock(
  "@/components/modal/confirmModal",
  () => ({
    __esModule: true,

    default: (
      props: MockConfirmModalProps,
    ) => {
      mockLatestConfirmModalProps = props;

      if (!props.show) {
        return null;
      }

      return (
        <div
          role="dialog"
          aria-label="confirm-modal"
        >
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
  }),
);

/**
 * Mock EaCurrencyInput.
 *
 * The eliminator page has an editable Expenses field, so this mock
 * forwards onChange and onBlur. Inputs without onChange are read-only.
 *
 * Values are rendered as received (no currency formatting), e.g.
 * Entry Fees 100 renders "100" and Expenses "0.00" renders "0.00".
 */
jest.mock(
  "@/components/currency/eaCurrencyInput",
  () => ({
    __esModule: true,

    default: ({
      id,
      name,
      value,
      disabled,
      className,
      onChange,
      onBlur,
    }: {
      id: string;
      name: string;
      value: string | number;
      disabled?: boolean;
      className?: string;
      onChange?: React.ChangeEventHandler<HTMLInputElement>;
      onBlur?: React.FocusEventHandler<HTMLInputElement>;
    }) => (
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        className={className}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={!onChange}
      />
    ),
  }),
);

/*********************************************
 * Tournament data helpers (mirror page.tsx) *
 *********************************************/

type TmntMoney = NonNullable<tmntFullType["moneys"]>[number];

/**
 * Same conditions page.tsx uses to find the eliminator's entry fees.
 */
const isElimEntriesMoney = (
  money: TmntMoney,
  elimId: string,
): boolean =>
  money.descrip === "ENTRIES" &&
  money.flow === "IN" &&
  money.pot_id === null &&
  money.brkt_id === null &&
  money.elim_id === elimId;

/**
 * Returns the eliminator's entry fees exactly as page.tsx computes them.
 * Returns 0 when the money row is missing.
 */
export const getElimEntryFees = (
  tmntData: tmntFullType | null,
  elimId: string,
): number =>
  tmntData?.moneys?.find((money) =>
    isElimEntriesMoney(money, elimId),
  )?.amount ?? 0;

/**
 * Returns the number of players page.tsx shows for an eliminator.
 */
export const getElimNumPlayers = (
  tmntData: tmntFullType | null,
  elimId: string,
): number =>
  tmntData?.elimEntries?.filter(
    (entry) => entry.elim_id === elimId,
  ).length ?? 0;

/**
 * Calculates the values page.tsx derives on load.
 *
 * @param tmntData - Tournament data in the mocked Redux state.
 * @param elimPfs - All tournament eliminator prize funds (unfiltered).
 * @param elimId - Route eliminator id.
 */
export const calcExpectedElimValues = (
  tmntData: tmntFullType | null,
  elimPfs: elimPfType[],
  elimId: string,
): ExpectedElimValues => {
  const currentElimPfs = elimPfs.filter(
    (elimPf) => elimPf.elim_id === elimId,
  );

  const elimEntryFees = getElimEntryFees(tmntData, elimId);
  const totalFees = elimEntryFees;

  const savedPrizesTotal = currentElimPfs.reduce(
    (sum, elimPf) => sum + (elimPf.amount ?? 0),
    0,
  );

  const expectedExpenses =
    currentElimPfs.length > 0
      ? Math.max(
          Math.round((totalFees - savedPrizesTotal) * 100) / 100,
          0,
        )
      : 0;

  const numPlayers = getElimNumPlayers(tmntData, elimId);

  return {
    elimEntryFees,
    totalFees,
    savedPrizesTotal,
    expectedExpenses,
    expectedPrizeFund: totalFees - expectedExpenses,
    numPlayers,
    expectedCashers: currentElimPfs.length,
    maxCashers: numPlayers <= 1 ? 1 : numPlayers,
  };
};

/**
 * Sets the amount of the eliminator's existing ENTRIES money row.
 * Throws if the row does not exist so test-data problems fail loudly.
 */
const setElimEntryFees = (
  tmntData: tmntFullType,
  elimId: string,
  amount: number,
): void => {
  const money = tmntData.moneys?.find((m) =>
    isElimEntriesMoney(m, elimId),
  );

  if (!money) {
    throw new Error(
      `setup(): no ENTRIES money row for elim ${elimId}`,
    );
  }

  money.amount = amount;
};

/**
 * Keeps only the first numPlayers entries for the eliminator.
 * Entries for other eliminators are untouched.
 */
const setElimNumPlayers = (
  tmntData: tmntFullType,
  elimId: string,
  numPlayers: number,
): void => {
  const allEntries = tmntData.elimEntries ?? [];
  const elimEntries = allEntries.filter(
    (entry) => entry.elim_id === elimId,
  );

  if (numPlayers > elimEntries.length) {
    throw new Error(
      `setup(): numPlayers ${numPlayers} exceeds the ` +
        `${elimEntries.length} mock entries for elim ${elimId}`,
    );
  }

  const keep = new Set(elimEntries.slice(0, numPlayers));

  tmntData.elimEntries = allEntries.filter(
    (entry) => entry.elim_id !== elimId || keep.has(entry),
  );
};

/********************
 * Test data makers *
 ********************/

/**
 * Converts mock eliminator prize funds into the generic prizeFundType
 * structure expected by populatePfRows().
 */
export const makePrizeFunds = (
  elimPfs: elimPfType[] = mockElimPfs,
): prizeFundType[] =>
  elimPfs.map((elimPf) => ({
    id: elimPf.id,
    parent_id: elimPf.elim_id,
    position: elimPf.position,
    amount: elimPf.amount,
  }));

/**
 * Creates the generic prize-fund entry rows returned by the mocked
 * populatePfRows().
 *
 * setup() passes the page's derived prize fund as totalPrizeFund.
 * The mockElim1PrizeFund default is kept for direct callers.
 */
export const makeRows = (
  elimPfs: elimPfType[] = mockElimPfs,
  totalPrizeFund: number = mockElim1PrizeFund,
): prizeFundEntryRow[] =>
  elimPfs.map((elimPf) => {
    const amount = elimPf.amount ?? 0;

    return {
      id: elimPf.id,
      parent_id: elimPf.elim_id,
      position: elimPf.position ?? 0,
      amount,
      percentage:
        totalPrizeFund > 0
          ? amount / totalPrizeFund
          : 0,
    };
  });

/************************
 * Common test helpers  *
 ************************/

/**
 * Calls the grid's onGridDataChanged callback.
 */
export const triggerGridDataChanged = (): void => {
  act(() => {
    mockLatestGridProps?.onGridDataChanged();
  });
};

/**
 * Calls the grid's onGridDataReset callback.
 */
export const triggerGridDataReset = (): void => {
  act(() => {
    mockLatestGridProps?.onGridDataReset();
  });
};

/**
 * Calls the grid's onCancel callback directly (as the real grid does
 * after the user confirms Cancel).
 *
 * Does not fire mousedown/blur. To test the Cashers/Expenses blur
 * handling, use clickGridCancel() instead.
 */
export const triggerGridCancel = (): void => {
  act(() => {
    mockLatestGridProps?.onCancel();
  });
};

/**
 * Calls the grid's onSaveComplete callback.
 *
 * Defaults to the rows most recently passed to the grid.
 */
export const triggerSaveComplete = (
  savedRows?: prizeFundEntryRow[],
): void => {
  act(() => {
    const rows =
      savedRows ??
      mockLatestGridProps?.rows ??
      [];

    mockLatestGridProps?.onSaveComplete(
      rows.map((row) => ({ ...row })),
    );
  });
};

/**
 * Calls the grid's onNavigateAfterSave callback.
 */
export const triggerNavigateAfterSave = (): void => {
  act(() => {
    mockLatestGridProps?.onNavigateAfterSave();
  });
};

/**
 * Calls the grid's onBack callback.
 */
export const triggerBack = (): void => {
  act(() => {
    mockLatestGridProps?.onBack();
  });
};

/**
 * Returns the page's form inputs by their labels.
 */
export const getInputs = () => ({
  players: screen.getByLabelText("Players") as HTMLInputElement,
  cashers: screen.getByLabelText("Cashers") as HTMLInputElement,
  entryFees: screen.getByLabelText("Entry Fees") as HTMLInputElement,
  expenses: screen.getByLabelText("Expenses") as HTMLInputElement,
  prizeFund: screen.getByLabelText("Prize Fund") as HTMLInputElement,
});

/**
 * Returns the mocked grid's Cancel toolbar button.
 */
export const getGridCancelButton = (): HTMLButtonElement =>
  screen.getByRole("button", { name: "Grid Cancel" }) as HTMLButtonElement;

/**
 * Clicks the mocked grid's Cancel toolbar button with a real pointer
 * sequence (mousedown -> blur of the focused input -> click).
 *
 * Use this after typing into Cashers or Expenses (without tabbing out)
 * to test that the typed value is discarded instead of applied.
 */
export const clickGridCancel = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(getGridCancelButton());
};

/**
 * Replaces the Cashers value and applies it with blur (Tab) or Enter.
 */
export const enterCashers = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string,
  applyWith: "blur" | "enter" = "blur",
): Promise<void> => {
  const { cashers } = getInputs();

  await user.clear(cashers);
  if (value !== "") {
    await user.type(cashers, value);
  }
  await (applyWith === "enter"
    ? user.keyboard("{Enter}")
    : user.tab());
};

/**
 * Replaces the Expenses value and applies it with blur (Tab).
 * (The Expenses field applies on blur only.)
 */
export const enterExpenses = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string,
): Promise<void> => {
  const { expenses } = getInputs();

  await user.clear(expenses);
  if (value !== "") {
    await user.type(expenses, value);
  }
  await user.tab();
};

/**
 * Confirms the Remove Cashers modal.
 */
export const confirmRemoveCashers = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", { name: "Yes" }),
  );
};

/**
 * Cancels the Remove Cashers modal.
 */
export const cancelRemoveCashers = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", { name: "No" }),
  );
};

/***********
 * setup() *
 ***********/

export const setup = ({
  tmntId = defaultTmntId,
  elimId = defaultElimId,

  elimPfs: suppliedElimPfs = mockElimPfs,
  elimPfsRequestedTmntId: suppliedElimPfsRequestedTmntId,
  tmntData: suppliedTmntData = mockTmntFullData,

  elimPfsLoadStatus = "succeeded",
  tmntLoadStatus = "succeeded",

  elimPfsError = null,
  tmntError = null,

  prizeFunds: suppliedPrizeFunds,
  populatedRows: suppliedPopulatedRows,

  confirmLeavePage = true,
  gridCancelDisabled = false,

  elimEntryFees: suppliedElimEntryFees,
  numPlayers: suppliedNumPlayers,
}: SetupOptions = {}): ExpectedElimValues & {
  user: ReturnType<typeof userEvent.setup>;
  view: RenderResult;

  tmntId: string;
  elimId: string;
  elimPfsRequestedTmntId: string;
  runTmntUrl: string;

  elimPfs: elimPfType[];
  currentElimPfs: elimPfType[];
  tmntData: tmntFullType | null;
  prizeFunds: prizeFundType[];
  populatedRows: prizeFundEntryRow[];

  triggerGridDataChanged: () => void;
  triggerGridDataReset: () => void;
  triggerGridCancel: () => void;
  triggerSaveComplete: (savedRows?: prizeFundEntryRow[]) => void;
  triggerNavigateAfterSave: () => void;
  triggerBack: () => void;
} => {
  const user = userEvent.setup();

  /*
   * Clone all tournament eliminator prize-fund data.
   *
   * fetchElimPfs() loads prize funds for the whole tournament. The page
   * filters these rows to the current elimId.
   */
  const elimPfs = cloneDeep(suppliedElimPfs);

  const elimPfsRequestedTmntId =
    suppliedElimPfsRequestedTmntId ?? tmntId;

  /*
   * Prize funds belonging to the eliminator selected by the route.
   * Mirrors the page's useMemo() filtering.
   */
  const currentElimPfs = elimPfs.filter(
    (elimPf) => elimPf.elim_id === elimId,
  );

  /*
   * Clone the supplied tournament data so the overrides below never
   * mutate the shared mock data.
   */
  const tmntData = cloneDeep(suppliedTmntData);

  if (
    !tmntData &&
    (suppliedElimEntryFees !== undefined ||
      suppliedNumPlayers !== undefined)
  ) {
    throw new Error(
      "setup(): elimEntryFees / numPlayers overrides require tmntData",
    );
  }

  if (tmntData) {
    if (suppliedElimEntryFees !== undefined) {
      setElimEntryFees(tmntData, elimId, suppliedElimEntryFees);
    }
    if (suppliedNumPlayers !== undefined) {
      setElimNumPlayers(tmntData, elimId, suppliedNumPlayers);
    }
  }

  /*
   * Values the page derives on load (entry fees, recovered expenses,
   * prize fund, players, cashers).
   */
  const expected = calcExpectedElimValues(tmntData, elimPfs, elimId);

  /*
   * Build the generic prize-fund data from the current eliminator's
   * prize funds unless the test explicitly supplied converted data.
   */
  const prizeFunds =
    suppliedPrizeFunds ??
    makePrizeFunds(currentElimPfs);

  /*
   * Build the rows returned by populatePfRows() unless supplied.
   * The page passes its derived prize fund (initialPrizeFund) to
   * populatePfRows(), so percentages use that same total.
   */
  const populatedRows =
    suppliedPopulatedRows ??
    makeRows(currentElimPfs, expected.expectedPrizeFund);

  const runTmntUrl = `/dataEntry/runTmnt/${tmntId}`;

  const mockState: MockRootState = {
    elimPfs: {
      elimPfs,
      requestedTmntId: elimPfsRequestedTmntId,
      loadStatus: elimPfsLoadStatus,
      error: elimPfsError,
    },

    tmntFullData: {
      tmntFullData: tmntData,
      loadStatus: tmntLoadStatus,
      error: tmntError,
    },
  };

  jest.mocked(useParams).mockReturnValue({
    tmntId,
    elimId,
  });

  jest.mocked(useRouter).mockReturnValue({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  } as unknown as ReturnType<typeof useRouter>);

  jest.mocked(useDispatch).mockReturnValue(
    mockDispatch as AppDispatch,
  );

  jest.mocked(useSelector).mockImplementation(
    (selector: (state: RootState) => unknown) =>
      selector(mockState as unknown as RootState),
  );

  mockElimPfsToPrizeFunds.mockReturnValue(prizeFunds);
  mockPopulatePfRows.mockReturnValue(populatedRows);

  /*
   * The mocked grid re-syncs from props.rows after each render, so this
   * only matters for tests that inspect getCurrentGridRows() before the
   * page finishes initializing.
   */
  setCurrentGridRows(populatedRows);
  setGridCancelDisabled(gridCancelDisabled);

  mockWindowConfirm.mockReturnValue(confirmLeavePage);

  const view = render(<ElimPrizeFundEntry />);

  return {
    user,
    view,

    tmntId,
    elimId,
    elimPfsRequestedTmntId,
    runTmntUrl,

    elimPfs,
    currentElimPfs,
    tmntData,
    prizeFunds,
    populatedRows,

    ...expected,

    triggerGridDataChanged,
    triggerGridDataReset,
    triggerGridCancel,
    /*
     * Unlike the module-level triggerSaveComplete (which defaults to the
     * grid's latest rows), this one defaults to the populated rows.
     */
    triggerSaveComplete: (
      savedRows: prizeFundEntryRow[] = populatedRows,
    ): void => triggerSaveComplete(savedRows),
    triggerNavigateAfterSave,
    triggerBack,
  };
};

/**
 * Resets all shared mocks and captured props before each test.
 */
export const standardBeforeEach = (): void => {
  jest.restoreAllMocks();
  jest.clearAllMocks();

  mockLatestGridProps = null;
  mockLatestConfirmModalProps = null;
  mockCurrentGridRows = [];
  mockGridMountCount = 0;
  mockGridCancelDisabled = false;

  /*
   * Re-apply the thunk implementations. Depending on the Jest version,
   * restoreAllMocks() can wipe implementations of jest.fn() mocks created
   * in jest.mock() factories, which would make fetchElimPfs() /
   * fetchTmntFullData() return undefined.
   */
  mockFetchElimPfs.mockImplementation(
    (tmntId) =>
      ({
        type: "elimPfs/fetchElimPfs",
        payload: tmntId,
      }) as unknown as ReturnType<typeof fetchElimPfs>,
  );

  mockFetchTmntFullData.mockImplementation(
    (tmntId) =>
      ({
        type: "tmntFullData/fetchTmntFullData",
        payload: tmntId,
      }) as unknown as ReturnType<typeof fetchTmntFullData>,
  );

  jest
    .spyOn(window, "confirm")
    .mockImplementation(mockWindowConfirm);

  mockWindowConfirm.mockReturnValue(true);

  let uuidCounter = 1;

  mockBtDbUuid.mockImplementation(
    (prefix: string): string => {
      const suffix = uuidCounter
        .toString()
        .padStart(32, "0");

      uuidCounter++;

      return `${prefix}_${suffix}`;
    },
  );
};

