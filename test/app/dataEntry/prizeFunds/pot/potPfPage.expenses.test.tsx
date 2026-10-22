import { screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import type { potCategoriesTypes } from "@/lib/types/types";
import {
  balancePotExpenses,
  getExpensesInput,
  getGridCancelButton,
  getPrizeFundInput,
  mockUseUnsavedChangesGuard,
  queryPerGame,
  setup,
  standardBeforeEach,
} from "./potPfPage.testSetup.test";

type User = ReturnType<typeof userEvent.setup>;

const totalPrizeFundPotTypes = [
  "Last Game",
  "Series",
] as const satisfies readonly potCategoriesTypes[];

/** Types a value into Expenses and leaves the input, which applies it. */
const enterExpenses = async (user: User, text: string): Promise<void> => {
  await user.clear(getExpensesInput());
  if (text !== "") {
    await user.type(getExpensesInput(), text);
  }
  await user.tab();
};

/** The grid total passed to the mocked grid, as text. */
const gridTotalText = (): string | null =>
  screen.getByTestId("mock-grid-total-prize-fund").textContent;

/** A typed expenses amount: 10% of the fees, cut to whole cents. */
const tenPercentOf = (fees: number): number =>
  Math.floor(fees * 10) / 100;

/*************
 * Game pots *
 *************/

describe("Game pot expenses", () => {
  beforeEach(standardBeforeEach);

  const setupGamePot = () => {
    const result = setup({ potType: "Game" });
    expect(result.expected.isGamePot).toBe(true);
    expect(result.expected.games).toBeGreaterThan(0);
    expect(result.expected.entryFees).toBeGreaterThan(0);
    return result;
  };

  it("updates the prize fund, per game and grid total when expenses change", async () => {
    const { user, expected } = setupGamePot();

    const typed = tenPercentOf(expected.entryFees);
    const balanced = balancePotExpenses(
      expected.entryFees,
      typed,
      expected.games,
      true,
    );

    await enterExpenses(user, String(typed));

    expect(getExpensesInput()).toHaveValue(balanced.expenses.toFixed(2));
    expect(getPrizeFundInput()).toHaveValue(String(balanced.prizeFund));
    expect(queryPerGame()).toHaveValue(String(balanced.perGame));

    // a game pot's grid holds one game's prizes
    expect(gridTotalText()).toBe(String(balanced.perGame));
  });

  it("keeps fees = expenses + per game * games exactly", async () => {
    const { user, expected } = setupGamePot();

    await enterExpenses(user, String(tenPercentOf(expected.entryFees)));

    const expensesCents = Math.round(
      Number((getExpensesInput() as HTMLInputElement).value) * 100,
    );
    const perGameCents = Math.round(
      Number((queryPerGame() as HTMLInputElement).value) * 100,
    );

    expect(expensesCents + perGameCents * expected.games).toBe(
      Math.round(expected.entryFees * 100),
    );
  });

  it("moves the cents lost when splitting across games into expenses", async () => {
    const { user, expected } = setupGamePot();

    // needs more than one game, or nothing is lost when splitting
    expect(expected.games).toBeGreaterThan(1);

    // find an amount whose remaining prize fund does not split evenly
    const feesCents = Math.round(expected.entryFees * 100);
    let typedCents = 100;
    while ((feesCents - typedCents) % expected.games === 0) {
      typedCents++;
    }
    const typed = typedCents / 100;
    expect(typed).toBeLessThanOrEqual(expected.entryFees);

    const balanced = balancePotExpenses(
      expected.entryFees,
      typed,
      expected.games,
      true,
    );

    await enterExpenses(user, String(typed));

    // the input shows a little more than was typed
    expect(balanced.expenses).toBeGreaterThan(typed);
    expect(getExpensesInput()).toHaveValue(balanced.expenses.toFixed(2));
    expect(gridTotalText()).toBe(String(balanced.perGame));
  });

  it("does not change balanced expenses when they are entered again", async () => {
    const { user, expected } = setupGamePot();

    await enterExpenses(user, String(tenPercentOf(expected.entryFees)));
    const firstValue = (getExpensesInput() as HTMLInputElement).value;
    const firstPrizeFund = (getPrizeFundInput() as HTMLInputElement).value;

    await enterExpenses(user, firstValue);

    expect(getExpensesInput()).toHaveValue(firstValue);
    expect(getPrizeFundInput()).toHaveValue(firstPrizeFund);
  });

  it("limits expenses to the entry fees, leaving no prize fund", async () => {
    const { user, expected } = setupGamePot();

    await enterExpenses(user, String(Math.ceil(expected.entryFees) + 1000));

    expect(getExpensesInput()).toHaveValue(expected.entryFees.toFixed(2));
    expect(getPrizeFundInput()).toHaveValue("0");
    expect(queryPerGame()).toHaveValue("0");
    expect(gridTotalText()).toBe("0");
  });
});

/*****************************
 * Last Game and Series pots *
 *****************************/

describe.each(totalPrizeFundPotTypes)(
  "%s pot expenses",
  (potType) => {
    beforeEach(standardBeforeEach);

    const setupTotalPot = () => {
      const result = setup({ potType });
      expect(result.expected.isGamePot).toBe(false);
      expect(result.expected.entryFees).toBeGreaterThan(0);
      return result;
    };

    it("passes the total prize fund to the grid", async () => {
      const { user, expected } = setupTotalPot();

      const typed = tenPercentOf(expected.entryFees);
      const prizeFund =
        Math.round((expected.entryFees - typed) * 100) / 100;

      await enterExpenses(user, String(typed));

      expect(gridTotalText()).toBe(String(prizeFund));
      expect(getPrizeFundInput()).toHaveValue(String(prizeFund));
    });

    it("applies the typed expenses without moving any cents", async () => {
      const { user, expected } = setupTotalPot();

      const typed = tenPercentOf(expected.entryFees);

      await enterExpenses(user, String(typed));

      expect(getExpensesInput()).toHaveValue(typed.toFixed(2));
    });

    it("does not show the Per Game input", () => {
      setupTotalPot();

      expect(queryPerGame()).not.toBeInTheDocument();
    });

    it("limits expenses to the entry fees", async () => {
      const { user, expected } = setupTotalPot();

      await enterExpenses(user, String(Math.ceil(expected.entryFees) + 1000));

      expect(getExpensesInput()).toHaveValue(expected.entryFees.toFixed(2));
      expect(getPrizeFundInput()).toHaveValue("0");
      expect(gridTotalText()).toBe("0");
    });
  },
);

/******************
 * Expenses entry *
 ******************/

describe("Expenses entry", () => {
  beforeEach(standardBeforeEach);

  /** Expected values after applying an amount to the default pot. */
  const balancedFor = (
    expected: ReturnType<typeof setup>["expected"],
    value: number,
  ) =>
    balancePotExpenses(
      expected.entryFees,
      value,
      expected.games,
      expected.isGamePot,
    );

  /**********
   * Typing *
   **********/

  it("rejects a negative sign in the expenses input", async () => {
    const { user } = setup();

    await user.clear(getExpensesInput());
    await user.type(getExpensesInput(), "-5");

    expect(getExpensesInput()).toHaveValue("5");
  });

  it("rejects letters in the expenses input", async () => {
    const { user } = setup();

    await user.clear(getExpensesInput());
    await user.type(getExpensesInput(), "1a2b");

    expect(getExpensesInput()).toHaveValue("12");
  });

  it("rejects a second decimal point", async () => {
    const { user } = setup();

    await user.clear(getExpensesInput());
    await user.type(getExpensesInput(), "1.2.3");

    expect(getExpensesInput()).toHaveValue("1.23");
  });

  it("removes dollar signs and commas while typing", async () => {
    const { user } = setup();

    await user.clear(getExpensesInput());
    await user.type(getExpensesInput(), "$1,000");

    expect(getExpensesInput()).toHaveValue("1000");
  });

  it("does not change the prize fund until the input is left", async () => {
    const { user, expected } = setup();

    const initialPrizeFund = (getPrizeFundInput() as HTMLInputElement).value;

    await user.clear(getExpensesInput());
    await user.type(getExpensesInput(), String(tenPercentOf(expected.entryFees)));

    expect(getPrizeFundInput()).toHaveValue(initialPrizeFund);
  });

  it("arms the unsaved changes guard when expenses are typed", async () => {
    const { user } = setup();

    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);

    await user.type(getExpensesInput(), "1");

    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
  });

  /************
   * Applying *
   ************/

  it("changes an empty expenses value to zero", async () => {
    const { user, expected } = setup();

    await enterExpenses(user, "");

    // zero, plus any cents lost splitting a game pot across games
    expect(getExpensesInput()).toHaveValue(
      balancedFor(expected, 0).expenses.toFixed(2),
    );
  });

  it("changes a lone decimal point to zero", async () => {
    const { user, expected } = setup();

    await enterExpenses(user, ".");

    expect(getExpensesInput()).toHaveValue(
      balancedFor(expected, 0).expenses.toFixed(2),
    );
  });

  it("truncates expenses to two decimal places", async () => {
    const { user, expected } = setup();

    expect(expected.entryFees).toBeGreaterThanOrEqual(12.34);

    await enterExpenses(user, "12.349");

    // 12.349 is cut to 12.34 (not rounded to 12.35) before balancing
    expect(getExpensesInput()).toHaveValue(
      balancedFor(expected, 12.34).expenses.toFixed(2),
    );
  });

  it("limits expenses to the entry fees", async () => {
    const { user, expected } = setup();

    await enterExpenses(user, "999999");

    expect(getExpensesInput()).toHaveValue(expected.entryFees.toFixed(2));
    expect(getPrizeFundInput()).toHaveValue("0");
  });

  /**********
   * Cancel *
   **********/

  it("discards typed expenses when the grid's Cancel button is clicked", async () => {
    const { user, expected } = setup();

    await user.clear(getExpensesInput());
    await user.type(getExpensesInput(), String(tenPercentOf(expected.entryFees)));
    await user.click(getGridCancelButton());

    expect(getExpensesInput()).toHaveValue(expected.expenses.toFixed(2));
    expect(getPrizeFundInput()).toHaveValue(String(expected.prizeFund));
  });

  it("restores the loaded expenses after applied expenses are cancelled", async () => {
    const { user, expected } = setup();

    await enterExpenses(user, String(tenPercentOf(expected.entryFees)));
    await user.click(getGridCancelButton());

    expect(getExpensesInput()).toHaveValue(expected.expenses.toFixed(2));
    expect(getPrizeFundInput()).toHaveValue(String(expected.prizeFund));
    expect(gridTotalText()).toBe(String(expected.gridTotalPrizeFund));
  });
});
