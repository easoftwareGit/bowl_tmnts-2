import { screen } from "@testing-library/react";
import {
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup.test";
import {
  mockTmntFullData,
  mockElimPfs,  
  mockElim1PrizeFund,
  elimId1,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { MoneyDescrip, MoneyFlow } from "@prisma/client";
import { getBrktOrElimName } from "@/lib/getName";

describe("Eliminator Prize Fund web page render", () => {
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

  it("renders the eliminator name", () => {
    setup();

    const elimName = getBrktOrElimName(mockTmntFullData.elims[0], mockTmntFullData.divs);
    expect(screen.getByText(elimName)).toBeInTheDocument();    
  });

  it("renders all page inputs", () => {
    setup();

    expect(screen.getByLabelText("Players")).toBeInTheDocument();
    expect(screen.getByLabelText("Cashers")).toBeInTheDocument();
    expect(screen.getByLabelText("Entry Fees")).toBeInTheDocument();
    expect(screen.getByLabelText("Expenses")).toBeInTheDocument();
    expect(screen.getByLabelText("Prize Fund")).toBeInTheDocument();
  });

  it("renders the prize fund grid", () => {
    setup();

    expect(
      screen.getByTestId("mock-elim-prize-fund-grid"),
    ).toBeInTheDocument();
  });

  it("renders the expected number of prize fund rows", () => {
    setup();

    const elim1Rows = mockElimPfs.filter(
      (elimPf) => elimPf.elim_id === elimId1,
    );

    expect(
      screen.getByTestId("mock-grid-row-count"),
    ).toHaveTextContent(String(elim1Rows.length));
  });

  it("passes the total prize fund to the grid", () => {
    setup();

    expect(
      screen.getByTestId("mock-grid-total-prize-fund"),
    ).toHaveTextContent(String(mockElim1PrizeFund));
  });

  it("renders the read-only fields as disabled", () => {
    setup();

    expect(screen.getByLabelText("Players")).toBeDisabled();
    expect(screen.getByLabelText("Entry Fees")).toBeDisabled();
    expect(screen.getByLabelText("Prize Fund")).toBeDisabled();
  });

  it("leaves editable fields enabled", () => {
    setup();

    expect(screen.getByLabelText("Cashers")).toBeEnabled();
    expect(screen.getByLabelText("Expenses")).toBeEnabled();
  });

  it("renders the entry fees value", () => {
    setup();

    const elim1EntryFees = mockTmntFullData.moneys.filter(
      (money) =>
        money.descrip === MoneyDescrip.ENTRIES &&
        money.flow === MoneyFlow.IN &&
        money.elim_id === elimId1,
    )

    expect(
      screen.getByLabelText("Entry Fees"),
    ).toHaveValue(String(elim1EntryFees[0].amount));
  });

  it("renders the prize fund value", () => {
    setup();

    expect(
      screen.getByLabelText("Prize Fund"),
    ).toHaveValue(String(mockElim1PrizeFund));
  });

  it("does not display the loading modal after loading completes", () => {
    setup();

    expect(
      screen.queryByRole("status"),
    ).not.toBeInTheDocument();
  });
});