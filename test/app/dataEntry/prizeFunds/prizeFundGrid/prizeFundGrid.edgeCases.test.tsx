import { fireEvent, screen } from "@testing-library/react";
import {
  flushTimeouts,
  getCurrentRowsFromHandle,
  mockBatchSave,
  mockEditCell,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * Edge cases that do not belong to a single feature file.
 *
 * Covered elsewhere (do not duplicate here):
 *   - ignored / unrequested actionComplete events -> saveSuccessful.test
 *   - saving with no rows                         -> saveValidation.test
 *   - invalid prizeFundType                       -> render.test
 *   - unknown toolbar ids                         -> toolbar.test
 *
 * Several tests below need two clicks to land before the component's
 * setTimeout(0) runs, so they use fireEvent (synchronous) instead of
 * userEvent (which yields to timers between actions).
 */

const clickNow = (name: string): void => {
  fireEvent.click(screen.getByRole("button", { name }));
};

describe("PrizeFundGrid edge cases", () => {
  beforeEach(standardBeforeEach);

  /*******************
   * Empty grid      *
   *******************/

  it("getCurrentRows() returns an empty array when the grid has no rows", () => {
    const { gridHandleRef } = setup({
      rows: [],
      currentRows: [],
      totalPrizeFund: 0,
    });

    expect(getCurrentRowsFromHandle(gridHandleRef)).toEqual([]);
  });

  /************************************
   * Clicks before validation has run *
   ************************************/

  describe("repeated clicks before validation runs", () => {
    it("two quick Save clicks start two batch saves but save only once", async () => {
      const { onSave, onSaveComplete, setRows, triggerActionComplete } = setup();

      clickNow("Save");
      clickNow("Save");
      await flushTimeouts();

      expect(mockBatchSave).toHaveBeenCalledTimes(2);

      await triggerActionComplete("batchsave");
      await triggerActionComplete("batchsave");

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSaveComplete).toHaveBeenCalledTimes(1);
      expect(setRows).not.toHaveBeenCalled();
    });

    it("Save then Save and Close: the last click decides whether to close", async () => {
      const { onNavigateAfterSave, setRows, triggerActionComplete } = setup();

      clickNow("Save");
      clickNow("Save and Close");
      await flushTimeouts();
      await triggerActionComplete("batchsave");

      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
      expect(setRows).not.toHaveBeenCalled();
    });
  });

  /*********************************
   * Unmount with pending timeouts *
   *********************************/

  describe("unmounting with work still pending", () => {
    it("does not save when unmounted before validation runs", async () => {
      const { view, onSave } = setup();

      clickNow("Save");
      view.unmount();

      await expect(flushTimeouts()).resolves.toBeUndefined();

      // gridRef is cleared on unmount, so validation cannot pass
      expect(mockBatchSave).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("does not throw when unmounted before the Edit timeout runs", async () => {
      const { view } = setup();

      clickNow("Edit");
      view.unmount();

      await expect(flushTimeouts()).resolves.toBeUndefined();
      // editCell still runs on the grid instance captured before unmount
      expect(mockEditCell).toHaveBeenCalledTimes(1);
    });
  });
});
