import React from "react";
import { render } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import type {
  elimPfEntryRow,
  elimPfType,
  prizeFundEntryRow,
  tmntElimPfSaveDataType,
} from "@/lib/types/types";
import type { RootState } from "@/redux/store";
import ElimPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/elim/elimPrizeFundGrid";
import type { 
  PrizeFundGridHandle,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import {
  getElimPfsSaveStatus,
  saveElimPfs,
} from "@/redux/features/elimPfs/elimPfsSlice";
import { extractElimPfs } from "@/lib/db/elimPfs/dbElimPfs";
import {
  pfEntryRowsToElimPfEntryRows,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
import { elimId1, elimId2, tmntId } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

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

const mockedPfEntryRowsToElimPfEntryRows = jest.mocked(
  pfEntryRowsToElimPfEntryRows,
);

const mockedExtractElimPfs = jest.mocked(extractElimPfs);
const mockedSaveElimPfs = jest.mocked(saveElimPfs);

const mockDispatch = jest.fn();
const mockUnwrap = jest.fn();

const rows: prizeFundEntryRow[] = [
  {
    id: "epf_00000000000000000000000000000001",
    parent_id: elimId1,
    position: 1,
    amount: 100,
    percentage: 0.4,
  },
];

const existingElimPfs: elimPfType[] = [
  {
    id: "epf_00000000000000000000000000000001",
    elim_id: elimId1,
    position: 1,
    amount: 90,
  },
  {
    id: "epf_00000000000000000000000000000002",
    elim_id: elimId1,
    position: 2,
    amount: 60,
  },
  {
    id: "epf_00000000000000000000000000000003",
    elim_id: elimId2,
    position: 1,
    amount: 75,
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

    /*
     * ElimPrizeFundGrid now uses three selectors:
     *
     * 1. getElimPfsSaveStatus
     * 2. state.elimPfs.elimPfs
     * 3. state.tmntFullData.tmntFullData
     *
     * Calling each selector with a mock RootState lets both the named
     * selector and inline selectors behave like the real Redux store.
     */
    mockedUseSelector.mockImplementation((selector) => {
      const state = {
        elimPfs: {
          elimPfs: existingElimPfs,
          saveStatus: "idle",
        },
        tmntFullData: {
          tmntFullData: {
            tmnt: {
              id: tmntId,
            },
          },
        },
      } as unknown as RootState;

      if (selector === getElimPfsSaveStatus) {
        return "idle";
      }

      return selector(state);
    });
  });

  it("passes the correct props to PrizeFundGrid", () => {
    const setRows = jest.fn();

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={setRows}
        elimId={elimId1}
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

    const props =
      mockPrizeFundGridRender.mock.calls[0][0];

    expect(props.gridId).toBe("elimPfGrid");
    expect(props.prizeFundType).toBe("elm");
    expect(props.rows).toBe(rows);
    expect(props.setRows).toBe(setRows);
    expect(props.totalPrizeFund).toBe(250);
    expect(props.saveStatus).toBe("idle");
  });

  it("converts rows, replaces the current elim prize funds, and dispatches saveElimPfs", async () => {
    const elimRows: elimPfEntryRow[] = [
      {
        id: "epf_00000000000000000000000000000004",
        elim_id: elimId1,
        position: 1,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const elimPfsToSave: elimPfType[] = [
      {
        id: "epf_00000000000000000000000000000004",
        elim_id: elimId1,
        position: 1,
        amount: 100,
      },
    ];

    const saveAction =
      jest.fn() as ReturnType<typeof saveElimPfs>;

    mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(
      elimRows,
    );

    mockedExtractElimPfs.mockReturnValue(
      elimPfsToSave,
    );

    mockedSaveElimPfs.mockReturnValue(
      saveAction,
    );

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        elimId={elimId1}
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
      mockedPfEntryRowsToElimPfEntryRows,
    ).toHaveBeenCalledWith(rows);

    expect(
      mockedExtractElimPfs,
    ).toHaveBeenCalledWith(elimRows);

    /*
     * Existing elimId1 rows must be removed.
     * Existing rows belonging to elimId2 must remain.
     * The newly edited elimId1 rows must be appended.
     */
    const expectedElimPfs: elimPfType[] = [
      existingElimPfs[2],
      ...elimPfsToSave,
    ];

    const expectedSaveData: tmntElimPfSaveDataType = {
      elimPfData: expectedElimPfs,
      elimIds: expectedElimPfs.map(
        (elimPf) => elimPf.elim_id,
      ),
      tmntId,
    };

    expect(mockedSaveElimPfs).toHaveBeenCalledWith(
      expectedSaveData,
    );

    expect(mockDispatch).toHaveBeenCalledWith(
      saveAction,
    );

    expect(mockUnwrap).toHaveBeenCalledTimes(1);
  });

  it("preserves prize funds belonging to other eliminators when saving", async () => {
    const elimRows: elimPfEntryRow[] = [
      {
        id: "epf_00000000000000000000000000000004",
        elim_id: elimId1,
        position: 1,
        amount: 125,
        percentage: 0.5,
      },
    ];

    const updatedElimPfs: elimPfType[] = [
      {
        id: "epf_00000000000000000000000000000004",
        elim_id: elimId1,
        position: 1,
        amount: 125,
      },
    ];

    const saveAction =
      jest.fn() as ReturnType<typeof saveElimPfs>;

    mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(
      elimRows,
    );

    mockedExtractElimPfs.mockReturnValue(
      updatedElimPfs,
    );

    mockedSaveElimPfs.mockReturnValue(
      saveAction,
    );

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        elimId={elimId1}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props =
      mockPrizeFundGridRender.mock.calls[0][0];

    await props.onSave(rows);

    const expectedOtherElimPf =
      existingElimPfs.find(
        (elimPf) =>
          elimPf.elim_id === elimId2,
      );

    expect(expectedOtherElimPf).toBeDefined();

    expect(mockedSaveElimPfs).toHaveBeenCalledWith(
      expect.objectContaining({
        elimPfData: expect.arrayContaining([
          expectedOtherElimPf,
        ]),
      }),
    );
  });

  it("removes the old current elim prize funds before adding the edited rows", async () => {
    const newElimPf: elimPfType = {
      id: "epf_00000000000000000000000000000004",
      elim_id: elimId1,
      position: 1,
      amount: 125,
    };

    const newElimPfEntryRow: elimPfEntryRow = {
      id: newElimPf.id,
      elim_id: newElimPf.elim_id,
      position: 1,
      amount: 125,
      percentage: 0.5,
    };    

    mockedPfEntryRowsToElimPfEntryRows.mockReturnValue([
      newElimPfEntryRow,
    ]);

    mockedExtractElimPfs.mockReturnValue([
      newElimPf,
    ]);

    const saveAction = jest.fn() as ReturnType<typeof saveElimPfs>;

    mockedSaveElimPfs.mockReturnValue(saveAction);

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        elimId={elimId1}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props = mockPrizeFundGridRender.mock.calls[0][0];

    await props.onSave(rows);

    const saveData = mockedSaveElimPfs.mock.calls[0][0];

    /*
     * Neither of the original elimId1 records should survive.
     */
    expect(saveData.elimPfData).not.toContainEqual(existingElimPfs[0]);    
    expect(saveData.elimPfData).not.toContainEqual(existingElimPfs[1]);

    /*
     * The newly edited elimId1 record should be present.
     */
    expect(saveData.elimPfData).toContainEqual(newElimPf);
  });

  it("includes the tournament id in the save data", async () => {
    const elimRows: elimPfEntryRow[] = [
      {
        id: "epf_00000000000000000000000000000004",
        elim_id: elimId1,
        position: 1,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const elimPfsToSave: elimPfType[] = [
      {
        id: "epf_00000000000000000000000000000004",
        elim_id: elimId1,
        position: 1,
        amount: 100,
      },
    ];

    mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(elimRows);
    mockedExtractElimPfs.mockReturnValue(elimPfsToSave);

    const saveAction = jest.fn() as ReturnType<typeof saveElimPfs>;

    mockedSaveElimPfs.mockReturnValue(saveAction);

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        elimId={elimId1}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props = mockPrizeFundGridRender.mock.calls[0][0];

    await props.onSave(rows);

    expect(mockedSaveElimPfs).toHaveBeenCalledWith(
      expect.objectContaining({
        tmntId,
      }),
    );
  });

  it("does not dispatch when there is nothing to save", async () => {
    mockedPfEntryRowsToElimPfEntryRows.mockReturnValue([]);
    mockedExtractElimPfs.mockReturnValue([]);

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        elimId={elimId1}
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

    expect(mockedSaveElimPfs).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockUnwrap).not.toHaveBeenCalled();
  });

  it("passes the Redux save status to PrizeFundGrid", () => {
    mockedUseSelector.mockImplementation((selector) => {
      const state = {
        elimPfs: {
          elimPfs: existingElimPfs,
          saveStatus: "saving",
        },
        tmntFullData: {
          tmntFullData: {
            tmnt: {
              id: tmntId,
            },
          },
        },
      } as unknown as RootState;

      if (selector === getElimPfsSaveStatus) {
        return "saving";
      }

      return selector(state);
    });

    render(
      <ElimPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        elimId={elimId1}
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
        elimId={elimId1}
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
        elimId={elimId1}
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
        elimId={elimId1}
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

    expect(
      ref.current?.getCurrentRows(),
    ).toEqual(
      currentRows,
    );

    expect(mockGetCurrentRows).toHaveBeenCalledTimes(1);
  });
});
