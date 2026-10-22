import { act } from "@testing-library/react";
import {
  clickSave,
  clickSaveAndClose,
  closeErrorModal,
  defaultSaveErrorMessage,
  getLatestGridProps,
  mockBatchCancel,
  performSave,
  performSaveAndClose,
  queryErrorModal,
  saveErrorTitle,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * A failed save:
 *   click Save / Save and Close -> validation passes -> grid.batchSave()
 *   -> Syncfusion raises actionComplete("batchsave")
 *   -> onSave(current grid rows) rejects
 *   -> handleActionComplete catches the error, resets the close flag and
 *      shows the "Save Error" modal
 *   -> onSaveComplete / onNavigateAfterSave are NOT called
 *
 * Successful saves are in saveSuccessful.test and saveClose.test.
 * Validation failures (onSave never called) are in saveValidation.test.
 */

const saveFailedMsg = "Database unavailable";

describe("PrizeFundGrid save error", () => {
  beforeEach(standardBeforeEach);

  /*****************
   * Error message *
   *****************/

  describe("error modal", () => {
    it("shows the Save Error modal with the error's message", async () => {
      const { user, triggerActionComplete } = setup({
        onSave: jest.fn().mockRejectedValue(new Error(saveFailedMsg)),
      });

      await performSave(user, triggerActionComplete);

      const modal = queryErrorModal();
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveTextContent(saveErrorTitle);
      expect(modal).toHaveTextContent(saveFailedMsg);
    });

    it("shows the default message when the rejection is not an Error", async () => {
      const { user, triggerActionComplete } = setup({
        onSave: jest.fn().mockRejectedValue("network down"),
      });

      await performSave(user, triggerActionComplete);

      const modal = queryErrorModal();
      expect(modal).toHaveTextContent(saveErrorTitle);
      expect(modal).toHaveTextContent(defaultSaveErrorMessage);
      expect(modal).not.toHaveTextContent("network down");
    });

    it("does not show the modal until onSave rejects", async () => {
      const { user, onSave } = setup();

      let rejectSave!: (reason: unknown) => void;
      onSave.mockImplementation(
        () =>
          new Promise<void>((_resolve, reject) => {
            rejectSave = reject;
          }),
      );

      await clickSave(user);

      let pending: void | Promise<void> = undefined;
      act(() => {
        pending = getLatestGridProps()?.actionComplete?.({
          requestType: "batchsave",
        });
      });

      // onSave still running
      expect(queryErrorModal()).not.toBeInTheDocument();

      await act(async () => {
        rejectSave(new Error(saveFailedMsg));
        await pending;
      });

      expect(queryErrorModal()).toHaveTextContent(saveFailedMsg);
    });

    it("hides the modal when the user closes it", async () => {
      const { user, triggerActionComplete } = setup({
        onSave: jest.fn().mockRejectedValue(new Error(saveFailedMsg)),
      });

      await performSave(user, triggerActionComplete);
      expect(queryErrorModal()).toBeInTheDocument();

      await closeErrorModal(user);

      expect(queryErrorModal()).not.toBeInTheDocument();
    });
  });

  /********************
   * Error is handled *
   ********************/

  describe("handling", () => {
    it("catches the error instead of letting it propagate", async () => {
      const { user, triggerActionComplete } = setup({
        onSave: jest.fn().mockRejectedValue(new Error(saveFailedMsg)),
      });

      await clickSave(user);

      await expect(triggerActionComplete("batchsave")).resolves.toBeUndefined();
    });

    it("does not complete the save after a failed Save", async () => {
      const {
        user,
        onSave,
        onSaveComplete,
        onNavigateAfterSave,
        setRows,
        triggerActionComplete,
      } = setup({
        onSave: jest.fn().mockRejectedValue(new Error(saveFailedMsg)),
      });

      await performSave(user, triggerActionComplete);

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSaveComplete).not.toHaveBeenCalled();
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
      expect(setRows).not.toHaveBeenCalled();
    });

    it("does not complete the save or navigate after a failed Save and Close", async () => {
      const {
        user,
        onSaveComplete,
        onNavigateAfterSave,
        onBack,
        triggerActionComplete,
      } = setup({
        onSave: jest.fn().mockRejectedValue(new Error(saveFailedMsg)),
      });

      await performSaveAndClose(user, triggerActionComplete);

      expect(queryErrorModal()).toHaveTextContent(saveFailedMsg);
      expect(onSaveComplete).not.toHaveBeenCalled();
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
      expect(onBack).not.toHaveBeenCalled();
    });

    it("keeps the user's edits in the grid (does not cancel the batch)", async () => {
      const { user, triggerActionComplete } = setup({
        onSave: jest.fn().mockRejectedValue(new Error(saveFailedMsg)),
      });

      await performSave(user, triggerActionComplete);

      expect(mockBatchCancel).not.toHaveBeenCalled();
    });

    it("ignores a stray batchsave event after the failure", async () => {
      const { user, onSave, triggerActionComplete } = setup({
        onSave: jest.fn().mockRejectedValue(new Error(saveFailedMsg)),
      });

      await performSave(user, triggerActionComplete);
      await triggerActionComplete("batchsave");

      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("tolerates missing optional callbacks", async () => {
      const { user, triggerActionComplete } = setup({
        omitOptionalCallbacks: true,
        onSave: jest.fn().mockRejectedValue(new Error(saveFailedMsg)),
      });

      await performSaveAndClose(user, triggerActionComplete);

      expect(queryErrorModal()).toHaveTextContent(saveFailedMsg);
    });
  });

  /**********************
   * Retry after failure *
   **********************/

  describe("retrying", () => {
    it("lets the user Save again after a failed Save", async () => {
      const { user, onSave, onSaveComplete, triggerActionComplete } = setup();
      onSave.mockRejectedValueOnce(new Error(saveFailedMsg));

      await performSave(user, triggerActionComplete);
      expect(onSaveComplete).not.toHaveBeenCalled();

      await closeErrorModal(user);
      await performSave(user, triggerActionComplete);

      expect(onSave).toHaveBeenCalledTimes(2);
      expect(onSaveComplete).toHaveBeenCalledTimes(1);
      expect(queryErrorModal()).not.toBeInTheDocument();
    });

    it("a failed Save and Close does not make a later plain Save navigate", async () => {
      const {
        user,
        onSave,
        onSaveComplete,
        onNavigateAfterSave,
        triggerActionComplete,
      } = setup();
      onSave.mockRejectedValueOnce(new Error(saveFailedMsg));

      await performSaveAndClose(user, triggerActionComplete);
      await closeErrorModal(user);

      // close flag must have been reset by the failure
      await performSave(user, triggerActionComplete);

      expect(onSaveComplete).toHaveBeenCalledTimes(1);
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
    });

    it("Save and Close succeeds and navigates on retry after a failure", async () => {
      const {
        user,
        onSave,
        onSaveComplete,
        onNavigateAfterSave,
        triggerActionComplete,
      } = setup();
      onSave.mockRejectedValueOnce(new Error(saveFailedMsg));

      await performSaveAndClose(user, triggerActionComplete);
      expect(onNavigateAfterSave).not.toHaveBeenCalled();

      await closeErrorModal(user);
      await clickSaveAndClose(user);
      await triggerActionComplete("batchsave");

      expect(onSave).toHaveBeenCalledTimes(2);
      expect(onSaveComplete).toHaveBeenCalledTimes(1);
      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
    });
  });
});