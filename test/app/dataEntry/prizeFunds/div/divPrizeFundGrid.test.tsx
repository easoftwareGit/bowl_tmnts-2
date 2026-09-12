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
  type PrizeFundGridHandle,
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

const divId = "div_00000000000000000000000000000001";
const otherDivId = "div_00000000000000000000000000000002";
const tmntId = "tmt_00000000000000000000000000000001";

const rows: prizeFundEntryRow[] = [
  {
    id: "dpf_00000000000000000000000000000001",
    parent_id: divId,
    position: 1,
    amount: 100,
    percentage: 0.4,
  },
];

const existingDivPfs: divPfType[] = [
  {
    id: "dpf_00000000000000000000000000000001",
    div_id: divId,
    position: 1,
    amount: 75,
  },
  {
    id: "dpf_00000000000000000000000000000002",
    div_id: otherDivId,
    position: 1,
    amount: 150,
  },
];

describe("DivPrizeFundGrid", () => {
  let mockSaveStatus: string;
  let mockAllDivPfs: divPfType[];
  let mockTmntId: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSaveStatus = "idle";
    mockAllDivPfs = existingDivPfs;
    mockTmntId = tmntId;

    mockGetCurrentRows.mockReturnValue([]);

    mockUnwrap.mockResolvedValue(undefined);

    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    mockedUseDispatch.mockReturnValue(mockDispatch);

    mockedUseSelector.mockImplementation((selector) => {
      if (selector === getDivPfsSaveStatus) {
        return mockSaveStatus;
      }

      return selector({
        divPfs: {
          divPfs: mockAllDivPfs,
        },
        tmntFullData: {
          tmntFullData: {
            tmnt: {
              id: mockTmntId,
            },
          },
        },
      } as any);
    });
  });

  it("passes the correct props to PrizeFundGrid", () => {
    const setRows = jest.fn();
    const onGridDataChanged = jest.fn();
    const onGridDataReset = jest.fn();
    const onNavigateAfterSave = jest.fn();
    const onBack = jest.fn();
    const onSaveComplete = jest.fn();

    render(
      <DivPrizeFundGrid
        rows={rows}
        setRows={setRows}
        divId={divId}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={onGridDataChanged}
        onGridDataReset={onGridDataReset}
        onNavigateAfterSave={onNavigateAfterSave}
        onBack={onBack}
        onSaveComplete={onSaveComplete}
      />,
    );

    expect(
      mockPrizeFundGridRender,
    ).toHaveBeenCalledTimes(1);

    const props =
      mockPrizeFundGridRender.mock.calls[0][0];

    expect(props.gridId).toBe("divPfGrid");
    expect(props.prizeFundType).toBe("div");
    expect(props.rows).toBe(rows);
    expect(props.setRows).toBe(setRows);
    expect(props.totalPrizeFund).toBe(250);
    expect(props.enableEditing).toBe(true);
    expect(props.gridDataWasChanged).toBe(false);
    expect(props.saveStatus).toBe("idle");
    expect(props.onGridDataChanged).toBe(onGridDataChanged);
    expect(props.onGridDataReset).toBe(onGridDataReset);
    expect(props.onNavigateAfterSave).toBe(onNavigateAfterSave);
    expect(props.onBack).toBe(onBack);
    expect(props.onSaveComplete).toBe(onSaveComplete);
    expect(props.onSave).toEqual(expect.any(Function));
  });

  it("replaces the current division rows and dispatches saveDivPfs", async () => {
    const divRows: divPfEntryRow[] = [
      {
        id: "dpf_00000000000000000000000000000003",
        div_id: divId,
        position: 1,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const divPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000003",
        div_id: divId,
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
        divId={divId}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props =
      mockPrizeFundGridRender.mock.calls[0][0];

    await props.onSave(rows);

    expect(
      mockedPfEntryRowsToDivPfEntryRows,
    ).toHaveBeenCalledWith(rows);
    expect(mockedExtractDivPfs).toHaveBeenCalledWith(divRows);

    expect(
      mockedSaveDivPfs,
    ).toHaveBeenCalledWith({
      divPfData: [
        existingDivPfs[1],
        divPfs[0],
      ],
      divIds: [
        otherDivId,
        divId,
      ],
      tmntId,
    });

    expect(mockDispatch).toHaveBeenCalledWith(saveAction);
    expect(mockUnwrap).toHaveBeenCalledTimes(1);
  });

  it("removes the old rows for the current division before saving", async () => {
    const divRows: divPfEntryRow[] = [
      {
        id: "dpf_00000000000000000000000000000003",
        div_id: divId,
        position: 1,
        amount: 125,
        percentage: 0.5,
      },
    ];

    const newDivPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000003",
        div_id: divId,
        position: 1,
        amount: 125,
      },
    ];

    const saveAction =jest.fn() as ReturnType<typeof saveDivPfs>;

    mockedPfEntryRowsToDivPfEntryRows.mockReturnValue(divRows);
    mockedExtractDivPfs.mockReturnValue(newDivPfs);
    mockedSaveDivPfs.mockReturnValue(
      saveAction as ReturnType<typeof saveDivPfs>,
    );

    render(
      <DivPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        divId={divId}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props = mockPrizeFundGridRender.mock.calls[0][0];

    await props.onSave(rows);

    const savePayload = mockedSaveDivPfs.mock.calls[0][0];

    expect(
      savePayload.divPfData,
    ).toEqual([
      existingDivPfs[1],
      newDivPfs[0],
    ]);

    expect(
      savePayload.divPfData.some(
        (divPf: divPfType) =>
          divPf.id === existingDivPfs[0].id,
      ),
    ).toBe(false);
  });

  it("preserves rows belonging to other divisions when saving", async () => {
    const divRows: divPfEntryRow[] = [
      {
        id: "dpf_00000000000000000000000000000003",
        div_id: divId,
        position: 1,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const divPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000003",
        div_id: divId,
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
        divId={divId}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props = mockPrizeFundGridRender.mock.calls[0][0];

    await props.onSave(rows);

    const savePayload = mockedSaveDivPfs.mock.calls[0][0];    

    expect(
      savePayload.divPfData,
    ).toContainEqual(existingDivPfs[1]);
  });

  it("does not dispatch when there is nothing to save", async () => {
    mockAllDivPfs = [];

    mockedPfEntryRowsToDivPfEntryRows.mockReturnValue([]);
    mockedExtractDivPfs.mockReturnValue([]);

    render(
      <DivPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        divId={divId}
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

    expect(mockedSaveDivPfs).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockUnwrap).not.toHaveBeenCalled();
  });

  it("passes the Redux save status to PrizeFundGrid", () => {
    mockSaveStatus = "saving";

    render(
      <DivPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        divId={divId}
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
        divId={divId}
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
        divId={divId}
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
        divId={divId}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);
    expect(ref.current).not.toBeNull();
    expect(
      ref.current?.getCurrentRows,
    ).toEqual(
      expect.any(Function),
    );

    expect(ref.current?.getCurrentRows()).toEqual(currentRows);
    expect(mockGetCurrentRows).toHaveBeenCalledTimes(1);
  });
});
