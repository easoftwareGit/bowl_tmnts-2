import React, { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import type { prizeFundEntryRow } from "@/lib/types/types";
import PotPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/pot/potPrizeFundGrid";
import type { PrizeFundGridHandle } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import {
  getPotPfsSaveStatus,
  savePotPfs,
  selectPotPfs,
} from "@/redux/features/potPfs/potPfsSlice";
import { selectTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { extractPotPfs } from "@/lib/db/potPfs/dbPotPfs";
import { pfEntryRowsToPotPfEntryRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";

/*********
 * Mocks *
 *********/

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/potPfs/potPfsSlice", () => ({
  getPotPfsSaveStatus: jest.fn(),
  selectPotPfs: jest.fn(),
  savePotPfs: jest.fn(),
}));

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  selectTmntFullData: jest.fn(),
}));

jest.mock("@/lib/db/potPfs/dbPotPfs", () => ({
  extractPotPfs: jest.fn(),
}));

jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes", () => ({
  pfEntryRowsToPotPfEntryRows: jest.fn(),
}));

const mockPrizeFundGridProps = jest.fn();
const mockGetCurrentRows = jest.fn();

/**
 * Replace the generic PrizeFundGrid with a lightweight stand-in that:
 *  - records the props it receives
 *  - exposes getCurrentRows() through useImperativeHandle, so the test
 *    can confirm the wrapper forwards the page's ref.
 */
jest.mock("@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid", () => {
  const ReactActual = jest.requireActual<typeof import("react")>("react");
  const MockPrizeFundGrid = ReactActual.forwardRef(
    (props: Record<string, unknown>, ref) => {
      mockPrizeFundGridProps(props);
      ReactActual.useImperativeHandle(ref, () => ({
        getCurrentRows: mockGetCurrentRows,
      }));
      return <div data-testid="prize-fund-grid" />;
    },
  );
  MockPrizeFundGrid.displayName = "MockPrizeFundGrid";
  return { __esModule: true, default: MockPrizeFundGrid };
});

/**************
 * Test Types *
 **************/

interface CapturedGridProps {
  gridId: string;
  prizeFundType: string;
  rows: prizeFundEntryRow[];
  setRows: jest.Mock;
  totalPrizeFund: number;
  enableEditing: boolean;
  gridDataWasChanged: boolean;
  saveStatus: string;
  onGridDataChanged: jest.Mock;
  onGridDataReset: jest.Mock;
  onSave: (rows: prizeFundEntryRow[]) => Promise<void>;
  onNavigateAfterSave?: jest.Mock;
  onBack: jest.Mock;
  onSaveComplete?: jest.Mock;
  onCancel?: jest.Mock;
}

const getLatestGridProps = (): CapturedGridProps => {
  const calls = mockPrizeFundGridProps.mock.calls;
  return calls[calls.length - 1][0] as CapturedGridProps;
};

/*************
 * Test Data *
 *************/

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const potId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
const otherPotId = "pot_0b5d5a1d1e7d4f6f8a3c2b1a0e9d8c7b";

const makeRow = (
  id: string,
  place: number,
  amount: number,
  percent: number,
): prizeFundEntryRow =>
  ({ id, place, amount, percent }) as unknown as prizeFundEntryRow;

const rows: prizeFundEntryRow[] = [
  makeRow("ppf_1", 1, 60, 0.6),
  makeRow("ppf_2", 2, 40, 0.4),
];

const thisPotExistingPfs = [
  { id: "ppf_old1", pot_id: potId, place: 1, amount: 50 },
  { id: "ppf_old2", pot_id: potId, place: 2, amount: 50 },
];

const otherPotPfs = [
  { id: "ppf_other1", pot_id: otherPotId, place: 1, amount: 30 },
];

const potPfEntryRows = [
  { id: "ppf_1", pot_id: potId, place: 1, amount: 60, percent: 0.6 },
  { id: "ppf_2", pot_id: potId, place: 2, amount: 40, percent: 0.4 },
];

const extractedPotPfs = [
  { id: "ppf_1", pot_id: potId, place: 1, amount: 60 },
  { id: "ppf_2", pot_id: potId, place: 2, amount: 40 },
];

/*******************
 * Mutable State   *
 *******************/

let mockState: {
  saveStatus: string;
  potPfs: unknown[];
  tmntData: { tmnt: { id: string } };
};

const mockUnwrap = jest.fn();
const mockDispatch = jest.fn(() => ({ unwrap: mockUnwrap }));

/***********
 * Helpers *
 ***********/

const defaultProps = () => ({
  rows,
  setRows: jest.fn(),
  potId,
  totalPrizeFund: 100,
  gridDataWasChanged: false,
  onGridDataChanged: jest.fn(),
  onGridDataReset: jest.fn(),
  onNavigateAfterSave: jest.fn(),
  onBack: jest.fn(),
  onSaveComplete: jest.fn(),
  onCancel: jest.fn(),
});

/*********
 * Tests *
 *********/

describe("PotPrizeFundGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      saveStatus: "idle",
      potPfs: [...thisPotExistingPfs, ...otherPotPfs],
      tmntData: { tmnt: { id: tmntId } },
    };

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockImplementation(
      (selector: unknown) => {
        if (selector === getPotPfsSaveStatus) return mockState.saveStatus;
        if (selector === selectPotPfs) return mockState.potPfs;
        if (selector === selectTmntFullData) return mockState.tmntData;
        return undefined;
      },
    );

    (savePotPfs as unknown as jest.Mock).mockImplementation((data) => ({
      type: "potPfs/savePotPfs",
      payload: data,
    }));
    mockUnwrap.mockResolvedValue(undefined);

    (pfEntryRowsToPotPfEntryRows as jest.Mock).mockReturnValue(potPfEntryRows);
    (extractPotPfs as jest.Mock).mockReturnValue(extractedPotPfs);
  });

  describe("rendering and props", () => {
    it("renders the generic PrizeFundGrid", () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      expect(screen.getByTestId("prize-fund-grid")).toBeInTheDocument();
    });

    it("passes the pot-specific gridId and prizeFundType", () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      const gridProps = getLatestGridProps();
      expect(gridProps.gridId).toBe("potPfGrid");
      expect(gridProps.prizeFundType).toBe("pot");
    });

    it("passes the page's rows, totals and handlers through unchanged", () => {
      const props = defaultProps();
      render(<PotPrizeFundGrid {...props} gridDataWasChanged={true} />);
      const gridProps = getLatestGridProps();

      expect(gridProps.rows).toBe(props.rows);
      expect(gridProps.setRows).toBe(props.setRows);
      expect(gridProps.totalPrizeFund).toBe(100);
      expect(gridProps.gridDataWasChanged).toBe(true);
      expect(gridProps.onGridDataChanged).toBe(props.onGridDataChanged);
      expect(gridProps.onGridDataReset).toBe(props.onGridDataReset);
      expect(gridProps.onNavigateAfterSave).toBe(props.onNavigateAfterSave);
      expect(gridProps.onBack).toBe(props.onBack);
      expect(gridProps.onSaveComplete).toBe(props.onSaveComplete);
      expect(gridProps.onCancel).toBe(props.onCancel);
    });

    it("does not pass potId to PrizeFundGrid", () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      expect(getLatestGridProps()).not.toHaveProperty("potId");
    });

    it("defaults enableEditing to true", () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      expect(getLatestGridProps().enableEditing).toBe(true);
    });

    it("passes enableEditing=false when supplied", () => {
      render(<PotPrizeFundGrid {...defaultProps()} enableEditing={false} />);
      expect(getLatestGridProps().enableEditing).toBe(false);
    });

    it("leaves optional callbacks undefined when not supplied", () => {
      const {
        onNavigateAfterSave: _nav,
        onSaveComplete: _complete,
        onCancel: _cancel,
        ...requiredProps
      } = defaultProps();
      render(<PotPrizeFundGrid {...requiredProps} />);
      const gridProps = getLatestGridProps();
      expect(gridProps.onNavigateAfterSave).toBeUndefined();
      expect(gridProps.onSaveComplete).toBeUndefined();
      expect(gridProps.onCancel).toBeUndefined();
    });

    it("passes saveStatus from the potPfs slice", () => {
      mockState.saveStatus = "saving";
      render(<PotPrizeFundGrid {...defaultProps()} />);
      expect(getLatestGridProps().saveStatus).toBe("saving");
    });

    it("passes an onSave function", () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      expect(typeof getLatestGridProps().onSave).toBe("function");
    });

    it("has displayName PotPrizeFundGrid", () => {
      expect(PotPrizeFundGrid.displayName).toBe("PotPrizeFundGrid");
    });
  });

  describe("ref forwarding", () => {
    it("forwards the page's ref to PrizeFundGrid", () => {
      const currentRows = [makeRow("ppf_1", 1, 70, 0.7)];
      mockGetCurrentRows.mockReturnValue(currentRows);

      const ref = createRef<PrizeFundGridHandle>();
      render(<PotPrizeFundGrid {...defaultProps()} ref={ref} />);

      expect(ref.current).not.toBeNull();
      expect(ref.current?.getCurrentRows()).toBe(currentRows);
      expect(mockGetCurrentRows).toHaveBeenCalledTimes(1);
    });
  });

  describe("onSave (handleSave)", () => {
    it("converts the grid rows to pot entry rows", async () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });
      expect(pfEntryRowsToPotPfEntryRows).toHaveBeenCalledWith(rows);
    });

    it("extracts pot prize funds from the converted rows", async () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });
      expect(extractPotPfs).toHaveBeenCalledWith(potPfEntryRows);
    });

    it("replaces this pot's existing pfs and keeps other pots' pfs", async () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });

      expect(savePotPfs).toHaveBeenCalledTimes(1);
      expect(savePotPfs).toHaveBeenCalledWith({
        potPfData: [...otherPotPfs, ...extractedPotPfs],
        potIds: [otherPotId, potId],
        tmntId,
      });
    });

    it("does not include this pot's old pfs in the save data", async () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });

      const saved = (savePotPfs as unknown as jest.Mock).mock.calls[0][0];
      const savedIds = saved.potPfData.map((pf: { id: string }) => pf.id);
      expect(savedIds).not.toContain("ppf_old1");
      expect(savedIds).not.toContain("ppf_old2");
    });

    it("lists each pot id only once", async () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });

      const saved = (savePotPfs as unknown as jest.Mock).mock.calls[0][0];
      expect(saved.potIds).toHaveLength(new Set(saved.potIds).size);
    });

    it("saves only this pot when no other pots have pfs", async () => {
      mockState.potPfs = [...thisPotExistingPfs];
      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });

      expect(savePotPfs).toHaveBeenCalledWith({
        potPfData: extractedPotPfs,
        potIds: [potId],
        tmntId,
      });
    });

    it("saves when the store has no existing pot pfs", async () => {
      mockState.potPfs = [];
      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });

      expect(savePotPfs).toHaveBeenCalledWith({
        potPfData: extractedPotPfs,
        potIds: [potId],
        tmntId,
      });
    });

    it("dispatches the save action and unwraps the result", async () => {
      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "potPfs/savePotPfs",
        payload: expect.objectContaining({ tmntId }),
      });
      expect(mockUnwrap).toHaveBeenCalledTimes(1);
    });

    it("does not dispatch when there is nothing to save", async () => {
      mockState.potPfs = [...thisPotExistingPfs];
      (extractPotPfs as jest.Mock).mockReturnValue([]);

      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await expect(getLatestGridProps().onSave(rows)).resolves.toBeUndefined();
      });

      expect(savePotPfs).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("still saves other pots' pfs when this pot has no rows", async () => {
      (extractPotPfs as jest.Mock).mockReturnValue([]);

      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await getLatestGridProps().onSave([]);
      });

      expect(savePotPfs).toHaveBeenCalledWith({
        potPfData: otherPotPfs,
        potIds: [otherPotId],
        tmntId,
      });
    });

    it("rejects when the save fails so PrizeFundGrid can show the error", async () => {
      mockUnwrap.mockRejectedValue(new Error("Save failed"));

      render(<PotPrizeFundGrid {...defaultProps()} />);
      await act(async () => {
        await expect(getLatestGridProps().onSave(rows)).rejects.toThrow(
          "Save failed",
        );
      });
    });

    it("uses the latest store data after a rerender", async () => {
      const props = defaultProps();
      const { rerender } = render(<PotPrizeFundGrid {...props} />);

      const newOtherPf = { id: "ppf_other2", pot_id: "pot_new", place: 1, amount: 25 };
      mockState.potPfs = [newOtherPf];
      mockState.tmntData = { tmnt: { id: "tmt_other" } };
      rerender(<PotPrizeFundGrid {...props} />);

      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });

      expect(savePotPfs).toHaveBeenCalledWith({
        potPfData: [newOtherPf, ...extractedPotPfs],
        potIds: ["pot_new", potId],
        tmntId: "tmt_other",
      });
    });

    it("uses the latest potId after a rerender", async () => {
      const props = defaultProps();
      const { rerender } = render(<PotPrizeFundGrid {...props} />);

      // Switch to the other pot: its old pfs should now be replaced,
      // and the first pot's pfs kept.
      rerender(<PotPrizeFundGrid {...props} potId={otherPotId} />);

      await act(async () => {
        await getLatestGridProps().onSave(rows);
      });

      const saved = (savePotPfs as unknown as jest.Mock).mock.calls[0][0];
      const savedIds = saved.potPfData.map((pf: { id: string }) => pf.id);
      expect(savedIds).toContain("ppf_old1");
      expect(savedIds).toContain("ppf_old2");
      expect(savedIds).not.toContain("ppf_other1");
    });
  });
});
