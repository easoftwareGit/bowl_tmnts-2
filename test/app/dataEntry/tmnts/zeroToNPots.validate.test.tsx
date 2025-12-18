import { validatePots } from "@/app/dataEntry/tmntForm/zeroToNPots";
import { potType, AcdnErrType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/dataEntry/tmntForm/errors";
import { maxMoney, minFee } from "@/lib/validation";

const baseMockPot: potType = {
  ...mockTmntFullData.pots[0],  // assumes you have at least 1 mock pot
};

// helper like your other files
const makePot = (overrides: Partial<potType> = {}): potType => ({
  ...baseMockPot,
  ...overrides,
});

describe("validatePots", () => {
  it("returns true and clears Acdn error when all pots are valid", () => {
    const pots: potType[] = [
      makePot({
        fee: minFee.toString(), // valid lower bound
        fee_err: "stale error",
        errClassName: objErrClassName,
      }),
    ];

    const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

    expect(result).toBe(true);
    expect(setPots).toHaveBeenCalledTimes(1);

    const updatedPots = setPots.mock.calls[0][0] as potType[];
    const pot = updatedPots[0];

    expect(pot.fee_err).toBe("");
    expect(pot.errClassName).toBe("");

    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });
  it("sets fee error when fee is less than the minimum", () => {
    const underMin = (minFee - 0.01).toString();

    const pots: potType[] = [
      makePot({
        fee: underMin,
      }),
    ];

    const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

    expect(result).toBe(false);
    expect(setPots).toHaveBeenCalledTimes(1);

    const updatedPots = setPots.mock.calls[0][0] as potType[];
    const pot = updatedPots[0];

    expect(pot.fee_err).toMatch(/cannot be less than/i);
    expect(pot.errClassName).toBe(objErrClassName);

    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining("Fee cannot be less than"),
    });
  });
  it("sets fee error when fee is greater than the maximum", () => {
    const overMax = (maxMoney + 1).toString();

    const pots: potType[] = [
      makePot({
        fee: overMax,
      }),
    ];

    const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

    expect(result).toBe(false);
    expect(setPots).toHaveBeenCalledTimes(1);

    const updatedPots = setPots.mock.calls[0][0] as potType[];
    const pot = updatedPots[0];

    expect(pot.fee_err).toMatch(/cannot be more than/i);
    expect(pot.errClassName).toBe(objErrClassName);

    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining("Fee cannot be more than"),
    });
  });
  it('clears fee error when fee is valid', () => { 
    const pots: potType[] = [
      makePot({
        fee: minFee.toString(), // valid lower bound
        fee_err: "stale error",
        errClassName: objErrClassName,
      }),
    ];

    const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

    expect(result).toBe(true);
    expect(setPots).toHaveBeenCalledTimes(1);

    const updatedPots = setPots.mock.calls[0][0] as potType[];
    const pot = updatedPots[0];

    expect(pot.fee_err).toBe("");
    expect(pot.errClassName).toBe("");

    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  })
});
