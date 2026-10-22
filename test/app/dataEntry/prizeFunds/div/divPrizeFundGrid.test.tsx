import React from "react";
import { render } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type {
  divPfEntryRow,
  divPfType,
  prizeFundEntryRow,
} from "@/lib/types/types";
import DivPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/div/divPrizeFundGrid";
import type { PrizeFundGridHandle } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import { saveDivPfs } from "@/redux/features/divPfs/divPfsSlice";
import { extractDivPfs } from "@/lib/db/divPfs/dbDivPfs";
import { pfEntryRowsToDivPfEntryRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";

const mockPrizeFundGridRender = jest.fn();
const mockGetCurrentRows = jest.fn();

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
  __esModule: true,
  selectDivPfs: jest.fn((state) => state.divPfs.divPfs),
  getDivPfsSaveStatus: jest.fn((state) => state.divPfs.saveStatus),
  saveDivPfs: jest.fn(),
}));

// Mocked so the test does not depend on the real slice's state shape
// or pull in the slice's own dependencies.
jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  selectTmntFullData: jest.fn((state) => state.tmntFullData.tmntFullData),
}));

jest.mock("@/lib/db/divPfs/dbDivPfs");

jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes");

jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid", () => {
  const ReactModule = jest.requireActual<typeof import("react")>("react");

  const MockPrizeFundGrid = ReactModule.forwardRef((props, ref) => {
    mockPrizeFundGridRender(props);

    ReactModule.useImperativeHandle(
      ref,
      () => ({
        getCurrentRows: mockGetCurrentRows,
      }),
      [],
    );

    return null;
  });

  MockPrizeFundGrid.displayName = "MockPrizeFundGrid";

  return {
    __esModule: true,
    default: MockPrizeFundGrid,
  };
});

const mockedUseDispatch = jest.mocked(useDispatch);
const mockedUseSelector = jest.mocked(useSelector);
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

const newDivRows: divPfEntryRow[] = [
  {
    id: "dpf_00000000000000000000000000000003",
    div_id: divId,
    position: 1,
    amount: 100,
    percentage: 0.4,
  },
  {
    id: "dpf_00000000000000000000000000000004",
    div_id: divId,
    position: 2,
    amount: 75,
    percentage: 0.3,
  },
];

const newDivPfs: divPfType[] = [
  {
    id: "dpf_00000000000000000000000000000003",
    div_id: divId,
    position: 1,
    amount: 100,
  },
  {
    id: "dpf_00000000000000000000000000000004",
    div_id: divId,
    position: 2,
    amount: 75,
  },
];

const saveAction = {
  type: "divPfs/saveDivPfs",
} as unknown as ReturnType<typeof saveDivPfs>;

type DivPrizeFundGridProps = React.ComponentProps<typeof DivPrizeFundGrid>;

const renderGrid = (overrides: Partial<DivPrizeFundGridProps> = {}) =>
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
      {...overrides}
    />,
  );

/** Props passed to PrizeFundGrid on the most recent render. */
const lastGridProps = () =>
  mockPrizeFundGridRender.mock.calls[
    mockPrizeFundGridRender.mock.calls.length - 1
  ][0];

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
    mockDispatch.mockReturnValue({ unwrap: mockUnwrap });
    mockedUseDispatch.mockReturnValue(mockDispatch);

    mockedPfEntryRowsToDivPfEntryRows.mockReturnValue(newDivRows);
    mockedExtractDivPfs.mockReturnValue(newDivPfs);
    mockedSaveDivPfs.mockReturnValue(saveAction);

    mockedUseSelector.mockImplementation((selector) =>
      selector({
        divPfs: {
          divPfs: mockAllDivPfs,
          saveStatus: mockSaveStatus,
        },
        tmntFullData: {
          tmntFullData: {
            tmnt: { id: mockTmntId },
          },
        },
      } as unknown as RootState),
    );
  });

  describe("props passed to PrizeFundGrid", () => {
    it("passes the correct props to PrizeFundGrid", () => {
      const setRows = jest.fn();
      const onGridDataChanged = jest.fn();
      const onGridDataReset = jest.fn();
      const onNavigateAfterSave = jest.fn();
      const onBack = jest.fn();
      const onSaveComplete = jest.fn();
      const onCancel = jest.fn();

      renderGrid({
        setRows,
        onGridDataChanged,
        onGridDataReset,
        onNavigateAfterSave,
        onBack,
        onSaveComplete,
        onCancel,
      });

      expect(mockPrizeFundGridRender).toHaveBeenCalledTimes(1);

      const props = lastGridProps();

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
      expect(props.onCancel).toBe(onCancel);
      expect(props.onSave).toEqual(expect.any(Function));
    });

    it("passes undefined for optional callbacks that are not supplied", () => {
      renderGrid();

      const props = lastGridProps();

      expect(props.onNavigateAfterSave).toBeUndefined();
      expect(props.onSaveComplete).toBeUndefined();
      expect(props.onCancel).toBeUndefined();
    });

    it("passes gridDataWasChanged through", () => {
      renderGrid({ gridDataWasChanged: true });

      expect(lastGridProps().gridDataWasChanged).toBe(true);
    });

    it("passes enableEditing=false through", () => {
      renderGrid({ enableEditing: false });

      expect(lastGridProps().enableEditing).toBe(false);
    });

    it("passes the Redux save status to PrizeFundGrid", () => {
      mockSaveStatus = "saving";

      renderGrid();

      expect(lastGridProps().saveStatus).toBe("saving");
    });
  });

  describe("ref forwarding", () => {
    it("forwards its ref to PrizeFundGrid", () => {
      const currentRows: prizeFundEntryRow[] = [
        { ...rows[0], amount: 125, percentage: 0.5 },
      ];
      mockGetCurrentRows.mockReturnValue(currentRows);

      const ref = React.createRef<PrizeFundGridHandle>();

      renderGrid({ ref });

      expect(ref.current).not.toBeNull();
      expect(ref.current?.getCurrentRows).toEqual(expect.any(Function));
      expect(ref.current?.getCurrentRows()).toEqual(currentRows);
      expect(mockGetCurrentRows).toHaveBeenCalledTimes(1);
    });
  });

  describe("onSave", () => {
    it("converts the grid rows and extracts division prize funds", async () => {
      renderGrid();

      await lastGridProps().onSave(rows);

      expect(mockedPfEntryRowsToDivPfEntryRows).toHaveBeenCalledWith(rows);
      expect(mockedExtractDivPfs).toHaveBeenCalledWith(newDivRows);
    });

    it("replaces the current division's rows, keeps other divisions, and dispatches saveDivPfs", async () => {
      renderGrid();

      await lastGridProps().onSave(rows);

      expect(mockedSaveDivPfs).toHaveBeenCalledTimes(1);
      expect(mockedSaveDivPfs).toHaveBeenCalledWith({
        divPfData: [existingDivPfs[1], ...newDivPfs],
        divIds: [otherDivId, divId],
        tmntId,
      });

      const savePayload = mockedSaveDivPfs.mock.calls[0][0];
      expect(
        savePayload.divPfData.some(
          (divPf: divPfType) => divPf.id === existingDivPfs[0].id,
        ),
      ).toBe(false);

      expect(mockDispatch).toHaveBeenCalledWith(saveAction);
      expect(mockUnwrap).toHaveBeenCalledTimes(1);
    });

    it("lists each division id only once", async () => {
      renderGrid();

      await lastGridProps().onSave(rows);

      // newDivPfs has two rows for divId; divIds must not repeat it.
      expect(mockedSaveDivPfs.mock.calls[0][0].divIds).toEqual([
        otherDivId,
        divId,
      ]);
    });

    it("uses the tournament id from tmntFullData", async () => {
      mockTmntId = "tmt_00000000000000000000000000000099";

      renderGrid();

      await lastGridProps().onSave(rows);

      expect(mockedSaveDivPfs.mock.calls[0][0].tmntId).toBe(
        "tmt_00000000000000000000000000000099",
      );
    });

    it("saves the new rows when no division prize funds exist yet", async () => {
      mockAllDivPfs = [];

      renderGrid();

      await lastGridProps().onSave(rows);

      expect(mockedSaveDivPfs).toHaveBeenCalledWith({
        divPfData: newDivPfs,
        divIds: [divId],
        tmntId,
      });
    });

    it("does not dispatch when there is nothing to save", async () => {
      mockAllDivPfs = [];
      mockedPfEntryRowsToDivPfEntryRows.mockReturnValue([]);
      mockedExtractDivPfs.mockReturnValue([]);

      renderGrid();

      await expect(lastGridProps().onSave(rows)).resolves.toBeUndefined();

      expect(mockedPfEntryRowsToDivPfEntryRows).toHaveBeenCalledWith(rows);
      expect(mockedExtractDivPfs).toHaveBeenCalledWith([]);
      expect(mockedSaveDivPfs).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockUnwrap).not.toHaveBeenCalled();
    });

    it("rejects when the save fails so PrizeFundGrid can handle the error", async () => {
      const error = new Error("save failed");
      mockUnwrap.mockRejectedValue(error);

      renderGrid();

      await expect(lastGridProps().onSave(rows)).rejects.toThrow(
        "save failed",
      );
      expect(mockDispatch).toHaveBeenCalledWith(saveAction);
    });

    it("uses the latest Redux division prize funds after a re-render", async () => {
      const { rerender } = renderGrid();

      // Another division's data changes in the store.
      const updatedOtherDivPf: divPfType = {
        ...existingDivPfs[1],
        amount: 999,
      };
      mockAllDivPfs = [existingDivPfs[0], updatedOtherDivPf];

      rerender(
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

      await lastGridProps().onSave(rows);

      expect(mockedSaveDivPfs.mock.calls[0][0].divPfData).toEqual([
        updatedOtherDivPf,
        ...newDivPfs,
      ]);
    });
  });
});
