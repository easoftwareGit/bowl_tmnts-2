"use client";

import { waitFor } from "@testing-library/react";
import {
  mockPush,
  mockUseUnsavedChangesGuard,
  setup,
  standardBeforeEach,
} from "./potPfPage.testSetup.test";

describe("Pot Prize Fund web page after save", () => {
  beforeEach(standardBeforeEach);

  it("navigates to the Run Tournament page after save completes and navigation is requested", async () => {
    const {
      runTmntUrl,
      triggerNavigateAfterSave,
      triggerSaveComplete,
    } = setup();

    triggerSaveComplete();
    triggerNavigateAfterSave();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });
  });

  it("does not navigate after save until navigation is requested", () => {
    const { triggerSaveComplete } = setup();

    triggerSaveComplete();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("updates the page rows when save completes", () => {
    const {
      populatedRows,
      triggerSaveComplete,
    } = setup();

    const savedRows = populatedRows.map((row) => ({
      ...row,
      amount: row.amount + 10,
    }));

    triggerSaveComplete(savedRows);

    expect(mockUseUnsavedChangesGuard).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables the unsaved changes guard while navigating after save", async () => {
    const {
      triggerGridDataChanged,
      triggerSaveComplete,
      triggerNavigateAfterSave,
      runTmntUrl,
    } = setup();

    triggerGridDataChanged();

    expect(mockUseUnsavedChangesGuard)
      .toHaveBeenLastCalledWith(true);

    triggerSaveComplete();
    triggerNavigateAfterSave();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
    });

    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
  });
});