"use client";

import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { divPfEntryRow } from "@/lib/types/types";
import {
  setup,
  standardBeforeEach,
  mockGridCallbacks,  
  push,
} from "./divPfPageTestSetup";
import { tmntId } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
  fetchDivPfs: jest.fn(),
  getDivPfsError: jest.fn(),
  getDivPfsLoadStatus: jest.fn(),
}));

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  fetchTmntFullData: jest.fn(),
  getTmntFullDataError: jest.fn(),
  getTmntFullDataLoadStatus: jest.fn(),
}));

jest.mock("@/hooks/useUnsavedChangesGuard", () => ({
  useUnsavedChangesGuard: jest.fn(),
}));

jest.mock("@/lib/uuid", () => ({
  btDbUuid: jest.fn(),
}));

jest.mock("@/app/dataEntry/prizeFunds/divPfGrid/divPfRows", () => ({
  populateDivPfRows: jest.fn(),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? <div data-testid="wait-modal">{message}</div> : null,
}));

jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  default: ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    show ? (
      <div data-testid="confirm-modal">
        <div>{title}</div>
        <div>{message}</div>
        <button type="button" onClick={onConfirm}>
          Yes
        </button>
        <button type="button" onClick={onCancel}>
          No
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/currency/eaCurrencyInput", () => ({
  __esModule: true,
  default: ({
    id,
    name,
    value,
    disabled,
  }: {
    id: string;
    name: string;
    value: number;
    disabled?: boolean;
  }) => (
    <input
      data-testid="currency-input"
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      readOnly
    />
  ),
}));

/**
 * STANDARD DivPrizeFundGrid mock.
 *
 * This mock captures all callbacks passed from the page and exposes buttons
 * that allow page tests to invoke those callbacks. Individual test files can
 * ignore the buttons they do not need.
 *
 * If a specific test file needs additional behavior, copy this mock and
 * document the changes above the modified section.
 */
jest.mock("@/app/dataEntry/prizeFunds/divPfGrid/divPfGrid", () => ({
  __esModule: true,
  default: ({
    rows,
    totalPrizeFund,
    gridDataWasChanged,
    onGridDataChanged,
    onGridDataReset,
    onNavigateAfterSave,
    onBack,
    onSaveComplete,
  }: {
    rows: divPfEntryRow[];
    totalPrizeFund: number;
    gridDataWasChanged: boolean;
    onGridDataChanged: () => void;
    onGridDataReset: () => void;
    onNavigateAfterSave: () => void;
    onBack: () => void;
    onSaveComplete: (savedRows: divPfEntryRow[]) => void;
  }) => {
    // Capture callbacks for infrastructure tests.
    mockGridCallbacks.onGridDataChanged = onGridDataChanged;
    mockGridCallbacks.onGridDataReset = onGridDataReset;
    mockGridCallbacks.onNavigateAfterSave = onNavigateAfterSave;
    mockGridCallbacks.onBack = onBack;
    mockGridCallbacks.onSaveComplete = onSaveComplete;

    return (
      <div data-testid="div-prize-fund-grid">
        <div data-testid="grid-row-count">{rows.length}</div>

        <div data-testid="grid-total-prize-fund">
          {totalPrizeFund}
        </div>

        <div data-testid="grid-data-was-changed">
          {String(gridDataWasChanged)}
        </div>

        <button
          type="button"
          onClick={onGridDataChanged}
        >
          Fire Grid Data Changed
        </button>

        <button
          type="button"
          onClick={onGridDataReset}
        >
          Fire Grid Data Reset
        </button>

        <button
          type="button"
          onClick={() => onSaveComplete(rows)}
        >
          Fire Save Complete
        </button>

        <button
          type="button"
          onClick={onNavigateAfterSave}
        >
          Fire Navigate After Save
        </button>

        <button
          type="button"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    );
  },
}));

let confirmSpy: jest.SpyInstance;

describe("PrizeFundEntry back button", () => {
  beforeEach(() => {
    standardBeforeEach();

    jest.spyOn(window, "confirm").mockReturnValue(true);

    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("navigates back immediately when there are no unsaved changes", async () => {
    const user = userEvent.setup();

    setup();

    await user.click(
      screen.getByRole("button", { name: "Back" }),
    );

    expect(push).toHaveBeenCalledWith(
      `/dataEntry/runTmnt/${tmntId}`,
    );

    expect(
      screen.queryByTestId("confirm-modal"),
    ).not.toBeInTheDocument();
  });

  it("shows browser confirmation when there are unsaved changes", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await user.clear(cashersInput);
    await user.type(cashersInput, "3");
    await user.tab();

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(window.confirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );

    expect(push).toHaveBeenCalledWith(
      `/dataEntry/runTmnt/${tmntId}`,
    );
  });

  it("does not navigate when browser confirmation is cancelled", async () => {
    const user = userEvent.setup();

    confirmSpy.mockReturnValue(false);

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await user.clear(cashersInput);
    await user.type(cashersInput, "3");
    await user.tab();

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(confirmSpy).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );

    expect(push).not.toHaveBeenCalled();
  });

});