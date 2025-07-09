import {
  exportedForTesting,
  validSeed,
  sanitizeBrktSeed,
  validateBrktSeed,
  validateBrktSeeds,
  validCompositKey,
} from "@/app/api/brktSeeds/validate";
import { defaultBrktPlayers, initBrktSeed } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/validation";
import { mockBrktSeedsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { cloneDeep } from "lodash";
import { validBrktSeedsType } from "@/lib/types/types";

const { gotBrktSeedData, validBrktSeedData } = exportedForTesting;

const userId = "usr_00000000000000000000000000000000";
const validBrktSeed = {
  ...initBrktSeed,
  one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
  seed: 0,
  player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
};

describe("test for brktSeeds validation", () => {

  describe("gotBrktSeedData function", () => {
    it("should return ErrorCode.None for valid brktSeed", () => {
      const result = gotBrktSeedData(validBrktSeed);
      expect(result).toEqual(ErrorCode.None);
    });
    it("should return ErrorCode.MissingData for missing one_brkt_id", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.one_brkt_id = undefined as any;
      const result = gotBrktSeedData(testBrktSeed);
      expect(result).toEqual(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData for missing player_id", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.player_id = undefined as any;
      const result = gotBrktSeedData(testBrktSeed);
      expect(result).toEqual(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData for missing seed", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.seed = undefined as any;
      const result = gotBrktSeedData(testBrktSeed);
      expect(result).toEqual(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when seed is not a number", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.seed = "test" as any;
      const result = gotBrktSeedData(testBrktSeed);
      expect(result).toEqual(ErrorCode.MissingData);
    });
  });

  describe("validSeed function", () => {
    it("should return true for valid seed", () => {
      expect(validSeed(0)).toEqual(true);
      expect(validSeed(7)).toEqual(true);
    });
    it("should return false for negative seed", () => {
      expect(validSeed(-1)).toEqual(false);
    });
    it("should return false invalid seed", () => {
      expect(validSeed(1.5)).toEqual(false);
      expect(validSeed(defaultBrktPlayers)).toEqual(false);
    });
    it("should return false for non-numbers seed", () => {
      expect(validSeed("not a number" as any)).toEqual(false);
      expect(validSeed(null as any)).toEqual(false);
      expect(validSeed(undefined as any)).toEqual(false);
      expect(validSeed(NaN)).toEqual(false);
    });
  });

  describe('validCompositKey function', () => { 
    const oneBrktId = validBrktSeed.one_brkt_id;
    it('returns true for valid oneBrktId and seed', () => {      
      const seed = 2;
      expect(validCompositKey(oneBrktId, seed)).toBe(true);
    });
    it('returns false for invalid oneBrktId', () => {
      const invalid = 'invalid_id';
      const seed = 2;
      expect(validCompositKey(invalid, seed)).toBe(false);
    });
    it('returns false for valid oneBrktId, but not a one brkt id', () => {      
      const seed = 2;
      expect(validCompositKey(userId, seed)).toBe(false);
    });
    it('returns false for invalid seed', () => {      
      const seed = 'not a number';
      expect(validCompositKey(oneBrktId, seed)).toBe(false);
    });
    it('returns false for non-integer seed', () => {      
      const seed = 3.14;
      expect(validCompositKey(oneBrktId, seed)).toBe(false);
    });
    it('returns false for negative seed', () => {      
      const seed = -1;
      expect(validCompositKey(oneBrktId, seed)).toBe(false);
    });
    it('returns false for seed greater than or equal to defaultBrktPlayers', () => {      
      const seed = defaultBrktPlayers; 
      expect(validCompositKey(oneBrktId, seed)).toBe(false);
    });
    it('returns true for string seed that can be parsed to a valid number', () => {      
      const seed = '2';
      expect(validCompositKey(oneBrktId, seed)).toBe(true);
    });
    it('returns false for non-integer seed as string', () => {      
      const seed = '3.14';
      expect(validCompositKey(oneBrktId, seed)).toBe(false);
    });
    it('returns false for negative seed as string', () => {      
      const seed = '-1';
      expect(validCompositKey(oneBrktId, seed)).toBe(false);
    });
    it('returns false for seed greater than or equal to defaultBrktPlayers as string', () => {      
      const seed = defaultBrktPlayers + ''; 
      expect(validCompositKey(oneBrktId, seed)).toBe(false);
    });
  })

  describe("validBrktSeed function", () => {
    it("should return ErrorCode.None for valid brktSeed", () => {
      expect(validBrktSeedData(validBrktSeed)).toEqual(ErrorCode.None);
    });
    it("should return InvalidData for null brktSeed", () => {
      expect(validBrktSeedData(null as any)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for invalid one_brkt_id", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.one_brkt_id = "test";
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for vaild one_brkt_id, but not a oneBrkt id", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.one_brkt_id = userId;
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for one_brkt_id is blank", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.one_brkt_id = "";
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for missing seed", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.seed = undefined as any;
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for seed not a number", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.seed = "test" as any;
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for seed not an integer", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.seed = 1.5;
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for seed too low", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.seed = -1;
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for seed too high", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.seed = defaultBrktPlayers;
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for invalid player_id", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.player_id = "test";
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for vaild player_id, but not a player id", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.player_id = userId;
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for player_id is blank", () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.player_id = "";
      expect(validBrktSeedData(testBrktSeed)).toEqual(ErrorCode.InvalidData);
    });
  });

  describe('sanitizeBrktSeed function', () => { 
    it('should return valid brktSeed', () => {
      const sanitzied = sanitizeBrktSeed(validBrktSeed);
      expect(sanitzied).toEqual({
        ...initBrktSeed,
        one_brkt_id: validBrktSeed.one_brkt_id,
        seed: validBrktSeed.seed,
        player_id: validBrktSeed.player_id
      });      
    });
    it('should return sanitized brktSeed when one_brkt_id not sanitzied', () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.one_brkt_id = '<script>id</script>';
      const sanitized = sanitizeBrktSeed(testBrktSeed);
      expect(sanitized.one_brkt_id).toEqual('');
    });
    it('should return sanitized brktSeed when seed not sanitzied', () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.seed = Number.MAX_SAFE_INTEGER + 1;
      const sanitized = sanitizeBrktSeed(testBrktSeed);
      expect(sanitized.seed).toBeUndefined();
    });
    it('should return valid brktSeed when player_id not sanitzied', () => {
      const testBrktSeed = cloneDeep(validBrktSeed);
      testBrktSeed.player_id = '<script>id</script>';
      const sanitized = sanitizeBrktSeed(testBrktSeed);
      expect(sanitized.player_id).toEqual('');
    });
  })

  describe('validateBrktSeed function', () => {
    describe('validateBrktSeed function - valid data', () => { 
      it('should return ErrorCode.None for valid brktSeed', () => { 
        expect(validateBrktSeed(validBrktSeed)).toEqual(ErrorCode.None);  
      })      
    })
    describe('validateBrktSeed function - missing data', () => { 
      it('should return Missingdata for null brktSeed', () => { 
        expect(validateBrktSeed(null as any)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for blank one_brkt_id', () => { 
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.one_brkt_id = '';
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for missing one_brkt_id', () => { 
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.one_brkt_id = undefined as any;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for null one_brkt_id', () => { 
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.one_brkt_id = null as any;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for non-number seed', () => { 
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.seed = "test" as any;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for seed undefined', () => { 
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.seed = undefined as any;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for blank player_id', () => { 
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.player_id = '';
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for missing player_id', () => { 
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.player_id = undefined as any;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for null player_id', () => { 
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.player_id = null as any;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.MissingData);
      })
    })
    describe('validateBrktSeed function - missing data', () => { 
      it('should return InvalidData for invalid one_brkt_id', () => {        
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.one_brkt_id = "test";
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData for valid one_brkt_id, but not a one brkt id', () => {        
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.one_brkt_id = userId;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData when seed is not an integer', () => {
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.seed = 1.5;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData when seed is too low', () => {
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.seed = -1;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData when seed is too high', () => {
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.seed = defaultBrktPlayers;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData for invalid player_id', () => {        
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.player_id = "test";
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData for valid player_id, but not a one brkt id', () => {        
        const testBrktSeed = cloneDeep(validBrktSeed);
        testBrktSeed.player_id = userId;
        expect(validateBrktSeed(testBrktSeed)).toEqual(ErrorCode.InvalidData);
      })
    })
  })

  describe('validateBrktSeeds function', () => {
    it('should validate brktSeeds with valid data', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(toValidate.length);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.None);
      for (let i = 0; i < validBrktSeeds.brktSeeds.length; i++) {
        expect(validBrktSeeds.brktSeeds[i].one_brkt_id).toBe(toValidate[i].one_brkt_id);
        expect(validBrktSeeds.brktSeeds[i].seed).toBe(toValidate[i].seed);
        expect(validBrktSeeds.brktSeeds[i].player_id).toBe(toValidate[i].player_id);
      }
    });
    it('should return MissingData when brktSeeds is null', () => {
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(null as any);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(0);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when brktSeeds is empty', () => {
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds([]);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(0);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when brktSeeds is not an array', () => {
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds({} as any);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(0);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with invalid one_brkt_id', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[1].one_brkt_id = "test";
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(1);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with valid one_brkt_id, but not a one_bbrkt_id', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[2].one_brkt_id = userId;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(2);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with blank one_brkt_id', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[3].one_brkt_id = "";
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(3);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with missing one_brkt_id', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[0].one_brkt_id = undefined as any;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(0);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with seed not a number', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[1].seed = "test" as any;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(1);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with seed not an integer', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[2].seed = 1.5;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(2);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with seed too low', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[3].seed = -1;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(3);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with seed tto high', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[0].seed = defaultBrktPlayers;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(0);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with seed is missing', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[1].seed = undefined as any;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(1);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with invalid player_id', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[2].player_id = "test";
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(2);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with valid player_id, but not a player_id', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[3].player_id = userId;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(3);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with blank player_id', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[0].player_id = "";
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(0);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktSeed with missing player_id', () => {
      const toValidate = cloneDeep(mockBrktSeedsToPost);
      toValidate[1].player_id = undefined as any;
      const validBrktSeeds: validBrktSeedsType = validateBrktSeeds(toValidate);
      expect(validBrktSeeds).toBeDefined();
      expect(validBrktSeeds.brktSeeds.length).toBe(1);
      expect(validBrktSeeds.errorCode).toBe(ErrorCode.MissingData);
    });

  })
});
