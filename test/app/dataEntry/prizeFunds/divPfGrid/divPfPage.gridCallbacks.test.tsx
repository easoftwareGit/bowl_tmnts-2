"use client";

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { divPfEntryRow } from "@/lib/types/types";
import {
  setup,
  standardBeforeEach,
  mockGridCallbacks,
  mockUseUnsavedChangesGuard,
  push,  
} from "./divPfPageTestSetup";
import { mockDivPfs, tmntId } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData"

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

describe("PrizeFundEntry grid callbacks", () => {
  beforeEach(() => {
    standardBeforeEach();
  });

  it("sets gridDataWasChanged to true when onGridDataChanged is called", async () => {
    const user = userEvent.setup();

    setup();

    expect(screen.getByTestId("grid-data-was-changed")).toHaveTextContent(
      "false",
    );

    await user.click(
      screen.getByRole("button", { name: "Fire Grid Data Changed" }),
    );

    expect(screen.getByTestId("grid-data-was-changed")).toHaveTextContent(
      "true",
    );
  });

  it("sets gridDataWasChanged to false when onGridDataReset is called", async () => {
    const user = userEvent.setup();

    setup();

    await user.click(
      screen.getByRole("button", { name: "Fire Grid Data Changed" }),
    );

    expect(screen.getByTestId("grid-data-was-changed")).toHaveTextContent(
      "true",
    );

    await user.click(
      screen.getByRole("button", { name: "Fire Grid Data Reset" }),
    );

    expect(screen.getByTestId("grid-data-was-changed")).toHaveTextContent(
      "false",
    );
  });

  it("updates rows and clears dataWasChanged when onSaveComplete is called", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await user.clear(cashersInput);
    await user.type(cashersInput, "3");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByTestId("grid-row-count")).toHaveTextContent(mockDivPfs.length.toString());
    });

    await user.click(
      screen.getByRole("button", { name: "Fire Save Complete" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("grid-row-count")).toHaveTextContent(mockDivPfs.length.toString());
    });

    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
  });

  it("navigates after save when onNavigateAfterSave is called after save complete", async () => {
    const user = userEvent.setup();

    setup();

    await user.click(
      screen.getByRole("button", { name: "Fire Save Complete" }),
    );

    await user.click(
      screen.getByRole("button", { name: "Fire Navigate After Save" }),
    );

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        `/dataEntry/runTmnt/${tmntId}`,
      );
    });
  });
});