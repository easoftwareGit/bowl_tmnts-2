import { screen } from "@testing-library/react";
import {
  clickGridCancel,
  enterCashers,
  getInputs,
  mockPush,
  mockWindowConfirm,
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup";

const UNSAVED_MESSAGE = "You have unsaved changes. Leave this page?";

/*
 * Entry fees used by tests that edit Expenses, so the expected
 * Expenses value does not depend on the mock data.
 */
const ENTRY_FEES = 1000;

/**
 * Clicks the Back button rendered by the (mocked) prize-fund grid.
 * The page passes handleBack to the grid as onBack.
 *
 * Unlike triggerBack(), this is a real click, so any focused input
 * blurs (and applies its value) first.
 */
const clickBack = async (
  user: ReturnType<typeof setup>["user"],
): Promise<void> => {
  await user.click(screen.getByRole("button", { name: "Back" }));
};

/**
 * Types into Expenses without leaving the field. handleExpensesChange
 * marks the page data as changed on each accepted keystroke.
 */
const typeExpenses = async (
  user: ReturnType<typeof setup>["user"],
  value: string,
): Promise<void> => {
  const { expenses } = getInputs();
  await user.clear(expenses);
  await user.type(expenses, value);
};

describe("Eliminator Prize Fund web page Back button", () => {
  beforeEach(standardBeforeEach);

  describe("with no unsaved changes", () => {
    it("returns to the Run Tournament page without a confirm prompt", async () => {
      const { user, runTmntUrl } = setup();

      await clickBack(user);

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("does not prompt after the grid resets its changed flag", async () => {
      const {
        user,
        runTmntUrl,
        triggerGridDataChanged,
        triggerGridDataReset,
      } = setup();

      triggerGridDataChanged();
      triggerGridDataReset();

      await clickBack(user);

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("does not prompt when typed Expenses characters are rejected", async () => {
      const { user, runTmntUrl } = setup({ elimEntryFees: ENTRY_FEES });

      /*
       * handleExpensesChange returns before setDataWasChanged(true)
       * for text that fails the money pattern, so nothing is changed.
       * (No clear(): an empty string is accepted and would mark changed.)
       */
      await user.type(getInputs().expenses, "a");
      await clickBack(user);

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("does not prompt after the grid Cancel discards page edits", async () => {
      const { user, runTmntUrl } = setup({ elimEntryFees: ENTRY_FEES });

      await typeExpenses(user, "25");

      // handleGridCancel restores the saved state and clears dataWasChanged.
      await clickGridCancel(user);
      await clickBack(user);

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  describe("with unsaved page changes", () => {
    it("asks the user to confirm leaving after Expenses is edited", async () => {
      const { user } = setup({ elimEntryFees: ENTRY_FEES });

      await typeExpenses(user, "25");
      await clickBack(user);

      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockWindowConfirm).toHaveBeenCalledWith(UNSAVED_MESSAGE);
    });

    it("asks the user to confirm leaving after Cashers is edited", async () => {
      const { user, triggerBack } = setup();

      /*
       * Re-enter the current casher count: handleCashersChange marks the
       * page as changed, and applying the same count opens no modal.
       */
      const currentCashers = getInputs().cashers.value;
      await enterCashers(user, currentCashers);

      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(UNSAVED_MESSAGE);
    });

    it("returns to the Run Tournament page when the user confirms", async () => {
      const { user, runTmntUrl } = setup({
        elimEntryFees: ENTRY_FEES,
        confirmLeavePage: true,
      });

      await typeExpenses(user, "25");
      await clickBack(user);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("stays on the page and keeps the edits when the user cancels", async () => {
      const { user } = setup({
        elimEntryFees: ENTRY_FEES,
        confirmLeavePage: false,
      });

      await typeExpenses(user, "25");
      await clickBack(user);

      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockPush).not.toHaveBeenCalled();

      // Clicking Back blurred Expenses, which applied the entered value.
      expect(getInputs().expenses).toHaveValue("25.00");
      expect(getInputs().prizeFund).toHaveValue(String(ENTRY_FEES - 25));
    });

    it("prompts again on the next Back click after a cancel", async () => {
      const { user, runTmntUrl } = setup({
        elimEntryFees: ENTRY_FEES,
        confirmLeavePage: false,
      });

      await typeExpenses(user, "25");
      await clickBack(user);
      expect(mockPush).not.toHaveBeenCalled();

      mockWindowConfirm.mockReturnValue(true);
      await clickBack(user);

      expect(mockWindowConfirm).toHaveBeenCalledTimes(2);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  describe("with unsaved grid changes", () => {
    it("asks the user to confirm leaving", async () => {
      const { user, triggerGridDataChanged } = setup();

      triggerGridDataChanged();
      await clickBack(user);

      expect(mockWindowConfirm).toHaveBeenCalledWith(UNSAVED_MESSAGE);
    });

    it("stays on the page when the user cancels", async () => {
      const { user, triggerGridDataChanged } = setup({
        confirmLeavePage: false,
      });

      triggerGridDataChanged();
      await clickBack(user);

      expect(mockPush).not.toHaveBeenCalled();
      expect(
        screen.getByTestId("mock-grid-data-was-changed"),
      ).toHaveTextContent("true");
    });
  });

  describe("with unsaved page and grid changes", () => {
    it("prompts only once and returns when the user confirms", async () => {
      const { user, runTmntUrl, triggerGridDataChanged } = setup({
        elimEntryFees: ENTRY_FEES,
      });

      await typeExpenses(user, "25");
      triggerGridDataChanged();
      await clickBack(user);

      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });
});
