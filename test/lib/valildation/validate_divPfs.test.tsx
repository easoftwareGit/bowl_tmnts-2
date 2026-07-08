import {
  exportedForTesting,
  sanitizeDivPf,
  validateDivPf,
  validateDivPfs,
  validDivPfAmount,
  validDivPfPosition,
} from "@/lib/validation/divPfs/validate";
import { blankDivPf, initDivPf } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/enums/enums";
import type { divPfType, validDivPfsType } from "@/lib/types/types";
import { maxMoney, maxPosition } from "@/lib/validation/constants";

const {
  gotDivPfData,
  validDivPfData,
} = exportedForTesting;

const validDivPf: divPfType = {
  ...initDivPf,
  id: "dpf_652fc6c5556e407291c4b5666b2dccd7",
  div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
  position: 1,
  amount: 100,
};

const mockDivPfs: divPfType[] = [
  { ...validDivPf },
  {
    ...validDivPf,
    id: "dpf_22222222222222222222222222222222",
    position: 2,
    amount: 50,
  },
];

describe("validate divPfs", () => {

  describe("gotDivPfData()", () => {

    it("should return ErrorCode.NONE when all data is present", () => {
      expect(
        gotDivPfData(validDivPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      expect(
        gotDivPfData({
          ...validDivPf,
          id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when div_id is missing", () => {
      expect(
        gotDivPfData({
          ...validDivPf,
          div_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position is missing", () => {
      expect(
        gotDivPfData({
          ...validDivPf,
          position: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when position is 0", () => {
      expect(
        gotDivPfData({
          ...validDivPf,
          position: 0,
        }),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when amount is missing", () => {
      expect(
        gotDivPfData({
          ...validDivPf,
          amount: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when amount is 0", () => {
      expect(
        gotDivPfData({
          ...validDivPf,
          amount: 0,
        }),
      ).toBe(ErrorCode.NONE);
    });

  });

  describe("validDivPfPosition()", () => {

    it("should return true for valid position", () => {
      expect(validDivPfPosition(1)).toBe(true);
    });

    it("should return true for max valid position", () => {
      expect(
        validDivPfPosition(maxPosition - 1),
      ).toBe(true);
    });

    it("should return false for null", () => {
      expect(
        validDivPfPosition(null as any),
      ).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(
        validDivPfPosition(undefined as any),
      ).toBe(false);
    });

    it("should return false for string", () => {
      expect(
        validDivPfPosition("1" as any),
      ).toBe(false);
    });

    it("should return false for 0", () => {
      expect(
        validDivPfPosition(0),
      ).toBe(false);
    });

    it("should return false for negative value", () => {
      expect(
        validDivPfPosition(-1),
      ).toBe(false);
    });

    it("should return false for decimal value", () => {
      expect(
        validDivPfPosition(1.5),
      ).toBe(false);
    });

    it("should return false when equal to maxPosition", () => {
      expect(
        validDivPfPosition(maxPosition),
      ).toBe(false);
    });

  });

  describe("validDivPfAmount()", () => {

    it("should return true when amount is valid", () => {
      expect(validDivPfAmount(100)).toBe(true);
    });

    it("should return true when amount is 0", () => {
      expect(validDivPfAmount(0)).toBe(true);
    });

    it("should return false when amount is null", () => {
      expect(validDivPfAmount(null as any)).toBe(false);
    });

    it("should return false when amount is undefined", () => {
      expect(validDivPfAmount(undefined as any)).toBe(false);
    });

    it("should return false when amount is string", () => {
      expect(validDivPfAmount("100" as any)).toBe(false);
    });

    it("should return false when amount is negative", () => {
      expect(validDivPfAmount(-1)).toBe(false);
    });

    it("should return false when amount exceeds maxMoney", () => {
      expect(
        validDivPfAmount(maxMoney + 1),
      ).toBe(false);
    });

    it("should return true when amount contains decimals", () => {
      expect(
        validDivPfAmount(12.34),
      ).toBe(true);
    });

  });

  describe("validDivPfData()", () => {

    it("should return ErrorCode.NONE when data is valid", () => {
      expect(
        validDivPfData(validDivPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      expect(
        validDivPfData({
          ...validDivPf,
          id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when div_id is invalid", () => {
      expect(
        validDivPfData({
          ...validDivPf,
          div_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      expect(
        validDivPfData({
          ...validDivPf,
          position: 0,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      expect(
        validDivPfData({
          ...validDivPf,
          amount: -1,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

  });

  describe("sanitizeDivPf()", () => {

    it("should return unchanged valid divPf", () => {
      expect(
        sanitizeDivPf(validDivPf),
      ).toEqual(validDivPf);
    });

    it("should allow invalid id", () => {
      const result = sanitizeDivPf({
        ...validDivPf,
        id: "abc",
      });

      expect(result.id).toBe("abc");
    });

    it("should trim long id", () => {
      const result = sanitizeDivPf({
        ...validDivPf,
        id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      });

      expect(result.id).toBe(
        "abcdefghijklmopqrstuvwxyzabcdefghijk",
      );
    });

    it("should allow invalid div_id", () => {
      const result = sanitizeDivPf({
        ...validDivPf,
        div_id: "abc",
      });

      expect(result.div_id).toBe("abc");
    });

    it("should trim long div_id", () => {
      const result = sanitizeDivPf({
        ...validDivPf,
        div_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      });

      expect(result.div_id).toBe(
        "abcdefghijklmopqrstuvwxyzabcdefghijk",
      );
    });

    it("should preserve valid position", () => {
      const result = sanitizeDivPf(validDivPf);

      expect(result.position).toBe(1);
    });

    it("should preserve null position", () => {
      const result = sanitizeDivPf({
        ...validDivPf,
        position: null as any,
      });

      expect(result.position).toBeNull();
    });

    it("should reset invalid position", () => {
      const result = sanitizeDivPf({
        ...validDivPf,
        position: "abc" as any,
      });

      expect(result.position).toBe(
        blankDivPf.position,
      );
    });

    it("should sanitize amount", () => {
      const result = sanitizeDivPf({
        ...validDivPf,
        amount: "123.450" as any,
      });

      expect(result.amount).toBe(123.45);
    });

    it("should reset invalid amount", () => {
      const result = sanitizeDivPf({
        ...validDivPf,
        amount: "abc" as any,
      });

      expect(result.amount).toBe(
        blankDivPf.amount,
      );
    });

  });

  describe("validateDivPf()", () => {

    it("should return ErrorCode.NONE for valid data", () => {
      expect(
        validateDivPf(validDivPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when id missing", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when id invalid", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when div_id missing", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          div_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when div_id invalid", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          div_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position missing", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          position: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position invalid", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          position: 0,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position equals maxPosition", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          position: maxPosition,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount missing", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          amount: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount invalid", () => {
      expect(
        validateDivPf({
          ...validDivPf,
          amount: maxMoney + 1,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

  });

  describe("validateDivPfs()", () => {

    it("should return ErrorCode.NONE when all data is valid", () => {
      const result =
        validateDivPfs(mockDivPfs);

      expect(result.errorCode).toBe(
        ErrorCode.NONE,
      );
      expect(result.divPfs).toHaveLength(2);
    });

    it("should sanitize amount values", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        amount: "55.000" as any,
      };

      const result: validDivPfsType =
        validateDivPfs(divPfsToValidate);

      expect(result.errorCode).toBe(
        ErrorCode.NONE,
      );

      expect(result.divPfs[1].amount)
        .toBe(55);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        id: '<script>alert("xss")</script>',
      };

      const result = validateDivPfs(divPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when div_id is invalid", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        div_id: "abc",
      };

      const result = validateDivPfs(divPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when all div_id are not the same", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],                
        div_id: "div_00000000000000000000000000000000",
      };

      const result = validateDivPfs(divPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position is null", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        position: null as any,
      };

      const result = validateDivPfs(divPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        position: -1,
      };

      const result = validateDivPfs(divPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when position is not sequential", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        position: 3, // valid value, bit not sequential
      };

      const result = validateDivPfs(divPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);      
    })

    it("should return ErrorCode.MISSING_DATA when amount is null", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        amount: null as any,
      };

      const result = validateDivPfs(divPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      const divPfsToValidate = [
        ...mockDivPfs,
      ];

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        amount: maxMoney + 1,
      };

      const result = validateDivPfs(divPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

  });

});