import { screen } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {  
  makeRows,
  setup,
  standardBeforeEach,
  mockSetCellValue,
  getLatestGridProps,
  getLatestConfirmModalProps,
  getLatestErrorModalProps,
  mockSaveCell,
  savedRowsCopy,
} from "./prizeFundGrid.testSetup";

/**
* Props captured from the mocked Syncfusion GridComponent.
*
* These callbacks let the tests trigger Syncfusion events without rendering
* the real Syncfusion grid.
*/

describe("PrizeFundGrid interactions", () => {

  beforeEach(standardBeforeEach);

  describe("test infrastructure", () => {
    it("connects the grid mock, modal mocks, and helper functions", async () => {
      const {
        user,
        rows,
        gridHandleRef,
        onBack,
        onGridDataChanged,
        triggerCellSaved,
        triggerRecordClick,
        triggerRecordDoubleClick,
        triggerActionComplete,
      } = setup();

      expect(
        screen.getByTestId("mock-prize-fund-grid"),
      ).toBeInTheDocument();

      const gridProps = getLatestGridProps();
      expect(gridProps).not.toBeNull();
      expect(gridProps?.dataSource).toEqual(rows);

      expect(gridProps?.toolbarClick).toEqual(
        expect.any(Function),
      );
      expect(gridProps?.actionComplete).toEqual(
        expect.any(Function),
      );
      expect(gridProps?.cellSaved).toEqual(
        expect.any(Function),
      );
      expect(gridProps?.recordClick).toEqual(
        expect.any(Function),
      );
      expect(gridProps?.recordDoubleClick).toEqual(
        expect.any(Function),
      );
      expect(gridHandleRef.current).not.toBeNull();
      expect(gridHandleRef.current?.getCurrentRows).toEqual(
        expect.any(Function),
      );

      expect(gridHandleRef.current?.getCurrentRows()).toEqual(rows);      

      const confirmProps = getLatestConfirmModalProps();
      expect(confirmProps).not.toBeNull();
      expect(confirmProps?.show).toBe(false);

      const errorProps = getLatestErrorModalProps();
      expect(errorProps).not.toBeNull();
      expect(errorProps?.show).toBe(false);

      triggerRecordClick(1);
      triggerRecordDoubleClick(2);

      const rowData: prizeFundEntryRow = {
        ...rows[0],
      };

      triggerCellSaved(
        rowData,
        "amount",
        100,
      );

      expect(rowData.amount).toBe(100);

      expect(mockSetCellValue).toHaveBeenCalledWith(
        rows[0].id,
        "percentage",
        0.5,
      );

      expect(onGridDataChanged).toHaveBeenCalledTimes(1);

      await triggerActionComplete("refresh");

      expect(onBack).not.toHaveBeenCalled();

      await user.click(
        screen.getByRole("button", {
          name: "Back",
        }),
      );

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("returns merged grid rows through the public handle", () => {
      const mRows = makeRows();
      const rows = savedRowsCopy(mRows.slice(0, 2));

      const {
        gridHandleRef,
      } = setup({
        rows,
        currentRows: rows,
        changedRecords: [
          {
            ...rows[1],
            amount: 80,
          },
        ],
      });

      expect(gridHandleRef.current?.getCurrentRows()).toEqual([
        rows[0],
        {
          ...rows[1],
          amount: 80,
        },
      ]);
    });    

    it("includes added batch rows in getCurrentRows()", () => {
      const mRows = makeRows();
      const currentRows = savedRowsCopy(mRows.slice(0, 2)); 
      const [addedRow] = savedRowsCopy(mRows.slice(2, 3));

      const { gridHandleRef } = setup({
        rows: currentRows,
        currentRows,
        addedRecords: [addedRow],
      });

      const actualRows = gridHandleRef.current?.getCurrentRows();

      expect(mockSaveCell).toHaveBeenCalledTimes(1);

      expect(actualRows).toEqual([
        currentRows[0],
        currentRows[1],
        addedRow,
      ]);
    });    

    it("removes deleted batch rows from getCurrentRows()", () => {
      const mRows = makeRows();
      const currentRows = savedRowsCopy(mRows)
      const deletedRow = currentRows[1];

      const { gridHandleRef } = setup({
        rows: currentRows,
        currentRows,
        deletedRecords: [deletedRow],
      });

      const actualRows =
        gridHandleRef.current?.getCurrentRows();

      expect(mockSaveCell).toHaveBeenCalledTimes(1);

      expect(actualRows).toEqual([
        currentRows[0],
        currentRows[2],
      ]);

      expect(
        actualRows?.some(
          (row) => row.id === deletedRow.id,
        ),
      ).toBe(false);
    });
    
  });

});