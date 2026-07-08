"use client";

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import type { divPfEntryRow } from "@/lib/types/types";
import {
  setup,
  standardBeforeEach,
  mockGridCallbacks,
  mockUseSelector,
  mockFetchDivPfs,
  mockFetchTmntFullData,
  mockPopulateDivPfRows,
  dispatch,
} from "./divPfPageTestSetup";
import { tmntId, divId1, mockDivPfs, mockTmntFullData, mockDivPrizeFund } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData"
import { getDivPfsError, getDivPfsLoadStatus } from "@/redux/features/divPfs/divPfsSlice";
import { getTmntFullDataError, getTmntFullDataLoadStatus } from "@/redux/features/tmntFullData/tmntFullDataSlice";

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


describe("PrizeFundEntry initialization", () => {
  beforeEach(() => {
    standardBeforeEach();
  });

  it("dispatches fetchDivPfs with the division id", () => {
    setup();

    expect(mockFetchDivPfs).toHaveBeenCalledWith(divId1);
    expect(dispatch).toHaveBeenCalledWith("fetchDivPfsThunk");
  });

  it("does not dispatch fetchTmntFullData when current tournament data is already loaded", () => {
    setup();

    expect(mockFetchTmntFullData).not.toHaveBeenCalled();
  });

  it("dispatches fetchTmntFullData when tournament data is missing", () => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector === getDivPfsLoadStatus) return "succeeded";
      if (selector === getDivPfsError) return null;
      if (selector === getTmntFullDataLoadStatus) return "succeeded";
      if (selector === getTmntFullDataError) return null;

      return selector({
        divPfs: {
          divPfs: mockDivPfs,
        },
        tmntFullData: {
          tmntFullData: {
            ...mockTmntFullData,
            tmnt: {
              ...mockTmntFullData.tmnt,
              id: "tmt_different",
            },
          },
        },
      });
    });

    setup();

    expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
    expect(dispatch).toHaveBeenCalledWith("fetchTmntFullDataThunk");
  });

  it("initializes rows using populateDivPfRows", async () => {
    setup();

    await waitFor(() => {
      expect(mockPopulateDivPfRows).toHaveBeenCalledWith(
        mockDivPfs,
        divId1,
        mockDivPrizeFund,
        mockDivPfs.length,
      );
    });

    expect(screen.getByTestId("grid-row-count")).toHaveTextContent(mockDivPfs.length.toString());
  });

  it("initializes the cashers input from the number of divPfs", async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByLabelText("Cashers")).toHaveValue(mockDivPfs.length);
    });
  });

  it("initializes ratio from number of players divided by number of cashers", async () => {
    setup();

    const expectedRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2)
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Cash Ratio. 1 in")).toHaveValue(expectedRatio);      
    });
  });

  it("initializes calculated cashers to 0.00", () => {
    setup();

    expect(screen.getByLabelText("Calculated Cashers")).toHaveValue(0);
  });

  it("initializes players input from tournament player count", () => {
    setup();

    expect(screen.getByLabelText("Players")).toHaveValue(mockTmntFullData.players.length);
  });

  it("initializes prize fund amount from tournament money data", () => {
    setup();

    expect(screen.getByTestId("currency-input")).toHaveValue(mockDivPrizeFund.toString());
    expect(screen.getByTestId("grid-total-prize-fund")).toHaveTextContent(mockDivPrizeFund.toString());
  });

  it("initializes ratio and cashers to zero when no divPfs exist", async () => {
    mockPopulateDivPfRows.mockReturnValue([]);

    mockUseSelector.mockImplementation((selector) => {
      if (selector === getDivPfsLoadStatus) return "succeeded";
      if (selector === getDivPfsError) return null;
      if (selector === getTmntFullDataLoadStatus) return "succeeded";
      if (selector === getTmntFullDataError) return null;

      return selector({
        divPfs: {
          divPfs: [],
        },
        tmntFullData: {
          tmntFullData: mockTmntFullData,
        },
      });
    });

    setup();

    await waitFor(() => {
      expect(screen.getByLabelText("Cashers")).toHaveValue(0);
    });

    expect(screen.getByLabelText("Cash Ratio. 1 in")).toHaveValue(0);
    expect(screen.getByTestId("grid-row-count")).toHaveTextContent("0");
  });
});