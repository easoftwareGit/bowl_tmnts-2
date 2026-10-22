import { screen } from "@testing-library/react";
import {
  getCashersError,
  getCashersInput,
  getExpensesInput,
  getPrizeFundInput,
  mockGetPotName,
  queryPerGame,
  setup,
  standardBeforeEach,
} from "./potPfPage.testSetup.test";
import {
  mockTmntFullData,
  potId1,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { ptGame, ptLastGame, ptSeries } from "@/lib/validation/constants";

/**
 * Pot types that pay the whole prize fund once.
 *
 * "as const" keeps each constant's literal type. Without it, TypeScript
 * widens the array to string[], which setup()'s potType option rejects.
 */
const totalPrizeFundPotTypes = [ptLastGame, ptSeries] as const;

const differentTmntData = {
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "different-tmnt-id" },
};

/** The grid total passed to the mocked grid, as text. */
const gridTotalText = (): string | null =>
  screen.getByTestId("mock-grid-total-prize-fund").textContent;

describe("Pot Prize Fund web page render", () => {
  beforeEach(standardBeforeEach);

  /************
   * Headings *
   ************/

  describe("headings", () => {
    it("renders the prize fund heading", () => {
      setup();

      expect(
        screen.getByRole("heading", { level: 2, name: "Prize Fund" }),
      ).toBeInTheDocument();
    });

    it("renders the tournament name", () => {
      setup();

      expect(screen.getByText(mockTmntFullData.tmnt.tmnt_name))
        .toBeInTheDocument();
    });

    it("renders the pot name", () => {
      setup({ potName: "Mock Pot" });

      expect(screen.getByText("Mock Pot")).toBeInTheDocument();
    });

    it("gets the pot name from the current pot and the tournament divisions", () => {
      const { tmntData } = setup();

      expect(mockGetPotName).toHaveBeenCalledWith(
        expect.objectContaining({ id: potId1 }),
        tmntData.divs,
      );
    });
  });

  /**********
   * Inputs *
   **********/

  describe("inputs", () => {
    it("renders all page inputs", () => {
      setup({ potType: ptGame });

      expect(screen.getByLabelText("Players")).toBeInTheDocument();
      expect(getCashersInput()).toBeInTheDocument();
      expect(screen.getByLabelText("Entry Fees")).toBeInTheDocument();
      expect(getExpensesInput()).toBeInTheDocument();
      expect(getPrizeFundInput()).toBeInTheDocument();
      expect(queryPerGame()).toBeInTheDocument();
    });

    it("renders the read-only fields as disabled", () => {
      setup({ potType: ptGame });

      expect(screen.getByLabelText("Players")).toBeDisabled();
      expect(screen.getByLabelText("Entry Fees")).toBeDisabled();
      expect(getPrizeFundInput()).toBeDisabled();
      expect(queryPerGame()).toBeDisabled();
    });

    it("renders the editable fields as enabled", () => {
      setup();

      expect(getCashersInput()).toBeEnabled();
      expect(getExpensesInput()).toBeEnabled();
    });

    it("renders the cashers input as a whole-number input limited to the pot's players", () => {
      const { expected } = setup();

      const cashersInput = getCashersInput();

      expect(cashersInput).toHaveAttribute("type", "number");
      expect(cashersInput).toHaveAttribute("step", "1");
      expect(cashersInput).toHaveAttribute("min", "1");
      expect(cashersInput).toHaveAttribute(
        "max",
        String(expected.numPlayers === 0 ? 1 : expected.numPlayers),
      );
    });

    it("renders an empty cashers error", () => {
      setup();

      expect(getCashersError()).toBeInTheDocument();
      expect(getCashersError()).toHaveTextContent("");
    });

    it("renders the Per Game field for Game pots", () => {
      setup({ potType: ptGame });

      expect(queryPerGame()).toBeInTheDocument();
    });

    it.each(totalPrizeFundPotTypes)(
      "does not render the Per Game field for %s pots",
      (potType) => {
        setup({ potType });

        expect(queryPerGame()).not.toBeInTheDocument();
      },
    );
  });

  /**********
   * Values *
   **********/

  describe("values", () => {
    it("renders the players value", () => {
      const { expected } = setup();

      expect(screen.getByLabelText("Players")).toHaveValue(expected.numPlayers);
    });

    it("renders the cashers value", () => {
      const { expected } = setup();

      expect(getCashersInput()).toHaveValue(expected.numCashers);
    });

    it("renders the entry fees value", () => {
      const { expected } = setup();

      expect(screen.getByLabelText("Entry Fees"))
        .toHaveValue(String(expected.entryFees));
    });

    it("renders the expenses value with two decimals", () => {
      const { expected } = setup();

      expect(getExpensesInput()).toHaveValue(expected.expenses.toFixed(2));
    });

    it("renders the prize fund value", () => {
      const { expected } = setup({ potType: ptGame });

      expect(getPrizeFundInput()).toHaveValue(String(expected.prizeFund));
    });

    it("renders the per-game value for Game pots", () => {
      const { expected } = setup({ potType: ptGame });

      expect(queryPerGame()).toHaveValue(String(expected.perGame));
    });
  });

  /********
   * Grid *
   ********/

  describe("grid", () => {
    it("renders the prize fund grid", () => {
      setup();

      expect(screen.getByTestId("mock-pot-prize-fund-grid")).toBeInTheDocument();
    });

    it("renders the expected number of prize fund rows", () => {
      const { populatedRows } = setup();

      expect(screen.getByTestId("mock-grid-row-count"))
        .toHaveTextContent(String(populatedRows.length));
    });

    it("passes the per-game prize fund to the grid for Game pots", () => {
      const { expected } = setup({ potType: ptGame });

      expect(gridTotalText()).toBe(String(expected.perGame));
    });

    it.each(totalPrizeFundPotTypes)(
      "passes the total prize fund to the grid for %s pots",
      (potType) => {
        const { expected } = setup({ potType });

        expect(gridTotalText()).toBe(String(expected.prizeFund));
      },
    );

    it("renders the grid with no unsaved changes", () => {
      setup();

      expect(screen.getByTestId("mock-grid-data-was-changed"))
        .toHaveTextContent("false");
    });

    it("does not show the remove-cashers dialog", () => {
      setup();

      expect(
        screen.queryByRole("dialog", { name: "confirm-modal" }),
      ).not.toBeInTheDocument();
    });
  });

  /*****************
   * Loading modal *
   *****************/

  describe("loading modal", () => {
    it("does not display the loading modal after loading completes", () => {
      setup();

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("displays the loading modal while pot prize funds are loading", () => {
      setup({ potPfsLoadStatus: "loading" });

      expect(screen.getByRole("status")).toHaveTextContent("Loading...");
    });

    it("displays the loading modal while a different tournament's data is being replaced", () => {
      setup({ tmntData: differentTmntData, tmntLoadStatus: "loading" });

      expect(screen.getByRole("status")).toHaveTextContent("Loading...");
    });

    it("does not display the loading modal when the correct tournament is already loaded", () => {
      // the tournament is reloading, but the page already has its data
      setup({ tmntLoadStatus: "loading" });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  /**********
   * Errors *
   **********/

  describe("errors", () => {
    it("displays the pot prize fund error when loading fails", () => {
      setup({ potPfsLoadStatus: "failed", potPfsError: "Pot load failed" });

      expect(screen.getByText("Error: Pot load failed")).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Prize Fund" }))
        .not.toBeInTheDocument();
    });

    it("displays the tournament error when loading fails", () => {
      setup({ tmntLoadStatus: "failed", tmntError: "Tmnt load failed" });

      expect(screen.getByText("Error: Tmnt load failed")).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Prize Fund" }))
        .not.toBeInTheDocument();
    });

    it("does not display a pot prize fund error while loading", () => {
      setup({ potPfsLoadStatus: "loading", potPfsError: "Pot load failed" });

      expect(screen.queryByText(/Pot load failed/)).not.toBeInTheDocument();
    });

    it("does not display a pot prize fund error after loading succeeds", () => {
      setup({ potPfsError: "Old pot error" });

      expect(screen.queryByText(/Old pot error/)).not.toBeInTheDocument();
    });

    it("does not display a tournament error while loading", () => {
      setup({
        tmntData: differentTmntData,
        tmntLoadStatus: "loading",
        tmntError: "Tmnt load failed",
      });

      expect(screen.queryByText(/Tmnt load failed/)).not.toBeInTheDocument();
    });

    it("does not display an error when the failed status has no message", () => {
      setup({ potPfsLoadStatus: "failed", potPfsError: null });

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });
});

// import { screen } from "@testing-library/react";
// import {
//   setup,
//   standardBeforeEach,
//   queryPerGame,
// } from "./potPfPage.testSetup.test";
// import {
//   mockTmntFullData,
//   potId1,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { ptGame, ptLastGame, ptSeries } from "@/lib/validation/constants";

// describe("Pot Prize Fund web page render", () => {
//   beforeEach(standardBeforeEach);

//   it("renders the prize fund heading", () => {
//     setup();

//     expect(
//       screen.getByRole("heading", {
//         level: 2,
//         name: "Prize Fund",
//       }),
//     ).toBeInTheDocument();
//   });

//   it("renders the tournament name", () => {
//     setup();

//     expect(
//       screen.getByText(mockTmntFullData.tmnt.tmnt_name),
//     ).toBeInTheDocument();
//   });

//   it("renders the pot name", () => {
//     setup({
//       potName: "Mock Pot",
//     });

//     expect(
//       screen.getByText("Mock Pot"),
//     ).toBeInTheDocument();
//   });

//   it("renders all page inputs", () => {
//     setup();

//     expect(
//       screen.getByLabelText("Players"),
//     ).toBeInTheDocument();

//     expect(
//       screen.getByLabelText("Cashers"),
//     ).toBeInTheDocument();

//     expect(
//       screen.getByLabelText("Entry Fees"),
//     ).toBeInTheDocument();

//     expect(
//       screen.getByLabelText("Expenses"),
//     ).toBeInTheDocument();

//     expect(
//       screen.getByLabelText("Prize Fund"),
//     ).toBeInTheDocument();

//     expect(
//       screen.getByLabelText("Per Game"),
//     ).toBeInTheDocument();
//   });

//   it("renders the prize fund grid", () => {
//     setup();

//     expect(
//       screen.getByTestId("mock-pot-prize-fund-grid"),
//     ).toBeInTheDocument();
//   });

//   it("renders the expected number of prize fund rows", () => {
//     const { populatedRows } = setup();

//     expect(
//       screen.getByTestId("mock-grid-row-count"),
//     ).toHaveTextContent(
//       String(populatedRows.length),
//     );
//   });

//   it("passes the per-game prize fund to the grid for Game pots", () => {
//     const {
//       tmntData,
//       potId,
//     } = setup({
//       potType: ptGame,
//     });

//     const games = tmntData.events[0]?.games ?? 0;
//     const potEntryFees =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "ENTRIES" &&
//           money.flow === "IN" &&
//           money.pot_id === potId &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
//     const potExpenses =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "EXPENSES" &&
//           money.flow === "OUT" &&
//           money.pot_id === potId &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
//     const totalPrizeFund = potEntryFees - potExpenses;
//     const expectedPerGamePrizeFund = games > 0
//         ? totalPrizeFund / games
//         : 0;

//     expect(
//       screen.getByTestId("mock-grid-total-prize-fund"),
//     ).toHaveTextContent(
//       String(expectedPerGamePrizeFund),
//     );
//   });

//   it("passes the total prize fund to the grid for Last Game pots", () => {
//     const {
//       tmntData,
//       potId,
//     } = setup({
//       potType: ptLastGame,
//     });

//     const potEntryFees =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "ENTRIES" &&
//           money.flow === "IN" &&
//           money.pot_id === potId &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
//     const potExpenses =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "EXPENSES" &&
//           money.flow === "OUT" &&
//           money.pot_id === potId &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
//     const totalPrizeFund = potEntryFees - potExpenses;

//     expect(
//       screen.getByTestId("mock-grid-total-prize-fund"),
//     ).toHaveTextContent(
//       String(totalPrizeFund),
//     );
//   });

//   // it("passes the total prize fund to the grid for Series pots", () => {
//   //   const {
//   //     tmntData,
//   //     potId,
//   //   } = setup({
//   //     potType: ptGame,
//   //   });

//   //   const potEntryFees =
//   //     tmntData.moneys.find(
//   //       (money) =>
//   //         money.descrip === "ENTRIES" &&
//   //         money.flow === "IN" &&
//   //         money.pot_id === potId &&
//   //         money.brkt_id === null &&
//   //         money.elim_id === null,
//   //     )?.amount ?? 0;
//   //   const potExpenses =
//   //     tmntData.moneys.find(
//   //       (money) =>
//   //         money.descrip === "EXPENSES" &&
//   //         money.flow === "OUT" &&
//   //         money.pot_id === potId &&
//   //         money.brkt_id === null &&
//   //         money.elim_id === null,
//   //     )?.amount ?? 0;
//   //   const totalPrizeFund = potEntryFees - potExpenses;

//   //   // setup({
//   //   //   potType: ptSeries,
//   //   // });

//   //   expect(
//   //     screen.getByTestId("mock-grid-total-prize-fund"),
//   //   ).toHaveTextContent(
//   //     String(totalPrizeFund),
//   //   );
//   // });

//   it("renders the read-only fields as disabled", () => {
//     setup();

//     expect(
//       screen.getByLabelText("Players"),
//     ).toBeDisabled();

//     expect(
//       screen.getByLabelText("Entry Fees"),
//     ).toBeDisabled();

//     expect(
//       screen.getByLabelText("Prize Fund"),
//     ).toBeDisabled();

//     expect(
//       screen.getByLabelText("Per Game"),
//     ).toBeDisabled();
//   });

//   it("renders the entry fees value", () => {
//     const {
//       tmntData,
//     } = setup();

//     const potEntryFees =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "ENTRIES" &&
//           money.flow === "IN" &&
//           money.pot_id === potId1 &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
    
//     expect(
//       screen.getByLabelText("Entry Fees"),
//     ).toHaveValue(String(potEntryFees));
//   });

//   it("renders the expenses value", () => {
//     const {
//       tmntData,
//     } = setup();

//     const potExpenses =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "EXPENSES" &&
//           money.flow === "OUT" &&
//           money.pot_id === potId1 &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;

//     expect(
//       screen.getByLabelText("Expenses"),
//     ).toHaveValue(String(potExpenses.toFixed(2)));
//   });

//   it("renders the prize fund value", () => {
//     const {
//       tmntData,
//       potId,
//     } = setup({
//       potType: ptGame,
//     });

//     const games = tmntData.events[0]?.games ?? 0;
//     const potEntryFees =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "ENTRIES" &&
//           money.flow === "IN" &&
//           money.pot_id === potId &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
//     const potExpenses =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "EXPENSES" &&
//           money.flow === "OUT" &&
//           money.pot_id === potId &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
//     const totalPrizeFund = potEntryFees - potExpenses;

//     expect(
//       screen.getByLabelText("Prize Fund"),
//     ).toHaveValue(String(totalPrizeFund));
//   });

//   it("renders the per-game value for Game pots", () => {
//     const {
//       tmntData,
//       potId,
//     } = setup({
//       potType: ptGame,
//     });

//     const games = tmntData.events[0]?.games ?? 0;
//     const potEntryFees =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "ENTRIES" &&
//           money.flow === "IN" &&
//           money.pot_id === potId &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
//     const potExpenses =
//       tmntData.moneys.find(
//         (money) =>
//           money.descrip === "EXPENSES" &&
//           money.flow === "OUT" &&
//           money.pot_id === potId &&
//           money.brkt_id === null &&
//           money.elim_id === null,
//       )?.amount ?? 0;
//     const totalPrizeFund = potEntryFees - potExpenses;
//     const expectedPerGamePrizeFund = games > 0
//         ? totalPrizeFund / games
//         : 0;

//     expect(
//       screen.getByLabelText("Per Game"),
//     ).toHaveValue(String(expectedPerGamePrizeFund));
//   });

//   it("does not render the Per Game field for Last Game pots", () => {
//     setup({
//       potType: ptLastGame,
//     });

//     expect(queryPerGame()).not.toBeInTheDocument();
//   });

//   it("does not render the Per Game field for Series pots", () => {
//     setup({
//       potType: ptSeries,
//     });

//     expect(queryPerGame()).not.toBeInTheDocument();
//   });

//   it("does not display the loading modal after loading completes", () => {
//     setup();

//     expect(
//       screen.queryByRole("status"),
//     ).not.toBeInTheDocument();
//   });
// });

