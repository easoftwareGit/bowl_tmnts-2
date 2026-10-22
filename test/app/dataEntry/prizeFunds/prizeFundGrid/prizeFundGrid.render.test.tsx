import { screen, within } from "@testing-library/react";
import type { idTypes } from "@/lib/types/types";

/*
 * Import the shared test setup before anything that imports PrizeFundGrid.
 *
 * The setup module registers mocks for Syncfusion, the Syncfusion license
 * module, columns, aggregates, and modals. Those mocks must exist before
 * PrizeFundGrid is imported.
 */
import {
  defaultGridId,
  defaultTotalPrizeFund,
  getLatestGridProps,
  makeRows,
  mockRefresh,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";
import { createPfColumns } from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns";
import {
  createPfDiffAggregates,
  createPfTotalAggregates,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfPfAggregates";
import { sfRowHeight } from "@/lib/syncfusionTools";

const mockCreatePfColumns = jest.mocked(createPfColumns);
const mockCreatePfTotalAggregates = jest.mocked(createPfTotalAggregates);
const mockCreatePfDiffAggregates = jest.mocked(createPfDiffAggregates);

/** The getter PrizeFundGrid passed to createPfDiffAggregates. */
const getDiffAggregateTotalGetter = (): (() => number) =>
  mockCreatePfDiffAggregates.mock.calls[0][0] as () => number;

const expectedEditSettings = (allowEditing: boolean) => ({
  allowEditing,
  allowAdding: false,
  allowDeleting: false,
  mode: "Batch",
  showConfirmDialog: false,
  showDeleteConfirmDialog: false,
});

describe("PrizeFundGrid render", () => {
  beforeEach(standardBeforeEach);

  /***********************
   * Grid configuration  *
   ***********************/

  describe("grid configuration", () => {
    it("renders the Syncfusion grid with the expected base configuration", () => {
      setup();

      expect(screen.getByTestId("mock-prize-fund-grid")).toBeInTheDocument();

      const gridProps = getLatestGridProps();

      expect(gridProps).not.toBeNull();
      expect(gridProps?.id).toBe(defaultGridId);
      expect(gridProps?.allowSelection).toBe(true);
      expect(gridProps?.allowSorting).toBe(false);
      expect(gridProps?.enableStickyHeader).toBe(true);
      expect(gridProps?.gridLines).toBe("Both");
      expect(gridProps?.width).toBe("450");
      expect(gridProps?.rowHeight).toBe(sfRowHeight);
      expect(gridProps?.selectionSettings).toEqual({ mode: "Cell" });
    });

    it("passes the Syncfusion event handlers to the grid", () => {
      setup();

      const gridProps = getLatestGridProps();

      expect(gridProps?.actionComplete).toEqual(expect.any(Function));
      expect(gridProps?.cellSaved).toEqual(expect.any(Function));
      expect(gridProps?.recordClick).toEqual(expect.any(Function));
      expect(gridProps?.recordDoubleClick).toEqual(expect.any(Function));
      expect(gridProps?.toolbarClick).toEqual(expect.any(Function));
    });

    it("uses the component's default height of 150 when gridHeight is not supplied", () => {
      const { rerender } = setup();

      // setup() always passes a height, so remove it to hit the
      // component's own default.
      rerender({ gridHeight: undefined });

      expect(getLatestGridProps()?.height).toBe("150");
    });

    it.each([
      ["string", "500"],
      ["numeric", 500],
    ] as const)("uses a %s gridHeight when one is supplied", (_label, height) => {
      setup({ gridHeight: height });

      expect(getLatestGridProps()?.height).toBe(height);
    });
  });

  /*****************
   * Edit settings *
   *****************/

  describe("edit settings", () => {
    it("uses batch editing and enables editing when enableEditing is true", () => {
      setup({ enableEditing: true });

      expect(getLatestGridProps()?.editSettings).toEqual(
        expectedEditSettings(true),
      );
    });

    it("enables editing by default when enableEditing is not supplied", () => {
      const { rerender } = setup({ enableEditing: false });

      rerender({ enableEditing: undefined });

      expect(getLatestGridProps()?.editSettings).toEqual(
        expectedEditSettings(true),
      );
    });

    it("disables grid editing when enableEditing is false", () => {
      setup({ enableEditing: false });

      expect(getLatestGridProps()?.editSettings).toEqual(
        expectedEditSettings(false),
      );
    });
  });

  /***************
   * Data source *
   ***************/

  describe("data source", () => {
    it("passes a mutable copy of the supplied rows to the grid", () => {
      const rows = makeRows();

      setup({ rows });

      const gridRows = getLatestGridProps()?.dataSource;

      expect(gridRows).toEqual(rows);
      expect(gridRows).not.toBe(rows);
      rows.forEach((row, index) => {
        expect(gridRows?.[index]).not.toBe(row);
      });
    });

    it("keeps the same data source when rows are unchanged", () => {
      const { rerender } = setup();

      const firstDataSource = getLatestGridProps()?.dataSource;

      rerender({ totalPrizeFund: defaultTotalPrizeFund + 100 });

      expect(getLatestGridProps()?.dataSource).toBe(firstDataSource);
    });

    it("creates a new data source when rows change", () => {
      const { rerender } = setup();

      const firstDataSource = getLatestGridProps()?.dataSource;
      const newRows = makeRows().map((row) => ({
        ...row,
        amount: row.amount * 2,
      }));

      rerender({ rows: newRows });

      const newDataSource = getLatestGridProps()?.dataSource;

      expect(newDataSource).not.toBe(firstDataSource);
      expect(newDataSource).toEqual(newRows);
      expect(newDataSource).not.toBe(newRows);
    });
  });

  /**************************
   * Columns and aggregates *
   **************************/

  describe("columns and aggregates", () => {
    it("creates the prize fund columns", () => {
      setup();

      expect(mockCreatePfColumns).toHaveBeenCalledTimes(1);
    });

    it("creates the total and difference aggregates", () => {
      setup();

      expect(mockCreatePfTotalAggregates).toHaveBeenCalledTimes(1);
      expect(mockCreatePfDiffAggregates).toHaveBeenCalledTimes(1);
      expect(mockCreatePfDiffAggregates).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it("creates the difference aggregates only once", () => {
      const { rerenderWithTotalPrizeFund } = setup();

      rerenderWithTotalPrizeFund(defaultTotalPrizeFund + 100);

      expect(mockCreatePfDiffAggregates).toHaveBeenCalledTimes(1);
    });

    it("gives the difference aggregates a getter that returns the current total", () => {
      setup({ totalPrizeFund: 200 });

      expect(getDiffAggregateTotalGetter()()).toBe(200);
    });

    it("updates the difference aggregate total when the total prize fund changes", () => {
      const { rerenderWithTotalPrizeFund } = setup({ totalPrizeFund: 200 });

      const getTotal = getDiffAggregateTotalGetter();

      rerenderWithTotalPrizeFund(300);

      // Same getter created on first render, but it reads the latest total.
      expect(getTotal()).toBe(300);
    });

    it("gives the difference aggregates the total rounded to two decimals", () => {
      setup({ totalPrizeFund: 200.004 });

      expect(getDiffAggregateTotalGetter()()).toBe(200);
    });
  });

  /***********
   * Toolbar *
   ***********/

  describe("toolbar", () => {
    it("passes all five toolbar items to the grid", () => {
      setup();

      expect(getLatestGridProps()?.toolbar).toEqual([
        {
          text: "Edit",
          tooltipText: "Double-click to edit an amount",
          id: "edit",
          prefixIcon: "e-icons e-edit",
        },
        {
          text: "Save",
          tooltipText: "Save the amounts",
          id: "save",
          prefixIcon: "e-icons e-check",
        },
        {
          text: "Save and Close",
          tooltipText: "Save the amounts and return to the Run Tournament page",
          id: "done",
          prefixIcon: "e-icons e-update",
        },
        {
          text: "Cancel",
          tooltipText: "cancel all changes since last save",
          id: "undo_all",
          prefixIcon: "e-icons e-cancel",
        },
        {
          text: "Back",
          tooltipText: "Back to the Run Tournament page",
          id: "back",
          prefixIcon: "e-icons e-back",
        },
      ]);
    });

    it("renders the five toolbar buttons in order", () => {
      setup();

      const buttons = within(
        screen.getByTestId("mock-prize-fund-grid"),
      ).getAllByRole("button");

      expect(buttons.map((button) => button.textContent)).toEqual([
        "Edit",
        "Save",
        "Save and Close",
        "Cancel",
        "Back",
      ]);
    });
  });

  /**********
   * Modals *
   **********/

  describe("modals", () => {
    it("does not render the confirmation modal initially", () => {
      setup();

      expect(
        screen.queryByRole("dialog", { name: "confirm-modal" }),
      ).not.toBeInTheDocument();
    });

    it("does not render the error modal initially", () => {
      setup();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does not render the wait modal when saveStatus is idle", () => {
      setup({ saveStatus: "idle" });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("renders the wait modal when saveStatus is saving", () => {
      setup({ saveStatus: "saving" });

      expect(screen.getByRole("status")).toHaveTextContent("Saving...");
    });

    it("shows and hides the wait modal as saveStatus changes", () => {
      const { rerender } = setup({ saveStatus: "idle" });

      rerender({ saveStatus: "saving" });
      expect(screen.getByRole("status")).toHaveTextContent("Saving...");

      rerender({ saveStatus: "saved" });
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  /*****************
   * prizeFundType *
   *****************/

  describe("prizeFundType", () => {
    it.each(["div", "pot", "elm"] as const)(
      "accepts %s as a valid prizeFundType",
      (prizeFundType) => {
        expect(() => setup({ prizeFundType })).not.toThrow();

        expect(screen.getByTestId("mock-prize-fund-grid")).toBeInTheDocument();
      },
    );

    it("throws an error for an unsupported prizeFundType", () => {
      // React logs the thrown render error; keep test output clean.
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      expect(() =>
        setup({ prizeFundType: "brkt" as unknown as idTypes }),
      ).toThrow("prizeFundType must be 'div', 'pot', or 'elm'");

      consoleErrorSpy.mockRestore();
    });
  });

  /***************
   * Grid handle *
   ***************/

  it("exposes the public grid handle", () => {
    const { gridHandleRef } = setup();

    expect(gridHandleRef.current).not.toBeNull();
    expect(gridHandleRef.current?.getCurrentRows).toEqual(expect.any(Function));
  });

  /****************************
   * Refresh on total changes *
   ****************************/

  describe("grid refresh", () => {
    it("refreshes the grid when initially rendered", () => {
      setup();

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it("refreshes the grid when the total prize fund changes", () => {
      const { rerenderWithTotalPrizeFund } = setup({ totalPrizeFund: 200 });

      // Ignore the refresh from the initial render.
      mockRefresh.mockClear();

      rerenderWithTotalPrizeFund(250);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it("does not refresh the grid when the total prize fund is unchanged", () => {
      const { rerenderWithTotalPrizeFund } = setup({ totalPrizeFund: 200 });

      mockRefresh.mockClear();

      rerenderWithTotalPrizeFund(200);

      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("does not refresh the grid when the total changes by less than a cent", () => {
      const { rerenderWithTotalPrizeFund } = setup({ totalPrizeFund: 200 });

      mockRefresh.mockClear();

      // Rounds to 200.00, the same as the current total.
      rerenderWithTotalPrizeFund(200.004);

      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});
