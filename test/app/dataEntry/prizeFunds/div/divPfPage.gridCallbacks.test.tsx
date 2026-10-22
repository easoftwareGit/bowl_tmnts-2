import { fireEvent, screen } from "@testing-library/react";
import {
  confirmRemoveCashers,
  enterCashers,
  enterRatio,
  getCalcCashersInput,
  getCashersInput,
  getGridCancelButton,
  getLatestGridProps,
  getLatestRows,
  getRatioInput,
  mockBtDbUuid,
  mockUseUnsavedChangesGuard,
  setGridCancelDisabled,
  setup,
  standardBeforeEach,
  triggerGridCancel,
  triggerGridDataChanged,
  triggerGridDataReset,
} from "./divPfPage.testSetup";

/*
 * Callbacks and props the page passes to DivPrizeFundGrid:
 *   - rows / divId / totalPrizeFund / enableEditing / gridDataWasChanged
 *   - onGridDataChanged / onGridDataReset  -> gridDataWasChanged flag
 *   - onCancel (handleGridCancel)          -> restore last saved state
 *   - blur onto the grid's Cancel button   -> typed Ratio/Cashers discarded
 *
 * onSaveComplete / onNavigateAfterSave are in afterSave.test.
 * onBack is in backButton.test.
 */

const queryConfirmModal = () =>
  screen.queryByRole("dialog", { name: "confirm-modal" });

const ratioValue = (numPlayers: number, cashers: number): number =>
  Number((numPlayers / cashers).toFixed(2));

const setupWithRows = () => {
  const result = setup();
  return {
    ...result,
    initialCashers: result.populatedRows.length,
    numPlayers: result.tmntData.players.length,
  };
};

describe("Division Prize Fund web page grid callbacks", () => {
  beforeEach(standardBeforeEach);

  /*********
   * Props *
   *********/

  describe("props passed to the grid", () => {
    it("passes the loaded rows, division and prize fund", () => {
      const { populatedRows, divId, divPrizeFund } = setup();

      const props = getLatestGridProps();
      expect(props?.rows).toEqual(populatedRows);
      expect(props?.divId).toBe(divId);
      expect(props?.totalPrizeFund).toBe(divPrizeFund);
      expect(props?.enableEditing).toBe(true);
      expect(props?.gridDataWasChanged).toBe(false);
    });

    it("reports gridDataWasChanged when only the page inputs changed", async () => {
      const { user, initialCashers } = setupWithRows();

      await enterCashers(user, String(initialCashers), "none");

      expect(getLatestGridProps()?.gridDataWasChanged).toBe(true);
    });
  });

  /***************************************
   * onGridDataChanged / onGridDataReset *
   ***************************************/

  describe("grid change flag", () => {
    it("onGridDataChanged marks the page changed and arms the guard", () => {
      setup();

      triggerGridDataChanged();

      expect(getLatestGridProps()?.gridDataWasChanged).toBe(true);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });

    it("onGridDataReset clears the grid change flag", () => {
      setup();

      triggerGridDataChanged();
      triggerGridDataReset();

      expect(getLatestGridProps()?.gridDataWasChanged).toBe(false);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("onGridDataReset does not clear changes made in the page inputs", async () => {
      const { user, initialCashers } = setupWithRows();

      await enterCashers(user, String(initialCashers), "none");
      triggerGridDataChanged();
      triggerGridDataReset();

      expect(getLatestGridProps()?.gridDataWasChanged).toBe(true);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });
  });

  /************************
   * onCancel (grid Cancel) *
   ************************/

  describe("onCancel", () => {
    it("restores rows, cashers, ratio and calculated cashers after cashers were added", async () => {
      const { user, populatedRows, initialCashers, numPlayers } =
        setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers); // mock data precondition

      await enterCashers(user, String(initialCashers + 1));
      expect(getLatestRows()).toHaveLength(initialCashers + 1);

      // Real grid order on a confirmed Cancel: onGridDataReset, then onCancel.
      triggerGridDataReset();
      triggerGridCancel();

      expect(getLatestRows()).toEqual(populatedRows);
      expect(getCashersInput()).toHaveValue(initialCashers);
      expect(getRatioInput()).toHaveValue(
        ratioValue(numPlayers, initialCashers),
      );
      expect(getCalcCashersInput()).toHaveValue(initialCashers);
    });

    it("restores rows that were removed", async () => {
      const { user, populatedRows, initialCashers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterCashers(user, "1");
      await confirmRemoveCashers(user);
      expect(getLatestRows()).toHaveLength(1);

      triggerGridCancel();

      expect(getLatestRows()).toEqual(populatedRows);
      expect(getCashersInput()).toHaveValue(initialCashers);
    });

    it("passes the grid copies of the saved rows, not the saved array itself", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      triggerGridCancel();
      const firstRestore = getLatestRows();

      await enterCashers(user, String(initialCashers + 1));
      triggerGridCancel();
      const secondRestore = getLatestRows();

      expect(secondRestore).toEqual(firstRestore);
      expect(secondRestore).not.toBe(firstRestore);
      secondRestore.forEach((row, index) => {
        expect(row).not.toBe(firstRestore[index]);
      });
    });

    it("clears the page change flag and errors", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterCashers(user, "999"); // clamped, with an error
      await enterRatio(user, "0", "enter"); // clamped, with an error
      expect(screen.getByTestId("dangerCashers")).not.toHaveTextContent("");

      triggerGridDataReset();
      triggerGridCancel();

      expect(screen.getByTestId("dangerCashers")).toHaveTextContent("");
      expect(screen.getByTestId("dangerRatio")).toHaveTextContent("");
      expect(getLatestGridProps()?.gridDataWasChanged).toBe(false);
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("resets the applied values so later edits start from the saved state", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThanOrEqual(initialCashers + 2);

      await enterCashers(user, String(initialCashers + 2));
      triggerGridCancel();

      // Adding one from the restored count adds exactly one row.
      mockBtDbUuid.mockClear();
      await enterCashers(user, String(initialCashers + 1));

      expect(getLatestRows()).toHaveLength(initialCashers + 1);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(1);
      expect(queryConfirmModal()).not.toBeInTheDocument();
    });
  });

  /*********************************
   * Blur onto the grid's Cancel   *
   *********************************/

  describe("clicking the grid's Cancel while typing", () => {
    it("discards a typed casher increase instead of adding rows", async () => {
      const { user, populatedRows, initialCashers, numPlayers } =
        setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterCashers(user, String(initialCashers + 1), "none");
      await user.click(getGridCancelButton());

      expect(mockBtDbUuid).not.toHaveBeenCalled();
      expect(getLatestRows()).toEqual(populatedRows);
      expect(getCashersInput()).toHaveValue(initialCashers);
    });

    it("discards a typed casher decrease without asking to remove rows", async () => {
      const { user, initialCashers } = setupWithRows();
      expect(initialCashers).toBeGreaterThanOrEqual(2);

      await enterCashers(user, "1", "none");
      await user.click(getGridCancelButton());

      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(initialCashers);
      expect(getCashersInput()).toHaveValue(initialCashers);
    });

    it("discards a typed ratio", async () => {
      const { user, populatedRows, initialCashers, numPlayers } =
        setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      // Ratio 1 would mean one casher per player (rows would be added).
      await enterRatio(user, "1", "none");
      await user.click(getGridCancelButton());

      expect(getLatestRows()).toEqual(populatedRows);
      expect(getRatioInput()).toHaveValue(
        ratioValue(numPlayers, initialCashers),
      );
      expect(screen.getByTestId("dangerRatio")).toHaveTextContent("");
    });

    it("discards the typed value when blur has no relatedTarget (Safari)", () => {
      const { populatedRows, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      const cashersInput = getCashersInput();
      fireEvent.change(cashersInput, {
        target: { value: String(initialCashers + 1) },
      });

      // Safari: mousedown on the button, but focus does not move to it.
      fireEvent.mouseDown(getGridCancelButton());
      fireEvent.blur(cashersInput, { relatedTarget: null });

      expect(getLatestRows()).toEqual(populatedRows);
      expect(getCashersInput()).toHaveValue(initialCashers);
    });

    it("applies the typed value when blur has no relatedTarget and Cancel was not pressed", () => {
      const { initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      const cashersInput = getCashersInput();
      fireEvent.change(cashersInput, {
        target: { value: String(initialCashers + 1) },
      });
      fireEvent.blur(cashersInput, { relatedTarget: null });

      expect(getLatestRows()).toHaveLength(initialCashers + 1);
    });

    it("applies the typed value normally after the Cancel click has finished", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await user.click(getGridCancelButton());

      // The mousedown flag is cleared after that click's event.
      await enterCashers(user, String(initialCashers + 1));

      expect(getLatestRows()).toHaveLength(initialCashers + 1);
    });

    it("applies the typed value when another grid button is clicked", async () => {
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterCashers(user, String(initialCashers + 1), "none");
      await user.click(screen.getByRole("button", { name: "Grid Changed" }));

      expect(getLatestRows()).toHaveLength(initialCashers + 1);
    });

    it("applies the typed value when the grid's Cancel button is disabled", async () => {
      setGridCancelDisabled(true);
      const { user, initialCashers, numPlayers } = setupWithRows();
      expect(numPlayers).toBeGreaterThan(initialCashers);

      await enterCashers(user, String(initialCashers + 1), "none");
      await user.click(getGridCancelButton());

      expect(getLatestRows()).toHaveLength(initialCashers + 1);
      expect(getCashersInput()).toHaveValue(initialCashers + 1);
    });
  });
});
