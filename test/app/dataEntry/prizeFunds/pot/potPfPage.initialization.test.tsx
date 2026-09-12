"use client";

import { screen, waitFor } from "@testing-library/react";
import {
  getLatestGridProps,
  mockPopulatePfRows,
  mockPotPfsToPrizeFunds,
  queryPerGame,
  setup,
  standardBeforeEach,
} from "./potPfPage.testSetup.test";
import {
  mockTmntFullData,
  potId1,
  potId2,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { ptGame, ptLastGame } from "@/lib/validation/constants";

describe("Pot Prize Fund web page initialization", () => {
  beforeEach(standardBeforeEach);

  it("filters the tournament pot prize funds and initializes the grid with the current pot", async () => {
    const {
      potPfs,
      currentPotPfs,
      tmntData,
      prizeFunds,
      populatedRows,
    } = setup();

    /*
    * Sanity check that this test really contains tournament-level
    * prize-fund data rather than only the current pot.
    */
    expect(potPfs.length).toBeGreaterThan(
      currentPotPfs.length,
    );

    expect(
      currentPotPfs.every(
        (potPf) => potPf.pot_id === potId1,
      ),
    ).toBe(true);

    /*
    * Only the current pot's prize funds should be converted.
    */
    expect(
      mockPotPfsToPrizeFunds,
    ).toHaveBeenCalledWith(currentPotPfs);

    const games =
      tmntData.events[0].games;

    const potPrizeFund =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "PRIZEFUND" &&
          money.flow === "OUT" &&
          money.pot_id === potId1 &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;

    const expectedPerGamePrizeFund =
      games > 0
        ? potPrizeFund / games
        : 0;

    expect(
      mockPopulatePfRows,
    ).toHaveBeenCalledWith(
      prizeFunds,
      potId1,
      expectedPerGamePrizeFund,
      currentPotPfs.length,
    );

    await waitFor(() => {
      expect(
        getLatestGridProps()?.rows,
      ).toEqual(populatedRows);
    });
  });

  it("converts the pot prize funds and initializes the grid rows", async () => {
    const {
      currentPotPfs,
      tmntData,
      prizeFunds,
      populatedRows,
    } = setup();

    expect(mockPotPfsToPrizeFunds).toHaveBeenCalledWith(currentPotPfs);

    const games =
      tmntData.events[0].games;

    const potPrizeFund =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "PRIZEFUND" &&
          money.flow === "OUT" &&
          money.pot_id === potId1 &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;

    const expectedPerGamePrizeFund =
      games > 0
        ? potPrizeFund / games
        : 0;

    expect(
      mockPopulatePfRows,
    ).toHaveBeenCalledWith(
      prizeFunds,
      potId1,
      expectedPerGamePrizeFund,
      currentPotPfs.length,
    );

    await waitFor(() => {
      expect(
        getLatestGridProps()?.rows,
      ).toEqual(populatedRows);
    });
  });

  it("initializes the editable controls", async () => {
    const {
      currentPotPfs,
      tmntData,
    } = setup();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Cashers"),
      ).toHaveValue(currentPotPfs.length);
    });
    
    const games = tmntData.events[0]?.games ?? 0;
    const potEntryFees =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "ENTRIES" &&
          money.flow === "IN" &&
          money.pot_id === potId1 &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const potExpenses =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "EXPENSES" &&
          money.flow === "OUT" &&
          money.pot_id === potId1 &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;
    const totalPrizeFund = potEntryFees - potExpenses;
    const perGamePrizeFund = games > 0
        ? totalPrizeFund / games
        : 0;

    expect(
      screen.getByLabelText("Entry Fees"),
    ).toHaveValue(
      potEntryFees.toString(),
    );

    expect(
      screen.getByLabelText("Expenses"),
    ).toHaveValue(
      potExpenses.toFixed(2),
    );

    expect(
      screen.getByLabelText("Prize Fund"),
    ).toHaveValue(
      totalPrizeFund.toString(),
    );

    expect(
      screen.getByLabelText("Per Game"),
    ).toHaveValue(
      perGamePrizeFund.toString(),
    );
  });

  it("passes the per-game prize fund to the grid for Game pots", async () => {
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

    await waitFor(() => {
      expect(
        getLatestGridProps()?.totalPrizeFund,
      ).toBe(expectedPerGamePrizeFund);
    });
  });

  it("passes the total prize fund to the grid for Last Game pots", async () => {
    const {
      tmntData,
      potId,
    } = setup({
      potId: potId2,
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
    const expectedTotalPrizeFund = potEntryFees - potExpenses;

    await waitFor(() => {
      expect(
        getLatestGridProps()?.totalPrizeFund,
      ).toBe(expectedTotalPrizeFund);
    });
  });

  it("shows the Per Game field for Game pots", () => {
    setup({ potType: ptGame });

    expect(queryPerGame()).toBeInTheDocument();
  });

  it("does not show the Per Game field for Last Game pots", () => {
    setup({ potType: ptLastGame });

    expect(queryPerGame()).not.toBeInTheDocument();
  });

  it("renders the mocked prize fund grid with the initialized rows", async () => {
    const { populatedRows } = setup();

    await waitFor(() => {
      expect(
        screen.getByTestId("mock-grid-row-count"),
      ).toHaveTextContent(
        String(populatedRows.length),
      );
    });
  });
});