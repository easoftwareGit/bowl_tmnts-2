import { screen, waitFor } from "@testing-library/react";
import {
  getCashersError,
  getCashersInput,
  getExpensesInput,
  getGridMountCount,
  getLatestGridProps,
  getLatestRows,
  getPrizeFundInput,
  mockPush,
  mockUseUnsavedChangesGuard,
  setup,
  standardBeforeEach,
  triggerBack,
  triggerGridCancel,
  triggerGridDataChanged,
  triggerGridDataReset,
  triggerNavigateAfterSave,
  triggerSaveComplete,
} from "./potPfPage.testSetup.test";

describe("Pot Prize Fund web page grid callbacks", () => {
  beforeEach(standardBeforeEach);

  /*********
   * Props *
   *********/

  describe("props passed to the grid", () => {
    it("passes the pot id, loaded rows and editing flag", () => {
      const { potId, populatedRows } = setup();

      const gridProps = getLatestGridProps();

      expect(gridProps?.potId).toBe(potId);
      expect(gridProps?.rows).toEqual(populatedRows);
      expect(gridProps?.enableEditing).toBe(true);
      expect(gridProps?.gridDataWasChanged).toBe(false);
    });

    it("passes every callback, including onCancel", () => {
      setup();

      const gridProps = getLatestGridProps();

      expect(gridProps?.setRows).toEqual(expect.any(Function));
      expect(gridProps?.onGridDataChanged).toEqual(expect.any(Function));
      expect(gridProps?.onGridDataReset).toEqual(expect.any(Function));
      expect(gridProps?.onNavigateAfterSave).toEqual(expect.any(Function));
      expect(gridProps?.onBack).toEqual(expect.any(Function));
      expect(gridProps?.onSaveComplete).toEqual(expect.any(Function));
      expect(gridProps?.onCancel).toEqual(expect.any(Function));
    });

    it("passes the per-game prize fund as the total for a Game pot", () => {
      const { expected } = setup({ potType: "Game" });

      expect(expected.isGamePot).toBe(true);
      expect(getLatestGridProps()?.totalPrizeFund).toBe(expected.perGame);
    });

    it.each(["Last Game", "Series"] as const)(
      "passes the whole prize fund as the total for a %s pot",
      (potType) => {
        const { expected } = setup({ potType });

        expect(expected.isGamePot).toBe(false);
        expect(getLatestGridProps()?.totalPrizeFund).toBe(expected.prizeFund);
      },
    );

    it("passes gridDataWasChanged=true when only the page inputs changed", async () => {
      const { user } = setup();

      await user.type(getExpensesInput(), "1");

      // the grid was not edited, but its Save and Cancel must be enabled
      expect(getLatestGridProps()?.gridDataWasChanged).toBe(true);
    });
  });

  /************************************
   * onGridDataChanged / onGridDataReset *
   ************************************/

  describe("onGridDataChanged and onGridDataReset", () => {
    it("sets gridDataWasChanged to true when onGridDataChanged is called", () => {
      setup();

      expect(getLatestGridProps()?.gridDataWasChanged).toBe(false);

      triggerGridDataChanged();

      expect(getLatestGridProps()?.gridDataWasChanged).toBe(true);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("sets gridDataWasChanged to false when onGridDataReset is called", () => {
      setup();

      triggerGridDataChanged();
      expect(getLatestGridProps()?.gridDataWasChanged).toBe(true);

      triggerGridDataReset();

      expect(getLatestGridProps()?.gridDataWasChanged).toBe(false);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("onGridDataReset alone does not clear page input changes", async () => {
      const { user } = setup();

      await user.type(getExpensesInput(), "1");
      triggerGridDataChanged();

      triggerGridDataReset();

      // the page inputs are still changed; only onCancel clears them
      expect(getLatestGridProps()?.gridDataWasChanged).toBe(true);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });
  });

  /************
   * onCancel *
   ************/

  describe("onCancel", () => {
    it("restores the loaded rows, cashers, expenses and prize fund", async () => {
      const { user, expected, populatedRows } = setup();

      // add cashers up to the maximum (also shows the range error)
      await user.clear(getCashersInput());
      await user.type(getCashersInput(), "999");
      await user.tab();
      expect(getCashersError()).not.toHaveTextContent("");

      // apply different expenses
      await user.clear(getExpensesInput());
      await user.type(getExpensesInput(), "1");
      await user.tab();

      triggerGridDataChanged();

      triggerGridCancel();

      expect(getLatestRows()).toEqual(populatedRows);
      expect(getCashersInput()).toHaveValue(expected.numCashers);
      expect(getCashersError()).toHaveTextContent("");
      expect(getExpensesInput()).toHaveValue(expected.expenses.toFixed(2));
      expect(getPrizeFundInput()).toHaveValue(String(expected.prizeFund));
      expect(getLatestGridProps()?.totalPrizeFund)
        .toBe(expected.gridTotalPrizeFund);
    });

    it("clears both change flags and turns the guard off", async () => {
      const { user } = setup();

      await user.type(getExpensesInput(), "1");
      triggerGridDataChanged();
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      triggerGridCancel();

      expect(getLatestGridProps()?.gridDataWasChanged).toBe(false);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("remounts the grid so Syncfusion rebuilds from the saved rows", () => {
      setup();

      const mountsBefore = getGridMountCount();

      triggerGridDataChanged();
      triggerGridCancel();

      expect(getGridMountCount()).toBe(mountsBefore + 1);
    });

    it("restores the rows from the last save, not from page load", () => {
      const { populatedRows } = setup();

      const savedRows = populatedRows.map((row) => ({
        ...row,
        amount: row.amount + 5,
      }));
      triggerSaveComplete(savedRows);

      triggerGridDataChanged();
      triggerGridCancel();

      expect(getLatestRows()).toEqual(savedRows);
    });

    it("does not navigate", () => {
      setup();

      triggerGridDataChanged();
      triggerGridCancel();

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  /******************
   * onSaveComplete *
   ******************/

  describe("onSaveComplete", () => {
    it("updates the rows and clears page data changes", async () => {
      const { user, populatedRows } = setup();

      await user.type(getExpensesInput(), "1");
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      triggerSaveComplete(populatedRows);

      expect(getLatestGridProps()?.rows).toEqual(populatedRows);
      expect(getLatestGridProps()?.gridDataWasChanged).toBe(false);

      await waitFor(() => {
        expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
      });
    });

    it("does not remount the grid", () => {
      setup();

      const mountsBefore = getGridMountCount();

      triggerSaveComplete();

      expect(getGridMountCount()).toBe(mountsBefore);
    });
  });

  /****************************
   * onNavigateAfterSave / onBack *
   ****************************/

  describe("onNavigateAfterSave and onBack", () => {
    it("navigates to the Run Tournament page after save", async () => {
      const { runTmntUrl } = setup();

      triggerSaveComplete();
      triggerNavigateAfterSave();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
    });

    it("navigates back when onBack is called with no changes", () => {
      const { runTmntUrl } = setup();

      triggerBack();

      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  it("shows the grid", () => {
    setup();

    expect(screen.getByTestId("mock-pot-prize-fund-grid")).toBeInTheDocument();
  });
});
