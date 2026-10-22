import { screen } from "@testing-library/react";
import {
  getInputs,
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup";
import { getBrktOrElimName } from "@/lib/getName";
import {
  elimId1,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const OTHER_TMNT_ID = "tmt_00000000000000000000000000000099";

const queryHeading = () =>
  screen.queryByRole("heading", { level: 2, name: "Prize Fund" });

const queryLoading = () => screen.queryByRole("status");

const queryConfirmModal = () =>
  screen.queryByRole("dialog", { name: "confirm-modal" });

describe("Eliminator Prize Fund web page render", () => {
  beforeEach(standardBeforeEach);

  /*********************************
   * Loaded page                   *
   *********************************/

  describe("when data is loaded", () => {
    it("renders the Prize Fund heading", () => {
      setup();

      expect(queryHeading()).toBeInTheDocument();
    });

    it("renders the tournament name", () => {
      const { tmntData } = setup();

      expect(screen.getByText("Tournament:")).toBeInTheDocument();
      expect(screen.getByText(tmntData!.tmnt.tmnt_name)).toBeInTheDocument();
    });

    it("renders the name of the route eliminator", () => {
      const { tmntData, elimId } = setup();

      const elim = tmntData!.elims.find((e) => e.id === elimId);
      expect(elim).toBeDefined();

      expect(screen.getByText("Eliminator:")).toBeInTheDocument();
      expect(
        screen.getByText(getBrktOrElimName(elim!, tmntData!.divs)),
      ).toBeInTheDocument();
    });

    it("renders all page inputs", () => {
      setup();

      const inputs = getInputs();
      Object.values(inputs).forEach((input) => {
        expect(input).toBeInTheDocument();
      });
    });

    it("disables the read-only fields", () => {
      setup();

      const { players, entryFees, prizeFund } = getInputs();
      expect(players).toBeDisabled();
      expect(entryFees).toBeDisabled();
      expect(prizeFund).toBeDisabled();
    });

    it("leaves the editable fields enabled", () => {
      setup();

      const { cashers, expenses } = getInputs();
      expect(cashers).toBeEnabled();
      expect(expenses).toBeEnabled();
    });

    it("shows the number of players in the route eliminator", () => {
      const { numPlayers } = setup();

      expect(numPlayers).toBeGreaterThan(0);
      expect(getInputs().players).toHaveValue(numPlayers);
    });

    it("counts only the route eliminator's entries as players", () => {
      const { tmntData, elimId } = setup({ numPlayers: 2 });

      // Precondition: other eliminators still have entries in tmntData.
      const otherElimEntries =
        tmntData?.elimEntries?.filter((entry) => entry.elim_id !== elimId) ??
        [];
      expect(otherElimEntries.length).toBeGreaterThan(0);

      expect(getInputs().players).toHaveValue(2);
    });

    it("limits the Cashers input to whole numbers from 1 to the number of players", () => {
      const { numPlayers } = setup();

      const { cashers } = getInputs();
      expect(cashers).toHaveAttribute("type", "number");
      expect(cashers).toHaveAttribute("step", "1");
      expect(cashers).toHaveAttribute("min", "1");
      expect(cashers).toHaveAttribute("max", String(numPlayers));
    });

    it("sets the Cashers maximum to 1 when the eliminator has no players", () => {
      setup({ numPlayers: 0 });

      expect(getInputs().cashers).toHaveAttribute("max", "1");
    });

    it("shows no Cashers error", () => {
      setup();

      expect(screen.getByTestId("dangerCashers")).toHaveTextContent("");
    });

    it("shows the eliminator's entry fees", () => {
      const { elimEntryFees } = setup();

      expect(elimEntryFees).toBeGreaterThan(0);
      expect(getInputs().entryFees).toHaveValue(String(elimEntryFees));
    });

    it("shows 0 entry fees when the eliminator has no ENTRIES money row", () => {
      setup({
        tmntData: {
          ...mockTmntFullData,
          moneys: mockTmntFullData.moneys.filter(
            (money) => money.elim_id !== elimId1,
          ),
        },
      });

      const { entryFees, expenses, prizeFund } = getInputs();
      expect(entryFees).toHaveValue("0");
      expect(expenses).toHaveValue("0.00");
      expect(prizeFund).toHaveValue("0");
    });

    it("renders the grid for the route eliminator with editing enabled", () => {
      const { elimId, expectedPrizeFund } = setup();

      expect(screen.getByTestId("mock-grid-elim-id")).toHaveTextContent(elimId);
      expect(
        screen.getByTestId("mock-grid-enable-editing"),
      ).toHaveTextContent("true");
      expect(
        screen.getByTestId("mock-grid-total-prize-fund"),
      ).toHaveTextContent(String(expectedPrizeFund));
    });

    it("does not show the Remove Cashers confirmation", () => {
      setup();

      expect(queryConfirmModal()).not.toBeInTheDocument();
    });

    it("does not show the loading modal", () => {
      setup();

      expect(queryLoading()).not.toBeInTheDocument();
    });

    it("does not show an error from a previous load", () => {
      setup({
        elimPfsError: "old prize fund error",
        tmntError: "old tournament error",
      });

      expect(screen.queryByText(/^Error:/)).not.toBeInTheDocument();
      expect(queryHeading()).toBeInTheDocument();
    });
  });

  /*********************************
   * Loading                       *
   *********************************/

  describe("while loading", () => {
    it("shows the loading modal and no form while prize funds load", () => {
      setup({ elimPfsLoadStatus: "loading" });

      expect(queryLoading()).toHaveTextContent("Loading...");
      expect(queryHeading()).not.toBeInTheDocument();
    });

    it("shows the loading modal and no form while the tournament loads", () => {
      setup({ tmntData: null, tmntLoadStatus: "loading" });

      expect(queryLoading()).toHaveTextContent("Loading...");
      expect(queryHeading()).not.toBeInTheDocument();
    });

    it("shows the loading modal while replacing another tournament's data", () => {
      setup({
        tmntData: {
          ...mockTmntFullData,
          tmnt: { ...mockTmntFullData.tmnt, id: OTHER_TMNT_ID },
        },
        tmntLoadStatus: "loading",
      });

      expect(queryLoading()).toHaveTextContent("Loading...");
      expect(queryHeading()).not.toBeInTheDocument();
    });
  });

  /*********************************
   * Errors                        *
   *********************************/

  describe("when loading fails", () => {
    it("shows the prize fund error and no form", () => {
      setup({
        elimPfsLoadStatus: "failed",
        elimPfsError: "Prize funds unavailable",
      });

      expect(
        screen.getByText("Error: Prize funds unavailable"),
      ).toBeInTheDocument();
      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryLoading()).not.toBeInTheDocument();
    });

    it("shows the tournament error and no form", () => {
      setup({
        tmntData: null,
        tmntLoadStatus: "failed",
        tmntError: "Tournament unavailable",
      });

      expect(
        screen.getByText("Error: Tournament unavailable"),
      ).toBeInTheDocument();
      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryLoading()).not.toBeInTheDocument();
    });
  });
});
