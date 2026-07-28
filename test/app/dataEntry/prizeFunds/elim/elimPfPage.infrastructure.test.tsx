"use client";

import { screen } from "@testing-library/react";
import {
  getLatestGridProps,
  mockDispatch,
  mockFetchElimPfs,
  mockFetchTmntFullData,
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup.test";
import {
  elimId1,
  mockElim1PrizeFund,
  mockTmntFullData,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Eliminator Prize Fund web page infrastructure", () => {
  beforeEach(standardBeforeEach);

  it("renders the page", () => {
    setup();

    expect(
      screen.getByRole("heading", {
        name: "Prize Fund",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("mock-elim-prize-fund-grid"),
    ).toBeInTheDocument();
  });

  it("passes the expected props to ElimPrizeFundGrid", () => {
    setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();
    expect(props?.enableEditing).toBe(true);
    expect(props?.totalPrizeFund).toBe(mockElim1PrizeFund);
    expect(props?.gridDataWasChanged).toBe(false);
  });

  it("provides the expected props and callbacks to ElimPrizeFundGrid", () => {
    setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();
    expect(props?.rows).toEqual(expect.any(Array));
    expect(props?.setRows).toEqual(expect.any(Function));
    expect(props?.onGridDataChanged).toEqual(expect.any(Function));
    expect(props?.onGridDataReset).toEqual(expect.any(Function));
    expect(props?.onNavigateAfterSave).toEqual(expect.any(Function));
    expect(props?.onBack).toEqual(expect.any(Function));
    expect(props?.onSaveComplete).toEqual(expect.any(Function));
  });

  it("passes the initial prize fund rows to ElimPrizeFundGrid", () => {
    const { populatedRows } = setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();
    expect(props?.rows).toEqual(populatedRows);
  });

  it("dispatches fetchElimPfs with the eliminator id", () => {
    setup();

    expect(mockFetchElimPfs).toHaveBeenCalledWith(elimId1);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "elimPfs/fetchElimPfs",
      payload: elimId1,
    });
  });

  it("does not dispatch fetchTmntFullData when the current tournament is already loaded", () => {
    setup();

    expect(mockFetchTmntFullData).not.toHaveBeenCalled();
  });

  it("dispatches fetchTmntFullData when the loaded tournament does not match the route tournament", () => {
    const differentTmntData = {
      ...mockTmntFullData,
      tmnt: {
        ...mockTmntFullData.tmnt,
        id: "tmt_00000000000000000000000000000099",
      },
    };

    setup({ tmntData: differentTmntData });

    expect(mockFetchTmntFullData).toHaveBeenCalledWith(tmntId);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "tmntFullData/fetchTmntFullData",
      payload: tmntId,
    });
  });
});