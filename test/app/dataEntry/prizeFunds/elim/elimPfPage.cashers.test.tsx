import { screen } from "@testing-library/react";
import {
  cancelRemoveCashers,
  cashersRangeError,
  clickGridCancel,
  confirmRemoveCashers,
  enterCashers,
  getInputs,
  getLatestRows,
  mockBtDbUuid,
  mockUseUnsavedChangesGuard,
  setCurrentGridRows,
  setup,
  standardBeforeEach,
  type SetupOptions,
} from "./elimPfPage.testSetup";
import {
  elimId1,
  mockElimPfs,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*************
 * Helpers   *
 *************/

const findConfirmModal = () =>
  screen.findByRole("dialog", { name: "confirm-modal" });

const queryConfirmModal = () =>
  screen.queryByRole("dialog", { name: "confirm-modal" });

/** The Cashers error message element. */
const cashersError = () => screen.getByTestId("dangerCashers");

/**
 * The Remove Cashers message built by updateCashers() in page.tsx.
 */
const removeMessage = (from: number, to: number): string =>
  `Do you want to remove ${from - to} cashers? ` +
  `Going from ${from} cashers to ${to} cashers.`;

/**
 * Expected shape of a row added by updateCashers().
 */
const newRow = (position: number) =>
  expect.objectContaining({
    id: expect.stringMatching(/^epf_/),
    parent_id: elimId1,
    position,
    amount: 0,
    percentage: 0,
  });

describe("Elim Prize Fund web page cashers input", () => {
  beforeEach(standardBeforeEach);

  /*******************************
   * No saved prize-fund rows    *
   *******************************/

  describe("when there are no existing prize fund rows", () => {
    const setupEmpty = (numPlayers?: number) =>
      setup({ elimPfs: [], numPlayers });

    it("shows 0 cashers and passes no rows to the grid", () => {
      setupEmpty();

      expect(getInputs().cashers).toHaveValue(0);
      expect(getLatestRows()).toHaveLength(0);
    });

    it("entering the first casher creates the first row", async () => {
      const { user } = setupEmpty();

      await enterCashers(user, "1");

      expect(getInputs().cashers).toHaveValue(1);
      expect(getLatestRows()).toEqual([newRow(1)]);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(1);
      expect(mockBtDbUuid).toHaveBeenCalledWith("epf");
      expect(cashersError()).toHaveTextContent("");
    });

    it("entering several cashers creates numbered rows without a confirmation", async () => {
      const { user, numPlayers } = setupEmpty();

      // Precondition: enough players for 3 cashers.
      expect(numPlayers).toBeGreaterThanOrEqual(3);

      await enterCashers(user, "3");

      expect(getLatestRows()).toEqual([newRow(1), newRow(2), newRow(3)]);
      expect(queryConfirmModal()).not.toBeInTheDocument();
    });

    it.each([0, 1])(
      "allows at most 1 casher when the eliminator has %i player(s)",
      async (players) => {
        const { user, maxCashers } = setupEmpty(players);

        expect(maxCashers).toBe(1);

        await enterCashers(user, "5");

        expect(getInputs().cashers).toHaveValue(1);
        expect(getLatestRows()).toEqual([newRow(1)]);
        expect(cashersError()).toHaveTextContent(cashersRangeError(1));
      },
    );
  });

  /*******************************
   * Saved prize-fund rows       *
   *******************************/

  describe("when there are existing prize fund rows", () => {
    /*
     * Most tests below need room to add and remove cashers.
     * These preconditions make a mock-data change fail clearly
     * instead of producing a confusing assertion failure.
     */
    const setupWithRows = (options: SetupOptions = {}) => {
      const result = setup(options);
      const initialCashers = result.populatedRows.length;

      expect(initialCashers).toBe(result.expectedCashers);
      expect(initialCashers).toBeGreaterThan(1);
      expect(result.numPlayers).toBeGreaterThanOrEqual(initialCashers + 2);

      return { ...result, initialCashers };
    };

    it("shows the number of saved prize fund rows", () => {
      const { initialCashers } = setupWithRows();

      expect(getInputs().cashers).toHaveValue(initialCashers);
      expect(getLatestRows()).toHaveLength(initialCashers);
      expect(cashersError()).toHaveTextContent("");
    });

    describe("typing", () => {
      it("updates the input without changing the rows until applied", async () => {
        const { user, initialCashers } = setupWithRows();
        const { cashers } = getInputs();

        await user.clear(cashers);
        await user.type(cashers, "3");

        expect(cashers).toHaveValue(3);
        expect(getLatestRows()).toHaveLength(initialCashers);
      });

      it("ignores non-digit input", async () => {
        const { user, initialCashers } = setupWithRows();
        const { cashers } = getInputs();

        await user.clear(cashers);
        await user.type(cashers, "abc");

        // Clearing sets cashers to 0; the letters are rejected.
        expect(cashers).toHaveValue(0);
        expect(getLatestRows()).toHaveLength(initialCashers);
      });

      it("arms the unsaved changes guard", async () => {
        const { user } = setupWithRows();
        const { cashers } = getInputs();

        await user.clear(cashers);
        await user.type(cashers, "3");

        expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
      });
    });

    describe("increasing cashers", () => {
      it.each(["blur", "enter"] as const)(
        "adds rows on %s",
        async (applyWith) => {
          const { user, initialCashers } = setupWithRows();
          const newCashers = initialCashers + 2;

          await enterCashers(user, String(newCashers), applyWith);

          expect(getInputs().cashers).toHaveValue(newCashers);
          expect(getLatestRows()).toHaveLength(newCashers);
          expect(getLatestRows().slice(initialCashers)).toEqual([
            newRow(initialCashers + 1),
            newRow(initialCashers + 2),
          ]);
          expect(queryConfirmModal()).not.toBeInTheDocument();

          expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
          expect(mockBtDbUuid).toHaveBeenCalledWith("epf");

          const addedIds = getLatestRows()
            .slice(initialCashers)
            .map((row) => row.id);
          expect(new Set(addedIds).size).toBe(addedIds.length);
        },
      );

      it("keeps the existing rows unchanged", async () => {
        const { user, initialCashers, populatedRows } = setupWithRows();

        await enterCashers(user, String(initialCashers + 1));

        expect(getLatestRows().slice(0, initialCashers)).toEqual(
          populatedRows,
        );
      });

      it("preserves unsaved grid edits", async () => {
        const { user, initialCashers } = setupWithRows();

        // Simulate an edit that exists only inside the Syncfusion grid.
        const editedRows = getLatestRows().map((row) => ({
          ...row,
          amount: row.position === 1 ? 999 : row.amount,
        }));
        setCurrentGridRows(editedRows);
        expect(getLatestRows()[0].amount).not.toBe(999);

        await enterCashers(user, String(initialCashers + 1));

        expect(getLatestRows()).toHaveLength(initialCashers + 1);
        expect(getLatestRows()[0]).toEqual(
          expect.objectContaining({ position: 1, amount: 999 }),
        );
        expect(getLatestRows().at(-1)).toEqual(newRow(initialCashers + 1));
      });
    });

    describe("decreasing cashers", () => {
      it.each(["blur", "enter"] as const)(
        "asks for confirmation on %s and keeps the rows until confirmed",
        async (applyWith) => {
          const { user, initialCashers } = setupWithRows();
          const newCashers = initialCashers - 1;

          await enterCashers(user, String(newCashers), applyWith);

          expect(await findConfirmModal()).toBeInTheDocument();
          expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
          expect(
            screen.getByText(removeMessage(initialCashers, newCashers)),
          ).toBeInTheDocument();

          expect(getInputs().cashers).toHaveValue(newCashers);
          expect(getLatestRows()).toHaveLength(initialCashers);
        },
      );

      it("removes rows from the end when Yes is clicked", async () => {
        const { user, populatedRows } = setupWithRows();

        await enterCashers(user, "1");
        await findConfirmModal();
        await confirmRemoveCashers(user);

        expect(queryConfirmModal()).not.toBeInTheDocument();
        expect(getInputs().cashers).toHaveValue(1);
        expect(getLatestRows()).toEqual([populatedRows[0]]);
      });

      it("preserves unsaved grid edits in the remaining rows", async () => {
        const { user } = setupWithRows();

        const editedRows = getLatestRows().map((row) => ({
          ...row,
          amount: row.position === 1 ? 777 : row.amount,
        }));
        setCurrentGridRows(editedRows);

        await enterCashers(user, "1");
        await findConfirmModal();
        await confirmRemoveCashers(user);

        expect(getLatestRows()).toHaveLength(1);
        expect(getLatestRows()[0].amount).toBe(777);
      });

      it("keeps the rows and restores the applied count when No is clicked", async () => {
        const { user, initialCashers } = setupWithRows();

        await enterCashers(user, "1");
        await findConfirmModal();
        await cancelRemoveCashers(user);

        expect(queryConfirmModal()).not.toBeInTheDocument();
        expect(getLatestRows()).toHaveLength(initialCashers);
        expect(getInputs().cashers).toHaveValue(initialCashers);
      });

      it("can add rows again after a removal is confirmed", async () => {
        const { user } = setupWithRows();

        await enterCashers(user, "1");
        await findConfirmModal();
        await confirmRemoveCashers(user);

        await enterCashers(user, "2");

        expect(getLatestRows()).toHaveLength(2);
        expect(getLatestRows()[1]).toEqual(newRow(2));
      });
    });

    describe("range limits", () => {
      it.each(["blur", "enter"] as const)(
        "changes 0 to the minimum of 1 on %s, after confirmation",
        async (applyWith) => {
          const { user, initialCashers } = setupWithRows();

          await enterCashers(user, "0", applyWith);

          expect(await findConfirmModal()).toBeInTheDocument();
          expect(
            screen.getByText(removeMessage(initialCashers, 1)),
          ).toBeInTheDocument();
          expect(getLatestRows()).toHaveLength(initialCashers);

          await confirmRemoveCashers(user);

          expect(getLatestRows()).toHaveLength(1);
          expect(getInputs().cashers).toHaveValue(1);
        },
      );

      it.each(["blur", "enter"] as const)(
        "changes values above the maximum to the number of players on %s",
        async (applyWith) => {
          const { user, initialCashers, numPlayers } = setupWithRows();

          await enterCashers(user, "999", applyWith);

          expect(getInputs().cashers).toHaveValue(numPlayers);
          expect(getLatestRows()).toHaveLength(numPlayers);
          expect(queryConfirmModal()).not.toBeInTheDocument();
          expect(mockBtDbUuid).toHaveBeenCalledTimes(
            numPlayers - initialCashers,
          );
        },
      );

      it("uses only this eliminator's entries for the maximum", async () => {
        const initialCashers = mockElimPfs.filter(
          (elimPf) => elimPf.elim_id === elimId1,
        ).length;

        /*
         * Trim this eliminator's entries to one more than the saved
         * rows. Entries for other eliminators are left in tmntData,
         * so a maximum based on all entries would allow more rows.
         */
        const { user, tmntData } = setup({
          numPlayers: initialCashers + 1,
        });

        const otherElimEntries =
          tmntData?.elimEntries?.filter(
            (entry) => entry.elim_id !== elimId1,
          ) ?? [];
        expect(otherElimEntries.length).toBeGreaterThan(0);

        await enterCashers(user, "999");

        expect(getInputs().cashers).toHaveValue(initialCashers + 1);
        expect(getLatestRows()).toHaveLength(initialCashers + 1);
      });

      /*
       * Number("") is 0, not NaN, so a cleared input is applied as 0
       * (clamped to 1). The NaN branch in applyEnteredCashers() does not
       * catch it.
       */
      it("treats a cleared input as 0 and asks to go down to 1 casher", async () => {
        const { user, initialCashers, maxCashers } = setupWithRows();

        await enterCashers(user, "");

        expect(await findConfirmModal()).toBeInTheDocument();
        expect(
          screen.getByText(removeMessage(initialCashers, 1)),
        ).toBeInTheDocument();
        expect(cashersError()).toHaveTextContent(
          cashersRangeError(maxCashers),
        );
      });
    });

    describe("error message", () => {
      it("shows no error for a valid count", async () => {
        const { user, initialCashers } = setupWithRows();

        await enterCashers(user, String(initialCashers + 1));

        expect(cashersError()).toHaveTextContent("");
      });

      it.each(["blur", "enter"] as const)(
        "shows the range error for a value above the maximum on %s",
        async (applyWith) => {
          const { user, maxCashers } = setupWithRows();

          await enterCashers(user, "999", applyWith);

          expect(cashersError()).toHaveTextContent(
            cashersRangeError(maxCashers),
          );
        },
      );

      it("shows the range error for 0 and keeps it after the removal is confirmed", async () => {
        const { user, maxCashers } = setupWithRows();

        await enterCashers(user, "0");
        await findConfirmModal();

        expect(cashersError()).toHaveTextContent(
          cashersRangeError(maxCashers),
        );

        // confirmYes() does not clear the error.
        await confirmRemoveCashers(user);

        expect(cashersError()).toHaveTextContent(
          cashersRangeError(maxCashers),
        );
      });

      it("clears the error when No is clicked", async () => {
        const { user } = setupWithRows();

        await enterCashers(user, "0");
        await findConfirmModal();
        await cancelRemoveCashers(user);

        expect(cashersError()).toHaveTextContent("");
      });

      it("clears the error when the user types again", async () => {
        const { user, maxCashers } = setupWithRows();
        const { cashers } = getInputs();

        await enterCashers(user, "999");
        expect(cashersError()).toHaveTextContent(
          cashersRangeError(maxCashers),
        );

        await user.type(cashers, "{Backspace}");

        expect(cashersError()).toHaveTextContent("");
      });
    });

    describe("leaving the input for the grid Cancel button", () => {
      it("discards the typed count instead of applying it", async () => {
        const { user, initialCashers, populatedRows } = setupWithRows();
        const { cashers } = getInputs();

        // Typed but not applied: a decrease would open the modal.
        await user.clear(cashers);
        await user.type(cashers, "1");

        await clickGridCancel(user);

        expect(queryConfirmModal()).not.toBeInTheDocument();
        expect(getInputs().cashers).toHaveValue(initialCashers);
        expect(getLatestRows()).toEqual(populatedRows);
        expect(cashersError()).toHaveTextContent("");
      });

      it("applies the typed count when the Cancel button is disabled", async () => {
        const { user, initialCashers } = setupWithRows({
          gridCancelDisabled: true,
        });
        const { cashers } = getInputs();

        await user.clear(cashers);
        await user.type(cashers, "1");

        await clickGridCancel(user);

        // The blur was not treated as a Cancel, so the decrease applied.
        expect(await findConfirmModal()).toBeInTheDocument();
        expect(
          screen.getByText(removeMessage(initialCashers, 1)),
        ).toBeInTheDocument();
      });
    });

    describe("re-entering the applied count", () => {
      it("does not change rows or open a confirmation", async () => {
        const { user, initialCashers, populatedRows } = setupWithRows();

        await enterCashers(user, String(initialCashers));

        expect(queryConfirmModal()).not.toBeInTheDocument();
        expect(getLatestRows()).toEqual(populatedRows);
        expect(mockBtDbUuid).not.toHaveBeenCalled();
        expect(cashersError()).toHaveTextContent("");
      });

      it("restores 1 when 0 is entered and the applied count is already 1", async () => {
        const firstElimPf = mockElimPfs.find(
          (elimPf) => elimPf.elim_id === elimId1,
        );
        expect(firstElimPf).toBeDefined();

        const { user, populatedRows, maxCashers } = setup({
          elimPfs: [firstElimPf!],
        });

        await enterCashers(user, "0");

        expect(getInputs().cashers).toHaveValue(1);
        expect(queryConfirmModal()).not.toBeInTheDocument();
        expect(getLatestRows()).toEqual(populatedRows);
        expect(cashersError()).toHaveTextContent(
          cashersRangeError(maxCashers),
        );
      });
    });
  });
});
