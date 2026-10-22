import { screen, waitFor } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {
  enterCashers,
  enterExpenses,
  getInputs,
  getLatestRows,
  mockPopulatePfRows,
  mockPush,
  mockUseUnsavedChangesGuard,
  mockWindowConfirm,
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup";

/*
 * Entry fees used by tests that edit Expenses, so the expected
 * Expenses and Prize Fund values do not depend on the mock data.
 */
const ENTRY_FEES = 1000;
const NEW_EXPENSES = 25;
const LATER_EXPENSES = 50;

describe("Eliminator Prize Fund web page after save", () => {
  beforeEach(standardBeforeEach);

  describe("navigation after save", () => {
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

    it("waits for unsaved page edits to be saved before navigating", async () => {
      const {
        user,
        runTmntUrl,
        triggerNavigateAfterSave,
        triggerSaveComplete,
      } = setup({ elimEntryFees: ENTRY_FEES });

      // Editing Expenses marks the page data as changed.
      await enterExpenses(user, String(NEW_EXPENSES));

      // Navigation requested while the page still has unsaved edits.
      triggerNavigateAfterSave();
      expect(mockPush).not.toHaveBeenCalled();

      // Save completion clears dataWasChanged, which releases navigation.
      triggerSaveComplete();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("navigates immediately when Save & Close is requested with no unsaved page changes", () => {
      const { runTmntUrl, triggerNavigateAfterSave } = setup();

      triggerNavigateAfterSave();

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  describe("page state after save", () => {
    it("passes the saved rows to the grid when save completes", () => {
      const { populatedRows, triggerSaveComplete } = setup();

      const savedRows: prizeFundEntryRow[] = populatedRows.map((row) => ({
        ...row,
        amount: row.amount + 10,
      }));

      triggerSaveComplete(savedRows);

      expect(getLatestRows()).toEqual(savedRows);
      expect(screen.getByTestId("mock-grid-row-count")).toHaveTextContent(
        String(savedRows.length),
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("keeps the entered Expenses and Prize Fund after save and does not reinitialize the page", async () => {
      const { user, triggerSaveComplete } = setup({
        elimEntryFees: ENTRY_FEES,
      });

      await enterExpenses(user, String(NEW_EXPENSES));

      triggerSaveComplete();

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue(NEW_EXPENSES.toFixed(2));
      expect(prizeFund).toHaveValue(String(ENTRY_FEES - NEW_EXPENSES));
      expect(
        screen.getByTestId("mock-grid-total-prize-fund"),
      ).toHaveTextContent(String(ENTRY_FEES - NEW_EXPENSES));

      // Initialization ran once, on load; save did not repeat it.
      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
    });

    it("keeps the entered casher count after save", async () => {
      const { user, expectedCashers, numPlayers, triggerSaveComplete } =
        setup();

      // Precondition: the mock data must allow adding a casher.
      expect(numPlayers).toBeGreaterThan(expectedCashers);

      const newCashers = expectedCashers + 1;
      await enterCashers(user, String(newCashers));

      triggerSaveComplete(getLatestRows());

      expect(getInputs().cashers).toHaveValue(newCashers);
      expect(screen.getByTestId("mock-grid-row-count")).toHaveTextContent(
        String(newCashers),
      );
    });

    it("clears the grid-changed flag when save completes", () => {
      const { triggerGridDataChanged, triggerSaveComplete } = setup();

      triggerGridDataChanged();
      expect(
        screen.getByTestId("mock-grid-data-was-changed"),
      ).toHaveTextContent("true");

      triggerSaveComplete();

      // onSaveComplete clears both dataWasChanged and gridDataWasChanged.
      expect(
        screen.getByTestId("mock-grid-data-was-changed"),
      ).toHaveTextContent("false");
    });
  });

  describe("unsaved changes guard after save", () => {
    it("turns off the unsaved changes guard when unsaved page edits are saved", async () => {
      const { user, triggerSaveComplete } = setup({
        elimEntryFees: ENTRY_FEES,
      });

      await enterExpenses(user, String(NEW_EXPENSES));
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      triggerSaveComplete();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("turns off the unsaved changes guard when unsaved grid edits are saved", () => {
      const { triggerGridDataChanged, triggerSaveComplete } = setup();

      triggerGridDataChanged();
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      triggerSaveComplete();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("turns off the unsaved changes guard as soon as navigation after save is requested", async () => {
      const {
        user,
        runTmntUrl,
        triggerNavigateAfterSave,
        triggerSaveComplete,
      } = setup({ elimEntryFees: ENTRY_FEES });

      await enterExpenses(user, String(NEW_EXPENSES));
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      // The page still has unsaved edits, but isNavigatingAfterSave
      // disables the guard so the pending save does not prompt.
      triggerNavigateAfterSave();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
      expect(mockPush).not.toHaveBeenCalled();

      triggerSaveComplete();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });
  });

  describe("Back after save", () => {
    it("returns to Run Tournament without a confirm prompt after page edits are saved", async () => {
      const {
        user,
        runTmntUrl,
        triggerSaveComplete,
        triggerBack,
      } = setup({ elimEntryFees: ENTRY_FEES });

      await enterExpenses(user, String(NEW_EXPENSES));
      triggerSaveComplete();

      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("returns to Run Tournament without a confirm prompt after grid edits are saved", () => {
      const {
        runTmntUrl,
        triggerGridDataChanged,
        triggerSaveComplete,
        triggerBack,
      } = setup();

      triggerGridDataChanged();
      triggerSaveComplete();

      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  /*
   * onSaveComplete updates savedRowsRef, savedCashersRef and
   * savedExpensesRef, so Cancel restores the last SAVED state rather
   * than the state loaded with the page.
   */
  describe("Cancel after save", () => {
    it("restores the saved rows, not the rows loaded with the page", async () => {
      const {
        user,
        populatedRows,
        expectedCashers,
        numPlayers,
        triggerSaveComplete,
        triggerGridCancel,
      } = setup();

      expect(numPlayers).toBeGreaterThan(expectedCashers);

      const savedRows: prizeFundEntryRow[] = populatedRows.map((row) => ({
        ...row,
        amount: row.amount + 10,
      }));
      triggerSaveComplete(savedRows);

      // Unsaved edit after the save: add a casher row.
      await enterCashers(user, String(expectedCashers + 1));
      expect(getLatestRows()).toHaveLength(savedRows.length + 1);

      triggerGridCancel();

      expect(getLatestRows()).toEqual(savedRows);
      expect(getInputs().cashers).toHaveValue(savedRows.length);
    });

    it("restores the casher count from the last save", async () => {
      const {
        user,
        expectedCashers,
        numPlayers,
        triggerSaveComplete,
        triggerGridCancel,
      } = setup({ elimEntryFees: ENTRY_FEES });

      expect(numPlayers).toBeGreaterThan(expectedCashers);

      const savedCashers = expectedCashers + 1;
      await enterCashers(user, String(savedCashers));
      triggerSaveComplete(getLatestRows());

      // Unsaved edit after the save.
      await enterExpenses(user, String(NEW_EXPENSES));

      triggerGridCancel();

      expect(getInputs().cashers).toHaveValue(savedCashers);
      expect(getLatestRows()).toHaveLength(savedCashers);
    });

    it("restores the Expenses and Prize Fund from the last save", async () => {
      const { user, triggerSaveComplete, triggerGridCancel } = setup({
        elimEntryFees: ENTRY_FEES,
      });

      await enterExpenses(user, String(NEW_EXPENSES));
      triggerSaveComplete();

      // Unsaved edit after the save.
      await enterExpenses(user, String(LATER_EXPENSES));
      expect(getInputs().expenses).toHaveValue(LATER_EXPENSES.toFixed(2));

      triggerGridCancel();

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue(NEW_EXPENSES.toFixed(2));
      expect(prizeFund).toHaveValue(String(ENTRY_FEES - NEW_EXPENSES));
      expect(
        screen.getByTestId("mock-grid-total-prize-fund"),
      ).toHaveTextContent(String(ENTRY_FEES - NEW_EXPENSES));
    });

    it("leaves no unsaved changes after Cancel restores the saved state", async () => {
      const { user, triggerSaveComplete, triggerGridCancel } = setup({
        elimEntryFees: ENTRY_FEES,
      });

      await enterExpenses(user, String(NEW_EXPENSES));
      triggerSaveComplete();

      await enterExpenses(user, String(LATER_EXPENSES));
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      triggerGridCancel();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });
  });
});


// import { screen, waitFor } from "@testing-library/react";
// import type { prizeFundEntryRow } from "@/lib/types/types";
// import {
//   enterExpenses,
//   getInputs,
//   getLatestRows,
//   mockPopulatePfRows,
//   mockPush,
//   mockUseUnsavedChangesGuard,
//   mockWindowConfirm,
//   setup,
//   standardBeforeEach,
// } from "./elimPfPage.testSetup";

// /*
//  * Entry fees used by tests that edit Expenses, so the expected
//  * Expenses and Prize Fund values do not depend on the mock data.
//  */
// const ENTRY_FEES = 1000;
// const NEW_EXPENSES = 25;

// describe("Eliminator Prize Fund web page after save", () => {
//   beforeEach(standardBeforeEach);

//   describe("navigation after save", () => {
//     it("navigates to the Run Tournament page after save completes and navigation is requested", async () => {
//       const {
//         runTmntUrl,
//         triggerNavigateAfterSave,
//         triggerSaveComplete,
//       } = setup();

//       triggerSaveComplete();
//       triggerNavigateAfterSave();

//       await waitFor(() => {
//         expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
//       });
//       expect(mockPush).toHaveBeenCalledTimes(1);
//     });

//     it("does not navigate after save until navigation is requested", () => {
//       const { triggerSaveComplete } = setup();

//       triggerSaveComplete();

//       expect(mockPush).not.toHaveBeenCalled();
//     });

//     it("waits for unsaved page edits to be saved before navigating", async () => {
//       const {
//         user,
//         runTmntUrl,
//         triggerNavigateAfterSave,
//         triggerSaveComplete,
//       } = setup({ elimEntryFees: ENTRY_FEES });

//       // Editing Expenses marks the page data as changed.
//       await enterExpenses(user, String(NEW_EXPENSES));

//       // Navigation requested while the page still has unsaved edits.
//       triggerNavigateAfterSave();
//       expect(mockPush).not.toHaveBeenCalled();

//       // Save completion clears dataWasChanged, which releases navigation.
//       triggerSaveComplete();

//       await waitFor(() => {
//         expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
//       });
//       expect(mockPush).toHaveBeenCalledTimes(1);
//     });

//     it("navigates immediately when Save & Close is requested with no unsaved page changes", () => {
//       const { runTmntUrl, triggerNavigateAfterSave } = setup();

//       triggerNavigateAfterSave();

//       expect(mockPush).toHaveBeenCalledTimes(1);
//       expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
//     });
//   });

//   describe("page state after save", () => {
//     it("passes the saved rows to the grid when save completes", () => {
//       const { populatedRows, triggerSaveComplete } = setup();

//       const savedRows: prizeFundEntryRow[] = populatedRows.map((row) => ({
//         ...row,
//         amount: row.amount + 10,
//       }));

//       triggerSaveComplete(savedRows);

//       expect(getLatestRows()).toEqual(savedRows);
//       expect(screen.getByTestId("mock-grid-row-count")).toHaveTextContent(
//         String(savedRows.length),
//       );
//       expect(mockPush).not.toHaveBeenCalled();
//     });

//     it("keeps the entered Expenses and Prize Fund after save and does not reinitialize the page", async () => {
//       const { user, triggerSaveComplete } = setup({
//         elimEntryFees: ENTRY_FEES,
//       });

//       await enterExpenses(user, String(NEW_EXPENSES));

//       triggerSaveComplete();

//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue(NEW_EXPENSES.toFixed(2));
//       expect(prizeFund).toHaveValue(String(ENTRY_FEES - NEW_EXPENSES));
//       expect(
//         screen.getByTestId("mock-grid-total-prize-fund"),
//       ).toHaveTextContent(String(ENTRY_FEES - NEW_EXPENSES));

//       // Initialization ran once, on load; save did not repeat it.
//       expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("unsaved changes guard after save", () => {
//     it("turns off the unsaved changes guard when unsaved page edits are saved", async () => {
//       const { user, triggerSaveComplete } = setup({
//         elimEntryFees: ENTRY_FEES,
//       });

//       await enterExpenses(user, String(NEW_EXPENSES));
//       expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

//       triggerSaveComplete();

//       expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
//     });

//     it("leaves the grid-changed flag for the grid to reset", () => {
//       const {
//         triggerGridDataChanged,
//         triggerGridDataReset,
//         triggerSaveComplete,
//       } = setup();

//       triggerGridDataChanged();
//       triggerSaveComplete();

//       // The page's onSaveComplete clears only dataWasChanged.
//       expect(
//         screen.getByTestId("mock-grid-data-was-changed"),
//       ).toHaveTextContent("true");
//       expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

//       // The grid clears its own flag through onGridDataReset.
//       triggerGridDataReset();

//       expect(
//         screen.getByTestId("mock-grid-data-was-changed"),
//       ).toHaveTextContent("false");
//       expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
//     });

//     it("disables the unsaved changes guard while navigating after save", async () => {
//       const {
//         triggerGridDataChanged,
//         triggerSaveComplete,
//         triggerNavigateAfterSave,
//         runTmntUrl,
//       } = setup();

//       triggerGridDataChanged();
//       expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

//       triggerSaveComplete();
//       triggerNavigateAfterSave();

//       await waitFor(() => {
//         expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
//       });

//       // gridDataWasChanged is still true here; isNavigatingAfterSave
//       // is what turns the guard off.
//       expect(
//         screen.getByTestId("mock-grid-data-was-changed"),
//       ).toHaveTextContent("true");
//       expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
//     });
//   });

//   describe("Back after save", () => {
//     it("returns to Run Tournament without a confirm prompt after page edits are saved", async () => {
//       const {
//         user,
//         runTmntUrl,
//         triggerSaveComplete,
//         triggerBack,
//       } = setup({ elimEntryFees: ENTRY_FEES });

//       await enterExpenses(user, String(NEW_EXPENSES));
//       triggerSaveComplete();

//       triggerBack();

//       expect(mockWindowConfirm).not.toHaveBeenCalled();
//       expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
//     });
//   });
// });

