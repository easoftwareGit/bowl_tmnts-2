"use client";

import { screen } from "@testing-library/react";
import {
  mockElimPfsToPrizeFunds,
  mockPopulatePfRows,
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup.test";
import ElimPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/elim/[elimId]/page";
import { elimId1 } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Elim Prize Fund initialization", () => {
  beforeEach(standardBeforeEach);

  it("converts only the current eliminator prize funds into generic prize funds", () => {
    const {
      currentElimPfs,
      prizeFunds,
    } = setup();

    expect(
      mockElimPfsToPrizeFunds,
    ).toHaveBeenCalledWith(
      currentElimPfs,
    );

    expect(prizeFunds).toEqual(
      mockElimPfsToPrizeFunds.mock.results[0].value,
    );
  });

  it("populates the editable prize fund rows", () => {
    const {
      prizeFunds,
      elimId,
      populatedRows,
    } = setup();

    expect(mockPopulatePfRows)
      .toHaveBeenCalledWith(
        prizeFunds,
        elimId,
        expect.any(Number),
        prizeFunds.length,
      );

    expect(
      screen.getByTestId("mock-grid-row-count"),
    ).toHaveTextContent(
      populatedRows.length.toString(),
    );
  });

  it("initializes the number of cashers from the current eliminator prize funds", () => {
    const { currentElimPfs } = setup();

    expect(
      screen.getByLabelText("Cashers"),
    ).toHaveValue(
      currentElimPfs.length,
    );
  });

  it("initializes the expenses field from tournament data", () => {
    setup();

    expect(screen.getByLabelText("Expenses")).toHaveValue("5.00");
  });

  it("initializes the prize fund field from tournament data", () => {
    setup();

    expect(screen.getByLabelText("Prize Fund")).toHaveValue("35");
  });

  it("passes the initialized prize fund amount to ElimPrizeFundGrid", () => {
    setup();

    expect(screen.getByTestId("mock-grid-total-prize-fund")
    ).toHaveTextContent("35");
  });

  it("initializes the grid with editing enabled", () => {
    setup();

    expect(
      screen.getByTestId("mock-grid-enable-editing"),
    ).toHaveTextContent("true");
  });

  it("does not mark the page as changed during initialization", () => {
    setup();

    expect(
      screen.getByTestId("mock-grid-data-was-changed"),
    ).toHaveTextContent("false");
  });

  it("initializes the prize fund rows only once", () => {
    const { view } = setup();

    expect(mockElimPfsToPrizeFunds).toHaveBeenCalledTimes(1);
    expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);

    view.rerender(<ElimPrizeFundEntry />);

    expect(mockElimPfsToPrizeFunds).toHaveBeenCalledTimes(1);
    expect(mockPopulatePfRows).toHaveBeenCalledTimes(1);
  });

  it("filters tournament prize funds to the current eliminator", () => {
    const {
      elimPfs,
      currentElimPfs,
    } = setup();

    expect(elimPfs.length).toBeGreaterThan(currentElimPfs.length);

    expect(
      currentElimPfs.every(
        (elimPf) =>
          elimPf.elim_id === elimId1,
      ),
    ).toBe(true);

    expect(
      mockElimPfsToPrizeFunds,
    ).toHaveBeenCalledWith(
      currentElimPfs,
    );
  });

});