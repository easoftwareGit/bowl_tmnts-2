"use client";

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { divPfEntryRow } from "@/lib/types/types";
import {
  setup,
  standardBeforeEach,
  mockGridCallbacks,  
  push,
  mockUseUnsavedChangesGuard,
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

// "use client";

// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import PrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/div/[divId]/page";
// import type { divPfEntryRow } from "@/lib/types/types";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useRouter } from "next/navigation";
// import {
//   fetchDivPfs,
//   getDivPfsError,
//   getDivPfsLoadStatus,
// } from "@/redux/features/divPfs/divPfsSlice";
// import {
//   fetchTmntFullData,
//   getTmntFullDataError,
//   getTmntFullDataLoadStatus,
// } from "@/redux/features/tmntFullData/tmntFullDataSlice";
// import { populateDivPfRows } from "@/app/dataEntry/prizeFunds/divPfGrid/divPfRows";
// import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

// jest.mock("@/lib/syncfusion-license", () => ({}));

// jest.mock("react-redux", () => ({
//   useDispatch: jest.fn(),
//   useSelector: jest.fn(),
// }));

// jest.mock("next/navigation", () => ({
//   useParams: jest.fn(),
//   useRouter: jest.fn(),
// }));

// jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
//   fetchDivPfs: jest.fn(),
//   getDivPfsError: jest.fn(),
//   getDivPfsLoadStatus: jest.fn(),
// }));

// jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
//   fetchTmntFullData: jest.fn(),
//   getTmntFullDataError: jest.fn(),
//   getTmntFullDataLoadStatus: jest.fn(),
// }));

// jest.mock("@/hooks/useUnsavedChangesGuard", () => ({
//   useUnsavedChangesGuard: jest.fn(),
// }));

// jest.mock(
//   "@/app/dataEntry/prizeFunds/divPfGrid/divPfRows",
//   () => ({
//     populateDivPfRows: jest.fn(),
//   }),
// );

// jest.mock("@/components/modal/waitModal", () => ({
//   __esModule: true,
//   default: ({ show, message }: { show: boolean; message: string }) =>
//     show ? <div data-testid="wait-modal">{message}</div> : null,
// }));

// jest.mock("@/components/modal/confirmModal", () => ({
//   __esModule: true,
//   default: ({ show }: { show: boolean }) =>
//     show ? <div data-testid="confirm-modal" /> : null,
// }));

// jest.mock("@/components/currency/eaCurrencyInput", () => ({
//   __esModule: true,
//   default: ({
//     id,
//     name,
//     value,
//     disabled,
//   }: {
//     id: string;
//     name: string;
//     value: number;
//     disabled?: boolean;
//   }) => (
//     <input
//       data-testid="currency-input"
//       id={id}
//       name={name}
//       value={value}
//       disabled={disabled}
//       readOnly
//     />
//   ),
// }));

// const savedRows: divPfEntryRow[] = [
//   {
//     id: "dpf_00000000000000000000000000000001",
//     div_id: "div_00000000000000000000000000000001",
//     position: 1,
//     amount: 125,
//     percentage: 0.625,
//   },
//   {
//     id: "dpf_00000000000000000000000000000002",
//     div_id: "div_00000000000000000000000000000001",
//     position: 2,
//     amount: 75,
//     percentage: 0.375,
//   },
// ];

// jest.mock(
//   "@/app/dataEntry/prizeFunds/divPfGrid/divPfGrid",
//   () => ({
//     __esModule: true,
//     default: ({
//       rows,
//       gridDataWasChanged,
//       onGridDataChanged,
//       onNavigateAfterSave,
//       onSaveComplete,
//     }: {
//       rows: divPfEntryRow[];
//       gridDataWasChanged: boolean;
//       onGridDataChanged: () => void;
//       onNavigateAfterSave: () => void;
//       onSaveComplete: (savedRows: divPfEntryRow[]) => void;
//     }) => (
//       <div data-testid="div-prize-fund-grid">
//         <div data-testid="grid-row-count">{rows.length}</div>
//         <div data-testid="grid-data-was-changed">
//           {String(gridDataWasChanged)}
//         </div>

//         <button type="button" onClick={onGridDataChanged}>
//           Fire Grid Data Changed
//         </button>

//         <button type="button" onClick={() => onSaveComplete(savedRows)}>
//           Fire Save Complete
//         </button>

//         <button type="button" onClick={onNavigateAfterSave}>
//           Fire Navigate After Save
//         </button>
//       </div>
//     ),
//   }),
// );

// const mockUseDispatch = jest.mocked(useDispatch);
// const mockUseSelector = jest.mocked(useSelector);
// const mockUseParams = jest.mocked(useParams);
// const mockUseRouter = jest.mocked(useRouter);

// const mockFetchDivPfs = jest.mocked(fetchDivPfs);
// const mockFetchTmntFullData = jest.mocked(fetchTmntFullData);
// const mockPopulateDivPfRows = jest.mocked(populateDivPfRows);
// const mockUseUnsavedChangesGuard = jest.mocked(useUnsavedChangesGuard);

// const tmntId = "tmt_00000000000000000000000000000001";
// const divId = "div_00000000000000000000000000000001";

// const mockDivPfs = [
//   {
//     id: "dpf_00000000000000000000000000000001",
//     div_id: divId,
//     position: 1,
//     amount: 100,
//   },
//   {
//     id: "dpf_00000000000000000000000000000002",
//     div_id: divId,
//     position: 2,
//     amount: 100,
//   },
// ];

// const mockRows: divPfEntryRow[] = [
//   {
//     id: "dpf_00000000000000000000000000000001",
//     div_id: divId,
//     position: 1,
//     amount: 100,
//     percentage: 0.5,
//   },
//   {
//     id: "dpf_00000000000000000000000000000002",
//     div_id: divId,
//     position: 2,
//     amount: 100,
//     percentage: 0.5,
//   },
// ];

// const mockTmntData = {
//   tmnt: {
//     id: tmntId,
//     tmnt_name: "Test Tournament",
//   },
//   divs: [
//     {
//       id: divId,
//       div_name: "Scratch",
//     },
//   ],
//   players: [
//     { id: "ply_001" },
//     { id: "ply_002" },
//     { id: "ply_003" },
//     { id: "ply_004" },
//   ],
//   moneys: [
//     {
//       id: "mon_001",
//       div_id: divId,
//       descrip: "PRIZEFUND",
//       flow: "OUT",
//       pot_id: null,
//       brkt_id: null,
//       elim_id: null,
//       amount: 200,
//     },
//   ],
// };

// const dispatch = jest.fn();
// const push = jest.fn();

// const setup = () => {
//   render(<PrizeFundEntry />);
// };

describe("PrizeFundEntry navigation after save", () => {
  beforeEach(() => {
    standardBeforeEach();
    
    // jest.clearAllMocks();

    // mockUseParams.mockReturnValue({ tmntId, divId });

    // mockUseRouter.mockReturnValue({
    //   push,
    //   back: jest.fn(),
    //   forward: jest.fn(),
    //   refresh: jest.fn(),
    //   replace: jest.fn(),
    //   prefetch: jest.fn(),
    // });

    // mockUseDispatch.mockReturnValue(dispatch);

    // mockFetchDivPfs.mockReturnValue("fetchDivPfsThunk" as never);
    // mockFetchTmntFullData.mockReturnValue("fetchTmntFullDataThunk" as never);

    // mockPopulateDivPfRows.mockReturnValue(mockRows);
    // mockUseUnsavedChangesGuard.mockReturnValue(undefined);

    // mockUseSelector.mockImplementation((selector) => {
    //   if (selector === getDivPfsLoadStatus) return "succeeded";
    //   if (selector === getDivPfsError) return null;
    //   if (selector === getTmntFullDataLoadStatus) return "succeeded";
    //   if (selector === getTmntFullDataError) return null;

    //   return selector({
    //     divPfs: {
    //       divPfs: mockDivPfs,
    //     },
    //     tmntFullData: {
    //       tmntFullData: mockTmntData,
    //     },
    //   });
    // });
  });

  it("pushes the run tournament page after save complete and navigate after save", async () => {
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

  it("does not push before onNavigateAfterSave is called", async () => {
    const user = userEvent.setup();

    setup();

    await user.click(
      screen.getByRole("button", { name: "Fire Save Complete" }),
    );

    expect(push).not.toHaveBeenCalled();
  });

  it("does not arm unsaved changes guard after save complete and navigate after save", async () => {
    const user = userEvent.setup();

    setup();

    await user.click(
      screen.getByRole("button", { name: "Fire Grid Data Changed" }),
    );

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

    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
  });
});