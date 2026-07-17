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
} from "./divPfPageTestSetup";
import { mockDivPfs, mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData"

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

describe("PrizeFundEntry ratio input", () => {
  beforeEach(() => {
    standardBeforeEach();
  });

  it("updates ratio text when the ratio input changes", async () => {
    const user = userEvent.setup();

    setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );

    await waitFor(() => {
      expect(ratioInput).toHaveValue(expectedRatio);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "4");

    expect(ratioInput).toHaveValue(4);
  });

  it("opens remove cashers confirmation when ratio blur would reduce cashers", async () => {
    const user = userEvent.setup();

    setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");
    const cashersInput = screen.getByLabelText("Cashers");
    const calcCashersInput = screen.getByLabelText("Calculated Cashers");

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );

    await waitFor(() => {
      expect(ratioInput).toHaveValue(expectedRatio);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "4");
    await user.tab();

    await waitFor(() => {
      expect(ratioInput).toHaveValue(4);
    });

    expect(cashersInput).toHaveValue(mockDivPfs.length);
    expect(calcCashersInput).toHaveValue(2);
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    expect(screen.getByTestId("grid-row-count")).toHaveTextContent(mockDivPfs.length.toString());
  });

  it("opens remove cashers confirmation when Enter would reduce cashers", async () => {
    const user = userEvent.setup();

    setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");
    const cashersInput = screen.getByLabelText("Cashers");
    const calcCashersInput = screen.getByLabelText("Calculated Cashers");

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );

    await waitFor(() => {
      expect(ratioInput).toHaveValue(expectedRatio);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "4");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(ratioInput).toHaveValue(4);
    });

    expect(cashersInput).toHaveValue(mockDivPfs.length);
    expect(calcCashersInput).toHaveValue(2);
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });

  it("ignores invalid ratio input characters", async () => {
    const user = userEvent.setup();

    setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );

    await waitFor(() => {
      expect(ratioInput).toHaveValue(expectedRatio);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "abc");

    expect(ratioInput).toHaveValue(null);
  });

  it("allows only one decimal point in the ratio input", async () => {
    const user = userEvent.setup();

    setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );

    await waitFor(() => {
      expect(ratioInput).toHaveValue(expectedRatio);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "2.5");

    expect(ratioInput).toHaveValue(2.5);

    await user.type(ratioInput, ".");

    expect(ratioInput).toHaveValue(2.5);
  });

  it("formats the ratio to two decimals on blur when value has not changed", async () => {
    const user = userEvent.setup();

    setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );
    
    await waitFor(() => {
      expect(ratioInput).toHaveValue(expectedRatio);
    });

    await user.tab();
    await user.tab();

    expect(ratioInput).toHaveValue(expectedRatio);
  });

  it("opens remove cashers confirmation when ratio is cleared and blurred", async () => {
    const user = userEvent.setup();

    setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");
    const cashersInput = screen.getByLabelText("Cashers");
    const calcCashersInput = screen.getByLabelText("Calculated Cashers");

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );

    await waitFor(() => {
      expect(ratioInput).toHaveValue(expectedRatio);
    });

    await user.clear(ratioInput);
    await user.tab();

    await waitFor(() => {
      expect(ratioInput).toHaveValue(0);
    });

    expect(cashersInput).toHaveValue(mockDivPfs.length);
    expect(calcCashersInput).toHaveValue(0);
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });

  it("arms the unsaved changes guard after ratio is changed", async () => {
    const user = userEvent.setup();

    setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );

    await waitFor(() => {
      expect(ratioInput).toHaveValue(expectedRatio);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "4");

    await waitFor(() => {
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });
  });
});