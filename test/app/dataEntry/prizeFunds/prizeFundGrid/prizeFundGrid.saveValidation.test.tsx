import { screen, within } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {
  clickSave,
  clickSaveAndClose,
  closeErrorModal,
  defaultTotalPrizeFund,
  getLatestErrorModalProps,
  makeRows,
  mockBatchSave,
  mockSaveCell,
  setCurrentRows,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";
import { maxMoney } from "@/lib/validation/constants";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";

/*
 * Validation runs (after a setTimeout, which clickSave flushes) in this order:
 *   1. sum of amounts === rounded total prize fund
 *   2. at least one row
 *   3. each amount is between 1 and maxMoney
 *   4. amounts never increase from one position to the next
 * The first failure shows the error modal and batchSave is not called.
 *
 * What happens after a successful batchSave is covered in
 * saveSuccessful.test and saveClose.test.
 */

/***************
 * Error texts *
 ***************/

const MSG = {
  totalDiv:
    'The sum of the "Amount" columns does not match the "Total Prize Fund" amount.',
  totalGame:
    'The sum of the "Amount" columns does not match the "Game Prize Fund" amount.',
  noRows: "Prize amounts must have at least one row.",
  range: `Prize amounts must be between ${formatValueSymbSep2Dec(
    "1.00",
    localConfig,
  )} and ${formatValueSymbSep2Dec(maxMoney.toString(), localConfig)}.`,
  sequence: "Prize amounts must be in descending order of finishing position.",
};

/***********
 * Helpers *
 ***********/

/** Builds rows (position 1..n) with the given amounts. */
const rowsWithAmounts = (amounts: number[]): prizeFundEntryRow[] =>
  amounts.map((amount, index) => ({
    id: `dpf_${String(index + 1).padStart(32, "0")}`,
    parent_id: "div_00000000000000000000000000000001",
    position: index + 1,
    amount,
    percentage: 0,
  }));

const sumOf = (amounts: number[]): number =>
  amounts.reduce((sum, amount) => sum + amount, 0);

/**
 * Sets up the grid showing the given amounts. The total prize fund
 * defaults to their sum so only the check under test can fail.
 */
const setupWithAmounts = (
  amounts: number[],
  options: Parameters<typeof setup>[0] = {},
) => {
  const rows = rowsWithAmounts(amounts);

  return setup({
    rows,
    currentRows: rows,
    totalPrizeFund: sumOf(amounts),
    ...options,
  });
};

const expectValidationError = (message: string): void => {
  const alert = screen.getByRole("alert");

  expect(within(alert).getByText("Validate Error")).toBeInTheDocument();
  expect(within(alert).getByText(message)).toBeInTheDocument();
  expect(getLatestErrorModalProps()?.show).toBe(true);
  expect(mockBatchSave).not.toHaveBeenCalled();
};

const expectSaveStarted = (): void => {
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(mockBatchSave).toHaveBeenCalledTimes(1);
};

describe("PrizeFundGrid save validation", () => {
  beforeEach(standardBeforeEach);

  /*********************
   * 1. Total matching *
   *********************/

  describe("total prize fund", () => {
    it("shows the Total Prize Fund message for division prize funds", async () => {
      const { user } = setup({ prizeFundType: "div", totalPrizeFund: 300 });

      await clickSave(user);

      expectValidationError(MSG.totalDiv);
    });

    it.each(["pot", "elm"] as const)(
      "shows the Game Prize Fund message for %s prize funds",
      async (prizeFundType) => {
        const { user } = setup({ prizeFundType, totalPrizeFund: 300 });

        await clickSave(user);

        expectValidationError(MSG.totalGame);
      },
    );

    it("fails when the total is off by one cent", async () => {
      const { user } = setup({ totalPrizeFund: defaultTotalPrizeFund + 0.01 });

      await clickSave(user);

      expectValidationError(MSG.totalDiv);
    });

    it("passes when the amounts only differ from the total by floating-point error", async () => {
      // 10.10 + 20.20 + 9.70 === 39.99999999999999 in JavaScript
      const { user } = setupWithAmounts([20.2, 10.1, 9.7], {
        totalPrizeFund: 40,
      });

      await clickSave(user);

      expectSaveStarted();
    });

    it("rounds the total prize fund prop before comparing", async () => {
      const { user } = setup({ totalPrizeFund: defaultTotalPrizeFund + 0.004 });

      await clickSave(user);

      expectSaveStarted();
    });

    it("uses changed batch records when summing the amounts", async () => {
      const rows = makeRows();
      const { user } = setup({
        currentRows: rows,
        changedRecords: [{ ...rows[2], amount: 30 }], // sum is now 190
      });

      await clickSave(user);

      expectValidationError(MSG.totalDiv);
    });

    it("is checked before the other rules", async () => {
      // ascending AND wrong total: the total message wins
      const { user } = setupWithAmounts([40, 60, 100], { totalPrizeFund: 300 });

      await clickSave(user);

      expectValidationError(MSG.totalDiv);
    });
  });

  /**************
   * 2. No rows *
   **************/

  describe("no rows", () => {
    it("shows the no-rows message when there are no rows and the total is 0", async () => {
      const { user } = setup({ rows: [], currentRows: [], totalPrizeFund: 0 });

      await clickSave(user);

      expectValidationError(MSG.noRows);
    });

    it("shows the total message instead when there are no rows but a total is set", async () => {
      // the sum of no rows (0) fails the total check first
      const { user } = setup({ rows: [], currentRows: [], totalPrizeFund: 200 });

      await clickSave(user);

      expectValidationError(MSG.totalDiv);
    });
  });

  /*******************
   * 3. Amount range *
   *******************/

  describe("amount range", () => {
    it.each([
      ["0", [100, 60, 0]],
      ["0.99", [100, 60, 0.99]],
      ["negative", [100, 60, -5]],
      ["above maxMoney", [maxMoney + 1]],
    ])("rejects an amount that is %s", async (_label, amounts) => {
      const { user } = setupWithAmounts(amounts);

      await clickSave(user);

      expectValidationError(MSG.range);
    });

    it("checks every row, including the first", async () => {
      const { user } = setupWithAmounts([0, 60, 40]);

      await clickSave(user);

      expectValidationError(MSG.range);
    });

    it.each([
      ["exactly 1", [1]],
      ["exactly maxMoney", [maxMoney]],
    ])("accepts an amount of %s", async (_label, amounts) => {
      const { user } = setupWithAmounts(amounts);

      await clickSave(user);

      expectSaveStarted();
    });
  });

  /*************************
   * 4. Descending amounts *
   *************************/

  describe("descending amounts", () => {
    it("rejects a lower position receiving more than the one above it", async () => {
      const { user } = setupWithAmounts([100, 101]);

      await clickSave(user);

      expectValidationError(MSG.sequence);
    });

    it("catches an increase further down the list", async () => {
      const { user } = setupWithAmounts([100, 60, 70]);

      await clickSave(user);

      expectValidationError(MSG.sequence);
    });

    it("accepts amounts in descending order", async () => {
      const { user } = setupWithAmounts([100, 60, 40]);

      await clickSave(user);

      expectSaveStarted();
    });

    it("accepts equal amounts for consecutive positions", async () => {
      const { user } = setupWithAmounts([100, 60, 60]);

      await clickSave(user);

      expectSaveStarted();
    });

    it("accepts a single row", async () => {
      const { user } = setupWithAmounts([200]);

      await clickSave(user);

      expectSaveStarted();
    });
  });

  /**************************
   * Changed batch records *
   **************************/

  describe("changed batch records", () => {
    it("validates the edited amounts instead of the original rows", async () => {
      const rows = makeRows(); // 100, 60, 40
      const { user } = setup({
        currentRows: rows,
        changedRecords: [
          { ...rows[1], amount: 40 },
          { ...rows[2], amount: 60 },
        ], // 100, 40, 60 - same total, wrong order
      });

      await clickSave(user);

      expectValidationError(MSG.sequence);
    });

    it("passes when the edits fix an invalid order", async () => {
      const rows = rowsWithAmounts([100, 120]);
      const { user } = setup({
        rows,
        currentRows: rows,
        changedRecords: [{ ...rows[1], amount: 80 }], // 100, 80
        totalPrizeFund: 180,
      });

      await clickSave(user);

      expectSaveStarted();
    });
  });

  /*************************
   * Error modal behavior *
   *************************/

  describe("after a validation error", () => {
    it("Save and Close shows the same errors and does not navigate", async () => {
      const { user, onNavigateAfterSave } = setup({ totalPrizeFund: 300 });

      await clickSaveAndClose(user);

      expectValidationError(MSG.totalDiv);
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
    });

    it("still commits the open cell before validating", async () => {
      const { user } = setup({ totalPrizeFund: 300 });

      await clickSave(user);

      expect(mockSaveCell).toHaveBeenCalledTimes(1);
    });

    it("closes the error modal when the user dismisses it", async () => {
      const { user } = setup({ totalPrizeFund: 300 });

      await clickSave(user);
      await closeErrorModal(user);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(getLatestErrorModalProps()?.show).toBe(false);
    });

    it("lets the user save after fixing the problem", async () => {
      const { user } = setupWithAmounts([100, 60, 70], {
        totalPrizeFund: 230,
      });

      await clickSave(user);
      expectValidationError(MSG.sequence);
      await closeErrorModal(user);

      setCurrentRows(rowsWithAmounts([100, 70, 60]));
      await clickSave(user);

      expectSaveStarted();
    });

    it("ignores a batchsave event that follows a failed validation", async () => {
      const { user, triggerActionComplete, onSave, setRows, onSaveComplete } =
        setup({ totalPrizeFund: 300 });

      await clickSave(user);
      await triggerActionComplete("batchsave");

      expect(onSave).not.toHaveBeenCalled();
      expect(onSaveComplete).not.toHaveBeenCalled();
      expect(setRows).not.toHaveBeenCalled();
    });
  });
});
