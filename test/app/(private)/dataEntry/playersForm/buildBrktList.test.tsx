// test/app/(private)/dataEntry/playersForm/buildBrktList.test.tsx
// tests for src/app/(private)/dataEntry/playersForm/buildBrktList.ts
import { BracketList } from "@/components/brackets/bracketListClass";
import { createByePlayer } from "@/components/brackets/byePlayer";
import { randomizeAllBrkts } from "@/app/(private)/dataEntry/playersForm/buildBrktList";
import type { playerEntryRow } from "@/app/(private)/dataEntry/playersForm/populatePlayerRows";
import type { tmntFullType } from "@/lib/types/types";
import {
  brktId1,
  brktId2,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  brkt1NumColName,
  brkt2NumColName,
  mockPlayerRows,
} from "../../../../mocks/tmnts/playerEntries/mockPlayerEntries";
import { defaultBrktGames } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

// wrap the real createByePlayer so its calls can be checked
jest.mock("@/components/brackets/byePlayer", () => {
  const actual = jest.requireActual("@/components/brackets/byePlayer");
  return {
    ...actual,
    createByePlayer: jest.fn(actual.createByePlayer),
  };
});

const cloneRows = (): playerEntryRow[] =>
  cloneDeep(mockPlayerRows) as playerEntryRow[];

const cloneTmntData = (): tmntFullType =>
  cloneDeep(mockTmntFullData) as tmntFullType;

const noRowsError = {
  id: "",
  column: "",
  msg: "No rows",
};

describe("randomizeAllBrkts", () => {
  afterEach(() => {
    // restores spies even if an assertion fails part way through a test
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("valid data", () => {
    it("returns one BracketList per bracket, in bracket order", () => {
      const tmntData = cloneTmntData();

      const result = randomizeAllBrkts({ rows: cloneRows(), tmntData });

      expect(Array.isArray(result)).toBe(true);
      if (!Array.isArray(result)) return;

      expect(result).toHaveLength(tmntData.brkts.length);
      result.forEach((brktList) => {
        expect(brktList).toBeInstanceOf(BracketList);
        expect(brktList.errorCode).toBe(BracketList.noError);
      });
      expect(result[0].brktId).toBe(brktId1);
      expect(result[1].brktId).toBe(brktId2);
    });

    it("creates the bye player once, using the first squad id", () => {
      const tmntData = cloneTmntData();

      randomizeAllBrkts({ rows: cloneRows(), tmntData });

      expect(createByePlayer).toHaveBeenCalledTimes(1);
      expect(createByePlayer).toHaveBeenCalledWith(tmntData.squads[0].id);
    });

    it("calls calcTotalBrkts with the rows for every bracket", () => {
      const rows = cloneRows();
      const tmntData = cloneTmntData();
      const calcSpy = jest.spyOn(BracketList.prototype, "calcTotalBrkts");

      randomizeAllBrkts({ rows, tmntData });

      expect(calcSpy).toHaveBeenCalledTimes(tmntData.brkts.length);
      calcSpy.mock.calls.forEach((callArgs) => {
        expect(callArgs[0]).toBe(rows);
      });
    });

    it("calls randomize once per bracket with an empty array", () => {
      const tmntData = cloneTmntData();
      const randomizeSpy = jest.spyOn(BracketList.prototype, "randomize");

      randomizeAllBrkts({ rows: cloneRows(), tmntData });

      expect(randomizeSpy).toHaveBeenCalledTimes(tmntData.brkts.length);
      randomizeSpy.mock.calls.forEach((callArgs) => {
        expect(callArgs[0]).toEqual([]);
      });
    });

    it("does not change the rows or tmntData passed in", () => {
      const rows = cloneRows();
      const tmntData = cloneTmntData();
      const rowsBefore = cloneDeep(rows);
      const tmntBefore = cloneDeep(tmntData);

      randomizeAllBrkts({ rows, tmntData });

      expect(rows).toEqual(rowsBefore);
      expect(tmntData).toEqual(tmntBefore);
    });
  });

  describe("invalid rows", () => {
    it.each([
      ["null", null],
      ["undefined", undefined],
      ["an empty array", []],
      ["not an array", { not: "an array" }],
    ])("returns a 'No rows' error when rows is %s", (_label, rows) => {
      const result = randomizeAllBrkts({
        rows: rows as unknown as playerEntryRow[],
        tmntData: cloneTmntData(),
      });

      expect(result).toEqual(noRowsError);
    });

    it("checks rows before brackets (no rows and no brackets is still an error)", () => {
      const tmntData = cloneTmntData();
      tmntData.brkts = [];

      const result = randomizeAllBrkts({ rows: [], tmntData });

      expect(result).toEqual(noRowsError);
    });
  });

  describe("no brackets", () => {
    it.each([
      ["an empty array", []],
      ["null", null],
      ["undefined", undefined],
    ])("returns an empty array when brkts is %s", (_label, brkts) => {
      const tmntData = cloneTmntData();
      tmntData.brkts = brkts as unknown as tmntFullType["brkts"];

      const result = randomizeAllBrkts({ rows: cloneRows(), tmntData });

      expect(result).toEqual([]);
    });

    it("does not create a bye player when there are no brackets", () => {
      const tmntData = cloneTmntData();
      tmntData.brkts = [];

      randomizeAllBrkts({ rows: cloneRows(), tmntData });

      expect(createByePlayer).not.toHaveBeenCalled();
    });
  });

  describe("no squads", () => {
    it.each([
      ["an empty array", []],
      ["null", null],
      ["undefined", undefined],
    ])("returns a 'No squads' error when squads is %s", (_label, squads) => {
      const tmntData = cloneTmntData();
      tmntData.squads = squads as unknown as tmntFullType["squads"];

      const result = randomizeAllBrkts({ rows: cloneRows(), tmntData });

      expect(result).toEqual({
        id: "",
        column: "",
        msg: "No squads",
      });
      expect(createByePlayer).not.toHaveBeenCalled();
    });

    it("returns an empty array (not a squad error) when there are no brackets and no squads", () => {
      const tmntData = cloneTmntData();
      tmntData.brkts = [];
      tmntData.squads = [];

      const result = randomizeAllBrkts({ rows: cloneRows(), tmntData });

      expect(result).toEqual([]);
    });
  });

  describe("game numbers", () => {
    it("gives each bracket defaultBrktGames consecutive game numbers from its start game", () => {
      const tmntData = cloneTmntData();

      const result = randomizeAllBrkts({ rows: cloneRows(), tmntData });

      expect(Array.isArray(result)).toBe(true);
      if (!Array.isArray(result)) return;

      result.forEach((brktList, b) => {
        const start = tmntData.brkts[b].start;
        expect(brktList.squadGameNums).toEqual(
          Array.from({ length: defaultBrktGames }, (_, i) => start + i)
        );
      });
    });
  });

  describe("bracket errors", () => {
    it("returns an error when a bracket cannot randomize (not enough players)", () => {
      const rows = cloneRows();
      const tmntData = cloneTmntData();

      // only one player entered in brackets, so no matchups are possible
      rows.forEach((row, index) => {
        row[brkt1NumColName] = index === 0 ? 100 : 0;
        row[brkt2NumColName] = 0;
      });

      const result = randomizeAllBrkts({ rows, tmntData });

      expect(Array.isArray(result)).toBe(false);
      expect(result).toEqual({
        id: brktId1,
        column: "",
        msg: "Error creating bracket list Scratch: 1-3: Not enough players for brackets",
      });
    });

    it("does not call randomize when canRandomize is false", () => {
      jest.spyOn(BracketList.prototype, "canRandomize").mockReturnValue(false);
      const randomizeSpy = jest.spyOn(BracketList.prototype, "randomize");

      randomizeAllBrkts({ rows: cloneRows(), tmntData: cloneTmntData() });

      expect(randomizeSpy).not.toHaveBeenCalled();
    });

    it("returns an error when randomize sets an error code", () => {
      jest
        .spyOn(BracketList.prototype, "randomize")
        .mockImplementation((): void => undefined);
      jest
        .spyOn(BracketList.prototype, "errorCode", "get")
        .mockReturnValue(999);
      jest
        .spyOn(BracketList.prototype, "errorMessage", "get")
        .mockReturnValue("mock randomize failure");

      const result = randomizeAllBrkts({
        rows: cloneRows(),
        tmntData: cloneTmntData(),
      });

      expect(result).toEqual({
        id: brktId1,
        column: "",
        msg: "Error creating bracket list Scratch: 1-3: mock randomize failure",
      });
    });

    it("stops at the first bracket that fails", () => {
      jest
        .spyOn(BracketList.prototype, "errorCode", "get")
        .mockReturnValue(999);
      const randomizeSpy = jest
        .spyOn(BracketList.prototype, "randomize")
        .mockImplementation((): void => undefined);

      randomizeAllBrkts({ rows: cloneRows(), tmntData: cloneTmntData() });

      // first bracket fails, second is never randomized
      expect(randomizeSpy).toHaveBeenCalledTimes(1);
    });

    it("returns the second bracket's error (not a partial list) when only the second bracket fails", () => {
      const realCanRandomize = BracketList.prototype.canRandomize;
      jest
        .spyOn(BracketList.prototype, "canRandomize")
        .mockImplementation(function (this: BracketList) {
          return this.brktId === brktId2 ? false : realCanRandomize.call(this);
        });
      jest
        .spyOn(BracketList.prototype, "errorMessage", "get")
        .mockReturnValue("mock second bracket failure");

      const result = randomizeAllBrkts({
        rows: cloneRows(),
        tmntData: cloneTmntData(),
      });

      expect(Array.isArray(result)).toBe(false);
      expect(result).toEqual({
        id: brktId2,
        column: "",
        msg: expect.stringMatching(
          /^Error creating bracket list .+: mock second bracket failure$/
        ),
      });
    });
  });
});

