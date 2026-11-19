// test/app/(private)/dataEntry/tmnts/zeroToNBrkts/zeroToNBrkts.validate.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNBrkts.tsx
// validateBrkt() and validateBrkts()
import { cloneDeep } from "lodash";
import {
  exportedForTesting,
  validateBrkts,
} from "@/app/(private)/dataEntry/tmntForm/zeroToNBrkts";
import type { brktType, AcdnErrType } from "@/lib/types/types";
import {
  mockTmntFullData,
  divId1,
  brktId1,
  brktId2,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { maxGames, maxMoney, minFee } from "@/lib/validation/constants";
import { defaultBrktGames } from "@/lib/db/initVals";
import {
  maxMoneyText,
  minFeeText,
} from "@/components/currency/eaCurrencyInput";
import { getBrktOrElimName } from "@/lib/getName";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";

const { validateBrkt } = exportedForTesting;

// ---------------------------------------------------------------------------
// data and expected messages, built the same way the component builds them
// ---------------------------------------------------------------------------
const divs = mockTmntFullData.divs;
const squadGames = mockTmntFullData.squads[0].games;
// same rule the component uses
const maxStartGame = squadGames - (defaultBrktGames - 1);

const divRequiredMsg = "Division is required";
const invalidFeeMsg = "Invalid Fee";
const feeLowMsg = "Fee cannot be less than " + minFeeText;
const feeHighMsg = "Fee cannot be more than " + maxMoneyText;
const startLowMsg = "Start cannot be less than 1";
const startHighMsg = (max: number) => "Start cannot be more than " + max;
const tooFewGamesMsg =
  "Squad needs at least " + defaultBrktGames + " games for a bracket";
const duplicateMsg = "Bracket - Division & Start already exists";

const acdnErr = (brkt: brktType, errMsg: string): AcdnErrType => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(getBrktOrElimName(brkt, divs), errMsg),
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** a valid brkt with no errors; override any field */
const makeBrkt = (overrides: Partial<brktType> = {}): brktType => ({
  ...mockTmntFullData.brkts[0],
  id: brktId1,
  div_id: divId1,
  start: 1,
  fee: String(minFee),
  div_err: "",
  start_err: "",
  fee_err: "",
  errClassName: "",
  ...overrides,
});

/** two valid brkts with different ids and starts */
const makeTwoBrkts = (
  first: Partial<brktType> = {},
  second: Partial<brktType> = {},
): [brktType, brktType] => [
  makeBrkt({ id: brktId1, start: 1, ...first }),
  makeBrkt({ id: brktId2, start: 2, ...second }),
];

/** runs validateBrkts and returns what it passed to its setters */
const runValidate = (brkts: brktType[], games = squadGames) => {
  const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
  const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

  const result = validateBrkts(brkts, setBrkts, divs, games, setAcdnErr);

  return {
    result,
    setBrkts,
    setAcdnErr,
    updated: setBrkts.mock.calls[0]?.[0] ?? [],
  };
};

// ---------------------------------------------------------------------------

describe("zeroToNBrkts - validate", () => {
  describe("validateBrkt() - one bracket", () => {
    it("returns the brkt with every error blank when it is valid", () => {
      const brkt = makeBrkt({ id: "brk_new" });

      const vBrkt = validateBrkt(brkt, [], maxStartGame);

      expect(vBrkt.div_err).toBe("");
      expect(vBrkt.start_err).toBe("");
      expect(vBrkt.fee_err).toBe("");
    });

    it("clears stale errors and keeps every other field", () => {
      const brkt = makeBrkt({
        div_err: "old",
        start_err: "old",
        fee_err: "old",
      });

      const vBrkt = validateBrkt(brkt, [brkt], maxStartGame);

      expect(vBrkt).toEqual({ ...brkt, div_err: "", start_err: "", fee_err: "" });
    });

    it("does not change the brkt passed in", () => {
      const brkt = makeBrkt({ div_id: "" });
      const before = cloneDeep(brkt);

      validateBrkt(brkt, [], maxStartGame);

      expect(brkt).toEqual(before);
    });

    it("sets the division error when no division is picked", () => {
      expect(validateBrkt(makeBrkt({ div_id: "" }), [], maxStartGame).div_err).toBe(
        divRequiredMsg,
      );
    });

    it.each([
      ["not a number", "abc", invalidFeeMsg],
      ["blank, which counts as 0", "", feeLowMsg],
      ["below the minimum", (minFee - 0.01).toFixed(2), feeLowMsg],
      ["above the maximum", String(maxMoney + 1), feeHighMsg],
    ])("sets the right fee error when the fee is %s", (_label, fee, msg) => {
      expect(validateBrkt(makeBrkt({ fee }), [], maxStartGame).fee_err).toBe(msg);
    });

    it("accepts a fee exactly at the minimum and the maximum", () => {
      expect(validateBrkt(makeBrkt({ fee: String(minFee) }), [], maxStartGame).fee_err).toBe("");
      expect(validateBrkt(makeBrkt({ fee: String(maxMoney) }), [], maxStartGame).fee_err).toBe("");
    });

    it.each([
      ["below 1", 0, startLowMsg],
      ["above the last start game", maxStartGame + 1, startHighMsg(maxStartGame)],
    ])("sets the right start error when the start is %s", (_label, start, msg) => {
      expect(validateBrkt(makeBrkt({ start }), [], maxStartGame).start_err).toBe(msg);
    });

    it("accepts a start of 1 and of the last start game", () => {
      expect(validateBrkt(makeBrkt({ start: 1 }), [], maxStartGame).start_err).toBe("");
      expect(
        validateBrkt(makeBrkt({ start: maxStartGame }), [], maxStartGame).start_err,
      ).toBe("");
    });

    it.each([0, -1])(
      "sets the 'too few games' start error when maxStartGame is %s",
      (max) => {
        // before the fix this returned null, and the caller crashed
        const vBrkt = validateBrkt(makeBrkt(), [], max);

        expect(vBrkt).not.toBeNull();
        expect(vBrkt.start_err).toBe(tooFewGamesMsg);
      },
    );

    it("sets the duplicate error when another brkt has the same division and start", () => {
      const existing = makeBrkt({ id: brktId1 });
      const copy = makeBrkt({ id: brktId2 });

      expect(validateBrkt(copy, [existing], maxStartGame).start_err).toBe(duplicateMsg);
    });

    it.each([
      ["a different start", { start: 2 }],
      ["a different division", { div_id: "div_other" }],
    ])("does not set the duplicate error for %s", (_label, change) => {
      const existing = makeBrkt({ id: brktId1 });
      const other = makeBrkt({ id: brktId2, ...change });

      expect(validateBrkt(other, [existing], maxStartGame).start_err).toBe("");
    });

    it("does not count the brkt itself as a duplicate", () => {
      const brkt = makeBrkt();
      expect(validateBrkt(brkt, [brkt], maxStartGame).start_err).toBe("");
    });

    it("only checks for duplicates when there are no other errors", () => {
      const existing = makeBrkt({ id: brktId1 });
      const copy = makeBrkt({ id: brktId2, fee: "0" });

      const vBrkt = validateBrkt(copy, [existing], maxStartGame);

      expect(vBrkt.fee_err).toBe(feeLowMsg);
      expect(vBrkt.start_err).toBe("");
    });

    it("sets every error at once", () => {
      const vBrkt = validateBrkt(
        makeBrkt({ div_id: "", fee: "abc", start: 0 }),
        [],
        maxStartGame,
      );

      expect(vBrkt.div_err).toBe(divRequiredMsg);
      expect(vBrkt.fee_err).toBe(invalidFeeMsg);
      expect(vBrkt.start_err).toBe(startLowMsg);
    });

    it("returns null when brkt or brkts is missing", () => {
      const brkt = makeBrkt();
      expect(validateBrkt(null as any, [], maxStartGame)).toBeNull();
      expect(validateBrkt(undefined as any, [], maxStartGame)).toBeNull();
      expect(validateBrkt(brkt, null as any, maxStartGame)).toBeNull();
      expect(validateBrkt(brkt, undefined as any, maxStartGame)).toBeNull();
    });

    it.each([
      ["null", null],
      ["undefined", undefined],
      ["NaN", NaN],
      ["a string", "abc"],
      ["more than maxGames", maxGames + 1],
    ])("returns null when maxStartGame is %s", (_label, max) => {
      expect(validateBrkt(makeBrkt(), [], max as any)).toBeNull();
    });
  });

  describe("validateBrkts() - all brackets", () => {
    it("returns true, leaves every error blank and clears the accordion error once", () => {
      const { result, updated, setBrkts, setAcdnErr } = runValidate(makeTwoBrkts());

      expect(result).toBe(true);
      expect(setBrkts).toHaveBeenCalledTimes(1);
      updated.forEach((brkt) => {
        expect(brkt.div_err).toBe("");
        expect(brkt.start_err).toBe("");
        expect(brkt.fee_err).toBe("");
        expect(brkt.errClassName).toBe("");
      });
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("returns true for the mock brkts", () => {
      expect(runValidate(cloneDeep(mockTmntFullData.brkts)).result).toBe(true);
    });

    it("returns true for no brkts", () => {
      const { result, setAcdnErr } = runValidate([]);

      expect(result).toBe(true);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("clears stale errors and red tabs from brkts that are now valid", () => {
      const { result, updated } = runValidate(
        makeTwoBrkts(
          { fee_err: "old", start_err: "old", div_err: "old", errClassName: objErrClassName },
          { fee_err: "old", errClassName: objErrClassName },
        ),
      );

      expect(result).toBe(true);
      updated.forEach((brkt) => {
        expect(brkt.fee_err).toBe("");
        expect(brkt.start_err).toBe("");
        expect(brkt.div_err).toBe("");
        expect(brkt.errClassName).toBe("");
      });
    });

    it.each([
      ["no division", { div_id: "" }, "div_err", divRequiredMsg],
      ["a fee below the minimum", { fee: "0" }, "fee_err", feeLowMsg],
      ["a fee above the maximum", { fee: String(maxMoney + 1) }, "fee_err", feeHighMsg],
      ["a start below 1", { start: 0 }, "start_err", startLowMsg],
      [
        "a start above the last start game",
        { start: maxStartGame + 1 },
        "start_err",
        startHighMsg(maxStartGame),
      ],
    ] as const)(
      "with %s, sets that error, the red tab and the accordion error",
      (_label, change, errField, msg) => {
        const brkt = makeBrkt(change);
        const { result, updated, setAcdnErr } = runValidate([brkt]);

        expect(result).toBe(false);
        expect(updated[0][errField]).toBe(msg);
        expect(updated[0].errClassName).toBe(objErrClassName);
        expect(setAcdnErr).toHaveBeenCalledWith(acdnErr(brkt, msg));
      },
    );

    it("sets the duplicate error on both brkts that share a division and start", () => {
      const [first, second] = makeTwoBrkts({}, { start: 1 });

      const { result, updated } = runValidate([first, second]);

      expect(result).toBe(false);
      // unlike duplicate names elsewhere, both brkts get the error
      expect(updated[0].start_err).toBe(duplicateMsg);
      expect(updated[1].start_err).toBe(duplicateMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].errClassName).toBe(objErrClassName);
    });

    it("uses squadGames to work out the last start game", () => {
      // with 4 squad games, a 3-game bracket can start in game 1 or 2
      const games = defaultBrktGames + 1;
      const { updated } = runValidate([makeBrkt({ start: 3 })], games);

      expect(updated[0].start_err).toBe(startHighMsg(2));
    });

    it("sets the 'too few games' error instead of crashing when the squad has too few games", () => {
      const brkt = makeBrkt();
      // before the fix, validateBrkt returned null and this threw
      const { result, updated } = runValidate([brkt], defaultBrktGames - 1);

      expect(result).toBe(false);
      expect(updated[0].start_err).toBe(tooFewGamesMsg);
    });

    it("returns true with no brkts even when the squad has too few games", () => {
      expect(runValidate([], defaultBrktGames - 1).result).toBe(true);
    });

    it("only highlights the brkts that have errors", () => {
      const { updated } = runValidate(makeTwoBrkts({ fee: "0" }, {}));

      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].errClassName).toBe("");
    });

    it("sets the accordion error from the first invalid brkt, once", () => {
      const brkts = [
        makeBrkt({ id: "brk_a", start: 1 }),
        makeBrkt({ id: "brk_b", start: 2, fee: "0" }),
        makeBrkt({ id: "brk_c", start: maxStartGame + 1 }),
      ];

      const { updated, setAcdnErr } = runValidate(brkts);

      expect(updated[1].fee_err).toBe(feeLowMsg);
      expect(updated[2].start_err).toBe(startHighMsg(maxStartGame));
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr(brkts[1], feeLowMsg));
    });

    it("puts the fee error ahead of the start error in the accordion", () => {
      // getBrktErrMsg, used while editing, ranks start ahead of fee instead
      const brkt = makeBrkt({ fee: "0", start: 0 });

      const { setAcdnErr } = runValidate([brkt]);

      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr(brkt, feeLowMsg));
    });

    it("does not set or clear the accordion error when the first brkt already had an error", () => {
      // this is how the newBrktErrMsg check behaves today: if brkts[0] had an
      // error before validating, the accordion error is left as it was, even
      // though other brkts are invalid
      const { result, updated, setAcdnErr } = runValidate(
        makeTwoBrkts(
          { start: 0, start_err: startLowMsg, errClassName: objErrClassName },
          { fee: "0" },
        ),
      );

      expect(result).toBe(false);
      expect(updated[0].start_err).toBe(startLowMsg);
      expect(updated[1].fee_err).toBe(feeLowMsg);
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it("keeps every brkt, in order, with only its error fields changed", () => {
      const brkts = makeTwoBrkts({ fee: "0" }, {});

      const { updated } = runValidate(brkts);

      expect(updated.map((b) => b.id)).toEqual([brktId1, brktId2]);
      updated.forEach((brkt, i) =>
        expect(brkt).toEqual({
          ...brkts[i],
          div_err: expect.any(String),
          start_err: expect.any(String),
          fee_err: expect.any(String),
          errClassName: expect.any(String),
        }),
      );
    });

    it("does not change the brkts passed in", () => {
      const brkts = makeTwoBrkts({ div_id: "" }, {});
      const before = cloneDeep(brkts);

      runValidate(brkts);

      expect(brkts).toEqual(before);
    });

    it.each([
      ["brkts", 0],
      ["setBrkts", 1],
      ["divs", 2],
      ["squadGames", 3],
      ["setAcdnErr", 4],
    ])("returns false without calling anything when %s is missing", (_label, index) => {
      const setBrkts = jest.fn();
      const setAcdnErr = jest.fn();
      const args: unknown[] = [makeTwoBrkts(), setBrkts, divs, squadGames, setAcdnErr];
      args[index] = null;

      const result = (validateBrkts as (...a: unknown[]) => boolean)(...args);

      expect(result).toBe(false);
      expect(setBrkts).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it("returns false without calling anything when there are no divisions", () => {
      const setBrkts = jest.fn();
      const setAcdnErr = jest.fn();

      expect(validateBrkts(makeTwoBrkts(), setBrkts, [], squadGames, setAcdnErr)).toBe(false);
      expect(setBrkts).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it.each([
      ["0", 0],
      ["NaN", NaN],
      ["a string", "abc"],
      ["more than maxGames", maxGames + 1],
    ])("returns false without calling anything when squadGames is %s", (_label, games) => {
      const setBrkts = jest.fn();
      const setAcdnErr = jest.fn();

      expect(
        validateBrkts(makeTwoBrkts(), setBrkts, divs, games as any, setAcdnErr),
      ).toBe(false);
      expect(setBrkts).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
    });
  });
});

// // test/app/(private)/dataEntry/tmnts/zeroToNBrkts/zeroToNBrkts.validate.test.tsx
// // tests for src/app/(private)/dataEntry/tmntForm/zeroToNBrkts.tsx
// import { exportedForTesting, validateBrkts } from "@/app/(private)/dataEntry/tmntForm/zeroToNBrkts";
// import type { brktType, AcdnErrType, divType } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   divId1,
//   brktId1,
//   brktId2,
// } from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { minFee, maxMoney, maxGames } from "@/lib/validation/constants";
// import { defaultBrktGames } from "@/lib/db/initVals";
// import {
//   acdnErrClassName,
//   noAcdnErr,
//   objErrClassName,
// } from "@/app/(private)/dataEntry/tmntForm/errors";
// import { cloneDeep } from "lodash";
// import { btDbUuid } from "@/lib/uuid";
// const { validateBrkt } = exportedForTesting;

// // --- helpers -----------------------

// const baseMockBrkt: brktType = {
//   ...mockTmntFullData.brkts[0],
// };

// const makeBrkt = (overrides: Partial<brktType> = {}): brktType => ({
//   ...baseMockBrkt,
//   ...overrides,
// });

// // same maxStartGame logic used in the component
// const squadGames = mockTmntFullData.squads[0].games;
// const maxStartGame = squadGames - (defaultBrktGames - 1);

// const mockSetBrkts = jest.fn();
// const mockSetAcdnErr = jest.fn();

// describe("zeroToNBrkts - validate", () => {

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('validateBrkt() - ONE bracket', () => { 

//     const mockBrkts = cloneDeep(mockTmntFullData.brkts);

//     it('validate a bracket with empty brackets array', () => { 
//       const vBrkt = validateBrkt(mockBrkts[0], [], 4);
//       expect(vBrkt.div_err).toBe("");
//       expect(vBrkt.start_err).toBe("");
//       expect(vBrkt.fee_err).toBe("");
//     })
//     it('validate a bracket with populated brackets array', () => { 
//       const validBrkt = {
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//         start: 2
//       };
//       const vBrkt = validateBrkt(validBrkt, mockBrkts, 4);
//       expect(vBrkt.div_err).toBe("");
//       expect(vBrkt.start_err).toBe("");
//       expect(vBrkt.fee_err).toBe("");
//     })
//     it('should not validate a brkt with no division', () => { 
//       const invalidBrkt = {
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//       };
//       invalidBrkt.div_id = "";
//       const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
//       expect(vBrkt.div_err).not.toBe("");
//     })
//     it('should not validate a brkt with start game too low', () => { 
//       const invalidBrkt = {
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//       };
//       invalidBrkt.start = 0;
//       const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
//       expect(vBrkt.start_err).not.toBe("");
//     })
//     it('should not validate a brkt with start game too high', () => { 
//       const invalidBrkt = {
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//       };
//       invalidBrkt.start = 5; // more than max games, last param in validateBrkt
//       const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
//       expect(vBrkt.start_err).not.toBe("");
//     })
//     it('should not validate a brkt with no fee', () => { 
//       const invalidBrkt = {
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//         fee: "",
//       };      
//       const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
//       expect(vBrkt.fee_err).not.toBe("");
//     })
//     it('should not validate a brkt with fee as not a number', () => { 
//       const invalidBrkt = {
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//         fee: "abc",
//       };      
//       const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
//       expect(vBrkt.fee_err).not.toBe("");
//     })
//     it('should not validate a brkt with fee too low', () => { 
//       const invalidBrkt = {
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//         fee: "0",
//       };      
//       const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
//       expect(vBrkt.fee_err).not.toBe("");
//     })
//     it('should not validate a brkt with fee too high', () => { 
//       const invalidBrkt = {
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//         fee: "123456789",
//       };            
//       const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
//       expect(vBrkt.fee_err).not.toBe("");
//     })
//     it('should not validate a duplicate brkt', () => { 
//       const duplicateBrkt ={
//         ...mockBrkts[0],
//         id: btDbUuid('brk'),
//       };      
//       const vBrkt = validateBrkt(duplicateBrkt, mockBrkts, 4);
//       expect(vBrkt.start_err).not.toBe("");      
//     })
//     it("returns null when brkt is null/undefined", () => {
//       const result1 = validateBrkt(null as any, mockBrkts, 4) as any;
//       const result2 = validateBrkt(undefined as any, mockBrkts, 4) as any;

//       expect(result1).toBeNull();
//       expect(result2).toBeNull();
//     });
//     it("returns null when brkts array is null/undefined", () => {
//       const brkt = { ...mockBrkts[0], id: btDbUuid("brk") };

//       const result1 = validateBrkt(brkt, null as any, 4) as any;
//       const result2 = validateBrkt(brkt, undefined as any, 4) as any;

//       expect(result1).toBeNull();
//       expect(result2).toBeNull();
//     });
//     it("returns null when maxStartGame is falsy (0 / null / undefined)", () => {
//       const brkt = { ...mockBrkts[0], id: btDbUuid("brk") };

//       const r0 = validateBrkt(brkt, mockBrkts, 0 as any) as any;
//       const rNull = validateBrkt(brkt, mockBrkts, null as any) as any;
//       const rUndef = validateBrkt(brkt, mockBrkts, undefined as any) as any;

//       expect(r0).toBeNull();
//       expect(rNull).toBeNull();
//       expect(rUndef).toBeNull();
//     });
//     it("returns null when maxStartGame is not a valid number (NaN / out of range / wrong type)", () => {
//       const brkt = { ...mockBrkts[0], id: btDbUuid("brk") };

//       const rNaN = validateBrkt(brkt, mockBrkts, NaN as any) as any;
//       const rTooLow = validateBrkt(brkt, mockBrkts, -1 as any) as any;
//       const rTooHigh = validateBrkt(brkt, mockBrkts, (maxGames + 1) as any) as any;
//       const rString = validateBrkt(brkt, mockBrkts, "abc" as any) as any;

//       expect(rNaN).toBeNull();
//       expect(rTooLow).toBeNull();
//       expect(rTooHigh).toBeNull();
//       expect(rString).toBeNull();
//     });

//   })

//   describe('validateBrkts() - MULTIPLE brackets', () => { 

//     const mockBrkts = cloneDeep(mockTmntFullData.brkts);
//     const mockDivs = cloneDeep(mockTmntFullData.divs);

//     it('should validate brackets', () => { 
//       const isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
//       expect(isValid).toBe(true);
//     })
//     it('should validate empty brackets', () => { 
//       const isValid = validateBrkts([] as brktType[], mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
//       expect(isValid).toBe(true);
//     })
//     it('should not validate brackts with null params', () => {
//       let isValid = validateBrkts(null as any, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateBrkts(mockBrkts, null as any, mockDivs, 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateBrkts(mockBrkts, mockSetBrkts, null as any, 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, null as any, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, 6, null as any);
//       expect(isValid).toBe(false);
//     })
//     it('should not validate brackts with empty divs', () => {
//       let isValid = validateBrkts(mockBrkts, mockSetBrkts, [] as divType[], 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//     })
//     it("returns false and does not touch state when maxStartGame is invalid", () => {
//       const setBrkts = jest.fn();
//       const setAcdnErr = jest.fn();
//       const divs = mockDivs; // non-empty so divs.length < 1 isn't the reason

//       // 0 → caught by the first guard (!maxStartGame)
//       let isValid = validateBrkts(mockBrkts, setBrkts, divs, 0 as any, setAcdnErr);
//       expect(isValid).toBe(false);

//       // > maxGames → caught by the second guard
//       isValid = validateBrkts(mockBrkts, setBrkts, divs, (maxGames + 1) as any, setAcdnErr);
//       expect(isValid).toBe(false);

//       // non-number string → second guard (typeof !== "number")
//       isValid = validateBrkts(mockBrkts, setBrkts, divs, "abc" as any, setAcdnErr);
//       expect(isValid).toBe(false);

//       // NaN → second guard (isNaN(maxStartGame))
//       isValid = validateBrkts(mockBrkts, setBrkts, divs, NaN as any, setAcdnErr);
//       expect(isValid).toBe(false);

//       // In all these parameter-invalid cases, we should bail early and not mutate state
//       expect(setBrkts).not.toHaveBeenCalled();
//       expect(setAcdnErr).not.toHaveBeenCalled();
//     });
//     it('should not validate duplicate brackts', () => { 
//       const duplicateBrkts = [
//         {
//           ...mockBrkts[0],
//         }, 
//         {
//           ...mockBrkts[1],
//         },
//         {
//           ...mockBrkts[0],
//           id: btDbUuid('brk'),
//         }      
//       ] 
//       const isValid = validateBrkts(duplicateBrkts, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//     })

//   })  

//   describe('clear and set errors', () => { 
//     it("returns true and clears Acdn error when all brkts are valid", () => {
//       const brkts: brktType[] = [
//         makeBrkt({
//           div_id: divId1,
//           start: 1,
//           fee: minFee.toString(),
//           // stale errors that should be cleared
//           fee_err: "Old fee error",
//           start_err: "Old start error",
//           div_err: "Old div error",
//           errClassName: objErrClassName,
//         }),
//       ];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         maxStartGame,
//         setAcdnErr
//       );

//       expect(result).toBe(true);
//       expect(setBrkts).toHaveBeenCalledTimes(1);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const brkt = updatedBrkts[0];

//       expect(brkt.fee_err).toBe("");
//       expect(brkt.start_err).toBe("");
//       expect(brkt.div_err).toBe("");
//       expect(brkt.errClassName).toBe("");

//       expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//     });
//     it("sets fee_err when fee is less than minFee", () => {
//       const brkts: brktType[] = [
//         makeBrkt({
//           div_id: divId1,
//           start: 1,
//           fee: (minFee - 0.01).toString(),
//         }),
//       ];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         maxStartGame,
//         setAcdnErr
//       );

//       expect(result).toBe(false);
//       expect(setBrkts).toHaveBeenCalledTimes(1);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const v = updatedBrkts[0];

//       expect(v.fee_err).toMatch(/cannot be less than/i);
//       expect(v.start_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Fee cannot be less than"),
//         })
//       );
//     });
//     it("sets fee_err when fee is greater than maxMoney", () => {
//       const brkts: brktType[] = [
//         makeBrkt({
//           div_id: divId1,
//           start: 1,
//           fee: (maxMoney + 0.01).toString(),
//         }),
//       ];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         maxStartGame,
//         setAcdnErr
//       );

//       expect(result).toBe(false);
//       expect(setBrkts).toHaveBeenCalledTimes(1);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const v = updatedBrkts[0];

//       expect(v.fee_err).toMatch(/cannot be more than/i);
//       expect(v.start_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Fee cannot be more than"),
//         })
//       );
//     });
//     it("sets start_err when start is less than 1", () => {
//       const brkts: brktType[] = [
//         makeBrkt({
//           div_id: divId1,
//           start: 0, // too low
//           fee: minFee.toString(),
//         }),
//       ];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         maxStartGame,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const v = updatedBrkts[0];

//       expect(v.start_err).toMatch(/cannot be less than 1/i);
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Start cannot be less than 1"),
//         })
//       );
//     });
//     it("sets start_err when start is greater than maxStartGame", () => {
//       const tooHighStart = maxStartGame + 1;
//       const brkts: brktType[] = [
//         makeBrkt({
//           div_id: divId1,
//           start: tooHighStart,
//           fee: minFee.toString(),
//         }),
//       ];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const v = updatedBrkts[0];

//       expect(v.start_err).toMatch(
//         new RegExp(`cannot be more than ${maxStartGame}`, "i")
//       );
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining(`cannot be more than ${maxStartGame}`),
//         })
//       );
//     });
//     it("sets start_err to duplicate error when another bracket has same div & start", () => {
//       const existing = makeBrkt({
//         id: brktId1,
//         div_id: divId1,
//         start: 1,
//         fee: minFee.toString(),
//       });

//       const duplicate = makeBrkt({
//         id: brktId2,
//         div_id: divId1,
//         start: 1,
//         fee: minFee.toString(),
//       });

//       const brkts: brktType[] = [existing, duplicate];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         maxStartGame,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const v = updatedBrkts.find((b) => b.id === brktId2)!;

//       expect(v.start_err).toMatch(/already exists/i);
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("already exists"),
//         })
//       );
//     });
//     it("clears start_err and fee_err when valid values are used", () => {
//       const brkts: brktType[] = [
//         makeBrkt({
//           div_id: divId1,
//           start: 1,
//           start_err: "Start cannot be less than 1",
//           fee: minFee.toString(),
//           fee_err: "Fee cannot be less than $1",
//           errClassName: objErrClassName,
//         }),
//       ];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         maxStartGame,
//         setAcdnErr
//       );

//       expect(result).toBe(true);
//       expect(setBrkts).toHaveBeenCalledTimes(1);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const v = updatedBrkts[0];

//       expect(v.start_err).toBe("");
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe("");

//       expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//     });
//     it("uses the first invalid bracket to set the accordion error when no new-bracket error exists", () => {
//       // brkts[0] is valid
//       const brkt0 = makeBrkt({
//         div_id: divId1,
//         start: 1,
//         fee: minFee.toString(),
//         // make sure there are no pre-existing errors
//         fee_err: "",
//         start_err: "",
//         div_err: "",
//         errClassName: "",
//       });

//       // brkts[1] has a fee error (too low)
//       const brkt1 = makeBrkt({
//         div_id: divId1,
//         start: 1,
//         fee: (minFee - 0.01).toString(),
//         fee_err: "",
//         start_err: "",
//         div_err: "",
//         errClassName: "",
//       });

//       // brkts[2] has a start error (too high)
//       const tooHighStart = maxStartGame + 1;
//       const brkt2 = makeBrkt({
//         div_id: divId1,
//         start: tooHighStart,
//         fee: minFee.toString(),
//         fee_err: "",
//         start_err: "",
//         div_err: "",
//         errClassName: "",
//       });

//       const brkts: brktType[] = [brkt0, brkt1, brkt2];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         maxStartGame,
//         setAcdnErr
//       );

//       expect(result).toBe(false);
//       expect(setBrkts).toHaveBeenCalledTimes(1);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const v0 = updatedBrkts[0];
//       const v1 = updatedBrkts[1];
//       const v2 = updatedBrkts[2];

//       // First bracket remains valid
//       expect(v0.fee_err).toBe("");
//       expect(v0.start_err).toBe("");
//       expect(v0.div_err).toBe("");

//       // Second bracket: fee error
//       expect(v1.fee_err).toMatch(/cannot be less than/i);
//       expect(v1.errClassName).toBe(objErrClassName);

//       // Third bracket: start error
//       expect(v2.start_err).toMatch(/cannot be more than/i);
//       expect(v2.errClassName).toBe(objErrClassName);

//       // Accordion error should come from the *first* invalid bracket (brkt1, fee error),
//       // not from the later start error.
//       expect(setAcdnErr).toHaveBeenCalledTimes(1);
//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Fee cannot be less than"),
//         })
//       );
//       expect(setAcdnErr).not.toHaveBeenCalledWith(
//         expect.objectContaining({
//           message: expect.stringContaining("Start cannot be more than"),
//         })
//       );
//     });
//     it("does not overwrite an existing new-bracket error in the accordion error", () => {
//       // brkts[0] already has an error *before* calling validateBrkts
//       const brkt0 = makeBrkt({
//         div_id: divId1,
//         start: 0, // invalid, too low
//         fee: minFee.toString(),
//         start_err: "Start cannot be less than 1", // pre-existing error
//         fee_err: "",
//         div_err: "",
//         errClassName: objErrClassName,
//       });

//       // brkts[1] also has an invalid fee (so validation will find more errors),
//       // but we do NOT want accordion error to be reset based on this.
//       const brkt1 = makeBrkt({
//         div_id: divId1,
//         start: 1,
//         fee: (minFee - 0.01).toString(),
//         start_err: "",
//         fee_err: "",
//         div_err: "",
//         errClassName: "",
//       });

//       const brkts: brktType[] = [brkt0, brkt1];

//       const setBrkts = jest.fn() as jest.Mock<void, [brktType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateBrkts(
//         brkts,
//         setBrkts,
//         mockTmntFullData.divs,
//         maxStartGame,
//         setAcdnErr
//       );

//       // Still invalid overall
//       expect(result).toBe(false);
//       expect(setBrkts).toHaveBeenCalledTimes(1);

//       const updatedBrkts = setBrkts.mock.calls[0][0] as brktType[];
//       const v0 = updatedBrkts[0];
//       const v1 = updatedBrkts[1];

//       // v0 remains invalid (start error)
//       expect(v0.start_err).toMatch(/cannot be less than 1/i);

//       // v1 also becomes invalid (fee error)
//       expect(v1.fee_err).toMatch(/cannot be less than/i);

//       // But because newBrktErrMsg was already non-empty for brkts[0],
//       // validateBrkts should NOT set a new accordion error at all.
//       expect(setAcdnErr).not.toHaveBeenCalled();
//     });

//   })

// });


