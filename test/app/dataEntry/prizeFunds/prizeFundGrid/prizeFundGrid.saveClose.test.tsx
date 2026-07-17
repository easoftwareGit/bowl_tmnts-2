import { waitFor } from "@testing-library/react";
import type { prizeFundEntryRow } from "@/lib/types/types";
import {
  clickSaveAndClose,
  mockBatchSave,
  savedRowsCopy,
  setup,
  makeRows,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

describe("PrizeFundGrid Save and Close", () => {
  beforeEach(standardBeforeEach);

  it("calls onNavigateAfterSave after a successful save", async () => {
    const {
      user,
      onNavigateAfterSave,
      triggerActionComplete,
    } = setup();

    await clickSaveAndClose(user);

    await waitFor(() => {
      expect(mockBatchSave).toHaveBeenCalledTimes(1);
    });

    await triggerActionComplete("batchsave");

    expect(onNavigateAfterSave).toHaveBeenCalledTimes(1);
  });

  it("does not call setRows after Save and Close", async () => {
    const {
      user,
      setRows,
      triggerActionComplete,
    } = setup();

    await clickSaveAndClose(user);

    await waitFor(() => {
      expect(mockBatchSave).toHaveBeenCalledTimes(1);
    });

    await triggerActionComplete("batchsave");

    expect(setRows).not.toHaveBeenCalled();
  });

  it("calls onSaveComplete with the current grid rows after Save and Close", async () => {
    const rows = savedRowsCopy(makeRows());

    const currentRows = savedRowsCopy(rows);

    // Simulate an unsaved edit in the Syncfusion grid.
    currentRows[0].amount = 125;
    currentRows[0].percentage = 125 / 225; // 225 = 125 + 60 + 40

    const {
      user,
      onSaveComplete,
      triggerActionComplete,
    } = setup({
      rows,
      currentRows,
      totalPrizeFund: 225, // 225 = 125 + 60 + 40
    });

    await clickSaveAndClose(user);

    await waitFor(() => {
      expect(mockBatchSave).toHaveBeenCalledTimes(1);
    });

    await triggerActionComplete("batchsave");

    expect(onSaveComplete).toHaveBeenCalled();

    const savedRows =
      onSaveComplete.mock.calls.at(-1)?.[0] as prizeFundEntryRow[];

    expect(savedRows).toEqual(currentRows);

    expect(savedRows).not.toBe(currentRows);

    savedRows.forEach((row, index) => {
      expect(row).not.toBe(currentRows[index]);
    });
  });

  // it("calls onSaveComplete twice with copies of the saved rows", async () => {
  //   const {
  //     user,
  //     rows,
  //     onSaveComplete,
  //     triggerActionComplete,
  //   } = setup();

  //   const expectedRows = savedRowsCopy(rows);

  //   await clickSaveAndClose(user);

  //   await waitFor(() => {
  //     expect(mockBatchSave).toHaveBeenCalledTimes(1);
  //   });

  //   await triggerActionComplete("batchsave");

  //   expect(onSaveComplete).toHaveBeenCalledTimes(2);

  //   expect(onSaveComplete).toHaveBeenNthCalledWith(
  //     1,
  //     expectedRows,
  //   );

  //   expect(onSaveComplete).toHaveBeenNthCalledWith(
  //     2,
  //     expectedRows,
  //   );

  //   const firstSavedRows =
  //     onSaveComplete.mock.calls[0][0] as prizeFundEntryRow[];

  //   const secondSavedRows =
  //     onSaveComplete.mock.calls[1][0] as prizeFundEntryRow[];

  //   expect(firstSavedRows).not.toBe(rows);
  //   expect(secondSavedRows).not.toBe(rows);

  //   firstSavedRows.forEach((row, index) => {
  //     expect(row).not.toBe(rows[index]);
  //   });

  //   secondSavedRows.forEach((row, index) => {
  //     expect(row).not.toBe(rows[index]);
  //   });
  // });

  it("saves the current Syncfusion rows instead of the original rows prop", async () => {
    const rows = savedRowsCopy(makeRows());

    const currentRows = savedRowsCopy(rows);

    currentRows[1].amount = 80;
    currentRows[1].percentage = 0.4;

    const {
      user,
      onSave,
      triggerActionComplete,
    } = setup({
      rows,
      currentRows,
      totalPrizeFund: 220,
    });

    await clickSaveAndClose(user);

    await waitFor(() => {
      expect(mockBatchSave).toHaveBeenCalledTimes(1);
    });

    await triggerActionComplete("batchsave");

    expect(onSave).toHaveBeenCalledTimes(1);

    expect(onSave).toHaveBeenCalledWith(currentRows);
  });

});