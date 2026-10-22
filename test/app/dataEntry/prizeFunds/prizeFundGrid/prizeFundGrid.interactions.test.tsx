import { screen } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {
  clickEdit,
  flushTimeouts,
  getCurrentRowsFromHandle,
  makeRows,
  mockEditCell,
  mockGetBatchChanges,
  mockGetCurrentViewRecords,
  mockSaveCell,
  mockSelectCell,
  savedRowsCopy,
  setBatchChanges,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * Scope of this file:
 *   - the public handle the parent page uses: getCurrentRows()
 *   - Edit toolbar mechanics: column lookup and the deferred editCell
 *
 * Row choice for Edit lives in recordClick.test; toolbar enable/disable
 * and button routing live in toolbar.test.
 */

const withAmount = (
  row: prizeFundEntryRow,
  amount: number,
): prizeFundEntryRow => ({ ...row, amount });

describe("PrizeFundGrid interactions", () => {
  beforeEach(standardBeforeEach);

  /*****************************
   * getCurrentRows (the handle) *
   *****************************/

  describe("getCurrentRows()", () => {
    it("returns the current grid rows when there are no batch changes", () => {
      const { gridHandleRef, rows } = setup();

      expect(getCurrentRowsFromHandle(gridHandleRef)).toEqual(rows);
    });

    it("commits the open cell before reading the grid", () => {
      const { gridHandleRef } = setup();

      getCurrentRowsFromHandle(gridHandleRef);

      expect(mockSaveCell).toHaveBeenCalledTimes(1);
      expect(mockSaveCell.mock.invocationCallOrder[0]).toBeLessThan(
        mockGetCurrentViewRecords.mock.invocationCallOrder[0],
      );
    });

    it("merges changed records into their rows", () => {
      const currentRows = makeRows();
      const { gridHandleRef } = setup({
        currentRows,
        changedRecords: [withAmount(currentRows[1], 80)],
      });

      expect(getCurrentRowsFromHandle(gridHandleRef)).toEqual([
        currentRows[0],
        withAmount(currentRows[1], 80),
        currentRows[2],
      ]);
    });

    it("ignores changed records whose id is not in the grid", () => {
      const currentRows = makeRows();
      const strayRow = { ...currentRows[0], id: "dpf_not_in_grid", amount: 999 };

      const { gridHandleRef } = setup({
        currentRows,
        changedRecords: [strayRow],
      });

      expect(getCurrentRowsFromHandle(gridHandleRef)).toEqual(currentRows);
    });

    it("appends added rows after the existing rows", () => {
      const allRows = makeRows();
      const currentRows = allRows.slice(0, 2);
      const addedRow = allRows[2];

      const { gridHandleRef } = setup({
        rows: currentRows,
        currentRows,
        addedRecords: [addedRow],
      });

      expect(getCurrentRowsFromHandle(gridHandleRef)).toEqual([
        currentRows[0],
        currentRows[1],
        addedRow,
      ]);
    });

    it("removes deleted rows", () => {
      const currentRows = makeRows();

      const { gridHandleRef } = setup({
        currentRows,
        deletedRecords: [currentRows[1]],
      });

      const result = getCurrentRowsFromHandle(gridHandleRef);

      expect(result).toEqual([currentRows[0], currentRows[2]]);
      expect(result.some((row) => row.id === currentRows[1].id)).toBe(false);
    });

    it("applies changed, added, and deleted records together", () => {
      const allRows = makeRows();
      const currentRows = allRows.slice(0, 2);
      const addedRow = withAmount(allRows[2], 30);

      const { gridHandleRef } = setup({
        rows: currentRows,
        currentRows,
        changedRecords: [withAmount(currentRows[0], 120)],
        deletedRecords: [currentRows[1]],
        addedRecords: [addedRow],
      });

      expect(getCurrentRowsFromHandle(gridHandleRef)).toEqual([
        withAmount(currentRows[0], 120),
        addedRow,
      ]);
    });

    it("handles a batch-changes object with missing lists", () => {
      const { gridHandleRef, rows } = setup();

      mockGetBatchChanges.mockReturnValue({});

      expect(getCurrentRowsFromHandle(gridHandleRef)).toEqual(rows);
    });

    it("returns copies, so changing the result does not change the grid's rows", () => {
      const currentRows = makeRows();
      const addedRow = withAmount(makeRows()[2], 30);

      const { gridHandleRef } = setup({
        currentRows,
        addedRecords: [addedRow],
      });

      const result = getCurrentRowsFromHandle(gridHandleRef);
      result[0].amount = 1;
      result[result.length - 1].amount = 1;

      expect(currentRows[0].amount).toBe(100);
      expect(addedRow.amount).toBe(30);
    });

    it("reflects the grid's latest batch changes on each call", () => {
      const currentRows = makeRows();
      const { gridHandleRef } = setup({ currentRows });

      expect(getCurrentRowsFromHandle(gridHandleRef)[1].amount).toBe(60);

      setBatchChanges({ changedRecords: [withAmount(currentRows[1], 55)] });

      expect(getCurrentRowsFromHandle(gridHandleRef)[1].amount).toBe(55);
    });

    it("does not notify the parent that data changed", () => {
      const { gridHandleRef, onGridDataChanged, setRows } = setup();

      getCurrentRowsFromHandle(gridHandleRef);

      expect(onGridDataChanged).not.toHaveBeenCalled();
      expect(setRows).not.toHaveBeenCalled();
    });

    it("still works after the rows prop changes", () => {
      const newRows = savedRowsCopy(makeRows()).map((row) =>
        withAmount(row, row.amount * 2),
      );
      const { gridHandleRef, rerender } = setup();

      rerender({ rows: newRows });
      mockGetCurrentViewRecords.mockReturnValue(savedRowsCopy(newRows));

      expect(getCurrentRowsFromHandle(gridHandleRef)).toEqual(newRows);
    });
  });

  /******************
   * Edit mechanics *
   ******************/

  describe("Edit mechanics", () => {
    it("selects the cell right away and opens the editor after a tick", async () => {
      const { user } = setup();

      // click without the helper's built-in flush
      await user.click(screen.getByRole("button", { name: "Edit" }));

      expect(mockSelectCell).toHaveBeenCalledTimes(1);

      await flushTimeouts();

      expect(mockEditCell).toHaveBeenCalledTimes(1);
      expect(mockSelectCell.mock.invocationCallOrder[0]).toBeLessThan(
        mockEditCell.mock.invocationCallOrder[0],
      );
    });

    it("uses the amount column's position among the visible columns", async () => {
      const { user } = setup({
        visibleColumns: [{ field: "position" }, { field: "amount" }],
      });

      await clickEdit(user);

      expect(mockSelectCell).toHaveBeenCalledWith({ rowIndex: 0, cellIndex: 1 });
      expect(mockEditCell).toHaveBeenCalledWith(0, "amount");
    });

    it("does nothing when the amount column is not visible", async () => {
      const { user } = setup({
        visibleColumns: [{ field: "position" }, { field: "percentage" }],
      });

      await clickEdit(user);

      expect(mockSelectCell).not.toHaveBeenCalled();
      expect(mockEditCell).not.toHaveBeenCalled();
    });

    it("does not mark the data as changed just by starting an edit", async () => {
      const { user, onGridDataChanged } = setup();

      await clickEdit(user);

      expect(onGridDataChanged).not.toHaveBeenCalled();
    });
  });
});
