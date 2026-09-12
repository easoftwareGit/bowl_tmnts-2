"use client";

import { screen, waitFor } from "@testing-library/react";
import type { divPfType } from "@/lib/types/types";
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

  it("converts the current division prize funds and initializes the grid rows", async () => {
    const {
      currentDivPfs,
      prizeFunds,
      populatedRows,
    } = setup();

    expect(
      mockDivPfsToPrizeFunds,
    ).toHaveBeenCalledWith(currentDivPfs);

    expect(
      mockPopulatePfRows,
    ).toHaveBeenCalledWith(
      prizeFunds,
      divId1,
      mockDivPrizeFund,
      currentDivPfs.length,
    );

    await waitFor(() => {
      expect(
        getLatestGridProps()?.rows,
      ).toEqual(populatedRows);
    });
  });

  it("filters tournament division prize funds to the current division before initializing", async () => {
    const otherDivId =
      "div_00000000000000000000000000000099";

    const otherDivPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000091",
        div_id: otherDivId,
        position: 1,
        amount: 500,
      },
      {
        id: "dpf_00000000000000000000000000000092",
        div_id: otherDivId,
        position: 2,
        amount: 250,
      },
    ];

    const allDivPfs = [
      ...mockDivPfs,
      ...otherDivPfs,
    ];

    const {
      currentDivPfs,
      prizeFunds,
      populatedRows,
    } = setup({
      divPfs: allDivPfs,
    });

    expect(currentDivPfs).toEqual(
      mockDivPfs.filter(
        (divPf) => divPf.div_id === divId1,
      ),
    );

    expect(
      mockDivPfsToPrizeFunds,
    ).toHaveBeenCalledWith(currentDivPfs);

    expect(
      mockDivPfsToPrizeFunds,
    ).not.toHaveBeenCalledWith(allDivPfs);

    expect(
      mockPopulatePfRows,
    ).toHaveBeenCalledWith(
      prizeFunds,
      divId1,
      mockDivPrizeFund,
      currentDivPfs.length,
    );

    await waitFor(() => {
      expect(
        getLatestGridProps()?.rows,
      ).toEqual(populatedRows);
    });

    expect(
      getLatestGridProps()?.rows,
    ).toHaveLength(currentDivPfs.length);

    expect(
      getLatestGridProps()?.rows.every(
        (row) => row.parent_id === divId1,
      ),
    ).toBe(true);
  });

  it("initializes the cashers input from the number of current division prize funds", async () => {
    const { currentDivPfs } = setup();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Cashers"),
      ).toHaveValue(currentDivPfs.length);
    });
  });

  it("initializes the calculated cashers input from the number of current division prize funds", async () => {
    const { currentDivPfs } = setup();

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          "Calculated Cashers",
        ),
      ).toHaveValue(currentDivPfs.length);
    });
  });

  it("initializes the ratio from the number of players divided by the number of current division cashers", async () => {
    const { currentDivPfs } = setup();

    const expectedRatio =
      mockTmntFullData.players.length /
      currentDivPfs.length;

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          "Cash Ratio. 1 in",
        ),
      ).toHaveValue(
        Number(expectedRatio.toFixed(2)),
      );
    });
  });

  it("initializes the players input from the tournament player count", () => {
    setup();

    expect(
      screen.getByLabelText("Players"),
    ).toHaveValue(
      mockTmntFullData.players.length,
    );
  });

  it("initializes the prize fund amount from the tournament money data", () => {
    setup();

    expect(
      screen.getByLabelText("Prize Fund"),
    ).toHaveValue(
      mockDivPrizeFund.toString(),
    );

    expect(
      getLatestGridProps()?.totalPrizeFund,
    ).toBe(mockDivPrizeFund);
  });

  it("initializes the ratio, cashers, and grid rows to zero when the current division has no prize funds", async () => {
    const otherDivId =
      "div_00000000000000000000000000000099";

    const otherDivPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000091",
        div_id: otherDivId,
        position: 1,
        amount: 500,
      },
    ];

    setup({
      divPfs: otherDivPfs,
      prizeFunds: [],
      populatedRows: [],
    });

    expect(
      mockDivPfsToPrizeFunds,
    ).toHaveBeenCalledWith([]);

    expect(
      mockPopulatePfRows,
    ).toHaveBeenCalledWith(
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

    expect(
      screen.getByLabelText(
        "Cash Ratio. 1 in",
      ),
    ).toHaveValue(0);

    expect(
      screen.getByLabelText(
        "Calculated Cashers",
      ),
    ).toHaveValue(0);

    expect(
      getLatestGridProps()?.rows,
    ).toEqual([]);
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
