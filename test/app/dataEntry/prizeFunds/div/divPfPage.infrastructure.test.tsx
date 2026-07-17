"use client";

import { screen } from "@testing-library/react";
import {
  getLatestGridProps,
  mockDispatch,
  mockFetchDivPfs,
  mockFetchTmntFullData,
  setup,
  standardBeforeEach,
} from "./divPfPage.testSetup.test";
import {
  divId1,
  mockTmntFullData,
  mockDivPrizeFund,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("Division Prize Fund web page infrastructure", () => {
  beforeEach(standardBeforeEach);

  it("renders the page", () => {
    setup();

    expect(
      screen.getByRole("heading", {
        name: "Prize Fund",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("mock-div-prize-fund-grid"),
    ).toBeInTheDocument();
  });

  it("passes the expected props to DivPrizeFundGrid", () => {
    setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();

    expect(props?.enableEditing).toBe(true);

    expect(props?.totalPrizeFund).toBe(mockDivPrizeFund);

    expect(props?.gridDataWasChanged).toBe(false);
  });

  it("provides the expected props and callbacks to DivPrizeFundGrid", () => {
    setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();

    expect(props?.rows).toEqual(expect.any(Array));
    expect(props?.setRows).toEqual(expect.any(Function));

    expect(props?.onGridDataChanged).toEqual(
      expect.any(Function),
    );

    expect(props?.onGridDataReset).toEqual(
      expect.any(Function),
    );

    expect(props?.onNavigateAfterSave).toEqual(
      expect.any(Function),
    );

    expect(props?.onBack).toEqual(
      expect.any(Function),
    );

    expect(props?.onSaveComplete).toEqual(
      expect.any(Function),
    );
  });

  it("passes the initial prize fund rows to DivPrizeFundGrid", () => {
    const { populatedRows } = setup();

    const props = getLatestGridProps();

    expect(props).not.toBeNull();

    expect(props?.rows).toEqual(populatedRows);
  });
  
  it("dispatches fetchDivPfs with the division id", () => {
    setup();

    expect(mockFetchDivPfs).toHaveBeenCalledWith(divId1);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "divPfs/fetchDivPfs",
      payload: divId1,
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

    setup({
      tmntData: differentTmntData,
    });

    expect(mockFetchTmntFullData).toHaveBeenCalledWith(
      tmntId,
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "tmntFullData/fetchTmntFullData",
      payload: tmntId,
    });
  });

});