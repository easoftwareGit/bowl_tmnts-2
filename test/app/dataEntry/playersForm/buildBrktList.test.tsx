import { BracketList } from "@/components/brackets/bracketListClass";
import { randomizeAllBrkts } from "@/app/dataEntry/playersForm/buildBrktList";
import type { playerEntryRow } from "@/app/dataEntry/playersForm/populatePlayerRows";
import type { tmntFullType } from "@/lib/types/types";
import {
  brktId1,
  brktId2,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  brkt1NumColName,
  brkt2NumColName,
  mockPlayerRows,
} from "../../../mocks/tmnts/playerEntries/mockPlayerEntries";
import { cloneDeep } from "lodash";

const cloneRows = (): playerEntryRow[] =>
  cloneDeep(mockPlayerRows) as playerEntryRow[];

const cloneTmntData = (): tmntFullType =>
  cloneDeep(mockTmntFullData) as tmntFullType;

describe("randomizeAllBrkts", () => {
  it("returns bracket lists for valid data", () => {
    const rows = cloneRows();
    const tmntData = cloneTmntData();

    const result = randomizeAllBrkts({
      rows,
      tmntData,
    });

    expect(Array.isArray(result)).toBe(true);

    if (Array.isArray(result)) {
      expect(result).toHaveLength(tmntData.brkts.length);

      result.forEach((brktList) => {
        expect(brktList).toBeInstanceOf(BracketList);
      });

      expect(result[0].brktId).toBe(brktId1);
      expect(result[1].brktId).toBe(brktId2);
    }
  });

  it("returns an error when rows is null", () => {
    const result = randomizeAllBrkts({
      rows: null as unknown as playerEntryRow[],
      tmntData: cloneTmntData(),
    });

    expect(result).toEqual({
      id: "",
      column: "",
      msg: "No rows",
    });
  });

  it("returns an error when rows is undefined", () => {
    const result = randomizeAllBrkts({
      rows: undefined as unknown as playerEntryRow[],
      tmntData: cloneTmntData(),
    });

    expect(result).toEqual({
      id: "",
      column: "",
      msg: "No rows",
    });
  });

  it("returns an error when rows is an empty array", () => {
    const result = randomizeAllBrkts({
      rows: [],
      tmntData: cloneTmntData(),
    });

    expect(result).toEqual({
      id: "",
      column: "",
      msg: "No rows",
    });
  });

  it("returns an empty array when there are no brackets", () => {
    const tmntData = cloneTmntData();
    tmntData.brkts = [];

    const result = randomizeAllBrkts({
      rows: cloneRows(),
      tmntData,
    });

    expect(result).toEqual([]);
  });

  it("returns an error when a bracket cannot randomize", () => {
    const rows = cloneRows();
    const tmntData = cloneTmntData();

    // create impossible matchup scenario
    // one player with too many brackets
    rows.forEach((row, index) => {
      row[brkt1NumColName] = index === 0 ? 100 : 0;
      row[brkt2NumColName] = 0;
    });

    const result = randomizeAllBrkts({
      rows,
      tmntData,
    });

    expect(Array.isArray(result)).toBe(false);

    expect(result).toEqual({
      id: brktId1,
      column: "",
      msg: "Error creating bracket list Scratch: 1-3: Not enough players for brackets",
    });
  });

  it("returns an error when randomize sets an error code", () => {
    const rows = cloneRows();
    const tmntData = cloneTmntData();

    const randomizeSpy = jest
      .spyOn(BracketList.prototype, "randomize")
      .mockImplementation((): void => undefined);

    const errorCodeSpy = jest
      .spyOn(BracketList.prototype, "errorCode", "get")
      .mockReturnValue(999);

    const errorMessageSpy = jest
      .spyOn(BracketList.prototype, "errorMessage", "get")
      .mockReturnValue("mock randomize failure");

    const result = randomizeAllBrkts({
      rows,
      tmntData,
    });

    expect(result).toEqual({
      id: brktId1,
      column: "",
      msg: "Error creating bracket list Scratch: 1-3: mock randomize failure",
    });

    randomizeSpy.mockRestore();
    errorCodeSpy.mockRestore();
    errorMessageSpy.mockRestore();
  });

  it("calls randomize with an empty array", () => {
    const rows = cloneRows();
    const tmntData = cloneTmntData();

    const randomizeSpy = jest.spyOn(
      BracketList.prototype,
      "randomize"
    );

    randomizeAllBrkts({
      rows,
      tmntData,
    });

    expect(randomizeSpy).toHaveBeenCalled();

    randomizeSpy.mock.calls.forEach((callArgs) => {
      expect(callArgs[0]).toEqual([]);
    });

    randomizeSpy.mockRestore();
  });
});