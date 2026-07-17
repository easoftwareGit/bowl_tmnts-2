import React from "react";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

/*
 * Import the shared test setup before PrizeFundGrid.
 *
 * The setup module registers mocks for Syncfusion, the Syncfusion license
 * module, columns, aggregates, and modals. Those mocks must exist before
 * PrizeFundGrid is imported.
 */
import {
  getLatestGridProps,
  makeRows,
  mockEnableItems,
  mockRefresh,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";
import PrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import {
  createPfColumns,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns";
import {
  createPfDiffAggregates,
  createPfTotalAggregates,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfPfAggregates";

const mockCreatePfColumns = jest.mocked(
  createPfColumns,
);

const mockCreatePfTotalAggregates = jest.mocked(
  createPfTotalAggregates,
);

const mockCreatePfDiffAggregates = jest.mocked(
  createPfDiffAggregates,
);

describe("PrizeFundGrid render", () => {
  beforeEach(standardBeforeEach);

  it("renders the Syncfusion grid with the expected base configuration", () => {
    setup();

    expect(
      screen.getByTestId("mock-prize-fund-grid"),
    ).toBeInTheDocument();

    const gridProps = getLatestGridProps();

    expect(gridProps).not.toBeNull();
    expect(gridProps?.id).toBe(
      "test-prize-fund-grid",
    );
    expect(gridProps?.allowSelection).toBe(true);
    expect(gridProps?.allowSorting).toBe(false);
    expect(gridProps?.enableStickyHeader).toBe(true);
    expect(gridProps?.gridLines).toBe("Both");
    expect(gridProps?.width).toBe("450");
    expect(gridProps?.height).toBe("350");

    expect(gridProps?.selectionSettings).toEqual({
      mode: "Cell",
    });
  });

  it("passes the Syncfusion event handlers to the grid", () => {
    setup();

    const gridProps = getLatestGridProps();

    expect(gridProps?.actionComplete).toEqual(
      expect.any(Function),
    );
    expect(gridProps?.cellSaved).toEqual(
      expect.any(Function),
    );
    expect(gridProps?.recordClick).toEqual(
      expect.any(Function),
    );
    expect(gridProps?.recordDoubleClick).toEqual(
      expect.any(Function),
    );
    expect(gridProps?.toolbarClick).toEqual(
      expect.any(Function),
    );
  });

  it("uses the default grid height when gridHeight is not supplied", () => {
    setup();

    expect(getLatestGridProps()?.height).toBe(
      "350",
    );
  });

  it("uses a string gridHeight when one is supplied", () => {
    setup({
      gridHeight: "500",
    });

    expect(getLatestGridProps()?.height).toBe(
      "500",
    );
  });

  it("uses a numeric gridHeight when one is supplied", () => {
    setup({
      gridHeight: 500,
    });

    expect(getLatestGridProps()?.height).toBe(
      500,
    );
  });

  it("uses batch editing and enables editing by default", () => {
    setup();

    expect(
      getLatestGridProps()?.editSettings,
    ).toEqual({
      allowEditing: true,
      allowAdding: false,
      allowDeleting: false,
      mode: "Batch",
      showConfirmDialog: false,
      showDeleteConfirmDialog: false,
    });
  });

  it("disables grid editing when enableEditing is false", () => {
    setup({
      enableEditing: false,
    });

    expect(
      getLatestGridProps()?.editSettings,
    ).toEqual({
      allowEditing: false,
      allowAdding: false,
      allowDeleting: false,
      mode: "Batch",
      showConfirmDialog: false,
      showDeleteConfirmDialog: false,
    });
  });

  it("passes a mutable copy of the supplied rows to the grid", () => {
    const rows = makeRows();

    setup({
      rows,
    });

    const gridRows =
      getLatestGridProps()?.dataSource;

    expect(gridRows).toEqual(rows);
    expect(gridRows).not.toBe(rows);

    expect(gridRows?.[0]).not.toBe(rows[0]);
    expect(gridRows?.[1]).not.toBe(rows[1]);
    expect(gridRows?.[2]).not.toBe(rows[2]);
  });

  it("creates the prize fund columns", () => {
    setup();

    expect(
      mockCreatePfColumns,
    ).toHaveBeenCalledTimes(1);
  });

  it("creates the total and difference aggregates", () => {
    setup({
      totalPrizeFund: 200,
    });

    expect(
      mockCreatePfTotalAggregates,
    ).toHaveBeenCalledTimes(1);

    expect(
      mockCreatePfDiffAggregates,
    ).toHaveBeenCalledTimes(1);

    expect(
      mockCreatePfDiffAggregates,
    ).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it("creates the difference aggregates only once", () => {
    const {
      rerenderWithTotalPrizeFund,
    } = setup({
      totalPrizeFund: 200,
    });

    expect(
      mockCreatePfDiffAggregates,
    ).toHaveBeenCalledTimes(1);

    rerenderWithTotalPrizeFund(300);

    expect(
      mockCreatePfDiffAggregates,
    ).toHaveBeenCalledTimes(1);
  });

  it("passes all five toolbar items to the grid", () => {
    setup();

    expect(
      getLatestGridProps()?.toolbar,
    ).toEqual([
      {
        text: "Edit",
        tooltipText:
          "Double-click to edit an amount",
        id: "edit",
        prefixIcon: "e-icons e-edit",
      },
      {
        text: "Save",
        tooltipText: "Save the scores",
        id: "save",
        prefixIcon: "e-icons e-check",
      },
      {
        text: "Save and Close",
        tooltipText:
          "Save the scores and return to the Run Tournament page",
        id: "done",
        prefixIcon: "e-icons e-update",
      },
      {
        text: "Cancel",
        tooltipText:
          "cancel all changes since last save",
        id: "undo_all",
        prefixIcon: "e-icons e-cancel",
      },
      {
        text: "Back",
        tooltipText:
          "Back to the Run Tournament page",
        id: "back",
        prefixIcon: "e-icons e-back",
      },
    ]);
  });

  it("renders all five toolbar buttons", () => {
    setup();

    expect(
      screen.getByRole("button", {
        name: "Edit",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Save",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Save and Close",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Back",
      }),
    ).toBeInTheDocument();
  });

  it("does not render the confirmation modal initially", () => {
    setup();

    expect(
      screen.queryByRole("dialog", {
        name: "confirm-modal",
      }),
    ).not.toBeInTheDocument();
  });

  it("does not render the error modal initially", () => {
    setup();

    expect(
      screen.queryByRole("alert"),
    ).not.toBeInTheDocument();
  });

  it("does not render the wait modal when saveStatus is idle", () => {
    setup({
      saveStatus: "idle",
    });

    expect(
      screen.queryByRole("status"),
    ).not.toBeInTheDocument();
  });

  it("renders the wait modal when saveStatus is saving", () => {
    setup({
      saveStatus: "saving",
    });

    expect(
      screen.getByRole("status"),
    ).toHaveTextContent("Saving...");
  });

  it("disables Save, Save and Close, and Cancel when data has not changed", async () => {
    setup({
      gridDataWasChanged: false,
    });

    await waitFor(() => {
      expect(
        mockEnableItems,
      ).toHaveBeenCalledWith(
        ["save", "done", "undo_all"],
        false,
      );
    });
  });

  it("enables Save, Save and Close, and Cancel when data has changed", async () => {
    setup({
      gridDataWasChanged: true,
    });

    await waitFor(() => {
      expect(
        mockEnableItems,
      ).toHaveBeenCalledWith(
        ["save", "done", "undo_all"],
        true,
      );
    });
  });

  it.each([
    "div",
    "pot",
    "elm",
  ] as const)(
    "accepts %s as a valid prizeFundType",
    (prizeFundType) => {
      expect(() => {
        setup({
          prizeFundType,
        });
      }).not.toThrow();

      expect(
        screen.getByTestId(
          "mock-prize-fund-grid",
        ),
      ).toBeInTheDocument();
    },
  );

  it("throws an error for an unsupported prizeFundType", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => {
      render(
        <PrizeFundGrid
          gridId="invalid-grid"
          prizeFundType={
            "brkt" as React.ComponentProps<
              typeof PrizeFundGrid
            >["prizeFundType"]
          }
          rows={makeRows()}
          setRows={jest.fn()}
          totalPrizeFund={200}
          gridDataWasChanged={false}
          saveStatus="idle"
          onGridDataChanged={jest.fn()}
          onGridDataReset={jest.fn()}
          onSave={
            jest
              .fn()
              .mockResolvedValue(undefined)
          }
          onBack={jest.fn()}
        />,
      );
    }).toThrow(
      "prizeFundType must be 'div', 'pot', or 'elm'",
    );

    consoleErrorSpy.mockRestore();
  });

  it("exposes the public grid handle", () => {
    const {
      gridHandleRef,
    } = setup();

    expect(
      gridHandleRef.current,
    ).not.toBeNull();

    expect(
      gridHandleRef.current?.getCurrentRows,
    ).toEqual(expect.any(Function));
  });

  it("refreshes the grid when initially rendered", () => {
    setup({
      totalPrizeFund: 200,
    });

    expect(
      mockRefresh,
    ).toHaveBeenCalledTimes(1);
  });

  it("refreshes the grid when the total prize fund changes", () => {
    const {
      rerenderWithTotalPrizeFund,
    } = setup({
      totalPrizeFund: 200,
    });

    /*
     * The totalPrizeFund effect runs once during the initial render.
     * Clear that call so this assertion covers only the prop change.
     */
    mockRefresh.mockClear();

    rerenderWithTotalPrizeFund(250);

    expect(
      mockRefresh,
    ).toHaveBeenCalledTimes(1);
  });

  it("does not refresh the grid when the total prize fund remains unchanged", () => {
    const {
      rerenderWithTotalPrizeFund,
    } = setup({
      totalPrizeFund: 200,
    });

    mockRefresh.mockClear();

    rerenderWithTotalPrizeFund(200);

    expect(
      mockRefresh,
    ).not.toHaveBeenCalled();
  });
});
