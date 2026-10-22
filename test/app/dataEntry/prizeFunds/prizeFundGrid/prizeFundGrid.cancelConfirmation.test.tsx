import { act, screen } from "@testing-library/react";
import {
  clickConfirmNo,
  clickConfirmYes,
  getLatestConfirmModalProps,
  mockBatchCancel,
  mockBatchSave,
  mockClearSelection,
  openCancelConfirmation,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * Opening the dialog (title, message, nothing cancelled yet) is covered in
 * toolbar.test. This file covers what Yes and No do afterwards.
 */

const expectDialogClosed = (): void => {
  expect(
    screen.queryByRole("dialog", { name: "confirm-modal" }),
  ).not.toBeInTheDocument();
  expect(getLatestConfirmModalProps()?.show).toBe(false);
};

describe("PrizeFundGrid cancel confirmation", () => {
  beforeEach(standardBeforeEach);

  /*******
   * Yes *
   *******/

  describe("Yes", () => {
    it("cancels the batch edits, clears the selection, and notifies the parent", async () => {
      const { user, onGridDataReset, onCancel } = setup({
        gridDataWasChanged: true,
      });

      await openCancelConfirmation(user);
      await clickConfirmYes(user);

      expect(mockBatchCancel).toHaveBeenCalledTimes(1);
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
      expect(onGridDataReset).toHaveBeenCalledTimes(1);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("undoes the grid edits before notifying the parent", async () => {
      const { user, onGridDataReset, onCancel } = setup();

      await openCancelConfirmation(user);
      await clickConfirmYes(user);

      const order = [
        mockBatchCancel,
        mockClearSelection,
        onGridDataReset,
        onCancel,
      ].map((fn) => fn.mock.invocationCallOrder[0]);

      expect(order).toEqual([...order].sort((a, b) => a - b));
    });

    it("closes the dialog", async () => {
      const { user } = setup();

      await openCancelConfirmation(user);
      await clickConfirmYes(user);

      expectDialogClosed();
    });

    it("does not save, navigate, or push rows to the parent", async () => {
      const { user, onSave, onBack, onNavigateAfterSave, setRows, onGridDataChanged } =
        setup();

      await openCancelConfirmation(user);
      await clickConfirmYes(user);

      expect(mockBatchSave).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
      expect(onBack).not.toHaveBeenCalled();
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
      expect(setRows).not.toHaveBeenCalled();
      expect(onGridDataChanged).not.toHaveBeenCalled();
    });

    it("works when the parent does not supply onGridDataReset or onCancel", async () => {
      const { user } = setup({ omitOptionalCallbacks: true });

      await openCancelConfirmation(user);
      await clickConfirmYes(user);

      expect(mockBatchCancel).toHaveBeenCalledTimes(1);
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
      expectDialogClosed();
    });

    it("can cancel again after a previous cancel", async () => {
      const { user, onCancel } = setup();

      await openCancelConfirmation(user);
      await clickConfirmYes(user);
      await openCancelConfirmation(user);
      await clickConfirmYes(user);

      expect(mockBatchCancel).toHaveBeenCalledTimes(2);
      expect(onCancel).toHaveBeenCalledTimes(2);
    });
  });

  /******
   * No *
   ******/

  describe("No", () => {
    it("closes the dialog without cancelling anything", async () => {
      const { user, onGridDataReset, onCancel } = setup({
        gridDataWasChanged: true,
      });

      await openCancelConfirmation(user);
      await clickConfirmNo(user);

      expectDialogClosed();
      expect(mockBatchCancel).not.toHaveBeenCalled();
      expect(mockClearSelection).not.toHaveBeenCalled();
      expect(onGridDataReset).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("lets the user open the dialog again and confirm", async () => {
      const { user, onCancel } = setup();

      await openCancelConfirmation(user);
      await clickConfirmNo(user);
      await openCancelConfirmation(user);
      await clickConfirmYes(user);

      expect(mockBatchCancel).toHaveBeenCalledTimes(1);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  /**************
   * Edge cases *
   **************/

  it("ignores a confirm when the cancel dialog was never opened", async () => {
    const { onGridDataReset, onCancel } = setup();

    // The modal's onConfirm only acts when the dialog was opened by Cancel.
    await act(async () => {
      await getLatestConfirmModalProps()?.onConfirm();
    });

    expect(mockBatchCancel).not.toHaveBeenCalled();
    expect(mockClearSelection).not.toHaveBeenCalled();
    expect(onGridDataReset).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
