import { screen } from "@testing-library/react";
import {
  enterCashers,
  enterRatio,
  mockPush,
  mockUseUnsavedChangesGuard,
  mockWindowConfirm,
  setup,
  standardBeforeEach,
  triggerBack,
  triggerGridCancel,
  triggerGridDataChanged,
  triggerGridDataReset,
} from "./divPfPage.testSetup";

/*
 * handleBack():
 *   - no unsaved changes        -> router.push(runTmntUrl), no confirm
 *   - page or grid changes      -> window.confirm(leaveMsg)
 *       - confirmed             -> router.push(runTmntUrl)
 *       - declined              -> stay, changes kept
 *
 * "Page changes" = dataWasChanged (typing in Ratio/Cashers, adding or
 * removing cashers). "Grid changes" = gridDataWasChanged (cell edits
 * reported by the grid).
 *
 * Back after a save is covered in afterSave.test.
 *
 * Page changes are made by typing the current casher count without
 * committing it: onChange marks the page dirty, but nothing is resized,
 * so the tests do not depend on the mock data's row or player counts.
 */

const leaveMsg = "You have unsaved changes. Leave this page?";

describe("Division Prize Fund web page back button", () => {
  beforeEach(standardBeforeEach);

  /**********************
   * No unsaved changes *
   **********************/

  describe("with no unsaved changes", () => {
    it("navigates back immediately without asking", () => {
      const { runTmntUrl } = setup();

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
  });

  /*******************
   * Unsaved changes *
   *******************/

  describe("with unsaved changes, confirmed", () => {
    it("asks before leaving when the Cashers input was changed", async () => {
      const { user, populatedRows, runTmntUrl } = setup();

      await enterCashers(user, String(populatedRows.length), "none");
      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockWindowConfirm).toHaveBeenCalledWith(leaveMsg);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("asks before leaving when the Ratio input was changed", async () => {
      const { user, runTmntUrl } = setup();

      await enterRatio(user, "", "none");
      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leaveMsg);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("asks before leaving when the grid reports changes", () => {
      const { runTmntUrl } = setup();

      triggerGridDataChanged();
      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leaveMsg);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("asks only once when both the page and the grid have changes", async () => {
      const { user, populatedRows } = setup();

      await enterCashers(user, String(populatedRows.length), "none");
      triggerGridDataChanged();
      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("asks when the grid's Back button is clicked while an input has focus", async () => {
      const { user, populatedRows, runTmntUrl } = setup();

      // Focus stays in Cashers; clicking Back blurs it first.
      await enterCashers(user, String(populatedRows.length), "none");
      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(mockWindowConfirm).toHaveBeenCalledWith(leaveMsg);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  describe("with unsaved changes, declined", () => {
    it("stays on the page when page changes exist", async () => {
      const { user, populatedRows } = setup({ confirmLeavePage: false });

      await enterCashers(user, String(populatedRows.length), "none");
      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leaveMsg);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("stays on the page when grid changes exist", () => {
      setup({ confirmLeavePage: false });

      triggerGridDataChanged();
      triggerBack();

      expect(mockWindowConfirm).toHaveBeenCalledWith(leaveMsg);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("keeps the unsaved changes after declining", () => {
      setup({ confirmLeavePage: false });

      triggerGridDataChanged();
      triggerBack();

      expect(screen.getByTestId("mock-grid-data-was-changed")).toHaveTextContent(
        "true",
      );
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("asks again and navigates when Back is pressed again and confirmed", () => {
      const { runTmntUrl } = setup();
      mockWindowConfirm.mockReturnValueOnce(false).mockReturnValueOnce(true);

      triggerGridDataChanged();

      triggerBack();
      expect(mockPush).not.toHaveBeenCalled();

      triggerBack();
      expect(mockWindowConfirm).toHaveBeenCalledTimes(2);
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  /****************************
   * Changes cleared by Cancel *
   ****************************/

  describe("after Cancel clears the changes", () => {
    it("does not ask after page changes are cancelled", async () => {
      const { user, populatedRows, runTmntUrl } = setup();

      await enterCashers(user, String(populatedRows.length), "none");
      triggerGridCancel();
      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("does not ask after grid changes are cancelled", () => {
      const { runTmntUrl } = setup();

      triggerGridDataChanged();

      // Real grid order on confirmed Cancel: onGridDataReset, then onCancel.
      triggerGridDataReset();
      triggerGridCancel();
      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });
});
