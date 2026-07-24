import { screen } from "@testing-library/react";
import {
  setup,
  standardBeforeEach,
  queryPerGame,
} from "./potPfPage.testSetup.test";
import {
  mockTmntFullData,
  potId1,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { ptGame, ptLastGame, ptSeries } from "@/lib/validation/constants";

describe("Pot Prize Fund web page render", () => {
  beforeEach(standardBeforeEach);

  it("renders the prize fund heading", () => {
    setup();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Prize Fund",
      }),
    ).toBeInTheDocument();
  });

  it("renders the tournament name", () => {
    setup();

    expect(
      screen.getByText(mockTmntFullData.tmnt.tmnt_name),
    ).toBeInTheDocument();
  });

  it("renders the pot name", () => {
    setup({
      potName: "Mock Pot",
    });

    expect(
      screen.getByText("Mock Pot"),
    ).toBeInTheDocument();
  });

  it("renders all page inputs", () => {
    setup();

    expect(
      screen.getByLabelText("Players"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Cashers"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Entry Fees"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Expenses"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Prize Fund"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Per Game"),
    ).toBeInTheDocument();
  });

  it("renders the prize fund grid", () => {
    setup();

    expect(
      screen.getByTestId("mock-pot-prize-fund-grid"),
    ).toBeInTheDocument();
  });

  it("renders the expected number of prize fund rows", () => {
    const { populatedRows } = setup();

    expect(
      screen.getByTestId("mock-grid-row-count"),
    ).toHaveTextContent(
      String(populatedRows.length),
    );
  });

  it("passes the per-game prize fund to the grid for Game pots", () => {
    const {
      tmntData,
      potId,
    } = setup({
      potType: ptGame,
    });

    const games = tmntData.events[0]?.games ?? 0;
    const potEntryFees =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "ENTRIES" &&
          money.flow === "IN" &&
          money.pot_id === potId &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const potExpenses =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "EXPENSES" &&
          money.flow === "OUT" &&
          money.pot_id === potId &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const totalPrizeFund = potEntryFees - potExpenses;
    const expectedPerGamePrizeFund = games > 0
        ? totalPrizeFund / games
        : 0;

    expect(
      screen.getByTestId("mock-grid-total-prize-fund"),
    ).toHaveTextContent(
      String(expectedPerGamePrizeFund),
    );
  });

  it("passes the total prize fund to the grid for Last Game pots", () => {
    const {
      tmntData,
      potId,
    } = setup({
      potType: ptLastGame,
    });

    const potEntryFees =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "ENTRIES" &&
          money.flow === "IN" &&
          money.pot_id === potId &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const potExpenses =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "EXPENSES" &&
          money.flow === "OUT" &&
          money.pot_id === potId &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const totalPrizeFund = potEntryFees - potExpenses;

    expect(
      screen.getByTestId("mock-grid-total-prize-fund"),
    ).toHaveTextContent(
      String(totalPrizeFund),
    );
  });

  // it("passes the total prize fund to the grid for Series pots", () => {
  //   const {
  //     tmntData,
  //     potId,
  //   } = setup({
  //     potType: ptGame,
  //   });

  //   const potEntryFees =
  //     tmntData.moneys.find(
  //       (money) =>
  //         money.descrip === "ENTRIES" &&
  //         money.flow === "IN" &&
  //         money.pot_id === potId &&
  //         money.brkt_id === null &&
  //         money.elim_id === null,
  //     )?.amount ?? 0;
  //   const potExpenses =
  //     tmntData.moneys.find(
  //       (money) =>
  //         money.descrip === "EXPENSES" &&
  //         money.flow === "OUT" &&
  //         money.pot_id === potId &&
  //         money.brkt_id === null &&
  //         money.elim_id === null,
  //     )?.amount ?? 0;
  //   const totalPrizeFund = potEntryFees - potExpenses;

  //   // setup({
  //   //   potType: ptSeries,
  //   // });

  //   expect(
  //     screen.getByTestId("mock-grid-total-prize-fund"),
  //   ).toHaveTextContent(
  //     String(totalPrizeFund),
  //   );
  // });

  it("renders the read-only fields as disabled", () => {
    setup();

    expect(
      screen.getByLabelText("Players"),
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Entry Fees"),
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Prize Fund"),
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Per Game"),
    ).toBeDisabled();
  });

  it("renders the entry fees value", () => {
    const {
      tmntData,
    } = setup();

    const potEntryFees =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "ENTRIES" &&
          money.flow === "IN" &&
          money.pot_id === potId1 &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    
    expect(
      screen.getByLabelText("Entry Fees"),
    ).toHaveValue(String(potEntryFees));
  });

  it("renders the expenses value", () => {
    const {      
      tmntData,
    } = setup();

    const potExpenses =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "EXPENSES" &&
          money.flow === "OUT" &&
          money.pot_id === potId1 &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;

    expect(
      screen.getByLabelText("Expenses"),
    ).toHaveValue(String(potExpenses.toFixed(2)));
  });

  it("renders the prize fund value", () => {
    const {
      tmntData,
      potId,
    } = setup({
      potType: ptGame,
    });

    const games = tmntData.events[0]?.games ?? 0;
    const potEntryFees =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "ENTRIES" &&
          money.flow === "IN" &&
          money.pot_id === potId &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const potExpenses =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "EXPENSES" &&
          money.flow === "OUT" &&
          money.pot_id === potId &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const totalPrizeFund = potEntryFees - potExpenses;

    expect(
      screen.getByLabelText("Prize Fund"),
    ).toHaveValue(String(totalPrizeFund));
  });

  it("renders the per-game value for Game pots", () => {
    const {
      tmntData,
      potId,
    } = setup({
      potType: ptGame,
    });

    const games = tmntData.events[0]?.games ?? 0;
    const potEntryFees =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "ENTRIES" &&
          money.flow === "IN" &&
          money.pot_id === potId &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const potExpenses =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "EXPENSES" &&
          money.flow === "OUT" &&
          money.pot_id === potId &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const totalPrizeFund = potEntryFees - potExpenses;
    const expectedPerGamePrizeFund = games > 0
        ? totalPrizeFund / games
        : 0;

    expect(
      screen.getByLabelText("Per Game"),
    ).toHaveValue(String(expectedPerGamePrizeFund));
  });

  it("does not render the Per Game field for Last Game pots", () => {
    setup({
      potType: ptLastGame,
    });

    expect(queryPerGame()).not.toBeInTheDocument();
  });

  it("does not render the Per Game field for Series pots", () => {
    setup({
      potType: ptSeries,
    });

    expect(queryPerGame()).not.toBeInTheDocument();
  });

  it("does not display the loading modal after loading completes", () => {
    setup();

    expect(
      screen.queryByRole("status"),
    ).not.toBeInTheDocument();
  });
});