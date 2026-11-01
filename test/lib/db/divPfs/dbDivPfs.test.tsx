// Tests for src/lib/db/divPfs/dbDivPfs.ts using a mocked axios instance module.
// No database or server needed.
import { privateApi } from "@/lib/api/axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../testApi";
import {
  extractDivPfs,
  getAllDivPfsForTmnt,
  updateAllDivPfsForTmnt,
} from "@/lib/db/divPfs/dbDivPfs";
import { blankDivPf, initDivPf } from "@/lib/db/initVals";
import type { divPfType, tmntDivPfSaveDataType } from "@/lib/types/types";
import { cloneDeep } from "lodash";
import { maxMoney, maxPosition } from "@/lib/validation/constants";

// Replace the axios instance with mock functions each test can control
jest.mock("@/lib/api/axios", () => ({
  privateApi: { get: jest.fn(), put: jest.fn() },
}));
const mockGet = privateApi.get as jest.Mock;
const mockPut = privateApi.put as jest.Mock;

// same url logic as dbDivPfs.ts; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBaseDivPfsApi
  ? testBaseDivPfsApi
  : baseDivPfsApi;
const tmntUrl = url + "/tmnt/";

const notFoundDivId = "div_01234567890123456789012345678901";
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
const pmDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const pmDivPf1: divPfType = {
  ...initDivPf,
  id: "dpf_ce55c52bd60d4943bb747590a03c9732",
  div_id: pmDivId,
  position: 1,
  amount: 300,
};
const pmDivPf2: divPfType = {
  ...initDivPf,
  id: "dpf_ce55c52bd60d4943bb747590a03c9733",
  div_id: pmDivId,
  position: 2,
  amount: 200,
};
const validDivIds: string[] = [pmDivId];

// what the API sends back (plain JSON, only the api fields)
const apiDivPfFrom = (divPf: divPfType) => ({
  id: divPf.id,
  div_id: divPf.div_id,
  position: divPf.position,
  amount: divPf.amount,
});

// what extractDivPfs returns for an API divPf
const mappedDivPfFrom = (divPf: divPfType): divPfType => ({
  ...blankDivPf,
  ...apiDivPfFrom(divPf),
});

describe("dbDivPfs", () => {
  beforeEach(() => {
    // jest config does not auto-reset mocks
    mockGet.mockReset();
    mockPut.mockReset();
  });

  describe("extractDivPfs()", () => {
    it("should extract divPfs and convert strings to numbers", () => {
      const rawDivPfs = [
        {
          id: "dpf_01234567890123456789012345678901",
          div_id: "div_01234567890123456789012345678901",
          position: "1",
          amount: "1234.56",
        },
        {
          id: "dpf_01234567890123456789012345678902",
          div_id: "div_01234567890123456789012345678901",
          position: "2",
          amount: "234.56",
        },
      ];

      const divPfs = extractDivPfs(rawDivPfs);

      expect(divPfs).toEqual([
        {
          ...blankDivPf,
          id: "dpf_01234567890123456789012345678901",
          div_id: "div_01234567890123456789012345678901",
          position: 1,
          amount: 1234.56,
        },
        {
          ...blankDivPf,
          id: "dpf_01234567890123456789012345678902",
          div_id: "div_01234567890123456789012345678901",
          position: 2,
          amount: 234.56,
        },
      ]);
    });

    it("should fill missing fields with empty strings and nulls", () => {
      const divPfs = extractDivPfs([{ id: pmDivPf1.id }]);

      expect(divPfs).toEqual([
        {
          ...blankDivPf,
          id: pmDivPf1.id,
          div_id: "",
          position: null,
          amount: null,
        },
      ]);
    });

    it("should return empty array if no divPfs", () => {
      expect(extractDivPfs([])).toEqual([]);
    });

    it("should return empty array if divPfs is null", () => {
      expect(extractDivPfs(null)).toEqual([]);
    });

    it("should return empty array if divPfs is not an array", () => {
      expect(extractDivPfs({})).toEqual([]);
    });
  });

  describe("getAllDivPfsForTmnt()", () => {
    it("should get all divPfs for a tmnt", async () => {
      mockGet.mockResolvedValue({
        data: { divPfs: [apiDivPfFrom(pmDivPf1), apiDivPfFrom(pmDivPf2)] },
      });

      const divPfs = await getAllDivPfsForTmnt(pmTmntId);

      expect(divPfs).toEqual([
        { ...blankDivPf, ...apiDivPfFrom(pmDivPf1) },
        { ...blankDivPf, ...apiDivPfFrom(pmDivPf2) },
      ]);
    });

    it("should call the tmnt url once with the private api", async () => {
      mockGet.mockResolvedValue({ data: { divPfs: [] } });

      await getAllDivPfsForTmnt(pmTmntId);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(tmntUrl + pmTmntId);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should return empty array when tmntId is not found", async () => {
      mockGet.mockResolvedValue({ data: { divPfs: [] } });

      const divPfs = await getAllDivPfsForTmnt(notFoundTmntId);

      expect(divPfs).toEqual([]);
    });

    it("should throw when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getAllDivPfsForTmnt(pmTmntId)).rejects.toThrow(
        new Error("getAllDivPfsForTmnt failed: Request failed with status code 500")
      );
    });

    it("should throw error when tmntId is invalid", async () => {
      await expect(getAllDivPfsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw an error when tmntId is valid but not a tmnt id", async () => {
      await expect(getAllDivPfsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw an error when tmntId is null", async () => {
      await expect(
        getAllDivPfsForTmnt(null as unknown as string)
      ).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("updateAllDivPfsForTmnt()", () => {
    const toSaveFrom = (
      divPfData: divPfType[],
      divIds: string[] = validDivIds,
      tmntId: string = pmTmntId
    ): tmntDivPfSaveDataType => ({ divPfData, divIds, tmntId });

    it("should update many divPfs for a tmnt - change amount", async () => {
      const testDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      testDivPfs[0].amount = 350;
      testDivPfs[1].amount = 250;
      mockPut.mockResolvedValue({ data: { divPfs: testDivPfs.map(apiDivPfFrom) } });

      const updated = await updateAllDivPfsForTmnt(toSaveFrom(testDivPfs));

      expect(updated).toEqual(testDivPfs.map(mappedDivPfFrom));
    });

    it("should update many divPfs for a tmnt - add row", async () => {
      const testDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      testDivPfs.push({
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9734",
        div_id: pmDivId,
        position: 3,
        amount: 100,
      });
      mockPut.mockResolvedValue({ data: { divPfs: testDivPfs.map(apiDivPfFrom) } });

      const updated = await updateAllDivPfsForTmnt(toSaveFrom(testDivPfs));

      expect(updated).toHaveLength(3);
      expect(updated).toEqual(testDivPfs.map(mappedDivPfFrom));
    });

    it("should update many divPfs for a tmnt - change amount and delete a row", async () => {
      const testDivPfs = cloneDeep([pmDivPf1]);
      testDivPfs[0].amount = 400;
      mockPut.mockResolvedValue({ data: { divPfs: testDivPfs.map(apiDivPfFrom) } });

      const updated = await updateAllDivPfsForTmnt(toSaveFrom(testDivPfs));

      expect(updated).toEqual(testDivPfs.map(mappedDivPfFrom));
    });

    it("should update many divPfs for a tmnt - sanitize amount", async () => {
      const testDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      testDivPfs[0].amount = 350.351;
      // the route sanitizes the amount before saving
      const apiDivPfs = [
        { ...apiDivPfFrom(testDivPfs[0]), amount: 350.35 },
        apiDivPfFrom(testDivPfs[1]),
      ];
      mockPut.mockResolvedValue({ data: { divPfs: apiDivPfs } });

      const updated = await updateAllDivPfsForTmnt(toSaveFrom(testDivPfs));

      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].amount).toBe(pmDivPf2.amount);
    });

    it("should update many divPfs for a tmnt - empty divPfs", async () => {
      mockPut.mockResolvedValue({ data: { divPfs: [] } });

      const updated = await updateAllDivPfsForTmnt(toSaveFrom([]));

      expect(updated).toEqual([]);
    });

    it("should update many divPfs for a tmnt - two divs", async () => {
      const testTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const testDivId1 = "div_578834e04e5e4885bbae79229d8b96e8";
      const testDivId2 = "div_fe72ab97edf8407186c8e6df7f7fb741";
      const toUpdateDivPfs: divPfType[] = [
        { ...initDivPf, id: "dpf_2516979e653f441b92646e7885cb3a50", div_id: testDivId1, position: 1, amount: 300 },
        { ...initDivPf, id: "dpf_2526979e653f441b92646e7885cb3a50", div_id: testDivId1, position: 2, amount: 200 },
        { ...initDivPf, id: "dpf_2536979e653f441b92646e7885cb3a50", div_id: testDivId2, position: 1, amount: 325 },
        { ...initDivPf, id: "dpf_2546979e653f441b92646e7885cb3a50", div_id: testDivId2, position: 2, amount: 225 },
      ];
      mockPut.mockResolvedValue({ data: { divPfs: toUpdateDivPfs.map(apiDivPfFrom) } });

      const updated = await updateAllDivPfsForTmnt(
        toSaveFrom(toUpdateDivPfs, [testDivId1, testDivId2], testTmntId)
      );

      expect(updated).toEqual(toUpdateDivPfs.map(mappedDivPfFrom));
      expect(mockPut).toHaveBeenCalledWith(
        tmntUrl + testTmntId,
        JSON.stringify({ divPfData: toUpdateDivPfs, divIds: [testDivId1, testDivId2] })
      );
    });

    it("should put divPfData and divIds (not tmntId) to the tmnt url with the private api", async () => {
      const testDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      mockPut.mockResolvedValue({ data: { divPfs: testDivPfs.map(apiDivPfFrom) } });

      await updateAllDivPfsForTmnt(toSaveFrom(testDivPfs));

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith(
        tmntUrl + pmTmntId,
        JSON.stringify({ divPfData: testDivPfs, divIds: validDivIds })
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should NOT update many divPfs for a tmnt when tmntId is not found", async () => {
      mockPut.mockRejectedValue(axiosError(409));

      await expect(
        updateAllDivPfsForTmnt(toSaveFrom([pmDivPf1, pmDivPf2], validDivIds, notFoundTmntId))
      ).rejects.toThrow(
        new Error("updateAllDivPfsForTmnt failed: Request failed with status code 409")
      );
    });

    it("should throw when the API call fails", async () => {
      mockPut.mockRejectedValue(axiosError(500));

      await expect(
        updateAllDivPfsForTmnt(toSaveFrom([pmDivPf1, pmDivPf2]))
      ).rejects.toThrow(
        new Error("updateAllDivPfsForTmnt failed: Request failed with status code 500")
      );
    });

    describe("invalid args - throws before calling the API", () => {
      it.each([
        ["tmntId is invalid", { tmntId: "test" }, "Invalid tmnt id"],
        ["tmntId is null", { tmntId: null }, "Invalid tmnt id"],
        ["tmntId is an id, but not a tmnt id", { tmntId: userId }, "Invalid tmnt id"],
        ["divIds is not an array", { divIds: pmDivPf1 }, "Invalid divIds array"],
        ["divIds is null", { divIds: null }, "Invalid divIds array"],
        ["divPfs is not an array", { divPfData: pmDivPf1 }, "Invalid divPfs array"],
        ["divPfs is null", { divPfData: null }, "Invalid divPfs array"],
      ])("should not update when %s", async (_desc, override, expected) => {
        const toSave = {
          ...toSaveFrom(cloneDeep([pmDivPf1, pmDivPf2])),
          ...override,
        } as unknown as tmntDivPfSaveDataType;

        await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow(expected);
        expect(mockPut).not.toHaveBeenCalled();
      });
    });

    // The route validates the data. With mocks, these cases become rejections
    // with the status the route answers, so each checks the error is passed on.
    describe("invalid data - route rejects", () => {
      const withDivPf0 = (changes: Partial<divPfType>): divPfType[] => {
        const divPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        divPfs[0] = { ...divPfs[0], ...changes };
        return divPfs;
      };

      it.each([
        ["divIds has invalid id", toSaveFrom([pmDivPf1, pmDivPf2], ["test"]), 422],
        ["divIds has non string id", toSaveFrom([pmDivPf1, pmDivPf2], [123 as never]), 400],
        ["divIds are ids, but not div ids", toSaveFrom([pmDivPf1, pmDivPf2], [userId]), 422],
        ["div_ids in divPfs not in divIds", toSaveFrom([pmDivPf1, pmDivPf2], [notFoundDivId]), 422],
        ["div_id is valid, but not a div id", toSaveFrom(withDivPf0({ div_id: userId })), 422],
        ["div_id is valid, but not in divIds", toSaveFrom(withDivPf0({ div_id: notFoundDivId })), 422],
        ["position is too low", toSaveFrom(withDivPf0({ position: 0 })), 422],
        ["position is too high", toSaveFrom(withDivPf0({ position: maxPosition + 1 })), 422],
        ["position is not a number", toSaveFrom(withDivPf0({ position: "test" as never })), 400],
        ["position is not an integer", toSaveFrom(withDivPf0({ position: 1.5 })), 422],
        ["position is out of sequence", toSaveFrom(withDivPf0({ position: 3 })), 422],
        ["position is missing", toSaveFrom(withDivPf0({ position: null as never })), 400],
        ["amount is too low", toSaveFrom(withDivPf0({ amount: 0 })), 422],
        ["amount is too high", toSaveFrom(withDivPf0({ amount: maxMoney + 1 })), 422],
        ["amount is not a number", toSaveFrom(withDivPf0({ amount: "test" as never })), 400],
        ["amount is missing", toSaveFrom(withDivPf0({ amount: null as never })), 400],
        ["amount is not decending", toSaveFrom(withDivPf0({ amount: pmDivPf2.amount! - 1 })), 422],
      ])("should NOT update when %s", async (_desc, toSave, status) => {
        mockPut.mockRejectedValue(axiosError(status));

        await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow(
          new Error(`updateAllDivPfsForTmnt failed: Request failed with status code ${status}`)
        );
        expect(mockPut).toHaveBeenCalledTimes(1);
      });
    });
  });
});
