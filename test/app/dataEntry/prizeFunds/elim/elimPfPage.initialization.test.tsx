/*
 * Import the setup module first: it registers the jest.mock() calls,
 * so the slice imports below resolve to the mocked selectors.
 */
import {
  calcExpectedElimValues,
  enterCashers,
  enterExpenses,
  getGridMountCount,
  getInputs,
  getLatestRows,
  mockElimPfsToPrizeFunds,
  mockPopulatePfRows,
  mockUseUnsavedChangesGuard,
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup";
import { screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import { cloneDeep } from "lodash";
import type { RootState } from "@/redux/store";
import {
  getElimPfsLoadStatus,
  getElimPfsRequestedTmntId,
  selectElimPfs,
} from "@/redux/features/elimPfs/elimPfsSlice";
import {
  getTmntFullDataLoadStatus,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import ElimPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/elim/[elimId]/page";
import {
  elimId1,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const OTHER_TMNT_ID = "tmt_00000000000000000000000000000099";

/**
 * Simulates Redux state changing after the first render.
 *
 * Selectors listed in overrides return the given values; all other
 * selectors keep reading the state built by setup().
 */
const overrideSelectors = (
  overrides: Array<[selector: unknown, value: unknown]>,
): void => {
  const original = jest.mocked(useSelector).getMockImplementation();
  if (!original) {
    throw new Error("setup() must run before overrideSelectors()");
  }

  const values = new Map(overrides);

  jest.mocked(useSelector).mockImplementation(
    (selector: (state: RootState) => unknown) =>
      values.has(selector)
        ? values.get(selector)
        : original(selector as (state: unknown) => unknown),
  );
};

describe("Elim Prize Fund initialization", () => {
  beforeEach(standardBeforeEach);

  /*********************************
   * Building the rows             *
   *********************************/

  describe("prize fund rows", () => {
    it("converts only the current eliminator's prize funds", () => {
      const { elimPfs, currentElimPfs } = setup();

      // Precondition: the mock data has prize funds for other eliminators.
      expect(elimPfs.length).toBeGreaterThan(currentElimPfs.length);
      expect(currentElimPfs.every((pf) => pf.elim_id === elimId1)).toBe(true);

      expect(mockElimPfsToPrizeFunds).toHaveBeenCalledTimes(1);
      expect(mockElimPfsToPrizeFunds).toHaveBeenCalledWith(currentElimPfs);
    });

    it("populates rows with the derived prize fund and casher count", () => {
      const { prizeFunds, elimId, expectedCashers, expectedPrizeFund } =
        setup();

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        prizeFunds,
        elimId,
        expectedPrizeFund,
        expectedCashers,
      );
    });

    it("passes the populated rows to the grid", () => {
      const { populatedRows } = setup();

      expect(getLatestRows()).toEqual(populatedRows);
    });

    it("initializes with no rows when the eliminator has no saved prize funds", () => {
      const { elimId, expectedPrizeFund } = setup({ elimPfs: [] });

      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        [],
        elimId,
        expectedPrizeFund,
        0,
      );
      expect(getLatestRows()).toEqual([]);
    });
  });

  /*********************************
   * Field values and page state   *
   *********************************/

  describe("field values and page state", () => {
    it("sets Cashers, Expenses and Prize Fund from the loaded data", () => {
      const { expectedCashers, expectedExpenses, expectedPrizeFund } =
        setup();

      const { cashers, expenses, prizeFund } = getInputs();
      expect(cashers).toHaveValue(expectedCashers);
      expect(expenses).toHaveValue(expectedExpenses.toFixed(2));
      expect(prizeFund).toHaveValue(String(expectedPrizeFund));
      expect(
        screen.getByTestId("mock-grid-total-prize-fund"),
      ).toHaveTextContent(String(expectedPrizeFund));
    });

    it("does not mark the page as changed", () => {
      setup();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
      expect(
        screen.getByTestId("mock-grid-data-was-changed"),
      ).toHaveTextContent("false");
    });

    it("passes the rows as a prop without remounting the grid", () => {
      setup();

      // Only gridKey changes (Cancel) remount the grid.
      expect(getGridMountCount()).toBe(1);
    });

    it("records the loaded state as the state Cancel restores", async () => {
      const {
        user,
        populatedRows,
        expectedCashers,
        numPlayers,
        triggerGridCancel,
      } = setup({ elimEntryFees: 1000 });

      expect(numPlayers).toBeGreaterThan(expectedCashers);

      // Read after setup: elimEntryFees changes the recovered expenses.
      const loadedExpenses = getInputs().expenses.value;
      const loadedPrizeFund = getInputs().prizeFund.value;

      await enterCashers(user, String(expectedCashers + 1));
      await enterExpenses(user, "25");

      triggerGridCancel();

      const { cashers, expenses, prizeFund } = getInputs();
      expect(cashers).toHaveValue(expectedCashers);
      expect(expenses).toHaveValue(loadedExpenses);
      expect(prizeFund).toHaveValue(loadedPrizeFund);
      expect(getLatestRows()).toEqual(populatedRows);
    });
  });

  /*********************************
   * Timing                        *
   *********************************/

  describe("when data arrives after the first render", () => {
    it("initializes once the tournament data loads", () => {
      const { view, elimPfs, elimId } = setup({
        tmntData: null,
        tmntLoadStatus: "loading",
      });

      expect(mockPopulatePfRows).not.toHaveBeenCalled();

      // Tournament data arrives.
      const tmntData = cloneDeep(mockTmntFullData);
      const expected = calcExpectedElimValues(tmntData, elimPfs, elimId);

      overrideSelectors([
        [selectTmntFullData, tmntData],
        [getTmntFullDataLoadStatus, "succeeded"],
      ]);
      view.rerender(<ElimPrizeFundEntry />);

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        expect.any(Array),
        elimId,
        expected.expectedPrizeFund,
        expected.expectedCashers,
      );

      /*
       * Regression test for the totalElimPrizeFund fix: the Prize Fund
       * field and grid total must not stay at 0 when the data arrives
       * after the first render.
       */
      const { cashers, expenses, prizeFund } = getInputs();
      expect(cashers).toHaveValue(expected.expectedCashers);
      expect(expenses).toHaveValue(expected.expectedExpenses.toFixed(2));
      expect(prizeFund).toHaveValue(String(expected.expectedPrizeFund));
      expect(getLatestRows()).toHaveLength(expected.expectedCashers);
    });

    it("does not initialize while the elim prize funds are loading", () => {
      setup({ elimPfsLoadStatus: "loading" });

      expect(mockElimPfsToPrizeFunds).not.toHaveBeenCalled();
      expect(mockPopulatePfRows).not.toHaveBeenCalled();
    });

    it("initializes once the elim prize funds load", () => {
      const {
        view,
        currentElimPfs,
        prizeFunds,
        elimId,
        expectedCashers,
        expectedExpenses,
        expectedPrizeFund,
      } = setup({ elimPfsLoadStatus: "loading" });

      overrideSelectors([[getElimPfsLoadStatus, "succeeded"]]);
      view.rerender(<ElimPrizeFundEntry />);

      expect(mockElimPfsToPrizeFunds).toHaveBeenCalledTimes(1);
      expect(mockElimPfsToPrizeFunds).toHaveBeenCalledWith(currentElimPfs);
      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        prizeFunds,
        elimId,
        expectedPrizeFund,
        expectedCashers,
      );

      const { cashers, expenses, prizeFund } = getInputs();
      expect(cashers).toHaveValue(expectedCashers);
      expect(expenses).toHaveValue(expectedExpenses.toFixed(2));
      expect(prizeFund).toHaveValue(String(expectedPrizeFund));
    });

    it("waits for prize funds for the route tournament before initializing", () => {
      const { view, tmntId, expectedCashers } = setup({
        elimPfsRequestedTmntId: OTHER_TMNT_ID,
      });

      // Stale prize funds from another tournament are ignored.
      expect(mockPopulatePfRows).not.toHaveBeenCalled();

      overrideSelectors([[getElimPfsRequestedTmntId, tmntId]]);
      view.rerender(<ElimPrizeFundEntry />);

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
      expect(getInputs().cashers).toHaveValue(expectedCashers);
    });
  });

  /*********************************
   * Runs only once                *
   *********************************/

  describe("runs only once", () => {
    it("does not reinitialize when the prize funds in Redux change", () => {
      const { view, currentElimPfs } = setup();

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);

      // New array from Redux: the effect re-runs, but initializedRef stops it.
      overrideSelectors([
        [
          selectElimPfs,
          currentElimPfs.map((pf) => ({ ...pf, amount: (pf.amount ?? 0) + 1 })),
        ],
      ]);
      view.rerender(<ElimPrizeFundEntry />);

      expect(mockElimPfsToPrizeFunds).toHaveBeenCalledTimes(1);
      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
    });

    it("keeps the user's edits when Redux data changes", async () => {
      const { user, view, currentElimPfs, populatedRows } = setup({
        elimEntryFees: 1000,
      });

      await enterExpenses(user, "25");

      overrideSelectors([
        [selectElimPfs, currentElimPfs.map((pf) => ({ ...pf }))],
      ]);
      view.rerender(<ElimPrizeFundEntry />);

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue("25.00");
      expect(prizeFund).toHaveValue("975");
      expect(getLatestRows()).toEqual(populatedRows);
    });
  });
});

// /*
//  * Import the setup module first: it registers the jest.mock() calls,
//  * so the slice imports below resolve to the mocked selectors.
//  */
// import {
//   calcExpectedElimValues,
//   enterExpenses,
//   getInputs,
//   getLatestRows,
//   mockElimPfsToPrizeFunds,
//   mockPopulatePfRows,
//   setup,
//   standardBeforeEach,
// } from "./elimPfPage.testSetup";
// import { useSelector } from "react-redux";
// import { cloneDeep } from "lodash";
// import type { RootState } from "@/redux/store";
// import { selectElimPfs } from "@/redux/features/elimPfs/elimPfsSlice";
// import {
//   getTmntFullDataLoadStatus,
//   selectTmntFullData,
// } from "@/redux/features/tmntFullData/tmntFullDataSlice";
// import ElimPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/elim/[elimId]/page";
// import {
//   elimId1,
//   mockTmntFullData,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// /**
//  * Simulates Redux state changing after the first render.
//  *
//  * Selectors listed in overrides return the given values; all other
//  * selectors keep reading the state built by setup().
//  */
// const overrideSelectors = (
//   overrides: Array<[selector: unknown, value: unknown]>,
// ): void => {
//   const original = jest.mocked(useSelector).getMockImplementation();
//   if (!original) {
//     throw new Error("setup() must run before overrideSelectors()");
//   }

//   const values = new Map(overrides);

//   jest.mocked(useSelector).mockImplementation(
//     (selector: (state: RootState) => unknown) =>
//       values.has(selector)
//         ? values.get(selector)
//         : original(selector as (state: unknown) => unknown),
//   );
// };

// describe("Elim Prize Fund initialization", () => {
//   beforeEach(standardBeforeEach);

//   /*********************************
//    * Building the rows             *
//    *********************************/

//   describe("prize fund rows", () => {
//     it("converts only the current eliminator's prize funds", () => {
//       const { elimPfs, currentElimPfs } = setup();

//       // Precondition: the mock data has prize funds for other eliminators.
//       expect(elimPfs.length).toBeGreaterThan(currentElimPfs.length);
//       expect(currentElimPfs.every((pf) => pf.elim_id === elimId1)).toBe(true);

//       expect(mockElimPfsToPrizeFunds).toHaveBeenCalledTimes(1);
//       expect(mockElimPfsToPrizeFunds).toHaveBeenCalledWith(currentElimPfs);
//     });

//     it("populates rows with the derived prize fund and casher count", () => {
//       const { prizeFunds, elimId, currentElimPfs, expectedPrizeFund } =
//         setup();

//       expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
//       expect(mockPopulatePfRows).toHaveBeenCalledWith(
//         prizeFunds,
//         elimId,
//         expectedPrizeFund,
//         currentElimPfs.length,
//       );
//     });

//     it("passes the populated rows to the grid", () => {
//       const { populatedRows } = setup();

//       expect(getLatestRows()).toEqual(populatedRows);
//     });

//     it("initializes with no rows when the eliminator has no saved prize funds", () => {
//       const { elimId, expectedPrizeFund } = setup({ elimPfs: [] });

//       expect(mockPopulatePfRows).toHaveBeenCalledWith(
//         [],
//         elimId,
//         expectedPrizeFund,
//         0,
//       );
//       expect(getLatestRows()).toEqual([]);
//     });
//   });

//   /*********************************
//    * Field values                  *
//    *********************************/

//   describe("field values", () => {
//     it("sets Cashers, Expenses and Prize Fund from the loaded data", () => {
//       const { currentElimPfs, expectedExpenses, expectedPrizeFund } = setup();

//       const { cashers, expenses, prizeFund } = getInputs();
//       expect(cashers).toHaveValue(currentElimPfs.length);
//       expect(expenses).toHaveValue(expectedExpenses.toFixed(2));
//       expect(prizeFund).toHaveValue(String(expectedPrizeFund));
//     });
//   });

//   /*********************************
//    * Timing                        *
//    *********************************/

//   describe("when data arrives after the first render", () => {
//     it("initializes once the tournament data loads", () => {
//       const { view, elimPfs, elimId } = setup({
//         tmntData: null,
//         tmntLoadStatus: "loading",
//       });

//       expect(mockPopulatePfRows).not.toHaveBeenCalled();

//       // Tournament data arrives.
//       const tmntData = cloneDeep(mockTmntFullData);
//       const expected = calcExpectedElimValues(tmntData, elimPfs, elimId);

//       overrideSelectors([
//         [selectTmntFullData, tmntData],
//         [getTmntFullDataLoadStatus, "succeeded"],
//       ]);
//       view.rerender(<ElimPrizeFundEntry />);

//       expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
//       expect(mockPopulatePfRows).toHaveBeenCalledWith(
//         expect.any(Array),
//         elimId,
//         expected.expectedPrizeFund,
//         expect.any(Number),
//       );

//       /*
//        * Regression test for the totalElimPrizeFund fix: the Prize Fund
//        * field and grid total must not stay at 0 when the data arrives
//        * after the first render.
//        */
//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue(expected.expectedExpenses.toFixed(2));
//       expect(prizeFund).toHaveValue(String(expected.expectedPrizeFund));
//       expect(getLatestRows()).toHaveLength(
//         elimPfs.filter((pf) => pf.elim_id === elimId).length,
//       );
//     });

//     it("does not initialize while the elim prize funds are loading", () => {
//       setup({ elimPfsLoadStatus: "loading" });

//       expect(mockElimPfsToPrizeFunds).not.toHaveBeenCalled();
//       expect(mockPopulatePfRows).not.toHaveBeenCalled();
//     });
//   });

//   /*********************************
//    * Runs only once                *
//    *********************************/

//   describe("runs only once", () => {
//     it("does not reinitialize when the prize funds in Redux change", () => {
//       const { view, currentElimPfs } = setup();

//       expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);

//       // New array from Redux: the effect re-runs, but initializedRef stops it.
//       overrideSelectors([
//         [
//           selectElimPfs,
//           currentElimPfs.map((pf) => ({ ...pf, amount: (pf.amount ?? 0) + 1 })),
//         ],
//       ]);
//       view.rerender(<ElimPrizeFundEntry />);

//       expect(mockElimPfsToPrizeFunds).toHaveBeenCalledTimes(1);
//       expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
//     });

//     it("keeps the user's edits when Redux data changes", async () => {
//       const { user, view, currentElimPfs, populatedRows } = setup({
//         elimEntryFees: 1000,
//       });

//       await enterExpenses(user, "25");

//       overrideSelectors([
//         [selectElimPfs, currentElimPfs.map((pf) => ({ ...pf }))],
//       ]);
//       view.rerender(<ElimPrizeFundEntry />);

//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue("25.00");
//       expect(prizeFund).toHaveValue("975");
//       expect(getLatestRows()).toEqual(populatedRows);
//     });
//   });
// });
