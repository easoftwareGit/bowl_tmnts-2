import React from "react";
import { render } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import type {
  divPfEntryRow,
  divPfType,
  prizeFundEntryRow,
} from "@/lib/types/types";
import DivPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/div/divPrizeFundGrid";
import PrizeFundGrid, {
  type PrizeFundGridHandle
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import {
  getDivPfsSaveStatus,
  saveDivPfs,
} from "@/redux/features/divPfs/divPfsSlice";
import { extractDivPfs } from "@/lib/db/divPfs/dbDivPfs";
import {
  pfEntryRowsToDivPfEntryRows,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";

const mockPrizeFundGridRender = jest.fn();
const mockGetCurrentRows = jest.fn();

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
  __esModule: true,
  getDivPfsSaveStatus: jest.fn(),
  saveDivPfs: jest.fn(),
}));

jest.mock("@/lib/db/divPfs/dbDivPfs");

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

const mockedPfEntryRowsToDivPfEntryRows = jest.mocked(
  pfEntryRowsToDivPfEntryRows,
);

const mockedExtractDivPfs = jest.mocked(extractDivPfs);
const mockedSaveDivPfs = jest.mocked(saveDivPfs);

const mockDispatch = jest.fn();
const mockUnwrap = jest.fn();

const rows: prizeFundEntryRow[] = [
  {
    id: "dpf_1",
    parent_id: "div1",
    position: 1,
    amount: 100,
    percentage: 0.4,
  },
];

describe("DivPrizeFundGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetCurrentRows.mockReturnValue([]);

    mockUnwrap.mockResolvedValue(undefined);

    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    mockedUseDispatch.mockReturnValue(mockDispatch);

    mockedUseSelector.mockImplementation((selector) => {
      if (selector === getDivPfsSaveStatus) {
        return "idle";
      }

      throw new Error("Unexpected selector used in test");
    });
  });

  it("passes the correct props to PrizeFundGrid", () => {
    const setRows = jest.fn();

    render(
      <DivPrizeFundGrid
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
    expect(props.gridId).toBe("divPfGrid");
    expect(props.prizeFundType).toBe("div");
    expect(props.rows).toBe(rows);
    expect(props.totalPrizeFund).toBe(250);
    expect(props.saveStatus).toBe("idle");
  });

  it("converts rows and dispatches saveDivPfs", async () => {
    const divRows: divPfEntryRow[] = [
      {
        id: "dpf_1",
        div_id: "div1",
        position: 1,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const divPfs: divPfType[] = [
      {
        id: "dpf_1",
        div_id: "div1",
        position: 1,
        amount: 100,
      },
    ];

    const saveAction = jest.fn() as ReturnType<typeof saveDivPfs>;

    mockedPfEntryRowsToDivPfEntryRows.mockReturnValue(divRows);
    mockedExtractDivPfs.mockReturnValue(divPfs);

    mockedSaveDivPfs.mockReturnValue(
      saveAction as ReturnType<typeof saveDivPfs>,
    );

    render(
      <DivPrizeFundGrid
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
      mockedPfEntryRowsToDivPfEntryRows,
    ).toHaveBeenCalledWith(rows);

    expect(mockedExtractDivPfs).toHaveBeenCalledWith(divRows);
    expect(mockedSaveDivPfs).toHaveBeenCalledWith(divPfs);
    expect(mockDispatch).toHaveBeenCalledWith(saveAction);
    expect(mockUnwrap).toHaveBeenCalledTimes(1);
  });
    
  it("does not dispatch when there is nothing to save", async () => {

    mockedPfEntryRowsToDivPfEntryRows.mockReturnValue([]);
    mockedExtractDivPfs.mockReturnValue([]);

    render(
      <DivPrizeFundGrid
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
      if (selector === getDivPfsSaveStatus) {
        return "saving";
      }

      throw new Error("Unexpected selector used in test");
    });

    render(
      <DivPrizeFundGrid
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
      <DivPrizeFundGrid
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
      <DivPrizeFundGrid
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
      <DivPrizeFundGrid
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