import React, { act } from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
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
import { errInfoType } from "@/app/dataEntry/playersForm/rowInfo";
import { SquadStage } from "@prisma/client";
import * as reactRedux from "react-redux";

/**
 * NOTE:
 * - Several mocks below are compatible with BOTH render + interactions.
 * - A couple are *interaction-specific* (commented) because we need to:
 *   - capture DataGrid props to invoke callbacks
 *   - drive saveStatus + thunk behavior deterministically
 */

// -------------------- Router mock --------------------
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter() {
    return {
      push: mockPush,
      prefetch: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
}));

// -------------------- Modal mocks --------------------
/**
 * Interaction-friendly: gives us buttons to click.
 * If your render tests only checked "hidden by default",
 * this still works, but now you can also click confirm/cancel.
 */
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  delConfTitle: "Confirm Delete",
  cancelConfTitle: "Cancel",
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

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  cannotSaveTitle: "Cannot Save",
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
      <div data-testid="ModalErrorMsgMock" role="dialog" aria-label="error">
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

// -------------------- Touch hook mock --------------------
jest.mock("@/hooks/useIsTouchDevice", () => ({
  __esModule: true,
  useIsTouchDevice: () => false,
}));

// -------------------- ButtonWithTooltip mock --------------------
jest.mock("@/components/mobile/mobileToolTipButton", () => ({
  __esModule: true,
  ButtonWithTooltip: ({ buttonText, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {buttonText}
    </button>
  ),
}));

// -------------------- uuid mock (for Add) --------------------
jest.mock("@/lib/uuid", () => ({
  __esModule: true,
  btDbUuid: () => "ply_new_123",
}));

// -------------------- rowInfo mock (findNextError + name) --------------------
const mockFindNextError = jest.fn();
const mockGetRowPlayerName = jest.fn();

jest.mock("@/app/dataEntry/playersForm/rowInfo", () => ({
  __esModule: true,
  CheckType: { PRELIM: "PRELIM", FINAL: "FINAL" },
  findNextError: (...args: any[]) => mockFindNextError(...args),
  getRowPlayerName: (...args: any[]) => mockGetRowPlayerName(...args),
}));

// -------------------- extractData mocks (for Save/Finalize doSave) --------------------
const mockExtractDataFromRows = jest.fn();
const mockExtractFullBrktsData = jest.fn();

jest.mock("@/app/dataEntry/playersForm/extractData", () => ({
  __esModule: true,
  extractDataFromRows: (...args: any[]) => mockExtractDataFromRows(...args),
  extractFullBrktsData: (...args: any[]) => mockExtractFullBrktsData(...args),
}));

// -------------------- BracketList mock (Finalize) --------------------
/**
 * Interaction-specific: Finalize creates BracketList instances and calls:
 * - calcTotalBrkts(rows)
 * - canRandomize()
 * - randomize([])
 * - checks errorCode / errorMessage
 */
// -------------------- BracketList mock (Finalize) --------------------
let bracketListShouldRandomizeOk = true;

// optional test control for byes (default 0 = no byes)
let nextOneByeCount = 0;

jest.mock("@/components/brackets/bracketListClass", () => ({
  __esModule: true,
  BracketList: class BracketListMock {
    static noError = 0;

    id: string;
    errorCode = 0;
    errorMessage = "";

    // Needed by your new doSave() logic
    oneByeCount = 0;
    byePlayer: any;

    constructor(id: string, _ppm?: number, _games?: number, byePlayerArg?: any) {
      this.id = id;
      this.byePlayer = byePlayerArg;
    }

    calcTotalBrkts() {
      // allow tests to force bye behavior
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

/**
 * Interaction-specific: we need to invoke callbacks like:
 * - onRowSelectionModelChange([...])
 * - processRowUpdate(newRow)
 *
 * Your render tests can keep the "data-rows/data-cols" version.
 * For interactions we capture lastGridProps.
 */
let lastGridProps: any = null;

jest.mock("@mui/x-data-grid", () => {
  const actual = jest.requireActual("@mui/x-data-grid");
  return {
    __esModule: true,
    ...actual,
    DataGrid: (props: any) => {
      lastGridProps = props;
      return <div data-testid="DataGridMock" />;
    },
  };
});

const selectRow = (id: string) => {
  if (!lastGridProps?.onRowSelectionModelChange) {
    throw new Error("DataGrid props not captured yet");
  }
  act(() => {
    lastGridProps.onRowSelectionModelChange([id]);
  });  
};

// tmntFullDataSlice mock (fix for interactions)
// NOTE: This is interaction-specific because PlayersEntryForm calls .unwrap()

let mockSaveStatus: ioStatusType = "idle";
export const mockSaveTmntEntriesData = jest.fn();
let unwrapImpl: () => Promise<any> = () => Promise.resolve();

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => {
  const actual = jest.requireActual(
    "@/redux/features/tmntFullData/tmntFullDataSlice"
  );

  return {
    __esModule: true,
    ...actual,

    // selector used by the component
    getTmntDataSaveStatus: () => mockSaveStatus,

    // thunk used by the component
    saveTmntEntriesData: (...args: any[]) => {
      // record the call (tmntToSave is args[0])
      mockSaveTmntEntriesData(...args);

      // return a thunk function, like createAsyncThunk does
      return () => ({        
        // IMPORTANT: use unwrapImpl so each test can control resolve/reject
        unwrap: () => unwrapImpl(),
      });
    },
  };
});

// -------------------- mock react-redux actual --------------------
jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return {
    __esModule: true,
    ...actual,
    useDispatch: jest.fn(),
  };
});

// -------------------- store + render harness --------------------
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

const renderForm = (opts?: {
  rows?: playerEntryRow[];
  findCountError?: () => errInfoType;
  tmntFullDataProp?: tmntFullType;
  bowls?: bowlType[];
}) => {
  const store = makeStore(opts?.bowls ?? [mockBowl]);

  // stateful rows harness so functional updates work
  let rowsState = opts?.rows ?? populateRows(mockTmntFullData);

  const setRows = jest.fn((updater: any) => {
    rowsState = typeof updater === "function" ? updater(rowsState) : updater;
    return rowsState;
  });

  const findCountError = opts?.findCountError ?? (() => ({ msg: "", id: "" }));

  render(
    <Provider store={store}>
      <PlayersEntryForm
        tmntFullData={opts?.tmntFullDataProp ?? mockTmntFullData}
        rows={rowsState}
        setRows={setRows as any}
        findCountError={findCountError as any}
      />
    </Provider>
  );

  return {
    store,
    setRows,
    getRowsState: () => rowsState,
  };
};

// -------------------- shared defaults --------------------
const seedHappyPathExtracts = () => {
  // doSave merges tmntFullData + entriesData + brktsData
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

  // thunk creator returns "action", dispatch(action).unwrap() resolves
  mockSaveTmntEntriesData.mockImplementation(() => ({ type: "SAVE_ENTRIES" }));
};

const expectDateNearNow = (value: any, beforeMs: number, afterMs: number, slackMs = 2 * 60 * 1000) => {
  expect(value).toBeTruthy(); // not null/undefined/empty
  const ms = new Date(value).getTime();
  expect(Number.isNaN(ms)).toBe(false);

  expect(ms).toBeGreaterThanOrEqual(beforeMs - slackMs);
  expect(ms).toBeLessThanOrEqual(afterMs + slackMs);
};

describe("PlayerForm - interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    unwrapImpl = () => Promise.resolve();
    lastGridProps = null;

    mockSaveStatus = "idle";
    bracketListShouldRandomizeOk = true;

    // reset for each test
    nextOneByeCount = 0; 

    // default: no errors found by findNextError
    mockFindNextError.mockReturnValue({ msg: "", id: "" });

    // default row name for delete modal
    mockGetRowPlayerName.mockReturnValue("John Doe");

    seedHappyPathExtracts();

    // critical: make component dispatch return { unwrap: ... }
    (reactRedux.useDispatch as unknown as jest.Mock).mockReturnValue(
      jest.fn(() => ({ unwrap: () => unwrapImpl() }))
    );

    // default dispatch unwrap resolves
    // (we can't directly spy dispatch here; we fake it by making unwrap on the returned promise resolve)
    // We'll control it by mocking react-redux dispatch below? No—simpler:
    // mockSaveTmntEntriesData just returns an action; real store dispatch returns it,
    // but unwrap() exists only on thunk result.
    //
    // So: we also mock useDispatch to return a function that returns { unwrap: () => Promise.resolve() }
  });

  /**
   * IMPORTANT: PlayersForm calls:
   *   await dispatch(saveTmntEntriesData(...)).unwrap()
   *
   * A real RTK store dispatch will NOT provide .unwrap() unless it dispatches a real createAsyncThunk.
   * So for interactions tests we mock useDispatch to return a dispatch that produces an "unwrapable" result.
   *
   * This is interaction-specific; comment it as requested.
   */
  const mockDispatch = jest.fn(() => ({
    unwrap: () => Promise.resolve(),
  }));

  describe("Add button", () => {
    it("adds a new blank row when Add is clicked", async () => {
      const user = userEvent.setup();
      const { getRowsState } = renderForm();

      // sanity
      const startLen = getRowsState().length;

      await user.click(screen.getByRole("button", { name: /add/i }));

      const next = getRowsState();
      expect(next).toHaveLength(startLen + 1);

      const added = next[next.length - 1];
      expect(added.id).toBe("ply_new_123");
      expect(added.player_id).toBe("ply_new_123");
      expect(added.first_name).toBe("");
      expect(added.last_name).toBe("");
      expect(added.feeTotal).toBe(0);
    });
  });

  describe("Delete button", () => {
    it("shows error modal when Delete is clicked with no selected row", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole("button", { name: /delete/i }));

      const dlg = screen.getByRole("dialog", { name: "error" });
      expect(within(dlg).getByTestId("error-title")).toHaveTextContent(
        "No row selected"
      );
      expect(within(dlg).getByTestId("error-message")).toHaveTextContent(
        /Click on the row to delete/i
      );
    });

    it("opens confirm delete modal when a row is selected then Delete is clicked", async () => {
      const user = userEvent.setup();
      const { getRowsState } = renderForm();

      // simulate selecting the first row via DataGrid callback
      const firstId = getRowsState()[0].id;

      expect(lastGridProps).toBeTruthy();      
      // lastGridProps.onRowSelectionModelChange([firstId]);
      selectRow(firstId);

      await user.click(screen.getByRole("button", { name: /delete/i }));

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      expect(within(dlg).getByTestId("confirm-title")).toHaveTextContent(
        "Confirm Delete"
      );
      expect(within(dlg).getByTestId("confirm-message")).toHaveTextContent(
        /Do you want to delete:/i
      );
      // uses getRowPlayerName(rows,row)
      expect(mockGetRowPlayerName).toHaveBeenCalled();
    });

    it("removes the selected row when confirm Yes is clicked", async () => {
      const user = userEvent.setup();
      const { getRowsState } = renderForm();

      const startLen = getRowsState().length;
      const firstId = getRowsState()[0].id;

      // lastGridProps.onRowSelectionModelChange([firstId]);
      selectRow(firstId);

      await user.click(screen.getByRole("button", { name: /delete/i }));

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      await user.click(within(dlg).getByRole("button", { name: /yes/i }));

      expect(getRowsState()).toHaveLength(startLen - 1);
      expect(getRowsState().some((r) => r.id === firstId)).toBe(false);
    });

    it("does not remove a row when confirm No is clicked", async () => {
      const user = userEvent.setup();
      const { getRowsState } = renderForm();

      const startLen = getRowsState().length;
      const firstId = getRowsState()[0].id;

      // lastGridProps.onRowSelectionModelChange([firstId]);
      selectRow(firstId);
      await user.click(screen.getByRole("button", { name: /delete/i }));

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      await user.click(within(dlg).getByRole("button", { name: /no/i }));

      expect(getRowsState()).toHaveLength(startLen);
      expect(getRowsState().some((r) => r.id === firstId)).toBe(true);
    });
  });

  describe("Find Error button", () => {
    it("shows error modal when findNextError returns an error", async () => {
      const user = userEvent.setup();
      mockFindNextError.mockReturnValueOnce({
        msg: "Average is required",
        id: "avg",
      });

      renderForm();

      await user.click(screen.getByRole("button", { name: /find error/i }));

      const dlg = screen.getByRole("dialog", { name: "error" });
      expect(within(dlg).getByTestId("error-title")).toHaveTextContent(
        "Error in Entries"
      );
      expect(within(dlg).getByTestId("error-message")).toHaveTextContent(
        "Average is required"
      );
    });

    it("shows No Errors Found confirm modal when prelim check passes", async () => {
      const user = userEvent.setup();
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });

      renderForm();

      await user.click(screen.getByRole("button", { name: /find error/i }));

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      expect(within(dlg).getByTestId("confirm-title")).toHaveTextContent(
        "No Errors Found"
      );
      expect(within(dlg).getByTestId("confirm-message")).toHaveTextContent(
        /No errors found in preliminary check/i
      );
    });

    it("when No Errors Found confirm Yes is clicked, it re-runs canFinalize (calls findNextError with FINAL)", async () => {
      const user = userEvent.setup();

      // first call is PRELIM
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });
      // then when confirmYes triggers canFinalize, it calls FINAL
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });

      renderForm();

      await user.click(screen.getByRole("button", { name: /find error/i }));

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      await user.click(within(dlg).getByRole("button", { name: /yes/i }));

      // We can’t easily assert the CheckType arg because it’s from the mocked module,
      // but we *can* assert findNextError was called twice (PRELIM then FINAL).
      expect(mockFindNextError).toHaveBeenCalledTimes(2);
    });
  });

  describe("Save button", () => {
    it("shows error modal and does not dispatch save when prelim has errors", async () => {
      const user = userEvent.setup();
      mockFindNextError.mockReturnValueOnce({
        msg: "Lane is required",
        id: "lane",
      });

      renderForm();

      await user.click(screen.getByRole("button", { name: /save/i }));

      const dlg = screen.getByRole("dialog", { name: "error" });
      expect(within(dlg).getByTestId("error-title")).toHaveTextContent(
        "Cannot Save"
      );
      expect(within(dlg).getByTestId("error-message")).toHaveTextContent(
        "Lane is required"
      );

      expect(mockSaveTmntEntriesData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("dispatches save and sets stage to ENTRIES with stage_set_at near now", async () => {
      const user = userEvent.setup();
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });

      const before = Date.now();

      renderForm();
      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1));

      const after = Date.now();
      const tmntToSave = mockSaveTmntEntriesData.mock.calls[0][0] as tmntFullType;

      expect(tmntToSave.stage.stage).toBe(SquadStage.ENTRIES);
      expectDateNearNow(tmntToSave.stage.stage_set_at, before, after);

      // Save path should NOT set scores_started_at
      expect(tmntToSave.stage.scores_started_at ?? null).toBeNull();
    });

    it("CERTAIN ENOUGH: builds tmntToSave from extracted rows + bracket data and dispatches thunk with that payload", async () => {
      const user = userEvent.setup();

      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });

      // force unwrap to resolve and prove it was called
      const unwrapSpy = jest.fn(() => Promise.resolve());
      unwrapImpl = unwrapSpy;

      const extractedPlayers = [{ ...mockTmntFullData.players[0], id: "ply_extracted_1" }];
      const extractedDivEntries = [{ ...mockTmntFullData.divEntries[0], id: "den_extracted_1" }];
      const extractedElimEntries = [{ ...mockTmntFullData.elimEntries[0], id: "een_extracted_1" }];
      const extractedBrktEntries = [{ ...mockTmntFullData.brktEntries[0], id: "ben_extracted_1" }];
      const extractedPotEntries = [{ ...mockTmntFullData.potEntries[0], id: "pen_extracted_1" }];

      const extractedOneBrkts = [{ ...mockTmntFullData.oneBrkts[0], id: "obk_extracted_1" }];
      const extractedBrktSeeds = [{ ...mockTmntFullData.brktSeeds[0], id: "bsd_extracted_1" }];

      mockExtractDataFromRows.mockReturnValueOnce({
        players: extractedPlayers,
        divEntries: extractedDivEntries,
        elimEntries: extractedElimEntries,
        brktEntries: extractedBrktEntries,
        potEntries: extractedPotEntries,
      });

      mockExtractFullBrktsData.mockReturnValueOnce({
        oneBrkts: extractedOneBrkts,
        brktSeeds: extractedBrktSeeds,
      });

      renderForm();

      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1));      
      await waitFor(() => expect(unwrapSpy).toHaveBeenCalledTimes(1));

      // If save failed, you'll get a helpful message instead of "push not called"
      await waitFor(() => {
        if (mockPush.mock.calls.length === 0) {
          const errDlg = screen.queryByRole("dialog", { name: "error" });
          if (errDlg) {
            const msg = within(errDlg).getByTestId("error-message").textContent;
            throw new Error(`Save failed, error modal shown: ${msg}`);
          }
          throw new Error("Waiting for navigation...");
        }
      });      

      expect(mockExtractDataFromRows).toHaveBeenCalledTimes(1);
      const squad0Id = mockTmntFullData.squads[0].id;
      expect(mockExtractDataFromRows.mock.calls[0][1]).toBe(squad0Id);

      // Save path passes [] to extractFullBrktsData
      expect(mockExtractFullBrktsData).toHaveBeenCalledTimes(1);
      expect(mockExtractFullBrktsData).toHaveBeenCalledWith([]);

      const tmntToSave = mockSaveTmntEntriesData.mock.calls[0][0] as tmntFullType;

      // Deep equality: content is correct
      expect(tmntToSave.players).toStrictEqual(extractedPlayers);
      expect(tmntToSave.divEntries).toStrictEqual(extractedDivEntries);
      expect(tmntToSave.elimEntries).toStrictEqual(extractedElimEntries);
      expect(tmntToSave.brktEntries).toStrictEqual(extractedBrktEntries);
      expect(tmntToSave.potEntries).toStrictEqual(extractedPotEntries);
      expect(tmntToSave.oneBrkts).toStrictEqual(extractedOneBrkts);
      expect(tmntToSave.brktSeeds).toStrictEqual(extractedBrktSeeds);

      // Reference inequality: proves doSave cloned arrays via [...]
      expect(tmntToSave.players).not.toBe(extractedPlayers);
      expect(tmntToSave.divEntries).not.toBe(extractedDivEntries);
      expect(tmntToSave.elimEntries).not.toBe(extractedElimEntries);
      expect(tmntToSave.brktEntries).not.toBe(extractedBrktEntries);
      expect(tmntToSave.potEntries).not.toBe(extractedPotEntries);
      expect(tmntToSave.oneBrkts).not.toBe(extractedOneBrkts);
      expect(tmntToSave.brktSeeds).not.toBe(extractedBrktSeeds);

      // invariants
      expect(tmntToSave.tmnt.id).toBe(mockTmntFullData.tmnt.id);
      expect(tmntToSave.squads).toBe(mockTmntFullData.squads);
    });

    it("shows Cannot Save modal if dispatch unwrap rejects", async () => {
      const user = userEvent.setup();

      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });

      // make unwrap reject for THIS test
      unwrapImpl = () => Promise.reject(new Error("DB down"));

      renderForm();

      await user.click(screen.getByRole("button", { name: /save/i }));

      const dlg = await screen.findByRole("dialog", { name: "error" });

      expect(within(dlg).getByTestId("error-title")).toHaveTextContent("Cannot Save");
      expect(within(dlg).getByTestId("error-message")).toHaveTextContent("DB down");

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1);
    });    
  });

  describe("Finalize button", () => {
    it("does not save when canFinalize fails due to FINAL errors", async () => {
      const user = userEvent.setup();

      // Finalize calls canFinalize => findNextError(FINAL)
      mockFindNextError.mockReturnValueOnce({
        msg: "Position invalid",
        id: "pos",
      });

      renderForm();

      await user.click(screen.getByRole("button", { name: /finalize/i }));

      const dlg = screen.getByRole("dialog", { name: "error" });
      expect(within(dlg).getByTestId("error-title")).toHaveTextContent(
        "Cannot Finalize"
      );
      expect(within(dlg).getByTestId("error-message")).toHaveTextContent(
        "Position invalid"
      );

      expect(mockSaveTmntEntriesData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does not save when canFinalize fails due to count errors", async () => {
      const user = userEvent.setup();

      // FINAL row check passes
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });

      const findCountError = () =>
        ({ msg: "Missing pots", id: "pots" } as errInfoType);

      renderForm({ findCountError });

      await user.click(screen.getByRole("button", { name: /finalize/i }));

      const dlg = screen.getByRole("dialog", { name: "error" });
      expect(within(dlg).getByTestId("error-title")).toHaveTextContent(
        "Cannot Finalize"
      );
      expect(within(dlg).getByTestId("error-message")).toHaveTextContent(
        "Missing pots"
      );

      expect(mockSaveTmntEntriesData).not.toHaveBeenCalled();
    });

    it("finalize builds bracket lists then saves and navigates when all checks pass", async () => {
      const user = userEvent.setup();

      // FINAL passes
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });
      // count errors none
      const findCountError = () => ({ msg: "", id: "" } as errInfoType);

      bracketListShouldRandomizeOk = true;

      renderForm({ findCountError });

      await user.click(screen.getByRole("button", { name: /finalize/i }));

      await waitFor(() => {
        expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`
        );
      });

      // extractFullBrktsData should be called with bracket lists (non-empty)
      expect(mockExtractFullBrktsData).toHaveBeenCalled();
      const callArg = mockExtractFullBrktsData.mock.calls[0][0];
      expect(Array.isArray(callArg)).toBe(true);
      // It will be >= 1 if you have bracket columns (your mock has brkts)
      // but we don't hardcode exact number, just require array.

      expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledTimes(1);      
    });

    it("finalize sets stage to SCORES with stage_set_at and scores_started_at near now", async () => {
      const user = userEvent.setup();

      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });
      const findCountError = () => ({ msg: "", id: "" } as errInfoType);

      const before = Date.now();

      renderForm({ findCountError });
      await user.click(screen.getByRole("button", { name: /finalize/i }));

      await waitFor(() => expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1));

      const after = Date.now();
      const tmntToSave = mockSaveTmntEntriesData.mock.calls[0][0] as tmntFullType;

      expect(tmntToSave.stage.stage).toBe(SquadStage.SCORES);
      expectDateNearNow(tmntToSave.stage.stage_set_at, before, after);
      expectDateNearNow(tmntToSave.stage.scores_started_at, before, after);
    });

    it("shows Cannot Randomize Brackets modal if bracket randomize fails", async () => {
      const user = userEvent.setup();

      // FINAL passes
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });
      // count errors none
      const findCountError = () => ({ msg: "", id: "" } as errInfoType);

      bracketListShouldRandomizeOk = false;

      renderForm({ findCountError });

      await user.click(screen.getByRole("button", { name: /finalize/i }));

      const dlg = await screen.findByRole("dialog", { name: "error" });
      expect(within(dlg).getByTestId("error-title")).toHaveTextContent(
        "Cannot Randomize Brackets"
      );
      expect(within(dlg).getByTestId("error-message")).toHaveTextContent(
        /Mock bracket randomize error/i
      );

      expect(mockSaveTmntEntriesData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("adds a BYE player to tmntToSave.players when bracket list has byes", async () => {
      const user = userEvent.setup();
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });
      const findCountError = () => ({ msg: "", id: "" } as errInfoType);

      nextOneByeCount = 1; // force bye behavior

      renderForm({ findCountError });

      await user.click(screen.getByRole("button", { name: /finalize/i }));

      await waitFor(() => expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1));

      const tmntToSave = mockSaveTmntEntriesData.mock.calls[0][0] as tmntFullType;

      // byePlayer shape depends on createByePlayer(); this just checks "an extra player got added"
      expect(tmntToSave.players.length).toBeGreaterThan(mockTmntFullData.players.length);
    });

    it("Finalize calls doSave with a NON-empty brktLists array", async () => {
      const user = userEvent.setup();

      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });
      const findCountError = () => ({ msg: "", id: "" } as errInfoType);

      renderForm({ findCountError });

      await user.click(screen.getByRole("button", { name: /finalize/i }));

      await waitFor(() => expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1));

      // doSave(brktLists) => extractFullBrktsData(brktLists)
      expect(mockExtractFullBrktsData).toHaveBeenCalledTimes(1);
      const brktListsArg = mockExtractFullBrktsData.mock.calls[0][0];

      expect(Array.isArray(brktListsArg)).toBe(true);
      expect(brktListsArg.length).toBeGreaterThan(0);

      // also passed into extractDataFromRows(rows, squadId, brktLists)
      expect(mockExtractDataFromRows).toHaveBeenCalledTimes(1);
      expect(mockExtractDataFromRows.mock.calls[0][2]).toBe(brktListsArg); // same reference
    });

  });

  describe("Cancel button", () => {
    it("navigates immediately when rows.length === 0", async () => {
      const user = userEvent.setup();

      renderForm({ rows: [] });

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`
      );
    });

    it("shows cancel confirm modal when rows.length > 0", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      expect(within(dlg).getByTestId("confirm-title")).toHaveTextContent(
        "Cancel"
      );
      expect(within(dlg).getByTestId("confirm-message")).toHaveTextContent(
        /cancel editing bowlers/i
      );
    });

    it("when cancel confirm Yes is clicked, navigates to runTmnt", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      await user.click(within(dlg).getByRole("button", { name: /yes/i }));

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`
      );
    });

    it("when cancel confirm No is clicked, does not navigate", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      const dlg = screen.getByRole("dialog", { name: "confirm" });
      await user.click(within(dlg).getByRole("button", { name: /no/i }));

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("DataGrid interactions", () => {
    it("updates selectedRowId when DataGrid selection changes and enables delete confirm path", async () => {
      const user = userEvent.setup();
      const { getRowsState } = renderForm();

      const firstId = getRowsState()[0].id;
      
      // lastGridProps.onRowSelectionModelChange([firstId]);
      selectRow(firstId);

      await user.click(screen.getByRole("button", { name: /delete/i }));

      // delete path should open confirm modal (not 'No row selected' error modal)
      expect(screen.getByRole("dialog", { name: "confirm" })).toBeInTheDocument();
      expect(screen.queryByRole("dialog", { name: "error" })).not.toBeInTheDocument();
    });

    it("processRowUpdate updates feeTotal and calls setRows with functional updater", async () => {
      const { setRows, getRowsState } = renderForm();

      const r0 = getRowsState()[0];

      // baseTotals includes fee columns for div/pot/brkt/elim, but we don't want to depend on their exact keys.
      // We'll just include one numeric key and ensure feeTotal changes from 0 to that number.
      const updated = {
        ...r0,
        // choose an arbitrary dynamic fee key used by your grid rows; safest is feeTotal itself isn't counted
        // so we create a numeric property that baseTotals likely has: entryFeeColName(divId) etc.
        // Since we can't import entryFeeColName here easily, we use an existing key from the row if present.
        // Fallback: add a key that might not be counted; we still at least assert setRows called.
        feeTotal: 0,
      } as any;

      // If your populateRows puts fee columns on the row, pick one:
      const someKey =
        Object.keys(r0).find((k) => k.includes("fee")) ??
        Object.keys(r0).find((k) => k.includes("entry")) ??
        null;

      if (someKey) {
        updated[someKey] = 12;
      }

      expect(lastGridProps).toBeTruthy();

      // lastGridProps.processRowUpdate(updated);
      act(() => {
        lastGridProps.processRowUpdate(updated);
      });      

      // setRows called with function updater
      expect(setRows).toHaveBeenCalled();
      const arg = setRows.mock.calls[0][0];
      expect(typeof arg).toBe("function");

      // and the row in state is updated (if a counted key existed, feeTotal should be > 0)
      const after = getRowsState().find((r) => r.id === r0.id) as any;
      expect(after).toBeTruthy();

      if (someKey) {
        expect(after.feeTotal).toBeGreaterThan(0);
      }
    });
  });
  
  describe("doSave brktLists argument", () => {
    it("Save path passes []", async () => {
      const user = userEvent.setup();
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });

      renderForm();
      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1));
      expect(mockExtractFullBrktsData).toHaveBeenCalledWith([]);
      expect(mockExtractDataFromRows.mock.calls[0][2]).toEqual([]);
    });

    it("Finalize path passes non-empty brktLists", async () => {
      const user = userEvent.setup();
      mockFindNextError.mockReturnValueOnce({ msg: "", id: "" });
      const findCountError = () => ({ msg: "", id: "" } as errInfoType);

      renderForm({ findCountError });
      await user.click(screen.getByRole("button", { name: /finalize/i }));

      await waitFor(() => expect(mockSaveTmntEntriesData).toHaveBeenCalledTimes(1));
      const arg = mockExtractFullBrktsData.mock.calls[0][0];
      expect(arg.length).toBeGreaterThan(0);
      expect(mockExtractDataFromRows.mock.calls[0][2]).toBe(arg);
    });
  });

});