import {
  mockSetCellValue,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

import type { prizeFundEntryRow } from "@/lib/types/types";

const setupFirstRow = (
  totalPrizeFund = 200,
) => {
  const result = setup({
    totalPrizeFund,
  });

  return {
    ...result,
    row: {
      ...result.rows[0],
    },
  };
};

describe("PrizeFundGrid cell editing", () => {
  beforeEach(standardBeforeEach);

  describe("cellSaved", () => {
    it("updates the edited amount in the row", () => {
      const {
        rows,
        triggerCellSaved,
      } = setupFirstRow();

      const row: prizeFundEntryRow = {
        ...rows[0],
      };

      expect(row.amount).toBe(100);

      triggerCellSaved(
        row,
        "amount",
        125,
      );

      expect(row.amount).toBe(125);
    });

    it("recalculates the percentage after the amount changes", () => {
      const {
        rows,
        triggerCellSaved,
      } = setupFirstRow();

      const row: prizeFundEntryRow = {
        ...rows[0],
      };

      triggerCellSaved(
        row,
        "amount",
        125,
      );

      expect(mockSetCellValue).toHaveBeenCalledWith(
        row.id,
        "percentage",
        0.625, // 125 / 200
      );
    });

    it("sets the percentage to zero when the amount becomes zero", () => {
      const {
        rows,
        triggerCellSaved,
      } = setupFirstRow();

      const row: prizeFundEntryRow = {
        ...rows[0],
      };

      triggerCellSaved(
        row,
        "amount",
        0,
      );

      expect(mockSetCellValue).toHaveBeenCalledWith(
        row.id,
        "percentage",
        0,
      );
    });

    it("notifies the parent that the grid data changed", () => {
      const {
        rows,
        onGridDataChanged,
        triggerCellSaved,
      } = setupFirstRow();

      const row: prizeFundEntryRow = {
        ...rows[0],
      };

      triggerCellSaved(
        row,
        "amount",
        125,
      );

      expect(onGridDataChanged).toHaveBeenCalledTimes(1);
    });

    it("does not change the public grid rows until Syncfusion updates them", () => {
      const {
        rows,
        gridHandleRef,
        triggerCellSaved,
      } = setupFirstRow();

      const row = {
        ...rows[0],
      };

      triggerCellSaved(
        row,
        "amount",
        125,
      );

      expect(
        gridHandleRef.current?.getCurrentRows(),
      ).toEqual(rows);
    });

  });
});