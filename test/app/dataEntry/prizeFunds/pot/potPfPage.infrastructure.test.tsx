"use client";

import { screen } from "@testing-library/react";
import {
  getLatestGridProps,
  makePotPfsForDifferentPot,
  makePotPfsForPot,
  mockDispatch,
  mockFetchPotPfs,
  mockFetchTmntFullData,
  setup,
  standardBeforeEach,
} from "./potPfPage.testSetup.test";
import {
  mockPotPfs,
  mockTmntFullData,
  potId1,
  potId2,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Pot Prize Fund web page infrastructure", () => {
  beforeEach(standardBeforeEach);

  it("renders the page", () => {
    setup();

    expect(
      screen.getByRole("heading", {
        name: "Prize Fund",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("mock-pot-prize-fund-grid"),
    ).toBeInTheDocument();
  });

  it("passes the expected props to PotPrizeFundGrid", () => {
    const { tmntData } = setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();
    expect(props?.enableEditing).toBe(true);
    expect(props?.potId).toBe(potId1);

    const games = tmntData.events[0].games;

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

    expect(props?.totalPrizeFund).toBe(expectedPerGamePrizeFund);
    expect(props?.gridDataWasChanged).toBe(false);
  });

  it("provides all required callback props to PotPrizeFundGrid", () => {
    setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();
    expect(props?.onGridDataChanged).toEqual(expect.any(Function));
    expect(props?.onGridDataReset).toEqual(expect.any(Function));
    expect(props?.onNavigateAfterSave).toEqual(expect.any(Function));
    expect(props?.onBack).toEqual(expect.any(Function));
    expect(props?.onSaveComplete).toEqual(expect.any(Function));
  });

  it("fetches the tournament pot prize funds when mounted", () => {
    setup();

    expect(mockFetchPotPfs).toHaveBeenCalledTimes(1);
    expect(mockFetchPotPfs).toHaveBeenCalledWith(tmntId);
    expect(mockDispatch).toHaveBeenCalledWith(
      mockFetchPotPfs.mock.results[0].value,
    );
  });

  it("does not fetch tournament data when the correct tournament is already loaded", () => {
    setup();

    expect(mockFetchTmntFullData).not.toHaveBeenCalled();
  });

  it("fetches tournament data when no tournament is loaded", () => {
    setup({
      tmntData: {} as typeof mockTmntFullData,
    });

    expect(mockFetchTmntFullData).toHaveBeenCalledTimes(1);
    expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
    expect(mockDispatch).toHaveBeenCalledWith(
      mockFetchTmntFullData.mock.results[0].value,
    );
  });

  it("fetches tournament data when a different tournament is loaded", () => {
    const tmntData = {
      ...mockTmntFullData,
      tmnt: {
        ...mockTmntFullData.tmnt,
        id: "different-tmnt-id",
      },
    };

    setup({ tmntData });

    expect(mockFetchTmntFullData).toHaveBeenCalledTimes(1);
    expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
  });

  it("renders the page when Redux contains prize fund rows only for other pots", () => {
    const potPfs = makePotPfsForDifferentPot(
      potId1,
    );

    setup({
      potId: potId1,
      potPfs,
    });

    expect(
      screen.getByRole("heading", {
        name: "Prize Fund",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "mock-pot-prize-fund-grid",
      ),
    ).toBeInTheDocument();

    expect(getLatestGridProps()?.rows).toEqual([]);
  });

  it("passes the total prize fund to the grid for a Last Game pot", () => {
    const potPfs = makePotPfsForPot(
      potId2,
      mockPotPfs,
    );

    const { tmntData } = setup({
      potId: potId2,
      potPfs,
    });

    const props = getLatestGridProps();

    expect(props).not.toBeNull();

    const potEntryFees =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "ENTRIES" &&
          money.flow === "IN" &&
          money.pot_id === potId2 &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;

    const potExpenses =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "EXPENSES" &&
          money.flow === "OUT" &&
          money.pot_id === potId2 &&
          money.brkt_id === null &&
          money.elim_id === null,
      )?.amount ?? 0;

    const expectedTotalPrizeFund = potEntryFees - potExpenses;
    expect(props?.totalPrizeFund).toBe(expectedTotalPrizeFund);
  });

  it("renders the page when there are no pot prize fund rows", () => {
    setup({ potPfs: [] });

    expect(
      screen.getByRole("heading", {
        name: "Prize Fund",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "mock-pot-prize-fund-grid",
      ),
    ).toBeInTheDocument();

    expect(getLatestGridProps()?.rows).toEqual([]);
  });  

  it("does not render the page when the loaded pot prize funds belong to a different tournament", () => {
    setup({ potPfsRequestedTmntId: "tmt_00000000000000000000000000000099" });

    expect(
      screen.queryByRole("heading", {
        name: "Prize Fund",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(
        "mock-pot-prize-fund-grid",
      ),
    ).not.toBeInTheDocument();
  });

  it("still fetches pot prize funds when stale pot prize fund data is in Redux", () => {
    setup({ potPfsRequestedTmntId: "tmt_00000000000000000000000000000099" });

    expect(mockFetchPotPfs).toHaveBeenCalledTimes(1);
    expect(mockFetchPotPfs).toHaveBeenCalledWith(tmntId);
    expect(mockDispatch).toHaveBeenCalledWith(
      mockFetchPotPfs.mock.results[0].value,
    );
  });

});
