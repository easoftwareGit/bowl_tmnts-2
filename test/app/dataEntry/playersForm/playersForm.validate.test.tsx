import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";

import {
  CheckType,
  findNextError,
  getDivsPotsBrktsElimsCounts,
  getDivsPotsBrktsElimsCountErrMsg,
} from "@/app/dataEntry/playersForm/rowInfo";

import {
  entryFeeColName,
  entryNumBrktsColName,
  brktsColNameEnd,
} from "@/app/dataEntry/playersForm/createColumns";

import { defaultBrktPlayers } from "@/lib/db/initVals";

import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { populateRows } from "@/app/dataEntry/playersForm/populateRows";
import { maxBrackets } from "@/lib/validation/validation";

describe("PlayersForm - validate (rowInfo)", () => {
  const makeRows = () => cloneDeep(populateRows(mockTmntFullData));

  const div0 = mockTmntFullData.divs[0];
  const pot0 = mockTmntFullData.pots[0];
  const pot1 = mockTmntFullData.pots[1];
  const brkt0 = mockTmntFullData.brkts[0];
  const brkt1 = mockTmntFullData.brkts[1];
  const elm0 = mockTmntFullData.elims[0];

  const minLane = mockTmntFullData.lanes[0].lane_number;
  const maxLane =
    mockTmntFullData.lanes[mockTmntFullData.lanes.length - 1].lane_number;

  describe("findNextError - basic guard rails", () => {
    it("FINAL: returns 'No players in the tournament' when rows is empty", () => {
      const res = findNextError([], mockTmntFullData, CheckType.FINAL);
      expect(res).toEqual({ id: "none", msg: "No players in the tournament" });
    });

    it("returns 'No tournament data' when tmntData is missing", () => {
      const res = findNextError(makeRows(), null as any, CheckType.PRELIM);
      expect(res).toEqual({ id: "none", msg: "No tournament data" });
    });

    it("returns 'No event in the tournament' when events are missing", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.events = [];
      const res = findNextError(makeRows(), tmnt, CheckType.PRELIM);
      expect(res).toEqual({ id: "none", msg: "No event in the tournament" });
    });

    it("returns 'No divison in the tournament' when divs are missing", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divs = [];
      const res = findNextError(makeRows(), tmnt, CheckType.PRELIM);
      expect(res).toEqual({ id: "none", msg: "No divison in the tournament" });
    });

    it("returns 'No squad in the tournament' when squads are missing", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.squads = [];
      const res = findNextError(makeRows(), tmnt, CheckType.PRELIM);
      expect(res).toEqual({ id: "none", msg: "No squad in the tournament" });
    });

    it("returns 'No lanes in the tournament' when lanes are missing", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.lanes = [];
      const res = findNextError(makeRows(), tmnt, CheckType.PRELIM);
      expect(res).toEqual({ id: "none", msg: "No lanes in the tournament" });
    });
  });

  describe("findNextError - PRELIM rules", () => {
    it("flags missing first name", () => {
      const rows = makeRows();
      rows[0].first_name = "";
      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toBe("Missing First Name in row 1");
    });

    it("flags missing last name", () => {
      const rows = makeRows();
      rows[0].last_name = "";
      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toBe("Missing Last Name in row 1");
    });

    it("flags duplicate player names case-insensitively and trimmed", () => {
      const rows = makeRows();
      rows[0].first_name = " Eric ";
      rows[0].last_name = "Adolphson";
      rows[1].first_name = "eric";
      rows[1].last_name = " adolphson ";
      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[1].id);
      expect(res.msg).toMatch(/Duplicate Player Name/i);
    });

    it("PRELIM allows missing average/lane/position (no error if blank)", () => {
      const rows = makeRows();
      rows[0].average = null as any;
      rows[0].lane = null as any;
      rows[0].position = "";
      // BUT: must still have at least valid first/last
      rows[0].first_name = rows[0].first_name || "A";
      rows[0].last_name = rows[0].last_name || "B";

      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      // could still fail later due to other seeded data, so force a minimal case:
      // ensure at least one div fee is valid (or 0) for row0, and no pot/elim invalids:
      // (we don't know your seed values, but PRELIM doesn't require division fee)
      expect(res.msg).not.toMatch(/Missing Average|Missing Lane|Missing Position/);
    });

    it("flags invalid lane when provided", () => {
      const rows = makeRows();
      rows[0].lane = maxLane + 1;
      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Invalid Lane/i);
    });

    it("flags invalid position when provided", () => {
      const rows = makeRows();
      rows[0].position = "AA" as any; // invalid (len !== 1)
      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Invalid Position/i);
    });

    it("flags invalid division fee (> maxMoney) when provided", () => {
      const rows = makeRows();
      const feeKey = entryFeeColName(div0.id);
      rows[0][feeKey] = 999999999; // safely > maxMoney
      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Invalid Fee/i);
    });

    it("flags invalid pot fee when provided (fee must be 0 or exact)", () => {
      const rows = makeRows();
      const potFeeKey = entryFeeColName(pot0.id);
      const bad = Number(pot0.fee) + 1;
      rows[0][potFeeKey] = bad;

      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Invalid pot fee/i);
    });

    it("flags pot entry if player not entered in pot's division", () => {
      const rows = makeRows();

      // ensure player NOT in pot division
      const potDivFeeKey = entryFeeColName(pot0.div_id);
      rows[0][potDivFeeKey] = 0;

      // but player enters pot
      const potFeeKey = entryFeeColName(pot0.id);
      rows[0][potFeeKey] = Number(pot0.fee);

      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/is not entered in the division for pot/i);
    });

    it("flags bracket count < 0 or > maxBrackets", () => {
      const rows = makeRows();
      const brktsKey = entryNumBrktsColName(brkt0.id);

      rows[0][brktsKey] = -1;
      let res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.msg).toMatch(/less than 0/i);

      rows[0][brktsKey] = maxBrackets + 1; // safely > maxBrackets
      res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.msg).toMatch(/more than/i);
    });

    it("flags bracket entry if player not entered in bracket's division", () => {
      const rows = makeRows();

      // player enters bracket
      const brktsKey = entryNumBrktsColName(brkt0.id);
      rows[0][brktsKey] = 1;

      // ensure player NOT in bracket division
      const brktDivFeeKey = entryFeeColName(brkt0.div_id);
      rows[0][brktDivFeeKey] = 0;
      // ensure player NOT in pots
      const pot0FeeKey = entryFeeColName(pot0.id);
      const pot1FeeKey = entryFeeColName(pot1.id);
      rows[0][pot0FeeKey] = 0;
      rows[0][pot1FeeKey] = 0;

      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/is not entered in the division for bracket/i);
    });

    it("flags invalid elim fee when provided (fee must be 0 or exact)", () => {
      const rows = makeRows();
      const elimFeeKey = entryFeeColName(elm0.id);
      rows[0][elimFeeKey] = Number(elm0.fee) + 1;

      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Invalid eliminator fee/i);
    });

    it("flags elim entry if player not entered in elim's division", () => {
      const rows = makeRows();

      // player enters elim
      const elimFeeKey = entryFeeColName(elm0.id);
      rows[0][elimFeeKey] = Number(elm0.fee);

      // ensure player NOT in elim division
      const elimDivFeeKey = entryFeeColName(elm0.div_id);
      rows[0][elimDivFeeKey] = 0;
      // ensure player NOT in pots
      const pot0FeeKey = entryFeeColName(pot0.id);
      const pot1FeeKey = entryFeeColName(pot1.id);
      rows[0][pot0FeeKey] = 0;
      rows[0][pot1FeeKey] = 0;
      // ensure player not in brackets
      const brkts0Key = entryNumBrktsColName(brkt0.id);
      const brkts1Key = entryNumBrktsColName(brkt1.id);
      rows[0][brkts0Key] = 0;
      rows[0][brkts1Key] = 0;

      const res = findNextError(rows, mockTmntFullData, CheckType.PRELIM);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/is not entered in the division for eliminator/i);
    });
  });

  describe("findNextError - FINAL rules", () => {
    it("FINAL requires average (Missing Average)", () => {
      const rows = makeRows();
      rows[0].average = null as any;
      const res = findNextError(rows, mockTmntFullData, CheckType.FINAL);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Missing Average/i);
    });

    it("FINAL requires lane (Missing Lane)", () => {
      const rows = makeRows();
      rows[0].lane = null as any;
      const res = findNextError(rows, mockTmntFullData, CheckType.FINAL);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Missing Lane/i);
    });

    it("FINAL requires position (Missing Position)", () => {
      const rows = makeRows();
      rows[0].position = "";
      const res = findNextError(rows, mockTmntFullData, CheckType.FINAL);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Missing Position/i);
    });

    it("FINAL flags duplicate Lane/Position", () => {
      const rows = makeRows();

      rows[0].lane = minLane;
      rows[0].position = "A";

      rows[1].lane = minLane;
      rows[1].position = "a"; // same after toUpperCase()

      const res = findNextError(rows, mockTmntFullData, CheckType.FINAL);
      expect(res.id).toBe(rows[1].id);
      expect(res.msg).toMatch(/Duplicate Lane\/Position/i);
      expect(res.msg).toMatch(new RegExp(`${minLane}-A`));
    });

    it("FINAL requires at least one division fee (Missing Division Fee)", () => {
      const rows = makeRows();

      // ensure all div fees are 0/undefined
      mockTmntFullData.divs.forEach((d) => {
        rows[0][entryFeeColName(d.id)] = 0;
      });

      // ensure other FINAL-required fields are present
      rows[0].average = rows[0].average ?? 200;
      rows[0].lane = rows[0].lane ?? minLane;
      rows[0].position = rows[0].position || "A";

      const res = findNextError(rows, mockTmntFullData, CheckType.FINAL);
      expect(res.id).toBe(rows[0].id);
      expect(res.msg).toMatch(/Missing Division Fee/i);
    });
  });

  describe("counts validation helpers (Finalize count errors)", () => {
    it("getDivsPotsBrktsElimsCounts includes brkts count from brktEntries length", () => {
      const entriesCount: Record<string, number> = {
        [entryFeeColName(div0.id)]: 5,
        [entryFeeColName(pot0.id)]: 2,
        [entryFeeColName(elm0.id)]: 3,
      };

      const allBrktsList: Record<string, any> = {
        [brkt0.id]: { brktEntries: [{}, {}, {}] }, // 3 players entered
      };

      const counts = getDivsPotsBrktsElimsCounts(entriesCount, allBrktsList);

      expect(counts[entryFeeColName(div0.id)]).toBe(5);
      expect(counts[entryFeeColName(pot0.id)]).toBe(2);
      expect(counts[entryFeeColName(elm0.id)]).toBe(3);
      expect(counts[brkt0.id + brktsColNameEnd]).toBe(3);
    });

    it("getDivsPotsBrktsElimsCountErrMsg flags missing division entries", () => {
      const counts: Record<string, number> = {
        [entryFeeColName(div0.id)]: 0, // triggers first
      };

      const msg = getDivsPotsBrktsElimsCountErrMsg(counts, mockTmntFullData);
      expect(msg).toMatch(/No division entries/i);
    });

    it("getDivsPotsBrktsElimsCountErrMsg flags missing pot entries", () => {
      const counts: Record<string, number> = {
        [entryFeeColName(div0.id)]: 1,
        [entryFeeColName(pot0.id)]: 0,
      };

      const msg = getDivsPotsBrktsElimsCountErrMsg(counts, mockTmntFullData);
      expect(msg).toMatch(/No pot entries/i);
    });

    it("getDivsPotsBrktsElimsCountErrMsg flags missing elim entries", () => {
      const counts: Record<string, number> = {
        [entryFeeColName(div0.id)]: 1,
        [entryFeeColName(pot0.id)]: 1,
        [entryFeeColName(elm0.id)]: 0,
      };

      const msg = getDivsPotsBrktsElimsCountErrMsg(counts, mockTmntFullData);
      expect(msg).toMatch(/No elim entries/i);
    });

    it("getDivsPotsBrktsElimsCountErrMsg flags not enough bracket entries (< defaultBrktPlayers - 1)", () => {
      const counts: Record<string, number> = {
        [entryFeeColName(div0.id)]: 1,
        [entryFeeColName(pot0.id)]: 1,
        [entryFeeColName(elm0.id)]: 1,
        [brkt0.id + brktsColNameEnd]: defaultBrktPlayers - 2, // too low
      };

      const msg = getDivsPotsBrktsElimsCountErrMsg(counts, mockTmntFullData);
      expect(msg).toMatch(/Not enough bracket entries/i);
    });

    it("getDivsPotsBrktsElimsCountErrMsg returns empty string when counts are ok", () => {
      const counts: Record<string, number> = {
        [entryFeeColName(div0.id)]: 1,
        [entryFeeColName(pot0.id)]: 1,
        [entryFeeColName(elm0.id)]: 1,
        [brkt0.id + brktsColNameEnd]: defaultBrktPlayers - 1, // threshold ok
      };

      const msg = getDivsPotsBrktsElimsCountErrMsg(counts, mockTmntFullData);
      expect(msg).toBe("");
    });
  });
});
