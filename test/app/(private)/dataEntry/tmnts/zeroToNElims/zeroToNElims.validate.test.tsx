// test/app/(private)/dataEntry/tmnts/zeroToNElims/zeroToNElims.validate.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNElims.tsx
// validateElim() and validateElims()
import { cloneDeep } from "lodash";
import {
  exportedForTesting,
  validateElims,
} from "@/app/(private)/dataEntry/tmntForm/zeroToNElims";
import type { elimType, AcdnErrType } from "@/lib/types/types";
import {
  mockTmntFullData,
  divId1,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { maxGames, maxMoney, minFee } from "@/lib/validation/constants";
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

const { validateElim } = exportedForTesting;

// ---------------------------------------------------------------------------
// data and expected messages, built the same way the component builds them
// ---------------------------------------------------------------------------
const divs = mockTmntFullData.divs;
const squadGames = mockTmntFullData.squads[0].games;
const otherDivId = divs.find((d) => d.id !== divId1)!.id;

const elimId1 = "elm_test_1";
const elimId2 = "elm_test_2";
const elimId3 = "elm_test_3";

const divRequiredMsg = "Division is required";
const invalidFeeMsg = "Invalid Fee";
const feeLowMsg = "Fee cannot be less than " + minFeeText;
const feeHighMsg = "Fee cannot be more than " + maxMoneyText;
const startLowMsg = "Start cannot be less than 1";
const startHighMsg = (max: number) => "Start cannot be more than " + max;
const gamesLowMsg = "Games cannot be less than 1";
const gamesHighMsg = (max: number) => "Games cannot be more than " + max;
const endsAfterMsg = "Eliminator ends after last game";
const duplicateMsg = "Eliminator - Division, Start & Games already exists";

const acdnErr = (elim: elimType, errMsg: string): AcdnErrType => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(getBrktOrElimName(elim, divs), errMsg),
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** a valid elim (start 1, 3 games) with no errors; override any field */
const makeElim = (overrides: Partial<elimType> = {}): elimType => ({
  ...mockTmntFullData.elims[0],
  id: elimId1,
  div_id: divId1,
  start: 1,
  games: 3,
  fee: String(minFee),
  div_err: "",
  start_err: "",
  fee_err: "",
  games_err: "",
  errClassName: "",
  ...overrides,
});

/** two valid elims with different ids and starts */
const makeTwoElims = (
  first: Partial<elimType> = {},
  second: Partial<elimType> = {},
): [elimType, elimType] => [
  makeElim({ id: elimId1, start: 1, ...first }),
  makeElim({ id: elimId2, start: 2, ...second }),
];

/** runs validateElims and returns what it passed to its setters */
const runValidate = (elims: elimType[], games = squadGames) => {
  const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
  const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

  const result = validateElims(elims, setElims, divs, games, setAcdnErr);

  return {
    result,
    setElims,
    setAcdnErr,
    updated: setElims.mock.calls[0]?.[0] ?? [],
  };
};

// ---------------------------------------------------------------------------

describe("zeroToNElims - validate", () => {
  describe("validateElim() - one eliminator", () => {
    it("returns the elim with every error blank when it is valid", () => {
      const vElim = validateElim(makeElim(), [], squadGames);

      expect(vElim.div_err).toBe("");
      expect(vElim.fee_err).toBe("");
      expect(vElim.start_err).toBe("");
      expect(vElim.games_err).toBe("");
    });

    it("returns every mock elim with no errors", () => {
      const elims = cloneDeep(mockTmntFullData.elims);
      elims.forEach((elim) => {
        const vElim = validateElim(elim, elims, squadGames);
        expect([vElim.div_err, vElim.fee_err, vElim.start_err, vElim.games_err]).toEqual([
          "",
          "",
          "",
          "",
        ]);
      });
    });

    it("clears stale errors and keeps every other field", () => {
      const elim = makeElim({
        div_err: "old",
        start_err: "old",
        fee_err: "old",
        games_err: "old",
      });

      const vElim = validateElim(elim, [elim], squadGames);

      expect(vElim).toEqual({
        ...elim,
        div_err: "",
        start_err: "",
        fee_err: "",
        games_err: "",
      });
    });

    it("does not change the elim passed in", () => {
      const elim = makeElim({ div_id: "", start: 0 });
      const before = cloneDeep(elim);

      validateElim(elim, [], squadGames);

      expect(elim).toEqual(before);
    });

    it("sets the division error when no division is picked", () => {
      expect(validateElim(makeElim({ div_id: "" }), [], squadGames).div_err).toBe(
        divRequiredMsg,
      );
    });

    it.each([
      ["not a number", "abc", invalidFeeMsg],
      ["blank, which counts as 0", "", feeLowMsg],
      ["below the minimum", (minFee - 0.01).toFixed(2), feeLowMsg],
      ["above the maximum", String(maxMoney + 1), feeHighMsg],
    ])("sets the right fee error when the fee is %s", (_label, fee, msg) => {
      expect(validateElim(makeElim({ fee }), [], squadGames).fee_err).toBe(msg);
    });

    it("accepts a fee exactly at the minimum and the maximum", () => {
      expect(validateElim(makeElim({ fee: String(minFee) }), [], squadGames).fee_err).toBe("");
      expect(validateElim(makeElim({ fee: String(maxMoney) }), [], squadGames).fee_err).toBe("");
    });

    it.each([
      ["below 1", 0, startLowMsg],
      ["missing", null, startLowMsg],
      ["after the last game", squadGames + 1, startHighMsg(squadGames)],
    ])("sets the right start error when the start is %s", (_label, start, msg) => {
      const vElim = validateElim(makeElim({ start: start as any, games: 1 }), [], squadGames);

      expect(vElim.start_err).toBe(msg);
      expect(vElim.games_err).toBe("");
    });

    it.each([
      ["below 1", 0, gamesLowMsg],
      ["missing", null, gamesLowMsg],
      ["more than the squad has", squadGames + 1, gamesHighMsg(squadGames)],
    ])("sets the right games error when the games are %s", (_label, games, msg) => {
      const vElim = validateElim(makeElim({ start: 1, games: games as any }), [], squadGames);

      expect(vElim.games_err).toBe(msg);
      // before the fix, too many games also put "ends after last game" on start
      expect(vElim.start_err).toBe("");
    });

    it("shows the start error, not 'ends after last game', when the start itself is too high", () => {
      // before the fix, "ends after last game" replaced this message
      const vElim = validateElim(makeElim({ start: squadGames + 1, games: 3 }), [], squadGames);

      expect(vElim.start_err).toBe(startHighMsg(squadGames));
    });

    it("sets 'ends after last game' on start when start and games are each fine but run past the last game", () => {
      const vElim = validateElim(
        makeElim({ start: squadGames - 1, games: 3 }),
        [],
        squadGames,
      );

      expect(vElim.start_err).toBe(endsAfterMsg);
      expect(vElim.games_err).toBe("");
    });

    it.each([
      ["start 1, every game", 1, squadGames],
      ["the last 3 games", squadGames - 2, 3],
      ["only the last game", squadGames, 1],
    ])("accepts an elim that ends on the last game: %s", (_label, start, games) => {
      const vElim = validateElim(makeElim({ start, games }), [], squadGames);

      expect(vElim.start_err).toBe("");
      expect(vElim.games_err).toBe("");
    });

    it("sets the duplicate error when another elim has the same division, start and games", () => {
      const existing = makeElim({ id: elimId1 });
      const copy = makeElim({ id: elimId2 });

      expect(validateElim(copy, [existing], squadGames).start_err).toBe(duplicateMsg);
    });

    it.each([
      ["a different division", { div_id: otherDivId }],
      ["a different start", { start: 2 }],
      ["a different number of games", { games: 4 }],
    ])("does not set the duplicate error for %s", (_label, change) => {
      const existing = makeElim({ id: elimId1 });
      const other = makeElim({ id: elimId2, ...change });

      expect(validateElim(other, [existing], squadGames).start_err).toBe("");
    });

    it("does not count the elim itself as a duplicate", () => {
      const elim = makeElim();
      expect(validateElim(elim, [elim], squadGames).start_err).toBe("");
    });

    it("only checks for duplicates when there are no other errors", () => {
      const existing = makeElim({ id: elimId1 });
      const copy = makeElim({ id: elimId2, fee: "0" });

      const vElim = validateElim(copy, [existing], squadGames);

      expect(vElim.fee_err).toBe(feeLowMsg);
      expect(vElim.start_err).toBe("");
    });

    it("sets every error at once", () => {
      const vElim = validateElim(
        makeElim({ div_id: "", fee: "abc", start: 0, games: 0 }),
        [],
        squadGames,
      );

      expect(vElim.div_err).toBe(divRequiredMsg);
      expect(vElim.fee_err).toBe(invalidFeeMsg);
      expect(vElim.start_err).toBe(startLowMsg);
      expect(vElim.games_err).toBe(gamesLowMsg);
    });

    it("returns null when elim or elims is missing", () => {
      const elim = makeElim();
      expect(validateElim(null as any, [], squadGames)).toBeNull();
      expect(validateElim(undefined as any, [], squadGames)).toBeNull();
      expect(validateElim(elim, null as any, squadGames)).toBeNull();
      expect(validateElim(elim, undefined as any, squadGames)).toBeNull();
    });

    it.each([
      ["null", null],
      ["undefined", undefined],
      ["0", 0],
      ["NaN", NaN],
      ["a string", "abc"],
      ["not a whole number", 5.5],
      ["more than maxGames", maxGames + 1],
    ])("returns null when squadGames is %s", (_label, games) => {
      expect(validateElim(makeElim(), [], games as any)).toBeNull();
    });
  });

  describe("validateElims() - all eliminators", () => {
    it("returns true, leaves every error blank and clears the accordion error once", () => {
      const { result, updated, setElims, setAcdnErr } = runValidate(makeTwoElims());

      expect(result).toBe(true);
      expect(setElims).toHaveBeenCalledTimes(1);
      updated.forEach((elim) => {
        expect(elim.div_err).toBe("");
        expect(elim.fee_err).toBe("");
        expect(elim.start_err).toBe("");
        expect(elim.games_err).toBe("");
        expect(elim.errClassName).toBe("");
      });
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("returns true for the mock elims", () => {
      expect(runValidate(cloneDeep(mockTmntFullData.elims)).result).toBe(true);
    });

    it("returns true for no elims", () => {
      const { result, setAcdnErr } = runValidate([]);

      expect(result).toBe(true);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("clears stale errors and red tabs from elims that are now valid", () => {
      const { result, updated } = runValidate(
        makeTwoElims(
          {
            div_err: "old",
            fee_err: "old",
            start_err: "old",
            games_err: "old",
            errClassName: objErrClassName,
          },
          { games_err: "old", errClassName: objErrClassName },
        ),
      );

      expect(result).toBe(true);
      updated.forEach((elim) => {
        expect(elim.div_err).toBe("");
        expect(elim.fee_err).toBe("");
        expect(elim.start_err).toBe("");
        expect(elim.games_err).toBe("");
        expect(elim.errClassName).toBe("");
      });
    });

    it.each([
      ["no division", { div_id: "" }, "div_err", divRequiredMsg],
      ["a fee below the minimum", { fee: "0" }, "fee_err", feeLowMsg],
      ["a fee above the maximum", { fee: String(maxMoney + 1) }, "fee_err", feeHighMsg],
      ["a start below 1", { start: 0 }, "start_err", startLowMsg],
      [
        "a start after the last game",
        { start: squadGames + 1, games: 1 },
        "start_err",
        startHighMsg(squadGames),
      ],
      ["games below 1", { games: 0 }, "games_err", gamesLowMsg],
      [
        "more games than the squad has",
        { games: squadGames + 1 },
        "games_err",
        gamesHighMsg(squadGames),
      ],
      [
        "games that run past the last game",
        { start: squadGames - 1, games: 3 },
        "start_err",
        endsAfterMsg,
      ],
    ] as const)(
      "with %s, sets only that error, the red tab and the accordion error",
      (_label, change, errField, msg) => {
        const elim = makeElim(change);
        const { result, updated, setAcdnErr } = runValidate([elim]);

        expect(result).toBe(false);
        const errFields = ["div_err", "fee_err", "start_err", "games_err"] as const;
        errFields.forEach((field) =>
          expect(updated[0][field]).toBe(field === errField ? msg : ""),
        );
        expect(updated[0].errClassName).toBe(objErrClassName);
        expect(setAcdnErr).toHaveBeenCalledWith(acdnErr(elim, msg));
      },
    );

    it("sets the duplicate error on both elims that share a division, start and games", () => {
      const [first, second] = makeTwoElims({}, { start: 1 });

      const { result, updated } = runValidate([first, second]);

      expect(result).toBe(false);
      // like brackets, both elims get the error
      expect(updated[0].start_err).toBe(duplicateMsg);
      expect(updated[1].start_err).toBe(duplicateMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].errClassName).toBe(objErrClassName);
    });

    it("uses squadGames to decide when an elim ends after the last game", () => {
      // start 2 with 3 games ends on game 4: fine with 6 games, too late with 3
      const elim = makeElim({ start: 2, games: 3 });

      expect(runValidate([elim]).updated[0].start_err).toBe("");
      expect(runValidate([elim], 4).updated[0].start_err).toBe("");
      expect(runValidate([elim], 3).updated[0].start_err).toBe(endsAfterMsg);
    });

    it("sets the games error on an existing elim when the squad's games go down", () => {
      // a 6 game elim, after the squad is changed to 4 games
      const { result, updated } = runValidate([makeElim({ start: 1, games: 6 })], 4);

      expect(result).toBe(false);
      expect(updated[0].games_err).toBe(gamesHighMsg(4));
      expect(updated[0].start_err).toBe("");
    });

    it("only highlights the elims that have errors", () => {
      const { updated } = runValidate(makeTwoElims({ fee: "0" }, {}));

      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].errClassName).toBe("");
    });

    it("sets the accordion error from the first invalid elim, once", () => {
      const elims = [
        makeElim({ id: elimId1, start: 1 }),
        makeElim({ id: elimId2, start: 2, fee: "0" }),
        makeElim({ id: elimId3, start: 3, games: 0 }),
      ];

      const { updated, setAcdnErr } = runValidate(elims);

      expect(updated[1].fee_err).toBe(feeLowMsg);
      expect(updated[2].games_err).toBe(gamesLowMsg);
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr(elims[1], feeLowMsg));
    });

    it("puts the fee error ahead of the start error in the accordion", () => {
      // getElimErrMsg, used while editing, ranks start ahead of fee instead
      const elim = makeElim({ fee: "0", start: 0 });

      const { setAcdnErr } = runValidate([elim]);

      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr(elim, feeLowMsg));
    });

    it("does not set or clear the accordion error when the first elim already had an error", () => {
      // this is how the newElimErrMsg check behaves today: if elims[0] had an
      // error before validating, the accordion error is left as it was, even
      // though other elims are invalid
      const { result, updated, setAcdnErr } = runValidate(
        makeTwoElims(
          { start: 0, start_err: startLowMsg, errClassName: objErrClassName },
          { fee: "0" },
        ),
      );

      expect(result).toBe(false);
      expect(updated[0].start_err).toBe(startLowMsg);
      expect(updated[1].fee_err).toBe(feeLowMsg);
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it("keeps every elim, in order, with only its error fields changed", () => {
      const elims = makeTwoElims({ fee: "0" }, {});

      const { updated } = runValidate(elims);

      expect(updated.map((e) => e.id)).toEqual([elimId1, elimId2]);
      updated.forEach((elim, i) =>
        expect(elim).toEqual({
          ...elims[i],
          div_err: expect.any(String),
          fee_err: expect.any(String),
          start_err: expect.any(String),
          games_err: expect.any(String),
          errClassName: expect.any(String),
        }),
      );
    });

    it("does not change the elims passed in", () => {
      const elims = makeTwoElims({ div_id: "" }, {});
      const before = cloneDeep(elims);

      runValidate(elims);

      expect(elims).toEqual(before);
    });

    it.each([
      ["elims", 0],
      ["setElims", 1],
      ["divs", 2],
      ["squadGames", 3],
      ["setAcdnErr", 4],
    ])("returns false without calling anything when %s is missing", (_label, index) => {
      const setElims = jest.fn();
      const setAcdnErr = jest.fn();
      const args: unknown[] = [makeTwoElims(), setElims, divs, squadGames, setAcdnErr];
      args[index] = null;

      const result = (validateElims as (...a: unknown[]) => boolean)(...args);

      expect(result).toBe(false);
      expect(setElims).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it("returns false without calling anything when there are no divisions", () => {
      const setElims = jest.fn();
      const setAcdnErr = jest.fn();

      expect(validateElims(makeTwoElims(), setElims, [], squadGames, setAcdnErr)).toBe(false);
      expect(setElims).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it.each([
      ["0", 0],
      ["NaN", NaN],
      ["a string", "abc"],
      ["not a whole number", 5.5],
      ["more than maxGames", maxGames + 1],
    ])("returns false without calling anything when squadGames is %s", (_label, games) => {
      const setElims = jest.fn();
      const setAcdnErr = jest.fn();

      // before the fix, 5.5 passed this guard and validateElim's null crashed it
      expect(
        validateElims(makeTwoElims(), setElims, divs, games as any, setAcdnErr),
      ).toBe(false);
      expect(setElims).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
    });
  });
});

// // test/app/(private)/dataEntry/tmnts/zeroToNElims/zeroToNElims.validate.test.tsx
// // tests for src/app/(private)/dataEntry/tmntForm/zeroToNElims.tsx
// import { validateElims, exportedForTesting } from "@/app/(private)/dataEntry/tmntForm/zeroToNElims";
// import type { elimType, AcdnErrType } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   divId1,
// } from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { maxMoney, minFee } from "@/lib/validation/constants";
// import {
//   acdnErrClassName,
//   noAcdnErr,
//   objErrClassName,
// } from "@/app/(private)/dataEntry/tmntForm/errors";
// import { btDbUuid } from "@/lib/uuid";
// const { validateElim } = exportedForTesting;

// // ----- helpers --------------------------------------------------

// const baseMockElim: elimType = {
//   ...mockTmntFullData.elims[0],
// };

// const makeElim = (overrides: Partial<elimType> = {}): elimType => ({
//   ...baseMockElim,
//   ...overrides,
// });

// const mockElims = mockTmntFullData.elims;
// const mockDivs = mockTmntFullData.divs;

// const mockSetElims = jest.fn();
// const mockSetAcdnErr = jest.fn();


// // right now only 1 squad; use the same squadGames logic as the component
// const squadGames = mockTmntFullData.squads[0].games;

// describe('zeroToNElims - validate', () => {

//   describe('validateElim()', () => { 

//     it('validate elim with empty elims array', async () => { 
//       const vElim = validateElim(mockElims[0], [], 6);
//       expect(vElim.div_err).toBe('');
//       expect(vElim.fee_err).toBe('');
//       expect(vElim.start_err).toBe('');
//       expect(vElim.games_err).toBe('');
//     })
//     it('validate elim with populated elims array', async () => { 
//       const validElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         start: 2,
//       }
//       const vElim = validateElim(validElim, mockElims, 6);
//       expect(vElim.div_err).toBe('');
//       expect(vElim.fee_err).toBe('');
//       expect(vElim.start_err).toBe('');
//       expect(vElim.games_err).toBe('');
//     })
//     it('should not validate elim with no division', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         div_id: '',
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.div_err).not.toBe('');
//     })
//     it('should not validate elim with no fee', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         fee: '',
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.fee_err).not.toBe('');
//     })
//     it('should not validate elim with fee too low', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         fee: '0',
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.fee_err).not.toBe('');
//     })
//     it('should not validate elim with fee too high', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         fee: '123456789',
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.fee_err).not.toBe('');
//     })
//     it('should not validate elim with invalid fee', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         fee: 'abc',
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.fee_err).not.toBe('');
//     })
//     it('should not validate elim with no start', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         start: null as any,
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.start_err).not.toBe('');
//     })
//     it('should not validate elim with start too low', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         start: 0,
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.start_err).not.toBe('');
//     })
//     it('should not validate elim with start too high', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         start: 7,
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.start_err).not.toBe('');
//     })
//     it('should not validate elim with no games', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         games: null as any,
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.games_err).not.toBe('');
//     })
//     it('should not validate elim with games too low', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         games: 0,
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.games_err).not.toBe('');
//     })
//     it('should not validate elim with games too high', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         games: 7,
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.games_err).not.toBe('');
//     })
//     it('should not validate elim when start + games is past end of squad games', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),
//         start: 5,
//         games: 3
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.start_err).not.toBe('');
//     })

//     it('should not validate elim with duplicate elim', async () => { 
//       const invalidElim = {
//         ...mockElims[0],
//         id: btDbUuid('elm'),        
//       } 
//       const vElim = validateElim(invalidElim, mockElims, 6);
//       expect(vElim.start_err).not.toBe('');
//     })

//   })  

//   describe("validateElims()", () => {
//     it("returns true and clears AcdnErr when all elims are valid", () => {
//       const elims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: minFee.toString(),
//           start: 1,
//           games: 2,
//           // stale errors that should be cleared
//           div_err: "old div error",
//           fee_err: "old fee error",
//           start_err: "old start error",
//           games_err: "old games error",
//           errClassName: objErrClassName,
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(true);
//       expect(setElims).toHaveBeenCalledTimes(1);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.div_err).toBe("");
//       expect(v.fee_err).toBe("");
//       expect(v.start_err).toBe("");
//       expect(v.games_err).toBe("");
//       expect(v.errClassName).toBe("");

//       expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//     });
//     it("sets fee_err when fee is less than the minimum", () => {
//       const underMin = (minFee - 0.01).toString();

//       const elims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: underMin,
//           start: 1,
//           games: 2,
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);
//       expect(setElims).toHaveBeenCalledTimes(1);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.fee_err).toMatch(/cannot be less than/i);
//       expect(v.start_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.games_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Fee cannot be less than"),
//         })
//       );
//     });
//     it("sets fee_err when fee is greater than the maximum", () => {
//       const overMax = (maxMoney + 1).toString();

//       const elims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: overMax,
//           start: 1,
//           games: 2,
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.fee_err).toMatch(/cannot be more than/i);
//       expect(v.start_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.games_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Fee cannot be more than"),
//         })
//       );
//     });
//     it("sets start_err when start is less than 1", () => {
//       const elims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: minFee.toString(),
//           start: 0, // too low
//           games: 2,
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.start_err).toMatch(/cannot be less than 1/i);
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.games_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Start cannot be less than 1"),
//         })
//       );
//     });
//     it("sets start_err when start is greater than maximum", () => {
//       const tooHighStart = squadGames + 1;

//       const elims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: minFee.toString(),
//           start: tooHighStart,
//           games: 3,
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.start_err).toMatch(
//         new RegExp(`eliminator ends after last game`, "i")
//       );
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.games_err).toMatch("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining(`Eliminator ends after last game`),
//         })
//       );
//     });
//     it("sets games_err when games is less than 1", () => {
//       const elims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: minFee.toString(),
//           start: 1,
//           games: 0, // too low
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.games_err).toMatch(/cannot be less than 1/i);
//       expect(v.start_err).toBe("");
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Games cannot be less than 1"),
//         })
//       );
//     });
//     it("sets games_err when games is greater than squadGames", () => {
//       const elims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: minFee.toString(),
//           start: 1,
//           games: squadGames + 1, // too high
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.games_err).toMatch(
//         new RegExp(`cannot be more than ${squadGames}`, "i")
//       );
//       expect(v.start_err).toBe("Eliminator ends after last game");
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining(`Eliminator ends after last game`),
//         })
//       );
//     });
//     it("sets start_err when eliminator would end after the last game (start + games - 1 > squadGames)", () => {
//       const start = squadGames - 1; // e.g. 4 when squadGames=5
//       const games = 2;              // 4 + 2 - 1 = 5 -> ok? wait… 4+2-1=5 equal; we want >, so use squadGames - 1 and 3 if needed
//       const endViolatingGames = 2;
//       // For safety, ensure we actually violate the rule:
//       // endGame = start + games - 1 > squadGames
//       // We'll just use start = squadGames - 1, games = 3 => end = squadGames + 1
//       const violatingElims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: minFee.toString(),
//           start: squadGames - 1,
//           games: 3,
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         violatingElims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.start_err).toMatch(/ends after last game/i);
//       // games itself is within [1, squadGames], so games_err should be empty
//       expect(v.games_err).toBe("");
//       expect(v.fee_err).toBe("");
//       expect(v.div_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("ends after last game"),
//         })
//       );
//     });
//     it("sets div_err when Division is missing", () => {
//       const elims: elimType[] = [
//         makeElim({
//           div_id: "",
//           fee: minFee.toString(),
//           start: 1,
//           games: 2,
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.div_err).toMatch(/division is required/i);
//       expect(v.fee_err).toBe("");
//       expect(v.start_err).toBe("");
//       expect(v.games_err).toBe("");
//       expect(v.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Division is required"),
//         })
//       );
//     });
//     it("sets duplicate error when another elim has same Division, Start, and Games", () => {
//       const existing = makeElim({
//         id: "elim1",
//         div_id: divId1,
//         fee: minFee.toString(),
//         start: 2,
//         games: 3,
//       });

//       const duplicate = makeElim({
//         id: "elim2",
//         div_id: divId1,
//         fee: minFee.toString(),
//         start: 2,
//         games: 3,
//       });

//       const elims: elimType[] = [existing, duplicate];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(false);
//       expect(setElims).toHaveBeenCalledTimes(1);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       // either or both may get the duplicate error; just find one with it
//       const dupWithErr = updated.find((e) =>
//         /already exists/i.test(e.start_err ?? "")
//       );
//       expect(dupWithErr).toBeDefined();
//       expect(dupWithErr!.fee_err).toBe("");
//       expect(dupWithErr!.div_err).toBe("");
//       expect(dupWithErr!.games_err).toBe("");
//       expect(dupWithErr!.errClassName).toBe(objErrClassName);

//       expect(setAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("already exists"),
//         })
//       );
//     });
//     it("clears all error fields when values become valid", () => {
//       const elims: elimType[] = [
//         makeElim({
//           div_id: divId1,
//           fee: minFee.toString(),
//           start: 1,
//           games: 2,
//           div_err: "Division is required",
//           fee_err: "Fee cannot be less than $1",
//           start_err: "Start cannot be less than 1",
//           games_err: "Games cannot be less than 1",
//           errClassName: objErrClassName,
//         }),
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       expect(result).toBe(true);
//       expect(setElims).toHaveBeenCalledTimes(1);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const v = updated[0];

//       expect(v.div_err).toBe("");
//       expect(v.fee_err).toBe("");
//       expect(v.start_err).toBe("");
//       expect(v.games_err).toBe("");
//       expect(v.errClassName).toBe("");

//       expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//     });
//     it('should validate empty eliminators', async () => { 
//       const isValid = validateElims([], mockSetElims, mockDivs, 6, mockSetAcdnErr);
//       expect(isValid).toBe(true);
//     })
//     it('should not validate eliminators with null parsms', async () => { 
//       let isValid = validateElims(null as any, mockSetElims, mockDivs, 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateElims(mockElims, null as any, mockDivs, 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateElims(mockElims, mockSetElims, null as any, 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateElims(mockElims, mockSetElims, mockDivs, null as any, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateElims(mockElims, mockSetElims, mockDivs, 6, null as any);
//       expect(isValid).toBe(false);
//     })
//     it('should not validate eliminators with empty divs', async () => { 
//       const isValid = validateElims(mockElims, mockSetElims, [], 6, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//     })
//     it('should not validate eliminators with invalid squadGames', async () => {
//       let isValid = validateElims(mockElims, mockSetElims, mockDivs, 0, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateElims(mockElims, mockSetElims, mockDivs, 123, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//       isValid = validateElims(mockElims, mockSetElims, mockDivs, 'abc' as any, mockSetAcdnErr);
//       expect(isValid).toBe(false);
//     })
//     it("does not override an existing accordion error when a later elim becomes invalid", () => {
//       const existingStartErr = "Start cannot be less than 1";

//       // elims[0] already has invalid data + an error (simulating an existing accordion error)
//       const firstWithExistingError: elimType = makeElim({
//         start: 0, // invalid start so validateElim will keep a start_err
//         start_err: existingStartErr,
//         errClassName: objErrClassName,
//       });

//       // elims[1] will have a *new* validation problem (fee below minFee)
//       const secondWithNewFeeProblem: elimType = makeElim({
//         id: "elim2", // ensure a different id
//         div_id: divId1,
//         fee: (minFee - 0.01).toString(), // invalid fee
//         start: 1,
//         games: 2,
//         // no errors yet; validateElims should add fee_err + errClassName
//         fee_err: "",
//         start_err: "",
//         games_err: "",
//         div_err: "",
//         errClassName: "",
//       });

//       const elims: elimType[] = [
//         firstWithExistingError,
//         secondWithNewFeeProblem,
//       ];

//       const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
//       const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//       const result = validateElims(
//         elims,
//         setElims,
//         mockTmntFullData.divs,
//         squadGames,
//         setAcdnErr
//       );

//       // Overall validation should fail
//       expect(result).toBe(false);
//       expect(setElims).toHaveBeenCalledTimes(1);

//       const updated = setElims.mock.calls[0][0] as elimType[];
//       const updatedFirst = updated[0];
//       const updatedSecond = updated[1];

//       // elims[0] is still invalid after validation
//       expect(updatedFirst.start_err).toBe(existingStartErr);
//       expect(updatedFirst.errClassName).toBe(objErrClassName);

//       // elims[1] gets a new fee_err + errClassName from validation
//       expect(updatedSecond.fee_err).toMatch(/cannot be less than/i);
//       expect(updatedSecond.errClassName).toBe(objErrClassName);

//       // Because elims[0] already had an error when validateElims started
//       // (newElimErrMsg was non-empty), validateElims must NOT set a new
//       // accordion error message for the later invalid elim.
//       expect(setAcdnErr).not.toHaveBeenCalled();
//     });

//   })  
// })

