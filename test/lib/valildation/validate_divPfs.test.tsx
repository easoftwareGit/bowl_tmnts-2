import {
  exportedForTesting,
  isDivPfSaveDataType,
  sanitizeDivPf,
  validateDivPf,
  validateDivPfs,
} from "@/lib/validation/divPfs/validate";
import { blankDivPf, initDivPf } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/enums/enums";
import type { divPfDataType, divPfSaveDataType, divPfType, validDivPfsType } from "@/lib/types/types";
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

  describe("isDivPfSaveDataType()", () => {
    const divId1 = "div_f30aea2c534f4cfe87f4315531cef8ef";
    const divId2 = "div_00000000000000000000000000000000";

    const validDivPfData: divPfDataType[] = [
      {
        id: "dpf_11111111111111111111111111111111",
        div_id: divId1,
        position: 1,
        amount: 100,
      },
      {
        id: "dpf_22222222222222222222222222222222",
        div_id: divId1,
        position: 2,
        amount: 50,
      },
      {
        id: "dpf_33333333333333333333333333333333",
        div_id: divId2,
        position: 1,
        amount: 200,
      },
      {
        id: "dpf_44444444444444444444444444444444",
        div_id: divId2,
        position: 2,
        amount: 100,
      },
    ];

    const validSaveData: divPfSaveDataType = {
      divPfData: validDivPfData,
      divIds: [divId1, divId2],
    };

    it("should return true when value is a valid divPfSaveDataType", () => {
      expect(isDivPfSaveDataType(validSaveData)).toBe(true);
    });

    it("should return true when divPfData is an empty array", () => {
      const data = {
        ...validSaveData,
        divPfData: [],
      };

      expect(isDivPfSaveDataType(data)).toBe(true);
    });

    it("should return true when divPfData is an empty array", () => {
      const data: divPfSaveDataType = {
        divPfData: [],
        divIds: [divId1],
      };

      expect(isDivPfSaveDataType(data)).toBe(true);
    });

    it("should return true when divIds is an empty array", () => {
      const data = {
        ...validSaveData,
        divIds: [],
      };

      expect(isDivPfSaveDataType(data)).toBe(true);
    });

    it("should return false when value is null", () => {
      expect(isDivPfSaveDataType(null)).toBe(false);
    });

    it("should return false when value is not an object", () => {
      expect(isDivPfSaveDataType("invalid")).toBe(false);
      expect(isDivPfSaveDataType(123)).toBe(false);
      expect(isDivPfSaveDataType(true)).toBe(false);
    });

    it("should return false when divPfData is missing", () => {
      const data = {
        divIds: validSaveData.divIds,
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when divPfData is not an array", () => {
      const data = {
        ...validSaveData,
        divPfData: "invalid",
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in divPfData is null", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          ...validDivPfData,
          null,
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in divPfData is not an object", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          ...validDivPfData,
          "invalid",
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a divPfData item is missing id", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          {
            div_id: divId1,
            position: 1,
            amount: 100,
          },
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a divPfData id is not a string", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          {
            ...validDivPfData[0],
            id: 123,
          },
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a divPfData item is missing div_id", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          {
            id: validDivPfData[0].id,
            position: 1,
            amount: 100,
          },
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a divPfData div_id is not a string", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          {
            ...validDivPfData[0],
            div_id: 123,
          },
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a divPfData item is missing position", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          {
            id: validDivPfData[0].id,
            div_id: divId1,
            amount: 100,
          },
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a divPfData position is not a number", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          {
            ...validDivPfData[0],
            position: "1",
          },
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a divPfData item is missing amount", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          {
            id: validDivPfData[0].id,
            div_id: divId1,
            position: 1,
          },
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a divPfData amount is not a number", () => {
      const data = {
        ...validSaveData,
        divPfData: [
          {
            ...validDivPfData[0],
            amount: "100.00",
          },
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when divIds is missing", () => {
      const data = {
        divPfData: validDivPfData,
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when divIds is not an array", () => {
      const data = {
        ...validSaveData,
        divIds: divId1,
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in divIds is not a string", () => {
      const data = {
        ...validSaveData,
        divIds: [
          divId1,
          123,
        ],
      };

      expect(isDivPfSaveDataType(data)).toBe(false);
    });
  });  

  describe("validateDivPfs()", () => {
    const divId1 = "div_f30aea2c534f4cfe87f4315531cef8ef";
    const divId2 = "div_00000000000000000000000000000000";

    const divIds = [divId1, divId2];

    const mockDivPfsOneDiv: divPfType[] = [
      {
        ...validDivPf,
        id: "dpf_11111111111111111111111111111111",
        div_id: divId1,
        position: 1,
        amount: 100,
      },
      {
        ...validDivPf,
        id: "dpf_22222222222222222222222222222222",
        div_id: divId1,
        position: 2,
        amount: 75,
      },
      {
        ...validDivPf,
        id: "dpf_33333333333333333333333333333333",
        div_id: divId1,
        position: 3,
        amount: 50,
      },
    ];

    const mockDivPfsTwoDivs: divPfType[] = [
      {
        ...validDivPf,
        id: "dpf_11111111111111111111111111111111",
        div_id: divId1,
        position: 1,
        amount: 100,
      },
      {
        ...validDivPf,
        id: "dpf_22222222222222222222222222222222",
        div_id: divId1,
        position: 2,
        amount: 75,
      },
      {
        ...validDivPf,
        id: "dpf_33333333333333333333333333333333",
        div_id: divId1,
        position: 3,
        amount: 50,
      },
      {
        ...validDivPf,
        id: "dpf_44444444444444444444444444444444",
        div_id: divId2,
        position: 1,
        amount: 200,
      },
      {
        ...validDivPf,
        id: "dpf_55555555555555555555555555555555",
        div_id: divId2,
        position: 2,
        amount: 150,
      },
      {
        ...validDivPf,
        id: "dpf_66666666666666666666666666666666",
        div_id: divId2,
        position: 3,
        amount: 100,
      },
    ];

    it("should return ErrorCode.NONE when all data is valid for one division", () => {
      const result = validateDivPfs(
        mockDivPfsOneDiv,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.divPfs).toHaveLength(3);
    });

    it("should return ErrorCode.NONE when all data is valid for two divisions", () => {
      const result = validateDivPfs(
        mockDivPfsTwoDivs,
        divIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.divPfs).toHaveLength(6);
    });

    it("should return sorted divPfs by div_id, then position", () => {
      const unsortedDivPfs: divPfType[] = [
        mockDivPfsTwoDivs[5],
        mockDivPfsTwoDivs[2],
        mockDivPfsTwoDivs[3],
        mockDivPfsTwoDivs[0],
        mockDivPfsTwoDivs[4],
        mockDivPfsTwoDivs[1],
      ];

      const result = validateDivPfs(
        unsortedDivPfs,
        divIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(result.divPfs.map((divPf) => ({
        div_id: divPf.div_id,
        position: divPf.position,
      }))).toEqual([
        { div_id: divId2, position: 1 },
        { div_id: divId2, position: 2 },
        { div_id: divId2, position: 3 },
        { div_id: divId1, position: 1 },
        { div_id: divId1, position: 2 },
        { div_id: divId1, position: 3 },
      ].toSorted((a, b) => {
        const divCompare = a.div_id.localeCompare(b.div_id);

        if (divCompare !== 0) {
          return divCompare;
        }

        return a.position! - b.position!;
      }));
    });

    it("should have sequential positions starting at 1 for one division", () => {
      const result = validateDivPfs(
        mockDivPfsOneDiv,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        result.divPfs.map((divPf) => divPf.position)
      ).toEqual([1, 2, 3]);
    });

    it("should have sequential positions starting at 1 for each division", () => {
      const result = validateDivPfs(
        mockDivPfsTwoDivs,
        divIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      const div1Pfs = result.divPfs.filter(
        (divPf) => divPf.div_id === divId1,
      );

      const div2Pfs = result.divPfs.filter(
        (divPf) => divPf.div_id === divId2,
      );

      expect(
        div1Pfs.map((divPf) => divPf.position)
      ).toEqual([1, 2, 3]);

      expect(
        div2Pfs.map((divPf) => divPf.position)
      ).toEqual([1, 2, 3]);
    });

    it("should sanitize amount values", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        amount: "55.000" as any,
      };

      const result: validDivPfsType = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.divPfs[1].amount).toBe(55);
    });

    it("should return ErrorCode.MISSING_DATA when divPfs is empty", () => {
      const result = validateDivPfs(
        [],
        divIds,
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.divPfs).toEqual([]);
    });

    it("should return ErrorCode.MISSING_DATA when divIds is empty", () => {
      const result = validateDivPfs(
        mockDivPfsOneDiv,
        [],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.divPfs).toEqual([]);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        id: '<script>alert("xss")</script>',
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when div_id format is invalid", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        div_id: "abc",
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when div_id is valid but not in divIds", () => {
      const otherDivId = "div_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        div_id: otherDivId,
        position: 1,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should allow divPfs for multiple div_id values when all are in divIds", () => {
      const result = validateDivPfs(
        mockDivPfsTwoDivs,
        divIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        new Set(result.divPfs.map((divPf) => divPf.div_id)),
      ).toEqual(new Set([divId1, divId2]));
    });

    it("should return ErrorCode.MISSING_DATA when position is null", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        position: null,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        position: -1,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when first position for a division is not 1", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[0] = {
        ...divPfsToValidate[0],
        position: 2,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is not sequential", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        position: 4,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when positions are not sequential in the second division", () => {
      const divPfsToValidate = mockDivPfsTwoDivs.map(
        (divPf) => ({ ...divPf }),
      );

      const secondDivPosition2Index =
        divPfsToValidate.findIndex(
          (divPf) =>
            divPf.div_id === divId2 &&
            divPf.position === 2,
        );

      divPfsToValidate[secondDivPosition2Index] = {
        ...divPfsToValidate[secondDivPosition2Index],
        position: 4,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        divIds,
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount is null", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        amount: null,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        amount: maxMoney + 1,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount increases as position increases", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      // amounts become 100, 125, 50
      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        amount: 125,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.NONE when consecutive positions have the same amount", () => {
      const divPfsToValidate = mockDivPfsOneDiv.map(
        (divPf) => ({ ...divPf }),
      );

      // amounts become 100, 100, 50
      divPfsToValidate[1] = {
        ...divPfsToValidate[1],
        amount: 100,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when amount increases in the second division", () => {
      const divPfsToValidate = mockDivPfsTwoDivs.map(
        (divPf) => ({ ...divPf }),
      );

      const secondDivPosition2Index =
        divPfsToValidate.findIndex(
          (divPf) =>
            divPf.div_id === divId2 &&
            divPf.position === 2,
        );

      // divId2 amounts become 200, 250, 100
      divPfsToValidate[secondDivPosition2Index] = {
        ...divPfsToValidate[secondDivPosition2Index],
        amount: 250,
      };

      const result = validateDivPfs(
        divPfsToValidate,
        divIds,
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should reset amount validation when starting a new division", () => {
      const divPfsToValidate = mockDivPfsTwoDivs.map(
        (divPf) => ({ ...divPf }),
      );

      const result = validateDivPfs(
        divPfsToValidate,
        divIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      const div1Position3 = result.divPfs.find(
        (divPf) =>
          divPf.div_id === divId1 &&
          divPf.position === 3,
      );

      const div2Position1 = result.divPfs.find(
        (divPf) =>
          divPf.div_id === divId2 &&
          divPf.position === 1,
      );

      expect(div1Position3?.amount).toBe(50);
      expect(div2Position1?.amount).toBe(200);
    });   
    
    it("should validate amounts after sorting by div_id and position", () => {
      const unsortedDivPfs: divPfType[] = [
        { ...mockDivPfsOneDiv[2] }, // position 3, amount 50
        { ...mockDivPfsOneDiv[0] }, // position 1, amount 100
        { ...mockDivPfsOneDiv[1] }, // position 2, amount 75
      ];

      const result = validateDivPfs(
        unsortedDivPfs,
        [divId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        result.divPfs.map((divPf) => divPf.position),
      ).toEqual([1, 2, 3]);

      expect(
        result.divPfs.map((divPf) => divPf.amount),
      ).toEqual([100, 75, 50]);
    });

  });  
  
});