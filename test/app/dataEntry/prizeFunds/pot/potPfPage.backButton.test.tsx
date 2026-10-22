import { screen } from "@testing-library/react";
import {
  getCashersInput,
  getExpensesInput,
  getLatestRows,
  mockPush,
  mockWindowConfirm,
  setup,
  standardBeforeEach,
  triggerGridCancel,
} from "./potPfPage.testSetup.test";

const leavePageMessage = "You have unsaved changes. Leave this page?";

describe("Pot Prize Fund web page back button", () => {
  beforeEach(standardBeforeEach);

  /**********************
   * No unsaved changes *
   **********************/

  describe("no unsaved changes", () => {
    it("navigates back immediately when there are no unsaved changes", () => {
      const { triggerBack, runTmntUrl } = setup();

      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("navigates back when the grid's Back button is clicked", async () => {
      const { user, runTmntUrl } = setup();

      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("does not ask after changes are saved", () => {
      const {
        triggerBack,
        triggerGridDataChanged,
        triggerSaveComplete,
        runTmntUrl,
      } = setup();

      triggerGridDataChanged();
      triggerSaveComplete();

      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("does not ask after page input changes are cancelled", async () => {
      const { user, triggerBack, runTmntUrl } = setup();

      await user.type(getExpensesInput(), "1");
      triggerGridCancel();

      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("does not ask after grid changes are reset", () => {
      const {
        triggerBack,
        triggerGridDataChanged,
        triggerGridDataReset,
        runTmntUrl,
      } = setup();

      triggerGridDataChanged();
      triggerGridDataReset();

      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  /*******************
   * Unsaved changes *
   *******************/

  describe("unsaved changes, user confirms leaving", () => {
    it("asks before leaving when expenses were changed", async () => {
      const { user, triggerBack, runTmntUrl } = setup();

      await user.type(getExpensesInput(), "1");

      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leavePageMessage);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("asks before leaving when cashers were added", async () => {
      const { user, expected, triggerBack, runTmntUrl } = setup();

      const newCashers = expected.numCashers + 1;
      expect(expected.numPlayers).toBeGreaterThanOrEqual(newCashers);

      await user.clear(getCashersInput());
      await user.type(getCashersInput(), String(newCashers));
      await user.keyboard("{Enter}");
      expect(getLatestRows()).toHaveLength(newCashers);

      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leavePageMessage);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("asks before leaving when there are unsaved grid changes", () => {
      const {
        triggerBack,
        triggerGridDataChanged,
        runTmntUrl,
      } = setup();

      triggerGridDataChanged();

      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leavePageMessage);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("asks when the grid's Back button is clicked while typing in Expenses", async () => {
      const { user, runTmntUrl } = setup();

      await user.type(getExpensesInput(), "1");
      // the click blurs Expenses (applying the value), then calls onBack
      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockWindowConfirm).toHaveBeenCalledWith(leavePageMessage);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  describe("unsaved changes, user stays on the page", () => {
    it("does not navigate when page changes exist and the confirmation is cancelled", async () => {
      const { user, triggerBack } = setup({
        confirmLeavePage: false,
      });

      await user.type(getExpensesInput(), "1");

      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leavePageMessage);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does not navigate when grid changes exist and the confirmation is cancelled", () => {
      const {
        triggerBack,
        triggerGridDataChanged,
      } = setup({
        confirmLeavePage: false,
      });

      triggerGridDataChanged();

      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leavePageMessage);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("keeps the unsaved changes when the user stays on the page", async () => {
      const { user, triggerBack } = setup({
        confirmLeavePage: false,
      });

      await user.clear(getExpensesInput());
      await user.type(getExpensesInput(), "5");

      triggerBack();

      expect(getExpensesInput()).toHaveValue("5");
      expect(screen.getByTestId("mock-grid-data-was-changed"))
        .toHaveTextContent("true");
    });

    it("asks again on the next Back click", async () => {
      const { user, triggerBack } = setup({
        confirmLeavePage: false,
      });

      await user.type(getExpensesInput(), "1");

      triggerBack();
      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledTimes(2);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
