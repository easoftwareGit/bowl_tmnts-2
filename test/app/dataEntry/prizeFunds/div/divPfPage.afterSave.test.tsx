import { act, screen, waitFor } from "@testing-library/react";
import {
  confirmRemoveCashers,
  enterCashers,
  getCashersInput,
  getLatestGridProps,
  getLatestRows,
  getRatioInput,
  mockPush,
  mockUseUnsavedChangesGuard,
  mockWindowConfirm,
  setup,
  standardBeforeEach,
  triggerBack,
  triggerGridCancel,
  triggerGridDataChanged,
  triggerNavigateAfterSave,
  triggerSaveComplete,
} from "./divPfPage.testSetup";

describe("Division Prize Fund web page after save", () => {
  beforeEach(standardBeforeEach);

  describe("navigation", () => {
    it("navigates to the Run Tournament page when save completes and navigation is requested", async () => {
      const { runTmntUrl } = setup();

      triggerSaveComplete();
      triggerNavigateAfterSave();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("does not navigate when save completes without a navigation request", () => {
      setup();

      triggerSaveComplete();

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("navigates once when the grid reports save complete and then navigate in the same tick (Save and Close)", async () => {
      const { user, populatedRows, runTmntUrl } = setup();

      // Unsaved page-input and grid changes before Save and Close.
      await enterCashers(user, String(populatedRows.length), "none");
      triggerGridDataChanged();
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      // Mirrors PrizeFundGrid.handleActionComplete after onSave resolves:
      // onSaveComplete(savedRows) then onNavigateAfterSave(), same tick.
      act(() => {
        const props = getLatestGridProps()!;
        props.onSaveComplete(props.rows.map((row) => ({ ...row })));
        props.onNavigateAfterSave();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    // Defensive: the real grid never requests navigation before save
    // completes, but the page's effect must not navigate with pending changes.
    it("waits for save to complete when navigation is requested while page inputs have unsaved changes", async () => {
      const { user, populatedRows, runTmntUrl } = setup();

      // Typing (without committing) marks the page inputs as changed.
      await enterCashers(user, String(populatedRows.length), "none");

      triggerNavigateAfterSave();

      expect(mockPush).not.toHaveBeenCalled();

      triggerSaveComplete();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
      });
      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });

  describe("unsaved changes guard", () => {
    it("is disabled as soon as navigation after save is requested", async () => {
      const { user, populatedRows } = setup();

      await enterCashers(user, String(populatedRows.length), "none");
      triggerGridDataChanged();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);

      // Save not yet complete: changes still pending, but guard must be off.
      triggerNavigateAfterSave();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("is cleared when save completes", async () => {
      const { user, populatedRows } = setup();

      await enterCashers(user, String(populatedRows.length), "none");
      triggerGridDataChanged();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
      expect(screen.getByTestId("mock-grid-data-was-changed")).toHaveTextContent(
        "true",
      );

      triggerSaveComplete();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
      expect(screen.getByTestId("mock-grid-data-was-changed")).toHaveTextContent(
        "false",
      );
    });
  });

  describe("saved state", () => {
    it("passes the saved rows to the grid", () => {
      const { populatedRows } = setup();

      const savedRows = populatedRows.map((row) => ({
        ...row,
        amount: row.amount + 10,
      }));

      triggerSaveComplete(savedRows);

      expect(getLatestRows()).toEqual(savedRows);
      expect(screen.getByTestId("mock-grid-row-count")).toHaveTextContent(
        String(savedRows.length),
      );
    });

    it("Back does not ask for confirmation after changes are saved", async () => {
      const { user, populatedRows, runTmntUrl } = setup();

      await enterCashers(user, String(populatedRows.length), "none");
      triggerGridDataChanged();
      triggerSaveComplete();

      triggerBack();

      expect(mockWindowConfirm).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    it("Cancel restores the last saved rows, cashers and ratio, not the initially loaded ones", async () => {
      const { user, populatedRows, tmntData } = setup();

      const originalCount = populatedRows.length;
      const savedCount = originalCount + 1;
      const numPlayers = tmntData.players.length;

      // Precondition: mock data must allow one more casher.
      expect(numPlayers).toBeGreaterThanOrEqual(savedCount);

      // Add a casher, then save that state.
      await enterCashers(user, String(savedCount));
      expect(getLatestRows()).toHaveLength(savedCount);

      triggerSaveComplete();
      const savedIds = getLatestRows().map((row) => row.id);

      // Change again after the save: remove the added casher.
      await enterCashers(user, String(originalCount));
      await confirmRemoveCashers(user);
      expect(getLatestRows()).toHaveLength(originalCount);

      triggerGridCancel();

      expect(getLatestRows().map((row) => row.id)).toEqual(savedIds);
      expect(getCashersInput()).toHaveValue(savedCount);
      expect(getRatioInput()).toHaveValue(
        Number((numPlayers / savedCount).toFixed(2)),
      );
    });
  });
});
