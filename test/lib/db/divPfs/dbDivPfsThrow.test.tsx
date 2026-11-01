import { privateApi } from "@/lib/api/axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../testApi";
import {
  getAllDivPfsForTmnt,
  updateAllDivPfsForTmnt,
} from "@/lib/db/divPfs/dbDivPfs";
import type { divPfType, tmntDivPfSaveDataType } from "@/lib/types/types";
import { blankDivPf, initDivPf } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  privateApi: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockPrivateGet = privateApi.get as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseDivPfsApi
  ? testBaseDivPfsApi
  : baseDivPfsApi;

const tmntUrl = url + "/tmnt/";

const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const pmDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const pmDivPf1: divPfType = {
  ...initDivPf,
  id: "dpf_ce55c52bd60d4943bb747590a03c9732",
  div_id: pmDivId,
  position: 1,
  amount: 300,
};

const toSave: tmntDivPfSaveDataType = {
  divPfData: [pmDivPf1],
  divIds: [pmDivId],
  tmntId: pmTmntId,
};

const emptyToSave: tmntDivPfSaveDataType = {
  divPfData: [],
  divIds: [pmDivId],
  tmntId: pmTmntId,
};

describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPrivateGet.mockReset();
    mockPrivatePut.mockReset();
  });

  describe("getAllDivPfsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.divPfs is missing", async () => {
      mockPrivateGet.mockResolvedValue({
        data: {},
      });

      await expect(getAllDivPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllDivPfsForTmnt failed: Error fetching divPfs"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
      expect(mockPrivateGet).toHaveBeenCalledWith(tmntUrl + pmTmntId);
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivateGet.mockResolvedValue({
        data: null,
      });

      await expect(getAllDivPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllDivPfsForTmnt failed: Error fetching divPfs"
      );
    });

    it("should throw with custom message if privateApi.get rejects", async () => {
      mockPrivateGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllDivPfsForTmnt failed: Network Error"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.get rejects with non-error", async () => {
      mockPrivateGet.mockRejectedValueOnce("testing 123");

      await expect(getAllDivPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllDivPfsForTmnt failed: testing 123"
      );
    });
  });

  describe("updateAllDivPfsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.divPfs is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllDivPfsForTmnt failed: Error updating divPfs for tmnt"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        tmntUrl + pmTmntId,
        JSON.stringify({ divPfData: toSave.divPfData, divIds: toSave.divIds })
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllDivPfsForTmnt failed: Error updating divPfs for tmnt"
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllDivPfsForTmnt failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllDivPfsForTmnt failed: testing 123"
      );
    });

    it("should throw an error for empty divPfs when response.data.divPfs is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(updateAllDivPfsForTmnt(emptyToSave)).rejects.toThrow(
        "updateAllDivPfsForTmnt failed: Error updating divPfs for tmnt"
      );
    });

    it("should throw an error for empty divPfs when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(updateAllDivPfsForTmnt(emptyToSave)).rejects.toThrow(
        "updateAllDivPfsForTmnt failed: Error updating divPfs for tmnt"
      );
    });

    it("should throw an error when response.data.divPfs is not an array", async () => {
      mockPrivatePut.mockResolvedValue({
        data: { divPfs: "not an array" },
      });

      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllDivPfsForTmnt failed: Error updating divPfs for tmnt"
      );
    });

    it("should map response.data.divPfs like getAllDivPfsForTmnt", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {
          divPfs: [
            { id: pmDivPf1.id, div_id: pmDivId, position: "1", amount: "300" },
          ],
        },
      });

      const updated = await updateAllDivPfsForTmnt(toSave);

      expect(updated).toEqual([
        { ...blankDivPf, id: pmDivPf1.id, div_id: pmDivId, position: 1, amount: 300 },
      ]);
    });
  });
});
