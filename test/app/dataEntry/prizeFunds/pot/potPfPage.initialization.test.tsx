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
  mockPotPfs,
  mockPot1PerGamePrizeFund,
  mockPot1PrizeFund,
  mockTmntFullData,
  potId1,
  potId2,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

import {
  ptGame,
  ptLastGame,
  ptSeries,
} from "@/lib/validation/constants";

const mockPot1EntryFees =
  mockTmntFullData.moneys.find(
    (money) =>
      money.descrip === "ENTRIES" &&
      money.flow === "IN" &&
      money.pot_id === potId1 &&
      money.brkt_id === null &&
      money.elim_id === null,
  )?.amount ?? 0;
const mockPot1Expenses =
  mockTmntFullData.moneys.find(
    (money) =>
      money.descrip === "EXPENSES" &&
      money.flow === "OUT" &&
      money.pot_id === potId1 &&
      money.brkt_id === null &&
      money.elim_id === null,
  )?.amount ?? 0;

describe("Pot Prize Fund web page initialization", () => {
  beforeEach(standardBeforeEach);

  it("converts the pot prize funds and initializes the grid rows", async () => {
    const {
      potPfs,
      tmntData,
      prizeFunds,
      populatedRows,
    } = setup();

    expect(
      mockPotPfsToPrizeFunds,
    ).toHaveBeenCalledWith(potPfs);

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
      potPfs.length,
    );

    await waitFor(() => {
      expect(
        getLatestGridProps()?.rows,
      ).toEqual(populatedRows);
    });
  });

  it("initializes the editable controls", async () => {
    const {
      potPfs,
      tmntData,
    } = setup();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Cashers"),
      ).toHaveValue(potPfs.length);
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