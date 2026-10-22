import { screen } from "@testing-library/react";
import {
  getLatestGridProps,
  makePotPfsForDifferentPot,
  makePotPfsForPot,
  mockDispatch,
  mockFetchPotPfs,
  mockFetchTmntFullData,
  setup,
  standardBeforeEach,
} from "./potPfPage.testSetup.test";
import {
  mockPotPfs,
  mockTmntFullData,
  potId1,
  potId2,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const otherTmntId = "tmt_00000000000000000000000000000099";

const queryHeading = () =>
  screen.queryByRole("heading", { name: "Prize Fund" });

const queryGrid = () =>
  screen.queryByTestId("mock-pot-prize-fund-grid");

describe("Pot Prize Fund web page infrastructure", () => {
  beforeEach(standardBeforeEach);

  /*************
   * Rendering *
   *************/

  describe("rendering", () => {
    it("renders the page", () => {
      setup();

      expect(queryHeading()).toBeInTheDocument();
      expect(queryGrid()).toBeInTheDocument();
    });

    it("renders the page when Redux contains prize fund rows only for other pots", () => {
      setup({
        potId: potId1,
        potPfs: makePotPfsForDifferentPot(potId1),
      });

      expect(queryHeading()).toBeInTheDocument();
      expect(queryGrid()).toBeInTheDocument();
      expect(getLatestGridProps()?.rows).toEqual([]);
    });

    it("renders the page when there are no pot prize fund rows", () => {
      setup({ potPfs: [] });

      expect(queryHeading()).toBeInTheDocument();
      expect(queryGrid()).toBeInTheDocument();
      expect(getLatestGridProps()?.rows).toEqual([]);
    });

    it("does not render the page when the loaded pot prize funds belong to a different tournament", () => {
      setup({ potPfsRequestedTmntId: otherTmntId });

      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryGrid()).not.toBeInTheDocument();
    });

    it("does not render the page when a different tournament is loaded", () => {
      setup({
        tmntData: {
          ...mockTmntFullData,
          tmnt: { ...mockTmntFullData.tmnt, id: "different-tmnt-id" },
        },
      });

      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryGrid()).not.toBeInTheDocument();
    });

    it.each(["idle", "loading", "failed"])(
      "does not render the page while pot prize funds are %s",
      (potPfsLoadStatus) => {
        setup({ potPfsLoadStatus });

        expect(queryHeading()).not.toBeInTheDocument();
        expect(queryGrid()).not.toBeInTheDocument();
      },
    );

    it.each(["idle", "loading", "failed"])(
      "does not render the page while tournament data is %s",
      (tmntLoadStatus) => {
        setup({ tmntLoadStatus });

        expect(queryHeading()).not.toBeInTheDocument();
        expect(queryGrid()).not.toBeInTheDocument();
      },
    );
  });

  /************************
   * Grid total by pot type *
   ************************/

  describe("grid total from the mock tournament's pots", () => {
    it("passes the per-game prize fund for pot 1", () => {
      const { expected } = setup();

      expect(expected.isGamePot).toBe(true);
      expect(getLatestGridProps()?.totalPrizeFund).toBe(expected.perGame);
    });

    it("passes the whole prize fund for pot 2, a non-game pot", () => {
      const { expected } = setup({
        potId: potId2,
        potPfs: makePotPfsForPot(potId2, mockPotPfs),
      });

      expect(expected.isGamePot).toBe(false);

      /*
       * With saved rows, expenses are fees minus the saved payout,
       * so the whole prize fund equals the saved rows' total.
       */
      expect(getLatestGridProps()?.totalPrizeFund).toBe(expected.prizeFund);
    });
  });

  /************
   * Fetching *
   ************/

  describe("fetching", () => {
    it("fetches the tournament pot prize funds when mounted", () => {
      setup();

      expect(mockFetchPotPfs).toHaveBeenCalledTimes(1);
      expect(mockFetchPotPfs).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith(
        mockFetchPotPfs.mock.results[0].value,
      );
    });

    it("still fetches pot prize funds when stale pot prize fund data is in Redux", () => {
      setup({ potPfsRequestedTmntId: otherTmntId });

      expect(mockFetchPotPfs).toHaveBeenCalledTimes(1);
      expect(mockFetchPotPfs).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith(
        mockFetchPotPfs.mock.results[0].value,
      );
    });

    it("does not fetch tournament data when the correct tournament is already loaded", () => {
      setup();

      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
    });

    it("fetches tournament data when no tournament is loaded", () => {
      setup({
        tmntData: {} as typeof mockTmntFullData,
      });

      expect(mockFetchTmntFullData).toHaveBeenCalledTimes(1);
      expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith(
        mockFetchTmntFullData.mock.results[0].value,
      );
    });

    it("fetches tournament data when a different tournament is loaded", () => {
      setup({
        tmntData: {
          ...mockTmntFullData,
          tmnt: { ...mockTmntFullData.tmnt, id: "different-tmnt-id" },
        },
      });

      expect(mockFetchTmntFullData).toHaveBeenCalledTimes(1);
      expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("does not fetch anything when the URL has no tournament id", () => {
      setup({ tmntId: "" });

      expect(mockFetchPotPfs).not.toHaveBeenCalled();
      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch again when the page re-renders", async () => {
      const { user } = setup();

      // typing re-renders the page several times
      await user.type(screen.getByLabelText("Expenses"), "1");

      expect(mockFetchPotPfs).toHaveBeenCalledTimes(1);
      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
    });
  });
});
