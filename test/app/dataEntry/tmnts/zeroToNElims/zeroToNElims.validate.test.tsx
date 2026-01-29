import { validateElims, exportedForTesting } from "@/app/dataEntry/tmntForm/zeroToNElims";
import { elimType, AcdnErrType } from "@/lib/types/types";
import {
  mockTmntFullData,
  divId1,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { maxMoney, minFee } from "@/lib/validation/validation";
import {
  acdnErrClassName,
  noAcdnErr,
  objErrClassName,
} from "@/app/dataEntry/tmntForm/errors";
import { btDbUuid } from "@/lib/uuid";
const { validateElim } = exportedForTesting;

// ----- helpers --------------------------------------------------

const baseMockElim: elimType = {
  ...mockTmntFullData.elims[0],
};

const makeElim = (overrides: Partial<elimType> = {}): elimType => ({
  ...baseMockElim,
  ...overrides,
});

const mockElims = mockTmntFullData.elims;
const mockDivs = mockTmntFullData.divs;

const mockSetElims = jest.fn();
const mockSetAcdnErr = jest.fn();


// right now only 1 squad; use the same squadGames logic as the component
const squadGames = mockTmntFullData.squads[0].games;

describe('zeroToNElims - validate', () => {

  describe('validateElim()', () => { 

    it('validate elim with empty elims array', async () => { 
      const vElim = validateElim(mockElims[0], [], 6);
      expect(vElim.div_err).toBe('');
      expect(vElim.fee_err).toBe('');
      expect(vElim.start_err).toBe('');
      expect(vElim.games_err).toBe('');
    })
    it('validate elim with populated elims array', async () => { 
      const validElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        start: 2,
      }
      const vElim = validateElim(validElim, mockElims, 6);
      expect(vElim.div_err).toBe('');
      expect(vElim.fee_err).toBe('');
      expect(vElim.start_err).toBe('');
      expect(vElim.games_err).toBe('');
    })
    it('should not validate elim with no division', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        div_id: '',
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.div_err).not.toBe('');
    })
    it('should not validate elim with no fee', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        fee: '',
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.fee_err).not.toBe('');
    })
    it('should not validate elim with fee too low', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        fee: '0',
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.fee_err).not.toBe('');
    })
    it('should not validate elim with fee too high', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        fee: '123456789',
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.fee_err).not.toBe('');
    })
    it('should not validate elim with invalid fee', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        fee: 'abc',
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.fee_err).not.toBe('');
    })
    it('should not validate elim with no start', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        start: null as any,
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.start_err).not.toBe('');
    })
    it('should not validate elim with start too low', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        start: 0,
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.start_err).not.toBe('');
    })
    it('should not validate elim with start too high', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        start: 7,
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.start_err).not.toBe('');
    })
    it('should not validate elim with no games', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        games: null as any,
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.games_err).not.toBe('');
    })
    it('should not validate elim with games too low', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        games: 0,
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.games_err).not.toBe('');
    })
    it('should not validate elim with games too high', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        games: 7,
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.games_err).not.toBe('');
    })
    it('should not validate elim when start + games is past end of squad games', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),
        start: 5,
        games: 3
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.start_err).not.toBe('');
    })

    it('should not validate elim with duplicate elim', async () => { 
      const invalidElim = {
        ...mockElims[0],
        id: btDbUuid('elm'),        
      } 
      const vElim = validateElim(invalidElim, mockElims, 6);
      expect(vElim.start_err).not.toBe('');
    })

  })  

  describe("validateElims()", () => {
    it("returns true and clears AcdnErr when all elims are valid", () => {
      const elims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: minFee.toString(),
          start: 1,
          games: 2,
          // stale errors that should be cleared
          div_err: "old div error",
          fee_err: "old fee error",
          start_err: "old start error",
          games_err: "old games error",
          errClassName: objErrClassName,
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(true);
      expect(setElims).toHaveBeenCalledTimes(1);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.div_err).toBe("");
      expect(v.fee_err).toBe("");
      expect(v.start_err).toBe("");
      expect(v.games_err).toBe("");
      expect(v.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });
    it("sets fee_err when fee is less than the minimum", () => {
      const underMin = (minFee - 0.01).toString();

      const elims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: underMin,
          start: 1,
          games: 2,
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);
      expect(setElims).toHaveBeenCalledTimes(1);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.fee_err).toMatch(/cannot be less than/i);
      expect(v.start_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.games_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Fee cannot be less than"),
        })
      );
    });
    it("sets fee_err when fee is greater than the maximum", () => {
      const overMax = (maxMoney + 1).toString();

      const elims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: overMax,
          start: 1,
          games: 2,
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.fee_err).toMatch(/cannot be more than/i);
      expect(v.start_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.games_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Fee cannot be more than"),
        })
      );
    });
    it("sets start_err when start is less than 1", () => {
      const elims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: minFee.toString(),
          start: 0, // too low
          games: 2,
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.start_err).toMatch(/cannot be less than 1/i);
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.games_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Start cannot be less than 1"),
        })
      );
    });
    it("sets start_err when start is greater than maximum", () => {
      const tooHighStart = squadGames + 1;

      const elims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: minFee.toString(),
          start: tooHighStart,
          games: 3,
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.start_err).toMatch(
        new RegExp(`eliminator ends after last game`, "i")
      );
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.games_err).toMatch("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining(`Eliminator ends after last game`),
        })
      );
    });
    it("sets games_err when games is less than 1", () => {
      const elims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: minFee.toString(),
          start: 1,
          games: 0, // too low
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.games_err).toMatch(/cannot be less than 1/i);
      expect(v.start_err).toBe("");
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Games cannot be less than 1"),
        })
      );
    });
    it("sets games_err when games is greater than squadGames", () => {
      const elims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: minFee.toString(),
          start: 1,
          games: squadGames + 1, // too high
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.games_err).toMatch(
        new RegExp(`cannot be more than ${squadGames}`, "i")
      );
      expect(v.start_err).toBe("Eliminator ends after last game");
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining(`Eliminator ends after last game`),
        })
      );
    });
    it("sets start_err when eliminator would end after the last game (start + games - 1 > squadGames)", () => {
      const start = squadGames - 1; // e.g. 4 when squadGames=5
      const games = 2;              // 4 + 2 - 1 = 5 -> ok? wait… 4+2-1=5 equal; we want >, so use squadGames - 1 and 3 if needed
      const endViolatingGames = 2;
      // For safety, ensure we actually violate the rule:
      // endGame = start + games - 1 > squadGames
      // We'll just use start = squadGames - 1, games = 3 => end = squadGames + 1
      const violatingElims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: minFee.toString(),
          start: squadGames - 1,
          games: 3,
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        violatingElims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.start_err).toMatch(/ends after last game/i);
      // games itself is within [1, squadGames], so games_err should be empty
      expect(v.games_err).toBe("");
      expect(v.fee_err).toBe("");
      expect(v.div_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("ends after last game"),
        })
      );
    });
    it("sets div_err when Division is missing", () => {
      const elims: elimType[] = [
        makeElim({
          div_id: "",
          fee: minFee.toString(),
          start: 1,
          games: 2,
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.div_err).toMatch(/division is required/i);
      expect(v.fee_err).toBe("");
      expect(v.start_err).toBe("");
      expect(v.games_err).toBe("");
      expect(v.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Division is required"),
        })
      );
    });
    it("sets duplicate error when another elim has same Division, Start, and Games", () => {
      const existing = makeElim({
        id: "elim1",
        div_id: divId1,
        fee: minFee.toString(),
        start: 2,
        games: 3,
      });

      const duplicate = makeElim({
        id: "elim2",
        div_id: divId1,
        fee: minFee.toString(),
        start: 2,
        games: 3,
      });

      const elims: elimType[] = [existing, duplicate];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(false);
      expect(setElims).toHaveBeenCalledTimes(1);

      const updated = setElims.mock.calls[0][0] as elimType[];
      // either or both may get the duplicate error; just find one with it
      const dupWithErr = updated.find((e) =>
        /already exists/i.test(e.start_err ?? "")
      );
      expect(dupWithErr).toBeDefined();
      expect(dupWithErr!.fee_err).toBe("");
      expect(dupWithErr!.div_err).toBe("");
      expect(dupWithErr!.games_err).toBe("");
      expect(dupWithErr!.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("already exists"),
        })
      );
    });
    it("clears all error fields when values become valid", () => {
      const elims: elimType[] = [
        makeElim({
          div_id: divId1,
          fee: minFee.toString(),
          start: 1,
          games: 2,
          div_err: "Division is required",
          fee_err: "Fee cannot be less than $1",
          start_err: "Start cannot be less than 1",
          games_err: "Games cannot be less than 1",
          errClassName: objErrClassName,
        }),
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      expect(result).toBe(true);
      expect(setElims).toHaveBeenCalledTimes(1);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const v = updated[0];

      expect(v.div_err).toBe("");
      expect(v.fee_err).toBe("");
      expect(v.start_err).toBe("");
      expect(v.games_err).toBe("");
      expect(v.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });
    it('should validate empty eliminators', async () => { 
      const isValid = validateElims([], mockSetElims, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(true);
    })
    it('should not validate eliminators with null parsms', async () => { 
      let isValid = validateElims(null as any, mockSetElims, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateElims(mockElims, null as any, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateElims(mockElims, mockSetElims, null as any, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateElims(mockElims, mockSetElims, mockDivs, null as any, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateElims(mockElims, mockSetElims, mockDivs, 6, null as any);
      expect(isValid).toBe(false);
    })
    it('should not validate eliminators with empty divs', async () => { 
      const isValid = validateElims(mockElims, mockSetElims, [], 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
    })
    it('should not validate eliminators with invalid squadGames', async () => {
      let isValid = validateElims(mockElims, mockSetElims, mockDivs, 0, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateElims(mockElims, mockSetElims, mockDivs, 123, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateElims(mockElims, mockSetElims, mockDivs, 'abc' as any, mockSetAcdnErr);
      expect(isValid).toBe(false);
    })
    it("does not override an existing accordion error when a later elim becomes invalid", () => {
      const existingStartErr = "Start cannot be less than 1";

      // elims[0] already has invalid data + an error (simulating an existing accordion error)
      const firstWithExistingError: elimType = makeElim({
        start: 0, // invalid start so validateElim will keep a start_err
        start_err: existingStartErr,
        errClassName: objErrClassName,
      });

      // elims[1] will have a *new* validation problem (fee below minFee)
      const secondWithNewFeeProblem: elimType = makeElim({
        id: "elim2", // ensure a different id
        div_id: divId1,
        fee: (minFee - 0.01).toString(), // invalid fee
        start: 1,
        games: 2,
        // no errors yet; validateElims should add fee_err + errClassName
        fee_err: "",
        start_err: "",
        games_err: "",
        div_err: "",
        errClassName: "",
      });

      const elims: elimType[] = [
        firstWithExistingError,
        secondWithNewFeeProblem,
      ];

      const setElims = jest.fn() as jest.Mock<void, [elimType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateElims(
        elims,
        setElims,
        mockTmntFullData.divs,
        squadGames,
        setAcdnErr
      );

      // Overall validation should fail
      expect(result).toBe(false);
      expect(setElims).toHaveBeenCalledTimes(1);

      const updated = setElims.mock.calls[0][0] as elimType[];
      const updatedFirst = updated[0];
      const updatedSecond = updated[1];

      // elims[0] is still invalid after validation
      expect(updatedFirst.start_err).toBe(existingStartErr);
      expect(updatedFirst.errClassName).toBe(objErrClassName);

      // elims[1] gets a new fee_err + errClassName from validation
      expect(updatedSecond.fee_err).toMatch(/cannot be less than/i);
      expect(updatedSecond.errClassName).toBe(objErrClassName);

      // Because elims[0] already had an error when validateElims started
      // (newElimErrMsg was non-empty), validateElims must NOT set a new
      // accordion error message for the later invalid elim.
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

  })  
})


