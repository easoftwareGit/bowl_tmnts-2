import { fireEvent, screen } from "@testing-library/react";
import type { elimPfType } from "@/lib/types/types";
import {
  clickGridCancel,
  enterExpenses,
  getGridCancelButton,
  getInputs,
  mockUseUnsavedChangesGuard,
  setup,
  standardBeforeEach,
  type SetupOptions,
} from "./elimPfPage.testSetup";
import {
  elimId1,
  mockElimPfs,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*
 * Fixed entry fees so expected Expenses / Prize Fund values do not
 * depend on the mock data.
 */
const ENTRY_FEES = 1000;

const elim1Pfs = mockElimPfs.filter(
  (elimPf) => elimPf.elim_id === elimId1,
);

/**
 * Returns elim1's prize funds with amounts that sum to prizeTotal.
 * The whole total goes to 1st place; the other places get 0.
 */
const elimPfsWithPrizeTotal = (prizeTotal: number): elimPfType[] =>
  elim1Pfs.map((elimPf, index) => ({
    ...elimPf,
    amount: index === 0 ? prizeTotal : 0,
  }));

/**
 * Renders the page with ENTRY_FEES as the eliminator's total fees.
 */
const setupWithFees = (options: SetupOptions = {}) =>
  setup({ elimEntryFees: ENTRY_FEES, ...options });

const gridTotal = () => screen.getByTestId("mock-grid-total-prize-fund");

/**
 * Types into Expenses without leaving the field.
 */
const typeExpenses = async (
  user: ReturnType<typeof setup>["user"],
  value: string,
): Promise<void> => {
  const { expenses } = getInputs();
  await user.clear(expenses);
  await user.type(expenses, value);
};

describe("Elim Prize Fund web page expenses input", () => {
  beforeEach(standardBeforeEach);

  it("has saved eliminator prize funds in the mock data", () => {
    // Precondition for the tests that build prize funds from elim1Pfs.
    expect(elim1Pfs.length).toBeGreaterThan(0);
  });

  /*********************************
   * Values shown when page loads  *
   *********************************/

  describe("initial values", () => {
    it("recovers expenses as total fees minus the saved prizes", () => {
      setupWithFees({ elimPfs: elimPfsWithPrizeTotal(950) });

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue("50.00");
      expect(prizeFund).toHaveValue("950");
      expect(gridTotal()).toHaveTextContent("950");
    });

    it("starts expenses at 0 when no prizes are saved", () => {
      setupWithFees({ elimPfs: [] });

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue("0.00");
      expect(prizeFund).toHaveValue(String(ENTRY_FEES));
      expect(gridTotal()).toHaveTextContent(String(ENTRY_FEES));
    });

    it("never shows negative expenses when saved prizes exceed the fees", () => {
      setupWithFees({ elimPfs: elimPfsWithPrizeTotal(ENTRY_FEES + 100) });

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue("0.00");
      expect(prizeFund).toHaveValue(String(ENTRY_FEES));
    });

    it("rounds recovered expenses to cents", () => {
      // 1000 - 999.7 has floating-point drift (0.2999999999999545).
      setupWithFees({ elimPfs: elimPfsWithPrizeTotal(999.7) });

      expect(getInputs().expenses).toHaveValue("0.30");
    });

    it("matches the values calcExpectedElimValues derives from the mock data", () => {
      const { expectedExpenses, expectedPrizeFund } = setup();

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue(expectedExpenses.toFixed(2));
      expect(prizeFund).toHaveValue(String(expectedPrizeFund));
    });
  });

  /*********************************
   * Typing (before the value is   *
   * applied on blur)              *
   *********************************/

  describe("typing", () => {
    it.each([
      ["-5", "5", "a negative sign"],
      ["12abc", "12", "letters"],
      ["12.3.4", "12.34", "a second decimal point"],
      ["$1,234.50", "1234.50", "dollar signs and commas (stripped)"],
      [".5", ".5", "a leading decimal point (allowed)"],
    ])("typing %s shows %s: %s", async (typed, shown) => {
      const { user } = setupWithFees();
      const { expenses } = getInputs();

      await user.clear(expenses);
      await user.type(expenses, typed);

      expect(expenses).toHaveValue(shown);
    });

    it("does not update the Prize Fund until the field loses focus", async () => {
      const { user, expectedPrizeFund } = setupWithFees();
      const { prizeFund } = getInputs();

      await typeExpenses(user, "25");

      expect(prizeFund).toHaveValue(String(expectedPrizeFund));
      expect(gridTotal()).toHaveTextContent(String(expectedPrizeFund));
    });

    it("does not apply the value when Enter is pressed", async () => {
      // Expenses has no onKeyDown handler; only blur applies it.
      const { user, expectedPrizeFund } = setupWithFees();

      await typeExpenses(user, "25");
      await user.keyboard("{Enter}");

      expect(getInputs().expenses).toHaveValue("25");
      expect(getInputs().prizeFund).toHaveValue(String(expectedPrizeFund));
    });

    it("arms the unsaved changes guard", async () => {
      const { user } = setupWithFees();

      await typeExpenses(user, "25");

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("does not arm the guard for rejected characters", async () => {
      const { user } = setupWithFees();

      // No clear(): an empty string is accepted and would arm the guard.
      await user.type(getInputs().expenses, "a");

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });
  });

  /*********************************
   * Applying on blur              *
   *********************************/

  describe("on blur", () => {
    it("formats expenses and updates the Prize Fund and grid total", async () => {
      const { user } = setupWithFees({ elimPfs: [] });

      await enterExpenses(user, "25");

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue("25.00");
      expect(prizeFund).toHaveValue("975");
      expect(gridTotal()).toHaveTextContent("975");
    });

    /*
     * roundToTwoDecimals() truncates to cents (it does not round half up),
     * so anything past the second decimal place is dropped.
     */
    it.each([
      ["", "0.00"],
      [".", "0.00"],
      [".5", "0.50"],
      ["12.344", "12.34"],
      ["12.345", "12.34"],
      ["12.349", "12.34"],
    ])("changes %p to %p", async (typed, applied) => {
      const { user } = setupWithFees();

      await enterExpenses(user, typed);

      expect(getInputs().expenses).toHaveValue(applied);
    });

    it.each(["0.29", "1.13", "4.35"])(
      "keeps %s without floating-point truncation errors",
      async (typed) => {
        const { user } = setupWithFees();

        await enterExpenses(user, typed);

        expect(getInputs().expenses).toHaveValue(typed);
      },
    );

    it("sets the Prize Fund to the total fees when expenses are cleared", async () => {
      const { user } = setupWithFees({ elimPfs: elimPfsWithPrizeTotal(950) });

      await enterExpenses(user, "");

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue("0.00");
      expect(prizeFund).toHaveValue(String(ENTRY_FEES));
      expect(gridTotal()).toHaveTextContent(String(ENTRY_FEES));
    });

    it("applies each new value in turn", async () => {
      const { user } = setupWithFees({ elimPfs: [] });

      await enterExpenses(user, "25");
      await enterExpenses(user, "40");

      expect(getInputs().expenses).toHaveValue("40.00");
      expect(getInputs().prizeFund).toHaveValue("960");
      expect(gridTotal()).toHaveTextContent("960");
    });
  });

  /*********************************
   * Range limits                  *
   *********************************/

  describe("range limits", () => {
    it("limits expenses to the total fees", async () => {
      const { user } = setupWithFees();

      await enterExpenses(user, "999999");

      const { expenses, prizeFund } = getInputs();
      expect(expenses).toHaveValue(ENTRY_FEES.toFixed(2));
      expect(prizeFund).toHaveValue("0");
      expect(gridTotal()).toHaveTextContent("0");
    });

    it("allows expenses equal to the total fees", async () => {
      const { user } = setupWithFees();

      await enterExpenses(user, String(ENTRY_FEES));

      expect(getInputs().expenses).toHaveValue(ENTRY_FEES.toFixed(2));
      expect(getInputs().prizeFund).toHaveValue("0");
    });

    it("limits expenses to 0 when there are no entry fees", async () => {
      const { user } = setup({ elimEntryFees: 0, elimPfs: [] });

      await enterExpenses(user, "25");

      expect(getInputs().expenses).toHaveValue("0.00");
      expect(getInputs().prizeFund).toHaveValue("0");
    });

    it("is not limited by the saved prize total", async () => {
      // Saved prizes total 950 (expenses 50). Old behavior capped at 950.
      const { user } = setupWithFees({ elimPfs: elimPfsWithPrizeTotal(950) });

      await enterExpenses(user, "980");

      expect(getInputs().expenses).toHaveValue("980.00");
      expect(getInputs().prizeFund).toHaveValue("20");
    });
  });

  /*********************************
   * Leaving for the grid Cancel   *
   *********************************/

  describe("leaving the input for the grid Cancel button", () => {
    it("discards the typed value when focus moves to Cancel", async () => {
      const { user } = setupWithFees({ elimPfs: [] });

      await enterExpenses(user, "25");
      await typeExpenses(user, "40");

      // Blur toward Cancel without clicking it (onCancel is not called).
      fireEvent.blur(getInputs().expenses, {
        relatedTarget: getGridCancelButton(),
      });

      // Shows the last APPLIED value, not the typed one.
      expect(getInputs().expenses).toHaveValue("25.00");
      expect(getInputs().prizeFund).toHaveValue("975");
    });

    it("discards the typed value after a mousedown on Cancel (Safari: no relatedTarget)", async () => {
      const { user } = setupWithFees({ elimPfs: [] });

      await enterExpenses(user, "25");
      await typeExpenses(user, "40");

      fireEvent.mouseDown(getGridCancelButton());
      fireEvent.blur(getInputs().expenses, { relatedTarget: null });

      expect(getInputs().expenses).toHaveValue("25.00");
      expect(getInputs().prizeFund).toHaveValue("975");
    });

    it("restores the loaded Expenses and Prize Fund when Cancel is clicked", async () => {
      const { user, expectedExpenses, expectedPrizeFund } = setupWithFees({
        elimPfs: elimPfsWithPrizeTotal(950),
      });

      await enterExpenses(user, "25");
      await typeExpenses(user, "40");
      await clickGridCancel(user);

      expect(getInputs().expenses).toHaveValue(expectedExpenses.toFixed(2));
      expect(getInputs().prizeFund).toHaveValue(String(expectedPrizeFund));
      expect(gridTotal()).toHaveTextContent(String(expectedPrizeFund));
    });

    it("applies the typed value when the Cancel button is disabled", async () => {
      const { user } = setupWithFees({
        elimPfs: [],
        gridCancelDisabled: true,
      });

      await typeExpenses(user, "25");
      await clickGridCancel(user);

      expect(getInputs().expenses).toHaveValue("25.00");
      expect(getInputs().prizeFund).toHaveValue("975");
    });
  });
});

// import { screen } from "@testing-library/react";
// import type { elimPfType } from "@/lib/types/types";
// import {
//   enterExpenses,
//   getInputs,
//   mockUseUnsavedChangesGuard,
//   setup,
//   standardBeforeEach,
//   type SetupOptions,
// } from "./elimPfPage.testSetup";
// import {
//   elimId1,
//   mockElimPfs,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// /*
//  * Fixed entry fees so expected Expenses / Prize Fund values do not
//  * depend on the mock data.
//  */
// const ENTRY_FEES = 1000;

// const elim1Pfs = mockElimPfs.filter(
//   (elimPf) => elimPf.elim_id === elimId1,
// );

// /**
//  * Returns elim1's prize funds with amounts that sum to prizeTotal.
//  * The whole total goes to 1st place; the other places get 0.
//  */
// const elimPfsWithPrizeTotal = (prizeTotal: number): elimPfType[] =>
//   elim1Pfs.map((elimPf, index) => ({
//     ...elimPf,
//     amount: index === 0 ? prizeTotal : 0,
//   }));

// /**
//  * Renders the page with ENTRY_FEES as the eliminator's total fees.
//  */
// const setupWithFees = (options: SetupOptions = {}) =>
//   setup({ elimEntryFees: ENTRY_FEES, ...options });

// const gridTotal = () => screen.getByTestId("mock-grid-total-prize-fund");

// describe("Elim Prize Fund web page expenses input", () => {
//   beforeEach(standardBeforeEach);

//   it("has saved eliminator prize funds in the mock data", () => {
//     // Precondition for the tests that build prize funds from elim1Pfs.
//     expect(elim1Pfs.length).toBeGreaterThan(0);
//   });

//   /*********************************
//    * Values shown when page loads  *
//    *********************************/

//   describe("initial values", () => {

//     it("recovers expenses as total fees minus the saved prizes", () => {
//       setupWithFees({ elimPfs: elimPfsWithPrizeTotal(950) });

//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue("50.00");
//       expect(prizeFund).toHaveValue("950");
//       expect(gridTotal()).toHaveTextContent("950");
//     });

//     it("starts expenses at 0 when no prizes are saved", () => {
//       setupWithFees({ elimPfs: [] });

//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue("0.00");
//       expect(prizeFund).toHaveValue(String(ENTRY_FEES));
//       expect(gridTotal()).toHaveTextContent(String(ENTRY_FEES));
//     });

//     it("never shows negative expenses when saved prizes exceed the fees", () => {
//       setupWithFees({ elimPfs: elimPfsWithPrizeTotal(ENTRY_FEES + 100) });

//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue("0.00");
//       expect(prizeFund).toHaveValue(String(ENTRY_FEES));
//     });

//     it("rounds recovered expenses to cents", () => {
//       // 1000 - 999.7 has floating-point drift (0.2999999999999545).
//       setupWithFees({ elimPfs: elimPfsWithPrizeTotal(999.7) });

//       expect(getInputs().expenses).toHaveValue("0.30");
//     });
//   });

//   /*********************************
//    * Typing (before the value is   *
//    * applied on blur)              *
//    *********************************/

//   describe("typing", () => {
//     it.each([
//       ["-5", "5", "a negative sign"],
//       ["12abc", "12", "letters"],
//       ["12.3.4", "12.34", "a second decimal point"],
//       ["$1,234.50", "1234.50", "dollar signs and commas (stripped)"],
//       [".5", ".5", "a leading decimal point (allowed)"],
//     ])("typing %s shows %s: %s", async (typed, shown) => {
//       const { user } = setupWithFees();
//       const { expenses } = getInputs();

//       await user.clear(expenses);
//       await user.type(expenses, typed);

//       expect(expenses).toHaveValue(shown);
//     });

//     it("does not update the Prize Fund until the field loses focus", async () => {
//       const { user, expectedPrizeFund } = setupWithFees();
//       const { expenses, prizeFund } = getInputs();

//       await user.clear(expenses);
//       await user.type(expenses, "25");

//       expect(prizeFund).toHaveValue(String(expectedPrizeFund));
//       expect(gridTotal()).toHaveTextContent(String(expectedPrizeFund));
//     });

//     it("arms the unsaved changes guard", async () => {
//       const { user } = setupWithFees();
//       const { expenses } = getInputs();

//       await user.clear(expenses);
//       await user.type(expenses, "25");

//       expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
//     });
//   });

//   /*********************************
//    * Applying on blur              *
//    *********************************/

//   describe("on blur", () => {
//     it("formats expenses and updates the Prize Fund and grid total", async () => {
//       const { user } = setupWithFees({ elimPfs: [] });

//       await enterExpenses(user, "25");

//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue("25.00");
//       expect(prizeFund).toHaveValue("975");
//       expect(gridTotal()).toHaveTextContent("975");
//     });

//     it.each([
//       ["", "0.00"],
//       [".", "0.00"],
//       [".5", "0.50"],
//       ["12.349", "12.34"],
//     ])("changes %p to %p", async (typed, applied) => {
//       const { user } = setupWithFees();

//       await enterExpenses(user, typed);

//       expect(getInputs().expenses).toHaveValue(applied);
//     });

//     it.each(["0.29", "1.13", "4.35"])(
//       "keeps %s without floating-point truncation errors",
//       async (typed) => {
//         const { user } = setupWithFees();

//         await enterExpenses(user, typed);

//         expect(getInputs().expenses).toHaveValue(typed);
//       },
//     );

//     it("sets the Prize Fund to the total fees when expenses are cleared", async () => {
//       const { user } = setupWithFees({ elimPfs: elimPfsWithPrizeTotal(950) });

//       await enterExpenses(user, "");

//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue("0.00");
//       expect(prizeFund).toHaveValue(String(ENTRY_FEES));
//       expect(gridTotal()).toHaveTextContent(String(ENTRY_FEES));
//     });
//   });

//   /*********************************
//    * Range limits                  *
//    *********************************/

//   describe("range limits", () => {
//     it("limits expenses to the total fees", async () => {
//       const { user } = setupWithFees();

//       await enterExpenses(user, "999999");

//       const { expenses, prizeFund } = getInputs();
//       expect(expenses).toHaveValue(ENTRY_FEES.toFixed(2));
//       expect(prizeFund).toHaveValue("0");
//       expect(gridTotal()).toHaveTextContent("0");
//     });

//     it("allows expenses equal to the total fees", async () => {
//       const { user } = setupWithFees();

//       await enterExpenses(user, String(ENTRY_FEES));

//       expect(getInputs().expenses).toHaveValue(ENTRY_FEES.toFixed(2));
//       expect(getInputs().prizeFund).toHaveValue("0");
//     });

//     it("limits expenses to 0 when there are no entry fees", async () => {
//       const { user } = setup({ elimEntryFees: 0, elimPfs: [] });

//       await enterExpenses(user, "25");

//       expect(getInputs().expenses).toHaveValue("0.00");
//       expect(getInputs().prizeFund).toHaveValue("0");
//     });

//     it("is not limited by the saved prize total", async () => {
//       // Saved prizes total 950 (expenses 50). Old behavior capped at 950.
//       const { user } = setupWithFees({ elimPfs: elimPfsWithPrizeTotal(950) });

//       await enterExpenses(user, "980");

//       expect(getInputs().expenses).toHaveValue("980.00");
//       expect(getInputs().prizeFund).toHaveValue("20");
//     });
//   });
// });
