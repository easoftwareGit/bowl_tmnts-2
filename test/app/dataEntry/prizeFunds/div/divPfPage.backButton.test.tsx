"use client";

import { screen } from "@testing-library/react";
import {
  mockPush,
  mockWindowConfirm,
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup.test";

describe("Division Prize Fund web page back button", () => {
  beforeEach(standardBeforeEach);

  it("navigates back immediately when there are no unsaved changes", () => {
    const { triggerBack, runTmntUrl } = setup();

    triggerBack();

    expect(mockWindowConfirm).not.toHaveBeenCalled();

    expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
  });

  it("shows a browser confirmation when there are unsaved page changes", async () => {
    const { user, triggerBack, runTmntUrl } = setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await user.clear(cashersInput);
    await user.type(cashersInput, "3");
    await user.tab();

    triggerBack();

    expect(mockWindowConfirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );

    expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
  });

  it("shows a browser confirmation when there are unsaved grid changes", () => {
    const { triggerBack, triggerGridDataChanged, runTmntUrl } = setup();

    triggerGridDataChanged();

    triggerBack();

    expect(mockWindowConfirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );

    expect(mockPush).toHaveBeenCalledWith(runTmntUrl);
  });

  it("does not navigate when the browser confirmation is cancelled", async () => {
    const { user, triggerBack } = setup({
      confirmLeavePage: false,
    });

    const cashersInput = screen.getByLabelText("Cashers");

    await user.clear(cashersInput);
    await user.type(cashersInput, "3");
    await user.tab();

    triggerBack();

    expect(mockWindowConfirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not navigate when grid changes exist and the browser confirmation is cancelled", () => {
    const { triggerBack, triggerGridDataChanged } = setup({
      confirmLeavePage: false,
    });

    triggerGridDataChanged();

    triggerBack();

    expect(mockWindowConfirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});
