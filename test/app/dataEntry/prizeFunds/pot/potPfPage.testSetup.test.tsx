import React from "react";
import { act, render, screen, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import type {
  potCategoriesTypes,
  potPfType,
  prizeFundEntryRow,
  prizeFundType,
  tmntFullType
} from "@/lib/types/types";
import type {
  PrizeFundGridHandle,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import type { AppDispatch, RootState } from "@/redux/store";
import { fetchPotPfs } from "@/redux/features/potPfs/potPfsSlice";
import { fetchTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { populatePfRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows";
import { potPfsToPrizeFunds } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
import { getPotName } from "@/lib/getName";
import { btDbUuid } from "@/lib/uuid";
import PotPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/pot/[potId]/page";
import {
  tmntId,
  potId1,
  mockPotPfs,  
  mockPot1PerGamePrizeFund,
  mockTmntFullData,  
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import cloneDeep from "lodash/cloneDeep";

type MockRootState = {
  potPfs: {
    potPfs: potPfType[];
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
 * Props captured from the mocked PotPrizeFundGrid.
 *
 * Page tests can invoke these callbacks without rendering the generic
 * PrizeFundGrid or the Syncfusion grid.
 */
export type MockPotPrizeFundGridProps = {
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
  potId?: string;

  potName?: string;
  potType?: potCategoriesTypes;

  potPfs?: potPfType[];
  tmntData?: tmntFullType;

  potPfsLoadStatus?: string;
  tmntLoadStatus?: string;

  potPfsError?: string | null;
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
export const mockFetchPotPfs = jest.mocked(fetchPotPfs);
export const mockFetchTmntFullData = jest.mocked(fetchTmntFullData);

// Helper functions
export const mockPotPfsToPrizeFunds = jest.mocked(potPfsToPrizeFunds);
export const mockPopulatePfRows = jest.mocked(populatePfRows);
export const mockGetPotName = jest.mocked(getPotName);

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
  | MockPotPrizeFundGridProps
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
  (): MockPotPrizeFundGridProps | null =>
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

jest.mock("@/lib/getName", () => ({
  __esModule: true,
  getPotName: jest.fn(),
}));

jest.mock(
  "@/redux/features/potPfs/potPfsSlice",
  () => ({
    __esModule: true,

    fetchPotPfs: jest.fn((potId: string) => ({
      type: "potPfs/fetchPotPfs",
      payload: potId,
    })),

    getPotPfsLoadStatus: (
      state: MockRootState,
    ): string => state.potPfs.loadStatus,

    getPotPfsError: (
      state: MockRootState,
    ): string | null => state.potPfs.error,
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
    potPfsToPrizeFunds: jest.fn(),
  }),
);

jest.mock("@/lib/uuid", () => ({
  __esModule: true,
  btDbUuid: jest.fn(),
}));

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/pot/potPrizeFundGrid",
  () => {
    const React = require("react");

    const MockPotPrizeFundGrid = React.forwardRef(
      (
        props: MockPotPrizeFundGridProps,
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
          <div data-testid="mock-pot-prize-fund-grid">
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

    MockPotPrizeFundGrid.displayName =
      "MockPotPrizeFundGrid";

    return {
      __esModule: true,
      default: MockPotPrizeFundGrid,
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
      onBlur,
      onChange,
    }: {
      id: string;
      name: string;
      value: number | string;
      disabled?: boolean;
      className?: string;
      onBlur?: React.FocusEventHandler<HTMLInputElement>;
      onChange?: React.ChangeEventHandler<HTMLInputElement>;
    }) => (
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        className={className}
        onBlur={onBlur}
        onChange={onChange}
        readOnly={!onChange}
      />
    ),
  }),
);

/********************
 * Test data makers *
 ********************/

/**
 * Converts the mocked pot prize funds to the generic prize-fund type
 * expected by the page's conversion helper.
 */
export const makePrizeFunds = (
  potPfs: potPfType[] = mockPotPfs,
): prizeFundType[] => {
  return potPfs.map((potPf) => ({
    id: potPf.id,
    parent_id: potPf.pot_id,
    position: potPf.position,
    amount: potPf.amount,
  }));
};

/**
 * Converts the mocked pot prize funds to the generic potPf type
 * expected by the page's conversion helper.
 */
export const makePotPfsForPot = (
  potId: string,
  potPfs: potPfType[] = mockPotPfs,
): potPfType[] =>
  potPfs.map((pf) => ({
    ...pf,
    pot_id: potId,
  }));

/**
 * Converts the mocked pot prize funds to the generic potPf type
 * expected by the page's conversion helper.
 * Each potPf has a different pot_id than the current pot.
 */
export const makePotPfsForDifferentPot = (
  currentPotId: string,
  potPfs: potPfType[] = mockPotPfs,
): potPfType[] =>
  potPfs.map((pf) => ({
    ...pf,
    pot_id:
      pf.pot_id === currentPotId
        ? "different-pot-id"
        : pf.pot_id,
  }));

/**
 * Creates the generic rows returned by the mocked populatePfRows().
 *
 * For Game pots, the rows are based on the per-game prize fund.
 * For Last Game and Series pots, the rows are based on the total prize fund.
 *
 * The default implementation assumes a Game pot because the mock tournament
 * data uses that pot type.
 */
export const makeRows = (
  potPfs: potPfType[] = mockPotPfs,
  totalPrizeFund: number = mockPot1PerGamePrizeFund,
): prizeFundEntryRow[] => {
  return potPfs.map((potPf) => ({
    id: potPf.id,
    parent_id: potPf.pot_id,
    position: potPf.position!,
    amount: potPf.amount!,
    percentage:
      totalPrizeFund > 0
        ? potPf.amount! / totalPrizeFund
        : 0,
  }));
};

/****************
 * page queries *
 ****************/

/**
 * Queries the page for the Per Game element.
 */
export const queryPerGame = () =>
  screen.queryByLabelText("Per Game");

/***********
 * setup() *
 ***********/

export const setup = ({
  tmntId: setupTmntId = tmntId,
  potId: setupPotId = potId1,

  // only get potPfs for the current pot
  potPfs: suppliedPotPfs = mockPotPfs.filter(
    (potPf) => potPf.pot_id === setupPotId,
  ),
  tmntData: suppliedTmntData = mockTmntFullData,

  potPfsLoadStatus = "succeeded",
  tmntLoadStatus = "succeeded",

  potPfsError = null,
  tmntError = null,

  prizeFunds: suppliedPrizeFunds,
  populatedRows: suppliedPopulatedRows,

  potName = "Mock Pot",
  potType,

  confirmLeavePage = true,
}: SetupOptions = {}): {
  user: ReturnType<typeof userEvent.setup>;
  view: RenderResult;

  tmntId: string;
  potId: string;
  runTmntUrl: string;

  potPfs: potPfType[];
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
   * Clone the supplied pot prize-fund data.
   *
   * Tests may alter the rows or their pot_id values. Cloning prevents one
   * test from mutating the shared mock data used by another test.
   */
  const potPfs = cloneDeep(suppliedPotPfs);

  /*
   * Clone the supplied tournament data.
   *
   * Some setup options, such as potType, modify tournament data for the
   * current test. Cloning prevents those changes from mutating shared mock
   * data or affecting later tests.
   */
  const tmntData = cloneDeep(suppliedTmntData);

  /*
   * Override the selected pot's type when requested.
   *
   * This allows tests to render the same page as a Game, Last Game, or
   * Series pot without creating separate tournament mock objects.
   */
  if (potType !== undefined) {
    const selectedPot = tmntData.pots.find(
      (pot) => pot.id === setupPotId,
    );

    if (selectedPot) {
      selectedPot.pot_type = potType;
    }
  }

  /*
   * Build the generic prize-fund data from the final cloned potPfs unless
   * the test explicitly supplied its own converted prize-fund data.
   */
  const prizeFunds =
    suppliedPrizeFunds ??
    makePrizeFunds(potPfs);

  /*
   * Build the rows returned by populatePfRows() from the final cloned
   * potPfs unless the test explicitly supplied its own populated rows.
   */
  const populatedRows =
    suppliedPopulatedRows ??
    makeRows(potPfs);

  const runTmntUrl =
    `/dataEntry/runTmnt/${setupTmntId}`;

  const mockState: MockRootState = {
    potPfs: {
      potPfs,
      loadStatus: potPfsLoadStatus,
      error: potPfsError,
    },

    tmntFullData: {
      tmntFullData: tmntData,
      loadStatus: tmntLoadStatus,
      error: tmntError,
    },
  };

  jest.mocked(useParams).mockReturnValue({
    tmntId: setupTmntId,
    potId: setupPotId,
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

  mockPotPfsToPrizeFunds.mockReturnValue(
    prizeFunds,
  );

  mockPopulatePfRows.mockReturnValue(
    populatedRows,
  );

  mockGetPotName.mockReturnValue(
    potName,
  );

  setCurrentGridRows(populatedRows);

  mockWindowConfirm.mockReturnValue(
    confirmLeavePage,
  );

  const view = render(
    <PotPrizeFundEntry />,
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

    tmntId: setupTmntId,
    potId: setupPotId,
    runTmntUrl,

    potPfs,
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