"use client";

import { screen, waitFor } from "@testing-library/react";
import {
  getLatestGridProps,  
  mockDivPfsToPrizeFunds,
  mockPopulatePfRows,
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup.test";
import {
  divId1,
  mockDivPfs,
  mockDivPrizeFund,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Division Prize Fund web page initialization", () => {
  beforeEach(standardBeforeEach);

  it("converts the division prize funds and initializes the grid rows", async () => {
    const {
      prizeFunds,
      populatedRows,
    } = setup();

    expect(
      mockDivPfsToPrizeFunds,
    ).toHaveBeenCalledWith(mockDivPfs);

    expect(mockPopulatePfRows).toHaveBeenCalledWith(
      prizeFunds,
      divId1,
      mockDivPrizeFund,
      mockDivPfs.length,
    );

    await waitFor(() => {
      expect(
        getLatestGridProps()?.rows,
      ).toEqual(populatedRows);
    });
  });

  it("initializes the cashers input from the number of division prize funds", async () => {
    setup();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Cashers"),
      ).toHaveValue(mockDivPfs.length);
    });
  });

  it("initializes the calculated cashers input from the number of division prize funds", async () => {
    setup();

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          "Calculated Cashers",
        ),
      ).toHaveValue(mockDivPfs.length);
    });
  });

  it("initializes the ratio from the number of players divided by the number of cashers", async () => {
    setup();

    const expectedRatio =
      mockTmntFullData.players.length /
      mockDivPfs.length;

    await waitFor(() => {
      expect(
        screen.getByLabelText("Cash Ratio. 1 in")
      ).toHaveValue(
        Number(expectedRatio.toFixed(2)),
      );
    });
  });

  it("initializes the players input from the tournament player count", () => {
    setup();

    expect(
      screen.getByLabelText("Players")
    ).toHaveValue(
      mockTmntFullData.players.length,
    );
  });

  it("initializes the prize fund amount from the tournament money data", () => {
    setup();

    expect(
      screen.getByLabelText("Prize Fund")
    ).toHaveValue(
      mockDivPrizeFund.toString(),
    );

    expect(getLatestGridProps()?.totalPrizeFund).toBe(mockDivPrizeFund);
  });

  it("initializes the ratio, cashers, and grid rows to zero when no division prize funds exist", async () => {
    setup({
      divPfs: [],
      prizeFunds: [],
      populatedRows: [],
    });

    expect(
      mockDivPfsToPrizeFunds,
    ).toHaveBeenCalledWith([]);

    expect(mockPopulatePfRows).toHaveBeenCalledWith(
      [],
      divId1,
      mockDivPrizeFund,
      0,
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("Cashers"),
      ).toHaveValue(0);
    });

    expect(screen.getByLabelText("Cash Ratio. 1 in")).toHaveValue(0);
    expect(screen.getByLabelText("Calculated Cashers")).toHaveValue(0);
    expect(getLatestGridProps()?.rows).toEqual([]);
  });

  it("initializes DivPrizeFundGrid with the populated prize fund rows", async () => {
    const { populatedRows } = setup();

    await waitFor(() => {
      expect(
        getLatestGridProps()?.rows,
      ).toEqual(populatedRows);
    });

    expect(
      getLatestGridProps()?.rows,
    ).toHaveLength(
      populatedRows.length,
    );
  });  

});