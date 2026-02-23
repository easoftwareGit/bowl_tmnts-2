import { validateFullTmnt, exportedForTesting } from "@/lib/validation/tmnts/full/validate";
import { mockTmntFullData, mockByePlayer } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { ErrorCode } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";

const {
  basicErrMsg,
  advancedErrMsg,
  getBrktEntriesError,
  getBrktSeedsError,
  getBrktsError,
  getDivsError,
  getDivEntriesError,
  getEventsError,
  getElimEntriesError,
  getElimsError,
  getLanesError,
  getOneBrktsError,
  getPlayersError,
  getPotsError,
  getPotEntriesError,
  getSquadsError,
  getStageError,
 } = exportedForTesting;

describe("validate tmntFullData", () => { 

  describe("basicErrMsg", () => {
    it("returns missing data message", () => {
      expect(basicErrMsg(ErrorCode.MISSING_DATA, "brkts")).toBe("brkts is missing data");
    });

    it("returns invalid data message", () => {
      expect(basicErrMsg(ErrorCode.INVALID_DATA, "stage")).toBe("stage has invalid data");
    });

    it("returns other error message", () => {
      expect(basicErrMsg(ErrorCode.OTHER_ERROR, "tmnt")).toBe("tmnt has an unknown error");
    });

    it("returns empty string for NONE", () => {
      expect(basicErrMsg(ErrorCode.NONE, "anything")).toBe("");
    });
  });

  describe("advancedErrMsg", () => {
    it("returns missing data message with index", () => {
      expect(
        advancedErrMsg({
          errorCode: ErrorCode.MISSING_DATA,
          errorTable: "players",
          errorIndex: 3,
          message: "",
        })
      ).toBe("players has missing data at index 3");
    });

    it("returns invalid data message with index", () => {
      expect(
        advancedErrMsg({
          errorCode: ErrorCode.INVALID_DATA,
          errorTable: "potEntries",
          errorIndex: 1,
          message: "",
        })
      ).toBe("potEntries has invalid data at index 1");
    });

    it("returns other error message with index", () => {
      expect(
        advancedErrMsg({
          errorCode: ErrorCode.OTHER_ERROR,
          errorTable: "events",
          errorIndex: 0,
          message: "",
        })
      ).toBe("events has an unknown error at index 0");
    });

    it("returns empty string for NONE", () => {
      expect(
        advancedErrMsg({
          errorCode: ErrorCode.NONE,
          errorTable: "",
          errorIndex: 0,
          message: "",
        })
      ).toBe("");
    });
  });

  describe("getEventsError", () => {
    it("returns NONE for valid events and sanitizes in-place (still same length)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getEventsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.events.length).toBe(mockTmntFullData.events.length);
    });

    it("returns MISSING_DATA when events is missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.events = null;
      const err = getEventsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("events");
    });

    it("returns MISSING_DATA when event has wrong tmnt_id (parent missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.events[0].tmnt_id = "invalid";
      const err = getEventsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("events");
      expect(err.message).toContain('events has missing data at index 0');
    });
  });

  describe("getDivsError", () => {
    it("returns NONE for valid divs and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getDivsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.divs.length).toBe(mockTmntFullData.divs.length);
    });

    it("returns MISSING_DATA when divs is empty", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divs = [];
      const err = getDivsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divs");
    });

    it("returns MISSING_DATA when div has wrong tmnt_id (parent missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divs[0].tmnt_id = "invalid";
      const err = getDivsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divs");
      expect(err.message).toContain("divs has missing data at index 0");
    });
  });

  describe("getSquadsError", () => {
    it("returns NONE for valid squads and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getSquadsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.squads.length).toBe(mockTmntFullData.squads.length);
    });

    it("returns MISSING_DATA when squads missing/empty", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.squads = [];
      const err = getSquadsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("squads");
    });

    it("returns MISSING_DATA when squad has no parent event", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.squads[0].event_id = "invalid";
      const err = getSquadsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("squads");
      expect(err.message).toContain("squads has missing data at index 0");
    });
  });

  describe("getStageError", () => {
    it("returns NONE for valid stage", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getStageError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(err.errorTable).toBe("");
    });

    it("returns MISSING_DATA when stage is null", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.stage = null;
      const err = getStageError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("stage");
      expect(err.message).toBe("no stage data");
    });

    it("returns INVALID_DATA when stage is invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.stage.id = "test";
      const err = getStageError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(err.errorTable).toBe("stage");
      expect(err.message).toBe("invalid stage data");
    });
  });

  describe("getLanesError", () => {
    it("returns NONE for valid lanes and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getLanesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.lanes.length).toBe(mockTmntFullData.lanes.length);
    });

    it("returns MISSING_DATA when lanes missing/empty", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.lanes = [];
      const err = getLanesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("lanes");
    });

    it("returns MISSING_DATA when lane has no parent squad", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.lanes[0].squad_id = "invalid";
      const err = getLanesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("lanes");
      expect(err.message).toContain("lanes has missing data at index 0");
    });
  });

  describe("getDivEntriesError", () => {
    it("returns NONE for valid divEntries and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getDivEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.divEntries.length).toBe(mockTmntFullData.divEntries.length);
    });

    it("filters out divEntries with null/blank fee; returns NONE and clears array if all filtered", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divEntries = tmnt.divEntries.map((de) => ({ ...de, fee: "" as any }));
      const err = getDivEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.divEntries).toEqual([]);
    });

    it("returns MISSING_DATA when divEntries missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.divEntries = null;
      const err = getDivEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divEntries");
    });

    it("returns MISSING_DATA when divEntries exist but divs missing (parent data missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divs = [];
      const err = getDivEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divEntries");
      expect(err.message).toBe("no divEntries parent data");
    });

    it("returns MISSING_DATA when a divEntry has no parent squad", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divEntries[0].squad_id = "invalid";
      const err = getDivEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divEntries");
      expect(err.message).toContain("divEntries has missing data at index 0");
    });

    it("returns MISSING_DATA when a divEntry has no parent div", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divEntries[0].div_id = "invalid";
      const err = getDivEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divEntries");
      expect(err.message).toContain("divEntries has missing data at index 0");
    });

    it("returns MISSING_DATA when a divEntry has no parent player", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divEntries[0].player_id = "invalid";
      const err = getDivEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divEntries");
      expect(err.message).toContain("divEntries has missing data at index 0");
    });
  });

  describe("getBrktsError", () => {
    it("returns NONE for valid brkts and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.brkts.length).toBe(mockTmntFullData.brkts.length);
    });

    it("returns NONE when brkts is [] (ok to have 0 brkts)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brkts = [];
      const err = getBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    });

    it("returns MISSING_DATA when brkts is missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.brkts = undefined;
      const err = getBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brkts");
      expect(err.message).toBe("no brkts data");
    });

    it("returns MISSING_DATA when brkts has child data but parents missing (divs/squads)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divs = [];
      const err = getBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brkts");
      expect(err.message).toBe("no brkts parent data");
    });

    it("returns MISSING_DATA when a brkt has no parent div", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brkts[0].div_id = "invalid";
      const err = getBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brkts");
      expect(err.message).toContain("brkts has missing data at index 0");
    });

    it("returns MISSING_DATA when a brkt has no parent squad", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brkts[0].squad_id = "invalid";
      const err = getBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brkts");
      expect(err.message).toContain("brkts has missing data at index 0");
    });
  });

  describe("getBrktEntriesError", () => {
    it("returns NONE for valid brktEntries and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getBrktEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.brktEntries.length).toBe(mockTmntFullData.brktEntries.length);
    });

    it("filters out brktEntries with num_brackets === 0; returns NONE and updates tmntFullData.brktEntries", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brktEntries[0].num_brackets = 0;

      const err = getBrktEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.brktEntries.length).toBe(mockTmntFullData.brktEntries.length - 1);
      expect(tmnt.brktEntries.find((e) => e.num_brackets === 0)).toBeUndefined();
    });

    it("filters out all brktEntries (all num_brackets=0) => NONE and clears array", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brktEntries = tmnt.brktEntries.map((be) => ({ ...be, num_brackets: 0 }));

      const err = getBrktEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.brktEntries).toEqual([]);
    });

    it("returns MISSING_DATA when brktEntries missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.brktEntries = null;
      const err = getBrktEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktEntries");
      expect(err.message).toBe("no brktEntries data");
    });

    it("returns MISSING_DATA when brktEntries exist but brkts missing (parent data missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brkts = [];
      const err = getBrktEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktEntries");
      expect(err.message).toBe("no brktEntries parent data");
    });

    it("returns MISSING_DATA when a brktEntry has no parent brkt", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brktEntries[0].brkt_id = "invalid";
      const err = getBrktEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktEntries");
      expect(err.message).toContain("brktEntries has missing data at index 0");
    });

    it("returns MISSING_DATA when a brktEntry has no parent player", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brktEntries[0].player_id = "invalid";
      const err = getBrktEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktEntries");
      expect(err.message).toContain("brktEntries has missing data at index 0");
    });

    it("returns INVALID_DATA when a brktEntry has no parent div", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brktEntries[0].num_brackets = -1;
      const err = getBrktEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(err.errorTable).toBe("brktEntries");
      expect(err.message).toContain("brktEntries has invalid data at index 0");
    })
  });

  describe("getOneBrktsError", () => {
    it("returns NONE for valid oneBrkts and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getOneBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.oneBrkts.length).toBe(mockTmntFullData.oneBrkts.length);
    });

    it("returns NONE when oneBrkts is [] (ok to have 0 oneBrkts)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.oneBrkts = [];
      const err = getOneBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    });

    it("returns MISSING_DATA when oneBrkts missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.oneBrkts = undefined;
      const err = getOneBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("oneBrkts");
      expect(err.message).toBe("no oneBrkts data");
    });

    it("returns MISSING_DATA when oneBrkts exist but brkts missing (parent data missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brkts = [];
      const err = getOneBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("oneBrkts");
      expect(err.message).toBe("no oneBrkts parent data");
    });

    it("returns MISSING_DATA when a oneBrkt has no parent brkt", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.oneBrkts[0].brkt_id = "invalid";
      const err = getOneBrktsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("oneBrkts");
      expect(err.message).toContain("oneBrkts has missing data at index 0");
    });
  });

  describe("getBrktSeedsError", () => {
    it("returns NONE for valid brktSeeds (no in-place replacement needed)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getBrktSeedsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    });

    it("returns NONE when brktSeeds is [] and oneBrkts is [] (no seeding needed)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.oneBrkts = [];
      tmnt.brktSeeds = [];
      const err = getBrktSeedsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    });

    it("returns MISSING_DATA when oneBrkts exist but brktSeeds is [] (missing child data)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brktSeeds = [];
      const err = getBrktSeedsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktSeeds");
      expect(err.message).toBe("no brktSeeds child data");
    });

    it("returns MISSING_DATA when brktSeeds exist but parent data missing (brkts/brktEntries/oneBrkts)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.oneBrkts = []; // parent missing for seeds
      const err = getBrktSeedsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktSeeds");
      expect(err.message).toBe("no brktSeeds parent data");
    });

    it("returns MISSING_DATA when a brktSeed has no parent oneBrkt", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brktSeeds[0].one_brkt_id = "invalid";
      const err = getBrktSeedsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktSeeds");
      expect(err.message).toContain("brktSeeds has missing data at index 0");
    });

    it("returns MISSING_DATA when a brktSeed has no parent player (but bye player is allowed if present)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.brktSeeds[0].player_id = "invalid";
      const err = getBrktSeedsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktSeeds");
      expect(err.message).toContain("brktSeeds has missing data at index 0");
    });
  });

  describe("getElimsError", () => {
    it("returns NONE for valid elims and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getElimsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.elims.length).toBe(mockTmntFullData.elims.length);
    });

    it("returns NONE when elims is [] (ok to have 0 elims)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.elims = [];
      const err = getElimsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    });

    it("returns MISSING_DATA when elims missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.elims = null;
      const err = getElimsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elims");
      expect(err.message).toBe("no elims data");
    });

    it("returns MISSING_DATA when elims exist but divs/squads missing (parent data missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divs = [];
      const err = getElimsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elims");
      expect(err.message).toBe("no elims parent data");
    });

    it("returns MISSING_DATA when an elim has no parent div", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.elims[0].div_id = "invalid";
      const err = getElimsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elims");
      expect(err.message).toContain("elims has missing data at index 0");
    });

    it("returns MISSING_DATA when an elim has no parent squad", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.elims[0].squad_id = "invalid";
      const err = getElimsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elims");
      expect(err.message).toContain("elims has missing data at index 0");
    });
  });

  describe("getElimEntriesError", () => {
    it("returns NONE for valid elimEntries and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getElimEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.elimEntries.length).toBe(mockTmntFullData.elimEntries.length);
    });

    it("filters out elimEntries with null/blank fee; returns NONE and clears array if all filtered", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.elimEntries = tmnt.elimEntries.map((ee) => ({ ...ee, fee: "" as any }));
      const err = getElimEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.elimEntries).toEqual([]);
    });

    it("returns MISSING_DATA when elimEntries missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.elimEntries = undefined;
      const err = getElimEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elimEntries");
      expect(err.message).toBe("no elimEntries data");
    });

    it("returns MISSING_DATA when elimEntries exist but elims missing (parent data missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.elims = [];
      const err = getElimEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elimEntries");
      expect(err.message).toBe("no elimEntries parent data");
    });

    it("returns MISSING_DATA when an elimEntry has no parent elim", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.elimEntries[0].elim_id = "invalid";
      const err = getElimEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elimEntries");
      expect(err.message).toContain("elimEntries has missing data at index 0");
    });

    it("returns MISSING_DATA when an elimEntry has no parent player", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.elimEntries[0].player_id = "invalid";
      const err = getElimEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elimEntries");
      expect(err.message).toContain("elimEntries has missing data at index 0");
    });

    it("returns INVALID_DATA when elimEntry fee does not match elim fee", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.elimEntries[0].fee = "999";
      const err = getElimEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(err.errorTable).toBe("elimEntries");
      expect(err.message).toContain("invalid data");
    });
  });

  describe("getPotsError", () => {
    it("returns NONE for valid pots and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getPotsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.pots.length).toBe(mockTmntFullData.pots.length);
    });

    it("returns NONE when pots is [] (ok to have 0 pots)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.pots = [];
      const err = getPotsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    });

    it("returns MISSING_DATA when pots missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.pots = null;
      const err = getPotsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("pots");
      expect(err.message).toBe("no pots data");
    });

    it("returns MISSING_DATA when pots exist but divs/squads missing (parent data missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.divs = [];
      const err = getPotsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("pots");
      expect(err.message).toBe("no pots parent data");
    });

    it("returns MISSING_DATA when a pot has no parent div", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.pots[0].div_id = "invalid";
      const err = getPotsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("pots");
      expect(err.message).toContain("pots has missing data at index 0");
    });

    it("returns MISSING_DATA when a pot has no parent squad", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.pots[0].squad_id = "invalid";
      const err = getPotsError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("pots");
      expect(err.message).toContain("pots has missing data at index 0");
    });
  });

  describe("getPotEntriesError", () => {
    it("returns NONE for valid potEntries and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getPotEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.potEntries.length).toBe(mockTmntFullData.potEntries.length);
    });

    it("filters out potEntries with null/blank fee; returns NONE and clears array if all filtered", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.potEntries = tmnt.potEntries.map((pe) => ({ ...pe, fee: "" as any }));
      const err = getPotEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.potEntries).toEqual([]);
    });

    it("returns MISSING_DATA when potEntries missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.potEntries = undefined;
      const err = getPotEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("potEntries");
      expect(err.message).toBe("no potEntries data");
    });

    it("returns MISSING_DATA when potEntries exist but pots missing (parent data missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.pots = [];
      const err = getPotEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("potEntries");
      expect(err.message).toBe("no potEntries parent data");
    });

    it("returns MISSING_DATA when a potEntry has no parent pot", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.potEntries[0].pot_id = "invalid";
      const err = getPotEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("potEntries");
      expect(err.message).toContain("potEntries has missing data at index 0");
    });

    it("returns MISSING_DATA when a potEntry has no parent player", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.potEntries[0].player_id = "invalid";
      const err = getPotEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("potEntries");
      expect(err.message).toContain("potEntries has missing data at index 0");
    });

    it("returns INVALID_DATA when potEntry fee does not match pot fee", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.potEntries[0].fee = "999";
      const err = getPotEntriesError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(err.errorTable).toBe("potEntries");
      expect(err.message).toContain("invalid data");
    });
  });

  describe("getPlayersError", () => {
    it("returns NONE for valid players and sanitizes in-place", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      const err = getPlayersError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
      expect(tmnt.players.length).toBe(mockTmntFullData.players.length);
    });

    it("returns NONE when players is [] (ok to have 0 players)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.players = [];
      const err = getPlayersError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    });

    it("returns MISSING_DATA when players missing/invalid", () => {
      const tmnt = cloneDeep(mockTmntFullData) as any;
      tmnt.players = null;
      const err = getPlayersError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("players");
      expect(err.message).toBe("no players data");
    });

    it("returns MISSING_DATA when players exist but squads missing (parent data missing)", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.squads = [];
      const err = getPlayersError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("players");
      expect(err.message).toBe("no players parent data");
    });

    it("returns MISSING_DATA when a player has no parent squad", () => {
      const tmnt = cloneDeep(mockTmntFullData);
      tmnt.players[0].squad_id = "invalid";
      const err = getPlayersError(tmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("players");
      expect(err.message).toContain("players has missing data at index 0");
    });
  });

  describe('validateFullTmnt', () => {    
    it("returns no error when all data is valid", () => {
      const err = validateFullTmnt(mockTmntFullData);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    });
    it('returns no error when bye players in brkts', () => { 
      const byeTmnt = cloneDeep(mockTmntFullData)
      byeTmnt.players.push(mockByePlayer)
      byeTmnt.brktSeeds[0].player_id = mockByePlayer.id
      const err = validateFullTmnt(byeTmnt);
      expect(err.errorCode).toBe(ErrorCode.NONE);
    })
    it('returns error when brkts are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.brkts[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brkts");
    });
    it('returns error when brktsEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.brktEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktEntries");
    });
    it('returns error when brktSeeds are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.brktSeeds[0].one_brkt_id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("brktSeeds");
    });
    it('returns error when divs are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.divs[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divs");
    });
    it('returns error when divEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.divEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("divEntries");
    });
    it('returns error when elims are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.elims[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elims");
    });
    it('returns error when elimEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.elimEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("elimEntries");
    });
    it('returns error when events are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.events[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("events");
    });
    it('returns error when lanes are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.lanes[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("lanes");
    });
    it('returns error when oneBrkts are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.oneBrkts[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("oneBrkts");
    });
    it('returns error when players are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      const badPlayer = cloneDeep(badTmnt.players[0])
      badPlayer.id = 'test';
      badTmnt.players.push(badPlayer);
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("players");
    });
    it("returns error when pots are invalid", () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.pots[0].id = 'test'      
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("pots");
    });
    it('returns error when potEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.potEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("potEntries");
    });
    it('returns error when squads are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.squads[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("squads");
    });
    it('returns error when stage is invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.stage.id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(err.errorTable).toBe("stage");
    });
    it('returns error when passed null', () => { 
      const err = validateFullTmnt(null as any);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("tmntFullData");
    });
    it('returns error when passed undefined', () => {
      const err = validateFullTmnt(undefined as any);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("tmntFullData");
    });
    it('returns error when passed non object', () => {
      const err = validateFullTmnt("test" as any);
      expect(err.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(err.errorTable).toBe("tmntFullData");
    });    
  });  

});