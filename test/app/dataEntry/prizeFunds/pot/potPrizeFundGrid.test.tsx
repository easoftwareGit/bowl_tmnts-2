import React from "react";
import { render } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import type {
  potPfEntryRow,
  potPfType,
  prizeFundEntryRow,
} from "@/lib/types/types";
import PotPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/pot/potPrizeFundGrid";
import PrizeFundGrid, {
  type PrizeFundGridHandle
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import {
  getPotPfsSaveStatus,
  savePotPfs,
} from "@/redux/features/potPfs/potPfsSlice";
import { extractPotPfs } from "@/lib/db/potPfs/dbPotPfs";
import {
  pfEntryRowsToPotPfEntryRows,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";

const mockPrizeFundGridRender = jest.fn();
const mockGetCurrentRows = jest.fn();

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/potPfs/potPfsSlice", () => ({
  __esModule: true,
  getPotPfsSaveStatus: jest.fn(),
  savePotPfs: jest.fn(),
}));

jest.mock("@/lib/db/potPfs/dbPotPfs");

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

const mockedPfEntryRowsToPotPfEntryRows = jest.mocked(
  pfEntryRowsToPotPfEntryRows,
);

const mockedExtractPotPfs = jest.mocked(extractPotPfs);
const mockedSavePotPfs = jest.mocked(savePotPfs);

const mockDispatch = jest.fn();
const mockUnwrap = jest.fn();

const rows: prizeFundEntryRow[] = [
  {
    id: "ppf_1",
    parent_id: "pot1",
    position: 1,
    amount: 100,
    percentage: 0.4,
  },
];

describe("PotPrizeFundGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetCurrentRows.mockReturnValue([]);

    mockUnwrap.mockResolvedValue(undefined);

    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    mockedUseDispatch.mockReturnValue(mockDispatch);

    mockedUseSelector.mockImplementation((selector) => {
      if (selector === getPotPfsSaveStatus) {
        return "idle";
      }

      throw new Error("Unexpected selector used in test");
    });
  });

  it("passes the correct props to PrizeFundGrid", () => {
    const setRows = jest.fn();

    render(
      <PotPrizeFundGrid
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
    expect(props.gridId).toBe("potPfGrid");
    expect(props.prizeFundType).toBe("pot");
    expect(props.rows).toBe(rows);
    expect(props.totalPrizeFund).toBe(250);
    expect(props.saveStatus).toBe("idle");
  });

  it("converts rows and dispatches savePotPfs", async () => {
    const potRows: potPfEntryRow[] = [
      {
        id: "ppf_1",
        pot_id: "pot1",
        position: 1,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const potPfs: potPfType[] = [
      {
        id: "ppf_1",
        pot_id: "pot1",
        position: 1,
        amount: 100,
      },
    ];

    const saveAction = jest.fn() as ReturnType<typeof savePotPfs>;

    mockedPfEntryRowsToPotPfEntryRows.mockReturnValue(potRows);
    mockedExtractPotPfs.mockReturnValue(potPfs);

    mockedSavePotPfs.mockReturnValue(
      saveAction as ReturnType<typeof savePotPfs>,
    );

    render(
      <PotPrizeFundGrid
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
      mockedPfEntryRowsToPotPfEntryRows,
    ).toHaveBeenCalledWith(rows);

    expect(mockedExtractPotPfs).toHaveBeenCalledWith(potRows);
    expect(mockedSavePotPfs).toHaveBeenCalledWith(potPfs);
    expect(mockDispatch).toHaveBeenCalledWith(saveAction);
    expect(mockUnwrap).toHaveBeenCalledTimes(1);
  });
    
  it("does not dispatch when there is nothing to save", async () => {

    mockedPfEntryRowsToPotPfEntryRows.mockReturnValue([]);
    mockedExtractPotPfs.mockReturnValue([]);

    render(
      <PotPrizeFundGrid
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
      if (selector === getPotPfsSaveStatus) {
        return "saving";
      }

      throw new Error("Unexpected selector used in test");
    });

    render(
      <PotPrizeFundGrid
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
      <PotPrizeFundGrid
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
      <PotPrizeFundGrid
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
      <PotPrizeFundGrid
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