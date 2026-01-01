import { validateBrkts } from "@/app/dataEntry/tmntForm/zeroToNBrkts";
import { brktType, AcdnErrType } from "@/lib/types/types";
import {
  mockTmntFullData,
  divId1,
  brktId1,
  brktId2,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { minFee, maxMoney } from "@/lib/validation";
import { defaultBrktGames } from "@/lib/db/initVals";
import {
  acdnErrClassName,
  noAcdnErr,
  objErrClassName,
} from "@/app/dataEntry/tmntForm/errors";

// --- helpers -----------------------

const baseMockBrkt: brktType = {
  ...mockTmntFullData.brkts[0],
};

const makeBrkt = (overrides: Partial<brktType> = {}): brktType => ({
  ...baseMockBrkt,
  ...overrides,
});

// same maxStartGame logic used in the component
const maxStartGame =
  mockTmntFullData.squads[0].games - (defaultBrktGames - 1);

describe("validateBrkts", () => {
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
      maxStartGame,
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
});
