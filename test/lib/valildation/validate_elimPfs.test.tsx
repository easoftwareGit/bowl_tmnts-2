import {
  exportedForTesting,
  sanitizeElimPf,
  validateElimPf,
  validateElimPfs,
} from "@/lib/validation/elimPfs/validate";
import { blankElimPf, initElimPf } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/enums/enums";
import type { elimPfType, validElimPfsType } from "@/lib/types/types";
import { maxMoney, maxPosition } from "@/lib/validation/constants";

const {
  gotElimPfData,
  validElimPfData,
} = exportedForTesting;

const validElimPf: elimPfType = {
  ...initElimPf,
  id: "epf_652fc6c5556e407291c4b5666b2dccd7",
  elim_id: "elm_f30aea2c534f4cfe87f4315531cef8ef",
  position: 1,
  amount: 100,
};

const mockElimPfs: elimPfType[] = [
  { ...validElimPf },
  {
    ...validElimPf,
    id: "epf_22222222222222222222222222222222",
    position: 2,
    amount: 50,
  },
];

describe("validate elimPfs", () => {

  describe("gotElimPfData()", () => {

    it("should return ErrorCode.NONE when all data is present", () => {
      expect(
        gotElimPfData(validElimPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      expect(
        gotElimPfData({
          ...validElimPf,
          id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when elim_id is missing", () => {
      expect(
        gotElimPfData({
          ...validElimPf,
          elim_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position is missing", () => {
      expect(
        gotElimPfData({
          ...validElimPf,
          position: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when position is 0", () => {
      expect(
        gotElimPfData({
          ...validElimPf,
          position: 0,
        }),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when amount is missing", () => {
      expect(
        gotElimPfData({
          ...validElimPf,
          amount: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when amount is 0", () => {
      expect(
        gotElimPfData({
          ...validElimPf,
          amount: 0,
        }),
      ).toBe(ErrorCode.NONE);
    });

  });

  describe("validElimPfData()", () => {

    it("should return ErrorCode.NONE when data is valid", () => {
      expect(
        validElimPfData(validElimPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      expect(
        validElimPfData({
          ...validElimPf,
          id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when elim_id is invalid", () => {
      expect(
        validElimPfData({
          ...validElimPf,
          elim_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      expect(
        validElimPfData({
          ...validElimPf,
          position: 0,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      expect(
        validElimPfData({
          ...validElimPf,
          amount: -1,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

  });

  describe("sanitizeElimPf()", () => {

    it("should return unchanged valid elimPf", () => {
      expect(
        sanitizeElimPf(validElimPf),
      ).toEqual(validElimPf);
    });

    it("should allow invalid id", () => {
      const result = sanitizeElimPf({
        ...validElimPf,
        id: "abc",
      });

      expect(result.id).toBe("abc");
    });

    it("should trim long id", () => {
      const result = sanitizeElimPf({
        ...validElimPf,
        id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      });

      expect(result.id).toBe(
        "abcdefghijklmopqrstuvwxyzabcdefghijk",
      );
    });

    it("should allow invalid elim_id", () => {
      const result = sanitizeElimPf({
        ...validElimPf,
        elim_id: "abc",
      });

      expect(result.elim_id).toBe("abc");
    });

    it("should trim long elim_id", () => {
      const result = sanitizeElimPf({
        ...validElimPf,
        elim_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      });

      expect(result.elim_id).toBe(
        "abcdefghijklmopqrstuvwxyzabcdefghijk",
      );
    });

    it("should preserve valid position", () => {
      const result = sanitizeElimPf(validElimPf);

      expect(result.position).toBe(1);
    });

    it("should preserve null position", () => {
      const result = sanitizeElimPf({
        ...validElimPf,
        position: null as any,
      });

      expect(result.position).toBeNull();
    });

    it("should reset invalid position", () => {
      const result = sanitizeElimPf({
        ...validElimPf,
        position: "abc" as any,
      });

      expect(result.position).toBe(
        blankElimPf.position,
      );
    });

    it("should sanitize amount", () => {
      const result = sanitizeElimPf({
        ...validElimPf,
        amount: "123.450" as any,
      });

      expect(result.amount).toBe(123.45);
    });

    it("should reset invalid amount", () => {
      const result = sanitizeElimPf({
        ...validElimPf,
        amount: "abc" as any,
      });

      expect(result.amount).toBe(
        blankElimPf.amount,
      );
    });

  });

  describe("validateElimPf()", () => {

    it("should return ErrorCode.NONE for valid data", () => {
      expect(
        validateElimPf(validElimPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when id missing", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when id invalid", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when elim_id missing", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          elim_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when elim_id invalid", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          elim_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position missing", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          position: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position invalid", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          position: 0,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position equals maxPosition", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          position: maxPosition,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount missing", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          amount: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount invalid", () => {
      expect(
        validateElimPf({
          ...validElimPf,
          amount: maxMoney + 1,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

  });

  describe("validateElimPfs()", () => {

    it("should return ErrorCode.NONE when all data is valid", () => {
      const result =
        validateElimPfs(mockElimPfs);

      expect(result.errorCode).toBe(
        ErrorCode.NONE,
      );
      expect(result.elimPfs).toHaveLength(2);
    });

    it("should sanitize amount values", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        amount: "55.000" as any,
      };

      const result: validElimPfsType =
        validateElimPfs(elimPfsToValidate);

      expect(result.errorCode).toBe(
        ErrorCode.NONE,
      );

      expect(result.elimPfs[1].amount)
        .toBe(55);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        id: '<script>alert("xss")</script>',
      };

      const result = validateElimPfs(elimPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when elim_id is invalid", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        elim_id: "abc",
      };

      const result = validateElimPfs(elimPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when all elim_id are not the same", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        elim_id: "elm_00000000000000000000000000000000",
      };

      const result = validateElimPfs(elimPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position is null", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        position: null as any,
      };

      const result = validateElimPfs(elimPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        position: -1,
      };

      const result = validateElimPfs(elimPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is not sequential", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        position: 3,
      };

      const result = validateElimPfs(elimPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount is null", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        amount: null as any,
      };

      const result = validateElimPfs(elimPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      const elimPfsToValidate = [
        ...mockElimPfs,
      ];

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        amount: maxMoney + 1,
      };

      const result = validateElimPfs(elimPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

  });

});