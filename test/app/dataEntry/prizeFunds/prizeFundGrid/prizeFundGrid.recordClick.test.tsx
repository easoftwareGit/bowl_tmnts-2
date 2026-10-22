import { act } from "@testing-library/react";
import {
  clickEdit,
  getLatestGridProps,
  makeRows,
  mockEditCell,
  mockSelectCell,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

/*
 * recordClick and recordDoubleClick only remember the focused row index.
 * The index is private (a ref), so these tests observe it through the
 * Edit toolbar button, which starts editing on the remembered row.
 *
 * amount is index 2 in the default visible columns.
 */

const AMOUNT_CELL_INDEX = 2;

const expectEditStartedOnRow = (rowIndex: number): void => {
  expect(mockSelectCell).toHaveBeenCalledWith({
    rowIndex,
    cellIndex: AMOUNT_CELL_INDEX,
  });
  expect(mockEditCell).toHaveBeenCalledWith(rowIndex, "amount");
};

type ClickKind = "recordClick" | "recordDoubleClick";

/** setup() plus a single trigger for whichever click kind is under test. */
const setupFor = (kind: ClickKind, options?: Parameters<typeof setup>[0]) => {
  const result = setup(options);
  const triggerClick =
    kind === "recordClick"
      ? result.triggerRecordClick
      : result.triggerRecordDoubleClick;

  return { ...result, triggerClick };
};

describe("PrizeFundGrid record selection", () => {
  beforeEach(standardBeforeEach);

  describe.each<ClickKind>(["recordClick", "recordDoubleClick"])(
    "%s",
    (kind) => {
      it("makes Edit start on the clicked row", async () => {
        const { user, triggerClick } = setupFor(kind);

        triggerClick(2);
        await clickEdit(user);

        expectEditStartedOnRow(2);
      });

      it("uses the most recently clicked row", async () => {
        const { user, triggerClick } = setupFor(kind);

        triggerClick(2);
        triggerClick(1);
        await clickEdit(user);

        expectEditStartedOnRow(1);
      });

      it("only remembers the row; it does not select, edit, or mark data changed", () => {
        const { triggerClick, onGridDataChanged } = setupFor(kind);

        triggerClick(1);

        expect(mockSelectCell).not.toHaveBeenCalled();
        expect(mockEditCell).not.toHaveBeenCalled();
        expect(onGridDataChanged).not.toHaveBeenCalled();
      });

      it("falls back to the first row when the clicked index is past the last row", async () => {
        const { user, triggerClick } = setupFor(kind);

        triggerClick(5); // only 3 rows

        await clickEdit(user);

        expectEditStartedOnRow(0);
      });

      it("falls back to the first row when the clicked index is negative", async () => {
        const { user, triggerClick } = setupFor(kind);

        triggerClick(-1);
        await clickEdit(user);

        expectEditStartedOnRow(0);
      });
    },
  );

  it("starts Edit on the first row when no row has been clicked", async () => {
    const { user } = setup();

    await clickEdit(user);

    expectEditStartedOnRow(0);
  });

  it("starts Edit on the first row when Syncfusion sends no rowIndex", async () => {
    const { user } = setup();

    act(() => {
      getLatestGridProps()?.recordClick?.({});
    });
    await clickEdit(user);

    expectEditStartedOnRow(0);
  });

  it("uses whichever of click or double-click happened last", async () => {
    const { user, triggerRecordClick, triggerRecordDoubleClick } = setup();

    triggerRecordDoubleClick(2);
    triggerRecordClick(1);
    await clickEdit(user);

    expectEditStartedOnRow(1);
  });

  it("keeps the remembered row across rerenders", async () => {
    const { user, triggerRecordClick, rerender } = setup();

    triggerRecordClick(2);
    rerender({ gridDataWasChanged: true });
    await clickEdit(user);

    expectEditStartedOnRow(2);
  });

  it("falls back to the first row when the remembered row no longer exists", async () => {
    const { user, triggerRecordClick, rerender } = setup();

    triggerRecordClick(2);
    rerender({ rows: makeRows().slice(0, 2) }); // row 2 is gone
    await clickEdit(user);

    expectEditStartedOnRow(0);
  });
});
