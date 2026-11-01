// Tests for src/lib/db/potPfs/dbPotPfs.ts using a mocked axios instance module.
// No database or server needed.
import { privateApi } from "@/lib/api/axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../testApi";
import {
  extractPotPfs,
  getAllPotPfsForTmnt,
  updateAllPotPfsForTmnt,
} from "@/lib/db/potPfs/dbPotPfs";
import { blankPotPf, initPotPf } from "@/lib/db/initVals";
import type { potPfType, tmntPotPfSaveDataType } from "@/lib/types/types";
import { cloneDeep } from "lodash";
import { maxMoney, maxPosition } from "@/lib/validation/constants";

// Replace the axios instance with mock functions each test can control
jest.mock("@/lib/api/axios", () => ({
  privateApi: { get: jest.fn(), put: jest.fn() },
}));
const mockGet = privateApi.get as jest.Mock;
const mockPut = privateApi.put as jest.Mock;

// same url logic as dbPotPfs.ts; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBasePotPfsApi
  ? testBasePotPfsApi
  : basePotPfsApi;
const tmntUrl = url + "/tmnt/";

const notFoundPotId = "pot_01234567890123456789012345678901";
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
const pmPotId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
const pmPotPf1: potPfType = {
  ...initPotPf,
  id: "ppf_59eac0c17bf74348b44041e97469ad76",
  pot_id: pmPotId,
  position: 1,
  amount: 50,
};
const pmPotPf2: potPfType = {
  ...initPotPf,
  id: "ppf_0fed31aae5374e6690b6535ced1ebff5",
  pot_id: pmPotId,
  position: 2,
  amount: 10,
};
const validPotIds: string[] = [pmPotId];

// what the API sends back (plain JSON, only the api fields)
const apiPotPfFrom = (potPf: potPfType) => ({
  id: potPf.id,
  pot_id: potPf.pot_id,
  position: potPf.position,
  amount: potPf.amount,
});

// what extractPotPfs returns for an API potPf
const mappedPotPfFrom = (potPf: potPfType): potPfType => ({
  ...blankPotPf,
  ...apiPotPfFrom(potPf),
});

describe("dbPotPfs", () => {
  beforeEach(() => {
    // jest config does not auto-reset mocks
    mockGet.mockReset();
    mockPut.mockReset();
  });

  describe("extractPotPfs()", () => {
    it("should extract potPfs and convert strings to numbers", () => {
      const rawPotPfs = [
        {
          id: "ppf_01234567890123456789012345678901",
          pot_id: "pot_01234567890123456789012345678901",
          position: "1",
          amount: "1234.56",
        },
        {
          id: "ppf_01234567890123456789012345678902",
          pot_id: "pot_01234567890123456789012345678901",
          position: "2",
          amount: "234.56",
        },
      ];

      const potPfs = extractPotPfs(rawPotPfs);

      expect(potPfs).toEqual([
        {
          ...blankPotPf,
          id: "ppf_01234567890123456789012345678901",
          pot_id: "pot_01234567890123456789012345678901",
          position: 1,
          amount: 1234.56,
        },
        {
          ...blankPotPf,
          id: "ppf_01234567890123456789012345678902",
          pot_id: "pot_01234567890123456789012345678901",
          position: 2,
          amount: 234.56,
        },
      ]);
    });

    it("should fill missing fields with empty strings and nulls", () => {
      const potPfs = extractPotPfs([{ id: pmPotPf1.id }]);

      expect(potPfs).toEqual([
        {
          ...blankPotPf,
          id: pmPotPf1.id,
          pot_id: "",
          position: null,
          amount: null,
        },
      ]);
    });

    it("should return empty array if no potPfs", () => {
      expect(extractPotPfs([])).toEqual([]);
    });

    it("should return empty array if potPfs is null", () => {
      expect(extractPotPfs(null)).toEqual([]);
    });

    it("should return empty array if potPfs is not an array", () => {
      expect(extractPotPfs({})).toEqual([]);
    });
  });

  describe("getAllPotPfsForTmnt()", () => {
    it("should get all potPfs for a tmnt", async () => {
      mockGet.mockResolvedValue({
        data: { potPfs: [apiPotPfFrom(pmPotPf1), apiPotPfFrom(pmPotPf2)] },
      });

      const potPfs = await getAllPotPfsForTmnt(pmTmntId);

      expect(potPfs).toEqual([
        { ...blankPotPf, ...apiPotPfFrom(pmPotPf1) },
        { ...blankPotPf, ...apiPotPfFrom(pmPotPf2) },
      ]);
    });

    it("should call the tmnt url once with the private api", async () => {
      mockGet.mockResolvedValue({ data: { potPfs: [] } });

      await getAllPotPfsForTmnt(pmTmntId);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(tmntUrl + pmTmntId);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should return empty array when tmntId is not found", async () => {
      mockGet.mockResolvedValue({ data: { potPfs: [] } });

      const potPfs = await getAllPotPfsForTmnt(notFoundTmntId);

      expect(potPfs).toEqual([]);
    });

    it("should throw when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getAllPotPfsForTmnt(pmTmntId)).rejects.toThrow(
        new Error("getAllPotPfsForTmnt failed: Request failed with status code 500")
      );
    });

    it("should throw error when tmntId is invalid", async () => {
      await expect(getAllPotPfsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw an error when tmntId is valid but not a tmnt id", async () => {
      await expect(getAllPotPfsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw an error when tmntId is null", async () => {
      await expect(
        getAllPotPfsForTmnt(null as unknown as string)
      ).rejects.toThrow("Invalid tmnt id");
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("updateAllPotPfsForTmnt()", () => {
    const toSaveFrom = (
      potPfData: potPfType[],
      potIds: string[] = validPotIds,
      tmntId: string = pmTmntId
    ): tmntPotPfSaveDataType => ({ potPfData, potIds, tmntId });

    it("should update many potPfs for a tmnt - change amount", async () => {
      const testPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      testPotPfs[0].amount = 350;
      testPotPfs[1].amount = 250;
      mockPut.mockResolvedValue({ data: { potPfs: testPotPfs.map(apiPotPfFrom) } });

      const updated = await updateAllPotPfsForTmnt(toSaveFrom(testPotPfs));

      expect(updated).toEqual(testPotPfs.map(mappedPotPfFrom));
    });

    it("should update many potPfs for a tmnt - add row", async () => {
      const testPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      testPotPfs.push({
        ...initPotPf,
        id: "ppf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        pot_id: pmPotId,
        position: 3,
        amount: 10,
      });
      mockPut.mockResolvedValue({ data: { potPfs: testPotPfs.map(apiPotPfFrom) } });

      const updated = await updateAllPotPfsForTmnt(toSaveFrom(testPotPfs));

      expect(updated).toHaveLength(3);
      expect(updated).toEqual(testPotPfs.map(mappedPotPfFrom));
    });

    it("should update many potPfs for a tmnt - change amount and delete a row", async () => {
      const testPotPfs = cloneDeep([pmPotPf1]);
      testPotPfs[0].amount = 400;
      mockPut.mockResolvedValue({ data: { potPfs: testPotPfs.map(apiPotPfFrom) } });

      const updated = await updateAllPotPfsForTmnt(toSaveFrom(testPotPfs));

      expect(updated).toEqual(testPotPfs.map(mappedPotPfFrom));
    });

    it("should update many potPfs for a tmnt - sanitize amount", async () => {
      const testPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      testPotPfs[0].amount = 350.351;
      // the route sanitizes the amount before saving
      const apiPotPfs = [
        { ...apiPotPfFrom(testPotPfs[0]), amount: 350.35 },
        apiPotPfFrom(testPotPfs[1]),
      ];
      mockPut.mockResolvedValue({ data: { potPfs: apiPotPfs } });

      const updated = await updateAllPotPfsForTmnt(toSaveFrom(testPotPfs));

      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].amount).toBe(pmPotPf2.amount);
    });

    it("should update many potPfs for a tmnt - empty potPfs", async () => {
      mockPut.mockResolvedValue({ data: { potPfs: [] } });

      const updated = await updateAllPotPfsForTmnt(toSaveFrom([]));

      expect(updated).toEqual([]);
    });

    it("should update many potPfs for a tmnt - two pots", async () => {
      const testTmntId = "tmt_d237a388a8fc4641a2e37233f1d6bebd";
      const testPotId1 = "pot_89fd8f787de942a1a92aaa2df3e7c185";
      const testPotId2 = "pot_aa5268ed78ad4a1599675b6a85d193b3";
      const testPotIds = [testPotId1, testPotId2];
      const toUpdatePotPfs: potPfType[] = [
        { ...initPotPf, id: "ppf_42c133340c174d05ba7098930e2f0f90", pot_id: testPotId1, position: 1, amount: 300 },
        { ...initPotPf, id: "ppf_97594d1f0f7043c48dacec19091d1494", pot_id: testPotId1, position: 2, amount: 200 },
        { ...initPotPf, id: "ppf_87415abe7ca444d898f14568961578bb", pot_id: testPotId2, position: 1, amount: 325 },
        { ...initPotPf, id: "ppf_0d402ea969a448278c68f5fbfdc70cfe", pot_id: testPotId2, position: 2, amount: 225 },
      ];
      mockPut.mockResolvedValue({ data: { potPfs: toUpdatePotPfs.map(apiPotPfFrom) } });

      const updated = await updateAllPotPfsForTmnt(
        toSaveFrom(toUpdatePotPfs, testPotIds, testTmntId)
      );

      expect(updated).toEqual(toUpdatePotPfs.map(mappedPotPfFrom));
      expect(mockPut).toHaveBeenCalledWith(
        tmntUrl + testTmntId,
        JSON.stringify({ potPfData: toUpdatePotPfs, potIds: testPotIds })
      );
    });

    it("should put potPfData and potIds (not tmntId) to the tmnt url with the private api", async () => {
      const testPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      mockPut.mockResolvedValue({ data: { potPfs: testPotPfs.map(apiPotPfFrom) } });

      await updateAllPotPfsForTmnt(toSaveFrom(testPotPfs));

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith(
        tmntUrl + pmTmntId,
        JSON.stringify({ potPfData: testPotPfs, potIds: validPotIds })
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should NOT update many potPfs for a tmnt when tmntId is not found", async () => {
      mockPut.mockRejectedValue(axiosError(409));

      await expect(
        updateAllPotPfsForTmnt(toSaveFrom([pmPotPf1, pmPotPf2], validPotIds, notFoundTmntId))
      ).rejects.toThrow(
        new Error("updateAllPotPfsForTmnt failed: Request failed with status code 409")
      );
    });

    it("should throw when the API call fails", async () => {
      mockPut.mockRejectedValue(axiosError(500));

      await expect(
        updateAllPotPfsForTmnt(toSaveFrom([pmPotPf1, pmPotPf2]))
      ).rejects.toThrow(
        new Error("updateAllPotPfsForTmnt failed: Request failed with status code 500")
      );
    });

    describe("invalid args - throws before calling the API", () => {
      it.each([
        ["tmntId is invalid", { tmntId: "test" }, "Invalid tmnt id"],
        ["tmntId is null", { tmntId: null }, "Invalid tmnt id"],
        ["tmntId is an id, but not a tmnt id", { tmntId: userId }, "Invalid tmnt id"],
        ["potIds is not an array", { potIds: pmPotPf1 }, "Invalid potIds array"],
        ["potIds is null", { potIds: null }, "Invalid potIds array"],
        ["potPfs is not an array", { potPfData: pmPotPf1 }, "Invalid potPfs array"],
        ["potPfs is null", { potPfData: null }, "Invalid potPfs array"],
      ])("should not update when %s", async (_desc, override, expected) => {
        const toSave = {
          ...toSaveFrom(cloneDeep([pmPotPf1, pmPotPf2])),
          ...override,
        } as unknown as tmntPotPfSaveDataType;

        await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow(expected);
        expect(mockPut).not.toHaveBeenCalled();
      });
    });

    // The route validates the data. With mocks, these cases become rejections
    // with the status the route answers, so each checks the error is passed on.
    describe("invalid data - route rejects", () => {
      const withPotPf0 = (changes: Partial<potPfType>): potPfType[] => {
        const potPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        potPfs[0] = { ...potPfs[0], ...changes };
        return potPfs;
      };

      it.each([
        ["potIds has invalid id", toSaveFrom([pmPotPf1, pmPotPf2], ["test"]), 422],
        ["potIds has non string id", toSaveFrom([pmPotPf1, pmPotPf2], [123 as never]), 400],
        ["potIds are ids, but not pot ids", toSaveFrom([pmPotPf1, pmPotPf2], [userId]), 422],
        ["pot_ids in potPfs not in potIds", toSaveFrom([pmPotPf1, pmPotPf2], [notFoundPotId]), 422],
        ["pot_id is valid, but not an pot id", toSaveFrom(withPotPf0({ pot_id: userId })), 422],
        ["pot_id is valid, but not in potIds", toSaveFrom(withPotPf0({ pot_id: notFoundPotId })), 422],
        ["position is too low", toSaveFrom(withPotPf0({ position: 0 })), 422],
        ["position is too high", toSaveFrom(withPotPf0({ position: maxPosition + 1 })), 422],
        ["position is not a number", toSaveFrom(withPotPf0({ position: "test" as never })), 400],
        ["position is not an integer", toSaveFrom(withPotPf0({ position: 1.5 })), 422],
        ["position is out of sequence", toSaveFrom(withPotPf0({ position: 3 })), 422],
        ["position is missing", toSaveFrom(withPotPf0({ position: null as never })), 400],
        ["amount is too low", toSaveFrom(withPotPf0({ amount: 0 })), 422],
        ["amount is too high", toSaveFrom(withPotPf0({ amount: maxMoney + 1 })), 422],
        ["amount is not a number", toSaveFrom(withPotPf0({ amount: "test" as never })), 400],
        ["amount is missing", toSaveFrom(withPotPf0({ amount: null as never })), 400],
        ["amount is not decending", toSaveFrom(withPotPf0({ amount: pmPotPf2.amount! - 1 })), 422],
      ])("should NOT update when %s", async (_desc, toSave, status) => {
        mockPut.mockRejectedValue(axiosError(status));

        await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow(
          new Error(`updateAllPotPfsForTmnt failed: Request failed with status code ${status}`)
        );
        expect(mockPut).toHaveBeenCalledTimes(1);
      });
    });
  });
});
