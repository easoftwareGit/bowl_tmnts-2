import { act } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {
  clickSaveAndClose,
  getLatestGridProps,
  makeRows,
  performSave,
  performSaveAndClose,
  queryErrorModal,
  setCurrentRows,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * Save and Close follows the same path as Save (see saveSuccessful.test),
 * except that after onSave finishes and onSaveComplete is called, it also
 * calls onNavigateAfterSave.
 *
 * Neither Save nor Save and Close calls setRows; the parent updates its
 * rows in onSaveComplete.
 *
 * Validation failures with Save and Close are in saveValidation.test.
 * Save failures (onSave rejects) with Save and Close are in saveError.test.
 */

/** Rows as Syncfusion holds them after batchSave applied the edits. */
const editedRows = (): prizeFundEntryRow[] => {
  const rows = makeRows();
  rows[0].amount = 110;
  rows[1].amount = 50;
  return rows; // 110, 50, 40 = 200
};

describe("PrizeFundGrid Save and Close", () => {
  beforeEach(standardBeforeEach);

  /*****************
   * Happy path    *
   *****************/

  describe("after a successful save", () => {
    it("calls onSave once with the grid's current rows, not the rows prop", async () => {
      const { user, onSave, triggerActionComplete } = setup();
      const gridRows = setCurrentRows(editedRows());

      await performSaveAndClose(user, triggerActionComplete);

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(gridRows);
    });

    it("calls onSaveComplete exactly once, with copies of the saved rows", async () => {
      const { user, onSaveComplete, triggerActionComplete } = setup();
      const gridRows = setCurrentRows(editedRows());

      await performSaveAndClose(user, triggerActionComplete);

      // guards against the earlier double-call bug
      expect(onSaveComplete).toHaveBeenCalledTimes(1);

      const savedRows = onSaveComplete.mock.calls[0][0] as prizeFundEntryRow[];
      expect(savedRows).toEqual(gridRows);
      expect(savedRows).not.toBe(gridRows);
      savedRows.forEach((row, index) => {
        expect(row).not.toBe(gridRows[index]);
      });
    });

    it("navigates away once", async () => {
      const { user, onNavigateAfterSave, onBack, triggerActionComplete } =
        setup();

      await performSaveAndClose(user, triggerActionComplete);

      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
      expect(onBack).not.toHaveBeenCalled();
    });

    it("does not update the parent's rows itself", async () => {
      const { user, setRows, triggerActionComplete } = setup();

      await performSaveAndClose(user, triggerActionComplete);

      expect(setRows).not.toHaveBeenCalled();
    });

    it("does not show an error modal", async () => {
      const { user, triggerActionComplete } = setup();

      await performSaveAndClose(user, triggerActionComplete);

      expect(queryErrorModal()).not.toBeInTheDocument();
    });

    it("saves, then completes, then navigates", async () => {
      const {
        user,
        onSave,
        onSaveComplete,
        onNavigateAfterSave,
        triggerActionComplete,
      } = setup();

      await performSaveAndClose(user, triggerActionComplete);

      const [saveOrder] = onSave.mock.invocationCallOrder;
      const [completeOrder] = onSaveComplete.mock.invocationCallOrder;
      const [navigateOrder] = onNavigateAfterSave.mock.invocationCallOrder;

      expect(saveOrder).toBeLessThan(completeOrder);
      expect(completeOrder).toBeLessThan(navigateOrder);
    });
  });

  /***********************
   * Waiting for onSave  *
   ***********************/

  it("does not navigate until onSave finishes", async () => {
    const { user, onSave, onSaveComplete, onNavigateAfterSave } = setup();

    let resolveSave!: () => void;
    onSave.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );

    await clickSaveAndClose(user);

    let pending: void | Promise<void> = undefined;
    act(() => {
      pending = getLatestGridProps()?.actionComplete?.({
        requestType: "batchsave",
      });
    });

    expect(onSaveComplete).not.toHaveBeenCalled();
    expect(onNavigateAfterSave).not.toHaveBeenCalled();

    await act(async () => {
      resolveSave();
      await pending;
    });

    expect(onSaveComplete).toHaveBeenCalledTimes(1);
    expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
  });

  /*************************
   * Optional callbacks    *
   *************************/

  it("works when onSaveComplete and onNavigateAfterSave are not supplied", async () => {
    const { user, onSave, setRows, triggerActionComplete } = setup({
      omitOptionalCallbacks: true,
    });

    await performSaveAndClose(user, triggerActionComplete);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(setRows).not.toHaveBeenCalled();
    expect(queryErrorModal()).not.toBeInTheDocument();
  });

  /******************************
   * Close flag does not linger *
   ******************************/

  describe("switching between Save and Save and Close", () => {
    it("a plain Save after Save and Close does not navigate", async () => {
      const {
        user,
        onSaveComplete,
        onNavigateAfterSave,
        setRows,
        triggerActionComplete,
      } = setup();

      await performSaveAndClose(user, triggerActionComplete);
      await performSave(user, triggerActionComplete);

      expect(onSaveComplete).toHaveBeenCalledTimes(2);
      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
      expect(setRows).not.toHaveBeenCalled();

      // the single navigation came from the first (Save and Close) save
      const [, secondCompleteOrder] = onSaveComplete.mock.invocationCallOrder;
      const [navigateOrder] = onNavigateAfterSave.mock.invocationCallOrder;
      expect(navigateOrder).toBeLessThan(secondCompleteOrder);
    });

    it("Save and Close after a plain Save navigates", async () => {
      const {
        user,
        onSaveComplete,
        onNavigateAfterSave,
        setRows,
        triggerActionComplete,
      } = setup();

      await performSave(user, triggerActionComplete);

      expect(onNavigateAfterSave).not.toHaveBeenCalled();

      await performSaveAndClose(user, triggerActionComplete);

      expect(onSaveComplete).toHaveBeenCalledTimes(2);
      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
      expect(setRows).not.toHaveBeenCalled();
    });
  });
});
