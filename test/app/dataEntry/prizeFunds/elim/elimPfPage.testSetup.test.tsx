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
    loadStatus: string;
    error: string | null;
  };

  tmntFullData: {
    tmntFullData: tmntFullType;
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

  totalPrizeFund: number;
  enableEditing?: boolean;
  gridDataWasChanged: boolean;

  onGridDataChanged: () => void;
  onGridDataReset: () => void;
  onNavigateAfterSave: () => void;
  onBack: () => void;

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

  elimPfs?: elimPfType[];
  tmntData?: tmntFullType;

  elimPfsLoadStatus?: string;
  tmntLoadStatus?: string;

  elimPfsError?: string | null;
  tmntError?: string | null;

  prizeFunds?: prizeFundType[];
  populatedRows?: prizeFundEntryRow[];

  confirmLeavePage?: boolean;
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

/****************
 * Latest props *
 ****************/

let latestGridProps:
  | MockElimPrizeFundGridProps
  | null = null;

let latestConfirmModalProps:
  | MockConfirmModalProps
  | null = null;

/**
 * Represents the rows currently inside the mocked Syncfusion grid.
 *
 * This simulates PrizeFundGrid.getCurrentRows(), which may contain
 * unsaved batch edits that have not been pushed into React state.
 */
let currentGridRows: prizeFundEntryRow[] = [];

/**
 * Returns the most recent props passed to ElimPrizeFundGrid.
 */
export const getLatestGridProps =
  (): MockElimPrizeFundGridProps | null =>
    latestGridProps;

/**
 * Returns the most recent rows passed from the page to the grid.
 */
export const getLatestRows =
  (): prizeFundEntryRow[] =>
    latestGridProps?.rows ?? [];

/**
 * Replaces the rows stored inside the mocked Syncfusion grid.
 *
 * Use this helper to simulate unsaved grid edits.
 */
export const setCurrentGridRows = (
  rows: prizeFundEntryRow[],
): void => {
  currentGridRows = rows.map((row) => ({
    ...row,
  }));
};

/**
 * Returns a copy of the rows currently stored inside the mocked grid.
 */
export const getCurrentGridRows =
  (): prizeFundEntryRow[] =>
    currentGridRows.map((row) => ({
      ...row,
    }));

/**
 * Returns the most recent confirmation-modal props.
 */
export const getLatestConfirmModalProps =
  (): MockConfirmModalProps | null =>
    latestConfirmModalProps;

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
      (elimId: string) => ({
        type: "elimPfs/fetchElimPfs",
        payload: elimId,
      }),
    ),

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
          latestGridProps = props;

          /*
           * Keep the mocked grid rows synchronized with rows received
           * from the page.
           *
           * Tests may later call setCurrentGridRows() to simulate
           * unsaved Syncfusion batch edits.
           */
          React.useEffect(() => {
            currentGridRows =
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
                currentGridRows.map((row) => ({
                  ...row,
                })),
            }),
          );

          return (
            <div
              data-testid="mock-elim-prize-fund-grid"
            >
              <div data-testid="mock-grid-row-count">
                {props.rows.length}
              </div>

              <div
                data-testid={
                  "mock-grid-total-prize-fund"
                }
              >
                {props.totalPrizeFund}
              </div>

              <div
                data-testid={
                  "mock-grid-data-was-changed"
                }
              >
                {String(
                  props.gridDataWasChanged,
                )}
              </div>

              <div
                data-testid={
                  "mock-grid-enable-editing"
                }
              >
                {String(props.enableEditing)}
              </div>

              <button
                type="button"
                onClick={
                  props.onGridDataChanged
                }
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
                    currentGridRows.map(
                      (row) => ({
                        ...row,
                      }),
                    ),
                  );
                }}
              >
                Save Complete
              </button>

              <button
                type="button"
                onClick={
                  props.onNavigateAfterSave
                }
              >
                Navigate After Save
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
      latestConfirmModalProps = props;

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
 * Unlike the division page, the eliminator page has an editable
 * Expenses field. Therefore, this mock must forward onChange and
 * onBlur instead of making every currency input read-only.
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
      onChange?: React.ChangeEventHandler<
        HTMLInputElement
      >;
      onBlur?: React.FocusEventHandler<
        HTMLInputElement
      >;
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

/********************
 * Test data makers *
 ********************/

/**
 * Converts mock eliminator prize funds into the generic prizeFundType
 * structure expected by populatePfRows().
 */
export const makePrizeFunds =
  (
    elimPfs: elimPfType[] = mockElimPfs,
  ): prizeFundType[] => {
    const prizeFunds: prizeFundType[] = [];

    for (const elimPf of elimPfs) {
      prizeFunds.push({
        id: elimPf.id,
        parent_id: elimPf.elim_id,
        position: elimPf.position,
        amount: elimPf.amount,
      });
    }

    return prizeFunds;
  };

/**
 * Creates the generic prize-fund entry rows returned by the mocked
 * populatePfRows().
 */
export const makeRows =
  (
    elimPfs: elimPfType[] = mockElimPfs,
    totalPrizeFund: number = mockElim1PrizeFund,
  ): prizeFundEntryRow[] => {
    const rows: prizeFundEntryRow[] = [];

    for (const elimPf of elimPfs) {
      const amount = elimPf.amount ?? 0;

      rows.push({
        id: elimPf.id,
        parent_id: elimPf.elim_id,
        position: elimPf.position ?? 0,
        amount,
        percentage:
          totalPrizeFund > 0
            ? amount / totalPrizeFund
            : 0,
      });
    }

    return rows;
  };

/***********
 * setup() *
 ***********/

export const setup = ({
  tmntId = defaultTmntId,
  elimId = defaultElimId,

  // Optional prize funds supplied by a test.
  elimPfs: suppliedElimPfs = mockElimPfs.filter(
    (elimPf) => elimPf.elim_id === elimId,
  ),  
  tmntData: suppliedTmntData = mockTmntFullData,

  elimPfsLoadStatus = "succeeded",
  tmntLoadStatus = "succeeded",

  elimPfsError = null,
  tmntError = null,

  prizeFunds: suppliedPrizeFunds,
  populatedRows: suppliedPopulatedRows,

  confirmLeavePage = true,
}: SetupOptions = {}): {
  user: ReturnType<typeof userEvent.setup>;
  view: RenderResult;

  tmntId: string;
  elimId: string;
  runTmntUrl: string;

  elimPfs: elimPfType[];
  tmntData: tmntFullType;
  prizeFunds: prizeFundType[];
  populatedRows: prizeFundEntryRow[];

  triggerGridDataChanged: () => void;
  triggerGridDataReset: () => void;

  triggerSaveComplete: (
    savedRows?: prizeFundEntryRow[],
  ) => void;

  triggerNavigateAfterSave: () => void;
  triggerBack: () => void;
} => {
  const user = userEvent.setup();

  /*
   * Clone the supplied elim prize-fund data.
   *
   * Tests may alter the rows or their elim_id values. Cloning prevents one
   * test from mutating the shared mock data used by another test.
   */
  const elimPfs = cloneDeep(suppliedElimPfs);

  /*
   * Clone the supplied tournament data.
   *
   * Some setup options modify tournament data for the
   * current test. Cloning prevents those changes from mutating shared mock
   * data or affecting later tests.
   */
  const tmntData = cloneDeep(suppliedTmntData);

  /*
   * Build the generic prize-fund data from the final cloned elimPfs unless
   * the test explicitly supplied its own converted prize-fund data.
   */
  const prizeFunds =
    suppliedPrizeFunds ??
    makePrizeFunds(elimPfs);

  /*
   * Build the rows returned by populatePfRows() from the final cloned
   * elimPfs unless the test explicitly supplied its own populated rows.
   */
  const populatedRows =
    suppliedPopulatedRows ??
    makeRows(elimPfs);


  // const elimPfs =
  //   suppliedElimPfs ??
  //   mockElimPfs.filter(
  //     (elimPf) => elimPf.elim_id === elimId,
  //   );

  // const prizeFunds =
  //   suppliedPrizeFunds ??
  //   makePrizeFunds(elimPfs);

  // const populatedRows =
  //   suppliedPopulatedRows ??
  //   makeRows(elimPfs);

  const runTmntUrl = `/dataEntry/runTmnt/${tmntId}`;

  const mockState: MockRootState = {
    elimPfs: {
      elimPfs,
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
  });

  jest.mocked(useDispatch).mockReturnValue(
    mockDispatch as AppDispatch,
  );

  jest.mocked(useSelector).mockImplementation(
    (
      selector: (
        state: RootState,
      ) => unknown,
    ) =>
      selector(
        mockState as unknown as RootState,
      ),
  );

  mockElimPfsToPrizeFunds.mockReturnValue(
    prizeFunds,
  );

  mockPopulatePfRows.mockReturnValue(
    populatedRows,
  );

  setCurrentGridRows(populatedRows);

  mockWindowConfirm.mockReturnValue(
    confirmLeavePage,
  );

  const view = render(
    <ElimPrizeFundEntry />,
  );

  const triggerGridDataChanged =
    (): void => {
      act(() => {
        latestGridProps
          ?.onGridDataChanged();
      });
    };

  const triggerGridDataReset =
    (): void => {
      act(() => {
        latestGridProps
          ?.onGridDataReset();
      });
    };

  const triggerSaveComplete = (
    savedRows:
      prizeFundEntryRow[] =
        populatedRows,
  ): void => {
    act(() => {
      latestGridProps?.onSaveComplete(
        savedRows.map((row) => ({
          ...row,
        })),
      );
    });
  };

  const triggerNavigateAfterSave =
    (): void => {
      act(() => {
        latestGridProps
          ?.onNavigateAfterSave();
      });
    };

  const triggerBack = (): void => {
    act(() => {
      latestGridProps?.onBack();
    });
  };

  return {
    user,
    view,

    tmntId,
    elimId,
    runTmntUrl,

    elimPfs,
    tmntData,
    prizeFunds,
    populatedRows,

    triggerGridDataChanged,
    triggerGridDataReset,
    triggerSaveComplete,
    triggerNavigateAfterSave,
    triggerBack,
  };
};

/************************
 * Common test helpers  *
 ************************/

/**
 * Resets all shared mocks and captured props before each test.
 */
export const standardBeforeEach =
  (): void => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    latestGridProps = null;
    latestConfirmModalProps = null;
    currentGridRows = [];

    jest
      .spyOn(window, "confirm")
      .mockImplementation(
        mockWindowConfirm,
      );

    mockWindowConfirm.mockReturnValue(
      true,
    );

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

/**
 * Calls the grid's onGridDataChanged callback.
 */
export const triggerGridDataChanged =
  (): void => {
    act(() => {
      latestGridProps
        ?.onGridDataChanged();
    });
  };

/**
 * Calls the grid's onGridDataReset callback.
 */
export const triggerGridDataReset =
  (): void => {
    act(() => {
      latestGridProps
        ?.onGridDataReset();
    });
  };

/**
 * Calls the grid's onSaveComplete callback.
 */
export const triggerSaveComplete = (
  savedRows?: prizeFundEntryRow[],
): void => {
  act(() => {
    const rows =
      savedRows ??
      latestGridProps?.rows ??
      [];

    latestGridProps?.onSaveComplete(
      rows.map((row) => ({
        ...row,
      })),
    );
  });
};

/**
 * Calls the grid's onNavigateAfterSave callback.
 */
export const triggerNavigateAfterSave =
  (): void => {
    act(() => {
      latestGridProps
        ?.onNavigateAfterSave();
    });
  };

/**
 * Calls the grid's onBack callback.
 */
export const triggerBack =
  (): void => {
    act(() => {
      latestGridProps?.onBack();
    });
  };

/**
 * Confirms the Remove Cashers modal.
 */
export const confirmRemoveCashers =
  async (
    user: ReturnType<
      typeof userEvent.setup
    >,
  ): Promise<void> => {
    await user.click(
      screen.getByRole("button", {
        name: "Yes",
      }),
    );
  };

/**
 * Cancels the Remove Cashers modal.
 */
export const cancelRemoveCashers =
  async (
    user: ReturnType<
      typeof userEvent.setup
    >,
  ): Promise<void> => {
    await user.click(
      screen.getByRole("button", {
        name: "No",
      }),
    );
  };