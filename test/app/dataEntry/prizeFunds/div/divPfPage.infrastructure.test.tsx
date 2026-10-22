import { screen } from "@testing-library/react";
import {
  enterCashers,
  getLatestGridProps,
  mockDispatch,
  mockFetchDivPfs,
  mockFetchTmntFullData,
  mockUseUnsavedChangesGuard,
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*
 * Page wiring: data fetching, the unsaved-changes guard hook, the page
 * shell, and the callbacks handed to DivPrizeFundGrid.
 *
 * Grid prop values (rows, divId, totalPrizeFund, ...) and callback behavior
 * are in gridCallbacks.test. Loading / error states and initial values are
 * in initialization.test and render.test.
 */

const otherTmntId = "tmt_00000000000000000000000000000099";

describe("Division Prize Fund web page infrastructure", () => {
  beforeEach(standardBeforeEach);

  /**************
   * Page shell *
   **************/

  it("renders the page heading and the grid", () => {
    setup();

    expect(
      screen.getByRole("heading", { name: "Prize Fund" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-div-prize-fund-grid")).toBeInTheDocument();
  });

  it("gives DivPrizeFundGrid every callback the page handles", () => {
    setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();
    expect(props?.setRows).toEqual(expect.any(Function));
    expect(props?.onGridDataChanged).toEqual(expect.any(Function));
    expect(props?.onGridDataReset).toEqual(expect.any(Function));
    expect(props?.onNavigateAfterSave).toEqual(expect.any(Function));
    expect(props?.onBack).toEqual(expect.any(Function));
    expect(props?.onCancel).toEqual(expect.any(Function));
    expect(props?.onSaveComplete).toEqual(expect.any(Function));
  });

  /****************
   * Data loading *
   ****************/

  describe("fetching data", () => {
    it("dispatches fetchDivPfs once with the route tournament id", () => {
      const { tmntId } = setup();

      expect(mockFetchDivPfs).toHaveBeenCalledTimes(1);
      expect(mockFetchDivPfs).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "divPfs/fetchDivPfs",
        payload: tmntId,
      });
    });

    it("always fetches division prize funds, even when the tournament is loaded", () => {
      setup();

      // The tournament is loaded, so only fetchDivPfs is dispatched.
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
    });

    it("dispatches fetchTmntFullData when the loaded tournament is a different one", () => {
      const { tmntId } = setup({
        tmntData: {
          ...mockTmntFullData,
          tmnt: { ...mockTmntFullData.tmnt, id: otherTmntId },
        },
      });

      expect(mockFetchTmntFullData).toHaveBeenCalledTimes(1);
      expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "tmntFullData/fetchTmntFullData",
        payload: tmntId,
      });
    });

    it("fetches for the tournament in the route", () => {
      setup({ tmntId: otherTmntId });

      expect(mockFetchDivPfs).toHaveBeenCalledWith(otherTmntId);
      // tmntData is for a different tournament, so it is fetched too.
      expect(mockFetchTmntFullData).toHaveBeenCalledWith(otherTmntId);
    });

    it("does not fetch anything without a tournament id", () => {
      setup({ tmntId: "" });

      expect(mockFetchDivPfs).not.toHaveBeenCalled();
      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch again when the page re-renders", async () => {
      const { user, populatedRows } = setup();

      // Typing causes several re-renders.
      await enterCashers(user, String(populatedRows.length), "none");

      expect(mockFetchDivPfs).toHaveBeenCalledTimes(1);
      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
    });
  });

  /*************************
   * Unsaved changes guard *
   *************************/

  it("calls the unsaved changes guard with false when nothing has changed", () => {
    setup();

    expect(mockUseUnsavedChangesGuard).toHaveBeenCalled();
    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
  });
});
