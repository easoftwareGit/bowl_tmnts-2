import { screen } from "@testing-library/react";
import {
  getCalcCashersInput,
  getCashersInput,
  getPlayersInput,
  getRatioInput,
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*
 * What the page renders:
 *   - loading:  divPfs loading, or tmnt loading while the route tournament
 *               is not loaded -> "Loading..." status, no form
 *   - errors:   a failed slice with an error message -> "Error: <message>"
 *   - loaded:   divPfs succeeded + tmnt succeeded + route tournament loaded
 *               -> heading, names, inputs and grid
 *
 * Initial input values are in initialization.test.
 * Grid prop values (rows, total prize fund) are in gridCallbacks.test.
 */

const otherTmntId = "tmt_00000000000000000000000000000099";

const otherTmntData = {
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: otherTmntId },
};

const queryLoading = () => screen.queryByRole("status");
const queryForm = () => screen.queryByRole("heading", { name: "Prize Fund" });

describe("Division Prize Fund web page render", () => {
  beforeEach(standardBeforeEach);

  /**********
   * Loaded *
   **********/

  describe("when loaded", () => {
    it("renders the heading, tournament name and route division name", () => {
      const { tmntData, divId } = setup();
      const divName = tmntData.divs.find((div) => div.id === divId)?.div_name;
      expect(divName).toBeTruthy(); // mock data precondition

      expect(
        screen.getByRole("heading", { level: 2, name: "Prize Fund" }),
      ).toBeInTheDocument();
      expect(screen.getByText(tmntData.tmnt.tmnt_name)).toBeInTheDocument();
      expect(screen.getByText(divName!)).toBeInTheDocument();
    });

    it("renders all page inputs and the grid", () => {
      setup();

      expect(getPlayersInput()).toBeInTheDocument();
      expect(getRatioInput()).toBeInTheDocument();
      expect(getCalcCashersInput()).toBeInTheDocument();
      expect(getCashersInput()).toBeInTheDocument();
      expect(screen.getByLabelText("Prize Fund")).toBeInTheDocument();
      expect(screen.getByTestId("mock-div-prize-fund-grid")).toBeInTheDocument();
    });

    it("disables the read-only fields and enables Ratio and Cashers", () => {
      setup();

      expect(getPlayersInput()).toBeDisabled();
      expect(getCalcCashersInput()).toBeDisabled();
      expect(screen.getByLabelText("Prize Fund")).toBeDisabled();

      expect(getRatioInput()).toBeEnabled();
      expect(getCashersInput()).toBeEnabled();
    });

    it("limits the Cashers input to the number of players", () => {
      const { tmntData } = setup();

      expect(getCashersInput()).toHaveAttribute("min", "1");
      expect(getCashersInput()).toHaveAttribute(
        "max",
        String(tmntData.players.length),
      );
    });

    it("limits the Cashers input to 1 when there are no players", () => {
      setup({ tmntData: { ...mockTmntFullData, players: [] } });

      expect(getCashersInput()).toHaveAttribute("max", "1");
    });

    it("does not show the loading status or any error", () => {
      const { view } = setup();

      expect(queryLoading()).not.toBeInTheDocument();
      expect(view.container).not.toHaveTextContent("Error:");
    });
  });

  /***********
   * Loading *
   ***********/

  describe("while loading", () => {
    it("shows Loading... and no form while the prize funds load", () => {
      setup({ divPfsLoadStatus: "loading" });

      expect(queryLoading()).toHaveTextContent("Loading...");
      expect(queryForm()).not.toBeInTheDocument();
    });

    it("shows Loading... while the route tournament loads", () => {
      setup({ tmntData: otherTmntData, tmntLoadStatus: "loading" });

      expect(queryLoading()).toHaveTextContent("Loading...");
      expect(queryForm()).not.toBeInTheDocument();
    });

    it("does not show the form until the route tournament is loaded", () => {
      // Tournament slice finished, but holds a different tournament.
      setup({ tmntData: otherTmntData });

      expect(queryForm()).not.toBeInTheDocument();
    });

    it("does not show an old error while the prize funds reload", () => {
      const { view } = setup({
        divPfsLoadStatus: "loading",
        divPfsError: "old error",
      });

      expect(view.container).not.toHaveTextContent("old error");
    });

    it("shows nothing before loading starts", () => {
      const { view } = setup({ divPfsLoadStatus: "idle" });

      expect(queryLoading()).not.toBeInTheDocument();
      expect(queryForm()).not.toBeInTheDocument();
      expect(view.container).not.toHaveTextContent("Error:");
    });
  });

  /**********
   * Errors *
   **********/

  describe("when loading fails", () => {
    it("shows the prize fund error and no form", () => {
      const { view } = setup({
        divPfsLoadStatus: "failed",
        divPfsError: "Prize funds not found",
      });

      expect(view.container).toHaveTextContent("Error: Prize funds not found");
      expect(queryForm()).not.toBeInTheDocument();
      expect(queryLoading()).not.toBeInTheDocument();
    });

    it("shows the tournament error and no form", () => {
      const { view } = setup({
        tmntData: otherTmntData,
        tmntLoadStatus: "failed",
        tmntError: "Tournament not found",
      });

      expect(view.container).toHaveTextContent("Error: Tournament not found");
      expect(queryForm()).not.toBeInTheDocument();
    });

    it("shows both errors when both loads fail", () => {
      const { view } = setup({
        divPfsLoadStatus: "failed",
        divPfsError: "Prize funds not found",
        tmntData: otherTmntData,
        tmntLoadStatus: "failed",
        tmntError: "Tournament not found",
      });

      expect(view.container).toHaveTextContent("Error: Prize funds not found");
      expect(view.container).toHaveTextContent("Error: Tournament not found");
    });

    it("shows no error text when a load fails without a message", () => {
      const { view } = setup({
        divPfsLoadStatus: "failed",
        divPfsError: null,
      });

      expect(view.container).not.toHaveTextContent("Error:");
      expect(queryForm()).not.toBeInTheDocument();
    });
  });
});
