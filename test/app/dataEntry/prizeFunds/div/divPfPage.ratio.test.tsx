"use client";

import { screen, waitFor } from "@testing-library/react";
import {
  cancelRemoveCashers,
  confirmRemoveCashers,
  getLatestRows,
  mockBtDbUuid,
  mockUseUnsavedChangesGuard,
  setCurrentGridRows,
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup.test";
import { 
  mockDivPfs,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Division Prize Fund web page ratio input", () => {
  beforeEach(standardBeforeEach);

  it("updates the ratio input while the user types", async () => {
    const { user } = setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const initialRatio = Number(
      (mockTmntFullData.players.length / mockDivPfs.length).toFixed(2),
    );

    await waitFor(() => {
      expect(ratioInput).toHaveValue(initialRatio);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "4.5");

    expect(ratioInput).toHaveValue(4.5);
  });

  it("changes values below the minimum to 1 on blur", async () => {
    const { user } = setup();

    const ratioInput =
      screen.getByLabelText("Cash Ratio. 1 in");

    const cashersInput =
      screen.getByLabelText("Cashers");

    const calculatedCashersInput =
      screen.getByLabelText("Calculated Cashers");

    const expectedCashers =
      mockTmntFullData.players.length;

    await user.clear(ratioInput);
    await user.type(ratioInput, "0");
    await user.tab();

    await waitFor(() => {
      expect(getLatestRows()).toHaveLength(
        expectedCashers,
      );
    });

    expect(ratioInput).toHaveValue(1);

    expect(cashersInput).toHaveValue(
      expectedCashers,
    );

    expect(calculatedCashersInput).toHaveValue(
      expectedCashers,
    );
  });

  it("adds rows on blur when the ratio produces more cashers", async () => {
    const { user } = setup();

    const initialCashers = mockDivPfs.length;
    const expectedCashers = mockTmntFullData.players.length;

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const calculatedCashersInput = screen.getByLabelText("Calculated Cashers");

    await waitFor(() => {
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "1");
    await user.tab();

    await waitFor(() => {
      expect(getLatestRows()).toHaveLength(expectedCashers);
    });

    expect(ratioInput).toHaveValue(1);

    expect(calculatedCashersInput).toHaveValue(expectedCashers);

    expect(mockBtDbUuid).toHaveBeenCalledTimes(
      expectedCashers - initialCashers,
    );

    expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");

    const addedRows = getLatestRows().slice(initialCashers);

    expect(addedRows).toHaveLength(expectedCashers - initialCashers);

    expect(
      addedRows.every((row) => row.amount === 0 && row.percentage === 0),
    ).toBe(true);

    const addedIds = addedRows.map((row) => row.id);

    expect(new Set(addedIds).size).toBe(addedIds.length);
  });

  it("changes values above the maximum to the number of players on blur after confirmation", async () => {
    const { user } = setup();

    const initialCashers = mockDivPfs.length;

    const ratioInput =
      screen.getByLabelText("Cash Ratio. 1 in");

    const cashersInput =
      screen.getByLabelText("Cashers");

    const calculatedCashersInput =
      screen.getByLabelText("Calculated Cashers");

    const maxRatio =
      mockTmntFullData.players.length;

    await user.clear(ratioInput);
    await user.type(ratioInput, "999");
    await user.tab();

    expect(
      await screen.findByRole("dialog", {
        name: "confirm-modal",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Remove Cashers"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `Do you want to remove ${initialCashers - 1} cashers? ` +
        `Going from ${initialCashers} cashers to 1 cashers.`,
      ),
    ).toBeInTheDocument();

    await confirmRemoveCashers(user);

    await waitFor(() => {
      expect(getLatestRows()).toHaveLength(1);
    });

    expect(ratioInput).toHaveValue(maxRatio);

    expect(cashersInput).toHaveValue(1);

    expect(calculatedCashersInput).toHaveValue(1);
  });

  it("adds rows when Enter is pressed and the ratio produces more cashers", async () => {
    const { user } = setup();

    const expectedCashers = mockTmntFullData.players.length;

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    await user.clear(ratioInput);
    await user.type(ratioInput, "1");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(getLatestRows()).toHaveLength(expectedCashers);
    });

    expect(ratioInput).toHaveValue(1);

    expect(mockBtDbUuid).toHaveBeenCalledTimes(
      expectedCashers - mockDivPfs.length,
    );
  });

  it("changes values below the minimum to 1 when Enter is pressed", async () => {
    const { user } = setup();

    const expectedCashers =
      mockTmntFullData.players.length;

    const ratioInput =
      screen.getByLabelText("Cash Ratio. 1 in");

    await user.clear(ratioInput);
    await user.type(ratioInput, "0");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(getLatestRows()).toHaveLength(
        expectedCashers,
      );
    });

    expect(ratioInput).toHaveValue(1);
  });  

  it("changes values above the maximum to the number of players when Enter is pressed", async () => {
    const { user } = setup();

    const initialCashers = mockDivPfs.length;

    const ratioInput =
      screen.getByLabelText("Cash Ratio. 1 in");

    await user.clear(ratioInput);
    await user.type(ratioInput, "999");
    await user.keyboard("{Enter}");

    expect(
      await screen.findByRole("dialog", {
        name: "confirm-modal",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `Do you want to remove ${initialCashers - 1} cashers? ` +
        `Going from ${initialCashers} cashers to 1 cashers.`,
      ),
    ).toBeInTheDocument();

    await confirmRemoveCashers(user);

    await waitFor(() => {
      expect(getLatestRows()).toHaveLength(1);
    });

    expect(ratioInput).toHaveValue(
      mockTmntFullData.players.length,
    );
  });

  it("opens a confirmation dialog on blur when the ratio produces fewer cashers", async () => {
    const { user } = setup();

    const initialCashers = mockDivPfs.length;
    const newRatio = mockTmntFullData.players.length;
    const expectedCashers = 1;
    const removeCount = initialCashers - expectedCashers;

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const calculatedCashersInput = screen.getByLabelText("Calculated Cashers");

    await user.clear(ratioInput);
    await user.type(ratioInput, newRatio.toString());
    await user.tab();

    expect(
      await screen.findByRole("dialog", {
        name: "confirm-modal",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Remove Cashers")).toBeInTheDocument();

    expect(
      screen.getByText(
        `Do you want to remove ${removeCount} cashers? Going from ${initialCashers} cashers to ${expectedCashers} cashers.`,
      ),
    ).toBeInTheDocument();

    expect(ratioInput).toHaveValue(newRatio);

    expect(calculatedCashersInput).toHaveValue(expectedCashers);

    /*
     * The rows are not removed until the user confirms.
     */
    expect(getLatestRows()).toHaveLength(initialCashers);
  });

  it("opens a confirmation dialog when Enter produces fewer cashers", async () => {
    const { user } = setup();

    const initialCashers = mockDivPfs.length;
    const newRatio = mockTmntFullData.players.length;

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    await user.clear(ratioInput);
    await user.type(ratioInput, newRatio.toString());
    await user.keyboard("{Enter}");

    expect(
      await screen.findByRole("dialog", {
        name: "confirm-modal",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Remove Cashers")).toBeInTheDocument();

    expect(getLatestRows()).toHaveLength(initialCashers);
  });

  it("removes rows when the ratio decreases cashers and confirmation Yes is clicked", async () => {
    const { user } = setup();

    const newRatio = mockTmntFullData.players.length;
    const expectedCashers = 1;

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const cashersInput = screen.getByLabelText("Cashers");

    await user.clear(ratioInput);
    await user.type(ratioInput, newRatio.toString());
    await user.tab();

    expect(
      await screen.findByRole("dialog", {
        name: "confirm-modal",
      }),
    ).toBeInTheDocument();

    await confirmRemoveCashers(user);

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", {
          name: "confirm-modal",
        }),
      ).not.toBeInTheDocument();
    });

    expect(getLatestRows()).toHaveLength(expectedCashers);

    expect(cashersInput).toHaveValue(expectedCashers);

    expect(getLatestRows()[0]).toEqual(
      expect.objectContaining({
        position: 1,
      }),
    );
  });

  it("keeps the existing rows when the ratio decreases cashers and confirmation No is clicked", async () => {
    const { user } = setup();

    const initialCashers = mockDivPfs.length;
    const newRatio = mockTmntFullData.players.length;

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    const cashersInput = screen.getByLabelText("Cashers");

    await user.clear(ratioInput);
    await user.type(ratioInput, newRatio.toString());
    await user.tab();

    expect(
      await screen.findByRole("dialog", {
        name: "confirm-modal",
      }),
    ).toBeInTheDocument();

    await cancelRemoveCashers(user);

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", {
          name: "confirm-modal",
        }),
      ).not.toBeInTheDocument();
    });

    expect(getLatestRows()).toHaveLength(initialCashers);

    /*
     * confirmNo() closes the dialog but does not restore
     * the ratio or cashers input values.
     */
    expect(ratioInput).toHaveValue(newRatio);
    expect(cashersInput).toHaveValue(initialCashers);
  });

  it("ignores invalid ratio characters", async () => {
    const { user } = setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    await waitFor(() => {
      expect(ratioInput).not.toHaveValue(0);
    });

    await user.clear(ratioInput);
    await user.type(ratioInput, "abc");

    /*
     * The type=number input rejects alphabetic characters.
     * Clearing the controlled input leaves its numeric value
     * empty rather than accepting the invalid characters.
     */
    expect(ratioInput).toHaveValue(null);

    expect(getLatestRows()).toHaveLength(mockDivPfs.length);
  });

  it("arms the unsaved changes guard when the ratio input changes", async () => {
    const { user } = setup();

    const ratioInput = screen.getByLabelText("Cash Ratio. 1 in");

    await user.clear(ratioInput);
    await user.type(ratioInput, "4");

    await waitFor(() => {
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });
  });

  it("preserves unsaved grid edits when the ratio increases the number of cashers", async () => {
    const { user } = setup();

    const initialRows = getLatestRows();

    const editedRows = initialRows.map((row) => ({
      ...row,
      amount:
        row.position === 1
          ? 999
          : row.amount,
    }));

    /*
    * Simulate an amount edit that exists only inside Syncfusion's
    * batch-edit state and has not yet been copied into page rows.
    */
    setCurrentGridRows(editedRows);

    const ratioInput =
      screen.getByLabelText(
        "Cash Ratio. 1 in",
      );

    const expectedCashers =
      mockTmntFullData.players.length;

    /*
    * A ratio of 1 creates one casher for every player, so the page
    * must add rows. updateCashers() should start with the rows
    * returned by PrizeFundGridHandle.getCurrentRows().
    */
    await user.clear(ratioInput);
    await user.type(ratioInput, "1");
    await user.tab();

    await waitFor(() => {
      expect(getLatestRows()).toHaveLength(
        expectedCashers,
      );
    });

    /*
    * The pending Syncfusion edit must still be present after the
    * additional casher rows are appended.
    */
    expect(getLatestRows()[0]).toEqual(
      expect.objectContaining({
        position: 1,
        amount: 999,
      }),
    );

    expect(
      getLatestRows().slice(initialRows.length),
    ).toHaveLength(
      expectedCashers - initialRows.length,
    );
  });

});
