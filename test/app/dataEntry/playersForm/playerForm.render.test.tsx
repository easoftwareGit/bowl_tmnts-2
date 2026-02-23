import React from "react"; 
import { render, screen } from "@testing-library/react"; 
import "@testing-library/jest-dom"; 
import { Provider } from "react-redux"; 
import { configureStore } from "@reduxjs/toolkit";
import tmntFullDataReducer from "@/redux/features/tmntFullData/tmntFullDataSlice"; 
import bowlsReducer from "@/redux/features/bowls/bowlsSlice";
import { mockBowl, mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData"; 
import { ioStatusType } from "@/redux/statusTypes"; 
import type { bowlType, tmntFullType } from "@/lib/types/types";
import { ioDataError } from "@/lib/enums/enums";

const mockPush = jest.fn();

// Mock useRouter: 
jest.mock("next/navigation", () => ({ 
  useRouter() { 
    return { 
      push: mockPush, 
      prefetch: jest.fn(), 
    }; 
  }, 
})); 

// mock the modals
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  delConfTitle: "Confirm Delete",
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
      <div data-testid="ModalConfirmMock">
        <div data-testid="ModalConfirmTitle">{title}</div>
        <div data-testid="ModalConfirmMsg">{message}</div>
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
      <div data-testid="ModalErrorMsgMock">
        <div data-testid="ModalErrorTitle">{title}</div>
        <div data-testid="ModalErrorMsg">{message}</div>
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
      <div role="dialog" aria-label="wait-modal">
        {message}
      </div>
    ) : (
      <div data-testid="WaitModalMock" data-show="false" />
    ),
}));

// mock redux - tmntFullDataSlice
let mockSaveStatus: "idle" | "saving" | "succeeded" | "failed" = "idle";
const mockSaveTmntEntriesData = jest.fn();
const mockSaveTmntFullData = jest.fn();
jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => {
  const actual = jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice");
  return {
    __esModule: true,
    ...actual,

    // thunks you might dispatch
    saveTmntEntriesData: (...args: any[]) => mockSaveTmntEntriesData(...args),
    saveTmntFullData: (...args: any[]) => mockSaveTmntFullData(...args),

    // selector override for WaitModal testing
    getTmntDataSaveStatus: () => mockSaveStatus,
  };
});

// mock the data grid 
export let lastGridProps: any = null; // test helper scope

jest.mock("@mui/x-data-grid", () => {
  const actual = jest.requireActual("@mui/x-data-grid");
  return {
    __esModule: true,
    ...actual,
    DataGrid: (props: any) => {
      lastGridProps = props;
      return (
        <div
          data-testid="DataGridMock"
          data-rows={props.rows?.length ?? 0}
          data-cols={props.columns?.length ?? 0}
          data-editmode={props.editMode ?? ""}
          data-hidefooter={String(!!props.hideFooter)}
        />
      );
    },
  };
});

import PlayersEntryForm from "@/app/dataEntry/playersForm/playersForm";
import { playerEntryRow, populateRows } from "@/app/dataEntry/playersForm/populateRows";
import { errInfoType } from "@/app/dataEntry/playersForm/rowInfo";

// mock the postInitialStageForSquad
jest.mock("@/lib/db/stages/dbStages", () => ({
  __esModule: true,
  postInitialStageForSquad: jest.fn(),
}));

// mock the ButtonWithTooltip
jest.mock("@/components/mobile/mobileToolTipButton", () => ({
  __esModule: true,
  ButtonWithTooltip: ({ buttonText, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {buttonText}
    </button>
  ),
}));

// helper functions for rendering
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
  tmntFullDataProp?: tmntFullType;
  findCountError?: () => { msg: string; id: string };
  bowls?: bowlType[];
}) => {
  const store = makeStore(opts?.bowls ?? [mockBowl]);

  // stateful rows harness
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

const currentRows = populateRows(mockTmntFullData);
const props = {
  tmntFullData: mockTmntFullData,
  rows: currentRows,
  setRows: jest.fn() as unknown as React.Dispatch<
    React.SetStateAction<playerEntryRow[]>
  >,
  findCountError: jest.fn(() => ({ msg: "", id: "" } as errInfoType)),
};

describe('PlayerForm - render', () => { 

  beforeEach(() => {
    jest.clearAllMocks();
    lastGridProps = null;
  })

  it("renders the top-level modals (hidden by default)", () => {
    renderForm(props);

    expect(screen.getByTestId("ModalConfirmMock")).toHaveAttribute(
      "data-show",
      "false"
    );
    expect(screen.getByTestId("ModalErrorMsgMock")).toHaveAttribute(
      "data-show",
      "false"
    );

    // saveStatus defaults to "idle" in makeStore, so WaitModal should be hidden
    expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
      "data-show",
      "false"
    );
  });
  it('renders the form', () => { 
    renderForm(props);
        
    expect(screen.getByRole("heading", { level: 5 })).toHaveTextContent("Tournament: Mock Tournament");
    expect(screen.getByRole("heading", { level: 6 })).toHaveTextContent("Entries: 4");
    
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /find error/i })).toBeInTheDocument();

    // these two come from ButtonWithTooltip mock
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finalize/i })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  })

  it("renders the DataGrid with the current rows", () => {
    renderForm(props);

    const grid = screen.getByTestId("DataGridMock");
    expect(grid).toBeInTheDocument();

    // rows come from props.rows
    expect(grid).toHaveAttribute("data-rows", String(currentRows.length));

    // columns are built from tmntData in Redux; should be > 0
    const cols = Number(grid.getAttribute("data-cols"));
    expect(cols).toBeGreaterThan(0);

    // optional sanity checks
    expect(grid).toHaveAttribute("data-editmode", "cell");
    expect(grid).toHaveAttribute("data-hidefooter", "true");
    expect(screen.getByTestId("DataGridMock")).toHaveAttribute("data-rows", "4");
  });
  
})