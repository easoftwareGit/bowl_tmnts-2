import {
  exportedForTesting,
  isPotPfSaveDataType,
  sanitizePotPf,
  validatePotPf,
  validatePotPfs,
} from "@/lib/validation/potPfs/validate";
import { blankPotPf, initPotPf } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/enums/enums";
import type { potPfDataType, potPfSaveDataType, potPfType, validPotPfsType } from "@/lib/types/types";
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

  describe("isPotPfSaveDataType()", () => {
    const potId1 = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
    const PotId2 = "pot_00000000000000000000000000000000";

    const validPotPfData: potPfDataType[] = [
      {
        id: "ppf_11111111111111111111111111111111",
        pot_id: potId1,
        position: 1,
        amount: 100,
      },
      {
        id: "ppf_22222222222222222222222222222222",
        pot_id: potId1,
        position: 2,
        amount: 50,
      },
      {
        id: "ppf_33333333333333333333333333333333",
        pot_id: PotId2,
        position: 1,
        amount: 200,
      },
      {
        id: "ppf_44444444444444444444444444444444",
        pot_id: PotId2,
        position: 2,
        amount: 100,
      },
    ];

    const validSaveData: potPfSaveDataType = {
      potPfData: validPotPfData,
      potIds: [potId1, PotId2],
    };

    it("should return true when value is a valid potPfSaveDataType", () => {
      expect(isPotPfSaveDataType(validSaveData)).toBe(true);
    });

    it("should return true when potPfData is an empty array", () => {
      const data = {
        ...validSaveData,
        potPfData: [],
      };

      expect(isPotPfSaveDataType(data)).toBe(true);
    });

    it("should return true when potPfData is an empty array", () => {
      const data: potPfSaveDataType = {
        potPfData: [],
        potIds: [potId1],
      };

      expect(isPotPfSaveDataType(data)).toBe(true);
    });

    it("should return true when potIds is an empty array", () => {
      const data = {
        ...validSaveData,
        potIds: [],
      };

      expect(isPotPfSaveDataType(data)).toBe(true);
    });

    it("should return false when value is null", () => {
      expect(isPotPfSaveDataType(null)).toBe(false);
    });

    it("should return false when value is not an object", () => {
      expect(isPotPfSaveDataType("invalid")).toBe(false);
      expect(isPotPfSaveDataType(123)).toBe(false);
      expect(isPotPfSaveDataType(true)).toBe(false);
    });

    it("should return false when potPfData is missing", () => {
      const data = {
        potIds: validSaveData.potIds,
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when potPfData is not an array", () => {
      const data = {
        ...validSaveData,
        potPfData: "invalid",
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in potPfData is null", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          ...validPotPfData,
          null,
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in potPfData is not an object", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          ...validPotPfData,
          "invalid",
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a potPfData item is missing id", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          {
            pot_id: potId1,
            position: 1,
            amount: 100,
          },
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a potPfData id is not a string", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          {
            ...validPotPfData[0],
            id: 123,
          },
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a potPfData item is missing pot_id", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          {
            id: validPotPfData[0].id,
            position: 1,
            amount: 100,
          },
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a potPfData pot_id is not a string", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          {
            ...validPotPfData[0],
            pot_id: 123,
          },
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a potPfData item is missing position", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          {
            id: validPotPfData[0].id,
            pot_id: potId1,
            amount: 100,
          },
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a potPfData position is not a number", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          {
            ...validPotPfData[0],
            position: "1",
          },
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a potPfData item is missing amount", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          {
            id: validPotPfData[0].id,
            pot_id: potId1,
            position: 1,
          },
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a potPfData amount is not a number", () => {
      const data = {
        ...validSaveData,
        potPfData: [
          {
            ...validPotPfData[0],
            amount: "100.00",
          },
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when potIds is missing", () => {
      const data = {
        potPfData: validPotPfData,
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when potIds is not an array", () => {
      const data = {
        ...validSaveData,
        potIds: potId1,
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in potIds is not a string", () => {
      const data = {
        ...validSaveData,
        potIds: [
          potId1,
          123,
        ],
      };

      expect(isPotPfSaveDataType(data)).toBe(false);
    });
  });  

  describe("validatePotPfs()", () => {
    const potId1 = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
    const potId2 = "pot_00000000000000000000000000000000";

    const potIds = [potId1, potId2];

    const mockPotPfsOneDiv: potPfType[] = [
      {
        ...validPotPf,
        id: "ppf_11111111111111111111111111111111",
        pot_id: potId1,
        position: 1,
        amount: 100,
      },
      {
        ...validPotPf,
        id: "ppf_22222222222222222222222222222222",
        pot_id: potId1,
        position: 2,
        amount: 75,
      },
      {
        ...validPotPf,
        id: "ppf_33333333333333333333333333333333",
        pot_id: potId1,
        position: 3,
        amount: 50,
      },
    ];

    const mockPotPfsTwoDivs: potPfType[] = [
      {
        ...validPotPf,
        id: "ppf_11111111111111111111111111111111",
        pot_id: potId1,
        position: 1,
        amount: 100,
      },
      {
        ...validPotPf,
        id: "ppf_22222222222222222222222222222222",
        pot_id: potId1,
        position: 2,
        amount: 75,
      },
      {
        ...validPotPf,
        id: "ppf_33333333333333333333333333333333",
        pot_id: potId1,
        position: 3,
        amount: 50,
      },
      {
        ...validPotPf,
        id: "ppf_44444444444444444444444444444444",
        pot_id: potId2,
        position: 1,
        amount: 200,
      },
      {
        ...validPotPf,
        id: "ppf_55555555555555555555555555555555",
        pot_id: potId2,
        position: 2,
        amount: 150,
      },
      {
        ...validPotPf,
        id: "ppf_66666666666666666666666666666666",
        pot_id: potId2,
        position: 3,
        amount: 100,
      },
    ];

    it("should return ErrorCode.NONE when all data is valid for one pot", () => {
      const result = validatePotPfs(
        mockPotPfsOneDiv,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.potPfs).toHaveLength(3);
    });

    it("should return ErrorCode.NONE when all data is valid for two pots", () => {
      const result = validatePotPfs(
        mockPotPfsTwoDivs,
        potIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.potPfs).toHaveLength(6);
    });

    it("should return sorted potPfs by pot_id, then position", () => {
      const unsortedPotPfs: potPfType[] = [
        mockPotPfsTwoDivs[5],
        mockPotPfsTwoDivs[2],
        mockPotPfsTwoDivs[3],
        mockPotPfsTwoDivs[0],
        mockPotPfsTwoDivs[4],
        mockPotPfsTwoDivs[1],
      ];

      const result = validatePotPfs(
        unsortedPotPfs,
        potIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(result.potPfs.map((potPf) => ({
        pot_id: potPf.pot_id,
        position: potPf.position,
      }))).toEqual([
        { pot_id: potId2, position: 1 },
        { pot_id: potId2, position: 2 },
        { pot_id: potId2, position: 3 },
        { pot_id: potId1, position: 1 },
        { pot_id: potId1, position: 2 },
        { pot_id: potId1, position: 3 },
      ].toSorted((a, b) => {
        const potCompare = a.pot_id.localeCompare(b.pot_id);

        if (potCompare !== 0) {
          return potCompare;
        }

        return a.position! - b.position!;
      }));
    });

    it("should have sequential positions starting at 1 for one pot", () => {
      const result = validatePotPfs(
        mockPotPfsOneDiv,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        result.potPfs.map((potPf) => potPf.position)
      ).toEqual([1, 2, 3]);
    });

    it("should have sequential positions starting at 1 for each pot", () => {
      const result = validatePotPfs(
        mockPotPfsTwoDivs,
        potIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      const pot1Pfs = result.potPfs.filter(
        (potPf) => potPf.pot_id === potId1,
      );

      const pot2Pfs = result.potPfs.filter(
        (potPf) => potPf.pot_id === potId2,
      );

      expect(
        pot1Pfs.map((potPf) => potPf.position)
      ).toEqual([1, 2, 3]);

      expect(
        pot2Pfs.map((potPf) => potPf.position)
      ).toEqual([1, 2, 3]);
    });

    it("should sanitize amount values", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        amount: "55.000" as any,
      };

      const result: validPotPfsType = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.potPfs[1].amount).toBe(55);
    });

    it("should return ErrorCode.MISSING_DATA when potPfs is empty", () => {
      const result = validatePotPfs(
        [],
        potIds,
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.potPfs).toEqual([]);
    });

    it("should return ErrorCode.MISSING_DATA when potIds is empty", () => {
      const result = validatePotPfs(
        mockPotPfsOneDiv,
        [],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.potPfs).toEqual([]);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        id: '<script>alert("xss")</script>',
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id format is invalid", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        pot_id: "abc",
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id is valid but not in potIds", () => {
      const otherPotId = "pot_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        pot_id: otherPotId,
        position: 1,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should allow potPfs for multiple pot_id values when all are in potIds", () => {
      const result = validatePotPfs(
        mockPotPfsTwoDivs,
        potIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        new Set(result.potPfs.map((potPf) => potPf.pot_id)),
      ).toEqual(new Set([potId1, potId2]));
    });

    it("should return ErrorCode.MISSING_DATA when position is null", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        position: null,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        position: -1,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when first position for a pot is not 1", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[0] = {
        ...potPfsToValidate[0],
        position: 2,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is not sequential", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        position: 4,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when positions are not sequential in the second pot", () => {
      const potPfsToValidate = mockPotPfsTwoDivs.map(
        (potPf) => ({ ...potPf }),
      );

      const secondDivPosition2Index =
        potPfsToValidate.findIndex(
          (potPf) =>
            potPf.pot_id === potId2 &&
            potPf.position === 2,
        );

      potPfsToValidate[secondDivPosition2Index] = {
        ...potPfsToValidate[secondDivPosition2Index],
        position: 4,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        potIds,
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount is null", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        amount: null,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        amount: maxMoney + 1,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount increases as position increases", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      // amounts become 100, 125, 50
      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        amount: 125,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.NONE when consecutive positions have the same amount", () => {
      const potPfsToValidate = mockPotPfsOneDiv.map(
        (potPf) => ({ ...potPf }),
      );

      // amounts become 100, 100, 50
      potPfsToValidate[1] = {
        ...potPfsToValidate[1],
        amount: 100,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when amount increases in the second pot", () => {
      const potPfsToValidate = mockPotPfsTwoDivs.map(
        (potPf) => ({ ...potPf }),
      );

      const secondDivPosition2Index =
        potPfsToValidate.findIndex(
          (potPf) =>
            potPf.pot_id === potId2 &&
            potPf.position === 2,
        );

      // potId2 amounts become 200, 250, 100
      potPfsToValidate[secondDivPosition2Index] = {
        ...potPfsToValidate[secondDivPosition2Index],
        amount: 250,
      };

      const result = validatePotPfs(
        potPfsToValidate,
        potIds,
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should reset amount validation when starting a new pot", () => {
      const potPfsToValidate = mockPotPfsTwoDivs.map(
        (potPf) => ({ ...potPf }),
      );

      const result = validatePotPfs(
        potPfsToValidate,
        potIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      const pot1Position3 = result.potPfs.find(
        (potPf) =>
          potPf.pot_id === potId1 &&
          potPf.position === 3,
      );

      const pot2Position1 = result.potPfs.find(
        (potPf) =>
          potPf.pot_id === potId2 &&
          potPf.position === 1,
      );

      expect(pot1Position3?.amount).toBe(50);
      expect(pot2Position1?.amount).toBe(200);
    });   
    
    it("should validate amounts after sorting by pot_id and position", () => {
      const unsortedPotPfs: potPfType[] = [
        { ...mockPotPfsOneDiv[2] }, // position 3, amount 50
        { ...mockPotPfsOneDiv[0] }, // position 1, amount 100
        { ...mockPotPfsOneDiv[1] }, // position 2, amount 75
      ];

      const result = validatePotPfs(
        unsortedPotPfs,
        [potId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        result.potPfs.map((potPf) => potPf.position),
      ).toEqual([1, 2, 3]);

      expect(
        result.potPfs.map((potPf) => potPf.amount),
      ).toEqual([100, 75, 50]);
    });

  });  

});