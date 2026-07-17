import React from "react";
import { act, render, screen, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import type {
  divPfType,
  prizeFundEntryRow,
  prizeFundType,
  tmntFullType
} from "@/lib/types/types";
import type {
  PrizeFundGridHandle,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import type { AppDispatch, RootState } from "@/redux/store";
import { fetchDivPfs } from "@/redux/features/divPfs/divPfsSlice";
import { fetchTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { populatePfRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows";
import { divPfsToPrizeFunds } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
import { btDbUuid } from "@/lib/uuid";
import DivPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/div/[divId]/page";
import {
  tmntId,
  divId1,
  mockDivPfs,
  mockDivPrizeFund,
  mockTmntFullData,  
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

type MockRootState = {
  divPfs: {
    divPfs: divPfType[];
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
 * Props captured from the mocked DivPrizeFundGrid.
 *
 * Page tests can invoke these callbacks without rendering the generic
 * PrizeFundGrid or the Syncfusion grid.
 */
export type MockDivPrizeFundGridProps = {
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

export type MockConfirmModalProps = {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export type SetupOptions = {
  tmntId?: string;
  divId?: string;

  divPfs?: divPfType[];
  tmntData?: tmntFullType;

  divPfsLoadStatus?: string;
  tmntLoadStatus?: string;

  divPfsError?: string | null;
  tmntError?: string | null;

  prizeFunds?: prizeFundType[];
  populatedRows?: prizeFundEntryRow[];

  confirmLeavePage?: boolean;
};

/*************************
 * Navigation constants  *
 *************************/

export const TEST_RUN_TMNT_URL =
  `/dataEntry/runTmnt/${tmntId}`;

/******************
 * Exported mocks *
 ******************/

// Redux
export const mockDispatch = jest.fn();

// Router
export const mockPush = jest.fn();

// Redux thunks
export const mockFetchDivPfs = jest.mocked(fetchDivPfs);
export const mockFetchTmntFullData = jest.mocked(fetchTmntFullData);

// Helper functions
export const mockDivPfsToPrizeFunds = jest.mocked(divPfsToPrizeFunds);
export const mockPopulatePfRows = jest.mocked(populatePfRows);

// Hooks
export const mockUseUnsavedChangesGuard =
  jest.mocked(useUnsavedChangesGuard);

// Misc.
export const mockBtDbUuid = jest.mocked(btDbUuid);
export const mockWindowConfirm = jest.fn();

/****************
 * Latest props *
 ****************/

let latestGridProps:
  | MockDivPrizeFundGridProps
  | null = null;

let latestConfirmModalProps:
  | MockConfirmModalProps
  | null = null;

/**
 * Represents the rows currently inside the mocked Syncfusion grid.
 *
 * This simulates PrizeFundGrid.getCurrentRows(), which may contain edits
 * that have not yet been pushed into React state.
 */
let currentGridRows: prizeFundEntryRow[] = [];

export const getLatestGridProps =
  (): MockDivPrizeFundGridProps | null =>
    latestGridProps;

export const getLatestRows = (): prizeFundEntryRow[] =>
  latestGridProps?.rows ?? [];

export const setCurrentGridRows = (
  rows: prizeFundEntryRow[],
): void => {
  currentGridRows = rows.map((row) => ({
    ...row,
  }));
};

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
  "@/redux/features/divPfs/divPfsSlice",
  () => ({
    __esModule: true,

    fetchDivPfs: jest.fn((divId: string) => ({
      type: "divPfs/fetchDivPfs",
      payload: divId,
    })),

    getDivPfsLoadStatus: (
      state: MockRootState,
    ): string => state.divPfs.loadStatus,

    getDivPfsError: (
      state: MockRootState,
    ): string | null => state.divPfs.error,
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
    divPfsToPrizeFunds: jest.fn(),
  }),
);

jest.mock("@/lib/uuid", () => ({
  __esModule: true,
  btDbUuid: jest.fn(),
}));

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/div/divPrizeFundGrid",
  () => {
    const React = require("react");

    const MockDivPrizeFundGrid = React.forwardRef(
      (
        props: MockDivPrizeFundGridProps,
        ref: React.Ref<PrizeFundGridHandle>,
      ) => {
        latestGridProps = props;

        /*
         * Keep the mocked grid rows synchronized with rows received from
         * the page.
         *
         * currentGridRows can later be changed by setCurrentGridRows() to
         * simulate unsaved Syncfusion batch edits.
         */
        React.useEffect(() => {
          currentGridRows = props.rows.map((row) => ({
            ...row,
          }));
        }, [props.rows]);

        /*
         * Expose the same public method as the real PrizeFundGrid.
         *
         * The page calls getCurrentRows() before adding or removing cashers
         * so it can preserve edits that still exist only inside Syncfusion.
         */
        React.useImperativeHandle(ref, () => ({
          getCurrentRows: () =>
            currentGridRows.map((row) => ({
              ...row,
            })),
        }));

        return (
          <div data-testid="mock-div-prize-fund-grid">
            <div data-testid="mock-grid-row-count">
              {props.rows.length}
            </div>

            <div data-testid="mock-grid-total-prize-fund">
              {props.totalPrizeFund}
            </div>

            <div data-testid="mock-grid-data-was-changed">
              {String(props.gridDataWasChanged)}
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
                  currentGridRows.map((row) => ({
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
          </div>
        );
      },
    );

    MockDivPrizeFundGrid.displayName =
      "MockDivPrizeFundGrid";

    return {
      __esModule: true,
      default: MockDivPrizeFundGrid,
    };
  },
);

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
    }: {
      id: string;
      name: string;
      value: number;
      disabled?: boolean;
      className?: string;
    }) => (
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        className={className}
        readOnly
      />
    ),
  }),
);

/********************
 * Test data makers *
 ********************/

export const makePrizeFunds = (): prizeFundType[] => {
  const mockPrizeFunds: prizeFundType[] = [];
  for (const divPf of mockDivPfs) {
    mockPrizeFunds.push({
      id: divPf.id,
      parent_id: divPf.div_id,
      position: divPf.position,
      amount: divPf.amount,
    });
  }
  return mockPrizeFunds;
}

export const makeRows = (): prizeFundEntryRow[] => { 
  const mockRows: prizeFundEntryRow[] = [];
  for (const divPf of mockDivPfs) {
    mockRows.push({
      id: divPf.id,
      parent_id: divPf.div_id,
      position: divPf.position!,
      amount: divPf.amount!,
      percentage: divPf.amount! / mockDivPrizeFund,
    });
  }
  return mockRows;
}

/***********
 * setup() *
 ***********/

export const setup = ({
  divPfs = mockDivPfs,
  tmntData = mockTmntFullData,

  divPfsLoadStatus = "succeeded",
  tmntLoadStatus = "succeeded",

  divPfsError = null,
  tmntError = null,

  prizeFunds = makePrizeFunds(),
  populatedRows = makeRows(),

  confirmLeavePage = true,
}: SetupOptions = {}): {
  user: ReturnType<typeof userEvent.setup>;
  view: RenderResult;

  tmntId: string;
  divId: string;
  runTmntUrl: string;

  divPfs: divPfType[];
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

  const runTmntUrl =
    `/dataEntry/runTmnt/${tmntId}`;

  const mockState: MockRootState = {
    divPfs: {
      divPfs,
      loadStatus: divPfsLoadStatus,
      error: divPfsError,
    },

    tmntFullData: {
      tmntFullData: tmntData,
      loadStatus: tmntLoadStatus,
      error: tmntError,
    },
  };

  jest.mocked(useParams).mockReturnValue({
    tmntId,
    divId: divId1,
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

  mockDivPfsToPrizeFunds.mockReturnValue(
    prizeFunds,
  );

  mockPopulatePfRows.mockReturnValue(
    populatedRows,
  );

  setCurrentGridRows(populatedRows);

  mockWindowConfirm.mockReturnValue(
    confirmLeavePage,
  );

  const view = render(<DivPrizeFundEntry />);

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
    savedRows: prizeFundEntryRow[] =
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
    divId: divId1,
    runTmntUrl,

    divPfs,
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

export const standardBeforeEach = (): void => {
  jest.restoreAllMocks();
  jest.clearAllMocks();

  latestGridProps = null;
  latestConfirmModalProps = null;
  currentGridRows = [];

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

export const triggerGridDataChanged =
  (): void => {
    act(() => {
      latestGridProps
        ?.onGridDataChanged();
    });
  };

export const triggerGridDataReset =
  (): void => {
    act(() => {
      latestGridProps
        ?.onGridDataReset();
    });
  };

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

export const triggerNavigateAfterSave =
  (): void => {
    act(() => {
      latestGridProps
        ?.onNavigateAfterSave();
    });
  };

export const triggerBack = (): void => {
  act(() => {
    latestGridProps?.onBack();
  });
};

export const confirmRemoveCashers = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", {
      name: "Yes",
    }),
  );
};

export const cancelRemoveCashers = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await user.click(
    screen.getByRole("button", {
      name: "No",
    }),
  );
};