import { validateFullTmnt } from "@/app/api/tmnts/full/validate";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { ErrorCode } from "@/lib/validation";
import { cloneDeep } from "lodash";

describe("validate tmntFullData", () => { 

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

  // describe('validateFullTmntEntries', () => {    
  //   it("returns no error when all data is valid", () => {
  //     const err = validateFullTmntEntries(mockTmntFullData);
  //     expect(err.errorCode).toBe(ErrorCode.None);
  //   });
  //   it('returns error when brktsEntries are invalid', () => {
  //     const badTmnt = cloneDeep(mockTmntFullData)
  //     badTmnt.brktEntries[0].id = 'test'
  //     const err = validateFullTmnt(badTmnt);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("brktEntries");
  //   });
  //   it('returns error when brktSeeds are invalid', () => {
  //     const badTmnt = cloneDeep(mockTmntFullData)
  //     badTmnt.brktSeeds[0].one_brkt_id = 'test'
  //     const err = validateFullTmnt(badTmnt);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("brktSeeds");
  //   });
  //   it('returns error when divEntries are invalid', () => {
  //     const badTmnt = cloneDeep(mockTmntFullData)
  //     badTmnt.divEntries[0].id = 'test'
  //     const err = validateFullTmnt(badTmnt);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("divEntries");
  //   });
  //   it('returns error when elimEntries are invalid', () => {
  //     const badTmnt = cloneDeep(mockTmntFullData)
  //     badTmnt.elimEntries[0].id = 'test'
  //     const err = validateFullTmnt(badTmnt);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("elimEntries");
  //   });
  //   it('returns error when oneBrkts are invalid', () => {
  //     const badTmnt = cloneDeep(mockTmntFullData)
  //     badTmnt.oneBrkts[0].id = 'test'
  //     const err = validateFullTmnt(badTmnt);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("oneBrkts");
  //   });
  //   it('returns error when potEntries are invalid', () => {
  //     const badTmnt = cloneDeep(mockTmntFullData)
  //     badTmnt.potEntries[0].id = 'test'
  //     const err = validateFullTmnt(badTmnt);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("potEntries");
  //   });
  //   it('returns error when passed null', () => { 
  //     const err = validateFullTmntEntries(null as any);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("tmntFullData");
  //   });
  //   it('returns error when passed undefined', () => {
  //     const err = validateFullTmntEntries(undefined as any);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("tmntFullData");
  //   });
  //   it('returns error when passed non object', () => {
  //     const err = validateFullTmntEntries("test" as any);
  //     expect(err.errorCode).toBe(ErrorCode.MissingData);
  //     expect(err.errorTable).toBe("tmntFullData");
  //   });
  // });  

});