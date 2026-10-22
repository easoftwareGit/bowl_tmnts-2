import React from "react";
import { screen, type RenderResult } from "@testing-library/react";
import type { divPfType, tmntFullType } from "@/lib/types/types";
import type { RootState } from "@/redux/store";
import { defaultRatio } from "@/lib/validation/constants";
import {
  enterCashers,
  getCalcCashersInput,
  getCashersInput,
  getDivPrizeFund,
  getLatestGridProps,
  getLatestRows,
  getPlayersInput,
  getRatioInput,
  mockDivPfsToPrizeFunds,
  mockPopulatePfRows,
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup";
import { useSelector } from "react-redux";
import DivPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/div/[divId]/page";
import {
  mockDivPfs,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*
 * The initialization effect runs once, after:
 *   divPfs loaded (succeeded) for the route tournament AND tmntData is the
 *   route tournament.
 * It converts the route division's prize funds, populates the grid rows,
 * and sets cashers / ratio / calculated cashers.
 *
 * Loading and error display are in render.test.
 * Restoring the loaded state on Cancel is in gridCallbacks.test.
 */

const otherTmntId = "tmt_00000000000000000000000000000099";
const otherDivId = "div_00000000000000000000000000000099";

const otherDivPfs: divPfType[] = [
  {
    id: "dpf_00000000000000000000000000000091",
    div_id: otherDivId,
    position: 1,
    amount: 500,
  },
  {
    id: "dpf_00000000000000000000000000000092",
    div_id: otherDivId,
    position: 2,
    amount: 250,
  },
];

const ratioValue = (numPlayers: number, cashers: number): number =>
  Number((numPlayers / cashers).toFixed(2));

/**
 * Re-renders the page with a new Redux state, as if the store had changed.
 */
const rerenderWithState = (
  view: RenderResult,
  state: {
    divPfs: divPfType[];
    requestedTmntId: string;
    divPfsLoadStatus: string;
    tmntData: tmntFullType;
  },
): void => {
  const mockState = {
    divPfs: {
      divPfs: state.divPfs,
      requestedTmntId: state.requestedTmntId,
      loadStatus: state.divPfsLoadStatus,
      error: null,
    },
    tmntFullData: {
      tmntFullData: state.tmntData,
      loadStatus: "succeeded",
      error: null,
    },
  };

  jest
    .mocked(useSelector)
    .mockImplementation((selector: (state: RootState) => unknown) =>
      selector(mockState as unknown as RootState),
    );

  view.rerender(<DivPrizeFundEntry />);
};

describe("Division Prize Fund web page initialization", () => {
  beforeEach(standardBeforeEach);

  /**************
   * Grid rows  *
   **************/

  describe("grid rows", () => {
    it("converts the division's prize funds and populates the grid rows", () => {
      const { currentDivPfs, prizeFunds, populatedRows, divId, divPrizeFund } =
        setup();

      expect(mockDivPfsToPrizeFunds).toHaveBeenCalledTimes(1);
      expect(mockDivPfsToPrizeFunds).toHaveBeenCalledWith(currentDivPfs);

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        prizeFunds,
        divId,
        divPrizeFund,
        currentDivPfs.length,
      );

      expect(getLatestRows()).toEqual(populatedRows);
    });

    it("uses only the route division's prize funds", () => {
      const allDivPfs = [...mockDivPfs, ...otherDivPfs];

      const { currentDivPfs, divId } = setup({ divPfs: allDivPfs });

      expect(currentDivPfs.length).toBeGreaterThan(0); // mock data precondition
      expect(mockDivPfsToPrizeFunds).toHaveBeenCalledWith(currentDivPfs);
      expect(
        mockDivPfsToPrizeFunds.mock.calls[0][0].every(
          (divPf: divPfType) => divPf.div_id === divId,
        ),
      ).toBe(true);
      expect(mockPopulatePfRows.mock.calls[0][3]).toBe(currentDivPfs.length);
    });

    it("uses the division in the route", () => {
      const { tmntData } = setup({
        divId: otherDivId,
        divPfs: [...mockDivPfs, ...otherDivPfs],
      });

      expect(mockDivPfsToPrizeFunds).toHaveBeenCalledWith(otherDivPfs);
      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        expect.any(Array),
        otherDivId,
        getDivPrizeFund(tmntData, otherDivId),
        otherDivPfs.length,
      );
    });
  });

  /**********************
   * Initial input values *
   **********************/

  describe("initial input values", () => {
    it("sets cashers, calculated cashers and ratio from the number of prize funds", () => {
      const { currentDivPfs, tmntData } = setup();
      const numCashers = currentDivPfs.length;
      const numPlayers = tmntData.players.length;
      expect(numCashers).toBeGreaterThan(0); // mock data precondition

      expect(getCashersInput()).toHaveValue(numCashers);
      expect(getCalcCashersInput()).toHaveValue(numCashers);
      expect(getRatioInput()).toHaveValue(ratioValue(numPlayers, numCashers));
    });

    it("shows the tournament player count and the division prize fund", () => {
      const { tmntData, divPrizeFund } = setup();

      expect(getPlayersInput()).toHaveValue(tmntData.players.length);
      expect(screen.getByLabelText("Prize Fund")).toHaveValue(
        divPrizeFund.toString(),
      );
    });

    it("starts with no errors and no confirmation dialog", () => {
      setup();

      expect(screen.getByTestId("dangerRatio")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCashers")).toHaveTextContent("");
      expect(
        screen.queryByRole("dialog", { name: "confirm-modal" }),
      ).not.toBeInTheDocument();
    });

    it("sets ratio, cashers and rows to zero when the division has no prize funds", () => {
      const { divId, divPrizeFund } = setup({
        divPfs: otherDivPfs, // prize funds for another division only
        prizeFunds: [],
        populatedRows: [],
      });

      expect(mockDivPfsToPrizeFunds).toHaveBeenCalledWith([]);
      expect(mockPopulatePfRows).toHaveBeenCalledWith(
        [],
        divId,
        divPrizeFund,
        0,
      );

      expect(getCashersInput()).toHaveValue(0);
      expect(getRatioInput()).toHaveValue(0);
      expect(getCalcCashersInput()).toHaveValue(0);
      expect(getLatestRows()).toEqual([]);
    });
  });

  /*******************
   * Waiting for data *
   *******************/

  describe("waiting for data", () => {
    it("does not initialize when the prize funds were loaded for a different tournament", () => {
      setup({ divPfsRequestedTmntId: otherTmntId });

      expect(mockDivPfsToPrizeFunds).not.toHaveBeenCalled();
      expect(mockPopulatePfRows).not.toHaveBeenCalled();
      expect(getLatestRows()).toEqual([]);

      // Inputs keep their defaults.
      expect(getCashersInput()).toHaveValue(1);
      expect(getRatioInput()).toHaveValue(Number(defaultRatio.toFixed(2)));
    });

    it("does not initialize while the prize funds are loading", () => {
      setup({ divPfsLoadStatus: "loading" });

      expect(mockPopulatePfRows).not.toHaveBeenCalled();
      expect(getLatestGridProps()).toBeNull();
    });

    it("does not initialize when the loaded tournament is a different one", () => {
      setup({
        tmntData: {
          ...mockTmntFullData,
          tmnt: { ...mockTmntFullData.tmnt, id: otherTmntId },
        },
      });

      expect(mockPopulatePfRows).not.toHaveBeenCalled();
      expect(getLatestGridProps()).toBeNull();
    });

    it("initializes once the prize funds finish loading", () => {
      const { view, divPfs, tmntId, tmntData, populatedRows } = setup({
        divPfsLoadStatus: "loading",
      });
      expect(mockPopulatePfRows).not.toHaveBeenCalled();

      rerenderWithState(view, {
        divPfs,
        requestedTmntId: tmntId,
        divPfsLoadStatus: "succeeded",
        tmntData,
      });

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
      expect(getLatestRows()).toEqual(populatedRows);
      expect(getCashersInput()).toHaveValue(populatedRows.length);
    });

    it("initializes once prize funds for the route tournament arrive", () => {
      const { view, divPfs, tmntId, tmntData, populatedRows } = setup({
        divPfsRequestedTmntId: otherTmntId,
      });
      expect(mockPopulatePfRows).not.toHaveBeenCalled();

      rerenderWithState(view, {
        divPfs,
        requestedTmntId: tmntId,
        divPfsLoadStatus: "succeeded",
        tmntData,
      });

      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
      expect(getLatestRows()).toEqual(populatedRows);
    });
  });

  /**************
   * Runs once  *
   **************/

  describe("runs only once", () => {
    it("keeps the user's edits when the Redux prize funds change later", async () => {
      const { user, view, divPfs, tmntId, tmntData, populatedRows } = setup();
      const initialCashers = populatedRows.length;
      expect(tmntData.players.length).toBeGreaterThan(initialCashers);

      await enterCashers(user, String(initialCashers + 1));
      expect(getLatestRows()).toHaveLength(initialCashers + 1);

      // Store updates with a new divPfs array (e.g. after a refetch).
      rerenderWithState(view, {
        divPfs: [...divPfs, ...otherDivPfs],
        requestedTmntId: tmntId,
        divPfsLoadStatus: "succeeded",
        tmntData,
      });

      expect(mockDivPfsToPrizeFunds).toHaveBeenCalledTimes(1);
      expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
      expect(getLatestRows()).toHaveLength(initialCashers + 1);
      expect(getCashersInput()).toHaveValue(initialCashers + 1);
    });
  });
});
