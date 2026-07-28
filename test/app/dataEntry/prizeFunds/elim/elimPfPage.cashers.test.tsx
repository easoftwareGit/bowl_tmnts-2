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
} from "./elimPfPage.testSetup.test";
import {  
  mockTmntFullData,
  elimId1,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Elim Prize Fund web page cashers input", () => {
  beforeEach(standardBeforeEach);

  describe("when there are no existing prize fund rows", () => {

    const setupEmpty = () =>
      setup({
        elimPfs: [],
      });

    it("shows 0 cashers when no prize fund rows exist", async () => {
      setupEmpty();

      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(0);
      });

      expect(getLatestRows()).toHaveLength(0);
    });  

    it("entering the first casher creates the first row", async () => {
      const { user } = setupEmpty();

      const cashersInput = screen.getByLabelText("Cashers");

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
          id: expect.stringMatching(/^epf_/),
          parent_id: elimId1,
          position: 1,
          amount: 0,
          percentage: 0,
        }),
      );

      expect(mockBtDbUuid).toHaveBeenCalledTimes(1);
      expect(mockBtDbUuid).toHaveBeenCalledWith("epf");
    });    

  });  

  describe("when there are existing prize fund rows", () => {

    const getElimPlayerCount = (): number =>
      mockTmntFullData.elimEntries.filter(
        (entry) => entry.elim_id === elimId1,
      ).length;

    it("updates the cashers input when its value changes", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "3");

      expect(cashersInput).toHaveValue(3);
    });

    it("adds rows on blur when the cashers value increases", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = initialCashers + 2;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        newCashers.toString(),
      );
      await user.tab();

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(
          newCashers,
        );
      });

      expect(cashersInput).toHaveValue(newCashers);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(newCashers - initialCashers);
      expect(mockBtDbUuid).toHaveBeenCalledWith("epf");

      const addedRows = getLatestRows().slice(initialCashers);

      expect(addedRows).toEqual([
        expect.objectContaining({
          id: expect.stringMatching(/^epf_/),
          parent_id: elimId1,
          position: initialCashers + 1,
          amount: 0,
          percentage: 0,
        }),
        expect.objectContaining({
          id: expect.stringMatching(/^epf_/),
          parent_id: elimId1,
          position: initialCashers + 2,
          amount: 0,
          percentage: 0,
        }),
      ]);

      const addedIds = addedRows.map((row) => row.id);
      expect(new Set(addedIds).size).toBe(addedIds.length);
    });

    it("preserves unsaved grid edits when adding cashers", async () => {
      const { user } = setup();

      const initialRows = getLatestRows();

      const editedRows = getLatestRows().map(
        (row) => ({
          ...row,
          amount:
            row.position === 1
              ? 999
              : row.amount,
        }),
      );

      setCurrentGridRows(editedRows);

      /*
       * Prove the unsaved edit exists only in the
       * mocked Syncfusion grid.
       */
      expect(getLatestRows()[0].amount).not.toBe(999);
      expect(getLatestRows()).toHaveLength(initialRows.length);

      const cashersInput = screen.getByLabelText("Cashers");

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        (editedRows.length + 1).toString(),
      );
      await user.tab();

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(
          editedRows.length + 1,
        );
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
          parent_id: elimId1,
          position: editedRows.length + 1,
          amount: 0,
          percentage: 0,
        }),
      );
    });

    it("adds rows when Enter is pressed and the cashers value increases", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = initialCashers + 2;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        newCashers.toString(),
      );
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(
          newCashers,
        );
      });

      expect(cashersInput).toHaveValue(newCashers);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(newCashers - initialCashers);
      expect(mockBtDbUuid).toHaveBeenCalledWith("epf");
    });

    it("opens a confirmation dialog on blur when the cashers value decreases", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = initialCashers - 1;
      const removeCount = initialCashers - newCashers;

      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        newCashers.toString(),
      );
      await user.tab();

      expect(
        await screen.findByRole("dialog", {
          name: "confirm-modal",
        }),
      ).toBeInTheDocument();

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
      const newCashers = 1;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        newCashers.toString(),
      );
      await user.keyboard("{Enter}");

      expect(
        await screen.findByRole("dialog", {
          name: "confirm-modal",
        }),
      ).toBeInTheDocument();

      expect(screen.getByText("Remove Cashers")).toBeInTheDocument();
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("changes values below the minimum to 1 when Enter is pressed", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const expectedCashers = 1;
      const cashersInput = screen.getByLabelText("Cashers");

      await user.clear(cashersInput);
      await user.type(cashersInput, "0");
      await user.keyboard("{Enter}");

      /*
       * Zero is clamped to the minimum of one casher.
       *
       * Because this decreases the current number of cashers,
       * the rows are not removed until the user confirms.
       */
      expect(
        await screen.findByRole("dialog", {
          name: "confirm-modal",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          `Do you want to remove ${initialCashers - expectedCashers
          } cashers? ` +
          `Going from ${initialCashers} cashers to ${expectedCashers} cashers.`,
        ),
      ).toBeInTheDocument();

      /*
       * The grid still contains the original rows
       * before confirmation.
       */
      expect(getLatestRows()).toHaveLength(initialCashers);

      await confirmRemoveCashers(user);

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(
          expectedCashers,
        );
      });

      expect(cashersInput).toHaveValue(expectedCashers);
    });

    it("changes values above the maximum to the number of elim players when Enter is pressed", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const expectedCashers = getElimPlayerCount();
      const cashersInput = screen.getByLabelText("Cashers");

      await user.clear(cashersInput);
      await user.type(cashersInput, "999");
      await user.keyboard("{Enter}");

      /*
       * The entered value is clamped to the number of
       * entries belonging to this elim.
       *
       * Because this increases the number of cashers,
       * rows are added immediately without confirmation.
       */
      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(
          expectedCashers,
        );
      });

      expect(cashersInput).toHaveValue(expectedCashers);

      expect(
        screen.queryByRole("dialog", {
          name: "confirm-modal",
        }),
      ).not.toBeInTheDocument();

      expect(mockBtDbUuid).toHaveBeenCalledTimes(
        expectedCashers - initialCashers,
      );
      expect(mockBtDbUuid).toHaveBeenCalledWith("epf");
    });

    it("removes rows when the confirmation Yes button is clicked", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = 1;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        newCashers.toString(),
      );
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

      expect(cashersInput).toHaveValue(newCashers);
      expect(getLatestRows()).toHaveLength(newCashers);

      expect(getLatestRows()).toEqual([
        expect.objectContaining({
          parent_id: elimId1,
          position: 1,
        }),
      ]);
    });

    it("preserves unsaved grid edits before removing cashers", async () => {
      const { user } = setup();

      const editedRows = getLatestRows().map(
        (row) => ({
          ...row,
          amount:
            row.position === 1
              ? 777
              : row.amount,
        }),
      );

      setCurrentGridRows(editedRows);

      const cashersInput = screen.getByLabelText("Cashers");

      await user.clear(cashersInput);
      await user.type(cashersInput, "1");
      await user.tab();

      await confirmRemoveCashers(user);

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(1);
      });

      expect(getLatestRows()[0].amount).toBe(777);
    });

    it("keeps the existing rows when the confirmation No button is clicked", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const newCashers = 1;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        newCashers.toString(),
      );
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

      /*
       * confirmNo() only closes the modal. The controlled
       * input keeps the typed value, but the rows remain
       * unchanged.
       */
      expect(cashersInput).toHaveValue(newCashers);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("ignores invalid non-digit input", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
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

    it("changes values below the minimum to 1 on blur after removal is confirmed", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
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
          `Do you want to remove ${initialCashers - 1
          } cashers? ` +
          `Going from ${initialCashers} cashers to 1 cashers.`,
        ),
      ).toBeInTheDocument();

      await confirmRemoveCashers(user);

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(1);
      });

      expect(cashersInput).toHaveValue(1);
    });

    it("changes values above the maximum to the number of elim players on blur", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const maxCashers = getElimPlayerCount();
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "999");
      await user.tab();

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(
          maxCashers,
        );
      });

      expect(cashersInput).toHaveValue(maxCashers);
      expect(
        screen.queryByRole("dialog", {
          name: "confirm-modal",
        }),
      ).not.toBeInTheDocument();

      expect(mockBtDbUuid).toHaveBeenCalledTimes(maxCashers - initialCashers);
      expect(mockBtDbUuid).toHaveBeenCalledWith("epf");
    });

    it("arms the unsaved changes guard when the cashers input changes", async () => {
      const { user } = setup();

      const initialCashers = getLatestRows().length;
      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          initialCashers,
        );
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "3");

      await waitFor(() => {
        expect(
          mockUseUnsavedChangesGuard,
        ).toHaveBeenLastCalledWith(true);
      });
    });

    it("does not add more cashers than the number of entries for the current elim", async () => {
      const { user } = setup();

      const maxCashers = getElimPlayerCount();
      const cashersInput = screen.getByLabelText("Cashers");

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        (maxCashers + 10).toString(),
      );
      await user.tab();

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          maxCashers,
        );
      });

      expect(getLatestRows()).toHaveLength(maxCashers);
    });

    it("uses only entries belonging to the current elim when determining the maximum cashers", async () => {
      const { user } = setup();

      const currentElimEntries =
        mockTmntFullData.elimEntries.filter(
          (entry) => entry.elim_id === elimId1,
        );

      const otherElimEntries =
        mockTmntFullData.elimEntries.filter(
          (entry) => entry.elim_id !== elimId1,
        );

      expect(
        mockTmntFullData.elimEntries.length,
      ).toBe(
        currentElimEntries.length +
        otherElimEntries.length,
      );

      const cashersInput = screen.getByLabelText("Cashers");

      await user.clear(cashersInput);
      await user.type(cashersInput, "999");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          currentElimEntries.length,
        );
      });

      expect(getLatestRows()).toHaveLength(currentElimEntries.length);
    });

  });  
});