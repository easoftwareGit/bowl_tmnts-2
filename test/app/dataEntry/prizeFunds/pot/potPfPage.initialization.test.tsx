import { screen, waitFor } from "@testing-library/react";
import cloneDeep from "lodash/cloneDeep";
import type { potPfType, tmntFullType } from "@/lib/types/types";
import {
  getCashersError,
  getCashersInput,
  getExpensesInput,
  getLatestGridProps,
  getPrizeFundInput,
  makePotPfsForPot,
  mockPopulatePfRows,
  mockPotPfsToPrizeFunds,
  mockUseUnsavedChangesGuard,
  queryPerGame,
  setup,
  standardBeforeEach,
} from "./potPfPage.testSetup.test";
import {
  mockPotPfs,
  mockTmntFullData,
  potId1,
  potId2,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { ptGame, ptLastGame } from "@/lib/validation/constants";

/*******************
 * Test data makers *
 *******************/

/**
 * Returns a copy of the mock tournament with known money amounts for potId,
 * so the expected values can be worked out by hand.
 *
 * @param fees - the pot's ENTRIES amount
 * @param expensesRecord - the pot's EXPENSES amount
 * @param games - games in the event
 */
const makeTmntData = ({
  potId,
  fees,
  expensesRecord,
  games,
}: {
  potId: string;
  fees: number;
  expensesRecord: number;
  games: number;
}): tmntFullType => {
  const tmntData = cloneDeep(mockTmntFullData);

  const isPotMoney = (
    money: tmntFullType["moneys"][number],
    descrip: string,
    flow: string,
  ) =>
    money.descrip === descrip &&
    money.flow === flow &&
    money.pot_id === potId &&
    money.brkt_id === null &&
    money.elim_id === null;

  const entries = tmntData.moneys.find((m) => isPotMoney(m, "ENTRIES", "IN"));
  const expenses = tmntData.moneys.find((m) => isPotMoney(m, "EXPENSES", "OUT"));

  // the mock data needs both money records for this pot
  expect(entries).toBeDefined();
  expect(expenses).toBeDefined();

  entries!.amount = fees;
  expenses!.amount = expensesRecord;
  tmntData.events[0].games = games;

  return tmntData;
};

/**
 * Returns saved prize-fund rows for potId with the given amounts.
 * Rows for other pots in the mock data are kept.
 */
const makeSavedPotPfs = (
  potId: string,
  amounts: number[],
): potPfType[] => {
  expect(mockPotPfs.length).toBeGreaterThanOrEqual(amounts.length);

  const thisPot = makePotPfsForPot(potId, mockPotPfs)
    .slice(0, amounts.length)
    .map((pf, i) => ({
      ...pf,
      id: `ppf_test_${i + 1}`,
      position: i + 1,
      amount: amounts[i],
    }));

  const otherPots = mockPotPfs.filter((pf) => pf.pot_id !== potId);

  return [...otherPots, ...thisPot];
};

describe("Pot Prize Fund web page initialization", () => {
  beforeEach(standardBeforeEach);

  /*********************
   * Rows and the grid *
   *********************/

  describe("rows", () => {
    it("filters the tournament pot prize funds and initializes the grid with the current pot", async () => {
      const {
        potPfs,
        currentPotPfs,
        prizeFunds,
        populatedRows,
        expected,
      } = setup();

      /*
       * Sanity check that this test really contains tournament-level
       * prize-fund data rather than only the current pot.
       */
      expect(potPfs.length).toBeGreaterThan(currentPotPfs.length);
      expect(currentPotPfs.every((pf) => pf.pot_id === potId1)).toBe(true);

      // only the current pot's prize funds are converted
      expect(mockPotPfsToPrizeFunds).toHaveBeenCalledWith(currentPotPfs);

      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        prizeFunds,
        potId1,
        expected.gridTotalPrizeFund,
        currentPotPfs.length,
      );

      await waitFor(() => {
        expect(getLatestGridProps()?.rows).toEqual(populatedRows);
      });
    });

    it("renders the mocked prize fund grid with the initialized rows", async () => {
      const { populatedRows } = setup();

      await waitFor(() => {
        expect(screen.getByTestId("mock-grid-row-count"))
          .toHaveTextContent(String(populatedRows.length));
      });
    });

    it("initializes when pot prize funds were loaded for the route tournament", () => {
      const { currentPotPfs } = setup({
        potPfsRequestedTmntId: undefined,
      });

      expect(mockPotPfsToPrizeFunds).toHaveBeenCalledWith(currentPotPfs);
      expect(mockPopulatePfRows).toHaveBeenCalled();
    });

    it("does not initialize when pot prize funds were loaded for a different tournament", () => {
      setup({ potPfsRequestedTmntId: "tmt_00000000000000000000000000000099" });

      expect(mockPotPfsToPrizeFunds).not.toHaveBeenCalled();
      expect(mockPopulatePfRows).not.toHaveBeenCalled();
      expect(screen.queryByTestId("mock-pot-prize-fund-grid"))
        .not.toBeInTheDocument();
    });

    it("does not initialize while pot prize funds are loading", () => {
      setup({ potPfsLoadStatus: "loading" });

      expect(mockPopulatePfRows).not.toHaveBeenCalled();
    });

    it("does not initialize when a different tournament is loaded", () => {
      setup({
        tmntData: {
          ...mockTmntFullData,
          tmnt: { ...mockTmntFullData.tmnt, id: "different-tmnt-id" },
        },
      });

      expect(mockPopulatePfRows).not.toHaveBeenCalled();
    });

    it("initializes only once, even as the page re-renders", async () => {
      const { user } = setup();

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);

      // typing re-renders the page several times
      await user.type(getExpensesInput(), "1");
      await user.tab();

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
      expect(mockPotPfsToPrizeFunds).toHaveBeenCalledTimes(1);
    });
  });

  /********************
   * Page input values *
   ********************/

  describe("page inputs", () => {
    it("initializes the editable controls", async () => {
      const { currentPotPfs, expected } = setup();

      await waitFor(() => {
        expect(getCashersInput()).toHaveValue(currentPotPfs.length);
      });

      expect(screen.getByLabelText("Players")).toHaveValue(expected.numPlayers);
      expect(screen.getByLabelText("Entry Fees"))
        .toHaveValue(String(expected.entryFees));
      expect(getExpensesInput()).toHaveValue(expected.expenses.toFixed(2));
      expect(getPrizeFundInput()).toHaveValue(String(expected.prizeFund));
      expect(queryPerGame()).toHaveValue(String(expected.perGame));
    });

    it("starts with no cashers error and no unsaved changes", () => {
      setup();

      expect(getCashersError()).toHaveTextContent("");
      expect(getLatestGridProps()?.gridDataWasChanged).toBe(false);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("shows the Per Game field for Game pots", () => {
      setup({ potType: ptGame });

      expect(queryPerGame()).toBeInTheDocument();
    });

    it("does not show the Per Game field for Last Game pots", () => {
      setup({ potType: ptLastGame });

      expect(queryPerGame()).not.toBeInTheDocument();
    });
  });

  /****************************************
   * Expenses and prize fund, by hand      *
   *                                      *
   * These use known amounts so the       *
   * expected values do not depend on the *
   * setup file's helper.                 *
   ****************************************/

  describe("expenses and prize fund for a Game pot", () => {
    it("works out expenses from the saved per-game rows", () => {
      // fees 1000, 3 games, saved rows pay 200 + 100 = 300 per game
      // payout 300 * 3 = 900, so expenses 100
      setup({
        potType: ptGame,
        tmntData: makeTmntData({
          potId: potId1,
          fees: 1000,
          expensesRecord: 555, // ignored when there are saved rows
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId1, [200, 100]),
      });

      expect(getExpensesInput()).toHaveValue("100.00");
      expect(getPrizeFundInput()).toHaveValue("900");
      expect(queryPerGame()).toHaveValue("300");
      expect(getLatestGridProps()?.totalPrizeFund).toBe(300);
      expect(getCashersInput()).toHaveValue(2);
    });

    it("passes the per-game prize fund to populatePfRows", () => {
      setup({
        potType: ptGame,
        tmntData: makeTmntData({
          potId: potId1,
          fees: 1000,
          expensesRecord: 0,
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId1, [200, 100]),
      });

      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        expect.anything(),
        potId1,
        300,
        2,
      );
    });

    it("uses the EXPENSES record when there are no saved rows", () => {
      // fees 1000, expenses 100, 3 games: 900 / 3 = 300 per game
      setup({
        potType: ptGame,
        tmntData: makeTmntData({
          potId: potId1,
          fees: 1000,
          expensesRecord: 100,
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId1, []),
      });

      expect(getExpensesInput()).toHaveValue("100.00");
      expect(getPrizeFundInput()).toHaveValue("900");
      expect(queryPerGame()).toHaveValue("300");
      expect(getCashersInput()).toHaveValue(0);
    });

    it("moves the cents lost when splitting across games into expenses", () => {
      // fees 100, expenses 0, 3 games: 33.33 per game, 99.99 prize fund
      setup({
        potType: ptGame,
        tmntData: makeTmntData({
          potId: potId1,
          fees: 100,
          expensesRecord: 0,
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId1, []),
      });

      expect(getExpensesInput()).toHaveValue("0.01");
      expect(getPrizeFundInput()).toHaveValue("99.99");
      expect(queryPerGame()).toHaveValue("33.33");
      expect(getLatestGridProps()?.totalPrizeFund).toBe(33.33);
    });

    it("reloads balanced saved rows without changing expenses", () => {
      // the 33.33-per-game result above, saved and loaded again
      setup({
        potType: ptGame,
        tmntData: makeTmntData({
          potId: potId1,
          fees: 100,
          expensesRecord: 0,
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId1, [20, 13.33]),
      });

      expect(getExpensesInput()).toHaveValue("0.01");
      expect(getPrizeFundInput()).toHaveValue("99.99");
      expect(queryPerGame()).toHaveValue("33.33");
    });
  });

  describe("expenses and prize fund for a Last Game pot", () => {
    it("works out expenses from the saved rows", () => {
      // fees 1000, saved rows pay 200 + 100 = 300 once, so expenses 700
      setup({
        potId: potId2,
        potType: ptLastGame,
        tmntData: makeTmntData({
          potId: potId2,
          fees: 1000,
          expensesRecord: 555, // ignored when there are saved rows
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId2, [200, 100]),
      });

      expect(getExpensesInput()).toHaveValue("700.00");
      expect(getPrizeFundInput()).toHaveValue("300");
      expect(getLatestGridProps()?.totalPrizeFund).toBe(300);
    });

    it("uses the EXPENSES record when there are no saved rows", () => {
      setup({
        potId: potId2,
        potType: ptLastGame,
        tmntData: makeTmntData({
          potId: potId2,
          fees: 1000,
          expensesRecord: 50,
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId2, []),
      });

      expect(getExpensesInput()).toHaveValue("50.00");
      expect(getPrizeFundInput()).toHaveValue("950");
      expect(getLatestGridProps()?.totalPrizeFund).toBe(950);
    });

    it("does not move cents into expenses", () => {
      setup({
        potId: potId2,
        potType: ptLastGame,
        tmntData: makeTmntData({
          potId: potId2,
          fees: 100,
          expensesRecord: 0,
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId2, []),
      });

      expect(getExpensesInput()).toHaveValue("0.00");
      expect(getPrizeFundInput()).toHaveValue("100");
    });
  });

  describe("out-of-range money data", () => {
    it("limits an EXPENSES record larger than the fees to the fees", () => {
      setup({
        potId: potId2,
        potType: ptLastGame,
        tmntData: makeTmntData({
          potId: potId2,
          fees: 100,
          expensesRecord: 250,
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId2, []),
      });

      expect(getExpensesInput()).toHaveValue("100.00");
      expect(getPrizeFundInput()).toHaveValue("0");
    });

    it("uses zero expenses when the saved rows pay more than the fees", () => {
      setup({
        potId: potId2,
        potType: ptLastGame,
        tmntData: makeTmntData({
          potId: potId2,
          fees: 100,
          expensesRecord: 0,
          games: 3,
        }),
        potPfs: makeSavedPotPfs(potId2, [80, 60]),
      });

      expect(getExpensesInput()).toHaveValue("0.00");
      expect(getPrizeFundInput()).toHaveValue("100");
    });
  });
});
