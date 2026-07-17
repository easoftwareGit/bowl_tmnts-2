import { waitFor } from "@testing-library/react";
import {
  clickSave,
  getLatestErrorModalProps,
  mockBatchSave,
  mockSaveCell,
  setup,
  makeRows,
  savedRowsCopy,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

describe("PrizeFundGrid save validation", () => {
  beforeEach(standardBeforeEach);

  describe("total prize fund validation", () => {
    it("shows an error when the total prize fund does not match", async () => {
      const { user } = setup({
        totalPrizeFund: 300,
      });

      await clickSave(user);

      await waitFor(() => {
        expect(getLatestErrorModalProps()?.show).toBe(true);
      });

      expect(getLatestErrorModalProps()?.title).toBe(
        "Validate Error",
      );

      expect(getLatestErrorModalProps()?.message).toBe(
        'The sum of the "Amount" columns does not match the "Total Prize Fund" amount.',
      );

      expect(mockSaveCell).toHaveBeenCalledTimes(1);
      expect(mockBatchSave).not.toHaveBeenCalled();
    });

    it("shows the game prize fund message for pot prize funds", async () => {
      const { user } = setup({
        prizeFundType: "pot",
        totalPrizeFund: 300,
      });

      await clickSave(user);

      await waitFor(() => {
        expect(getLatestErrorModalProps()?.show).toBe(true);
      });

      expect(getLatestErrorModalProps()?.message).toBe(
        'The sum of the "Amount" columns does not match the "Game Prize Fund" amount.',
      );

      expect(mockBatchSave).not.toHaveBeenCalled();
    });

    it("shows the game prize fund message for elimination prize funds", async () => {
      const { user } = setup({
        prizeFundType: "elm",
        totalPrizeFund: 300,
      });

      await clickSave(user);

      await waitFor(() => {
        expect(getLatestErrorModalProps()?.show).toBe(true);
      });

      expect(getLatestErrorModalProps()?.message).toBe(
        'The sum of the "Amount" columns does not match the "Game Prize Fund" amount.',
      );

      expect(mockBatchSave).not.toHaveBeenCalled();
    });
  });

  describe("descending amount validation", () => {
    it("shows an error when a lower finishing position receives more prize money", async () => {
      const mRows = makeRows();
      const rows = savedRowsCopy(mRows.slice(0, 2)); 
      rows[1].amount = rows[0].amount! + 1;

      const { user } = setup({
        rows,
        currentRows: rows,
        totalPrizeFund: rows[0].amount! + rows[1].amount!,
      });

      await clickSave(user);

      await waitFor(() => {
        expect(getLatestErrorModalProps()?.show).toBe(true);
      });

      expect(getLatestErrorModalProps()?.title).toBe(
        "Validate Error",
      );

      expect(getLatestErrorModalProps()?.message).toBe(
        "A lower finishing position cannot receive more prize money than a higher finishing position.",
      );

      expect(mockBatchSave).not.toHaveBeenCalled();
    });

    it("allows prize fund amounts in descending order", async () => {
      const mRows = makeRows();
      const rows = savedRowsCopy(mRows)

      const { user } = setup({
        rows,
        currentRows: rows,
        totalPrizeFund: rows[0].amount! + rows[1].amount! + rows[2].amount!,
      });

      await clickSave(user);

      await waitFor(() => {
        expect(mockBatchSave).toHaveBeenCalledTimes(1);
      });

      expect(getLatestErrorModalProps()?.show).toBe(false);
    });
  });

  describe("changed batch records", () => {
    it("validates changed batch records instead of the original rows", async () => {
      const mRows = makeRows();
      const rows = savedRowsCopy(mRows)

      const { user } = setup({
        rows,
        currentRows: rows,
        changedRecords: [
          {
            ...rows[1],
            amount: 40,
            percentage: 0.2,
          },
          {
            ...rows[2],
            amount: 60,
            percentage: 0.3,
          },
        ],
      });

      await clickSave(user);

      await waitFor(() => {
        expect(getLatestErrorModalProps()?.show).toBe(true);
      });

      expect(getLatestErrorModalProps()?.message).toBe(
        "A lower finishing position cannot receive more prize money than a higher finishing position.",
      );

      expect(mockBatchSave).not.toHaveBeenCalled();
    });

    it("uses changed batch records when the edit fixes the validation error", async () => {
      const mRows = makeRows();
      const rows = savedRowsCopy(mRows.slice(0, 2)); 
      const tpf = rows[0].amount! + 80; // rows[0].amount! + 80, 100 + 80
      const { user } = setup({
        rows,
        currentRows: rows,
        changedRecords: [
          {
            ...rows[0],
            amount: 100,
            percentage: 100 / tpf,
          },
          {
            ...rows[1],
            amount: 80,
            percentage: 80 / tpf,
          },
        ],
        totalPrizeFund: tpf, // rows[0].amount! + rows[1].amount!, 100 + 80
      });

      await clickSave(user);

      await waitFor(() => {
        expect(mockBatchSave).toHaveBeenCalledTimes(1);
      });

      expect(getLatestErrorModalProps()?.show).toBe(false);
    });

  })
});