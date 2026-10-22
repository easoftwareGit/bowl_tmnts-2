import { act } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {
  clickSave,
  getLatestGridProps,
  makeRows,
  mockBatchSave,
  performSave,
  queryErrorModal,
  setCurrentRows,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * A successful Save:
 *   click Save -> validation passes -> grid.batchSave()
 *   -> Syncfusion raises actionComplete("batchsave")
 *   -> onSave(current grid rows) is awaited
 *   -> onSaveComplete(copy)
 *
 * The parent updates its rows state in onSaveComplete; the grid does not
 * call setRows after a save.
 *
 * Validation failures are in saveValidation.test.
 * Save failures (onSave rejects) are in saveError.test.
 * Save and Close is in saveClose.test.
 */

/** Rows as Syncfusion holds them after batchSave applied the edits. */
const editedRows = (): prizeFundEntryRow[] => {
  const rows = makeRows();
  rows[1].amount = 70;
  rows[2].amount = 30;
  return rows;
};

const expectCopiesOf = (
  actual: prizeFundEntryRow[],
  source: prizeFundEntryRow[],
): void => {
  expect(actual).toEqual(source);
  expect(actual).not.toBe(source);
  actual.forEach((row, index) => {
    expect(row).not.toBe(source[index]);
  });
};

describe("PrizeFundGrid successful save", () => {
  beforeEach(standardBeforeEach);

  /*****************
   * What is saved *
   *****************/

  describe("saved rows", () => {
    it("calls onSave once with the grid's current rows", async () => {
      const { user, onSave, triggerActionComplete } = setup();
      const gridRows = setCurrentRows(editedRows());

      await performSave(user, triggerActionComplete);

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(gridRows);
    });

    it("reads the rows after Syncfusion finishes the batch save", async () => {
      const { user, onSave, triggerActionComplete } = setup();

      await clickSave(user);

      // batchSave has applied the edits by the time actionComplete fires
      const afterBatchSave = setCurrentRows(editedRows());
      await triggerActionComplete("batchsave");

      expect(onSave).toHaveBeenCalledWith(afterBatchSave);
    });

    it("passes copies of the saved rows to onSaveComplete", async () => {
      const { user, onSaveComplete, triggerActionComplete } = setup();
      const gridRows = setCurrentRows(editedRows());

      await performSave(user, triggerActionComplete);

      expect(onSaveComplete).toHaveBeenCalledTimes(1);
      expectCopiesOf(onSaveComplete.mock.calls[0][0], gridRows);
    });

    it("leaves updating the parent's rows to onSaveComplete", async () => {
      const { user, setRows, onSaveComplete, triggerActionComplete } = setup();

      await performSave(user, triggerActionComplete);

      expect(onSaveComplete).toHaveBeenCalledTimes(1);
      expect(setRows).not.toHaveBeenCalled();
    });

    it("does not show an error modal", async () => {
      const { user, triggerActionComplete } = setup();

      await performSave(user, triggerActionComplete);

      expect(queryErrorModal()).not.toBeInTheDocument();
    });
  });

  /************
   * Ordering *
   ************/

  describe("ordering", () => {
    it("waits for onSave to finish before completing the save", async () => {
      const { user, onSave, onSaveComplete } = setup();

      let resolveSave!: () => void;
      onSave.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSave = resolve;
          }),
      );

      await clickSave(user);

      let pending: void | Promise<void> = undefined;
      act(() => {
        pending = getLatestGridProps()?.actionComplete?.({
          requestType: "batchsave",
        });
      });

      // onSave is still running
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSaveComplete).not.toHaveBeenCalled();

      await act(async () => {
        resolveSave();
        await pending;
      });

      expect(onSaveComplete).toHaveBeenCalledTimes(1);
    });

    it("calls onSave before onSaveComplete", async () => {
      const { user, onSave, onSaveComplete, triggerActionComplete } = setup();

      await performSave(user, triggerActionComplete);

      const [saveOrder] = onSave.mock.invocationCallOrder;
      const [completeOrder] = onSaveComplete.mock.invocationCallOrder;

      expect(saveOrder).toBeLessThan(completeOrder);
    });
  });

  /***************
   * Save vs nav *
   ***************/

  it("does not navigate away after a plain Save", async () => {
    const { user, onNavigateAfterSave, onBack, triggerActionComplete } = setup();

    await performSave(user, triggerActionComplete);

    expect(onNavigateAfterSave).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });

  it("completes without error when the optional callbacks are not supplied", async () => {
    const { user, onSave, setRows, triggerActionComplete } = setup({
      omitOptionalCallbacks: true,
    });

    await performSave(user, triggerActionComplete);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(setRows).not.toHaveBeenCalled();
    expect(queryErrorModal()).not.toBeInTheDocument();
  });

  /*****************************
   * One save per Save request *
   *****************************/

  describe("save request handling", () => {
    it("handles only one batchsave event per Save click", async () => {
      const { user, onSave, onSaveComplete, triggerActionComplete } = setup();

      await performSave(user, triggerActionComplete);
      await triggerActionComplete("batchsave"); // stray second event

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSaveComplete).toHaveBeenCalledTimes(1);
    });

    it("waits for the batchsave event, ignoring other grid actions", async () => {
      const { user, onSave, triggerActionComplete } = setup();

      await clickSave(user);
      await triggerActionComplete("refresh");

      expect(onSave).not.toHaveBeenCalled();

      await triggerActionComplete("batchsave");

      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("ignores a batchsave event that Save did not request", async () => {
      const { onSave, onSaveComplete, triggerActionComplete } = setup();

      await triggerActionComplete("batchsave");

      expect(onSave).not.toHaveBeenCalled();
      expect(onSaveComplete).not.toHaveBeenCalled();
    });

    it("can save again after a successful save", async () => {
      const { user, onSave, onSaveComplete, triggerActionComplete } = setup();

      await performSave(user, triggerActionComplete);
      await performSave(user, triggerActionComplete);

      expect(mockBatchSave).toHaveBeenCalledTimes(2);
      expect(onSave).toHaveBeenCalledTimes(2);
      expect(onSaveComplete).toHaveBeenCalledTimes(2);
    });
  });
});
