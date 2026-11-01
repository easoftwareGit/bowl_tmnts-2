import { privateApi } from "@/lib/api/axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../testApi";
import {
  getAllPotPfsForTmnt,
  updateAllPotPfsForTmnt,
} from "@/lib/db/potPfs/dbPotPfs";
import type { potPfType, tmntPotPfSaveDataType } from "@/lib/types/types";
import { blankPotPf, initPotPf } from "@/lib/db/initVals";

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
const url = process.env.NODE_ENV === "test" && testBasePotPfsApi
  ? testBasePotPfsApi
  : basePotPfsApi;

const tmntUrl = url + "/tmnt/";

const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const pmPotId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
const pmPotPf1: potPfType = {
  ...initPotPf,
  id: "ppf_59eac0c17bf74348b44041e97469ad76",
  pot_id: pmPotId,
  position: 1,
  amount: 50,
};

const toSave: tmntPotPfSaveDataType = {
  potPfData: [pmPotPf1],
  potIds: [pmPotId],
  tmntId: pmTmntId,
};

const emptyToSave: tmntPotPfSaveDataType = {
  potPfData: [],
  potIds: [pmPotId],
  tmntId: pmTmntId,
};

describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPrivateGet.mockReset();
    mockPrivatePut.mockReset();
  });

  describe("getAllPotPfsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.potPfs is missing", async () => {
      mockPrivateGet.mockResolvedValue({
        data: {},
      });

      await expect(getAllPotPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllPotPfsForTmnt failed: Error fetching potPfs"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
      expect(mockPrivateGet).toHaveBeenCalledWith(tmntUrl + pmTmntId);
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivateGet.mockResolvedValue({
        data: null,
      });

      await expect(getAllPotPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllPotPfsForTmnt failed: Error fetching potPfs"
      );
    });

    it("should throw with custom message if privateApi.get rejects", async () => {
      mockPrivateGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllPotPfsForTmnt failed: Network Error"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.get rejects with non-error", async () => {
      mockPrivateGet.mockRejectedValueOnce("testing 123");

      await expect(getAllPotPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllPotPfsForTmnt failed: testing 123"
      );
    });
  });

  describe("updateAllPotPfsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.potPfs is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllPotPfsForTmnt failed: Error updating potPfs for tmnt"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        tmntUrl + pmTmntId,
        JSON.stringify({ potPfData: toSave.potPfData, potIds: toSave.potIds })
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllPotPfsForTmnt failed: Error updating potPfs for tmnt"
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllPotPfsForTmnt failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllPotPfsForTmnt failed: testing 123"
      );
    });

    it("should throw an error for empty potPfs when response.data.potPfs is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(updateAllPotPfsForTmnt(emptyToSave)).rejects.toThrow(
        "updateAllPotPfsForTmnt failed: Error updating potPfs for tmnt"
      );
    });

    it("should throw an error for empty potPfs when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(updateAllPotPfsForTmnt(emptyToSave)).rejects.toThrow(
        "updateAllPotPfsForTmnt failed: Error updating potPfs for tmnt"
      );
    });

    it("should throw an error when response.data.potPfs is not an array", async () => {
      mockPrivatePut.mockResolvedValue({
        data: { potPfs: "not an array" },
      });

      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllPotPfsForTmnt failed: Error updating potPfs for tmnt"
      );
    });

    it("should map response.data.potPfs like getAllPotPfsForTmnt", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {
          potPfs: [
            { id: pmPotPf1.id, pot_id: pmPotId, position: "1", amount: "50" },
          ],
        },
      });

      const updated = await updateAllPotPfsForTmnt(toSave);

      expect(updated).toEqual([
        { ...blankPotPf, id: pmPotPf1.id, pot_id: pmPotId, position: 1, amount: 50 },
      ]);
    });
  });
});
