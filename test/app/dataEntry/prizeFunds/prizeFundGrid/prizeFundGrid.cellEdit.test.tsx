import { act } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {
  defaultTotalPrizeFund,
  getLatestGridProps,
  mockSetCellValue,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * cellSaved fires after Syncfusion commits one edited cell. The component:
 *   1. writes the new value into rowData (Syncfusion's row object)
 *   2. recalculates that row's percentage = amount / rounded total
 *   3. pushes the percentage into the grid with setCellValue
 *   4. tells the parent the data changed
 *
 * rowData is mutated in place, so each test edits its own copy of a row.
 */

/** setup() plus a fresh copy of the first row (amount 100) to edit. */
const setupWithRow = (options?: Parameters<typeof setup>[0]) => {
  const result = setup(options);
  const row: prizeFundEntryRow = { ...result.rows[0] };

  return { ...result, row };
};

describe("PrizeFundGrid cell editing", () => {
  beforeEach(standardBeforeEach);

  /**************
   * Row update *
   **************/

  describe("row update", () => {
    it("writes the edited amount into the row", () => {
      const { row, triggerCellSaved } = setupWithRow();

      triggerCellSaved(row, "amount", 125);

      expect(row.amount).toBe(125);
    });

    it("writes the value into whichever column was edited", () => {
      const { row, triggerCellSaved } = setupWithRow();

      triggerCellSaved(row, "position", 9);

      expect(row.position).toBe(9);
      expect(row.amount).toBe(100);
    });
  });

  /**************************
   * Percentage calculation *
   **************************/

  describe("percentage", () => {
    it("recalculates the row percentage from the new amount", () => {
      const { row, triggerCellSaved } = setupWithRow(); // total 200

      triggerCellSaved(row, "amount", 125);

      expect(mockSetCellValue).toHaveBeenCalledTimes(1);
      expect(mockSetCellValue).toHaveBeenCalledWith(row.id, "percentage", 0.625);
    });

    it("recalculates from the row's existing amount when another column is edited", () => {
      const { row, triggerCellSaved } = setupWithRow();

      triggerCellSaved(row, "position", 9);

      expect(mockSetCellValue).toHaveBeenCalledWith(row.id, "percentage", 0.5);
    });

    it("accepts a numeric string from the editor", () => {
      const { row, triggerCellSaved } = setupWithRow();

      triggerCellSaved(row, "amount", "125");

      expect(mockSetCellValue).toHaveBeenCalledWith(row.id, "percentage", 0.625);
    });

    it.each([
      ["zero", 0],
      ["empty", ""],
      ["null", null],
      ["non-numeric", "abc"],
    ])("sets the percentage to 0 when the amount is %s", (_label, value) => {
      const { row, triggerCellSaved } = setupWithRow();

      triggerCellSaved(row, "amount", value);

      expect(mockSetCellValue).toHaveBeenCalledWith(row.id, "percentage", 0);
    });

    it("sets the percentage to 0 instead of dividing when the total is 0", () => {
      const { row, triggerCellSaved } = setupWithRow({ totalPrizeFund: 0 });

      triggerCellSaved(row, "amount", 125);

      expect(mockSetCellValue).toHaveBeenCalledWith(row.id, "percentage", 0);
    });

    it("divides by the total rounded to two decimals", () => {
      const { row, triggerCellSaved } = setupWithRow({
        totalPrizeFund: defaultTotalPrizeFund + 0.004, // rounds to 200
      });

      triggerCellSaved(row, "amount", 125);

      expect(mockSetCellValue).toHaveBeenCalledWith(row.id, "percentage", 0.625);
    });

    it("uses the latest total after the total prize fund changes", () => {
      const { row, triggerCellSaved, rerenderWithTotalPrizeFund } =
        setupWithRow();

      rerenderWithTotalPrizeFund(250);
      triggerCellSaved(row, "amount", 125);

      expect(mockSetCellValue).toHaveBeenCalledWith(row.id, "percentage", 0.5);
    });

    it("does not set a percentage when the row has no id", () => {
      const { row, triggerCellSaved, onGridDataChanged } = setupWithRow();

      triggerCellSaved({ ...row, id: "" }, "amount", 125);

      expect(mockSetCellValue).not.toHaveBeenCalled();
      // the edit still counts as a change
      expect(onGridDataChanged).toHaveBeenCalledTimes(1);
    });
  });

  /*******************
   * Parent updates  *
   *******************/

  describe("parent notification", () => {
    it("notifies the parent once per saved cell", () => {
      const { row, triggerCellSaved, onGridDataChanged } = setupWithRow();

      triggerCellSaved(row, "amount", 125);
      triggerCellSaved(row, "amount", 110);

      expect(onGridDataChanged).toHaveBeenCalledTimes(2);
    });

    it("does not push rows to the parent; edits stay in the grid until Save", () => {
      const { row, triggerCellSaved, setRows, onSave } = setupWithRow();

      triggerCellSaved(row, "amount", 125);

      expect(setRows).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("ignores a cellSaved event with no row data", () => {
      const { onGridDataChanged } = setupWithRow();

      act(() => {
        getLatestGridProps()?.cellSaved?.({ columnName: "amount", value: 125 });
      });

      expect(mockSetCellValue).not.toHaveBeenCalled();
      expect(onGridDataChanged).not.toHaveBeenCalled();
    });
  });
});
