import { act } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {
  getInputs,
  getLatestGridProps,
  getLatestRows,
  mockUseUnsavedChangesGuard,
  setup,
  standardBeforeEach,
  triggerGridDataChanged,
  triggerGridDataReset,
} from "./elimPfPage.testSetup";

/**
 * Returns the latest grid props, failing clearly if the grid
 * has not rendered.
 */
const gridProps = () => {
  const props = getLatestGridProps();
  if (!props) {
    throw new Error("ElimPrizeFundGrid has not rendered");
  }
  return props;
};

describe("Eliminator Prize Fund web page grid callbacks", () => {
  beforeEach(standardBeforeEach);

  /*********************************
   * Props passed to the grid      *
   *********************************/

  describe("props passed to ElimPrizeFundGrid", () => {
    it("passes the route eliminator, initial rows and prize fund", () => {
      const { elimId, populatedRows, expectedPrizeFund } = setup();

      const props = gridProps();
      expect(props.elimId).toBe(elimId);
      expect(props.rows).toEqual(populatedRows);
      expect(props.totalPrizeFund).toBe(expectedPrizeFund);
    });

    it("enables editing and starts with no grid changes", () => {
      setup();

      const props = gridProps();
      expect(props.enableEditing).toBe(true);
      expect(props.gridDataWasChanged).toBe(false);
    });

    it("passes all callbacks as functions", () => {
      setup();

      const props = gridProps();
      expect(props.setRows).toEqual(expect.any(Function));
      expect(props.onGridDataChanged).toEqual(expect.any(Function));
      expect(props.onGridDataReset).toEqual(expect.any(Function));
      expect(props.onNavigateAfterSave).toEqual(expect.any(Function));
      expect(props.onBack).toEqual(expect.any(Function));
      expect(props.onSaveComplete).toEqual(expect.any(Function));
    });
  });

  /*********************************
   * onGridDataChanged             *
   *********************************/

  describe("onGridDataChanged", () => {
    it("sets gridDataWasChanged to true", () => {
      setup();

      triggerGridDataChanged();

      expect(gridProps().gridDataWasChanged).toBe(true);
    });

    it("arms the unsaved changes guard", () => {
      setup();
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);

      triggerGridDataChanged();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("does not change the rows", () => {
      const { populatedRows } = setup();

      triggerGridDataChanged();

      expect(getLatestRows()).toEqual(populatedRows);
    });
  });

  /*********************************
   * onGridDataReset               *
   *********************************/

  describe("onGridDataReset", () => {
    it("sets gridDataWasChanged back to false", () => {
      setup();

      triggerGridDataChanged();
      triggerGridDataReset();

      expect(gridProps().gridDataWasChanged).toBe(false);
    });

    it("disarms the unsaved changes guard when the page has no edits", () => {
      setup();

      triggerGridDataChanged();
      triggerGridDataReset();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("keeps the guard armed when the page itself has unsaved edits", async () => {
      const { user } = setup();
      const { expenses } = getInputs();

      // Page edit: sets dataWasChanged.
      await user.clear(expenses);
      await user.type(expenses, "10");

      triggerGridDataChanged();
      triggerGridDataReset();

      // Resetting the grid flag must not clear the page's own flag.
      expect(gridProps().gridDataWasChanged).toBe(false);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });
  });

  /*********************************
   * setRows                       *
   *********************************/

  describe("setRows", () => {
    it("updates the rows the page passes back to the grid", () => {
      const { populatedRows } = setup();

      const updatedRows: prizeFundEntryRow[] = populatedRows.map((row) => ({
        ...row,
        amount: row.amount + 5,
      }));

      act(() => {
        gridProps().setRows(updatedRows);
      });

      expect(getLatestRows()).toEqual(updatedRows);
    });

    it("does not arm the unsaved changes guard by itself", () => {
      const { populatedRows } = setup();

      act(() => {
        gridProps().setRows(populatedRows.map((row) => ({ ...row })));
      });

      /*
       * The grid reports edits through onGridDataChanged; setRows
       * only syncs the rows into page state.
       */
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });
  });
});
