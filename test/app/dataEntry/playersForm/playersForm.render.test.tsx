import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
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
import type { bowlType } from "@/lib/types/types";
import { ioDataError } from "@/lib/enums/enums";

import PlayersEntryForm from "@/app/dataEntry/playersForm/playersForm";
import {
  playerEntryRow,
  populatePlayerRows,
} from "@/app/dataEntry/playersForm/populatePlayerRows";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: mockPush,
      prefetch: jest.fn(),
    };
  },
}));

jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  delConfTitle: "Confirm Delete",
  cancelConfTitle: "Cancel All",
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
      <div data-testid="ModalErrorMsgMock" role="dialog" aria-label="error-modal">
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

let mockSaveStatus: "idle" | "saving" | "succeeded" | "failed" = "idle";
const mockSaveTmntEntriesData = jest.fn();

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => {
  const actual = jest.requireActual(
    "@/redux/features/tmntFullData/tmntFullDataSlice",
  );

  return {
    __esModule: true,
    ...actual,
    saveTmntEntriesData: (...args: unknown[]) =>
      mockSaveTmntEntriesData(...args),
    getTmntDataSaveStatus: () => mockSaveStatus,
  };
});

type MockGridProps = {
  toolbarClick?: (args: unknown) => unknown | Promise<unknown>;
  actionBegin?: (args: unknown) => unknown;
  actionComplete?: (args: unknown) => unknown | Promise<unknown>;
  created?: () => void;

  id?: string;
  dataSource?: unknown[];
  height?: string | number;
  allowResizing?: boolean;
  allowSorting?: boolean;
  gridLines?: string;
  editSettings?: unknown;
  toolbar?: unknown;

  children?: React.ReactNode;
};

export let lastGridProps: MockGridProps | null = null;
export let lastColumnDirectives: Record<string, unknown>[] = [];
export let lastAggregateColumnDirectives: Record<string, unknown>[] = [];

export const mockEnableToolbarItems = jest.fn();
export const mockToolbarEnableItems = jest.fn();

jest.mock("@syncfusion/ej2-react-grids", () => ({
  __esModule: true,

  GridComponent: React.forwardRef<HTMLDivElement, MockGridProps>(
    function GridComponentMock(props, ref) {
      lastGridProps = props;

      React.useImperativeHandle(ref, () => {
        const element = document.createElement("div");
        element.id = "playersGrid";

        [
          "playersGrid_commit_row",
          "playersGrid_save",
          "playersGrid_validate",
          "playersGrid_cancel_all",
        ].forEach((id) => {
          const button = document.createElement("button");
          button.id = id;
          element.appendChild(button);
        });

        return {
          element,
          dataSource: props.dataSource,
          getColumns: jest.fn(() => []),
          getCurrentViewRecords: jest.fn(() => props.dataSource ?? []),
          getSelectedRecords: jest.fn(() => []),
          getColumnByIndex: jest.fn(),
          enableToolbarItems: mockEnableToolbarItems,
          refresh: jest.fn(),
          endEdit: jest.fn(),
          aggregateModule: {
            refresh: jest.fn(),
          },
          toolbarModule: {
            enableItems: mockToolbarEnableItems,
          },
        } as unknown as HTMLDivElement;
      });

      return (
        <div
          ref={ref}
          data-testid="GridComponentMock"
          data-id={String(props.id)}
          data-rows={
            Array.isArray(props.dataSource)
              ? String(props.dataSource.length)
              : "0"
          }
          data-height={String(props.height)}
          data-allowresizing={String(props.allowResizing)}
          data-allowsorting={String(props.allowSorting)}
          data-gridlines={String(props.gridLines)}
        >
          {props.children as React.ReactNode}
        </div>
      );
    },
  ),

  ColumnsDirective: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ColumnsDirectiveMock">{children}</div>
  ),

  ColumnDirective: (props: Record<string, unknown>) => {
    lastColumnDirectives.push(props);

    return (
      <div
        data-testid="ColumnDirectiveMock"
        data-headertext={String(props.headerText)}
      />
    );
  },

  AggregatesDirective: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="AggregatesDirectiveMock">{children}</div>
  ),

  AggregateDirective: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="AggregateDirectiveMock">{children}</div>
  ),

  AggregateColumnsDirective: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="AggregateColumnsDirectiveMock">{children}</div>
  ),

  AggregateColumnDirective: (props: Record<string, unknown>) => {
    lastAggregateColumnDirectives.push(props);

    return (
      <div
        data-testid="AggregateColumnDirectiveMock"
        data-field={String(props.field)}
      />
    );
  },

  Inject: () => <div data-testid="InjectMock" />,

  Aggregate: jest.fn(),
  Edit: jest.fn(),
  Resize: jest.fn(),
  Sort: jest.fn(),
  Toolbar: jest.fn(),
}));

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
  bowls?: bowlType[];
}) => {
  const store = makeStore(opts?.bowls ?? [mockBowl]);

  let rowsState = opts?.rows ?? populatePlayerRows(mockTmntFullData);

  const setRows = jest.fn((updater: React.SetStateAction<playerEntryRow[]>) => {
    rowsState = typeof updater === "function" ? updater(rowsState) : updater;
    return rowsState;
  });

  render(
    <Provider store={store}>
      <PlayersEntryForm rows={rowsState} setRows={setRows} />
    </Provider>,
  );

  return {
    store,
    setRows,
    getRowsState: () => rowsState,
  };
};

const currentRows = populatePlayerRows(mockTmntFullData);

describe("PlayersEntryForm2a - render", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveStatus = "idle";
    lastGridProps = null;
    lastColumnDirectives = [];
    lastAggregateColumnDirectives = [];
    mockEnableToolbarItems.mockClear();
    mockToolbarEnableItems.mockClear();    
  });

  describe("initial render", () => {

    it("renders the form headings", () => {
      renderForm({ rows: currentRows });

      expect(screen.getByRole("heading", { level: 5 })).toHaveTextContent(
        "Tournament: Mock Tournament",
      );

      expect(screen.getByRole("heading", { level: 6 })).toHaveTextContent(
        `Entries: ${currentRows.length}`,
      );
    });

    it("renders the Syncfusion GridComponent with the current rows", () => {
      renderForm({ rows: currentRows });

      const grid = screen.getByTestId("GridComponentMock");

      expect(grid).toBeInTheDocument();
      expect(grid).toHaveAttribute("data-id", "playersGrid");
      expect(grid).toHaveAttribute("data-rows", String(currentRows.length));
      expect(grid).toHaveAttribute("data-height", "450");
      expect(grid).toHaveAttribute("data-allowresizing", "true");
      expect(grid).toHaveAttribute("data-allowsorting", "true");
      expect(grid).toHaveAttribute("data-gridlines", "Both");
    });

    it("passes the expected edit settings and toolbar options to the grid", () => {
      renderForm({ rows: currentRows });

      expect(lastGridProps).not.toBeNull();

      expect(lastGridProps?.editSettings).toEqual({
        allowEditing: true,
        allowAdding: true,
        allowDeleting: true,
        mode: "Normal",
        showDeleteConfirmDialog: false,
      });

      expect(lastGridProps?.toolbar).toEqual(
        expect.arrayContaining([
          "Add",
          "Edit",
          "Delete",
          "Cancel",
          expect.objectContaining({
            text: "Commit Row",
            id: "commit_row",
          }),
          expect.objectContaining({
            text: "Save",
            id: "save",
          }),
          expect.objectContaining({
            text: "Validate & Save",
            id: "validate",
          }),
          expect.objectContaining({
            text: "Cancel All",
            id: "cancel_all",
          }),
        ]),
      );
    });
    
    it("renders stacked column directives and aggregate column directives", () => {
      renderForm({ rows: currentRows });

      expect(screen.getByTestId("ColumnsDirectiveMock")).toBeInTheDocument();
      expect(screen.getByTestId("AggregatesDirectiveMock")).toBeInTheDocument();

      expect(lastColumnDirectives.length).toBeGreaterThan(0);
      expect(lastAggregateColumnDirectives.length).toBeGreaterThan(0);
    });

    it("enables Finalize and disables Save on initial render", async () => {
      renderForm({ rows: currentRows });

      act(() => {
        lastGridProps?.created?.();
      });

      await waitFor(() => {
        expect(mockEnableToolbarItems).toHaveBeenCalledWith(
          ["playersGrid_commit_row"],
          false,
        );
      });

      expect(mockEnableToolbarItems).toHaveBeenCalledWith(
        ["playersGrid_validate"],
        true,
      );
      
      expect(mockToolbarEnableItems).toHaveBeenCalledWith(
        ["playersGrid_save"],
        false,
      );
    });
  });

  describe("modals", () => {

    it("renders the top-level modals hidden by default", () => {
      renderForm({ rows: currentRows });

      expect(screen.getByTestId("ModalConfirmMock")).toHaveAttribute(
        "data-show",
        "false",
      );

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
        "data-show",
        "false",
      );
    });

    it("renders the error modal hidden by default", () => {
      renderForm({ rows: currentRows });

      expect(screen.getByTestId("ModalErrorMsgMock")).toHaveAttribute(
        "data-show",
        "false",
      );
    });

    it("shows wait modal while saving", () => {
      mockSaveStatus = "saving";

      renderForm({ rows: currentRows });

      expect(
        screen.getByRole("dialog", { name: "wait-modal" }),
      ).toHaveTextContent("Saving...");
    });
  });

  describe("validate toolbar action", () => {

    it("shows error modal when validate is clicked with no rows", async () => {
      renderForm({ rows: [] });
      
      await act(async () => {
        await lastGridProps?.toolbarClick?.({
          item: {
            id: "validate",
          },
        });
      });      

      expect(screen.getByTestId("ModalErrorMsgMock")).toBeInTheDocument();

      expect(screen.getByTestId("error-title")).toHaveTextContent(
        "No rows to validate",
      );

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Enter player data before validating.",
      );      
    });

    it("closes the error modal when Close is clicked", async () => {
      renderForm({ rows: [] });

      await act(async () => {
        await lastGridProps?.toolbarClick?.({
          item: {
            id: "validate",
          },
        });
      });      

      expect(screen.getByTestId("ModalErrorMsgMock")).toBeInTheDocument();

      await act(async () => {
        screen.getByRole("button", { name: "Close" }).click();
      });

      expect(screen.getByTestId("ModalErrorMsgMock")).toHaveAttribute(
        "data-show",
        "false",
      );
    });

    it("opens finalize confirmation modal", async () => {
      renderForm({ rows: currentRows });

      await act(async () => {
        await lastGridProps?.toolbarClick?.({
          item: {
            id: "validate",
          },
        });
      });      

      expect(screen.getByTestId("ModalConfirmMock")).toBeInTheDocument();

      expect(screen.getByTestId("confirm-title")).toHaveTextContent(
        "Validate Bowlers",
      );

      expect(screen.getByTestId("confirm-message")).
        toHaveTextContent(/validate all bowler entries/i);      
    });

    it("closes finalize confirmation modal when No is clicked", async () => {
      renderForm({ rows: currentRows });

      await act(async () => {
        await lastGridProps?.toolbarClick?.({
          item: {
            id: "validate",
          },
        });
      });      

      await act(async () => {
        screen.getByRole("button", { name: "No" }).click();
      });

      expect(screen.getByTestId("ModalConfirmMock")).toHaveAttribute(
        "data-show",
        "false",
      );
    });
  });

  describe("cancel all toolbar action", () => {

    it("navigates immediately when cancel all is clicked with no rows", async () => {
      renderForm({ rows: [] });

      await lastGridProps?.toolbarClick?.({
        item: {
          id: "cancel_all",
        },
      });

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`,
      );
    });

    it("opens cancel confirmation modal when rows exist", async () => {
      renderForm({ rows: currentRows });

      await act(async () => {
        await lastGridProps?.toolbarClick?.({
          item: {
            id: "cancel_all",
          },
        });
      });

      expect(screen.getByTestId("ModalConfirmMock")).toBeInTheDocument();

      expect(screen.getByTestId("confirm-title")).toHaveTextContent(
        "Cancel All",
      );
    });

    it("navigates away when cancel all is confirmed", async () => {
      renderForm({ rows: currentRows });

      await act(async () => {
        await lastGridProps?.toolbarClick?.({
          item: {
            id: "cancel_all",
          },
        });
      });

      screen.getByRole("button", { name: "Yes" }).click();

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`,
      );
    });
  });

  describe("delete actions", () => {

    it("opens delete confirmation modal on delete action", async () => {
      renderForm({ rows: currentRows });

      const row = currentRows[0];

      const args = {
        requestType: "delete",
        cancel: false,
        data: row,
      };

      await act(async () => {
        lastGridProps?.actionBegin?.(args);
      });

      expect(args.cancel).toBe(true);

      expect(screen.getByTestId("confirm-title")).toHaveTextContent(
        "Confirm Delete",
      );
    });
      
    it("removes the row when delete is confirmed", async () => {
      const { setRows } = renderForm({ rows: currentRows });

      const row = currentRows[0];

      await act(async () => {
        lastGridProps?.actionBegin?.({
          requestType: "delete",
          cancel: false,
          data: row,
        });
      });

      await act(async () => {
        screen.getByRole("button", { name: "Yes" }).click();
      });

      expect(setRows).toHaveBeenCalled();
    });
  });  
  
  describe("readonly mode", () => {

    it("shows readonly warning when enableEditing is false", () => {
      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <PlayersEntryForm
            rows={currentRows}
            setRows={jest.fn()}
            enableEditing={false}
          />
        </Provider>,
      );

      expect(
        screen.getByText(
          "This tournament has been validated. Bowler editing is disabled.",
        ),
      ).toBeInTheDocument();
    });

    it("changes cancel button text to Return to Run", () => {
      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <PlayersEntryForm
            rows={currentRows}
            setRows={jest.fn()}
            enableEditing={false}
          />
        </Provider>,
      );

      expect(lastGridProps?.toolbar).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: "Return to Run",
            id: "cancel_all",
          }),
        ]),
      );
    });

    it("disables editing in editSettings when readonly", () => {
      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <PlayersEntryForm
            rows={currentRows}
            setRows={jest.fn()}
            enableEditing={false}
          />
        </Provider>,
      );

      expect(lastGridProps?.editSettings).toEqual({
        allowEditing: false,
        allowAdding: false,
        allowDeleting: false,
        mode: "Normal",
        showDeleteConfirmDialog: false,
      });
    });

    it("navigates immediately when Return to Run is clicked", async () => {
      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <PlayersEntryForm
            rows={currentRows}
            setRows={jest.fn()}
            enableEditing={false}
          />
        </Provider>,
      );

      await act(async () => {
        await lastGridProps?.toolbarClick?.({
          item: {
            id: "cancel_all",
          },
        });
      });

      expect(mockPush).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${mockTmntFullData.tmnt.id}`,
      );
    });
  });  
  
});