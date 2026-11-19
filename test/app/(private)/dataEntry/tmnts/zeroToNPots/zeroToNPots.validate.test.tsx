// test/app/(private)/dataEntry/tmnts/zeroToNPots/zeroToNPots.validate.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNPots.tsx
// validatePots()
import { cloneDeep } from "lodash";
import { validatePots } from "@/app/(private)/dataEntry/tmntForm/zeroToNPots";
import type { potType, AcdnErrType } from "@/lib/types/types";
import {
  mockTmntFullData,
  divId1,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  maxMoney,
  minFee,
  ptGame,
  ptLastGame,
  ptSeries,
} from "@/lib/validation/constants";
import {
  maxMoneyText,
  minFeeText,
} from "@/components/currency/eaCurrencyInput";
import { getPotName } from "@/lib/getName";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";

// ---------------------------------------------------------------------------
// data and expected messages, built the same way the component builds them
// ---------------------------------------------------------------------------
const divs = mockTmntFullData.divs;

const potId1 = "pot_test_1";
const potId2 = "pot_test_2";
const potId3 = "pot_test_3";

const invalidFeeMsg = "Invalid Fee";
const feeLowMsg = "Fee cannot be less than " + minFeeText;
const feeHighMsg = "Fee cannot be more than " + maxMoneyText;

const acdnErr = (pot: potType, errMsg: string): AcdnErrType => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(getPotName(pot, divs), errMsg),
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** a valid Game pot with no errors; override any field */
const makePot = (overrides: Partial<potType> = {}): potType => ({
  ...cloneDeep(mockTmntFullData.pots[0]),
  id: potId1,
  div_id: divId1,
  pot_type: ptGame,
  fee: String(minFee),
  pot_type_err: "",
  div_err: "",
  fee_err: "",
  errClassName: "",
  ...overrides,
});

/** three valid pots with different ids and pot types */
const makeThreePots = (
  first: Partial<potType> = {},
  second: Partial<potType> = {},
  third: Partial<potType> = {},
): potType[] => [
  makePot({ id: potId1, pot_type: ptGame, ...first }),
  makePot({ id: potId2, pot_type: ptLastGame, ...second }),
  makePot({ id: potId3, pot_type: ptSeries, ...third }),
];

/** runs validatePots and returns what it passed to its setters */
const runValidate = (pots: potType[]) => {
  const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
  const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

  const result = validatePots(pots, setPots, divs, setAcdnErr);

  return {
    result,
    setPots,
    setAcdnErr,
    updated: setPots.mock.calls[0]?.[0] ?? [],
  };
};

// ---------------------------------------------------------------------------

describe("zeroToNPots - validate", () => {
  describe("validatePots()", () => {
    it("returns true, leaves every error blank and clears the accordion error once", () => {
      const { result, updated, setPots, setAcdnErr } = runValidate(makeThreePots());

      expect(result).toBe(true);
      expect(setPots).toHaveBeenCalledTimes(1);
      updated.forEach((pot) => {
        expect(pot.fee_err).toBe("");
        expect(pot.errClassName).toBe("");
      });
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("returns true for the mock pots", () => {
      expect(runValidate(cloneDeep(mockTmntFullData.pots)).result).toBe(true);
    });

    it("returns true for no pots", () => {
      const { result, setAcdnErr } = runValidate([]);

      expect(result).toBe(true);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("clears stale fee errors and red tabs from pots that are now valid", () => {
      const { result, updated } = runValidate(
        makeThreePots(
          { fee_err: "old", errClassName: objErrClassName },
          { errClassName: objErrClassName },
        ),
      );

      expect(result).toBe(true);
      updated.forEach((pot) => {
        expect(pot.fee_err).toBe("");
        expect(pot.errClassName).toBe("");
      });
    });

    it.each([
      ["not a number", "abc", invalidFeeMsg],
      ["Infinity", "Infinity", invalidFeeMsg],
      ["blank, which counts as 0", "", feeLowMsg],
      ["0", "0", feeLowMsg],
      ["below the minimum", (minFee - 0.01).toFixed(2), feeLowMsg],
      ["above the maximum", String(maxMoney + 1), feeHighMsg],
    ])(
      "with a fee that is %s, sets that error, the red tab and the accordion error",
      (_label, fee, msg) => {
        const pot = makePot({ fee });
        const { result, updated, setAcdnErr } = runValidate([pot]);

        expect(result).toBe(false);
        expect(updated[0].fee_err).toBe(msg);
        expect(updated[0].errClassName).toBe(objErrClassName);
        expect(setAcdnErr).toHaveBeenCalledWith(acdnErr(pot, msg));
      },
    );

    it("accepts a fee exactly at the minimum and the maximum", () => {
      const { result, updated } = runValidate(
        makeThreePots({ fee: String(minFee) }, { fee: String(maxMoney) }),
      );

      expect(result).toBe(true);
      expect(updated[0].fee_err).toBe("");
      expect(updated[1].fee_err).toBe("");
    });

    it("names the pot in the accordion error the same way as its tab", () => {
      const pot = makePot({ fee: "0" });

      const { setAcdnErr } = runValidate([pot]);

      // before the fix, this used "<division> - <pot type>", not getPotName
      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg(getPotName(pot, divs), feeLowMsg),
      });
    });

    it("only highlights the pots that have errors", () => {
      const { updated } = runValidate(makeThreePots({}, { fee: "0" }));

      expect(updated[0].errClassName).toBe("");
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(updated[2].errClassName).toBe("");
    });

    it("sets the accordion error from the first invalid pot, once", () => {
      const pots = makeThreePots({}, { fee: "0" }, { fee: String(maxMoney + 1) });

      const { updated, setAcdnErr } = runValidate(pots);

      expect(updated[1].fee_err).toBe(feeLowMsg);
      expect(updated[2].fee_err).toBe(feeHighMsg);
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr(pots[1], feeLowMsg));
    });

    it("does not set or clear the accordion error when the first pot already had an error", () => {
      // this is how the newPotErrMsg check behaves today: if pots[0] had an
      // error before validating, the accordion error is left as it was, even
      // though other pots are invalid
      const { result, updated, setAcdnErr } = runValidate(
        makeThreePots(
          { fee: "0", fee_err: feeLowMsg, errClassName: objErrClassName },
          { fee: String(maxMoney + 1) },
        ),
      );

      expect(result).toBe(false);
      expect(updated[0].fee_err).toBe(feeLowMsg);
      expect(updated[1].fee_err).toBe(feeHighMsg);
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it("only checks the fee: it does not check for duplicate pots", () => {
      // the Create Pot form stops duplicates; validatePots does not look for them
      const { result, updated } = runValidate([
        makePot({ id: potId1 }),
        makePot({ id: potId2 }),
      ]);

      expect(result).toBe(true);
      expect(updated[0].pot_type_err).toBe("");
      expect(updated[1].pot_type_err).toBe("");
    });

    it("keeps every pot, in order, with only its fee error and red tab changed", () => {
      const pots = makeThreePots({}, { fee: "0" });

      const { updated } = runValidate(pots);

      expect(updated.map((p) => p.id)).toEqual([potId1, potId2, potId3]);
      updated.forEach((pot, i) =>
        expect(pot).toEqual({
          ...pots[i],
          fee_err: expect.any(String),
          errClassName: expect.any(String),
        }),
      );
    });

    it("does not change the pots passed in", () => {
      const pots = makeThreePots({ fee: "0" });
      const before = cloneDeep(pots);

      runValidate(pots);

      expect(pots).toEqual(before);
    });

    it.each([
      ["pots", 0],
      ["setPots", 1],
      ["divs", 2],
      ["setAcdnErr", 3],
    ])("returns false without calling anything when %s is missing", (_label, index) => {
      const setPots = jest.fn();
      const setAcdnErr = jest.fn();
      const args: unknown[] = [makeThreePots(), setPots, divs, setAcdnErr];
      args[index] = null;

      // before the fix, a missing pots or setPots threw instead
      const result = (validatePots as (...a: unknown[]) => boolean)(...args);

      expect(result).toBe(false);
      expect(setPots).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
    });
  });
});

