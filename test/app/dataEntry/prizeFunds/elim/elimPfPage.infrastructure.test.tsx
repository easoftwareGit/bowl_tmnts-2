import { screen } from "@testing-library/react";
import {
  mockDispatch,
  mockFetchElimPfs,
  mockFetchTmntFullData,
  mockPopulatePfRows,
  mockUseUnsavedChangesGuard,
  setup,
  standardBeforeEach,
  triggerGridDataChanged,
} from "./elimPfPage.testSetup";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const OTHER_TMNT_ID = "tmt_00000000000000000000000000000099";

const ELIM_PFS_ERROR = "elim prize funds failed";
const TMNT_ERROR = "tournament failed";

const queryHeading = () =>
  screen.queryByRole("heading", { name: "Prize Fund" });

const queryGrid = () => screen.queryByTestId("mock-elim-prize-fund-grid");

/** The mocked WaitModal renders role="status" only while shown. */
const queryLoading = () => screen.queryByRole("status");

const otherTmntData = () => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: OTHER_TMNT_ID },
});

describe("Eliminator Prize Fund web page infrastructure", () => {
  beforeEach(standardBeforeEach);

  /*********************************
   * Rendering                     *
   *********************************/

  describe("rendering", () => {
    it("renders the heading and grid when both data sets match the route tournament", () => {
      setup();

      expect(queryHeading()).toBeInTheDocument();
      expect(queryGrid()).toBeInTheDocument();
      expect(queryLoading()).not.toBeInTheDocument();
    });

    it("starts with the unsaved changes guard disarmed", () => {
      setup();

      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    it("does not render or initialize when the elim prize funds belong to a different tournament", () => {
      setup({ elimPfsRequestedTmntId: OTHER_TMNT_ID });

      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryGrid()).not.toBeInTheDocument();
      expect(mockPopulatePfRows).not.toHaveBeenCalled();
    });

    it("does not render or initialize when the loaded tournament is a different tournament", () => {
      setup({ tmntData: otherTmntData() });

      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryGrid()).not.toBeInTheDocument();
      expect(mockPopulatePfRows).not.toHaveBeenCalled();
    });

    it("does not render or initialize when tournament data is not loaded", () => {
      setup({ tmntData: null, tmntLoadStatus: "idle" });

      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryGrid()).not.toBeInTheDocument();
      expect(mockPopulatePfRows).not.toHaveBeenCalled();
    });
  });

  /*********************************
   * Loading                       *
   *********************************/

  describe("loading", () => {
    it("shows Loading... and hides the form while the elim prize funds load", () => {
      setup({ elimPfsLoadStatus: "loading" });

      expect(queryLoading()).toHaveTextContent("Loading...");
      expect(queryHeading()).not.toBeInTheDocument();
      expect(mockPopulatePfRows).not.toHaveBeenCalled();
    });

    it("shows Loading... while the route tournament has not been loaded", () => {
      setup({ tmntData: null, tmntLoadStatus: "loading" });

      expect(queryLoading()).toHaveTextContent("Loading...");
      expect(queryHeading()).not.toBeInTheDocument();
    });

    it("shows Loading... while a different tournament is replaced", () => {
      setup({ tmntData: otherTmntData(), tmntLoadStatus: "loading" });

      expect(queryLoading()).toHaveTextContent("Loading...");
    });

    /*
     * isLoading is false because the route tournament is already loaded,
     * but canRender requires tmntLoadStatus === "succeeded", so the page
     * shows neither the form nor the Loading modal during a refresh.
     */
    it("shows neither Loading... nor the form while the loaded route tournament refreshes", () => {
      setup({ tmntLoadStatus: "loading" });

      expect(queryLoading()).not.toBeInTheDocument();
      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryGrid()).not.toBeInTheDocument();
    });
  });

  /*********************************
   * Errors                        *
   *********************************/

  describe("errors", () => {
    it("shows the elim prize funds error when the fetch fails", () => {
      setup({ elimPfsLoadStatus: "failed", elimPfsError: ELIM_PFS_ERROR });

      expect(
        screen.getByText(`Error: ${ELIM_PFS_ERROR}`),
      ).toBeInTheDocument();
      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryLoading()).not.toBeInTheDocument();
      expect(mockPopulatePfRows).not.toHaveBeenCalled();
    });

    it("shows the tournament error when the fetch fails", () => {
      setup({
        tmntData: null,
        tmntLoadStatus: "failed",
        tmntError: TMNT_ERROR,
      });

      expect(screen.getByText(`Error: ${TMNT_ERROR}`)).toBeInTheDocument();
      expect(queryHeading()).not.toBeInTheDocument();
      expect(queryLoading()).not.toBeInTheDocument();
    });

    it("does not show a stale elim prize funds error while loading again", () => {
      setup({ elimPfsLoadStatus: "loading", elimPfsError: ELIM_PFS_ERROR });

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      expect(queryLoading()).toBeInTheDocument();
    });

    it("does not show a stale tournament error while loading again", () => {
      setup({
        tmntData: null,
        tmntLoadStatus: "loading",
        tmntError: TMNT_ERROR,
      });

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      expect(queryLoading()).toBeInTheDocument();
    });

    it("does not show a stale error once the data has loaded", () => {
      setup({ elimPfsError: ELIM_PFS_ERROR, tmntError: TMNT_ERROR });

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      expect(queryHeading()).toBeInTheDocument();
    });
  });

  /*********************************
   * fetchElimPfs                  *
   *********************************/

  describe("fetchElimPfs", () => {
    it("dispatches once with the route tournament id", () => {
      const { tmntId } = setup();

      expect(mockFetchElimPfs).toHaveBeenCalledTimes(1);
      expect(mockFetchElimPfs).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "elimPfs/fetchElimPfs",
        payload: tmntId,
      });
    });

    it("dispatches even when stale prize funds from another tournament are loaded", () => {
      const { tmntId } = setup({ elimPfsRequestedTmntId: OTHER_TMNT_ID });

      expect(mockFetchElimPfs).toHaveBeenCalledWith(tmntId);
    });

    it("does not dispatch again when the page re-renders", () => {
      setup();

      // Any state change re-renders the page.
      triggerGridDataChanged();

      expect(mockFetchElimPfs).toHaveBeenCalledTimes(1);
    });
  });

  /*********************************
   * fetchTmntFullData             *
   *********************************/

  describe("fetchTmntFullData", () => {
    it("does not dispatch when the route tournament is already loaded", () => {
      setup();

      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
    });

    it("dispatches with the route tournament id when no tournament is loaded", () => {
      const { tmntId } = setup({ tmntData: null, tmntLoadStatus: "idle" });

      expect(mockFetchTmntFullData).toHaveBeenCalledTimes(1);
      expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "tmntFullData/fetchTmntFullData",
        payload: tmntId,
      });
    });

    it("dispatches with the route tournament id when a different tournament is loaded", () => {
      const { tmntId } = setup({ tmntData: otherTmntData() });

      expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "tmntFullData/fetchTmntFullData",
        payload: tmntId,
      });
    });

    it("uses the tournament id from the route for both fetches", () => {
      // Route points at another tournament than the loaded mock data.
      setup({ tmntId: OTHER_TMNT_ID });

      expect(mockFetchElimPfs).toHaveBeenCalledWith(OTHER_TMNT_ID);
      expect(mockFetchTmntFullData).toHaveBeenCalledWith(OTHER_TMNT_ID);
    });
  });

  /*********************************
   * Missing route tournament id   *
   *********************************/

  describe("without a route tournament id", () => {
    it("dispatches neither fetch", () => {
      setup({ tmntId: "" });

      expect(mockFetchElimPfs).not.toHaveBeenCalled();
      expect(mockFetchTmntFullData).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
