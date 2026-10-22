import { act, screen } from "@testing-library/react";
import {
  clickToolbarButton,
  getLatestConfirmModalProps,
  getLatestGridProps,
  makeRows,
  mockBatchCancel,
  mockBatchSave,
  mockClearSelection,
  mockEditCell,
  mockEnableItems,
  mockSaveCell,
  mockSelectCell,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * Scope of this file:
 *   - toolbar enabled/disabled state (enableItems)
 *   - each toolbar button routes to the right action
 *
 * Detailed behavior lives in the feature files:
 *   - Edit row selection          -> interactions / recordClick
 *   - Cancel Yes / No             -> cancelConfirmation
 *   - Save validation and results -> saveValidation / saveSuccessful / saveClose
 */

const EDIT_ITEMS = ["edit"];
const CHANGE_ITEMS = ["save", "done", "undo_all"];

describe("PrizeFundGrid toolbar", () => {
  beforeEach(standardBeforeEach);

  /*****************
   * Toolbar state *
   *****************/

  describe("toolbar state", () => {
    it("updates both toolbar groups once on the initial render", () => {
      setup();

      expect(mockEnableItems).toHaveBeenCalledTimes(2);
    });

    describe("Edit", () => {
      it("is enabled when editing is enabled and rows exist", () => {
        setup({ rows: makeRows(), enableEditing: true });

        expect(mockEnableItems).toHaveBeenCalledWith(EDIT_ITEMS, true);
      });

      it("is disabled when there are no rows", () => {
        setup({ rows: [], enableEditing: true });

        expect(mockEnableItems).toHaveBeenCalledWith(EDIT_ITEMS, false);
      });

      it("is disabled when enableEditing is false", () => {
        setup({ rows: makeRows(), enableEditing: false });

        expect(mockEnableItems).toHaveBeenCalledWith(EDIT_ITEMS, false);
      });

      it("becomes enabled when rows are added", () => {
        const { rerender } = setup({ rows: [] });

        mockEnableItems.mockClear();
        rerender({ rows: makeRows() });

        expect(mockEnableItems).toHaveBeenCalledWith(EDIT_ITEMS, true);
      });

      it("becomes disabled when enableEditing changes to false", () => {
        const { rerender } = setup({ enableEditing: true });

        mockEnableItems.mockClear();
        rerender({ enableEditing: false });

        expect(mockEnableItems).toHaveBeenCalledWith(EDIT_ITEMS, false);
      });
    });

    describe("Save, Save and Close, and Cancel", () => {
      it("are disabled when grid data has not changed", () => {
        setup({ gridDataWasChanged: false });

        expect(mockEnableItems).toHaveBeenCalledWith(CHANGE_ITEMS, false);
      });

      it("are enabled when grid data has changed", () => {
        setup({ gridDataWasChanged: true });

        expect(mockEnableItems).toHaveBeenCalledWith(CHANGE_ITEMS, true);
      });

      it("become enabled when gridDataWasChanged changes to true", () => {
        const { rerender } = setup({ gridDataWasChanged: false });

        mockEnableItems.mockClear();
        rerender({ gridDataWasChanged: true });

        expect(mockEnableItems).toHaveBeenCalledWith(CHANGE_ITEMS, true);
      });

      it("become disabled when gridDataWasChanged changes back to false", () => {
        const { rerender } = setup({ gridDataWasChanged: true });

        mockEnableItems.mockClear();
        rerender({ gridDataWasChanged: false });

        expect(mockEnableItems).toHaveBeenCalledWith(CHANGE_ITEMS, false);
      });

      it("are disabled by default when gridDataWasChanged is not supplied", () => {
        const { rerender } = setup({ gridDataWasChanged: true });

        mockEnableItems.mockClear();
        rerender({
          gridDataWasChanged: undefined as unknown as boolean,
        });

        expect(mockEnableItems).toHaveBeenCalledWith(CHANGE_ITEMS, false);
      });
    });

    it("does not update the toolbar when unrelated props change", () => {
      const { rerender } = setup();

      mockEnableItems.mockClear();
      rerender({ saveStatus: "saving" });

      expect(mockEnableItems).not.toHaveBeenCalled();
    });
  });

  /******************
   * Button routing *
   ******************/

  describe("Edit button", () => {
    it("selects and edits the amount cell", async () => {
      const { user } = setup();

      await clickToolbarButton(user, "Edit");

      // amount is index 2 in the visible columns
      expect(mockSelectCell).toHaveBeenCalledWith({ rowIndex: 0, cellIndex: 2 });
      expect(mockEditCell).toHaveBeenCalledWith(0, "amount");
    });

    it("does not start editing when there are no rows", async () => {
      const { user } = setup({ rows: [] });

      await clickToolbarButton(user, "Edit");

      expect(mockSelectCell).not.toHaveBeenCalled();
      expect(mockEditCell).not.toHaveBeenCalled();
    });

    it("does not start editing when enableEditing is false", async () => {
      const { user } = setup({ enableEditing: false });

      await clickToolbarButton(user, "Edit");

      expect(mockSelectCell).not.toHaveBeenCalled();
      expect(mockEditCell).not.toHaveBeenCalled();
    });
  });

  describe("Save button", () => {
    it("commits the open cell, then starts a batch save", async () => {
      const { user, onSave } = setup();

      await clickToolbarButton(user, "Save");

      expect(mockSaveCell).toHaveBeenCalledTimes(1);
      expect(mockBatchSave).toHaveBeenCalledTimes(1);
      expect(mockSaveCell.mock.invocationCallOrder[0]).toBeLessThan(
        mockBatchSave.mock.invocationCallOrder[0],
      );

      // onSave waits for the grid's batchsave actionComplete
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe("Save and Close button", () => {
    it("commits the open cell, then starts a batch save", async () => {
      const { user, onSave, onNavigateAfterSave } = setup();

      await clickToolbarButton(user, "Save and Close");

      expect(mockSaveCell).toHaveBeenCalledTimes(1);
      expect(mockBatchSave).toHaveBeenCalledTimes(1);

      // nothing happens until the grid's batchsave actionComplete
      expect(onSave).not.toHaveBeenCalled();
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
    });
  });

  describe("Cancel button", () => {
    it("opens the cancel confirmation without cancelling yet", async () => {
      const { user, onGridDataReset, onCancel } = setup();

      await clickToolbarButton(user, "Cancel");

      expect(
        screen.getByRole("dialog", { name: "confirm-modal" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Confirm Cancel")).toBeInTheDocument();
      expect(screen.getByText("Do you want to cancel edits?")).toBeInTheDocument();
      expect(getLatestConfirmModalProps()?.show).toBe(true);

      expect(mockBatchCancel).not.toHaveBeenCalled();
      expect(mockClearSelection).not.toHaveBeenCalled();
      expect(onGridDataReset).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("Back button", () => {
    it("calls onBack without touching the grid", async () => {
      const { user, onBack } = setup();

      await clickToolbarButton(user, "Back");

      expect(onBack).toHaveBeenCalledTimes(1);
      expect(mockSaveCell).not.toHaveBeenCalled();
      expect(mockBatchSave).not.toHaveBeenCalled();
      expect(mockBatchCancel).not.toHaveBeenCalled();
    });
  });

  it("ignores an unknown toolbar item id", () => {
    const { onBack } = setup();

    act(() => {
      getLatestGridProps()?.toolbarClick?.({ item: { id: "unknown" } });
    });

    expect(onBack).not.toHaveBeenCalled();
    expect(mockSelectCell).not.toHaveBeenCalled();
    expect(mockSaveCell).not.toHaveBeenCalled();
    expect(mockBatchSave).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
