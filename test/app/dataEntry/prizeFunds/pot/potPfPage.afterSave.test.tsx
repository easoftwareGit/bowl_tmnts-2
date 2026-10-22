import { screen, waitFor } from "@testing-library/react";
import {
  balancePotExpenses,
  getCashersInput,
  getExpensesInput,
  getGridCancelButton,
  getGridMountCount,
  getLatestRows,
  getPrizeFundInput,
  mockPush,
  mockUseUnsavedChangesGuard,
  mockWindowConfirm,
  setup,
  standardBeforeEach,
  triggerGridCancel,
} from "./potPfPage.testSetup.test";

/** "true"/"false" shown by the mocked grid for its gridDataWasChanged prop */
const gridDataWasChangedText = (): string | null =>
  screen.getByTestId("mock-grid-data-was-changed").textContent;

describe("Pot Prize Fund web page after save", () => {
  beforeEach(standardBeforeEach);

  /**************
   * Navigation *
   **************/

  describe("navigation", () => {
    it("navigates to the Run Tournament page after save completes and navigation is requested", async () => {
      const {
        runTmntUrl,
        triggerNavigateAfterSave,
        triggerSaveComplete,
      } = setup();

      triggerSaveComplete();
      triggerNavigateAfterSave();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("does not navigate after save until navigation is requested", () => {
      const { triggerSaveComplete } = setup();

      triggerSaveComplete();

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does not ask to leave the page when navigating after save", async () => {
      const {
        runTmntUrl,
        triggerGridDataChanged,
        triggerNavigateAfterSave,
        triggerSaveComplete,
      } = setup();

      triggerGridDataChanged();
      triggerSaveComplete();
      triggerNavigateAfterSave();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
      expect(mockWindowConfirm).not.toHaveBeenCalled();
    });

    it("waits for page input changes to be saved before navigating", async () => {
      const {
        user,
        runTmntUrl,
        triggerNavigateAfterSave,
        triggerSaveComplete,
      } = setup();

      // typing in Expenses marks the page inputs as changed
      await user.type(getExpensesInput(), "1");

      triggerNavigateAfterSave();
      expect(mockPush).not.toHaveBeenCalled();

      triggerSaveComplete();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
    });
  });

  /**************************
   * Unsaved-changes guard *
   **************************/

  describe("unsaved changes guard", () => {
    it("turns the guard off when save completes", () => {
      const {
        triggerGridDataChanged,
        triggerSaveComplete,
      } = setup();

      triggerGridDataChanged();
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      triggerSaveComplete();
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("disables the unsaved changes guard while navigating after save", async () => {
      const {
        triggerGridDataChanged,
        triggerSaveComplete,
        triggerNavigateAfterSave,
        runTmntUrl,
      } = setup();

      triggerGridDataChanged();

      expect(mockUseUnsavedChangesGuard)
        .toHaveBeenLastCalledWith(true);

      triggerSaveComplete();
      triggerNavigateAfterSave();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("disables the guard while navigating, even before page input changes are saved", async () => {
      const { user, triggerNavigateAfterSave } = setup();

      await user.type(getExpensesInput(), "1");
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      triggerNavigateAfterSave();
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });
  });

  /*******************
   * Page state      *
   *******************/

  describe("page state", () => {
    it("passes the saved rows to the grid", () => {
      const {
        populatedRows,
        triggerSaveComplete,
      } = setup();

      const savedRows = populatedRows.map((row) => ({
        ...row,
        amount: row.amount + 10,
      }));

      triggerSaveComplete(savedRows);

      expect(getLatestRows()).toEqual(savedRows);
      expect(screen.getByTestId("mock-grid-row-count"))
        .toHaveTextContent(String(savedRows.length));
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("clears the grid change flag when save completes", () => {
      const {
        triggerGridDataChanged,
        triggerSaveComplete,
      } = setup();

      triggerGridDataChanged();
      expect(gridDataWasChangedText()).toBe("true");

      triggerSaveComplete();
      expect(gridDataWasChangedText()).toBe("false");
    });

    it("clears the page input change flag when save completes", async () => {
      const { user, triggerSaveComplete } = setup();

      // only the page inputs changed, not the grid cells
      await user.type(getExpensesInput(), "1");
      expect(gridDataWasChangedText()).toBe("true");

      triggerSaveComplete();
      expect(gridDataWasChangedText()).toBe("false");
    });

    it("keeps the applied expenses and prize fund after save", async () => {
      const { user, expected, triggerSaveComplete } = setup();

      expect(expected.entryFees).toBeGreaterThan(0);

      const newExpenses = Math.floor(expected.entryFees * 10) / 100;
      const balanced = balancePotExpenses(
        expected.entryFees,
        newExpenses,
        expected.games,
        expected.isGamePot,
      );

      await user.clear(getExpensesInput());
      await user.type(getExpensesInput(), String(newExpenses));
      await user.tab(); // blur applies the expenses

      triggerSaveComplete();

      expect(getExpensesInput()).toHaveValue(balanced.expenses.toFixed(2));
      expect(getPrizeFundInput()).toHaveValue(String(balanced.prizeFund));
    });
  });

  /*********************************
   * Saved state used by Cancel    *
   *********************************/

  describe("cancel after save", () => {
    it("restores the saved rows, not the rows from when the page loaded", () => {
      const {
        populatedRows,
        triggerGridDataChanged,
        triggerSaveComplete,
      } = setup();

      const savedRows = populatedRows.map((row) => ({
        ...row,
        amount: row.amount + 10,
      }));

      triggerSaveComplete(savedRows);

      // a later grid edit, then Cancel
      triggerGridDataChanged();
      triggerGridCancel();

      expect(getLatestRows()).toEqual(savedRows);
      expect(gridDataWasChangedText()).toBe("false");
    });

    it("restores the saved casher count after cashers were added and saved", async () => {
      const {
        user,
        expected,
        triggerGridDataChanged,
        triggerSaveComplete,
      } = setup();

      const savedCashers = expected.numCashers + 1;
      expect(expected.numPlayers).toBeGreaterThanOrEqual(savedCashers);

      // add one casher
      await user.clear(getCashersInput());
      await user.type(getCashersInput(), String(savedCashers));
      await user.keyboard("{Enter}");
      expect(getLatestRows()).toHaveLength(savedCashers);

      triggerSaveComplete(getLatestRows());

      const mountsBeforeCancel = getGridMountCount();

      triggerGridDataChanged();
      await user.click(getGridCancelButton());

      expect(getLatestRows()).toHaveLength(savedCashers);
      expect(getCashersInput()).toHaveValue(savedCashers);
      // Cancel remounts the grid so Syncfusion rebuilds from the saved rows
      expect(getGridMountCount()).toBe(mountsBeforeCancel + 1);
    });

    it("restores the saved expenses after expenses were changed and saved", async () => {
      const { user, expected, triggerSaveComplete } = setup();

      expect(expected.entryFees).toBeGreaterThan(0);

      const savedExpenses = Math.floor(expected.entryFees * 10) / 100;
      const balanced = balancePotExpenses(
        expected.entryFees,
        savedExpenses,
        expected.games,
        expected.isGamePot,
      );

      // change expenses and save
      await user.clear(getExpensesInput());
      await user.type(getExpensesInput(), String(savedExpenses));
      await user.tab();
      triggerSaveComplete();

      // type a different value, then click Cancel; the typed value is
      // discarded and the saved expenses come back
      await user.clear(getExpensesInput());
      await user.type(getExpensesInput(), "1");
      await user.click(getGridCancelButton());

      expect(getExpensesInput()).toHaveValue(balanced.expenses.toFixed(2));
      expect(getPrizeFundInput()).toHaveValue(String(balanced.prizeFund));
      expect(gridDataWasChangedText()).toBe("false");
    });
  });
});
