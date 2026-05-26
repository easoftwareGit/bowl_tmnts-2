import type { playerEntryRow } from "@/app/dataEntry/playersForm/populatePlayerRows";
import type { tmntFullType } from "@/lib/types/types";
import {
  entryFeeColName,
  entryNumBrktsColName,
} from "@/app/dataEntry/playersForm/sfCreatePlayerColumns";
import { validateFinalizeRows } from "@/app/dataEntry/playersForm/finalizeValidation";
import {
  brktId1,
  divId1,
  divId2,
  elimId1,
  potId2,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { mockPlayerRows } from "../../../mocks/tmnts/playerEntries/mockPlayerEntries";
import { cloneDeep } from "lodash";


const cloneRows = (): playerEntryRow[] =>
  cloneDeep(mockPlayerRows.filter((row) => row.feeTotal > 0)) as playerEntryRow[];

const cloneTmntData = (): tmntFullType =>
  cloneDeep(mockTmntFullData) as tmntFullType;

describe("validateFinalizeRows", () => {

  it("returns null when all rows are valid", () => {
    const result = validateFinalizeRows({
      rows: cloneRows(),
      tmntData: cloneTmntData(),
    });

    expect(result).toBeNull();
  });

  it("returns an error when first name is missing", () => {
    const rows = cloneRows();
    rows[0] = { ...rows[0], first_name: "" };

    const result = validateFinalizeRows({
      rows,
      tmntData: cloneTmntData(),
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: "first_name",
      msg: "Can't finalize. Player Davis is missing First Name.",
    });
  });

  it("returns an error when last name is missing", () => {
    const rows = cloneRows();
    rows[0] = { ...rows[0], last_name: "" };

    const result = validateFinalizeRows({
      rows,
      tmntData: cloneTmntData(),
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: "last_name",
      msg: "Can't finalize. Player Amy is missing Last Name.",
    });
  });

  it("returns an error when lane is missing", () => {
    const rows = cloneRows();
    rows[0] = { ...rows[0], lane: null as unknown as number };

    const result = validateFinalizeRows({
      rows,
      tmntData: cloneTmntData(),
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: "lane",
      msg: "Can't finalize. Player Amy Davis is missing Lane.",
    });
  });

  it("returns an error when position is missing", () => {
    const rows = cloneRows();
    rows[0] = { ...rows[0], position: "" };

    const result = validateFinalizeRows({
      rows,
      tmntData: cloneTmntData(),
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: "position",
      msg: "Can't finalize. Player Amy Davis is missing Position.",
    });
  });

  it("returns an error when player is not entered in any divisions", () => {
    const tmntData = cloneTmntData();
    const rows = cloneRows();

    for (const div of tmntData.divs) {
      rows[0][entryFeeColName(div.id)] = 0;
    }

    const result = validateFinalizeRows({
      rows,
      tmntData,
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: entryFeeColName(tmntData.divs[0].id),
      msg: "Can't finalize. Player Amy Davis is not entered in any divisions.",
    });
  });

  it("returns an error when handicap division is entered but average is missing", () => {
    const tmntData = cloneTmntData();
    const rows = cloneRows();

    rows[0] = {
      ...rows[0],
      average: null as unknown as number,
      [entryFeeColName(divId1)]: 0,
      [entryFeeColName(divId2)]: 85,
    };

    const result = validateFinalizeRows({
      rows,
      tmntData,
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: "average",
      msg: "Can't finalize. Player Amy Davis needs an Average because one entered division uses handicap.",
    });
  });

  it("returns an error when player enters a pot without entering the pot division", () => {
    const tmntData = cloneTmntData();
    const rows = cloneRows();

    tmntData.pots = tmntData.pots.map((pot) =>
      pot.id === potId2 ? { ...pot, div_id: divId2 } : pot,
    );

    rows[0] = {
      ...rows[0],
      [entryFeeColName(divId1)]: 85,
      [entryFeeColName(divId2)]: 0,
      [entryFeeColName(potId2)]: 20,
    };

    const result = validateFinalizeRows({
      rows,
      tmntData,
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: entryFeeColName(potId2),
      msg: "Can't finalize. Player Amy Davis must be entered in division HDCP to enter pot HDCP: LG.",
    });
  });

  it("returns an error when player enters a bracket without entering the bracket division", () => {
    const tmntData = cloneTmntData();
    const rows = cloneRows();

    tmntData.brkts = tmntData.brkts.map((brkt) =>
      brkt.id === brktId1 ? { ...brkt, div_id: divId2 } : brkt,
    );

    rows[0] = {
      ...rows[0],
      [entryFeeColName(divId1)]: 85,
      [entryFeeColName(divId2)]: 0,
      [entryNumBrktsColName(brktId1)]: 4,
    };

    const result = validateFinalizeRows({
      rows,
      tmntData,
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: entryNumBrktsColName(brktId1),
      msg: "Can't finalize. Player Amy Davis must be entered in division HDCP to enter bracket HDCP: 1-3.",
    });
  });

  it("returns an error when player enters an eliminator without entering the eliminator division", () => {
    const tmntData = cloneTmntData();
    const rows = cloneRows();

    tmntData.elims = tmntData.elims.map((elim) =>
      elim.id === elimId1 ? { ...elim, div_id: divId2 } : elim,
    );

    rows[0] = {
      ...rows[0],
      [entryFeeColName(divId1)]: 85,
      [entryFeeColName(divId2)]: 0,
      [entryFeeColName(elimId1)]: 5,
    };

    const result = validateFinalizeRows({
      rows,
      tmntData,
    });

    expect(result).toEqual({
      id: rows[0].id,
      column: entryFeeColName(elimId1),
      msg: "Can't finalize. Player Amy Davis must be entered in division HDCP to enter eliminator HDCP: 1-3.",
    });
  });
});