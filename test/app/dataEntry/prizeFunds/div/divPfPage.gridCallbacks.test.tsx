"use client";

import { screen, waitFor } from "@testing-library/react";
import {
  getLatestGridProps,
  mockPush,
  mockUseUnsavedChangesGuard,
  setup,
  standardBeforeEach,
  triggerGridDataChanged,
  triggerGridDataReset,
  triggerNavigateAfterSave,
  triggerSaveComplete,
} from "./divPfPage.testSetup.test";

describe("Division Prize Fund web page grid callbacks", () => {
  beforeEach(standardBeforeEach);

  it("sets gridDataWasChanged to true when onGridDataChanged is called", () => {
    setup();

    expect(
      getLatestGridProps()?.gridDataWasChanged,
    ).toBe(false);

    triggerGridDataChanged();

    expect(
      getLatestGridProps()?.gridDataWasChanged,
    ).toBe(true);
  });

  it("sets gridDataWasChanged to false when onGridDataReset is called", () => {
    setup();

    triggerGridDataChanged();

    expect(
      getLatestGridProps()?.gridDataWasChanged,
    ).toBe(true);

    triggerGridDataReset();

    expect(
      getLatestGridProps()?.gridDataWasChanged,
    ).toBe(false);
  });

  it("updates the rows and clears page data changes when onSaveComplete is called", async () => {
    const {
      user,
      populatedRows,
    } = setup();

    const ratioInput = screen.getByLabelText(
      "Cash Ratio. 1 in",
    );

    await user.clear(ratioInput);
    await user.type(ratioInput, "4");

    expect(
      mockUseUnsavedChangesGuard,
    ).toHaveBeenLastCalledWith(true);

    triggerSaveComplete(populatedRows);

    expect(
      getLatestGridProps()?.rows,
    ).toEqual(populatedRows);

    await waitFor(() => {
      expect(
        mockUseUnsavedChangesGuard,
      ).toHaveBeenLastCalledWith(false);
    });
  });

  it("navigates to the Run Tournament page after save", async () => {
    const { runTmntUrl } = setup();

    triggerSaveComplete();

    triggerNavigateAfterSave();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        runTmntUrl,
      );
    });
  });
});