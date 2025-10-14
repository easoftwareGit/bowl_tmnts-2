import { validateFullTmnt, exportedForTesting, validateFullTmntEntries } from "@/app/api/tmnts/full/validate";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { ErrorCode } from "@/lib/validation";
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
} = exportedForTesting;

const orphanedBrktId = 'brk_abcd8f787de942a1a92aaa2df3e7c18a'
const orphanedDivId = 'div_abcd8f787de942a1a92aaa2df3e7c18a'
const orphanedElimId = 'elm_abcd8f787de942a1a92aaa2df3e7c18a'
const orphanedEventId = 'evt_abcd8f787de942a1a92aaa2df3e7c18a'
const orphanedOneBrktId = 'obk_abcd8f787de942a1a92aaa2df3e7c18a'
const orphanedPlayerId = 'ply_abcd8f787de942a1a92aaa2df3e7c18a'
const orphanedPotId = 'pot_abcd8f787de942a1a92aaa2df3e7c18a'
const orphanedSquadId = 'sqd_abcd8f787de942a1a92aaa2df3e7c18a'
const orphanedTmntId = 'tmt_abcd8f787de942a1a92aaa2df3e7c18a'

describe("validate tmntFullData", () => { 

  describe('error messages', () => { 

    describe('basicErrMsg', () => { 
      it("returns correct messages for each error code", () => {
        expect(basicErrMsg(ErrorCode.MissingData, "tmnt")).toBe('tmnt is missing data');
        expect(basicErrMsg(ErrorCode.InvalidData, "tmnt")).toBe('tmnt has invalid data');        
        expect(basicErrMsg(ErrorCode.OtherError, "tmnt")).toBe('tmnt has an unknown error');        
        expect(basicErrMsg(ErrorCode.None, "tmnt")).toBe("");
      });    
    })
    
    describe('advancedErrMsg', () => { 
      it("returns detailed messages with errorIndex", () => {
        expect(
          advancedErrMsg({
            errorCode: ErrorCode.MissingData,
            errorTable: "divs",
            errorIndex: 2,
            message: "",
          })
        ).toBe('divs has missing data at index 2');

        expect(
          advancedErrMsg({
            errorCode: ErrorCode.InvalidData,
            errorTable: "potEntries",
            errorIndex: 1,
            message: "",
          })
        ).toBe('potEntries has invalid data at index 1');

        expect(
          advancedErrMsg({
            errorCode: ErrorCode.OtherError,
            errorTable: "events",
            errorIndex: 0,
            message: "",
          })
        ).toBe('events has an unknown error at index 0');

        expect(
          advancedErrMsg({
            errorCode: ErrorCode.None,
            errorTable: "events",
            errorIndex: 0,
            message: "",
          })
        ).toBe("");
      });
    })
  })

  describe('get...Error', () => {

    describe('getBrktsError', () => {
      it("returns no error when brkts is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.brkts = [];
        const err = getBrktsError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all brkts are valid", () => {
        const err = getBrktsError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it('returns error when there is no brkts fee, "" get sanitized to 0, but min is 1', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts[0].fee = "";
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('brkts has missing data at index 0');
      });
      it("returns error when a brkts has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts[0].id = "bad_id";
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("brkts");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('brkts has missing data at index 0');
      });
      it("returns error when a brkt has an orphaned div id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts[1].div_id = orphanedDivId;
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brkts has no parent div at index 1');
      });
      it("returns error when a brkt has an orphaned squad id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts[1].squad_id = orphanedSquadId;
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brkts has no parent squad at index 1');
      });
      it('returns error when a brkt has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts[1].fee = '1234567890';
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // fee sanitized to ''
        expect(err.errorTable).toBe("brkts");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brkts has missing data at index 1');
      });
      it('returns error when a brkt is missing start', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts[0].start = null as any;
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // pot_type sanitized to ''
        expect(err.errorTable).toBe("brkts");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('brkts has missing data at index 0');
      });
      it('returns error when brkts is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts = null as any;
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.message).toBe('no brkts data');
      });
      it('returns error when brkts is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts = 'bad' as any;
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.message).toBe('no brkts data');
      });
      it('returns error when parent divs is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = null as any;
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.message).toBe('no brkts parent data');
      });
      it('returns error when parent divs is empty, and brkts is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = [];
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.message).toBe('no brkts parent data');
      });
      it('returns error when parent squads is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = null as any;
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.message).toBe('no brkts parent data');
      });
      it('returns error when parent squads is empty, and brkts is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = [];
        const err = getBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brkts");
        expect(err.message).toBe('no brkts parent data');
      });
    });

    describe('getBrktsEntriesError', () => {
      it("returns no error when brktEntries is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.brktEntries = [];
        const err = getBrktEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all brktEntries are valid", () => {
        const err = getBrktEntriesError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns the correct number of brktEntries rows when some rows have 0 num_brackets", () => { 
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.brktEntries[0].num_brackets = 0;
        const err = getBrktEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(okTmnt.brktEntries.length).toBe(mockTmntFullData.brktEntries.length - 1);
      })
      it("returns no errors when all brktEntries rows have 0 num_brackets", () => { 
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.brktEntries[0].num_brackets = 0;
        okTmnt.brktEntries[1].num_brackets = 0;
        okTmnt.brktEntries[2].num_brackets = 0;
        okTmnt.brktEntries[3].num_brackets = 0;
        const err = getBrktEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(okTmnt.brktEntries.length).toBe(0);
      })
      it("return no errors when brktEntry fee is blank or 0 when brktEntry.num_brackets is 0", () => { 
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.brktEntries[0].num_brackets = 0;
        okTmnt.brktEntries[0].fee = '';
        const err = getBrktEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      })
      it("returns error when a brktEntry has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktEntries[0].id = "bad_id";
        const err = getBrktEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("brktEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('brktEntries has missing data at index 0');
      });
      it("returns error when a brktEntry has an orphaned brkt id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktEntries[1].brkt_id = orphanedBrktId;
        const err = getBrktEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brktEntries has no parent brkt at index 1');
      });
      it("returns error when a brktEntry has an orphaned player id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktEntries[1].player_id = orphanedPlayerId;
        const err = getBrktEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brktEntries has no parent player at index 1');
      });
      it('returns error when a brktEntry has invalid num_brkts', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktEntries[1].num_brackets = 1234567890;
        const err = getBrktEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.InvalidData);
        expect(err.errorTable).toBe("brktEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brktEntries has invalid data at index 1');
      });
      it('returns error when a brktEntry is missing player_id', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktEntries[2].player_id = null as any;
        const err = getBrktEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // sanitized to ''
        expect(err.errorTable).toBe("brktEntries");
        expect(err.errorIndex).toBe(2);
        expect(err.message).toBe('brktEntries has missing data at index 2');
      });
      it('returns error when a parent brkts is empty, and brktEntries is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts = [];
        const err = getBrktEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktEntries parent data');
      });
      it('returns error when brktEntries is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktEntries = null as any;
        const err = getBrktEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktEntries data');
      });
      it('returns error when brktEntries is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktEntries = 'bad' as any;
        const err = getBrktEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktEntries data');
      });
    })

    describe('getBrktSeedsError', () => {
      it("returns no error when brktSeeds and oneBrkts are empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.oneBrkts = [];
        okTmnt.brktSeeds = [];
        const err = getBrktSeedsError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all brktSeeds are valid", () => {
        const err = getBrktSeedsError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns error when a brktSeed has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktSeeds[0].one_brkt_id = "bad_id";
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('brktSeeds has missing data at index 0');
      });
      it("returns error when a brktSeed has an orphaned brkt id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktSeeds[1].one_brkt_id = orphanedOneBrktId;
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brktSeeds has no parent oneBrkt at index 1');
      });
      it("returns error when a brktSeed has an orphaned player id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktSeeds[1].player_id = orphanedPlayerId;
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brktSeeds has no parent player at index 1');
      });
      it('returns error when a brktSeed has invalid seed', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktSeeds[1].seed = 9;
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // sanitized to null
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brktSeeds has missing data at index 1');
      });
      it('returns error when a brktSeed is missing player_id', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktSeeds[1].player_id = null as any;
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // sanitized to ''
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('brktSeeds has missing data at index 1');
      });
      it('returns error when a parent oneBrkts is empty, and brktSeeds is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.oneBrkts = [];
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktSeeds parent data');
      })
      it('returns error when a parent brkts is empty, and brktSeeds is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts = [];
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktSeeds parent data');
      })
      it('returns error when a parent brktEntries is empty, and brktSeeds is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktEntries = [];
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktSeeds parent data');
      })
      it('returns error when a parent oneBrkts is not empty, and brktSeeds is empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktSeeds = [];
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktSeeds child data');
      });
      it('returns error when brktSeeds is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktSeeds = null as any;
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktSeeds data');
      });
      it('returns error when brktSeeds is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brktSeeds = 'bad' as any;
        const err = getBrktSeedsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("brktSeeds");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no brktSeeds data');
      })
    })

    describe('getDivsError', () => {
      it("returns error when divs is empty", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = [];
        const err = getDivsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("divs");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe("no divs data");
      });
      it("returns no error when all divs are valid", () => {
        const err = getDivsError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it('returns sanitized divs', () => { 
        const sanitizedTmnt = cloneDeep(mockTmntFullData);
        sanitizedTmnt.divs[0].div_name = '<script>alert("xss")</script>';
        const err = getDivsError(sanitizedTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(sanitizedTmnt.divs[0].div_name).toBe('alertxss');
      })
      it("returns error when a div has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs[0].id = "bad_id";
        const err = getDivsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("divs");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('divs has missing data at index 0');
      });
      it("returns error when a div has an orphaned tmnt id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        // need both divs to have same orphaned tmnt id
        badTmnt.divs[0].tmnt_id = orphanedTmntId; 
        badTmnt.divs[1].tmnt_id = orphanedTmntId;
        const err = getDivsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("divs");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('divs has no parent tmnt at index 0');
      });
      it('returns error when a div has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs[1].hdcp_from = 1234567890;
        const err = getDivsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.InvalidData);
        expect(err.errorTable).toBe("divs");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('divs has invalid data at index 1');
      });
      it('returns error when a div is missing div_name', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs[0].div_name = null as any;
        const err = getDivsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("divs");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('divs has missing data at index 0');
      });
      it('should return error when divs is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = null as any;
        const err = getDivsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("divs");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no divs data');
      });
      it('should return error when divs is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = 'bad' as any;
        const err = getDivsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("divs");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no divs data');
      });
    });

    describe('getDivEntriesError', () => {
      it("returns no error when divEntries is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData)
        okTmnt.divEntries = [];
        const err = getDivEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all divEntries are valid", () => {
        const err = getDivEntriesError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it('returns no error when a divEntry has blank fee', () => {
        const sanitizedTmnt = cloneDeep(mockTmntFullData);
        sanitizedTmnt.divEntries[0].fee = '';
        const err = getDivEntriesError(sanitizedTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(sanitizedTmnt.divEntries).toHaveLength(mockTmntFullData.divEntries.length - 1);
      });
      it('returns no errors when all divEntries have blank fee', () => {
        const sanitizedTmnt = cloneDeep(mockTmntFullData);
        sanitizedTmnt.divEntries[0].fee = '';
        sanitizedTmnt.divEntries[1].fee = null as any;
        sanitizedTmnt.divEntries[2].fee = '';
        sanitizedTmnt.divEntries[3].fee = undefined as any;
        const err = getDivEntriesError(sanitizedTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(sanitizedTmnt.divEntries).toHaveLength(0);
      });
      it('returns no error when a divEntry has "0" fee', () => { 
        const sanitizedTmnt = cloneDeep(mockTmntFullData);
        sanitizedTmnt.divEntries[0].fee = '0';
        const err = getDivEntriesError(sanitizedTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(sanitizedTmnt.divEntries).toHaveLength(mockTmntFullData.divEntries.length);
      })
      it("returns error when a divEntry has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divEntries[0].id = "bad_id";
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('divEntries has missing data at index 0');
      });
      it("returns error when a divEntry has an orphaned squad id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divEntries[1].squad_id = orphanedSquadId;
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('divEntries has no parent squad at index 1');
      });
      it("returns error when a divEntry has an orphaned div id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divEntries[1].div_id = orphanedDivId;
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('divEntries has no parent div at index 1');
      });
      it("returns error when a divEntry has an orphaned player id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divEntries[1].player_id = orphanedPlayerId;
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('divEntries has no parent player at index 1');
      });
      it('returns error when a divEntry has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divEntries[1].fee = '1234567890';
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // fee sanitized to 0
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('divEntries has missing data at index 1');
      });
      it('returns error when a divEntry is missing player_id', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divEntries[2].player_id = null as any;
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(2);
        expect(err.message).toBe('divEntries has missing data at index 2');
      });
      it('returns error when a parent divs is empty, and divEntries is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = [];
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no divEntries parent data');
      });
      it('returns error when divEntries is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divEntries = null as any;
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no divEntries data');
      })
      it('returns error when divEntries is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divEntries = 'bad' as any;
        const err = getDivEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("divEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no divEntries data');
      });
    });

    describe('getElimsError', () => {
      it("returns no error when elims is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.elims = [];
        const err = getElimsError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all elims are valid", () => {
        const err = getElimsError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it('returns error when elim fee is sanitized to 0, when min elim fee is 1', () => { 
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims[0].fee = '';
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // fee sanitized to 0
        expect(err.errorTable).toBe("elims");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('elims has missing data at index 0');
      })
      it("returns error when a elim has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims[0].id = "bad_id";
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("elims");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('elims has missing data at index 0');
      });
      it("returns error when a elim has an orphaned div id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims[1].div_id = orphanedDivId;
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('elims has no parent div at index 1');
      });
      it("returns error when a elim has an orphaned squad id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims[1].squad_id = orphanedSquadId;
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('elims has no parent squad at index 1');
      });
      it('returns error when a elim has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims[1].fee = '1234567890';
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // fee sanitized to ''
        expect(err.errorTable).toBe("elims");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('elims has missing data at index 1');
      });
      it('returns error when a elims is missing start', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims[0].start = null as any;
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('elims has missing data at index 0');
      });
      it('returns error when elims is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims = null as any;
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no elims data');
      });
      it('returns error when elims is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims = 'bad' as any;
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no elims data');
      });
      it('returns error when parent divs is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = null as any;
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.message).toBe('no elims parent data');
      });
      it('returns error when parent divs is empty, and elims is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = [];
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.message).toBe('no elims parent data');
      });
      it('returns error when parent squads is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = null as any;
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.message).toBe('no elims parent data');
      });
      it('returns error when parent squads is empty, and elims is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = [];
        const err = getElimsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elims");
        expect(err.message).toBe('no elims parent data');
      });
    });

    describe('getElimEntriesError', () => {
      it("returns no error when elimEntries is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData)
        okTmnt.elimEntries = [];
        const err = getElimEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all elimEntries are valid", () => {
        const err = getElimEntriesError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it('returns no error when an elim entry has null fee', () => {
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.elimEntries[0].fee = null as any;
        const err = getElimEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(okTmnt.elimEntries).toHaveLength(mockTmntFullData.elimEntries.length - 1);
      });
      it('returns no error when all elimEntrie have null fee', () => {
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.elimEntries[0].fee = null as any;
        okTmnt.elimEntries[1].fee = '';
        okTmnt.elimEntries[2].fee = undefined as any;
        okTmnt.elimEntries[3].fee = '';
        const err = getElimEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(okTmnt.elimEntries).toHaveLength(0);
      });
      it("returns error when a elimEntry has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elimEntries[0].id = "bad_id";
        const err = getElimEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("elimEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('elimEntries has missing data at index 0');
      });
      it("returns error when a elimEntry has an orphaned elim id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elimEntries[1].elim_id = orphanedElimId;
        const err = getElimEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("elimEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('elimEntries has no parent elim at index 1');
      });
      it("returns error when a elimEntry has an orphaned player id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elimEntries[1].elim_id = orphanedElimId;
        const err = getElimEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("elimEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('elimEntries has no parent elim at index 1');
      });
      it('returns error when a elimEntry has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elimEntries[1].fee = '1234567890';
        const err = getElimEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // fee sanitized to 0
        expect(err.errorTable).toBe("elimEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('elimEntries has missing data at index 1');
      });
      it('returns error when a elim is missing player_id', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elimEntries[2].player_id = null as any;
        const err = getElimEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // player_id sanitized to ''
        expect(err.errorTable).toBe("elimEntries");
        expect(err.errorIndex).toBe(2);
        expect(err.message).toBe('elimEntries has missing data at index 2');
      });
      it('returns error when a parent elims is empty, and elimEntries is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elims = [];
        const err = getElimEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elimEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no elimEntries parent data');
      });
      it('returns error when elimEntries is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elimEntries = null as any;
        const err = getElimEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elimEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no elimEntries data');
      })
      it('returns error when elimEntries is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.elimEntries = 'bad' as any;
        const err = getElimEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("elimEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no elimEntries data');
      })
    });

    describe('getEventsError', () => {
      it('returns sanitized event', () => {
        const sanitized = cloneDeep(mockTmntFullData);
        sanitized.events[0].event_name = '<script>Singles</script>';
        sanitized.events[0].entry_fee = '';
        sanitized.events[0].lineage = '';
        sanitized.events[0].other = '';
        sanitized.events[0].prize_fund = '';
        sanitized.events[0].expenses = '';
        sanitized.events[0].lpox = '';
        sanitized.events[0].added_money = '';
        const err = getEventsError(sanitized);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(sanitized.events[0].event_name).toBe('Singles');
        expect(sanitized.events[0].entry_fee).toBe('0');
        expect(sanitized.events[0].lineage).toBe('0');
        expect(sanitized.events[0].prize_fund).toBe('0');
        expect(sanitized.events[0].other).toBe('0');
        expect(sanitized.events[0].expenses).toBe('0');
        expect(sanitized.events[0].added_money).toBe('0');
        expect(sanitized.events[0].lpox).toBe('0');
      })
      it("returns error when events is empty", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.events = [];
        const err = getEventsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("events");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe("no events data");
      });
      it("returns no error when all events are valid", () => {
        const err = getEventsError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns error when an event has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.events[0].id = "bad_id";
        const err = getEventsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("events");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('events has missing data at index 0');
      });
      it("returns error when an event has an orphaned tmnt id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);        
        badTmnt.events[0].tmnt_id = orphanedTmntId;         
        const err = getEventsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("events");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('events has no parent tmnt at index 0');
      });
      it('returns error when an event has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.events[0].games = 1234567890;
        const err = getEventsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.InvalidData);
        expect(err.errorTable).toBe("events");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('events has invalid data at index 0');
      });
      it('returns error when an event is missing event_name', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.events[0].event_name = null as any;
        const err = getEventsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("events");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('events has missing data at index 0');
      });
      it('returns error when events is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.events = null as any;
        const err = getEventsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("events");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no events data');
      });
      it('returns error when events is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.events = 'bad' as any;
        const err = getEventsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("events");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no events data');
      })
    });

    describe('getLanesError', () => {
      it("returns error when lanes is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.lanes = [];
        const err = getLanesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("lanes");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe("no lanes data");
      });
      it("returns no error when all lanes are valid", () => {
        const err = getLanesError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });      
      it("returns error when a lane has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.lanes[0].id = "bad_id";
        const err = getLanesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("lanes");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('lanes has missing data at index 0');
      });
      it("returns error when a lane has an orphaned squad id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);        
        // all lanes same orphaned squad id
        badTmnt.lanes[0].squad_id = orphanedSquadId;
        badTmnt.lanes[1].squad_id = orphanedSquadId;
        badTmnt.lanes[2].squad_id = orphanedSquadId;
        badTmnt.lanes[3].squad_id = orphanedSquadId;
        const err = getLanesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("lanes");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('lanes has no parent squad at index 0');
      });
      it('returns error when a lane has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.lanes[0].lane_number = 1234567890;
        const err = getLanesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.InvalidData);
        expect(err.errorTable).toBe("lanes");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('lanes has invalid data at index 0');
      });
      it('returns error when a lane is missing event_name', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.lanes[0].squad_id = null as any;
        const err = getLanesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("lanes");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('lanes has missing data at index 0');
      });
      it('returns error when a lane is duplicated', () => { 
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.lanes[1].lane_number = badTmnt.lanes[2].lane_number;
        const err = getLanesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.InvalidData);
        expect(err.errorTable).toBe("lanes");
        expect(err.errorIndex).toBe(2);
        expect(err.message).toBe('lanes has invalid data at index 2');
      })
      it('returns error when lanes is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.lanes = null as any;
        const err = getLanesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("lanes");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no lanes data');
      });
      it('returns error when lanes is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.lanes = 'bad' as any;
        const err = getLanesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("lanes");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no lanes data');
      })
    });

    describe('getOneBrktsError', () => {
      it("returns no error when oneBrkts is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData)
        okTmnt.oneBrkts = [];
        const err = getOneBrktsError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all oneBrkts are valid", () => {
        const err = getOneBrktsError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns error when a oneBrkt has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.oneBrkts[0].id = "bad_id";
        const err = getOneBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("oneBrkts");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('oneBrkts has missing data at index 0');
      });
      it("returns error when a oneBrkt has an orphaned brkt id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.oneBrkts[1].brkt_id = orphanedBrktId;
        const err = getOneBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("oneBrkts");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('oneBrkts has no parent brkt at index 1');
      });
      it('returns error when a oneBrkt has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.oneBrkts[1].bindex = -1;
        const err = getOneBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // fee sanitized to 0
        expect(err.errorTable).toBe("oneBrkts");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('oneBrkts has missing data at index 1');
      });
      it('returns error when a oneBrkt is missing brkt_id', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.oneBrkts[1].brkt_id = null as any;
        const err = getOneBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // player_id sanitized to ''
        expect(err.errorTable).toBe("oneBrkts");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('oneBrkts has missing data at index 1');
      });
      it('returns error when a parent brkts is empty, and oneBrkts is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.brkts = [];
        const err = getOneBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("oneBrkts");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no oneBrkts parent data');
      });
      it('returns error when oneBrkts is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.oneBrkts = null as any;
        const err = getOneBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("oneBrkts");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no oneBrkts data');
      });
      it('returns error when oneBrkts is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.oneBrkts = 'bad' as any;
        const err = getOneBrktsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("oneBrkts");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no oneBrkts data');
      })
    });
    
    describe('getPlayersError', () => {
      it("returns no error when players is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData)
        okTmnt.players = [];
        const err = getPlayersError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all players are valid", () => {
        const err = getPlayersError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it('returns no error when sanitizing players', () => { 
        const sanitized = cloneDeep(mockTmntFullData);
        sanitized.players[0].first_name = "<script>John</script>";
        sanitized.players[1].last_name = "****Doe****";
        sanitized.players[2].position = '(A)';
        const err = getPlayersError(sanitized);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(sanitized.players[0].first_name).toBe("John");
        expect(sanitized.players[1].last_name).toBe("Doe");
        expect(sanitized.players[2].position).toBe("A");
      })
      it("returns error when a player has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.players[0].id = "bad_id";
        const err = getPlayersError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("players");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('players has missing data at index 0');
      });
      it("returns error when a player has an orphaned squad id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.players.forEach(p => p.squad_id = orphanedSquadId);
        const err = getPlayersError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); 
        expect(err.errorTable).toBe("players");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('players has no parent squad at index 0');
      });
      it('returns error when a player has invalid average', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.players[1].average = 1234567890;
        const err = getPlayersError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.InvalidData);
        expect(err.errorTable).toBe("players");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('players has invalid data at index 1');
      });
      it('returns error when a player is missing squad id', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.players[2].squad_id = null as any;
        const err = getPlayersError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // player_id sanitized to ''
        expect(err.errorTable).toBe("players");
        expect(err.errorIndex).toBe(2);
        expect(err.message).toBe('players has missing data at index 2');
      });
      it('returns error when a parent squads is empty, and players is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = [];
        const err = getPlayersError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("players");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no players parent data');
      })
    });    

    describe('getPotsError', () => {
      it("returns no error when pots is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData);
        okTmnt.pots = [];
        const err = getPotsError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all pots are valid", () => {
        const err = getPotsError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns error when a pot has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.pots[0].id = "bad_id";
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("pots");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('pots has missing data at index 0');
      });
      it("returns error when a pot has an orphaned div id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.pots[1].div_id = orphanedDivId;
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("pots");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('pots has no parent div at index 1');
      });
      it("returns error when a pot has an orphaned squad id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.pots[1].squad_id = orphanedSquadId;
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("pots");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('pots has no parent squad at index 1');
      });
      it('returns error when a pot has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.pots[1].fee = '1234567890';
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // fee sanitized to ''
        expect(err.errorTable).toBe("pots");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('pots has missing data at index 1');
      });
      it('returns error when a pot is missing pot_type', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.pots[0].pot_type = null as any;
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // pot_type sanitized to ''
        expect(err.errorTable).toBe("pots");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('pots has missing data at index 0');
      });
      it('returns error when parent divs is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = null as any;
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("pots");
        expect(err.message).toBe('no pots parent data');
      });
      it('returns error when parent divs is empty, and pots is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.divs = [];
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("pots");
        expect(err.message).toBe('no pots parent data');
      });
      it('returns error when parent squads is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = null as any;
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("pots");
        expect(err.message).toBe('no pots parent data');
      });
      it('returns error when parent squads is empty, and pots is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = [];
        const err = getPotsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("pots");
        expect(err.message).toBe('no pots parent data');
      });
    });

    describe('getPotEntriesError', () => {
      it("returns no error when potEntries is empty", () => {
        const okTmnt = cloneDeep(mockTmntFullData)
        okTmnt.potEntries = [];
        const err = getPotEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it("returns no error when all potEntries are valid", () => {
        const err = getPotEntriesError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it('returns no errors when one potEntry has a null fee', () => {
        const okTmnt = cloneDeep(mockTmntFullData)
        okTmnt.potEntries[0].fee = null as any;
        const err = getPotEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(okTmnt.potEntries).toHaveLength(mockTmntFullData.potEntries.length - 1);
      });
      it('returns no errors when all potEntry fees are null, undefined or blank', () => {
        const okTmnt = cloneDeep(mockTmntFullData)
        okTmnt.potEntries[0].fee = null as any;
        okTmnt.potEntries[1].fee = '';
        okTmnt.potEntries[2].fee = undefined as any;
        okTmnt.potEntries[3].fee = '';
        const err = getPotEntriesError(okTmnt);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(okTmnt.potEntries).toHaveLength(0);
      })
      it("returns error when a potEntry has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.potEntries[0].id = "bad_id";
        const err = getPotEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("potEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('potEntries has missing data at index 0');
      });
      it("returns error when a potEntry has an orphaned pot id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.potEntries[1].pot_id = orphanedPotId;
        const err = getPotEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("potEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('potEntries has no parent pot at index 1');
      });
      it("returns error when a potEntry has an orphaned player id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.potEntries[1].player_id = orphanedPlayerId;
        const err = getPotEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("potEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('potEntries has no parent player at index 1');
      });
      it('returns error when a potEntry has invalid fee', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.potEntries[1].fee = '1234567890';
        const err = getPotEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // fee sanitized to 0
        expect(err.errorTable).toBe("potEntries");
        expect(err.errorIndex).toBe(1);
        expect(err.message).toBe('potEntries has missing data at index 1');
      });
      it('returns error when a potEntry is missing player_id', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.potEntries[2].player_id = null as any;
        const err = getPotEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // player_id sanitized to ''
        expect(err.errorTable).toBe("potEntries");
        expect(err.errorIndex).toBe(2);
        expect(err.message).toBe('potEntries has missing data at index 2');
      });
      it('returns error when a parent pots is empty, and potEntries is not empty', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.pots = [];
        const err = getPotEntriesError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("potEntries");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no potEntries parent data');
      })
    });

    describe('getSquadsError', () => {
      it("returns error when squads is empty", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = [];
        const err = getSquadsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("squads");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe("no squads data");
      });
      it("returns no error when all squads are valid", () => {
        const err = getSquadsError(mockTmntFullData);
        expect(err.errorCode).toBe(ErrorCode.None);
      });
      it('returns no error when squad is sanitized', () => { 
        const sanitized = cloneDeep(mockTmntFullData);
        sanitized.squads[0].squad_name = '<script>Sanitized</script>';
        const err = getSquadsError(sanitized);
        expect(err.errorCode).toBe(ErrorCode.None);
        expect(sanitized.squads[0].squad_name).toBe('Sanitized');
      })
      it("returns error when a squad has invalid ID", () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads[0].id = "bad_id";
        const err = getSquadsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData); // id sanitized to ''
        expect(err.errorTable).toBe("squads");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('squads has missing data at index 0');
      });
      it("returns error when a squads has an orphaned event id", () => {        
        const badTmnt = cloneDeep(mockTmntFullData);        
        badTmnt.squads[0].event_id = orphanedEventId;
        const err = getSquadsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("squads");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('squads has no parent event at index 0');
      });
      it('returns error when a squad has invalid games', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads[0].games = 1234567890;
        const err = getSquadsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.InvalidData);
        expect(err.errorTable).toBe("squads");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('squads has invalid data at index 0');
      });
      it('returns error when a squad is missing squad_name', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads[0].squad_name = null as any;
        const err = getSquadsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("squads");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('squads has missing data at index 0');
      });
      it('returns error when squads is null', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = null as any;
        const err = getSquadsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("squads");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no squads data');
      });
      it('returns error when squads is not an array', () => {
        const badTmnt = cloneDeep(mockTmntFullData);
        badTmnt.squads = 'bad' as any;
        const err = getSquadsError(badTmnt);
        expect(err.errorCode).toBe(ErrorCode.MissingData);
        expect(err.errorTable).toBe("squads");
        expect(err.errorIndex).toBe(0);
        expect(err.message).toBe('no squads data');
      })
    });

  });  

  describe('validateFullTmnt', () => {    
    it("returns no error when all data is valid", () => {
      const err = validateFullTmnt(mockTmntFullData);
      expect(err.errorCode).toBe(ErrorCode.None);
    });
    it('returns error when brkts are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.brkts[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("brkts");
    });
    it('returns error when brktsEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.brktEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("brktEntries");
    });
    it('returns error when brktSeeds are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.brktSeeds[0].one_brkt_id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("brktSeeds");
    });
    it('returns error when divs are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.divs[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("divs");
    });
    it('returns error when divEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.divEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("divEntries");
    });
    it('returns error when elims are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.elims[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("elims");
    });
    it('returns error when elimEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.elimEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("elimEntries");
    });
    it('returns error when events are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.events[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("events");
    });
    it('returns error when lanes are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.lanes[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("lanes");
    });
    it('returns error when oneBrkts are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.oneBrkts[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("oneBrkts");
    });
    it('returns error when players are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      const badPlayer = cloneDeep(badTmnt.players[0])
      badPlayer.id = 'test';
      badTmnt.players.push(badPlayer);
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("players");
    });
    it("returns error when pots are invalid", () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.pots[0].id = 'test'      
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("pots");
    });
    it('returns error when potEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.potEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("potEntries");
    });
    it('returns error when squads are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.squads[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("squads");
    });
    it('returns error when passed null', () => { 
      const err = validateFullTmnt(null as any);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("tmntFullData");
    });
    it('returns error when passed undefined', () => {
      const err = validateFullTmnt(undefined as any);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("tmntFullData");
    });
    it('returns error when passed non object', () => {
      const err = validateFullTmnt("test" as any);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("tmntFullData");
    });    
  });  

  describe('validateFullTmntEntries', () => {    
    it("returns no error when all data is valid", () => {
      const err = validateFullTmntEntries(mockTmntFullData);
      expect(err.errorCode).toBe(ErrorCode.None);
    });
    it('returns error when brktsEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.brktEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("brktEntries");
    });
    it('returns error when brktSeeds are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.brktSeeds[0].one_brkt_id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("brktSeeds");
    });
    it('returns error when divEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.divEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("divEntries");
    });
    it('returns error when elimEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.elimEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("elimEntries");
    });
    it('returns error when oneBrkts are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.oneBrkts[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("oneBrkts");
    });
    it('returns error when potEntries are invalid', () => {
      const badTmnt = cloneDeep(mockTmntFullData)
      badTmnt.potEntries[0].id = 'test'
      const err = validateFullTmnt(badTmnt);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("potEntries");
    });
    it('returns error when passed null', () => { 
      const err = validateFullTmntEntries(null as any);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("tmntFullData");
    });
    it('returns error when passed undefined', () => {
      const err = validateFullTmntEntries(undefined as any);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("tmntFullData");
    });
    it('returns error when passed non object', () => {
      const err = validateFullTmntEntries("test" as any);
      expect(err.errorCode).toBe(ErrorCode.MissingData);
      expect(err.errorTable).toBe("tmntFullData");
    });
  });  

});