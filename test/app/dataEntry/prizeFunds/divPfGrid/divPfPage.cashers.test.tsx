"use client";

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { divPfEntryRow } from "@/lib/types/types";
import {
  setup,
  standardBeforeEach,
  mockGridCallbacks, 
  mockBtDbUuid,
  mockUseUnsavedChangesGuard,
} from "./divPfPageTestSetup";
import { mockDivPfs, mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

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

describe("PrizeFundEntry cashers input", () => {
  beforeEach(() => {
    standardBeforeEach();
  });

  it("updates cashers text when the cashers input changes", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "3");

    expect(cashersInput).toHaveValue(3);
  });

  it("adds cashers on blur when cashers value increases", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");
    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");
    const calcCashersInput = screen.getByLabelText("Calculated Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "8");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByTestId("grid-row-count")).toHaveTextContent("8");
    });

    const expectedRatio = Number(
      (mockTmntFullData.players.length / 8).toFixed(2)
    );    
    expect(cashersInput).toHaveValue(8);
    expect(ratioInput).toHaveValue(expectedRatio);
    expect(calcCashersInput).toHaveValue(8);
    expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");
  });

  it("adds cashers when Enter is pressed and cashers value increases", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "8");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByTestId("grid-row-count")).toHaveTextContent("8");
    });

    expect(cashersInput).toHaveValue(8);
    expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
  });

  it("opens confirmation dialog when cashers value decreases on blur", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "4");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    });

    expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
    expect(
      screen.getByText(
        `Do you want to remove ${mockDivPfs.length - 4} cashers? Going from ${mockDivPfs.length} cashers to 4 cashers.`,
      ),
    ).toBeInTheDocument();

    expect(cashersInput).toHaveValue(4);
    expect(screen.getByTestId("grid-row-count")).toHaveTextContent((mockDivPfs.length).toString());
  });

  it("opens confirmation dialog when Enter decreases cashers", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "1");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    });

    expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
    expect(screen.getByTestId("grid-row-count")).toHaveTextContent(mockDivPfs.length.toString());
  });

  it("removes cashers when confirmation Yes is clicked", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "1");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Yes" }));

    await waitFor(() => {
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });

    expect(cashersInput).toHaveValue(1);
    expect(screen.getByTestId("grid-row-count")).toHaveTextContent("1");
  });

  it("does not remove cashers when confirmation No is clicked", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "1");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "No" }));

    await waitFor(() => {
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });

    expect(cashersInput).toHaveValue(1);
    expect(screen.getByTestId("grid-row-count")).toHaveTextContent(mockDivPfs.length.toString());
  });

  it("ignores invalid non-digit cashers input", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "abc");

    expect(cashersInput).toHaveValue(0);
  });

  it("arms the unsaved changes guard after cashers is changed", async () => {
    const user = userEvent.setup();

    setup();

    const cashersInput = screen.getByLabelText("Cashers");

    await waitFor(() => {
      expect(cashersInput).toHaveValue(mockDivPfs.length);
    });

    await user.clear(cashersInput);
    await user.type(cashersInput, "3");

    await waitFor(() => {
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });
  });

});