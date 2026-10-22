import { screen, waitFor } from "@testing-library/react";
import {
  cancelRemoveCashers,
  confirmRemoveCashers,
  getCashersError,
  getCashersInput,
  getGridCancelButton,
  getLatestRows,
  mockBtDbUuid,
  mockUseUnsavedChangesGuard,
  setCurrentGridRows,
  setup,
  standardBeforeEach,
} from "./potPfPage.testSetup.test";
import {
  mockTmntFullData,
  potId1,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const queryConfirmModal = () =>
  screen.queryByRole("dialog", { name: "confirm-modal" });

const findConfirmModal = () =>
  screen.findByRole("dialog", { name: "confirm-modal" });

const getPotPlayerCount = (): number =>
  mockTmntFullData.potEntries.filter(
    (entry) => entry.pot_id === potId1,
  ).length;

/** The error shown when the entered casher count is out of range. */
const cashersRangeError = (numPlayers: number): string =>
  `Cashers must be a whole number between 1 and ${numPlayers <= 1 ? 1 : numPlayers}`;

describe("Pot Prize Fund web page cashers input", () => {
  beforeEach(standardBeforeEach);

  describe("when there are no existing prize fund rows", () => {
    const setupEmpty = () =>
      setup({
        potPfs: [],
      });

    it("shows 0 cashers when no prize fund rows exist", async () => {
      setupEmpty();

      await waitFor(() => {
        expect(getCashersInput()).toHaveValue(0);
      });

      expect(getLatestRows()).toHaveLength(0);
    });

    it("entering the first casher creates the first row", async () => {
      const { user } = setupEmpty();

      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(0);
      });
      expect(getLatestRows()).toHaveLength(0);

      await user.clear(cashersInput);
      await user.type(cashersInput, "1");
      await user.tab();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(1);
      });
      expect(getLatestRows()).toHaveLength(1);

      expect(getLatestRows()[0]).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^ppf_/),
          parent_id: potId1,
          position: 1,
          amount: 0,
          percentage: 0,
        }),
      );

      expect(mockBtDbUuid).toHaveBeenCalledTimes(1);
      expect(mockBtDbUuid).toHaveBeenCalledWith("ppf");
      expect(getCashersError()).toHaveTextContent("");
    });
  });

  describe("when there are existing prize fund rows", () => {
    /*************
     * Rendering *
     *************/

    it("limits the input's max attribute to the number of pot players", () => {
      setup();

      expect(getCashersInput()).toHaveAttribute(
        "max",
        String(getPotPlayerCount()),
      );
    });

    /**********
     * Typing *
     **********/

    it("updates the cashers input when its value changes", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "3");

      expect(cashersInput).toHaveValue(3);

      // typing alone does not resize the grid
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("ignores invalid non-digit input", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "abc");

      /*
       * Clearing the controlled input sets cashers to zero.
       * The number input rejects the letters, so no valid
       * replacement value is entered.
       */
      expect(cashersInput).toHaveValue(0);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("arms the unsaved changes guard when the cashers input changes", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "3");

      await waitFor(() => {
        expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
      });
    });

    it("does nothing when the entered value equals the current casher count", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const cashersInput = getCashersInput();

      await user.clear(cashersInput);
      await user.type(cashersInput, String(initialCashers));
      await user.keyboard("{Enter}");
      await user.tab();

      expect(getLatestRows()).toHaveLength(initialCashers);
      expect(cashersInput).toHaveValue(initialCashers);
      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(mockBtDbUuid).not.toHaveBeenCalled();
      expect(getCashersError()).toHaveTextContent("");
    });

    /*****************
     * Adding cashers *
     *****************/

    it("adds rows on blur when the cashers value increases", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = initialCashers + 2;
      expect(getPotPlayerCount()).toBeGreaterThanOrEqual(newCashers);

      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, newCashers.toString());
      await user.tab();

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(newCashers);
      });

      expect(cashersInput).toHaveValue(newCashers);
      expect(getCashersError()).toHaveTextContent("");

      expect(mockBtDbUuid).toHaveBeenCalledTimes(newCashers - initialCashers);
      expect(mockBtDbUuid).toHaveBeenCalledWith("ppf");

      const addedRows = getLatestRows().slice(initialCashers);

      expect(addedRows).toEqual([
        expect.objectContaining({
          id: expect.stringMatching(/^ppf_/),
          parent_id: potId1,
          position: initialCashers + 1,
          amount: 0,
          percentage: 0,
        }),
        expect.objectContaining({
          id: expect.stringMatching(/^ppf_/),
          parent_id: potId1,
          position: initialCashers + 2,
          amount: 0,
          percentage: 0,
        }),
      ]);

      const addedIds = addedRows.map((row) => row.id);
      expect(new Set(addedIds).size).toBe(addedIds.length);
    });

    it("adds rows when Enter is pressed and the cashers value increases", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = initialCashers + 2;
      expect(getPotPlayerCount()).toBeGreaterThanOrEqual(newCashers);

      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, newCashers.toString());
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(newCashers);
      });

      expect(cashersInput).toHaveValue(newCashers);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(newCashers - initialCashers);
      expect(mockBtDbUuid).toHaveBeenCalledWith("ppf");
    });

    it("preserves unsaved grid edits when adding cashers", async () => {
      const { user } = setup();

      const initialRows = getLatestRows();

      const editedRows = getLatestRows().map((row) => ({
        ...row,
        amount: row.position === 1 ? 999 : row.amount,
      }));

      setCurrentGridRows(editedRows);

      /*
       * Prove the unsaved edit exists only in the
       * mocked Syncfusion grid.
       */
      expect(getLatestRows()[0].amount).not.toBe(999);
      expect(getLatestRows()).toHaveLength(initialRows.length);

      const cashersInput = getCashersInput();

      await user.clear(cashersInput);
      await user.type(cashersInput, (editedRows.length + 1).toString());
      await user.tab();

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(editedRows.length + 1);
      });

      /*
       * The existing grid-only edit was preserved.
       */
      expect(getLatestRows()[0]).toEqual(
        expect.objectContaining({
          position: 1,
          amount: 999,
        }),
      );

      /*
       * The newly added row has the expected defaults.
       */
      expect(getLatestRows().at(-1)).toEqual(
        expect.objectContaining({
          parent_id: potId1,
          position: editedRows.length + 1,
          amount: 0,
          percentage: 0,
        }),
      );
    });

    it("applies the typed value when focus moves to a grid button other than Cancel", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = initialCashers + 1;
      expect(getPotPlayerCount()).toBeGreaterThanOrEqual(newCashers);

      await user.clear(getCashersInput());
      await user.type(getCashersInput(), String(newCashers));
      await user.click(screen.getByRole("button", { name: "Grid Changed" }));

      expect(getLatestRows()).toHaveLength(newCashers);
      expect(getCashersInput()).toHaveValue(newCashers);
    });

    /*******************
     * Removing cashers *
     *******************/

    it("opens a confirmation dialog on blur when the cashers value decreases", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);
      const newCashers = initialCashers - 1;
      const removeCount = initialCashers - newCashers;

      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, newCashers.toString());
      await user.tab();

      expect(await findConfirmModal()).toBeInTheDocument();
      expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
      expect(
        screen.getByText(
          `Do you want to remove ${removeCount} cashers? ` +
          `Going from ${initialCashers} cashers to ${newCashers} cashers.`,
        ),
      ).toBeInTheDocument();

      expect(cashersInput).toHaveValue(newCashers);

      /*
       * Rows are not removed until the user confirms.
       */
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("opens a confirmation dialog when Enter decreases the cashers value", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);
      const newCashers = 1;

      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, newCashers.toString());
      await user.keyboard("{Enter}");

      expect(await findConfirmModal()).toBeInTheDocument();
      expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("removes rows when the confirmation Yes button is clicked", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);
      const newCashers = 1;
      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, newCashers.toString());
      await user.tab();

      expect(await findConfirmModal()).toBeInTheDocument();

      await confirmRemoveCashers(user);

      await waitFor(() => {
        expect(queryConfirmModal()).not.toBeInTheDocument();
      });

      expect(cashersInput).toHaveValue(newCashers);
      expect(getLatestRows()).toHaveLength(newCashers);

      expect(getLatestRows()).toEqual([
        expect.objectContaining({
          parent_id: potId1,
          position: 1,
        }),
      ]);
    });

    it("preserves unsaved grid edits before removing cashers", async () => {
      const { user } = setup();

      expect(getLatestRows().length).toBeGreaterThan(1);

      const editedRows = getLatestRows().map((row) => ({
        ...row,
        amount: row.position === 1 ? 777 : row.amount,
      }));

      setCurrentGridRows(editedRows);

      const cashersInput = getCashersInput();

      await user.clear(cashersInput);
      await user.type(cashersInput, "1");
      await user.tab();

      await confirmRemoveCashers(user);

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(1);
      });

      expect(getLatestRows()[0].amount).toBe(777);
    });

    it("keeps the existing rows and restores the input when the confirmation No button is clicked", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);
      const newCashers = 1;
      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, newCashers.toString());
      await user.tab();

      expect(await findConfirmModal()).toBeInTheDocument();

      await cancelRemoveCashers(user);

      await waitFor(() => {
        expect(queryConfirmModal()).not.toBeInTheDocument();
      });

      /*
       * confirmNo() closes the modal and restores the input to the
       * casher count currently applied to the grid.
       */
      expect(cashersInput).toHaveValue(initialCashers);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("can try the same reduction again after clicking No", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);

      await user.clear(getCashersInput());
      await user.type(getCashersInput(), "1");
      await user.tab();
      await cancelRemoveCashers(user);

      await user.clear(getCashersInput());
      await user.type(getCashersInput(), "1");
      await user.tab();

      expect(await findConfirmModal()).toBeInTheDocument();

      await confirmRemoveCashers(user);

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(1);
      });
    });

    /*******************************
     * Out-of-range values (clamp) *
     *******************************/

    it("changes values below the minimum to 1 when Enter is pressed", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);
      const expectedCashers = 1;

      const cashersInput = getCashersInput();

      await user.clear(cashersInput);
      await user.type(cashersInput, "0");
      await user.keyboard("{Enter}");

      /*
       * Zero is clamped to the minimum of one casher.
       *
       * Because this decreases the current number of cashers,
       * the rows are not removed until the user confirms.
       */
      expect(await findConfirmModal()).toBeInTheDocument();

      expect(
        screen.getByText(
          `Do you want to remove ${initialCashers - expectedCashers} cashers? ` +
          `Going from ${initialCashers} cashers to ${expectedCashers} cashers.`,
        ),
      ).toBeInTheDocument();

      expect(getCashersError()).toHaveTextContent(
        cashersRangeError(getPotPlayerCount()),
      );

      /*
       * The grid still contains the original rows
       * before confirmation.
       */
      expect(getLatestRows()).toHaveLength(initialCashers);

      await confirmRemoveCashers(user);

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(expectedCashers);
      });

      expect(cashersInput).toHaveValue(expectedCashers);
    });

    it("changes values below the minimum to 1 on blur after removal is confirmed", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);

      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "0");
      await user.tab();

      /*
       * handleCashersBlur() clamps zero to one.
       * Since this decreases the number of cashers,
       * the confirmation modal opens before rows
       * are removed.
       */
      expect(await findConfirmModal()).toBeInTheDocument();
      expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
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

      expect(cashersInput).toHaveValue(1);
    });

    it("clears the range error when No is clicked", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);

      await user.clear(getCashersInput());
      await user.type(getCashersInput(), "0");
      await user.tab();

      expect(getCashersError()).toHaveTextContent(
        cashersRangeError(getPotPlayerCount()),
      );

      await cancelRemoveCashers(user);

      expect(getCashersError()).toHaveTextContent("");
      expect(getCashersInput()).toHaveValue(initialCashers);
    });

    it("applies the minimum when the input is cleared and left blank", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);

      await user.clear(getCashersInput());
      await user.tab();

      /*
       * Clearing the input sets cashers to 0 (handleCashersChange), so
       * leaving it blank applies 0, which is clamped to the minimum of 1.
       */
      expect(await findConfirmModal()).toBeInTheDocument();
      expect(
        screen.getByText(
          `Do you want to remove ${initialCashers - 1} cashers? ` +
          `Going from ${initialCashers} cashers to 1 cashers.`,
        ),
      ).toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("changes values above the maximum to the number of pot players when Enter is pressed", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const expectedCashers = getPotPlayerCount();
      const cashersInput = getCashersInput();

      await user.clear(cashersInput);
      await user.type(cashersInput, "999");
      await user.keyboard("{Enter}");

      /*
       * The entered value is clamped to the number of
       * entries belonging to this pot.
       *
       * Because this increases the number of cashers,
       * rows are added immediately without confirmation.
       */
      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(expectedCashers);
      });

      expect(cashersInput).toHaveValue(expectedCashers);
      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getCashersError()).toHaveTextContent(
        cashersRangeError(expectedCashers),
      );

      expect(mockBtDbUuid).toHaveBeenCalledTimes(expectedCashers - initialCashers);
      expect(mockBtDbUuid).toHaveBeenCalledWith("ppf");
    });

    it("changes values above the maximum to the number of pot players on blur", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const maxCashers = getPotPlayerCount();
      const cashersInput = getCashersInput();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(initialCashers);
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "999");
      await user.tab();

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(maxCashers);
      });

      expect(cashersInput).toHaveValue(maxCashers);
      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getCashersError()).toHaveTextContent(cashersRangeError(maxCashers));

      expect(mockBtDbUuid).toHaveBeenCalledTimes(maxCashers - initialCashers);
      expect(mockBtDbUuid).toHaveBeenCalledWith("ppf");
    });

    it("clears the range error when the user types again", async () => {
      const { user } = setup();

      await user.clear(getCashersInput());
      await user.type(getCashersInput(), "999");
      await user.tab();

      expect(getCashersError()).not.toHaveTextContent("");

      await user.type(getCashersInput(), "1");

      expect(getCashersError()).toHaveTextContent("");
    });

    it("does not add more cashers than the number of entries for the current pot", async () => {
      const { user } = setup();

      const maxCashers = getPotPlayerCount();
      const cashersInput = getCashersInput();

      await user.clear(cashersInput);
      await user.type(cashersInput, (maxCashers + 10).toString());
      await user.tab();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(maxCashers);
      });

      expect(getLatestRows()).toHaveLength(maxCashers);
    });

    it("uses only entries belonging to the current pot when determining the maximum cashers", async () => {
      const { user } = setup();

      const currentPotEntries = mockTmntFullData.potEntries.filter(
        (entry) => entry.pot_id === potId1,
      );

      const otherPotEntries = mockTmntFullData.potEntries.filter(
        (entry) => entry.pot_id !== potId1,
      );

      // the mock data must include entries for other pots for this test to mean anything
      expect(otherPotEntries.length).toBeGreaterThan(0);

      const cashersInput = getCashersInput();

      await user.clear(cashersInput);
      await user.type(cashersInput, "999");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(currentPotEntries.length);
      });

      expect(getLatestRows()).toHaveLength(currentPotEntries.length);
    });

    /***********************
     * Grid Cancel button *
     ***********************/

    it("discards a typed reduction when the grid's Cancel button is clicked", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);

      // typing marks the page as changed, which enables Cancel
      await user.clear(getCashersInput());
      await user.type(getCashersInput(), "1");
      await user.click(getGridCancelButton());

      // the blur does not apply "1", so no remove-cashers dialog
      expect(queryConfirmModal()).not.toBeInTheDocument();
      expect(getCashersInput()).toHaveValue(initialCashers);
      expect(getLatestRows()).toHaveLength(initialCashers);
      expect(getCashersError()).toHaveTextContent("");
    });

    it("removes added cashers when the grid's Cancel button is clicked", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = initialCashers + 1;
      expect(getPotPlayerCount()).toBeGreaterThanOrEqual(newCashers);

      await user.clear(getCashersInput());
      await user.type(getCashersInput(), String(newCashers));
      await user.keyboard("{Enter}");
      expect(getLatestRows()).toHaveLength(newCashers);

      await user.click(getGridCancelButton());

      expect(getLatestRows()).toHaveLength(initialCashers);
      expect(getCashersInput()).toHaveValue(initialCashers);
    });

    it("restores removed cashers when the grid's Cancel button is clicked", async () => {
      const { user, populatedRows } = setup();

      const initialCashers = getLatestRows().length;
      expect(initialCashers).toBeGreaterThan(1);

      await user.clear(getCashersInput());
      await user.type(getCashersInput(), "1");
      await user.keyboard("{Enter}");
      await confirmRemoveCashers(user);
      expect(getLatestRows()).toHaveLength(1);

      await user.click(getGridCancelButton());

      expect(getLatestRows()).toEqual(populatedRows);
      expect(getCashersInput()).toHaveValue(initialCashers);
    });
  });
});
