import React from "react";
import { render } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import type {
  potPfEntryRow,
  potPfType,
  prizeFundEntryRow,
} from "@/lib/types/types";
import PotPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/pot/potPrizeFundGrid";
import type {
  PrizeFundGridHandle
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import type { RootState } from "@/redux/store";
import {
  getPotPfsSaveStatus,
  savePotPfs,
  selectPotPfs,
} from "@/redux/features/potPfs/potPfsSlice";
import {
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
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

jest.mock(
  "@/redux/features/potPfs/potPfsSlice",
  () => ({
    __esModule: true,

    selectPotPfs: jest.fn(
      (state: RootState) =>
        state.potPfs.potPfs,
    ),

    getPotPfsSaveStatus: jest.fn(
      (state: RootState) =>
        state.potPfs.saveStatus,
    ),

    savePotPfs: jest.fn(),
  }),
);

jest.mock(
  "@/redux/features/tmntFullData/tmntFullDataSlice",
  () => ({
    __esModule: true,

    selectTmntFullData: jest.fn(
      (state: RootState) =>
        state.tmntFullData.tmntFullData,
    ),
  }),
);

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

const mockedPfEntryRowsToPotPfEntryRows = jest.mocked(
  pfEntryRowsToPotPfEntryRows,
);

const mockedExtractPotPfs = jest.mocked(extractPotPfs);
const mockedSavePotPfs = jest.mocked(savePotPfs);

const mockDispatch = jest.fn();
const mockUnwrap = jest.fn();

const tmntId = "tmt_1";
const potId = "pot1";

const rows: prizeFundEntryRow[] = [
  {
    id: "ppf_1",
    parent_id: potId,
    position: 1,
    amount: 100,
    percentage: 0.4,
  },
];

const existingPotPfs: potPfType[] = [
  {
    id: "ppf_old_1",
    pot_id: potId,
    position: 1,
    amount: 75,
  },
  {
    id: "ppf_old_2",
    pot_id: potId,
    position: 2,
    amount: 25,
  },
  {
    id: "ppf_other_1",
    pot_id: "pot2",
    position: 1,
    amount: 200,
  },
];

let mockAllPotPfs: potPfType[];

describe("PotPrizeFundGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockAllPotPfs = [...existingPotPfs];

    mockGetCurrentRows.mockReturnValue([]);

    mockUnwrap.mockResolvedValue(undefined);

    mockDispatch.mockReturnValue({ unwrap: mockUnwrap });    

    mockedUseDispatch.mockReturnValue(mockDispatch);

    mockedUseSelector.mockImplementation((selector) => {
      const state = {
        potPfs: {
          potPfs: mockAllPotPfs,
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

      return selector(state);
    });
  });

  it("passes the correct props to PrizeFundGrid", () => {
    const setRows = jest.fn();

    render(
      <PotPrizeFundGrid
        rows={rows}
        setRows={setRows}
        potId={potId}
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
    expect(props.setRows).toBe(setRows);
    expect(props.totalPrizeFund).toBe(250);
    expect(props.saveStatus).toBe("idle");
  });

  it("replaces the current pot rows and dispatches savePotPfs", async () => {
    const potRows: potPfEntryRow[] = [
      {
        id: "ppf_1",
        pot_id: potId,
        position: 1,
        amount: 150,
        percentage: 0.6,
      },
      {
        id: "ppf_2",
        pot_id: potId,
        position: 2,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const potPfs: potPfType[] = [
      {
        id: "ppf_1",
        pot_id: potId,
        position: 1,
        amount: 150,
      },
      {
        id: "ppf_2",
        pot_id: potId,
        position: 2,
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
        potId={potId}
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

    expect(mockedPfEntryRowsToPotPfEntryRows).toHaveBeenCalledWith(rows);
    expect(mockedExtractPotPfs).toHaveBeenCalledWith(potRows);

    /*
     * The old pot1 rows are removed.
     * The existing pot2 row is preserved.
     * The newly edited pot1 rows are added.
     */
    expect(mockedSavePotPfs).toHaveBeenCalledWith({
      potPfData: [
        {
          id: "ppf_other_1",
          pot_id: "pot2",
          position: 1,
          amount: 200,
        },
        {
          id: "ppf_1",
          pot_id: potId,
          position: 1,
          amount: 150,
        },
        {
          id: "ppf_2",
          pot_id: potId,
          position: 2,
          amount: 100,
        },
      ],
      potIds: [
        "pot2",
        potId,        
      ],
      tmntId,
    });

    expect(mockDispatch).toHaveBeenCalledWith(saveAction);
    expect(mockUnwrap).toHaveBeenCalledTimes(1);
  });

  it("does not dispatch when there are no pot prize funds to save", async () => {
    mockAllPotPfs = [];

    mockedPfEntryRowsToPotPfEntryRows.mockReturnValue([]);

    mockedExtractPotPfs.mockReturnValue([]);

    render(
      <PotPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        potId={potId}
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

    expect(mockedPfEntryRowsToPotPfEntryRows).toHaveBeenCalledWith(rows);
    expect(mockedExtractPotPfs).toHaveBeenCalledWith([]);
    expect(mockedSavePotPfs).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockUnwrap).not.toHaveBeenCalled();
  });

  it("preserves and saves other pot prize funds when the current pot has no rows", async () => {
    mockedPfEntryRowsToPotPfEntryRows.mockReturnValue([]);
    mockedExtractPotPfs.mockReturnValue([]);

    const saveAction =
      jest.fn() as ReturnType<
        typeof savePotPfs
      >;

    mockedSavePotPfs.mockReturnValue(saveAction);

    render(
      <PotPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        potId={potId}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props = mockPrizeFundGridRender.mock.calls[0][0];

    await props.onSave([]);

    expect(
      mockedSavePotPfs,
    ).toHaveBeenCalledWith({
      potPfData: [existingPotPfs[2]],
      potIds: ["pot2"],
      tmntId,
    });

    expect(mockDispatch).toHaveBeenCalledWith(saveAction);
    expect(mockUnwrap).toHaveBeenCalledTimes(1);
  });

  // it("does not dispatch when there is nothing to save", async () => {
  //   mockedPfEntryRowsToPotPfEntryRows.mockReturnValue([]);
  //   mockedExtractPotPfs.mockReturnValue([]);

  //   render(
  //     <PotPrizeFundGrid
  //       rows={rows}
  //       setRows={jest.fn()}
  //       potId={potId}
  //       totalPrizeFund={250}
  //       gridDataWasChanged={false}
  //       onGridDataChanged={jest.fn()}
  //       onGridDataReset={jest.fn()}
  //       onNavigateAfterSave={jest.fn()}
  //       onBack={jest.fn()}
  //     />,
  //   );

  //   const props = mockPrizeFundGridRender.mock.calls[0][0];

  //   await props.onSave(rows);

  //   expect(mockedPfEntryRowsToPotPfEntryRows).toHaveBeenCalledWith(rows);
  //   expect(mockedExtractPotPfs).toHaveBeenCalledWith([]);
  //   expect(mockedSavePotPfs).not.toHaveBeenCalled();
  //   expect(mockDispatch).not.toHaveBeenCalled();
  //   expect(mockUnwrap).not.toHaveBeenCalled();
  // });

  it("passes the Redux save status to PrizeFundGrid", () => {
    mockedUseSelector.mockImplementation((selector) => {
      const state = {
        potPfs: {
          potPfs: mockAllPotPfs,
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

      return selector(state);
    });

    render(
      <PotPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        potId={potId}
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
        potId={potId}
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
        potId={potId}
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
        potId={potId}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getCurrentRows).toEqual(expect.any(Function));
    expect(ref.current?.getCurrentRows()).toEqual(currentRows);
    expect(mockGetCurrentRows).toHaveBeenCalledTimes(1);
  });

  it("includes each pot id only once in the save data", async () => {
    const potRows: potPfEntryRow[] = [
      {
        id: "ppf_1",
        pot_id: potId,
        position: 1,
        amount: 150,
        percentage: 0.6,
      },
      {
        id: "ppf_2",
        pot_id: potId,
        position: 2,
        amount: 100,
        percentage: 0.4,
      },
    ];

    const potPfs: potPfType[] = [
      {
        id: "ppf_1",
        pot_id: potId,
        position: 1,
        amount: 150,
      },
      {
        id: "ppf_2",
        pot_id: potId,
        position: 2,
        amount: 100,
      },
    ];

    mockedPfEntryRowsToPotPfEntryRows.mockReturnValue(potRows);
    mockedExtractPotPfs.mockReturnValue(potPfs);

    const saveAction =
      jest.fn() as ReturnType<
        typeof savePotPfs
      >;

    mockedSavePotPfs.mockReturnValue(saveAction);

    render(
      <PotPrizeFundGrid
        rows={rows}
        setRows={jest.fn()}
        potId={potId}
        totalPrizeFund={250}
        gridDataWasChanged={false}
        onGridDataChanged={jest.fn()}
        onGridDataReset={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const props = mockPrizeFundGridRender.mock.calls[0][0];

    await props.onSave(rows);

    const saveData = mockedSavePotPfs.mock.calls[0][0];

    expect(saveData.potIds).toEqual([
      "pot2",
      potId,
    ]);
  });  
});

