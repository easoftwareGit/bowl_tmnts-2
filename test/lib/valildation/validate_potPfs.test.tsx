import {
  exportedForTesting,
  sanitizePotPf,
  validatePotPf,
  validatePotPfs,
} from "@/lib/validation/potPfs/validate";
import { blankPotPf, initPotPf } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/enums/enums";
import type { potPfType, validPotPfsType } from "@/lib/types/types";
import { maxMoney, maxPosition } from "@/lib/validation/constants";

const {
  gotPotPfData,
  validPotPfData,
} = exportedForTesting;

const validPotPf: potPfType = {
  ...initPotPf,
  id: "ppf_652fc6c5556e407291c4b5666b2dccd7",
  pot_id: "pot_f30aea2c534f4cfe87f4315531cef8ef",
  position: 1,
  amount: 100,
};

const mockPotPfs: potPfType[] = [
  { ...validPotPf },
  {
    ...validPotPf,
    id: "ppf_22222222222222222222222222222222",
    position: 2,
    amount: 50,
  },
];

describe("validate potPfs", () => {

  describe("gotPotPfData()", () => {

    it("should return ErrorCode.NONE when all data is present", () => {
      expect(
        gotPotPfData(validPotPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      expect(
        gotPotPfData({
          ...validPotPf,
          id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when pot_id is missing", () => {
      expect(
        gotPotPfData({
          ...validPotPf,
          pot_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position is missing", () => {
      expect(
        gotPotPfData({
          ...validPotPf,
          position: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when position is 0", () => {
      expect(
        gotPotPfData({
          ...validPotPf,
          position: 0,
        }),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when amount is missing", () => {
      expect(
        gotPotPfData({
          ...validPotPf,
          amount: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when amount is 0", () => {
      expect(
        gotPotPfData({
          ...validPotPf,
          amount: 0,
        }),
      ).toBe(ErrorCode.NONE);
    });

  });

  describe("validPotPfData()", () => {

    it("should return ErrorCode.NONE when data is valid", () => {
      expect(
        validPotPfData(validPotPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      expect(
        validPotPfData({
          ...validPotPf,
          id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id is invalid", () => {
      expect(
        validPotPfData({
          ...validPotPf,
          pot_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      expect(
        validPotPfData({
          ...validPotPf,
          position: 0,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      expect(
        validPotPfData({
          ...validPotPf,
          amount: -1,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

  });

  describe("sanitizePotPf()", () => {

    it("should return unchanged valid potPf", () => {
      expect(
        sanitizePotPf(validPotPf),
      ).toEqual(validPotPf);
    });

    it("should allow invalid id", () => {
      const result = sanitizePotPf({
        ...validPotPf,
        id: "abc",
      });

      expect(result.id).toBe("abc");
    });

    it("should trim long id", () => {
      const result = sanitizePotPf({
        ...validPotPf,
        id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      });

      expect(result.id).toBe(
        "abcdefghijklmopqrstuvwxyzabcdefghijk",
      );
    });

    it("should allow invalid pot_id", () => {
      const result = sanitizePotPf({
        ...validPotPf,
        pot_id: "abc",
      });

      expect(result.pot_id).toBe("abc");
    });

    it("should trim long pot_id", () => {
      const result = sanitizePotPf({
        ...validPotPf,
        pot_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      });

      expect(result.pot_id).toBe(
        "abcdefghijklmopqrstuvwxyzabcdefghijk",
      );
    });

    it("should preserve valid position", () => {
      const result = sanitizePotPf(validPotPf);

      expect(result.position).toBe(1);
    });

    it("should preserve null position", () => {
      const result = sanitizePotPf({
        ...validPotPf,
        position: null as any,
      });

      expect(result.position).toBeNull();
    });

    it("should reset invalid position", () => {
      const result = sanitizePotPf({
        ...validPotPf,
        position: "abc" as any,
      });

      expect(result.position).toBe(
        blankPotPf.position,
      );
    });

    it("should sanitize amount", () => {
      const result = sanitizePotPf({
        ...validPotPf,
        amount: "123.450" as any,
      });

      expect(result.amount).toBe(123.45);
    });

    it("should reset invalid amount", () => {
      const result = sanitizePotPf({
        ...validPotPf,
        amount: "abc" as any,
      });

      expect(result.amount).toBe(
        blankPotPf.amount,
      );
    });

  });

  describe("validatePotPf()", () => {

    it("should return ErrorCode.NONE for valid data", () => {
      expect(
        validatePotPf(validPotPf),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when id missing", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when id invalid", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when pot_id missing", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          pot_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id invalid", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          pot_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position missing", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          position: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position invalid", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          position: 0,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position equals maxPosition", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          position: maxPosition,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount missing", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          amount: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount invalid", () => {
      expect(
        validatePotPf({
          ...validPotPf,
          amount: maxMoney + 1,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

  });

  describe("validatePotPfs()", () => {

    it("should return ErrorCode.NONE when all data is valid", () => {
      const result =
        validatePotPfs(mockPotPfs);

      expect(result.errorCode).toBe(
        ErrorCode.NONE,
      );
      expect(result.potPfs).toHaveLength(2);
    });

    it("should sanitize amount values", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        amount: "55.000" as any,
      };

      const result: validPotPfsType =
        validatePotPfs(potPfsToValidate);

      expect(result.errorCode).toBe(
        ErrorCode.NONE,
      );

      expect(result.potPfs[1].amount)
        .toBe(55);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        id: '<script>alert("xss")</script>',
      };

      const result = validatePotPfs(potPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id is invalid", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        pot_id: "abc",
      };

      const result = validatePotPfs(potPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when all pot_id are not the same", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        pot_id: "pot_00000000000000000000000000000000",
      };

      const result = validatePotPfs(potPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when position is null", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        position: null as any,
      };

      const result = validatePotPfs(potPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        position: -1,
      };

      const result = validatePotPfs(potPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is not sequential", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        position: 3,
      };

      const result = validatePotPfs(potPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount is null", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        amount: null as any,
      };

      const result = validatePotPfs(potPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      const potPfsToValidate = [
        ...mockPotPfs,
      ];

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        amount: maxMoney + 1,
      };

      const result = validatePotPfs(potPfsToValidate);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

  });

});