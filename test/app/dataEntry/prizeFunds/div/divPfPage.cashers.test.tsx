import { screen } from "@testing-library/react";
import {
  cancelRemoveCashers,
  confirmRemoveCashers,
  enterCashers,
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
 * Cashers input:
 *   - typing (onChange) only updates the input and marks the page changed
 *   - blur / Enter apply the value:
 *       same as applied     -> nothing
 *       increase            -> rows added immediately (new dpf ids)
 *       decrease            -> "Remove Cashers" confirm; Yes removes, No restores
 *       below 1 / above max -> clamped, with an error message
 *   - ratio and calculated cashers follow the applied casher count
 *
 * Counts come from setup() (rows for the route division only, players in
 * tmntData) so the tests do not depend on how many divisions the mock
 * tournament has.
 *
 * Blur onto the grid's Cancel button is covered in gridCallbacks.test.
 */

const queryConfirmModal = () =>
  screen.queryByRole("dialog", { name: "confirm-modal" });

const removeMsg = (from: number, to: number): string =>
  `Do you want to remove ${from - to} cashers? ` +
  `Going from ${from} cashers to ${to} cashers.`;

const cashersErrMsg = (numPlayers: number): string =>
  `Cashers must be a whole number between 1 and ${numPlayers <= 1 ? 1 : numPlayers}`;

const ratioValue = (numPlayers: number, cashers: number): number =>
  Number((numPlayers / cashers).toFixed(2));

/** Sets up with existing rows and returns the counts tests need. */
const setupWithRows = () => {
  const result = setup();
  const initialCashers = result.populatedRows.length;
  const numPlayers = result.tmntData.players.length;
  return { ...result, initialCashers, numPlayers };
};

describe("Division Prize Fund web page cashers input", () => {
  beforeEach(standardBeforeEach);

  /********************
   * No existing rows *
   ********************/

  describe("when there are no existing prize fund rows", () => {
    const setupEmpty = () => setup({ divPfs: [] });

    it("shows 0 cashers and an empty grid", () => {
      setupEmpty();

      expect(getCashersInput()).toHaveValue(0);
      expect(getLatestRows()).toHaveLength(0);
    });

    it("entering the first casher creates the first row", async () => {
      const { user, divId, tmntData } = setupEmpty();
      const numPlayers = tmntData.players.length;

      await enterCashers(user, "1");

      expect(getLatestRows()).toEqual([
        {
          id: "dpf_00000000000000000000000000000001",
          parent_id: divId,
          position: 1,
          amount: 0,
          percentage: 0,
        },
      ]);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(1);
      expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");

      expect(getCashersInput()).toHaveValue(1);
      expect(getRatioInput()).toHaveValue(ratioValue(numPlayers, 1));
      expect(getCalcCashersInput()).toHaveValue(1);
      expect(queryConfirmModal()).not.toBeInTheDocument();
    });
  });

  /**********
   * Typing *
   **********/

  describe("typing without applying", () => {
    it("updates the input but not the grid", async () => {
      const { user, initialCashers } = setupWithRows();

      expect(getCashersInput()).toHaveValue(initialCashers);

      await enterCashers(user, "3", "none");

      expect(getCashersInput()).toHaveValue(3);
      expect(getLatestRows()).toHaveLength(initialCashers);
      expect(mockBtDbUuid).not.toHaveBeenCalled();
      expect(queryConfirmModal()).not.toBeInTheDocument();
    });

    it("arms the unsaved changes guard", async () => {
      const { user, initialCashers } = setupWithRows();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);

      await enterCashers(user, String(initialCashers), "none");

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("ignores letters", async () => {
      const { user, initialCashers } = setupWithRows();

      await enterCashers(user, "abc", "none");

      // Clearing sets cashers to 0; the letters are rejected.
      expect(getCashersInput()).toHaveValue(0);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("changes nothing when the applied count is entered again", async () => {
      const { user, initialCashers } = setupWithRows();
      const rowsBefore = getLatestRows();

      await enterCashers(user, String(initialCashers));

      expect(getLatestRows()).toBe(rowsBefore);
      expect(mockBtDbUuid).not.toHaveBeenCalled();
      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(screen.getByTestId("dangerCashers")).toHaveTextContent("");
    });
  });

  /***************
   * Increasing  *
   ***************/

  describe("increasing the number of cashers", () => {
    it("adds rows on blur and updates ratio and calculated cashers", async () => {
      const { user, divId, initialCashers, numPlayers } = setupWithRows();
      const newCashers = initialCashers + 2;
      expect(numPlayers).toBeGreaterThanOrEqual(newCashers); // mock data precondition

      await enterCashers(user, String(newCashers));

      expect(getLatestRows()).toHaveLength(newCashers);
      expect(getLatestRows().slice(initialCashers)).toEqual([
        {
          id: "dpf_00000000000000000000000000000001",
          parent_id: divId,
          position: initialCashers + 1,
          amount: 0,
          percentage: 0,
        },
        {
          id: "dpf_00000000000000000000000000000002",
          parent_id: divId,
          position: initialCashers + 2,
          amount: 0,
          percentage: 0,
        },
      ]);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
      expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");

      expect(getCashersInput()).toHaveValue(newCashers);
      expect(getRatioInput()).toHaveValue(ratioValue(numPlayers, newCashers));
      expect(getCalcCashersInput()).toHaveValue(newCashers);
      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(screen.getByTestId("dangerCashers")).toHaveTextContent("");
    });

    it("adds rows when Enter is pressed", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      const newCashers = initialCashers + 2;
      expect(numPlayers).toBeGreaterThanOrEqual(newCashers);

      await enterCashers(user, String(newCashers), "enter");

      expect(getLatestRows()).toHaveLength(newCashers);
      expect(getCashersInput()).toHaveValue(newCashers);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
    });

    it("keeps the existing rows unchanged", async () => {
      const { user, initialCashers, numPlayers, populatedRows } =
        setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterCashers(user, String(initialCashers + 1));

      expect(getLatestRows().slice(0, initialCashers)).toEqual(populatedRows);
    });

    it("preserves unsaved grid edits", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      const editedRows = getLatestRows().map((row) => ({
        ...row,
        amount: row.position === 1 ? 999 : row.amount,
      }));
      setCurrentGridRows(editedRows);

      // The edit exists only in the mocked Syncfusion grid.
      expect(getLatestRows()[0].amount).not.toBe(999);

      await enterCashers(user, String(initialCashers + 1));

      expect(getLatestRows()[0]).toEqual(
        expect.objectContaining({ position: 1, amount: 999 }),
      );
      expect(getLatestRows().at(-1)).toEqual(
        expect.objectContaining({
          position: initialCashers + 1,
          amount: 0,
          percentage: 0,
        }),
      );
    });

    it("clamps values above the number of players on blur and shows an error", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterCashers(user, "999");

      expect(getLatestRows()).toHaveLength(numPlayers);
      expect(getCashersInput()).toHaveValue(numPlayers);
      expect(getRatioInput()).toHaveValue(1);
      expect(getCalcCashersInput()).toHaveValue(numPlayers);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(numPlayers - initialCashers);
      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(screen.getByTestId("dangerCashers")).toHaveTextContent(
        cashersErrMsg(numPlayers),
      );
    });

    it("clamps values above the number of players when Enter is pressed", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterCashers(user, "999", "enter");

      expect(getLatestRows()).toHaveLength(numPlayers);
      expect(getCashersInput()).toHaveValue(numPlayers);
      expect(screen.getByTestId("dangerCashers")).toHaveTextContent(
        cashersErrMsg(numPlayers),
      );
    });

    it("clears the error when the user types again", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterCashers(user, "999");
      expect(screen.getByTestId("dangerCashers")).not.toHaveTextContent("");

      await enterCashers(user, String(numPlayers), "none");

      expect(screen.getByTestId("dangerCashers")).toHaveTextContent("");
    });
  });

  /***************
   * Decreasing  *
   ***************/

  describe("decreasing the number of cashers", () => {
    it("asks for confirmation on blur before removing rows", async () => {
      const { user, initialCashers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2); // mock data precondition
      const newCashers = initialCashers - 1;

      await enterCashers(user, String(newCashers));

      expect(queryConfirmModal()).toBeInTheDocument();
      expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
      expect(
        screen.getByText(removeMsg(initialCashers, newCashers)),
      ).toBeInTheDocument();

      // Nothing removed yet.
      expect(getLatestRows()).toHaveLength(initialCashers);
      expect(getCashersInput()).toHaveValue(newCashers);
    });

    it("asks for confirmation when Enter is pressed", async () => {
      const { user, initialCashers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterCashers(user, "1", "enter");

      expect(queryConfirmModal()).toBeInTheDocument();
      expect(screen.getByText(removeMsg(initialCashers, 1))).toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("removes rows from the end when Yes is clicked", async () => {
      const { user, initialCashers, numPlayers, populatedRows } =
        setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterCashers(user, "1");
      await confirmRemoveCashers(user);

      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getLatestRows()).toEqual([populatedRows[0]]);
      expect(getCashersInput()).toHaveValue(1);
      expect(getRatioInput()).toHaveValue(ratioValue(numPlayers, 1));
      expect(getCalcCashersInput()).toHaveValue(1);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("preserves unsaved grid edits when removing rows", async () => {
      const { user, initialCashers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      const editedRows = getLatestRows().map((row) => ({
        ...row,
        amount: row.position === 1 ? 777 : row.amount,
      }));
      setCurrentGridRows(editedRows);

      await enterCashers(user, "1");
      await confirmRemoveCashers(user);

      expect(getLatestRows()).toHaveLength(1);
      expect(getLatestRows()[0].amount).toBe(777);
    });

    it("keeps the rows and restores the inputs when No is clicked", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);
      const rowsBefore = getLatestRows();

      await enterCashers(user, "1");

      // The ratio preview follows the requested count while the modal is open.
      expect(getRatioInput()).toHaveValue(ratioValue(numPlayers, 1));

      await cancelRemoveCashers(user);

      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getLatestRows()).toBe(rowsBefore);

      // confirmNo restores the last applied values.
      expect(getCashersInput()).toHaveValue(initialCashers);
      expect(getRatioInput()).toHaveValue(
        ratioValue(numPlayers, initialCashers),
      );
      expect(getCalcCashersInput()).toHaveValue(initialCashers);
    });
  });

  /******************
   * Below minimum  *
   ******************/

  describe("values below the minimum", () => {
    it("clamps 0 to 1 on blur, shows an error and asks before removing", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterCashers(user, "0");

      expect(screen.getByTestId("dangerCashers")).toHaveTextContent(
        cashersErrMsg(numPlayers),
      );
      expect(screen.getByText(removeMsg(initialCashers, 1))).toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(initialCashers);

      await confirmRemoveCashers(user);

      expect(getLatestRows()).toHaveLength(1);
      expect(getCashersInput()).toHaveValue(1);
      expect(getRatioInput()).toHaveValue(ratioValue(numPlayers, 1));
      expect(getCalcCashersInput()).toHaveValue(1);

      // The error explaining the clamp stays visible after confirming.
      expect(screen.getByTestId("dangerCashers")).toHaveTextContent(
        cashersErrMsg(numPlayers),
      );
    });

    it("clamps 0 to 1 when Enter is pressed", async () => {
      const { user, initialCashers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterCashers(user, "0", "enter");

      expect(screen.getByText(removeMsg(initialCashers, 1))).toBeInTheDocument();

      await confirmRemoveCashers(user);

      expect(getLatestRows()).toHaveLength(1);
      expect(getCashersInput()).toHaveValue(1);
    });

    it("clears the error and restores the input when removal is declined", async () => {
      const { user, initialCashers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterCashers(user, "0");
      await cancelRemoveCashers(user);

      expect(screen.getByTestId("dangerCashers")).toHaveTextContent("");
      expect(getCashersInput()).toHaveValue(initialCashers);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });
  });

  /*****************
   * Player limits *
   *****************/

  describe("maximum with one player", () => {
    it("limits cashers to 1 and says so in the error", async () => {
      const { user } = setup({
        tmntData: {
          ...mockTmntFullData,
          players: mockTmntFullData.players.slice(0, 1),
        },
      });

      await enterCashers(user, "5");

      expect(screen.getByTestId("dangerCashers")).toHaveTextContent(
        cashersErrMsg(1),
      );
    });
  });
});
