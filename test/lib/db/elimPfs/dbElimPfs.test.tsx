// Tests for src/lib/db/elimPfs/dbElimPfs.ts using a mocked axios instance module.
// No database or server needed.
import { privateApi } from "@/lib/api/axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../testApi";
import {
  extractElimPfs,
  getAllElimPfsForTmnt,
  updateAllElimPfsForTmnt,
} from "@/lib/db/elimPfs/dbElimPfs";
import { blankElimPf, initElimPf } from "@/lib/db/initVals";
import type { elimPfType, tmntElimPfSaveDataType } from "@/lib/types/types";
import { cloneDeep } from "lodash";
import { maxMoney, maxPosition } from "@/lib/validation/constants";

// Replace the axios instance with mock functions each test can control
jest.mock("@/lib/api/axios", () => ({
  privateApi: { get: jest.fn(), put: jest.fn() },
}));
const mockGet = privateApi.get as jest.Mock;
const mockPut = privateApi.put as jest.Mock;

// same url logic as dbElimPfs.ts; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBaseElimPfsApi
  ? testBaseElimPfsApi
  : baseElimPfsApi;
const tmntUrl = url + "/tmnt/";

const notFoundElimId = "elm_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// Looks like the error axios rejects with for a non-2xx response.
// AxiosError extends Error, and its message is
// "Request failed with status code <status>".
const axiosError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    name: "AxiosError",
    isAxiosError: true,
    code: status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST",
    response: { status, data: {} },
  });

const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const pmElimId = "elm_45d884582e7042bb95b4818ccdd9974c";
const pmElimPf1: elimPfType = {
  ...initElimPf,
  id: "epf_59eac0c17bf74348b44041e97469ad76",
  elim_id: pmElimId,
  position: 1,
  amount: 50,
};
const pmElimPf2: elimPfType = {
  ...initElimPf,
  id: "epf_0fed31aae5374e6690b6535ced1ebff5",
  elim_id: pmElimId,
  position: 2,
  amount: 20,
};
const validElimIds: string[] = [pmElimId];

// what the API sends back (plain JSON, only the api fields)
const apiElimPfFrom = (elimPf: elimPfType) => ({
  id: elimPf.id,
  elim_id: elimPf.elim_id,
  position: elimPf.position,
  amount: elimPf.amount,
});

// what extractElimPfs returns for an API elimPf
const mappedElimPfFrom = (elimPf: elimPfType): elimPfType => ({
  ...blankElimPf,
  ...apiElimPfFrom(elimPf),
});

describe("dbElimPfs", () => {
  beforeEach(() => {
    // jest config does not auto-reset mocks
    mockGet.mockReset();
    mockPut.mockReset();
  });

  describe("extractElimPfs()", () => {
    it("should extract elimPfs and convert strings to numbers", () => {
      const rawElimPfs = [
        {
          id: "epf_01234567890123456789012345678901",
          elim_id: "elm_01234567890123456789012345678901",
          position: "1",
          amount: "1234.56",
        },
        {
          id: "epf_01234567890123456789012345678902",
          elim_id: "elm_01234567890123456789012345678901",
          position: "2",
          amount: "234.56",
        },
      ];

      const elimPfs = extractElimPfs(rawElimPfs);

      expect(elimPfs).toEqual([
        {
          ...blankElimPf,
          id: "epf_01234567890123456789012345678901",
          elim_id: "elm_01234567890123456789012345678901",
          position: 1,
          amount: 1234.56,
        },
        {
          ...blankElimPf,
          id: "epf_01234567890123456789012345678902",
          elim_id: "elm_01234567890123456789012345678901",
          position: 2,
          amount: 234.56,
        },
      ]);
    });

    it("should fill missing fields with empty strings and nulls", () => {
      const elimPfs = extractElimPfs([{ id: pmElimPf1.id }]);

      expect(elimPfs).toEqual([
        {
          ...blankElimPf,
          id: pmElimPf1.id,
          elim_id: "",
          position: null,
          amount: null,
        },
      ]);
    });

    it("should return empty array if no elimPfs", () => {
      expect(extractElimPfs([])).toEqual([]);
    });

    it("should return empty array if elimPfs is null", () => {
      expect(extractElimPfs(null)).toEqual([]);
    });

    it("should return empty array if elimPfs is not an array", () => {
      expect(extractElimPfs({})).toEqual([]);
    });
  });

  describe("getAllElimPfsForTmnt()", () => {
    it("should get all elimPfs for a tmnt", async () => {
      mockGet.mockResolvedValue({
        data: { elimPfs: [apiElimPfFrom(pmElimPf1), apiElimPfFrom(pmElimPf2)] },
      });

      const elimPfs = await getAllElimPfsForTmnt(pmTmntId);

      expect(elimPfs).toEqual([
        { ...blankElimPf, ...apiElimPfFrom(pmElimPf1) },
        { ...blankElimPf, ...apiElimPfFrom(pmElimPf2) },
      ]);
    });

    it("should call the tmnt url once with the private api", async () => {
      mockGet.mockResolvedValue({ data: { elimPfs: [] } });

      await getAllElimPfsForTmnt(pmTmntId);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(tmntUrl + pmTmntId);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should return empty array when tmntId is not found", async () => {
      mockGet.mockResolvedValue({ data: { elimPfs: [] } });

      const elimPfs = await getAllElimPfsForTmnt(notFoundTmntId);

      expect(elimPfs).toEqual([]);
    });

    it("should throw when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getAllElimPfsForTmnt(pmTmntId)).rejects.toThrow(
        new Error("getAllElimPfsForTmnt failed: Request failed with status code 500")
      );
    });

    it("should throw error when tmntId is invalid", async () => {
      await expect(getAllElimPfsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw an error when tmntId is valid but not a tmnt id", async () => {
      await expect(getAllElimPfsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw an error when tmntId is null", async () => {
      await expect(
        getAllElimPfsForTmnt(null as unknown as string)
      ).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("updateAllElimPfsForTmnt()", () => {
    const toSaveFrom = (
      elimPfData: elimPfType[],
      elimIds: string[] = validElimIds,
      tmntId: string = pmTmntId
    ): tmntElimPfSaveDataType => ({ elimPfData, elimIds, tmntId });

    it("should update many elimPfs for a tmnt - change amount", async () => {
      const testElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      testElimPfs[0].amount = 350;
      testElimPfs[1].amount = 250;
      mockPut.mockResolvedValue({ data: { elimPfs: testElimPfs.map(apiElimPfFrom) } });

      const updated = await updateAllElimPfsForTmnt(toSaveFrom(testElimPfs));

      expect(updated).toEqual(testElimPfs.map(mappedElimPfFrom));
    });

    it("should update many elimPfs for a tmnt - add row", async () => {
      const testElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      testElimPfs.push({
        ...initElimPf,
        id: "epf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        elim_id: pmElimId,
        position: 3,
        amount: 10,
      });
      mockPut.mockResolvedValue({ data: { elimPfs: testElimPfs.map(apiElimPfFrom) } });

      const updated = await updateAllElimPfsForTmnt(toSaveFrom(testElimPfs));

      expect(updated).toHaveLength(3);
      expect(updated).toEqual(testElimPfs.map(mappedElimPfFrom));
    });

    it("should update many elimPfs for a tmnt - change amount and delete a row", async () => {
      const testElimPfs = cloneDeep([pmElimPf1]);
      testElimPfs[0].amount = 400;
      mockPut.mockResolvedValue({ data: { elimPfs: testElimPfs.map(apiElimPfFrom) } });

      const updated = await updateAllElimPfsForTmnt(toSaveFrom(testElimPfs));

      expect(updated).toEqual(testElimPfs.map(mappedElimPfFrom));
    });

    it("should update many elimPfs for a tmnt - sanitize amount", async () => {
      const testElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      testElimPfs[0].amount = 350.351;
      // the route sanitizes the amount before saving
      const apiElimPfs = [
        { ...apiElimPfFrom(testElimPfs[0]), amount: 350.35 },
        apiElimPfFrom(testElimPfs[1]),
      ];
      mockPut.mockResolvedValue({ data: { elimPfs: apiElimPfs } });

      const updated = await updateAllElimPfsForTmnt(toSaveFrom(testElimPfs));

      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].amount).toBe(pmElimPf2.amount);
    });

    it("should update many elimPfs for a tmnt - empty elimPfs", async () => {
      mockPut.mockResolvedValue({ data: { elimPfs: [] } });

      const updated = await updateAllElimPfsForTmnt(toSaveFrom([]));

      expect(updated).toEqual([]);
    });

    it("should update many elimPfs for a tmnt - four elims", async () => {
      const testTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const testElimId1 = "elm_c01077494c2d4d9da166d697c08c28d2";
      const testElimId2 = "elm_c02077494c2d4d9da166d697c08c28d2";
      const testElimId3 = "elm_c03077494c2d4d9da166d697c08c28d2";
      const testElimId4 = "elm_c04077494c2d4d9da166d697c08c28d2";
      const testElimIds = [testElimId1, testElimId2, testElimId3, testElimId4];
      const toUpdateElimPfs: elimPfType[] = [
        { ...initElimPf, id: "epf_094a1a974e034940b847bef5b67a4b63", elim_id: testElimId1, position: 1, amount: 30 },
        { ...initElimPf, id: "epf_710eda589d3f4106abe78006195e328a", elim_id: testElimId1, position: 2, amount: 20 },
        { ...initElimPf, id: "epf_7e44498e84034bc1a080bfff569680bb", elim_id: testElimId2, position: 1, amount: 25 },
        { ...initElimPf, id: "epf_9032c654c42240d78eeea91de320049f", elim_id: testElimId2, position: 2, amount: 15 },
        { ...initElimPf, id: "epf_7e7d7dca4de74085b609030192aa15a5", elim_id: testElimId3, position: 1, amount: 45 },
        { ...initElimPf, id: "epf_b14d1847af30480aa4123594b0072cb1", elim_id: testElimId3, position: 2, amount: 35 },
        { ...initElimPf, id: "epf_560a2316645844bb9bdeb094911b9e9d", elim_id: testElimId4, position: 1, amount: 20 },
        { ...initElimPf, id: "epf_840e009bd5bd4e4aa389ddd02df50f23", elim_id: testElimId4, position: 2, amount: 5 },
      ];
      mockPut.mockResolvedValue({ data: { elimPfs: toUpdateElimPfs.map(apiElimPfFrom) } });

      const updated = await updateAllElimPfsForTmnt(
        toSaveFrom(toUpdateElimPfs, testElimIds, testTmntId)
      );

      expect(updated).toEqual(toUpdateElimPfs.map(mappedElimPfFrom));
      expect(mockPut).toHaveBeenCalledWith(
        tmntUrl + testTmntId,
        JSON.stringify({ elimPfData: toUpdateElimPfs, elimIds: testElimIds })
      );
    });

    it("should put elimPfData and elimIds (not tmntId) to the tmnt url with the private api", async () => {
      const testElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      mockPut.mockResolvedValue({ data: { elimPfs: testElimPfs.map(apiElimPfFrom) } });

      await updateAllElimPfsForTmnt(toSaveFrom(testElimPfs));

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith(
        tmntUrl + pmTmntId,
        JSON.stringify({ elimPfData: testElimPfs, elimIds: validElimIds })
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should NOT update many elimPfs for a tmnt when tmntId is not found", async () => {
      mockPut.mockRejectedValue(axiosError(409));

      await expect(
        updateAllElimPfsForTmnt(toSaveFrom([pmElimPf1, pmElimPf2], validElimIds, notFoundTmntId))
      ).rejects.toThrow(
        new Error("updateAllElimPfsForTmnt failed: Request failed with status code 409")
      );
    });

    it("should throw when the API call fails", async () => {
      mockPut.mockRejectedValue(axiosError(500));

      await expect(
        updateAllElimPfsForTmnt(toSaveFrom([pmElimPf1, pmElimPf2]))
      ).rejects.toThrow(
        new Error("updateAllElimPfsForTmnt failed: Request failed with status code 500")
      );
    });

    describe("invalid args - throws before calling the API", () => {
      it.each([
        ["tmntId is invalid", { tmntId: "test" }, "Invalid tmnt id"],
        ["tmntId is null", { tmntId: null }, "Invalid tmnt id"],
        ["tmntId is an id, but not a tmnt id", { tmntId: userId }, "Invalid tmnt id"],
        ["elimIds is not an array", { elimIds: pmElimPf1 }, "Invalid elimIds array"],
        ["elimIds is null", { elimIds: null }, "Invalid elimIds array"],
        ["elimPfs is not an array", { elimPfData: pmElimPf1 }, "Invalid elimPfs array"],
        ["elimPfs is null", { elimPfData: null }, "Invalid elimPfs array"],
      ])("should not update when %s", async (_desc, override, expected) => {
        const toSave = {
          ...toSaveFrom(cloneDeep([pmElimPf1, pmElimPf2])),
          ...override,
        } as unknown as tmntElimPfSaveDataType;

        await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(expected);
        expect(mockPut).not.toHaveBeenCalled();
      });
    });

    // The route validates the data. With mocks, these cases become rejections
    // with the status the route answers, so each checks the error is passed on.
    describe("invalid data - route rejects", () => {
      const withElimPf0 = (changes: Partial<elimPfType>): elimPfType[] => {
        const elimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        elimPfs[0] = { ...elimPfs[0], ...changes };
        return elimPfs;
      };

      it.each([
        ["elimIds has invalid id", toSaveFrom([pmElimPf1, pmElimPf2], ["test"]), 422],
        ["elimIds has non string id", toSaveFrom([pmElimPf1, pmElimPf2], [123 as never]), 400],
        ["elimIds are ids, but not elim ids", toSaveFrom([pmElimPf1, pmElimPf2], [userId]), 422],
        ["elim_ids in elimPfs not in elimIds", toSaveFrom([pmElimPf1, pmElimPf2], [notFoundElimId]), 422],
        ["elim_id is valid, but not an elim id", toSaveFrom(withElimPf0({ elim_id: userId })), 422],
        ["elim_id is valid, but not in elimIds", toSaveFrom(withElimPf0({ elim_id: notFoundElimId })), 422],
        ["position is too low", toSaveFrom(withElimPf0({ position: 0 })), 422],
        ["position is too high", toSaveFrom(withElimPf0({ position: maxPosition + 1 })), 422],
        ["position is not a number", toSaveFrom(withElimPf0({ position: "test" as never })), 400],
        ["position is not an integer", toSaveFrom(withElimPf0({ position: 1.5 })), 422],
        ["position is out of sequence", toSaveFrom(withElimPf0({ position: 3 })), 422],
        ["position is missing", toSaveFrom(withElimPf0({ position: null as never })), 400],
        ["amount is too low", toSaveFrom(withElimPf0({ amount: 0 })), 422],
        ["amount is too high", toSaveFrom(withElimPf0({ amount: maxMoney + 1 })), 422],
        ["amount is not a number", toSaveFrom(withElimPf0({ amount: "test" as never })), 400],
        ["amount is missing", toSaveFrom(withElimPf0({ amount: null as never })), 400],
        ["amount is not decending", toSaveFrom(withElimPf0({ amount: pmElimPf2.amount! - 1 })), 422],
      ])("should NOT update when %s", async (_desc, toSave, status) => {
        mockPut.mockRejectedValue(axiosError(status));

        await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
          new Error(`updateAllElimPfsForTmnt failed: Request failed with status code ${status}`)
        );
        expect(mockPut).toHaveBeenCalledTimes(1);
      });
    });
  });
});
