import { screen } from "@testing-library/react";
import {
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup.test";
import {
  mockTmntFullData,
  mockDivPrizeFund,
  mockDivPfs,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Division Prize Fund web page render", () => {
  beforeEach(standardBeforeEach);

  it("renders the prize fund heading", () => {
    setup();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Prize Fund",
      }),
    ).toBeInTheDocument();
  });

  it("renders the tournament name", () => {
    setup();

    expect(
      screen.getByText(mockTmntFullData.tmnt.tmnt_name),
    ).toBeInTheDocument();
  });

  it("renders the division name", () => {
    setup();

    expect(
      screen.getByText(
        mockTmntFullData.divs[0].div_name,
      ),
    ).toBeInTheDocument();
  });

  it("renders all page inputs", () => {
    setup();

    expect(screen.getByLabelText("Players")).toBeInTheDocument();
    expect(screen.getByLabelText("Cash Ratio. 1 in")).toBeInTheDocument();
    expect(screen.getByLabelText("Calculated Cashers")).toBeInTheDocument();
    expect(screen.getByLabelText("Cashers")).toBeInTheDocument();
    expect(screen.getByLabelText("Prize Fund")).toBeInTheDocument();    
  });

  it("renders the prize fund grid", () => {
    setup();

    expect(screen.getByTestId("mock-div-prize-fund-grid")).toBeInTheDocument();
  });

  it("renders the expected number of prize fund rows", () => {
    setup();

    expect(
      screen.getByTestId("mock-grid-row-count"),
    ).toHaveTextContent(
      String(mockDivPfs.length),
    );
  });

  it("passes the total prize fund to the grid", () => {
    setup();

    expect(
      screen.getByTestId("mock-grid-total-prize-fund"),
    ).toHaveTextContent(
      String(mockDivPrizeFund),
    );
  });

  it("renders the read-only fields as disabled", () => {
    setup();

    expect(screen.getByLabelText("Players")).toBeDisabled();
    expect(screen.getByLabelText("Calculated Cashers")).toBeDisabled();
    expect(screen.getByLabelText("Prize Fund")).toBeDisabled();
  });  

  it("does not display the loading modal after loading completes", () => {
    setup();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

});