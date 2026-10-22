import { screen } from "@testing-library/react";
import {
  cancelRemoveCashers,
  confirmRemoveCashers,
  enterRatio,
  getCalcCashersInput,
  getCashersInput,
  getLatestRows,
  getRatioInput,
  mockBtDbUuid,
  mockUseUnsavedChangesGuard,
  setCurrentGridRows,
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*
 * Ratio input ("Cash Ratio. 1 in"):
 *   - typing (onChange) only updates the input and marks the page changed
 *   - blur / Enter apply the value (applyEnteredRatio):
 *       same as applied (2 decimals) -> nothing, text re-formatted
 *       below 1 / above players      -> clamped, with an error message
 *       otherwise                    -> cashers = floor(players / ratio)
 *           more cashers  -> rows added immediately
 *           fewer cashers -> "Remove Cashers" confirm; Yes removes, No restores
 *           same count    -> ratio applied, rows unchanged
 *   - calculated cashers = players / ratio (not floored)
 *
 * With players = P: ratio 1 -> P cashers; ratio P -> 1 casher.
 *
 * Blur onto the grid's Cancel button is covered in gridCallbacks.test.
 */

const queryConfirmModal = () =>
  screen.queryByRole("dialog", { name: "confirm-modal" });

const removeMsg = (from: number, to: number): string =>
  `Do you want to remove ${from - to} cashers? ` +
  `Going from ${from} cashers to ${to} cashers.`;

const ratioErrMsg = (numPlayers: number): string =>
  `Ratio must be between 1 and ${numPlayers <= 1 ? 1 : numPlayers}`;

const twoDec = (value: number): number => Number(value.toFixed(2));

const setupWithRows = () => {
  const result = setup();
  const initialCashers = result.populatedRows.length;
  const numPlayers = result.tmntData.players.length;
  return {
    ...result,
    initialCashers,
    numPlayers,
    initialRatio: numPlayers / initialCashers,
  };
};

describe("Division Prize Fund web page ratio input", () => {
  beforeEach(standardBeforeEach);

  /**********
   * Typing *
   **********/

  describe("typing without applying", () => {
    it("updates the input but not the grid", async () => {
      const { user, initialRatio, initialCashers } = setupWithRows();

      expect(getRatioInput()).toHaveValue(twoDec(initialRatio));

      await enterRatio(user, "4.5", "none");

      expect(getRatioInput()).toHaveValue(4.5);
      expect(getLatestRows()).toHaveLength(initialCashers);
      expect(getCashersInput()).toHaveValue(initialCashers);
      expect(queryConfirmModal()).not.toBeInTheDocument();
    });

    it("arms the unsaved changes guard", async () => {
      const { user } = setupWithRows();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);

      await enterRatio(user, "4", "none");

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("ignores letters", async () => {
      const { user, initialCashers } = setupWithRows();

      await enterRatio(user, "abc", "none");

      // Cleared; the letters are rejected.
      expect(getRatioInput()).toHaveValue(null);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });
  });

  /*****************************
   * Re-entering the same ratio *
   *****************************/

  it("changes nothing when the applied ratio is entered again", async () => {
    const { user, initialRatio } = setupWithRows();
    const rowsBefore = getLatestRows();

    await enterRatio(user, initialRatio.toFixed(2));

    expect(getLatestRows()).toBe(rowsBefore);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
    expect(queryConfirmModal()).not.toBeInTheDocument();    
    expect(getRatioInput()).toHaveValue(twoDec(initialRatio));
    expect(screen.getByTestId("dangerRatio")).toHaveTextContent("");
  });

  /*********************
   * More cashers      *
   *********************/

  describe("when the ratio produces more cashers", () => {
    it("adds rows on blur and updates cashers and calculated cashers", async () => {
      const { user, divId, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers); // mock data precondition

      await enterRatio(user, "1");

      expect(getLatestRows()).toHaveLength(numPlayers);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(numPlayers - initialCashers);
      expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");

      const addedRows = getLatestRows().slice(initialCashers);
      addedRows.forEach((row, index) => {
        expect(row).toEqual(
          expect.objectContaining({
            parent_id: divId,
            position: initialCashers + index + 1,
            amount: 0,
            percentage: 0,
          }),
        );
      });
      const addedIds = addedRows.map((row) => row.id);
      expect(new Set(addedIds).size).toBe(addedIds.length);

      expect(getRatioInput()).toHaveValue(1);
      expect(getCashersInput()).toHaveValue(numPlayers);
      expect(getCalcCashersInput()).toHaveValue(numPlayers);
      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(screen.getByTestId("dangerRatio")).toHaveTextContent("");
    });

    it("adds rows when Enter is pressed", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterRatio(user, "1", "enter");

      expect(getLatestRows()).toHaveLength(numPlayers);
      expect(getRatioInput()).toHaveValue(1);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(numPlayers - initialCashers);
    });

    it("preserves unsaved grid edits", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      const editedRows = getLatestRows().map((row) => ({
        ...row,
        amount: row.position === 1 ? 999 : row.amount,
      }));
      // The edit exists only in the mocked Syncfusion grid.
      setCurrentGridRows(editedRows);

      await enterRatio(user, "1");

      expect(getLatestRows()).toHaveLength(numPlayers);
      expect(getLatestRows()[0]).toEqual(
        expect.objectContaining({ position: 1, amount: 999 }),
      );
    });

    it("clamps values below 1 on blur and shows an error", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterRatio(user, "0");

      expect(getRatioInput()).toHaveValue(1);
      expect(getLatestRows()).toHaveLength(numPlayers);
      expect(getCashersInput()).toHaveValue(numPlayers);
      expect(getCalcCashersInput()).toHaveValue(numPlayers);
      expect(screen.getByTestId("dangerRatio")).toHaveTextContent(
        ratioErrMsg(numPlayers),
      );
    });

    it("clamps values below 1 when Enter is pressed", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterRatio(user, "0", "enter");

      expect(getRatioInput()).toHaveValue(1);
      expect(getLatestRows()).toHaveLength(numPlayers);
      expect(screen.getByTestId("dangerRatio")).toHaveTextContent(
        ratioErrMsg(numPlayers),
      );
    });

    it("clears the error when the user types again", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterRatio(user, "0");
      expect(screen.getByTestId("dangerRatio")).not.toHaveTextContent("");

      await enterRatio(user, "2", "none");

      expect(screen.getByTestId("dangerRatio")).toHaveTextContent("");
    });
  });

  /*********************
   * Same casher count *
   *********************/

  it("applies a ratio that keeps the same number of cashers without changing rows", async () => {
    const { user, initialCashers, numPlayers } = setupWithRows();
    expect(numPlayers).toBeGreaterThan(initialCashers);
    const rowsBefore = getLatestRows();

    // players / ratio = initialCashers + 0.5, which floors to initialCashers.
    const ratioText = (numPlayers / (initialCashers + 0.5)).toFixed(2);

    await enterRatio(user, ratioText);

    expect(getLatestRows()).toBe(rowsBefore);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
    expect(queryConfirmModal()).not.toBeInTheDocument();
    expect(getCashersInput()).toHaveValue(initialCashers);
    expect(getRatioInput()).toHaveValue(Number(ratioText));
    expect(getCalcCashersInput()).toHaveValue(
      twoDec(numPlayers / Number(ratioText)),
    );
  });

  /*********************
   * Fewer cashers     *
   *********************/

  describe("when the ratio produces fewer cashers", () => {
    it("asks for confirmation on blur before removing rows", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2); // mock data precondition

      await enterRatio(user, String(numPlayers));

      expect(queryConfirmModal()).toBeInTheDocument();
      expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
      expect(screen.getByText(removeMsg(initialCashers, 1))).toBeInTheDocument();

      // Ratio and calculated cashers preview the request; rows are untouched.
      expect(getRatioInput()).toHaveValue(numPlayers);
      expect(getCalcCashersInput()).toHaveValue(1);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("asks for confirmation when Enter is pressed", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterRatio(user, String(numPlayers), "enter");

      expect(screen.getByText(removeMsg(initialCashers, 1))).toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("removes rows from the end when Yes is clicked", async () => {
      const { user, initialCashers, numPlayers, populatedRows } =
        setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterRatio(user, String(numPlayers));
      await confirmRemoveCashers(user);

      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getLatestRows()).toEqual([populatedRows[0]]);
      expect(getCashersInput()).toHaveValue(1);
      expect(getRatioInput()).toHaveValue(numPlayers);
      expect(getCalcCashersInput()).toHaveValue(1);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("remembers the confirmed ratio, so entering it again changes nothing", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterRatio(user, String(numPlayers));
      await confirmRemoveCashers(user);

      await enterRatio(user, String(numPlayers));

      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(1);
    });

    it("keeps the rows and restores the inputs when No is clicked", async () => {
      const { user, initialCashers, initialRatio, numPlayers } =
        setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);
      const rowsBefore = getLatestRows();

      await enterRatio(user, String(numPlayers));
      await cancelRemoveCashers(user);

      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getLatestRows()).toBe(rowsBefore);

      // confirmNo restores the last applied values.
      expect(getRatioInput()).toHaveValue(twoDec(initialRatio));
      expect(getCalcCashersInput()).toHaveValue(initialCashers);
      expect(getCashersInput()).toHaveValue(initialCashers);
    });

    it("asks again if the declined ratio is entered again", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterRatio(user, String(numPlayers));
      await cancelRemoveCashers(user);

      await enterRatio(user, String(numPlayers));

      expect(queryConfirmModal()).toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("clamps values above the number of players on blur, shows an error and asks", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterRatio(user, "999");

      expect(screen.getByTestId("dangerRatio")).toHaveTextContent(
        ratioErrMsg(numPlayers),
      );
      expect(getRatioInput()).toHaveValue(numPlayers);
      expect(screen.getByText(removeMsg(initialCashers, 1))).toBeInTheDocument();

      await confirmRemoveCashers(user);

      expect(getLatestRows()).toHaveLength(1);
      expect(getRatioInput()).toHaveValue(numPlayers);
      expect(getCashersInput()).toHaveValue(1);
      expect(getCalcCashersInput()).toHaveValue(1);
    });

    it("clamps values above the number of players when Enter is pressed", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterRatio(user, "999", "enter");

      expect(screen.getByText(removeMsg(initialCashers, 1))).toBeInTheDocument();

      await confirmRemoveCashers(user);

      expect(getLatestRows()).toHaveLength(1);
      expect(getRatioInput()).toHaveValue(numPlayers);
    });

    it("clears the error and restores the ratio when the clamped removal is declined", async () => {
      const { user, initialCashers, initialRatio } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterRatio(user, "999");
      await cancelRemoveCashers(user);

      expect(screen.getByTestId("dangerRatio")).toHaveTextContent("");
      expect(getRatioInput()).toHaveValue(twoDec(initialRatio));
      expect(getLatestRows()).toHaveLength(initialCashers);
    });
  });

  /*****************
   * Player limits *
   *****************/

  it("limits the ratio to 1 with one player and says so in the error", async () => {
    const { user } = setup({
      tmntData: {
        ...mockTmntFullData,
        players: mockTmntFullData.players.slice(0, 1),
      },
    });

    await enterRatio(user, "5");

    expect(screen.getByTestId("dangerRatio")).toHaveTextContent(
      ratioErrMsg(1),
    );
  });
});
