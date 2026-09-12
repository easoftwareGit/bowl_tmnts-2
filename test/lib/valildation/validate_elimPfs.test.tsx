import {
  exportedForTesting,
  isElimPfSaveDataType,
  sanitizeElimPf,
  validateElimPf,
  validateElimPfs,
} from "@/lib/validation/elimPfs/validate";
import { blankElimPf, initElimPf } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/enums/enums";
import type { elimPfDataType, elimPfSaveDataType, elimPfType, validElimPfsType } from "@/lib/types/types";
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

  describe("isElimPfSaveDataType()", () => {
    const elimId1 = "elm_45d884582e7042bb95b4818ccdd9974c";
    const elimId2 = "elm_00000000000000000000000000000000";

    const validElimPfData: elimPfDataType[] = [
      {
        id: "epf_11111111111111111111111111111111",
        elim_id: elimId1,
        position: 1,
        amount: 100,
      },
      {
        id: "epf_22222222222222222222222222222222",
        elim_id: elimId1,
        position: 2,
        amount: 50,
      },
      {
        id: "epf_33333333333333333333333333333333",
        elim_id: elimId2,
        position: 1,
        amount: 200,
      },
      {
        id: "epf_44444444444444444444444444444444",
        elim_id: elimId2,
        position: 2,
        amount: 100,
      },
    ];

    const validSaveData: elimPfSaveDataType = {
      elimPfData: validElimPfData,
      elimIds: [elimId1, elimId2],
    };

    it("should return true when value is a valid elimPfSaveDataType", () => {
      expect(isElimPfSaveDataType(validSaveData)).toBe(true);
    });

    it("should return true when elimPfData is an empty array", () => {
      const data = {
        ...validSaveData,
        elimPfData: [],
      };

      expect(isElimPfSaveDataType(data)).toBe(true);
    });

    it("should return true when elimPfData is an empty array", () => {
      const data: elimPfSaveDataType = {
        elimPfData: [],
        elimIds: [elimId1],
      };

      expect(isElimPfSaveDataType(data)).toBe(true);
    });

    it("should return true when elimIds is an empty array", () => {
      const data = {
        ...validSaveData,
        elimIds: [],
      };

      expect(isElimPfSaveDataType(data)).toBe(true);
    });

    it("should return false when value is null", () => {
      expect(isElimPfSaveDataType(null)).toBe(false);
    });

    it("should return false when value is not an object", () => {
      expect(isElimPfSaveDataType("invalid")).toBe(false);
      expect(isElimPfSaveDataType(123)).toBe(false);
      expect(isElimPfSaveDataType(true)).toBe(false);
    });

    it("should return false when elimPfData is missing", () => {
      const data = {
        elimIds: validSaveData.elimIds,
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when elimPfData is not an array", () => {
      const data = {
        ...validSaveData,
        elimPfData: "invalid",
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in elimPfData is null", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          ...validElimPfData,
          null,
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in elimPfData is not an object", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          ...validElimPfData,
          "invalid",
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a elimPfData item is missing id", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          {
            elim_id: elimId1,
            position: 1,
            amount: 100,
          },
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a elimPfData id is not a string", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          {
            ...validElimPfData[0],
            id: 123,
          },
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a elimPfData item is missing elim_id", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          {
            id: validElimPfData[0].id,
            position: 1,
            amount: 100,
          },
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a elimPfData elim_id is not a string", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          {
            ...validElimPfData[0],
            elim_id: 123,
          },
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a elimPfData item is missing position", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          {
            id: validElimPfData[0].id,
            elim_id: elimId1,
            amount: 100,
          },
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a elimPfData position is not a number", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          {
            ...validElimPfData[0],
            position: "1",
          },
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a elimPfData item is missing amount", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          {
            id: validElimPfData[0].id,
            elim_id: elimId1,
            position: 1,
          },
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when a elimPfData amount is not a number", () => {
      const data = {
        ...validSaveData,
        elimPfData: [
          {
            ...validElimPfData[0],
            amount: "100.00",
          },
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when elimIds is missing", () => {
      const data = {
        elimPfData: validElimPfData,
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when elimIds is not an array", () => {
      const data = {
        ...validSaveData,
        elimIds: elimId1,
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });

    it("should return false when an item in elimIds is not a string", () => {
      const data = {
        ...validSaveData,
        elimIds: [
          elimId1,
          123,
        ],
      };

      expect(isElimPfSaveDataType(data)).toBe(false);
    });
  });  

  describe("validateElimPfs()", () => {
    const elimId1 = "elm_45d884582e7042bb95b4818ccdd9974c";
    const elimId2 = "elm_00000000000000000000000000000000";

    const elimIds = [elimId1, elimId2];

    const mockElimPfsOneElim: elimPfType[] = [
      {
        ...validElimPf,
        id: "epf_11111111111111111111111111111111",
        elim_id: elimId1,
        position: 1,
        amount: 100,
      },
      {
        ...validElimPf,
        id: "epf_22222222222222222222222222222222",
        elim_id: elimId1,
        position: 2,
        amount: 75,
      },
      {
        ...validElimPf,
        id: "epf_33333333333333333333333333333333",
        elim_id: elimId1,
        position: 3,
        amount: 50,
      },
    ];

    const mockElimPfsTwoElims: elimPfType[] = [
      {
        ...validElimPf,
        id: "epf_11111111111111111111111111111111",
        elim_id: elimId1,
        position: 1,
        amount: 100,
      },
      {
        ...validElimPf,
        id: "epf_22222222222222222222222222222222",
        elim_id: elimId1,
        position: 2,
        amount: 75,
      },
      {
        ...validElimPf,
        id: "epf_33333333333333333333333333333333",
        elim_id: elimId1,
        position: 3,
        amount: 50,
      },
      {
        ...validElimPf,
        id: "epf_44444444444444444444444444444444",
        elim_id: elimId2,
        position: 1,
        amount: 200,
      },
      {
        ...validElimPf,
        id: "epf_55555555555555555555555555555555",
        elim_id: elimId2,
        position: 2,
        amount: 150,
      },
      {
        ...validElimPf,
        id: "epf_66666666666666666666666666666666",
        elim_id: elimId2,
        position: 3,
        amount: 100,
      },
    ];

    it("should return ErrorCode.NONE when all data is valid for one elim", () => {
      const result = validateElimPfs(
        mockElimPfsOneElim,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.elimPfs).toHaveLength(3);
    });

    it("should return ErrorCode.NONE when all data is valid for two elims", () => {
      const result = validateElimPfs(
        mockElimPfsTwoElims,
        elimIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.elimPfs).toHaveLength(6);
    });

    it("should return sorted elimPfs by elim_id, then position", () => {
      const unsortedElimPfs: elimPfType[] = [
        mockElimPfsTwoElims[5],
        mockElimPfsTwoElims[2],
        mockElimPfsTwoElims[3],
        mockElimPfsTwoElims[0],
        mockElimPfsTwoElims[4],
        mockElimPfsTwoElims[1],
      ];

      const result = validateElimPfs(
        unsortedElimPfs,
        elimIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(result.elimPfs.map((elimPf) => ({
        elim_id: elimPf.elim_id,
        position: elimPf.position,
      }))).toEqual([
        { elim_id: elimId2, position: 1 },
        { elim_id: elimId2, position: 2 },
        { elim_id: elimId2, position: 3 },
        { elim_id: elimId1, position: 1 },
        { elim_id: elimId1, position: 2 },
        { elim_id: elimId1, position: 3 },
      ].toSorted((a, b) => {
        const elimCompare = a.elim_id.localeCompare(b.elim_id);

        if (elimCompare !== 0) {
          return elimCompare;
        }

        return a.position! - b.position!;
      }));
    });

    it("should have sequential positions starting at 1 for one elim", () => {
      const result = validateElimPfs(
        mockElimPfsOneElim,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        result.elimPfs.map((elimPf) => elimPf.position)
      ).toEqual([1, 2, 3]);
    });

    it("should have sequential positions starting at 1 for each elim", () => {
      const result = validateElimPfs(
        mockElimPfsTwoElims,
        elimIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      const elim1Pfs = result.elimPfs.filter(
        (elimPf) => elimPf.elim_id === elimId1,
      );

      const elim2Pfs = result.elimPfs.filter(
        (elimPf) => elimPf.elim_id === elimId2,
      );

      expect(
        elim1Pfs.map((elimPf) => elimPf.position)
      ).toEqual([1, 2, 3]);

      expect(
        elim2Pfs.map((elimPf) => elimPf.position)
      ).toEqual([1, 2, 3]);
    });

    it("should sanitize amount values", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        amount: "55.000" as any,
      };

      const result: validElimPfsType = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.elimPfs[1].amount).toBe(55);
    });

    it("should return ErrorCode.MISSING_DATA when elimPfs is empty", () => {
      const result = validateElimPfs(
        [],
        elimIds,
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.elimPfs).toEqual([]);
    });

    it("should return ErrorCode.MISSING_DATA when elimIds is empty", () => {
      const result = validateElimPfs(
        mockElimPfsOneElim,
        [],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.elimPfs).toEqual([]);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        id: '<script>alert("xss")</script>',
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when elim_id format is invalid", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        elim_id: "abc",
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when elim_id is valid but not in elimIds", () => {
      const otherElimId = "elm_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        elim_id: otherElimId,
        position: 1,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should allow elimPfs for multiple elim_id values when all are in elimIds", () => {
      const result = validateElimPfs(
        mockElimPfsTwoElims,
        elimIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        new Set(result.elimPfs.map((elimPf) => elimPf.elim_id)),
      ).toEqual(new Set([elimId1, elimId2]));
    });

    it("should return ErrorCode.MISSING_DATA when position is null", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        position: null,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        position: -1,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when first position for a elim is not 1", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[0] = {
        ...elimPfsToValidate[0],
        position: 2,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when position is not sequential", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        position: 4,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when positions are not sequential in the second elim", () => {
      const elimPfsToValidate = mockElimPfsTwoElims.map(
        (elimPf) => ({ ...elimPf }),
      );

      const secondElimPosition2Index =
        elimPfsToValidate.findIndex(
          (elimPf) =>
            elimPf.elim_id === elimId2 &&
            elimPf.position === 2,
        );

      elimPfsToValidate[secondElimPosition2Index] = {
        ...elimPfsToValidate[secondElimPosition2Index],
        position: 4,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        elimIds,
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount is null", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        amount: null,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        amount: maxMoney + 1,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount increases as position increases", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      // amounts become 100, 125, 50
      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        amount: 125,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.NONE when consecutive positions have the same amount", () => {
      const elimPfsToValidate = mockElimPfsOneElim.map(
        (elimPf) => ({ ...elimPf }),
      );

      // amounts become 100, 100, 50
      elimPfsToValidate[1] = {
        ...elimPfsToValidate[1],
        amount: 100,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when amount increases in the second elim", () => {
      const elimPfsToValidate = mockElimPfsTwoElims.map(
        (elimPf) => ({ ...elimPf }),
      );

      const secondElimPosition2Index =
        elimPfsToValidate.findIndex(
          (elimPf) =>
            elimPf.elim_id === elimId2 &&
            elimPf.position === 2,
        );

      // elimId2 amounts become 200, 250, 100
      elimPfsToValidate[secondElimPosition2Index] = {
        ...elimPfsToValidate[secondElimPosition2Index],
        amount: 250,
      };

      const result = validateElimPfs(
        elimPfsToValidate,
        elimIds,
      );

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should reset amount validation when starting a new elim", () => {
      const elimPfsToValidate = mockElimPfsTwoElims.map(
        (elimPf) => ({ ...elimPf }),
      );

      const result = validateElimPfs(
        elimPfsToValidate,
        elimIds,
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      const elim1Position3 = result.elimPfs.find(
        (elimPf) =>
          elimPf.elim_id === elimId1 &&
          elimPf.position === 3,
      );

      const elim2Position1 = result.elimPfs.find(
        (elimPf) =>
          elimPf.elim_id === elimId2 &&
          elimPf.position === 1,
      );

      expect(elim1Position3?.amount).toBe(50);
      expect(elim2Position1?.amount).toBe(200);
    });   
    
    it("should validate amounts after sorting by elim_id and position", () => {
      const unsortedElimPfs: elimPfType[] = [
        { ...mockElimPfsOneElim[2] }, // position 3, amount 50
        { ...mockElimPfsOneElim[0] }, // position 1, amount 100
        { ...mockElimPfsOneElim[1] }, // position 2, amount 75
      ];

      const result = validateElimPfs(
        unsortedElimPfs,
        [elimId1],
      );

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(
        result.elimPfs.map((elimPf) => elimPf.position),
      ).toEqual([1, 2, 3]);

      expect(
        result.elimPfs.map((elimPf) => elimPf.amount),
      ).toEqual([100, 75, 50]);
    });

  });  

});