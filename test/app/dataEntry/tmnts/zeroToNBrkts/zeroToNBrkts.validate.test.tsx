import { exportedForTesting, validateBrkts } from "@/app/dataEntry/tmntForm/zeroToNBrkts";
import type { brktType, AcdnErrType, divType } from "@/lib/types/types";
import {
  mockTmntFullData,
  divId1,
  brktId1,
  brktId2,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { minFee, maxMoney, maxGames } from "@/lib/validation/validation";
import { defaultBrktGames } from "@/lib/db/initVals";
import {
  acdnErrClassName,
  noAcdnErr,
  objErrClassName,
} from "@/app/dataEntry/tmntForm/errors";
import { cloneDeep } from "lodash";
import { btDbUuid } from "@/lib/uuid";
const { validateBrkt } = exportedForTesting;

// --- helpers -----------------------

const baseMockBrkt: brktType = {
  ...mockTmntFullData.brkts[0],
};

const makeBrkt = (overrides: Partial<brktType> = {}): brktType => ({
  ...baseMockBrkt,
  ...overrides,
});

// same maxStartGame logic used in the component
const squadGames = mockTmntFullData.squads[0].games;
const maxStartGame = squadGames - (defaultBrktGames - 1);

const mockSetBrkts = jest.fn();
const mockSetAcdnErr = jest.fn();

describe("zeroToNBrkts - validate", () => {

  describe('validateBrkt() - ONE bracket', () => { 

    const mockBrkts = cloneDeep(mockTmntFullData.brkts);

    it('validate a bracket with empty brackets array', () => { 
      const vBrkt = validateBrkt(mockBrkts[0], [], 4);
      expect(vBrkt.div_err).toBe("");
      expect(vBrkt.start_err).toBe("");
      expect(vBrkt.fee_err).toBe("");
    })
    it('validate a bracket with populated brackets array', () => { 
      const validBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        start: 2
      };
      const vBrkt = validateBrkt(validBrkt, mockBrkts, 4);
      expect(vBrkt.div_err).toBe("");
      expect(vBrkt.start_err).toBe("");
      expect(vBrkt.fee_err).toBe("");
    })
    it('should not validate a brkt with no division', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
      };
      invalidBrkt.div_id = "";
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.div_err).not.toBe("");
    })
    it('should not validate a brkt with start game too low', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
      };
      invalidBrkt.start = 0;
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.start_err).not.toBe("");
    })
    it('should not validate a brkt with start game too high', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
      };
      invalidBrkt.start = 5; // more than max games, last param in validateBrkt
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.start_err).not.toBe("");
    })
    it('should not validate a brkt with no fee', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        fee: "",
      };      
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.fee_err).not.toBe("");
    })
    it('should not validate a brkt with fee as not a number', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        fee: "abc",
      };      
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.fee_err).not.toBe("");
    })
    it('should not validate a brkt with fee too low', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        fee: "0",
      };      
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.fee_err).not.toBe("");
    })
    it('should not validate a brkt with fee too high', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        fee: "123456789",
      };            
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.fee_err).not.toBe("");
    })
    it('should not validate a duplicate brkt', () => { 
      const duplicateBrkt ={
        ...mockBrkts[0],
        id: btDbUuid('brk'),
      };      
      const vBrkt = validateBrkt(duplicateBrkt, mockBrkts, 4);
      expect(vBrkt.start_err).not.toBe("");      
    })
    it("returns null when brkt is null/undefined", () => {
      const result1 = validateBrkt(null as any, mockBrkts, 4) as any;
      const result2 = validateBrkt(undefined as any, mockBrkts, 4) as any;

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
    it("returns null when brkts array is null/undefined", () => {
      const brkt = { ...mockBrkts[0], id: btDbUuid("brk") };

      const result1 = validateBrkt(brkt, null as any, 4) as any;
      const result2 = validateBrkt(brkt, undefined as any, 4) as any;

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
    it("returns null when maxStartGame is falsy (0 / null / undefined)", () => {
      const brkt = { ...mockBrkts[0], id: btDbUuid("brk") };

      const r0 = validateBrkt(brkt, mockBrkts, 0 as any) as any;
      const rNull = validateBrkt(brkt, mockBrkts, null as any) as any;
      const rUndef = validateBrkt(brkt, mockBrkts, undefined as any) as any;

      expect(r0).toBeNull();
      expect(rNull).toBeNull();
      expect(rUndef).toBeNull();
    });
    it("returns null when maxStartGame is not a valid number (NaN / out of range / wrong type)", () => {
      const brkt = { ...mockBrkts[0], id: btDbUuid("brk") };

      const rNaN = validateBrkt(brkt, mockBrkts, NaN as any) as any;
      const rTooLow = validateBrkt(brkt, mockBrkts, -1 as any) as any;
      const rTooHigh = validateBrkt(brkt, mockBrkts, (maxGames + 1) as any) as any;
      const rString = validateBrkt(brkt, mockBrkts, "abc" as any) as any;

      expect(rNaN).toBeNull();
      expect(rTooLow).toBeNull();
      expect(rTooHigh).toBeNull();
      expect(rString).toBeNull();
    });

  })

  describe('validateBrkts() - MULTIPLE brackets', () => { 

    const mockBrkts = cloneDeep(mockTmntFullData.brkts);
    const mockDivs = cloneDeep(mockTmntFullData.divs);

    it('should validate brackets', () => { 
      const isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(true);
    })
    it('should validate empty brackets', () => { 
      const isValid = validateBrkts([] as brktType[], mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(true);
    })
    it('should not validate brackts with null params', () => {
      let isValid = validateBrkts(null as any, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, null as any, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, mockSetBrkts, null as any, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, null as any, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, 6, null as any);
      expect(isValid).toBe(false);
    })
    it('should not validate brackts with empty divs', () => {
      let isValid = validateBrkts(mockBrkts, mockSetBrkts, [] as divType[], 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
    })
    it("returns false and does not touch state when maxStartGame is invalid", () => {
      const setBrkts = jest.fn();
      const setAcdnErr = jest.fn();
      const divs = mockDivs; // non-empty so divs.length < 1 isn't the reason

      // 0 → caught by the first guard (!maxStartGame)
      let isValid = validateBrkts(mockBrkts, setBrkts, divs, 0 as any, setAcdnErr);
      expect(isValid).toBe(false);

      // > maxGames → caught by the second guard
      isValid = validateBrkts(mockBrkts, setBrkts, divs, (maxGames + 1) as any, setAcdnErr);
      expect(isValid).toBe(false);

      // non-number string → second guard (typeof !== "number")
      isValid = validateBrkts(mockBrkts, setBrkts, divs, "abc" as any, setAcdnErr);
      expect(isValid).toBe(false);

      // NaN → second guard (isNaN(maxStartGame))
      isValid = validateBrkts(mockBrkts, setBrkts, divs, NaN as any, setAcdnErr);
      expect(isValid).toBe(false);

      // In all these parameter-invalid cases, we should bail early and not mutate state
      expect(setBrkts).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
    });
    it('should not validate duplicate brackts', () => { 
      const duplicateBrkts = [
        {
          ...mockBrkts[0],
        }, 
        {
          ...mockBrkts[1],
        },
        {
          ...mockBrkts[0],
          id: btDbUuid('brk'),
        }      
      ] 
      const isValid = validateBrkts(duplicateBrkts, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
    })

  })  

  describe('clear and set errors', () => { 
    it("returns true and clears Acdn error when all brkts are valid", () => {
      const brkts: brktType[] = [
        makeBrkt({
          div_id: divId1,
          start: 1,
          fee: minFee.toString(),
          // stale errors that should be cleared
          fee_err: "Old fee error",
          start_err: "Old start error",
          div_err: "Old div error",
          errClassName: objErrClassName,
        }),
      ];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        maxStartGame,
        setAcdnErr
      );

      expect(result).toBe(true);
      expect(setBrkts).toHaveBeenCalledTimes(1);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const brkt = updatedBrkts[0];

      expect(brkt.fee_err).toBe("");
      expect(brkt.start_err).toBe("");
      expect(brkt.div_err).toBe("");
      expect(brkt.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });
    it("sets fee_err when fee is less than minFee", () => {
      const brkts: brktType[] = [
        makeBrkt({
          div_id: divId1,
          start: 1,
          fee: (minFee - 0.01).toString(),
        }),
      ];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        maxStartGame,
        setAcdnErr
      );

      expect(result).toBe(false);
      expect(setBrkts).toHaveBeenCalledTimes(1);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const v = updatedBrkts[0];

      expect(v.fee_err).toMatch(/cannot be less than/i);
      expect(v.start_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Fee cannot be less than"),
        })
      );
    });
    it("sets fee_err when fee is greater than maxMoney", () => {
      const brkts: brktType[] = [
        makeBrkt({
          div_id: divId1,
          start: 1,
          fee: (maxMoney + 0.01).toString(),
        }),
      ];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        maxStartGame,
        setAcdnErr
      );

      expect(result).toBe(false);
      expect(setBrkts).toHaveBeenCalledTimes(1);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const v = updatedBrkts[0];

      expect(v.fee_err).toMatch(/cannot be more than/i);
      expect(v.start_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Fee cannot be more than"),
        })
      );
    });
    it("sets start_err when start is less than 1", () => {
      const brkts: brktType[] = [
        makeBrkt({
          div_id: divId1,
          start: 0, // too low
          fee: minFee.toString(),
        }),
      ];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        maxStartGame,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const v = updatedBrkts[0];

      expect(v.start_err).toMatch(/cannot be less than 1/i);
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Start cannot be less than 1"),
        })
      );
    });
    it("sets start_err when start is greater than maxStartGame", () => {
      const tooHighStart = maxStartGame + 1;
      const brkts: brktType[] = [
        makeBrkt({
          div_id: divId1,
          start: tooHighStart,
          fee: minFee.toString(),
        }),
      ];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const v = updatedBrkts[0];

      expect(v.start_err).toMatch(
        new RegExp(`cannot be more than ${maxStartGame}`, "i")
      );
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining(`cannot be more than ${maxStartGame}`),
        })
      );
    });
    it("sets start_err to duplicate error when another bracket has same div & start", () => {
      const existing = makeBrkt({
        id: brktId1,
        div_id: divId1,
        start: 1,
        fee: minFee.toString(),
      });

      const duplicate = makeBrkt({
        id: brktId2,
        div_id: divId1,
        start: 1,
        fee: minFee.toString(),
      });

      const brkts: brktType[] = [existing, duplicate];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        maxStartGame,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const v = updatedBrkts.find((b) => b.id === brktId2)!;

      expect(v.start_err).toMatch(/already exists/i);
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("already exists"),
        })
      );
    });
    it("clears start_err and fee_err when valid values are used", () => {
      const brkts: brktType[] = [
        makeBrkt({
          div_id: divId1,
          start: 1,
          start_err: "Start cannot be less than 1",
          fee: minFee.toString(),
          fee_err: "Fee cannot be less than $1",
          errClassName: objErrClassName,
        }),
      ];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        maxStartGame,
        setAcdnErr
      );

      expect(result).toBe(true);
      expect(setBrkts).toHaveBeenCalledTimes(1);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const v = updatedBrkts[0];

      expect(v.start_err).toBe("");
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });
    it("uses the first invalid bracket to set the accordion error when no new-bracket error exists", () => {
      // brkts[0] is valid
      const brkt0 = makeBrkt({
        div_id: divId1,
        start: 1,
        fee: minFee.toString(),
        // make sure there are no pre-existing errors
        fee_err: "",
        start_err: "",
        div_err: "",
        errClassName: "",
      });

      // brkts[1] has a fee error (too low)
      const brkt1 = makeBrkt({
        div_id: divId1,
        start: 1,
        fee: (minFee - 0.01).toString(),
        fee_err: "",
        start_err: "",
        div_err: "",
        errClassName: "",
      });

      // brkts[2] has a start error (too high)
      const tooHighStart = maxStartGame + 1;
      const brkt2 = makeBrkt({
        div_id: divId1,
        start: tooHighStart,
        fee: minFee.toString(),
        fee_err: "",
        start_err: "",
        div_err: "",
        errClassName: "",
      });

      const brkts: brktType[] = [brkt0, brkt1, brkt2];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        maxStartGame,
        setAcdnErr
      );

      expect(result).toBe(false);
      expect(setBrkts).toHaveBeenCalledTimes(1);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const v0 = updatedBrkts[0];
      const v1 = updatedBrkts[1];
      const v2 = updatedBrkts[2];

      // First bracket remains valid
      expect(v0.fee_err).toBe("");
      expect(v0.start_err).toBe("");
      expect(v0.div_err).toBe("");

      // Second bracket: fee error
      expect(v1.fee_err).toMatch(/cannot be less than/i);
      expect(v1.errClassName).toBe(objErrClassName);

      // Third bracket: start error
      expect(v2.start_err).toMatch(/cannot be more than/i);
      expect(v2.errClassName).toBe(objErrClassName);

      // Accordion error should come from the *first* invalid bracket (brkt1, fee error),
      // not from the later start error.
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Fee cannot be less than"),
        })
      );
      expect(setAcdnErr).not.toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Start cannot be more than"),
        })
      );
    });
    it("does not overwrite an existing new-bracket error in the accordion error", () => {
      // brkts[0] already has an error *before* calling validateBrkts
      const brkt0 = makeBrkt({
        div_id: divId1,
        start: 0, // invalid, too low
        fee: minFee.toString(),
        start_err: "Start cannot be less than 1", // pre-existing error
        fee_err: "",
        div_err: "",
        errClassName: objErrClassName,
      });

      // brkts[1] also has an invalid fee (so validation will find more errors),
      // but we do NOT want accordion error to be reset based on this.
      const brkt1 = makeBrkt({
        div_id: divId1,
        start: 1,
        fee: (minFee - 0.01).toString(),
        start_err: "",
        fee_err: "",
        div_err: "",
        errClassName: "",
      });

      const brkts: brktType[] = [brkt0, brkt1];

      const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateBrkts(
        brkts,
        setBrkts,
        mockTmntFullData.divs,
        maxStartGame,
        setAcdnErr
      );

      // Still invalid overall
      expect(result).toBe(false);
      expect(setBrkts).toHaveBeenCalledTimes(1);

      const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
      const v0 = updatedBrkts[0];
      const v1 = updatedBrkts[1];

      // v0 remains invalid (start error)
      expect(v0.start_err).toMatch(/cannot be less than 1/i);

      // v1 also becomes invalid (fee error)
      expect(v1.fee_err).toMatch(/cannot be less than/i);

      // But because newBrktErrMsg was already non-empty for brkts[0],
      // validateBrkts should NOT set a new accordion error at all.
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

  })

});
