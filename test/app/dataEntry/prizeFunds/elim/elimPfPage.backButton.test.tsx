"use client";

import { screen, waitFor } from "@testing-library/react";
import {
  mockPush,
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup.test";

describe("Eliminator Prize Fund web page after save", () => {
  beforeEach(standardBeforeEach);

  it("navigates once after Save & Close is requested when there are no unsaved page changes", () => {
    const {
      triggerNavigateAfterSave,
      runTmntUrl,
    } = setup();

    triggerNavigateAfterSave();

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
  });

  it("navigates after Save Complete clears the unsaved state", async () => {
    const {
      user,
      triggerNavigateAfterSave,
      triggerSaveComplete,
      runTmntUrl,
    } = setup();

    const expensesInput =
      screen.getByLabelText("Expenses");

    await user.clear(expensesInput);
    await user.type(expensesInput, "25");

    triggerNavigateAfterSave();

    expect(mockPush).not.toHaveBeenCalled();

    triggerSaveComplete();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
  });  
  
  it("navigates after Save Complete clears the unsaved state", async () => {
    const {
      user,
      triggerNavigateAfterSave,
      triggerSaveComplete,
      runTmntUrl,
    } = setup();

    const expensesInput = screen.getByLabelText("Expenses");

    await user.clear(expensesInput);
    await user.type(expensesInput, "25");

    triggerNavigateAfterSave();

    expect(mockPush).not.toHaveBeenCalled();

    triggerSaveComplete();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
  });  

  it("does not navigate when Save Complete occurs before Save & Close", () => {
    const {
      triggerNavigateAfterSave,
      triggerSaveComplete,
    } = setup();

    triggerSaveComplete();

    expect(mockPush).not.toHaveBeenCalled();

    triggerNavigateAfterSave();

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("navigates only once after Save & Close", async () => {
    const {
      triggerNavigateAfterSave,
      triggerSaveComplete,
      runTmntUrl,
    } = setup();

    triggerNavigateAfterSave();
    triggerSaveComplete();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
  });

});