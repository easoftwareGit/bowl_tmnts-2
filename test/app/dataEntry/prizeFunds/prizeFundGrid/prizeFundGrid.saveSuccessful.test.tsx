import { waitFor } from "@testing-library/react";
import {
  clickSave,
  clickSaveAndClose,
  mockBatchSave,
  savedRowsCopy,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";
import type { prizeFundEntryRow } from "@/lib/types/types";

describe("PrizeFundGrid successful save", () => {
  beforeEach(standardBeforeEach);

  describe("Save", () => {
    it("calls onSave with the current grid rows", async () => {
      const {
        user,
        rows,
        onSave,
        triggerActionComplete,
      } = setup();

      await clickSave(user);

      await waitFor(() => {
        expect(mockBatchSave).toHaveBeenCalledTimes(1);
      });

      await triggerActionComplete("batchsave");

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(rows);
    });

    it("calls onSaveComplete with a copy of the saved rows", async () => {
      const {
        user,
        rows,
        onSaveComplete,
        triggerActionComplete,
      } = setup();

      const expectedSavedRows = savedRowsCopy(rows);

      await clickSave(user);

      await waitFor(() => {
        expect(mockBatchSave).toHaveBeenCalledTimes(1);
      });

      await triggerActionComplete("batchsave");

      expect(onSaveComplete).toHaveBeenCalledTimes(1);
      expect(onSaveComplete).toHaveBeenCalledWith(
        expectedSavedRows,
      );
      
      const actualSavedRows = onSaveComplete.mock.calls[0][0] as prizeFundEntryRow[];

      expect(actualSavedRows).not.toBe(rows);

      actualSavedRows.forEach((row: prizeFundEntryRow, index: number) => {
        expect(row).not.toBe(rows[index]);
      });      
    });

    it("updates the component rows with a copy of the saved rows", async () => {
      const {
        user,
        rows,
        setRows,
        triggerActionComplete,
      } = setup();

      const expectedSavedRows = savedRowsCopy(rows);

      await clickSave(user);

      await waitFor(() => {
        expect(mockBatchSave).toHaveBeenCalledTimes(1);
      });

      await triggerActionComplete("batchsave");

      expect(setRows).toHaveBeenCalledTimes(1);
      expect(setRows).toHaveBeenCalledWith(
        expectedSavedRows,
      );
      
      const actualSavedRows = setRows.mock.calls[0][0] as prizeFundEntryRow[];

      expect(actualSavedRows).not.toBe(rows);

      actualSavedRows.forEach((row, index) => {
        expect(row).not.toBe(rows[index]);
      });      
    });
  });

  describe("Save and Close", () => {
    it("saves, calls onSaveComplete twice, navigates, and does not update component rows", async () => {
      const {
        user,
        rows,
        onSave,
        onSaveComplete,
        onNavigateAfterSave,
        setRows,
        triggerActionComplete,
      } = setup();

      const expectedSavedRows = savedRowsCopy(rows);

      await clickSaveAndClose(user);

      await waitFor(() => {
        expect(mockBatchSave).toHaveBeenCalledTimes(1);
      });

      await triggerActionComplete("batchsave");

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(rows);

      expect(onSaveComplete).toHaveBeenCalledTimes(2);
      expect(onSaveComplete).toHaveBeenNthCalledWith(
        1,
        expectedSavedRows,
      );
      expect(onSaveComplete).toHaveBeenNthCalledWith(
        2,
        expectedSavedRows,
      );

      expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
      expect(setRows).not.toHaveBeenCalled();
    });
  });
});
