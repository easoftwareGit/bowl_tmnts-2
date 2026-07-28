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
  divId1,
  mockDivPfs,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Division Prize Fund web page cashers input", () => {
  beforeEach(standardBeforeEach);

  describe("when there are no existing prize fund rows", () => {

    const setupEmpty = () =>
      setup({
        divPfs: [],
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
          id: expect.stringMatching(/^dpf_/),
          parent_id: divId1,
          position: 1,
          amount: 0,
          percentage: 0,
        }),
      );

      expect(mockBtDbUuid).toHaveBeenCalledTimes(1);
      expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");
    });    

  });  
  
  describe("when there are existing prize fund rows", () => {

    it("updates the cashers input when its value changes", async () => {
      const { user } = setup();

      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          mockDivPfs.length,
        );
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "3");

      expect(cashersInput).toHaveValue(3);
    });

    it("adds rows on blur when the cashers value increases", async () => {
      const { user } = setup();

      const initialCashers = mockDivPfs.length;
      const newCashers = initialCashers + 2;

      const cashersInput =
        screen.getByLabelText("Cashers");

      const ratioInput =
        screen.getByLabelText(
          "Cash Ratio. 1 in",
        );

      const calculatedCashersInput =
        screen.getByLabelText(
          "Calculated Cashers",
        );

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

      const expectedRatio = Number(
        (
          mockTmntFullData.players.length /
          newCashers
        ).toFixed(2),
      );

      expect(cashersInput).toHaveValue(newCashers);
      expect(ratioInput).toHaveValue(expectedRatio);
      expect(calculatedCashersInput).toHaveValue(newCashers);
      expect(mockBtDbUuid).toHaveBeenCalledTimes(
        newCashers - initialCashers,
      );
      expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");

      const addedRows = getLatestRows().slice(initialCashers);

      expect(addedRows).toEqual([
        expect.objectContaining({
          id: expect.stringMatching(/^dpf_/),
          parent_id: divId1,
          position: initialCashers + 1,
          amount: 0,
          percentage: 0,
        }),
        expect.objectContaining({
          id: expect.stringMatching(/^dpf_/),
          parent_id: divId1,
          position: initialCashers + 2,
          amount: 0,
          percentage: 0,
        }),
      ]);
    
      const addedIds = addedRows.map((row) => row.id);

      expect(new Set(addedIds).size).toBe(addedIds.length);

      expect(
        getLatestRows().slice(initialCashers),
      ).toEqual([
        {
          id: "dpf_00000000000000000000000000000001",
          parent_id: divId1,
          position: initialCashers + 1,
          amount: 0,
          percentage: 0,
        },
        {
          id: "dpf_00000000000000000000000000000002",
          parent_id: divId1,
          position: initialCashers + 2,
          amount: 0,
          percentage: 0,
        },
      ]);
    });

    it("preserves unsaved grid edits when adding cashers", async () => {
      const { user } = setup();
      const initialRows = getLatestRows();
      const editedRows = getLatestRows().map((row) => ({
        ...row,
        amount: row.position === 1 ? 999 : row.amount,
      }));

      setCurrentGridRows(editedRows);

      // Prove the unsaved edit exists only in the mocked Syncfusion grid.
      expect(getLatestRows()[0].amount).not.toBe(999);
      expect(getLatestRows()).toHaveLength(initialRows.length);

      const cashersInput = screen.getByLabelText("Cashers");

      await user.clear(cashersInput);
      await user.type(
        cashersInput,
        (editedRows.length + 1).toString(),
      );
      await user.tab();

      // Existing grid-only edit was preserved.
      expect(getLatestRows()[0]).toEqual(
        expect.objectContaining({
          position: 1,
          amount: 999,
        }),
      );

      // The newly added row has the expected defaults.
      expect(getLatestRows().at(-1)).toEqual(
        expect.objectContaining({
          position: editedRows.length + 1,
          amount: 0,
          percentage: 0,
        }),
      );
    });

    it("adds rows when Enter is pressed and the cashers value increases", async () => {
      const { user } = setup();

      const initialCashers = mockDivPfs.length;
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
      expect(mockBtDbUuid).toHaveBeenCalledTimes(
        newCashers - initialCashers,
      );
    });

    it("opens a confirmation dialog on blur when the cashers value decreases", async () => {
      const { user } = setup();

      const initialCashers = mockDivPfs.length;
      const newCashers = initialCashers - 1; // from 2 to 1
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
          `Do you want to remove ${removeCount} cashers? Going from ${initialCashers} cashers to ${newCashers} cashers.`,
        ),
      ).toBeInTheDocument();
      expect(cashersInput).toHaveValue(newCashers);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("opens a confirmation dialog when Enter decreases the cashers value", async () => {
      const { user } = setup();

      const initialCashers = mockDivPfs.length;
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

      const initialCashers = mockDivPfs.length;
      const expectedCashers = 1;

      const cashersInput =
        screen.getByLabelText("Cashers");

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
          `Do you want to remove ${initialCashers - expectedCashers} cashers? ` +
          `Going from ${initialCashers} cashers to ${expectedCashers} cashers.`,
        ),
      ).toBeInTheDocument();

      /*
      * The grid still contains the original rows before confirmation.
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

    it("changes values above the maximum to the number of players when Enter is pressed", async () => {
      const { user } = setup();

      const initialCashers = mockDivPfs.length;
      const expectedCashers = mockTmntFullData.players.length;
      const cashersInput = screen.getByLabelText("Cashers");

      await user.clear(cashersInput);
      await user.type(cashersInput, "999");
      await user.keyboard("{Enter}");

      /*
      * The entered value is clamped to the number of players.
      *
      * Because this increases the number of cashers, rows are added
      * immediately and no confirmation dialog is required.
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
      expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");
    });

    it("removes rows when the confirmation Yes button is clicked", async () => {
      const { user } = setup();

      const initialCashers = mockDivPfs.length;
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
          position: 1,
        }),
      ]);
    });

    it("preserves unsaved grid edits before removing cashers", async () => {
      const { user } = setup();

      const editedRows = getLatestRows().map((row) => ({
        ...row,
        amount: row.position === 1 ? 777 : row.amount,
      }));

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

      const initialCashers = mockDivPfs.length;
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
       * The typed input value remains unchanged because confirmNo()
       * only closes the dialog. The rows are not removed.
       */
      expect(cashersInput).toHaveValue(newCashers,);
      expect(getLatestRows()).toHaveLength(initialCashers);
    });

    it("ignores invalid non-digit input", async () => {
      const { user } = setup();

      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          mockDivPfs.length,
        );
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "abc");

      /*
       * Clearing the controlled input sets cashers to zero.
       * The browser/type=number input rejects the letters, so
       * no valid replacement value is entered.
       */
      expect(cashersInput).toHaveValue(0);
      expect(getLatestRows()).toHaveLength(mockDivPfs.length);
    });

    it("changes values below the minimum to 1 on blur after removal is confirmed", async () => {
      const { user } = setup();

      const cashersInput = screen.getByLabelText("Cashers");

      const ratioInput =
        screen.getByLabelText(
          "Cash Ratio. 1 in",
        );

      const calculatedCashersInput =
        screen.getByLabelText(
          "Calculated Cashers",
        );

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          mockDivPfs.length,
        );
      });

      await user.clear(cashersInput);
      await user.type(cashersInput, "0");
      await user.tab();

      /*
      * handleCashersBlur() clamps 0 to the minimum value of 1.
      * Because this decreases the number of cashers, updateCashers()
      * opens the confirmation modal before removing rows.
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
          `Do you want to remove ${mockDivPfs.length - 1} cashers? ` +
          `Going from ${mockDivPfs.length} cashers to 1 cashers.`,
        ),
      ).toBeInTheDocument();

      await confirmRemoveCashers(user);

      await waitFor(() => {
        expect(getLatestRows()).toHaveLength(1);
      });

      expect(cashersInput).toHaveValue(1);
      expect(ratioInput).toHaveValue(mockTmntFullData.players.length);
      expect(calculatedCashersInput).toHaveValue(1);
    });

    it("changes values above the maximum to the number of players on blur", async () => {
      const { user } = setup();

      const maxCashers = mockTmntFullData.players.length;
      const cashersInput =screen.getByLabelText("Cashers");

      const ratioInput =
        screen.getByLabelText(
          "Cash Ratio. 1 in",
        );

      const calculatedCashersInput =
        screen.getByLabelText(
          "Calculated Cashers",
        );

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          mockDivPfs.length,
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
      expect(ratioInput).toHaveValue(1);
      expect(calculatedCashersInput).toHaveValue(maxCashers);
    });

    it("arms the unsaved changes guard when the cashers input changes", async () => {
      const { user } = setup();

      const cashersInput = screen.getByLabelText("Cashers");

      await waitFor(() => {
        expect(cashersInput).toHaveValue(
          mockDivPfs.length,
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
  });
});
