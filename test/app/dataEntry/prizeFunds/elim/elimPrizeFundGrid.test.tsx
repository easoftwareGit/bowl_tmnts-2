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
import { saveElimPfs } from "@/redux/features/elimPfs/elimPfsSlice";
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
  selectElimPfs: jest.fn((state) => state.elimPfs.elimPfs),
  getElimPfsSaveStatus: jest.fn((state) => state.elimPfs.saveStatus),
  saveElimPfs: jest.fn(),
}));

jest.mock(
  "@/redux/features/tmntFullData/tmntFullDataSlice",
  () => ({
    __esModule: true,
    selectTmntFullData: jest.fn((state) => state.tmntFullData.tmntFullData),
  }),
);

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

let mockAllElimPfs: elimPfType[];
let mockSaveStatus: string;

/***********
 * Helpers *
 ***********/

type ElimPrizeFundGridProps = React.ComponentProps<typeof ElimPrizeFundGrid>;

/**
 * Builds the required props with fresh jest.fn() callbacks.
 * Pass overrides for anything a test needs to control or inspect.
 */
const buildProps = (
  overrides: Partial<ElimPrizeFundGridProps> = {},
): ElimPrizeFundGridProps => ({
  rows,
  setRows: jest.fn(),
  elimId: elimId1,
  totalPrizeFund: 250,
  gridDataWasChanged: false,
  onGridDataChanged: jest.fn(),
  onGridDataReset: jest.fn(),
  onBack: jest.fn(),
  ...overrides,
});

const renderGrid = (overrides: Partial<ElimPrizeFundGridProps> = {}) =>
  render(<ElimPrizeFundGrid {...buildProps(overrides)} />);

/**
 * Props received by the mocked PrizeFundGrid on its most recent render.
 * Using the last render (not the first) ensures tests see the current
 * handleSave closure after any rerender.
 */
const getGridProps = () => mockPrizeFundGridRender.mock.lastCall?.[0];

/**
 * Sets up the conversion and extraction mocks and returns the save action
 * that saveElimPfs will produce.
 */
const setupSaveMocks = (
  elimRows: elimPfEntryRow[],
  elimPfsToSave: elimPfType[],
) => {
  mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(elimRows);
  mockedExtractElimPfs.mockReturnValue(elimPfsToSave);

  const saveAction = jest.fn() as unknown as ReturnType<typeof saveElimPfs>;
  mockedSaveElimPfs.mockReturnValue(saveAction);

  return saveAction;
};

const newElimRow: elimPfEntryRow = {
  id: "epf_00000000000000000000000000000004",
  elim_id: elimId1,
  position: 1,
  amount: 100,
  percentage: 0.4,
};

const newElimPf: elimPfType = {
  id: "epf_00000000000000000000000000000004",
  elim_id: elimId1,
  position: 1,
  amount: 100,
};

describe("ElimPrizeFundGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockAllElimPfs = existingElimPfs;
    mockSaveStatus = "idle";

    mockGetCurrentRows.mockReturnValue([]);
    mockUnwrap.mockResolvedValue(undefined);
    mockDispatch.mockReturnValue({ unwrap: mockUnwrap });
    mockedUseDispatch.mockReturnValue(mockDispatch);

    /*
     * ElimPrizeFundGrid uses three Redux selectors:
     *
     * 1. getElimPfsSaveStatus
     * 2. selectElimPfs
     * 3. selectTmntFullData
     *
     * Calling each selector with a mock RootState keeps this
     * test consistent with the real Redux state shape. The
     * state reads mockAllElimPfs / mockSaveStatus at call time,
     * so tests can change them before rendering or rerendering.
     */
    mockedUseSelector.mockImplementation((selector) => {
      const state = {
        elimPfs: {
          elimPfs: mockAllElimPfs,
          saveStatus: mockSaveStatus,
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

  /*********
   * Props *
   *********/

  describe("props passed to PrizeFundGrid", () => {
    it("passes the elim-specific grid id and prize fund type", () => {
      renderGrid();

      expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);

      const props = getGridProps();
      expect(props.gridId).toBe("elimPfGrid");
      expect(props.prizeFundType).toBe("elm");
    });

    it("passes data props through unchanged", () => {
      const setRows = jest.fn();

      renderGrid({
        setRows,
        totalPrizeFund: 250,
        gridDataWasChanged: true,
      });

      const props = getGridProps();
      expect(props.rows).toBe(rows);
      expect(props.setRows).toBe(setRows);
      expect(props.totalPrizeFund).toBe(250);
      expect(props.gridDataWasChanged).toBe(true);
    });

    it("passes every callback through by reference", () => {
      const onGridDataChanged = jest.fn();
      const onGridDataReset = jest.fn();
      const onNavigateAfterSave = jest.fn();
      const onBack = jest.fn();
      const onSaveComplete = jest.fn();
      const onCancel = jest.fn();

      renderGrid({
        onGridDataChanged,
        onGridDataReset,
        onNavigateAfterSave,
        onBack,
        onSaveComplete,
        onCancel,
      });

      const props = getGridProps();
      expect(props.onGridDataChanged).toBe(onGridDataChanged);
      expect(props.onGridDataReset).toBe(onGridDataReset);
      expect(props.onNavigateAfterSave).toBe(onNavigateAfterSave);
      expect(props.onBack).toBe(onBack);
      expect(props.onSaveComplete).toBe(onSaveComplete);
      expect(props.onCancel).toBe(onCancel);
    });

    it("passes undefined for optional callbacks that are not supplied", () => {
      renderGrid();

      const props = getGridProps();
      expect(props.onNavigateAfterSave).toBeUndefined();
      expect(props.onSaveComplete).toBeUndefined();
      expect(props.onCancel).toBeUndefined();
    });

    it("passes its own save handler, not a parent callback, as onSave", () => {
      renderGrid();

      expect(getGridProps().onSave).toEqual(expect.any(Function));
    });

    it("passes the Redux save status to PrizeFundGrid", () => {
      mockSaveStatus = "saving";

      renderGrid();

      expect(getGridProps().saveStatus).toBe("saving");
    });

    it("defaults enableEditing to true", () => {
      renderGrid();

      expect(getGridProps().enableEditing).toBe(true);
    });

    it("passes enableEditing through", () => {
      renderGrid({ enableEditing: false });

      expect(getGridProps().enableEditing).toBe(false);
    });
  });

  /*******
   * Ref *
   *******/

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

    render(<ElimPrizeFundGrid ref={ref} {...buildProps()} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.getCurrentRows).toEqual(expect.any(Function));
    expect(ref.current?.getCurrentRows()).toEqual(currentRows);
    expect(mockGetCurrentRows).toHaveBeenCalledTimes(1);
  });

  /********
   * Save *
   ********/

  describe("onSave", () => {
    it("converts rows, replaces the current elim prize funds, and dispatches saveElimPfs", async () => {
      const saveAction = setupSaveMocks([newElimRow], [newElimPf]);

      renderGrid();

      await getGridProps().onSave(rows);

      expect(mockedPfEntryRowsToElimPfEntryRows).toHaveBeenCalledWith(rows);
      expect(mockedExtractElimPfs).toHaveBeenCalledWith([newElimRow]);

      /*
       * Existing elimId1 rows must be removed.
       * Existing rows belonging to elimId2 must remain.
       * The newly edited elimId1 rows must be appended.
       */
      const expectedSaveData: tmntElimPfSaveDataType = {
        elimPfData: [existingElimPfs[2], newElimPf],
        elimIds: [elimId2, elimId1],
        tmntId,
      };

      expect(mockedSaveElimPfs).toHaveBeenCalledTimes(1);
      expect(mockedSaveElimPfs).toHaveBeenCalledWith(expectedSaveData);
      expect(mockDispatch).toHaveBeenCalledWith(saveAction);
      expect(mockUnwrap).toHaveBeenCalledTimes(1);
    });

    it("includes each eliminator id only once in the save data", async () => {
      const secondElimRow: elimPfEntryRow = {
        id: "epf_00000000000000000000000000000005",
        elim_id: elimId1,
        position: 2,
        amount: 75,
        percentage: 0.3,
      };
      const secondElimPf: elimPfType = {
        id: "epf_00000000000000000000000000000005",
        elim_id: elimId1,
        position: 2,
        amount: 75,
      };

      setupSaveMocks(
        [newElimRow, secondElimRow],
        [newElimPf, secondElimPf],
      );

      renderGrid();

      await getGridProps().onSave(rows);

      const saveData = mockedSaveElimPfs.mock.calls[0][0];
      expect(saveData.elimIds).toEqual([elimId2, elimId1]);
    });

    it("removes the old current elim prize funds before adding the edited rows", async () => {
      setupSaveMocks([newElimRow], [newElimPf]);

      renderGrid();

      await getGridProps().onSave(rows);

      const saveData = mockedSaveElimPfs.mock.calls[0][0];

      // Neither of the original elimId1 records should survive.
      expect(saveData.elimPfData).not.toContainEqual(existingElimPfs[0]);
      expect(saveData.elimPfData).not.toContainEqual(existingElimPfs[1]);

      // The elimId2 record should be untouched.
      expect(saveData.elimPfData).toContainEqual(existingElimPfs[2]);

      // The newly edited elimId1 record should be present.
      expect(saveData.elimPfData).toContainEqual(newElimPf);
    });

    it("saves the edited rows when no prize funds exist yet", async () => {
      mockAllElimPfs = [];
      setupSaveMocks([newElimRow], [newElimPf]);

      renderGrid();

      await getGridProps().onSave(rows);

      expect(mockedSaveElimPfs).toHaveBeenCalledWith({
        elimPfData: [newElimPf],
        elimIds: [elimId1],
        tmntId,
      });
      expect(mockUnwrap).toHaveBeenCalledTimes(1);
    });

    it("preserves and saves other eliminator prize funds when the current eliminator has no rows", async () => {
      const saveAction = setupSaveMocks([], []);

      renderGrid();

      await getGridProps().onSave([]);

      expect(mockedSaveElimPfs).toHaveBeenCalledWith({
        elimPfData: [existingElimPfs[2]],
        elimIds: [elimId2],
        tmntId,
      });
      expect(mockDispatch).toHaveBeenCalledWith(saveAction);
      expect(mockUnwrap).toHaveBeenCalledTimes(1);
    });

    it("does not dispatch when there is nothing to save", async () => {
      mockAllElimPfs = [];
      setupSaveMocks([], []);

      renderGrid();

      await getGridProps().onSave(rows);

      expect(mockedSaveElimPfs).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockUnwrap).not.toHaveBeenCalled();
    });

    it("rejects when the Redux save fails so PrizeFundGrid can show the error", async () => {
      setupSaveMocks([newElimRow], [newElimPf]);
      mockUnwrap.mockRejectedValue(new Error("Save failed"));

      renderGrid();

      await expect(getGridProps().onSave(rows)).rejects.toThrow("Save failed");
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("does not call the parent's onSaveComplete or onNavigateAfterSave itself", async () => {
      setupSaveMocks([newElimRow], [newElimPf]);
      const onSaveComplete = jest.fn();
      const onNavigateAfterSave = jest.fn();

      renderGrid({ onSaveComplete, onNavigateAfterSave });

      await getGridProps().onSave(rows);

      // PrizeFundGrid owns these calls after onSave resolves.
      expect(onSaveComplete).not.toHaveBeenCalled();
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
    });

    it("uses the latest Redux prize funds after a rerender", async () => {
      const { rerender } = renderGrid();

      // Redux state changes: a different elim now has prize funds.
      const otherElimPf: elimPfType = {
        id: "epf_00000000000000000000000000000009",
        elim_id: elimId2,
        position: 1,
        amount: 50,
      };
      mockAllElimPfs = [otherElimPf];

      rerender(<ElimPrizeFundGrid {...buildProps()} />);

      setupSaveMocks([newElimRow], [newElimPf]);

      await getGridProps().onSave(rows);

      expect(mockedSaveElimPfs).toHaveBeenCalledWith({
        elimPfData: [otherElimPf, newElimPf],
        elimIds: [elimId2, elimId1],
        tmntId,
      });
    });

    it("uses the latest elimId after a rerender", async () => {
      const { rerender } = renderGrid({ elimId: elimId1 });

      rerender(<ElimPrizeFundGrid {...buildProps({ elimId: elimId2 })} />);

      const elim2Pf: elimPfType = {
        id: "epf_00000000000000000000000000000006",
        elim_id: elimId2,
        position: 1,
        amount: 80,
      };
      const elim2Row: elimPfEntryRow = {
        id: "epf_00000000000000000000000000000006",
        elim_id: elimId2,
        position: 1,
        amount: 80,
        percentage: 0.32,
      };
      setupSaveMocks([elim2Row], [elim2Pf]);      
      // setupSaveMocks(
      //   [{ ...elim2Pf, percentage: 0.32 }],
      //   [elim2Pf],
      // );

      await getGridProps().onSave(rows);

      // elimId2's old row is replaced; both elimId1 rows are preserved.
      expect(mockedSaveElimPfs).toHaveBeenCalledWith({
        elimPfData: [existingElimPfs[0], existingElimPfs[1], elim2Pf],
        elimIds: [elimId1, elimId2],
        tmntId,
      });
    });
  });
});

// import React from "react";
// import { render } from "@testing-library/react";
// import { useDispatch, useSelector } from "react-redux";
// import type {
//   elimPfEntryRow,
//   elimPfType,
//   prizeFundEntryRow,
//   tmntElimPfSaveDataType,
// } from "@/lib/types/types";
// import type { RootState } from "@/redux/store";
// import ElimPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/elim/elimPrizeFundGrid";
// import type { 
//   PrizeFundGridHandle,
// } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
// import { saveElimPfs } from "@/redux/features/elimPfs/elimPfsSlice";
// import { extractElimPfs } from "@/lib/db/elimPfs/dbElimPfs";
// import {
//   pfEntryRowsToElimPfEntryRows,
// } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
// import { elimId1, elimId2, tmntId } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// const mockPrizeFundGridRender = jest.fn();
// const mockGetCurrentRows = jest.fn();

// jest.mock("react-redux", () => ({
//   __esModule: true,
//   useDispatch: jest.fn(),
//   useSelector: jest.fn(),
// }));

// jest.mock("@/redux/features/elimPfs/elimPfsSlice", () => ({
//   __esModule: true,

//   selectElimPfs: jest.fn((state) => state.elimPfs.elimPfs),

//   getElimPfsSaveStatus: jest.fn((state) => state.elimPfs.saveStatus),

//   saveElimPfs: jest.fn(),
// }));

// jest.mock(
//   "@/redux/features/tmntFullData/tmntFullDataSlice",
//   () => ({
//     __esModule: true,

//     selectTmntFullData: jest.fn((state) => state.tmntFullData.tmntFullData),
//   }),
// );

// jest.mock("@/lib/db/elimPfs/dbElimPfs");

// jest.mock(
//   "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes",
// );

// jest.mock(
//   "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid",
//   () => {
//     const ReactModule =
//       jest.requireActual<typeof import("react")>("react");

//     const MockPrizeFundGrid = ReactModule.forwardRef(
//       (props, ref) => {
//         mockPrizeFundGridRender(props);

//         ReactModule.useImperativeHandle(
//           ref,
//           () => ({
//             getCurrentRows: mockGetCurrentRows,
//           }),
//           [],
//         );

//         return null;
//       },
//     );

//     MockPrizeFundGrid.displayName = "MockPrizeFundGrid";

//     return {
//       __esModule: true,
//       default: MockPrizeFundGrid,
//     };
//   },
// );

// const mockedUseDispatch = jest.mocked(useDispatch);
// const mockedUseSelector = jest.mocked(useSelector);

// const mockedPfEntryRowsToElimPfEntryRows = jest.mocked(
//   pfEntryRowsToElimPfEntryRows,
// );

// const mockedExtractElimPfs = jest.mocked(extractElimPfs);
// const mockedSaveElimPfs = jest.mocked(saveElimPfs);

// const mockDispatch = jest.fn();
// const mockUnwrap = jest.fn();

// const rows: prizeFundEntryRow[] = [
//   {
//     id: "epf_00000000000000000000000000000001",
//     parent_id: elimId1,
//     position: 1,
//     amount: 100,
//     percentage: 0.4,
//   },
// ];

// const existingElimPfs: elimPfType[] = [
//   {
//     id: "epf_00000000000000000000000000000001",
//     elim_id: elimId1,
//     position: 1,
//     amount: 90,
//   },
//   {
//     id: "epf_00000000000000000000000000000002",
//     elim_id: elimId1,
//     position: 2,
//     amount: 60,
//   },
//   {
//     id: "epf_00000000000000000000000000000003",
//     elim_id: elimId2,
//     position: 1,
//     amount: 75,
//   },
// ];

// let mockAllElimPfs: elimPfType[];

// describe("ElimPrizeFundGrid", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();

//     mockGetCurrentRows.mockReturnValue([]);

//     mockUnwrap.mockResolvedValue(undefined);

//     mockDispatch.mockReturnValue({
//       unwrap: mockUnwrap,
//     });

//     mockedUseDispatch.mockReturnValue(mockDispatch);

//     /*
//     * ElimPrizeFundGrid uses three Redux selectors:
//     *
//     * 1. getElimPfsSaveStatus
//     * 2. selectElimPfs
//     * 3. selectTmntFullData
//     *
//     * Calling each selector with a mock RootState keeps this
//     * test consistent with the real Redux state shape.
//     */
//     mockedUseSelector.mockImplementation(
//       (selector) => {
//         const state = {
//           elimPfs: {
//             elimPfs: mockAllElimPfs,
//             saveStatus: "idle",
//           },
//           tmntFullData: {
//             tmntFullData: {
//               tmnt: {
//                 id: tmntId,
//               },
//             },
//           },
//         } as unknown as RootState;

//         return selector(state);
//       },
//     );

//     mockAllElimPfs = existingElimPfs;
//   });

//   it("passes the correct props to PrizeFundGrid", () => {
//     const setRows = jest.fn();

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={setRows}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onNavigateAfterSave={jest.fn()}
//         onBack={jest.fn()}
//         onSaveComplete={jest.fn()}
//       />,
//     );

//     expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);

//     const props =
//       mockPrizeFundGridRender.mock.calls[0][0];

//     expect(props.gridId).toBe("elimPfGrid");
//     expect(props.prizeFundType).toBe("elm");
//     expect(props.rows).toBe(rows);
//     expect(props.setRows).toBe(setRows);
//     expect(props.totalPrizeFund).toBe(250);
//     expect(props.saveStatus).toBe("idle");
//   });

//   it("converts rows, replaces the current elim prize funds, and dispatches saveElimPfs", async () => {
//     const elimRows: elimPfEntryRow[] = [
//       {
//         id: "epf_00000000000000000000000000000004",
//         elim_id: elimId1,
//         position: 1,
//         amount: 100,
//         percentage: 0.4,
//       },
//     ];

//     const elimPfsToSave: elimPfType[] = [
//       {
//         id: "epf_00000000000000000000000000000004",
//         elim_id: elimId1,
//         position: 1,
//         amount: 100,
//       },
//     ];

//     const saveAction =
//       jest.fn() as ReturnType<typeof saveElimPfs>;

//     mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(
//       elimRows,
//     );

//     mockedExtractElimPfs.mockReturnValue(
//       elimPfsToSave,
//     );

//     mockedSaveElimPfs.mockReturnValue(
//       saveAction,
//     );

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onNavigateAfterSave={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     const props =
//       mockPrizeFundGridRender.mock.calls[0][0];

//     await props.onSave(rows);

//     expect(
//       mockedPfEntryRowsToElimPfEntryRows,
//     ).toHaveBeenCalledWith(rows);

//     expect(
//       mockedExtractElimPfs,
//     ).toHaveBeenCalledWith(elimRows);

//     /*
//      * Existing elimId1 rows must be removed.
//      * Existing rows belonging to elimId2 must remain.
//      * The newly edited elimId1 rows must be appended.
//      */
//     const expectedElimPfs: elimPfType[] = [
//       existingElimPfs[2],
//       ...elimPfsToSave,
//     ];

//     const elemIdsForSave: string[] = [
//       ...new Set(
//         expectedElimPfs.map(
//           (elimPf) => elimPf.elim_id,
//         ),
//       ),
//     ];
    
//     const expectedSaveData: tmntElimPfSaveDataType = {
//       elimPfData: expectedElimPfs,
//       elimIds: elemIdsForSave,
//       tmntId,
//     };

//     expect(mockedSaveElimPfs).toHaveBeenCalledWith(
//       expectedSaveData,
//     );

//     expect(mockDispatch).toHaveBeenCalledWith(
//       saveAction,
//     );

//     expect(mockUnwrap).toHaveBeenCalledTimes(1);
//   });

//   it("includes each eliminator id only once in the save data", async () => {
//     const elimRows: elimPfEntryRow[] = [
//       {
//         id: "epf_00000000000000000000000000000004",
//         elim_id: elimId1,
//         position: 1,
//         amount: 100,
//         percentage: 0.4,
//       },
//       {
//         id: "epf_00000000000000000000000000000005",
//         elim_id: elimId1,
//         position: 2,
//         amount: 75,
//         percentage: 0.3,
//       },
//     ];

//     const elimPfsToSave: elimPfType[] = [
//       {
//         id: "epf_00000000000000000000000000000004",
//         elim_id: elimId1,
//         position: 1,
//         amount: 100,
//       },
//       {
//         id: "epf_00000000000000000000000000000005",
//         elim_id: elimId1,
//         position: 2,
//         amount: 75,
//       },
//     ];

//     mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(
//       elimRows,
//     );

//     mockedExtractElimPfs.mockReturnValue(
//       elimPfsToSave,
//     );

//     const saveAction =
//       jest.fn() as ReturnType<typeof saveElimPfs>;

//     mockedSaveElimPfs.mockReturnValue(
//       saveAction,
//     );

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     const props =
//       mockPrizeFundGridRender.mock.calls[0][0];

//     await props.onSave(rows);

//     const saveData =
//       mockedSaveElimPfs.mock.calls[0][0];

//     expect(saveData.elimIds).toEqual([
//       elimId2,
//       elimId1,
//     ]);
//   });

//   it("preserves prize funds belonging to other eliminators when saving", async () => {
//     const elimRows: elimPfEntryRow[] = [
//       {
//         id: "epf_00000000000000000000000000000004",
//         elim_id: elimId1,
//         position: 1,
//         amount: 125,
//         percentage: 0.5,
//       },
//     ];

//     const updatedElimPfs: elimPfType[] = [
//       {
//         id: "epf_00000000000000000000000000000004",
//         elim_id: elimId1,
//         position: 1,
//         amount: 125,
//       },
//     ];

//     const saveAction =
//       jest.fn() as ReturnType<typeof saveElimPfs>;

//     mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(
//       elimRows,
//     );

//     mockedExtractElimPfs.mockReturnValue(
//       updatedElimPfs,
//     );

//     mockedSaveElimPfs.mockReturnValue(
//       saveAction,
//     );

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     const props =
//       mockPrizeFundGridRender.mock.calls[0][0];

//     await props.onSave(rows);

//     const expectedOtherElimPf =
//       existingElimPfs.find(
//         (elimPf) =>
//           elimPf.elim_id === elimId2,
//       );

//     expect(expectedOtherElimPf).toBeDefined();

//     expect(mockedSaveElimPfs).toHaveBeenCalledWith(
//       expect.objectContaining({
//         elimPfData: expect.arrayContaining([
//           expectedOtherElimPf,
//         ]),
//       }),
//     );
//   });

//   it("removes the old current elim prize funds before adding the edited rows", async () => {
//     const newElimPf: elimPfType = {
//       id: "epf_00000000000000000000000000000004",
//       elim_id: elimId1,
//       position: 1,
//       amount: 125,
//     };

//     const newElimPfEntryRow: elimPfEntryRow = {
//       id: newElimPf.id,
//       elim_id: newElimPf.elim_id,
//       position: 1,
//       amount: 125,
//       percentage: 0.5,
//     };    

//     mockedPfEntryRowsToElimPfEntryRows.mockReturnValue([
//       newElimPfEntryRow,
//     ]);

//     mockedExtractElimPfs.mockReturnValue([
//       newElimPf,
//     ]);

//     const saveAction = jest.fn() as ReturnType<typeof saveElimPfs>;

//     mockedSaveElimPfs.mockReturnValue(saveAction);

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     const props = mockPrizeFundGridRender.mock.calls[0][0];

//     await props.onSave(rows);

//     const saveData = mockedSaveElimPfs.mock.calls[0][0];

//     /*
//      * Neither of the original elimId1 records should survive.
//      */
//     expect(saveData.elimPfData).not.toContainEqual(existingElimPfs[0]);    
//     expect(saveData.elimPfData).not.toContainEqual(existingElimPfs[1]);

//     /*
//      * The newly edited elimId1 record should be present.
//      */
//     expect(saveData.elimPfData).toContainEqual(newElimPf);
//   });

//   it("includes the tournament id in the save data", async () => {
//     const elimRows: elimPfEntryRow[] = [
//       {
//         id: "epf_00000000000000000000000000000004",
//         elim_id: elimId1,
//         position: 1,
//         amount: 100,
//         percentage: 0.4,
//       },
//     ];

//     const elimPfsToSave: elimPfType[] = [
//       {
//         id: "epf_00000000000000000000000000000004",
//         elim_id: elimId1,
//         position: 1,
//         amount: 100,
//       },
//     ];

//     mockedPfEntryRowsToElimPfEntryRows.mockReturnValue(elimRows);
//     mockedExtractElimPfs.mockReturnValue(elimPfsToSave);

//     const saveAction = jest.fn() as ReturnType<typeof saveElimPfs>;

//     mockedSaveElimPfs.mockReturnValue(saveAction);

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     const props = mockPrizeFundGridRender.mock.calls[0][0];

//     await props.onSave(rows);

//     expect(mockedSaveElimPfs).toHaveBeenCalledWith(
//       expect.objectContaining({
//         tmntId,
//       }),
//     );
//   });

//   it("does not dispatch when there is nothing to save", async () => {
//     mockAllElimPfs = [];

//     mockedPfEntryRowsToElimPfEntryRows.mockReturnValue([]);
//     mockedExtractElimPfs.mockReturnValue([]);

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onNavigateAfterSave={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     const props =
//       mockPrizeFundGridRender.mock.calls[0][0];

//     await props.onSave(rows);

//     expect(mockedSaveElimPfs).not.toHaveBeenCalled();
//     expect(mockDispatch).not.toHaveBeenCalled();
//     expect(mockUnwrap).not.toHaveBeenCalled();
//   });

//   // it("does not dispatch when there is nothing to save", async () => {
//   //   mockedPfEntryRowsToElimPfEntryRows.mockReturnValue([]);
//   //   mockedExtractElimPfs.mockReturnValue([]);

//   //   render(
//   //     <ElimPrizeFundGrid
//   //       rows={rows}
//   //       setRows={jest.fn()}
//   //       elimId={elimId1}
//   //       totalPrizeFund={250}
//   //       gridDataWasChanged={false}
//   //       onGridDataChanged={jest.fn()}
//   //       onGridDataReset={jest.fn()}
//   //       onNavigateAfterSave={jest.fn()}
//   //       onBack={jest.fn()}
//   //     />,
//   //   );

//   //   const props = mockPrizeFundGridRender.mock.calls[0][0];

//   //   await props.onSave(rows);

//   //   expect(mockedSaveElimPfs).not.toHaveBeenCalled();
//   //   expect(mockDispatch).not.toHaveBeenCalled();
//   //   expect(mockUnwrap).not.toHaveBeenCalled();
//   // });

//   it("passes the Redux save status to PrizeFundGrid", () => {
//     mockedUseSelector.mockImplementation(
//       (selector) => {
//         const state = {
//           elimPfs: {
//             elimPfs: mockAllElimPfs,
//             saveStatus: "saving",
//           },
//           tmntFullData: {
//             tmntFullData: {
//               tmnt: {
//                 id: tmntId,
//               },
//             },
//           },
//         } as unknown as RootState;

//         return selector(state);
//       },
//     );

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onNavigateAfterSave={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     const props = mockPrizeFundGridRender.mock.calls[0][0];

//     expect(props.saveStatus).toBe("saving");
//   });

//   it("defaults enableEditing to true", () => {
//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onNavigateAfterSave={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);

//     const props = mockPrizeFundGridRender.mock.calls[0][0];

//     expect(props.enableEditing).toBe(true);
//   });

//   it("passes enableEditing through", () => {
//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         enableEditing={false}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onNavigateAfterSave={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);

//     const props = mockPrizeFundGridRender.mock.calls[0][0];

//     expect(props.enableEditing).toBe(false);
//   });

//   it("forwards its ref to PrizeFundGrid", () => {
//     const currentRows: prizeFundEntryRow[] = [
//       {
//         ...rows[0],
//         amount: 125,
//         percentage: 0.5,
//       },
//     ];

//     mockGetCurrentRows.mockReturnValue(currentRows);

//     const ref = React.createRef<PrizeFundGridHandle>();

//     render(
//       <ElimPrizeFundGrid
//         ref={ref}
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);

//     expect(ref.current).not.toBeNull();

//     expect(
//       ref.current?.getCurrentRows,
//     ).toEqual(
//       expect.any(Function),
//     );

//     expect(
//       ref.current?.getCurrentRows(),
//     ).toEqual(
//       currentRows,
//     );

//     expect(mockGetCurrentRows).toHaveBeenCalledTimes(1);
//   });

//   it("preserves and saves other eliminator prize funds when the current eliminator has no rows", async () => {
//     mockedPfEntryRowsToElimPfEntryRows.mockReturnValue([]);
//     mockedExtractElimPfs.mockReturnValue([]);

//     const saveAction = jest.fn() as ReturnType<typeof saveElimPfs>;

//     mockedSaveElimPfs.mockReturnValue(saveAction);

//     render(
//       <ElimPrizeFundGrid
//         rows={rows}
//         setRows={jest.fn()}
//         elimId={elimId1}
//         totalPrizeFund={250}
//         gridDataWasChanged={false}
//         onGridDataChanged={jest.fn()}
//         onGridDataReset={jest.fn()}
//         onBack={jest.fn()}
//       />,
//     );

//     const props = mockPrizeFundGridRender.mock.calls[0][0];

//     await props.onSave([]);

//     expect(mockedSaveElimPfs).toHaveBeenCalledWith({
//       elimPfData: [existingElimPfs[2]],
//       elimIds: [elimId2],      
//       tmntId,
//     });

//     expect(mockDispatch).toHaveBeenCalledWith(saveAction);
//     expect(mockUnwrap).toHaveBeenCalledTimes(1);
//   });
    
// });
