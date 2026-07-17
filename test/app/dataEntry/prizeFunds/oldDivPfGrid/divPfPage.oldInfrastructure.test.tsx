"use client";

import React from "react";
import { screen } from "@testing-library/react";
import type { divPfEntryRow } from "@/lib/types/types";
import {
  setup,
  standardBeforeEach,
  mockGridCallbacks,  
} from "./divPfPageTestSetup";

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

describe("PrizeFundEntry infrastructure", () => {
  beforeEach(() => {
    standardBeforeEach();
  });

  it("renders the infrastructure smoke test", () => {
    setup();

    expect(
      screen.getByRole("heading", {
        name: /Prize Fund/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("div-prize-fund-grid")).toBeInTheDocument();
  });

  it("provides access to child grid callbacks for later interaction tests", () => {
    setup();

    expect(mockGridCallbacks.onGridDataChanged).toEqual(expect.any(Function));
    expect(mockGridCallbacks.onGridDataReset).toEqual(expect.any(Function));
    expect(mockGridCallbacks.onNavigateAfterSave).toEqual(expect.any(Function));
    expect(mockGridCallbacks.onBack).toEqual(expect.any(Function));
    expect(mockGridCallbacks.onSaveComplete).toEqual(expect.any(Function));
  });
});