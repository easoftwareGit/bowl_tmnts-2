import React from "react";
import { render } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import type {
  elimPfEntryRow,
  elimPfType,
  prizeFundEntryRow,
} from "@/lib/types/types";
import ElimPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/elim/elimPrizeFundGrid";
import PrizeFundGrid, {
  type PrizeFundGridHandle
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import {
  getElimPfsSaveStatus,
  saveElimPfs,
} from "@/redux/features/elimPfs/elimPfsSlice";
import { extractElimPfs } from "@/lib/db/elimPfs/dbElimPfs";
import {
  pfEntryRowsToElimPfEntryRows,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";

const mockPrizeFundGridRender = jest.fn();
const mockGetCurrentRows = jest.fn();

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/elimPfs/elimPfsSlice", () => ({
  __esModule: true,
  getElimPfsSaveStatus: jest.fn(),
  saveElimPfs: jest.fn(),
}));

jest.mock("@/lib/db/elimPfs/dbElimPfs");

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes",
);

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid",
  () => {
    const ReactModule =
      jest.requireActual<typeof import("react")>("react");

    const MockPrizeFundGrid = ReactModule.forwardRef(
      (props, ref) => {
        mockPrizeFundGridRender(props);

        ReactModule.useImperativeHandle(
          ref,
          () => ({
            getCurrentRows: mockGetCurrentRows,
          }),
          [],
        );

        return null;
      },
    );

    MockPrizeFundGrid.displayName = "MockPrizeFundGrid";

    return {
      __esModule: true,
      default: MockPrizeFundGrid,
    };
  },
);

const mockedUseDispatch = jest.mocked(useDispatch);
const mockedUseSelector = jest.mocked(useSelector);

const mockedPrizeFundGrid = jest.mocked(PrizeFundGrid);

const mockedPfEntryRowsToElimPfEntryRows = jest.mocked(
  pfEntryRowsToElimPfEntryRows,
);

const mockedExtractElimPfs = jest.mocked(extractElimPfs);
const mockedSaveElimPfs = jest.mocked(saveElimPfs);

const mockDispatch = jest.fn();
const mockUnwrap = jest.fn();

const rows: prizeFundEntryRow[] = [
  {
    id: "epf_1",
    parent_id: "elm1",
    position: 1,
    amount: 100,
    percentage: 0.4,
  },
];

describe("ElimPrizeFundGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetCurrentRows.mockReturnValue([]);

    mockUnwrap.mockResolvedValue(undefined);

    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    mockedUseDispatch.mockReturnValue(mockDispatch);

    mockedUseSelector.mockImplementation((selector) => {
      if (selector === getElimPfsSaveStatus) {
        return "idle";
      }

      throw new Error("Unexpected selector used in test");
    });
  });

  it("passes the correct props to PrizeFundGrid", () => {
    const setRows = jest.fn();

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={setRows}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onBack={jest.fn()}
        onSaveComplete={jest.fn()}
      />,
    );

    expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);

    const props = mockPrizeFundGridRender.mock.calls[0][0];
    expect(props.gridId).toBe("elimPfGrid");
    expect(props.prizeFundType).toBe("elm");
    expect(props.rows).toBe(rows);
    expect(props.totalPrizeFund).toBe(250);
    expect(props.saveStatus).toBe("idle");
  });

  it("converts rows and dispatches saveElimPfs", async () => {
    const elimRows: elimPfEntryRow[] = [
      {
        id: "epf_1",
        elim_id: "elm1",
        position: 1,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const elimPfs: elimPfType[] = [
      {
        id: "epf_1",
        elim_id: "elm1",
        position: 1,
        amount: 100,
      },
    ];

    const saveAction = jest.fn() as ReturnType<typeof saveElimPfs>;

    mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(elimRows);
    mockedExtractElimPfs.mockReturnValue(elimPfs);

    mockedSaveElimPfs.mockReturnValue(
      saveAction as ReturnType<typeof saveElimPfs>,
    );

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props = mockPrizeFundGridRender.mock.calls[0][0];
    await props.onSave(rows);

    expect(
      mockedPfEntryRowsToElimPfEntryRows,
    ).toHaveBeenCalledWith(rows);

    expect(mockedExtractElimPfs).toHaveBeenCalledWith(elimRows);
    expect(mockedSaveElimPfs).toHaveBeenCalledWith(elimPfs);
    expect(mockDispatch).toHaveBeenCalledWith(saveAction);
    expect(mockUnwrap).toHaveBeenCalledTimes(1);
  });
    
  it("does not dispatch when there is nothing to save", async () => {

    mockedPfEntryRowsToElimPfEntryRows.mockReturnValue([]);
    mockedExtractElimPfs.mockReturnValue([]);

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    
    const props = mockPrizeFundGridRender.mock.calls[0][0];
    await props.onSave(rows);

    expect(mockDispatch).not.toHaveBeenCalled();
  });  

  it("passes the Redux save status to PrizeFundGrid", () => {
    mockedUseSelector.mockImplementation((selector) => {
      if (selector === getElimPfsSaveStatus) {
        return "saving";
      }

      throw new Error("Unexpected selector used in test");
    });

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props = mockPrizeFundGridRender.mock.calls[0][0];
    expect(props.saveStatus).toBe("saving");
  });

  it("defaults enableEditing to true", () => {

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);
    const props = mockPrizeFundGridRender.mock.calls[0][0];
    
    expect(props.enableEditing).toBe(true);
  });  

  it("passes enableEditing through", () => {

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        totalPrizeFund={250}
        enableEditing={false}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);
    const props = mockPrizeFundGridRender.mock.calls[0][0];    

    expect(props.enableEditing).toBe(false);
  });  

  it("forwards its ref to PrizeFundGrid", () => {
    const currentRows: prizeFundEntryRow[] = [
      {
        ...rows[0],
        amount: 125,
        percentage: 0.5,
      },
    ];

    mockGetCurrentRows.mockReturnValue(currentRows);

    const ref = React.createRef<PrizeFundGridHandle>();

    render(
      <ElimPrizeFundGrid
        ref={ref}
        rows={rows}
        setRows={jest.fn()}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.getCurrentRows).toEqual(
      expect.any(Function),
    );

    expect(ref.current?.getCurrentRows()).toEqual(
      currentRows,
    );

    expect(mockGetCurrentRows).toHaveBeenCalledTimes(1);
  });

})